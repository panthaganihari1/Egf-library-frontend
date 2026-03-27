import React, { useEffect, useState } from 'react';
import { getBooks, searchBooks, createBook, updateBook, deleteBook } from '../api';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, BookOpen, X } from 'lucide-react';

const CATEGORIES = ['Bible Study', 'Devotional', 'Theology', 'Prayer', 'Prophecy', 'Christian Living', 'Youth', 'Children', 'Telugu', 'Hindi', 'Other'];
const EMPTY = { title:'', author:'', category:'', publisher:'', isbn:'', totalCopies:1, description:'', language:'Telugu', publishedYear:'' };

export default function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const load = () => getBooks().then(r => setBooks(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) { load(); return; }
    const t = setTimeout(() => {
      searchBooks(search).then(r => setBooks(r.data)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (b) => { setEditing(b); setForm({...b}); setModal(true); };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateBook(editing.id, form);
        toast.success('Book updated!');
      } else {
        await createBook(form);
        toast.success('Book added!');
      }
      setModal(false); load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error saving book');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try { await deleteBook(id); toast.success('Book deleted'); load(); }
    catch { toast.error('Cannot delete book'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">📚 Books</h2>
          <p className="page-subtitle">{books.length} spiritual books in library</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Book
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input placeholder="Search by title, author, category..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead><tr>
            <th>Title</th><th>Author</th><th>Category</th><th>Language</th>
            <th>Copies</th><th>Available</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {books.length === 0
              ? <tr><td colSpan={8} style={{ textAlign:'center', color:'var(--text-muted)', padding:32 }}>No books found</td></tr>
              : books.map(b => (
                <tr key={b.id}>
                  <td><div style={{ fontWeight:600 }}>{b.title}</div></td>
                  <td style={{ color:'var(--text-muted)' }}>{b.author}</td>
                  <td><span className="badge badge-blue">{b.category}</span></td>
                  <td style={{ color:'var(--text-muted)', fontSize:13 }}>{b.language}</td>
                  <td style={{ textAlign:'center' }}>{b.totalCopies}</td>
                  <td style={{ textAlign:'center' }}>
                    <span style={{ color: b.availableCopies > 0 ? 'var(--emerald)' : 'var(--rose)', fontWeight:600 }}>
                      {b.availableCopies}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${b.status === 'AVAILABLE' ? 'badge-green' : b.status === 'ISSUED' ? 'badge-orange' : 'badge-red'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn btn-outline" style={{ padding:'6px 10px' }} onClick={() => openEdit(b)}><Edit2 size={14} /></button>
                      <button className="btn btn-danger" style={{ padding:'6px 10px' }} onClick={() => handleDelete(b.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h3 style={{ fontSize:18 }}>{editing ? 'Edit Book' : '📚 Add New Book'}</h3>
              <button className="btn btn-outline" style={{ padding:'6px 10px' }} onClick={() => setModal(false)}><X size={16} /></button>
            </div>
            <div className="grid-2">
              <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="Book title" /></div>
              <div className="form-group"><label>Author *</label><input value={form.author} onChange={e => setForm({...form, author:e.target.value})} placeholder="Author name" /></div>
              <div className="form-group"><label>Category</label>
                <select value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Language</label>
                <select value={form.language} onChange={e => setForm({...form, language:e.target.value})}>
                  {['Telugu','English','Hindi','Tamil','Kannada','Other'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Publisher</label><input value={form.publisher} onChange={e => setForm({...form, publisher:e.target.value})} placeholder="Publisher" /></div>
              <div className="form-group"><label>ISBN</label><input value={form.isbn} onChange={e => setForm({...form, isbn:e.target.value})} placeholder="ISBN number" /></div>
              <div className="form-group"><label>Total Copies</label><input type="number" min={1} value={form.totalCopies} onChange={e => setForm({...form, totalCopies:parseInt(e.target.value)||1})} /></div>
              <div className="form-group"><label>Published Year</label><input type="number" value={form.publishedYear} onChange={e => setForm({...form, publishedYear:e.target.value})} placeholder="e.g. 2020" /></div>
            </div>
            <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Brief description..." style={{ resize:'vertical' }} /></div>
            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Add Book'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
