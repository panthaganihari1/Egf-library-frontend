import React, { useEffect, useState } from 'react';
import { getAllIssues, getBooks, getMembers, issueBook, returnBook } from '../api';
import toast from 'react-hot-toast';
import { Plus, RotateCcw, BookMarked, X } from 'lucide-react';

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

const isOverdue = (issue) => issue.status === 'ISSUED' && new Date(issue.dueDate) < new Date();

function IssueCard({ issue, onReturn }) {
  const overdue = isOverdue(issue);
  return (
    <div className="card" style={{ marginBottom: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.book?.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{issue.book?.author}</div>
        </div>
        <span className={`badge ${overdue ? 'badge-red' : issue.status === 'ISSUED' ? 'badge-orange' : 'badge-green'}`} style={{ flexShrink: 0 }}>
          {overdue ? 'OVERDUE' : issue.status}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 12, marginBottom: 10 }}>
        <div><span style={{ color: 'var(--text-muted)' }}>Member: </span><strong>{issue.member?.name}</strong></div>
        <div><span style={{ color: 'var(--text-muted)' }}>Phone: </span><span style={{ color: 'var(--saffron-light)' }}>{issue.member?.phone}</span></div>
        <div><span style={{ color: 'var(--text-muted)' }}>Issued: </span>{issue.issueDate}</div>
        <div><span style={{ color: 'var(--text-muted)' }}>Due: </span><span style={{ color: overdue ? 'var(--rose)' : 'inherit' }}>{issue.dueDate}</span></div>
        {issue.returnDate && <div><span style={{ color: 'var(--text-muted)' }}>Returned: </span>{issue.returnDate}</div>}
      </div>
      {issue.status === 'ISSUED' && (
        <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }} onClick={() => onReturn(issue)}>
          <RotateCcw size={14} /> Return Book
        </button>
      )}
    </div>
  );
}

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [issueModal, setIssueModal] = useState(false);
  const [returnModal, setReturnModal] = useState(null);
  const [form, setForm] = useState({ bookId: '', memberId: '', dueDays: 14 });
  const [remarks, setRemarks] = useState('');
  const isMobile = useIsMobile();

  const load = () => getAllIssues().then(r => setIssues(r.data)).catch(() => {});

  useEffect(() => {
    load();
    getBooks().then(r => setBooks(r.data.filter(b => b.availableCopies > 0))).catch(() => {});
    getMembers().then(r => setMembers(r.data.filter(m => m.active))).catch(() => {});
  }, []);

  const handleIssue = async () => {
    if (!form.bookId || !form.memberId) { toast.error('Select book and member'); return; }
    try {
      await issueBook(form);
      toast.success('Book issued successfully! 📖');
      setIssueModal(false);
      setForm({ bookId: '', memberId: '', dueDays: 14 });
      load();
      getBooks().then(r => setBooks(r.data.filter(b => b.availableCopies > 0))).catch(() => {});
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error issuing book');
    }
  };

  const handleReturn = async () => {
    try {
      await returnBook(returnModal.id, { remarks });
      toast.success('Book returned successfully! 🙏');
      setReturnModal(null);
      setRemarks('');
      load();
    } catch {
      toast.error('Error returning book');
    }
  };

  const filtered = issues.filter(i => filter === 'ALL' ? true : i.status === filter);

  const filterCounts = {
    ALL: issues.length,
    ISSUED: issues.filter(i => i.status === 'ISSUED').length,
    RETURNED: issues.filter(i => i.status === 'RETURNED').length,
  };

  return (
    <div>
      <div className="page-header" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 className="page-title">📖 Issue / Return</h2>
          <p className="page-subtitle">{filterCounts.ISSUED} books currently issued</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIssueModal(true)}>
          <Plus size={16} /> Issue Book
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {['ALL', 'ISSUED', 'RETURNED'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={filter === f ? 'btn btn-secondary' : 'btn btn-outline'}
            style={{ fontSize: 12, padding: '7px 12px', flexShrink: 0 }}>
            {f === 'ALL' ? '📋 All' : f === 'ISSUED' ? '📤 Issued' : '✅ Returned'}
            <span style={{ marginLeft: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '1px 6px', fontSize: 11 }}>
              {filterCounts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Mobile: cards, Desktop: table */}
      {isMobile ? (
        <div>
          {filtered.length === 0
            ? <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No records found</div>
            : filtered.map(issue => <IssueCard key={issue.id} issue={issue} onReturn={(i) => { setReturnModal(i); setRemarks(''); }} />)
          }
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: 780 }}>
              <thead><tr>
                <th>#</th><th>Book</th><th>Member</th><th>Phone</th>
                <th>Issue Date</th><th>Due Date</th><th>Return Date</th>
                <th>Issued By</th><th>Status</th><th>Action</th>
              </tr></thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No records found</td></tr>
                  : filtered.map((issue, i) => (
                    <tr key={issue.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{issue.book?.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{issue.book?.author}</div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{issue.member?.name}</td>
                      <td style={{ color: 'var(--saffron-light)', fontSize: 13 }}>{issue.member?.phone}</td>
                      <td style={{ fontSize: 13 }}>{issue.issueDate}</td>
                      <td>
                        <span className={`badge ${isOverdue(issue) ? 'badge-red' : 'badge-orange'}`}>{issue.dueDate}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{issue.returnDate || '—'}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{issue.issuedBy}</td>
                      <td>
                        {isOverdue(issue)
                          ? <span className="badge badge-red">OVERDUE</span>
                          : <span className={`badge ${issue.status === 'ISSUED' ? 'badge-orange' : 'badge-green'}`}>{issue.status}</span>
                        }
                      </td>
                      <td>
                        {issue.status === 'ISSUED' && (
                          <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: 12 }}
                            onClick={() => { setReturnModal(issue); setRemarks(''); }}>
                            <RotateCcw size={13} /> Return
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {issueModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIssueModal(false)}>
          <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto', width: '100%', maxWidth: 460, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17 }}>📤 Issue a Book</h3>
              <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => setIssueModal(false)}><X size={16} /></button>
            </div>
            <div className="form-group">
              <label>Select Book *</label>
              <select value={form.bookId} onChange={e => setForm({ ...form, bookId: e.target.value })}>
                <option value="">-- Choose a book --</option>
                {books.map(b => <option key={b.id} value={b.id}>{b.title} — {b.author} ({b.availableCopies} left)</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Select Member *</label>
              <select value={form.memberId} onChange={e => setForm({ ...form, memberId: e.target.value })}>
                <option value="">-- Choose a member --</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name} — {m.phone}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Due in (days)</label>
              <select value={form.dueDays} onChange={e => setForm({ ...form, dueDays: parseInt(e.target.value) })}>
                {[7, 14, 21, 30].map(d => <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
            {form.bookId && form.memberId && (
              <div style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 13 }}>
                <div><strong>📅 Issue:</strong> {new Date().toLocaleDateString('en-IN')}</div>
                <div style={{ marginTop: 4 }}><strong>⏰ Due:</strong> {new Date(Date.now() + form.dueDays * 86400000).toLocaleDateString('en-IN')}</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setIssueModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleIssue}><BookMarked size={16} /> Issue Book</button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setReturnModal(null)}>
          <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto', width: '100%', maxWidth: 440, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17 }}>✅ Return Book</h3>
              <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => setReturnModal(null)}><X size={16} /></button>
            </div>
            <div style={{ background: 'var(--bg-card2)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>📖 {returnModal.book?.title}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Member: <strong style={{ color: 'var(--text)' }}>{returnModal.member?.name}</strong></p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Issued: {returnModal.issueDate} &nbsp;|&nbsp; Due: {returnModal.dueDate}</p>
              {isOverdue(returnModal) && (
                <p style={{ fontSize: 13, color: 'var(--rose)', marginTop: 6 }}>⚠️ This book is overdue!</p>
              )}
            </div>
            <div className="form-group">
              <label>Remarks (optional)</label>
              <textarea rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Book condition, notes..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setReturnModal(null)}>Cancel</button>
              <button className="btn btn-success" onClick={handleReturn}><RotateCcw size={16} /> Confirm Return</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}