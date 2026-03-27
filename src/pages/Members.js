import React, { useEffect, useState } from 'react';
import { getMembers, searchMembers, createMember, updateMember, deleteMember } from '../api';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, X, UserCheck } from 'lucide-react';

const EMPTY = { name:'', phone:'', email:'', address:'', active:true };

export default function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = () => getMembers().then(r => setMembers(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) { load(); return; }
    const t = setTimeout(() => {
      searchMembers(search).then(r => setMembers(r.data)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (m) => { setEditing(m); setForm({...m}); setModal(true); };

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
      <div className="page-header">
        <div>
          <h2 className="page-title">👥 Members</h2>
          <p className="page-subtitle">{members.length} registered members</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Member</button>
      </div>

      <div style={{ marginBottom:20 }}>
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table>
          <thead><tr>
            <th>#</th><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Joined</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {members.length === 0
              ? <tr><td colSpan={8} style={{ textAlign:'center', color:'var(--text-muted)', padding:32 }}>No members found</td></tr>
              : members.map((m, i) => (
                <tr key={m.id}>
                  <td style={{ color:'var(--text-muted)' }}>{i+1}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg, var(--purple), var(--purple-light))',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, flexShrink:0 }}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight:600 }}>{m.name}</span>
                    </div>
                  </td>
                  <td style={{ color:'var(--saffron-light)' }}>{m.phone}</td>
                  <td style={{ color:'var(--text-muted)', fontSize:13 }}>{m.email || '—'}</td>
                  <td style={{ color:'var(--text-muted)', fontSize:13, maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.address || '—'}</td>
                  <td style={{ color:'var(--text-muted)', fontSize:13 }}>{m.joinedAt?.split('T')[0]}</td>
                  <td><span className={`badge ${m.active ? 'badge-green' : 'badge-red'}`}>{m.active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn btn-outline" style={{ padding:'6px 10px' }} onClick={() => openEdit(m)}><Edit2 size={14} /></button>
                      <button className="btn btn-danger" style={{ padding:'6px 10px' }} onClick={() => handleDelete(m.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h3 style={{ fontSize:18 }}>{editing ? 'Edit Member' : '👤 Add New Member'}</h3>
              <button className="btn btn-outline" style={{ padding:'6px 10px' }} onClick={() => setModal(false)}><X size={16} /></button>
            </div>
            <div className="grid-2">
              <div className="form-group"><label>Full Name *</label><input value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Member name" /></div>
              <div className="form-group"><label>Phone *</label><input value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} placeholder="Phone number" /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="Email address" /></div>
              <div className="form-group"><label>Status</label>
                <select value={form.active} onChange={e => setForm({...form, active: e.target.value === 'true'})}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Address</label><textarea rows={2} value={form.address} onChange={e => setForm({...form, address:e.target.value})} placeholder="Full address..." style={{ resize:'vertical' }} /></div>
            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}><UserCheck size={16} />{editing ? 'Update' : 'Add Member'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
