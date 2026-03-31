import React, { useEffect, useState } from 'react';
import { getBooks, searchBooks, createBook, updateBook, deleteBook } from '../api';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, X, BookOpen, Globe, Hash, Building2, Calendar, FileText, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Bible Study', 'Devotional', 'Theology', 'Prayer', 'Prophecy', 'Christian Living', 'Youth', 'Children', 'Telugu', 'Hindi', 'Other'];
const EMPTY = {
  title: '', author: '', category: '', publisher: '', isbn: '',
  totalCopies: 1, description: '', language: 'Telugu',
  publishedYear: '',
  file: null
};

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

function useIsIncharge() {
  const { user } = useAuth();
  return user?.role?.toLowerCase() === 'incharge';
}

// ─── Share Helper ─────────────────────────────────────────────────────────────
function buildShareText(book) {
  const available = book.availableCopies ?? 0;
  const total     = book.totalCopies    ?? 0;
  const issued    = total - available;
  const lines = [
    `📖 *${book.title}*`,
    `✍️ Author: ${book.author}`,
    book.category    ? `🏷️ Category: ${book.category}`   : null,
    book.language    ? `🌐 Language: ${book.language}`   : null,
    book.publisher   ? `🏢 Publisher: ${book.publisher}` : null,
    book.isbn        ? `🔢 ISBN: ${book.isbn}`           : null,
    `📦 Copies: ${total} total | ${available} available | ${issued} issued`,
    book.description ? `\n📝 ${book.description}`        : null,
    `\n— EGF Book Library, Ameerpet`,
  ];
  return lines.filter(Boolean).join('\n');
}

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && window.innerWidth < 1024);
}

