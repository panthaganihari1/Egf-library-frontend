import React, { useEffect, useState } from 'react';
import { getMembers, searchMembers, createMember, updateMember, deleteMember } from '../api';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, X, UserCheck, Phone, Mail, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

const EMPTY = { name: '', phone: '', email: '', address: '', active: true };

// ─── Hook: detect mobile ───────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

// ─── Role check ────────────────────────────────────────────────────────────────
function useIsIncharge() {
  const { user } = useAuth();
  return user?.role?.toLowerCase() === 'incharge';
}

// ─── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 40, fontSize = 16 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--purple), var(--purple-light))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 700, flexShrink: 0, color: '#fff',
    }}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Member Detail Modal ───────────────────────────────────────────────────────
function MemberDetailModal({ member: m, onClose, onEdit, isIncharge }) {
  if (!m) return null;

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
        width: '100%', maxWidth: 460, margin: '0 auto',
        padding: 0, borderRadius: 16
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--purple, #7c3aed) 0%, var(--purple-light, #a78bfa) 100%)',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0
            }}>
              {m.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: 19, fontWeight: 700, marginBottom: 4 }}>{m.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {m.active
                  ? <><CheckCircle size={13} color="#86efac" /><span style={{ color: '#86efac', fontSize: 13, fontWeight: 600 }}>Active Member</span></>
                  : <><XCircle size={13} color="#fca5a5" /><span style={{ color: '#fca5a5', fontSize: 13, fontWeight: 600 }}>Inactive</span></>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{ padding: '4px 20px 8px' }}>
          <DetailRow icon={Phone}    label="Phone"       value={m.phone} valueColor="var(--saffron-light)" />
          <DetailRow icon={Mail}     label="Email"       value={m.email} />
          <DetailRow icon={MapPin}   label="Address"     value={m.address} />
          <DetailRow icon={Calendar} label="Joined Date" value={m.joinedAt?.split('T')[0]} />
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', gap: 10, padding: '12px 20px 20px',
          justifyContent: isIncharge ? 'flex-end' : 'center'
        }}>
          <button className="btn btn-outline" onClick={onClose} style={{ flex: isIncharge ? 'unset' : 1 }}>
            Close
          </button>
          {isIncharge && (
            <button className="btn btn-primary" onClick={() => { onClose(); onEdit(m); }}>
              <Edit2 size={14} /> Edit Member
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Card ───────────────────────────────────────────────────────────────
function MemberCard({ m, onEdit, onDelete, onView, isIncharge }) {
  return (
    <div
      className="card"
      style={{ marginBottom: 12, padding: '14px 16px', cursor: 'pointer' }}
      onClick={() => onView(m)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Avatar name={m.name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{m.name}</div>
              <div style={{ color: 'var(--saffron-light)', fontSize: 13 }}>{m.phone}</div>
            </div>
            <span className={`badge ${m.active ? 'badge-green' : 'badge-red'}`}>{m.active ? 'Active' : 'Inactive'}</span>
          </div>
          {m.email && <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{m.email}</div>}
          {m.address && <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.address}</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Joined: {m.joinedAt?.split('T')[0]}</span>
            {isIncharge && (
              <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                <button className="btn btn-outline" style={{ padding: '5px 9px' }} onClick={() => onEdit(m)}><Edit2 size={13} /></button>
                <button className="btn btn-danger"  style={{ padding: '5px 9px' }} onClick={() => onDelete(m.id)}><Trash2 size={13} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [viewMember, setViewMember] = useState(null);

  const isMobile   = useIsMobile();
  const isIncharge = useIsIncharge();

  const load = () => getMembers().then(r => setMembers(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) { load(); return; }
    const t = setTimeout(() => {
      searchMembers(search).then(r => setMembers(r.data)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (m) => { setEditing(m); setForm({ ...m }); setModal(true); };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateMember(editing.id, form);
        toast.success('Member updated!');
      } else {
        await createMember(form);
        toast.success('Member added!');
      }
      setModal(false); load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error saving member');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    try { await deleteMember(id); toast.success('Member removed'); load(); }
    catch { toast.error('Cannot delete member'); }
  };

  return (
    <div>
      <div className="page-header" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 className="page-title">👥 Members</h2>
          <p className="page-subtitle">{members.length} registered members</p>
        </div>
        {/* Add Member: Incharge only */}
        {isIncharge && (
          <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Member</button>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Mobile: cards — Desktop: table */}
      {isMobile ? (
        <div>
          {members.length === 0
            ? <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No members found</div>
            : members.map((m, i) => (
                <MemberCard
                  key={m.id} m={m} index={i}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onView={setViewMember}
                  isIncharge={isIncharge}
                />
              ))
          }
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: 640 }}>
              <thead><tr>
                <th>#</th><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Joined</th><th>Status</th>
                {isIncharge && <th>Actions</th>}
              </tr></thead>
              <tbody>
                {members.length === 0
                  ? <tr><td colSpan={isIncharge ? 8 : 7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No members found</td></tr>
                  : members.map((m, i) => (
                    <tr key={m.id} style={{ cursor: 'pointer' }} onClick={() => setViewMember(m)}>
                      <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={m.name} size={34} fontSize={14} />
                          <span style={{ fontWeight: 600 }}>{m.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--saffron-light)' }}>{m.phone}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{m.email || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.address || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{m.joinedAt?.split('T')[0]}</td>
                      <td><span className={`badge ${m.active ? 'badge-green' : 'badge-red'}`}>{m.active ? 'Active' : 'Inactive'}</span></td>
                      {isIncharge && (
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => openEdit(m)}><Edit2 size={14} /></button>
                            <button className="btn btn-danger"  style={{ padding: '6px 10px' }} onClick={() => handleDelete(m.id)}><Trash2 size={14} /></button>
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

      {/* ── Member Detail Modal ── */}
      {viewMember && (
        <MemberDetailModal
          member={viewMember}
          onClose={() => setViewMember(null)}
          onEdit={openEdit}
          isIncharge={isIncharge}
        />
      )}

      {/* ── Add / Edit Modal (Incharge only) ── */}
      {modal && isIncharge && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto', width: '100%', maxWidth: 480, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17 }}>{editing ? 'Edit Member' : '👤 Add New Member'}</h3>
              <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => setModal(false)}><X size={16} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group"><label>Full Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Member name" /></div>
              <div className="form-group"><label>Phone *</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" inputMode="tel" /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email address" inputMode="email" /></div>
              <div className="form-group"><label>Status</label>
                <select value={form.active} onChange={e => setForm({ ...form, active: e.target.value === 'true' })}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Address</label><textarea rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address..." style={{ resize: 'vertical' }} /></div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}><UserCheck size={16} />{editing ? 'Update' : 'Add Member'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}