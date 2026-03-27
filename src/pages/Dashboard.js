import React, { useEffect, useState } from 'react';
import { getStats, getOverdueIssues, getActiveIssues } from '../api';
import { BookOpen, Users, BookMarked, AlertTriangle, CheckCircle, Library } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color, gradient, onClick }) => (
  <div className="card" onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default',
      background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
      border: 'none' }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div>
        <p style={{ fontSize:13, color:'rgba(255,255,255,0.7)', marginBottom:8 }}>{label}</p>
        <p style={{ fontSize:36, fontWeight:700, color:'#fff', fontFamily:'Cinzel,serif' }}>{value}</p>
      </div>
      <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:14, padding:14 }}>
        <Icon size={28} color="#fff" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [overdue, setOverdue] = useState([]);
  const [active, setActive] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getStats().then(r => setStats(r.data)).catch(() => {});
    getOverdueIssues().then(r => setOverdue(r.data)).catch(() => {});
    getActiveIssues().then(r => setActive(r.data.slice(0, 5))).catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title"> Dashboard</h2>
          <p className="page-subtitle">Ammerpet EGF Book Library Overview</p>
        </div>
        <span style={{ fontSize:13, color:'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon={Library}       label="Total Books"     value={stats.totalBooks || 0}     gradient={['#7B2FBE','#A855F7']} onClick={() => navigate('/books')} />
        <StatCard icon={Users}         label="Total Members"   value={stats.totalMembers || 0}   gradient={['#0369A1','#0EA5E9']} onClick={() => navigate('/members')} />
        <StatCard icon={BookMarked}    label="Books Issued"    value={stats.activeIssues || 0}   gradient={['#FF6B00','#FF9A3C']} onClick={() => navigate('/issues')} />
        <StatCard icon={AlertTriangle} label="Overdue Books"   value={stats.overdueBooks || 0}   gradient={['#BE123C','#F43F5E']} />
      </div>

      <div className="grid-2">
        {/* Recent Active Issues */}
        <div className="card">
          <h3 style={{ fontSize:16, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
            <BookMarked size={18} color="var(--saffron)" /> Recent Issued Books
          </h3>
          {active.length === 0
            ? <p style={{ color:'var(--text-muted)', fontSize:14 }}>No active issues</p>
            : <table>
                <thead><tr>
                  <th>Book</th><th>Member</th><th>Due Date</th>
                </tr></thead>
                <tbody>
                  {active.map(i => (
                    <tr key={i.id}>
                      <td style={{ fontWeight:500 }}>{i.book?.title}</td>
                      <td style={{ color:'var(--text-muted)' }}>{i.member?.name}</td>
                      <td>
                        <span className={`badge ${new Date(i.dueDate) < new Date() ? 'badge-red' : 'badge-green'}`}>
                          {i.dueDate}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>

        {/* Overdue Alert */}
        <div className="card">
          <h3 style={{ fontSize:16, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
            <AlertTriangle size={18} color="var(--rose)" /> Overdue Books
          </h3>
          {overdue.length === 0
            ? <div style={{ textAlign:'center', padding:'20px 0' }}>
                <CheckCircle size={40} color="var(--emerald)" style={{ margin:'0 auto 12px' }} />
                <p style={{ color:'var(--text-muted)', fontSize:14 }}>All books returned on time! 🙏</p>
              </div>
            : <table>
                <thead><tr>
                  <th>Book</th><th>Member</th><th>Phone</th><th>Due</th>
                </tr></thead>
                <tbody>
                  {overdue.map(i => (
                    <tr key={i.id}>
                      <td style={{ fontWeight:500 }}>{i.book?.title}</td>
                      <td>{i.member?.name}</td>
                      <td style={{ color:'var(--text-muted)' }}>{i.member?.phone}</td>
                      <td><span className="badge badge-red">{i.dueDate}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </div>
    </div>
  );
}
