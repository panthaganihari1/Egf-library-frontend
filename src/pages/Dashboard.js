import React, { useEffect, useState } from 'react';
import { getStats, getOverdueIssues, getActiveIssues } from '../api';
import { BookOpen, Users, BookMarked, AlertTriangle, CheckCircle, Library } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, gradient, onClick }) => (
  <div
    className="card"
    onClick={onClick}
    style={{
      cursor: onClick ? 'pointer' : 'default',
      background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
      border: 'none',
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; } }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>{label}</p>
        <p style={{ fontSize: 'clamp(28px, 6vw, 36px)', fontWeight: 700, color: '#fff', fontFamily: 'Cinzel,serif', lineHeight: 1 }}>{value}</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 12, flexShrink: 0 }}>
        <Icon size={24} color="#fff" />
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
      <div className="page-header" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Ammerpet EGF Book Library Overview</p>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stats Grid — 2 cols on mobile, 4 on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 14,
        marginBottom: 24,
      }}>
        <StatCard icon={Library}       label="Total Books"   value={stats.totalBooks || 0}   gradient={['#7B2FBE', '#A855F7']} onClick={() => navigate('/books')} />
        <StatCard icon={Users}         label="Total Members" value={stats.totalMembers || 0} gradient={['#0369A1', '#0EA5E9']} onClick={() => navigate('/members')} />
        <StatCard icon={BookMarked}    label="Books Issued"  value={stats.activeIssues || 0} gradient={['#FF6B00', '#FF9A3C']} onClick={() => navigate('/issues')} />
        <StatCard icon={AlertTriangle} label="Overdue Books" value={stats.overdueBooks || 0} gradient={['#BE123C', '#F43F5E']} />
      </div>

      {/* Two column panels — stack on mobile */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
      }}>
        {/* Recent Active Issues */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <h3 style={{ fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookMarked size={17} color="var(--saffron)" /> Recent Issued Books
          </h3>
          {active.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No active issues</p>
            : (
              <div style={{ overflowX: 'auto', margin: '0 -16px', padding: '0 16px' }}>
                <table style={{ minWidth: 280 }}>
                  <thead>
                    <tr>
                      <th>Book</th><th>Member</th><th>Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.map(i => (
                      <tr key={i.id}>
                        <td style={{ fontWeight: 500, fontSize: 13, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.book?.title}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{i.member?.name}</td>
                        <td>
                          <span className={`badge ${new Date(i.dueDate) < new Date() ? 'badge-red' : 'badge-green'}`} style={{ fontSize: 11 }}>
                            {i.dueDate}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>

        {/* Overdue Alert */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <h3 style={{ fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={17} color="var(--rose)" /> Overdue Books
          </h3>
          {overdue.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle size={36} color="var(--emerald)" style={{ margin: '0 auto 10px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>All books returned on time! 🙏</p>
              </div>
            )
            : (
              <div style={{ overflowX: 'auto', margin: '0 -16px', padding: '0 16px' }}>
                <table style={{ minWidth: 300 }}>
                  <thead>
                    <tr>
                      <th>Book</th><th>Member</th><th>Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdue.map(i => (
                      <tr key={i.id}>
                        <td style={{ fontWeight: 500, fontSize: 13, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.book?.title}</td>
                        <td style={{ fontSize: 13 }}>{i.member?.name}</td>
                        <td><span className="badge badge-red" style={{ fontSize: 11 }}>{i.dueDate}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}