async function shareBook(book) {
  const text = buildShareText(book);
  if (isMobileDevice() && navigator.share) {
    try {
      await navigator.share({ title: book.title, text });
      return 'shared';
    } catch (err) {
      if (err.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'error';
  }
}
// ──────────────────────────────────────────────────────────────────────────────

function BookDetailModal({ book, onClose, onEdit, isIncharge }) {
  if (!book) return null;
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    const result = await shareBook(book);
    setSharing(false);
    if (result === 'copied')    toast.success('📋 Book details copied to clipboard!');
    else if (result === 'shared') toast.success('📤 Shared successfully!');
    else if (result === 'error')  toast.error('Could not copy. Please try again.');
  };

  const statusColor =
    book.status === 'AVAILABLE' ? 'var(--emerald)' :
    book.status === 'ISSUED'    ? 'var(--orange, #f97316)' :
                                  'var(--rose)';

  const DetailRow = ({ icon: Icon, label, value, valueColor }) =>
    value ? (
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Icon size={15} color="var(--text-muted)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: valueColor || 'var(--text)', wordBreak: 'break-word' }}>{value}</div>
        </div>
      </div>
    ) : null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{
        maxHeight: '92vh', overflowY: 'auto',
        width: '100%', maxWidth: 500, margin: '0 auto',
        padding: 0, borderRadius: 16
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary, #4f46e5) 0%, var(--primary-dark, #3730a3) 100%)',
          padding: '24px 20px 20px',
          borderRadius: '16px 16px 0 0',
          position: 'relative'
        }}>
          <button
            className="btn btn-outline"
            style={{
              position: 'absolute', top: 14, right: 14,
              padding: '6px 10px', background: 'rgba(255,255,255,0.15)',
              border: 'none', color: '#fff'
            }}
            onClick={onClose}
          >
            <X size={16} />
          </button>

          {/* 🔥 Cover image in modal header */}
          <div style={{
            width: 64, height: 86, borderRadius: 8, overflow: 'hidden',
            marginBottom: 12, border: '2px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={book.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <BookOpen size={26} color="#fff" />
            )}
          </div>

          <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 4, paddingRight: 40 }}>
            {book.title}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: 0 }}>{book.author}</p>

          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)', color: '#fff',
              padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600
            }}>
              {book.category}
            </span>
            <span style={{
              background: statusColor, color: '#fff',
              padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600
            }}>
              {book.status}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          background: 'var(--surface)', borderBottom: '1px solid var(--border)'
        }}>
          {[
            { label: 'Total Copies', value: book.totalCopies, color: 'var(--text)' },
            { label: 'Available',    value: book.availableCopies, color: book.availableCopies > 0 ? 'var(--emerald)' : 'var(--rose)' },
            { label: 'Issued',       value: (book.totalCopies || 0) - (book.availableCopies || 0), color: 'var(--orange, #f97316)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center', padding: '14px 8px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color }}>{value ?? '—'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Details */}
        <div style={{ padding: '4px 20px 8px' }}>
          <DetailRow icon={Globe}     label="Language"       value={book.language} />
          <DetailRow icon={Building2} label="Publisher"      value={book.publisher} />
          <DetailRow icon={Hash}      label="ISBN"           value={book.isbn} />
          <DetailRow icon={Calendar}  label="Published Year" value={book.publishedYear?.toString()} />
          <DetailRow icon={FileText}  label="Description"    value={book.description} />
        </div>

        {/* Footer actions */}
        <div style={{
          display: 'flex', gap: 10, padding: '12px 20px 20px',
          justifyContent: 'flex-end', flexWrap: 'wrap',
        }}>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          <button
            className="btn btn-outline"
            onClick={handleShare}
            disabled={sharing}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Share2 size={14} />
            {sharing ? 'Sharing…' : 'Share'}
          </button>
          {isIncharge && (
            <button className="btn btn-primary" onClick={() => { onClose(); onEdit(book); }}>
              <Edit2 size={14} /> Edit Book
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 🔥 BookCard with cover image
function BookCard({ b, onEdit, onDelete, onView, isIncharge }) {
  return (
    <div
      className="card"
      style={{ marginBottom: 12, padding: '14px 16px', cursor: 'pointer' }}
      onClick={() => onView(b)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>

        {/* Cover Image */}
        <div style={{
          width: 52, height: 70, borderRadius: 6, overflow: 'hidden',
          flexShrink: 0, background: 'var(--surface)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {b.coverImageUrl ? (
            <img
              src={b.coverImageUrl}
              alt={b.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <BookOpen size={22} color="var(--text-muted)" />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>{b.author}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span className="badge badge-blue">{b.category}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.language}</span>
            <span className={`badge ${b.status === 'AVAILABLE' ? 'badge-green' : b.status === 'ISSUED' ? 'badge-orange' : 'badge-red'}`}>{b.status}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>
            <div>Total: <strong style={{ color: 'var(--text)' }}>{b.totalCopies}</strong></div>
            <div>Avail: <strong style={{ color: b.availableCopies > 0 ? 'var(--emerald)' : 'var(--rose)' }}>{b.availableCopies}</strong></div>
          </div>
          {isIncharge && (
            <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
              <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => onEdit(b)}><Edit2 size={14} /></button>
              <button className="btn btn-danger"  style={{ padding: '6px 10px' }} onClick={() => onDelete(b.id)}><Trash2 size={14} /></button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function Books() {
  const { user } = useAuth();

  const [books, setBooks]       = useState([]);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [viewBook, setViewBook] = useState(null);

  const isMobile   = useIsMobile();
  const isIncharge = useIsIncharge();

  const load = () => getBooks().then(r => setBooks(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) { load(); return; }
    const t = setTimeout(() => {
      searchBooks(search).then(r => setBooks(r.data)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (b) => { setEditing(b); setForm({ ...b }); setModal(true); };

  const handleSave = async () => {
    try {
      const { file, ...bookData } = form;
      if (editing) {
        await updateBook(editing.id, bookData, file);
        toast.success('Book updated!');
      } else {
        await createBook(bookData, file);
        toast.success('Book added!');
      }
      setModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data || 'Error saving book');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try { await deleteBook(id); toast.success('Book deleted'); load(); }
    catch { toast.error('Cannot delete book'); }
  };

  return (
    <div>
      <div className="page-header" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 className="page-title">📚 Books</h2>
          <p className="page-subtitle">{books.length} spiritual books in library</p>
        </div>
        {isIncharge && (
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Book
          </button>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            placeholder="Search by title, author, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Mobile List ── */}
      {isMobile ? (
        <div>
          {books.length === 0
            ? <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No books found</div>
            : books.map(b => (
                <BookCard
                  key={b.id} b={b}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onView={setViewBook}
                  isIncharge={isIncharge}
                />
              ))
          }
        </div>
      ) : (
        /* ── Desktop Table ── */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: 750 }}>
              <thead><tr>
                <th>Cover</th>
                <th>Title</th><th>Author</th><th>Category</th><th>Language</th>
                <th>Copies</th><th>Available</th><th>Status</th>
                {isIncharge && <th>Actions</th>}
              </tr></thead>
              <tbody>
                {books.length === 0
                  ? <tr><td colSpan={isIncharge ? 9 : 8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No books found</td></tr>
                  : books.map(b => (
                    <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => setViewBook(b)}>

                      {/* 🔥 Cover image in table */}
                      <td>
                        <div style={{
                          width: 36, height: 48, borderRadius: 4, overflow: 'hidden',
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {b.coverImageUrl ? (
                            <img src={b.coverImageUrl} alt={b.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <BookOpen size={14} color="var(--text-muted)" />
                          )}
                        </div>
                      </td>

                      <td><div style={{ fontWeight: 600 }}>{b.title}</div></td>
                      <td style={{ color: 'var(--text-muted)' }}>{b.author}</td>
                      <td><span className="badge badge-blue">{b.category}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{b.language}</td>
                      <td style={{ textAlign: 'center' }}>{b.totalCopies}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: b.availableCopies > 0 ? 'var(--emerald)' : 'var(--rose)', fontWeight: 600 }}>
                          {b.availableCopies}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${b.status === 'AVAILABLE' ? 'badge-green' : b.status === 'ISSUED' ? 'badge-orange' : 'badge-red'}`}>
                          {b.status}
                        </span>
                      </td>
                      {isIncharge && (
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => openEdit(b)}><Edit2 size={14} /></button>
                            <button className="btn btn-danger"  style={{ padding: '6px 10px' }} onClick={() => handleDelete(b.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Book Detail Modal ── */}
      {viewBook && (
        <BookDetailModal
          book={viewBook}
          onClose={() => setViewBook(null)}
          onEdit={openEdit}
          isIncharge={isIncharge}
        />
      )}

      {/* ── Add / Edit Modal ── */}
      {modal && isIncharge && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto', width: '100%', maxWidth: 560, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17 }}>{editing ? 'Edit Book' : '📚 Add New Book'}</h3>
              <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => setModal(false)}><X size={16} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Book title" /></div>
              <div className="form-group"><label>Author *</label><input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="Author name" /></div>
              <div className="form-group"><label>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Language</label>
                <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
                  {['Telugu', 'English', 'Hindi', 'Tamil', 'Kannada', 'Other'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Publisher</label><input value={form.publisher} onChange={e => setForm({ ...form, publisher: e.target.value })} placeholder="Publisher" /></div>
              <div className="form-group"><label>ISBN</label><input value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} placeholder="ISBN number" /></div>
              <div className="form-group"><label>Total Copies</label><input type="number" min={1} value={form.totalCopies} onChange={e => setForm({ ...form, totalCopies: parseInt(e.target.value) || 1 })} /></div>
              <div className="form-group"><label>Published Year</label><input type="number" value={form.publishedYear} onChange={e => setForm({ ...form, publishedYear: e.target.value })} placeholder="e.g. 2020" /></div>

              {/* 🔥 Cover image upload + preview */}
              <div className="form-group" style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                <label>Book Cover Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 52, height: 70, borderRadius: 6, overflow: 'hidden',
                    border: '1px solid var(--border)', background: 'var(--surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {form.file ? (
                      <img
                        src={URL.createObjectURL(form.file)}
                        alt="preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : form.coverImageUrl ? (
                      <img
                        src={form.coverImageUrl}
                        alt="cover"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <BookOpen size={20} color="var(--text-muted)" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setForm({ ...form, file: e.target.files[0] })}
                  />
                </div>
              </div>
            </div>

            <div className="form-group"><label>Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Add Book'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}