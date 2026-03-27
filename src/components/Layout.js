import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BookOpen, Users, BookMarked, LogOut, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/books',     icon: BookOpen,        label: 'Books' },
  { to: '/members',   icon: Users,           label: 'Members' },
  { to: '/issues',    icon: BookMarked,      label: 'Issue / Return' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 72 : 240,
        background: 'linear-gradient(180deg, #1A1035 0%, #0F0A1E 100%)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 100, overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 16px' : '24px 20px', borderBottom: '1px solid var(--border)' }}>
          {!collapsed && (
            <>
              <div style={{ fontSize: 22, marginBottom: 4 }}></div>
              <h1 style={{ fontSize: 15, fontFamily: 'Cinzel, serif', lineHeight: 1.3,
                background: 'linear-gradient(135deg, #F5C518, #FF9A3C)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                EGF Book Library
              </h1>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Ammerpet EGF</p>
            </>
          )}
          {collapsed && <span style={{ fontSize: 24 }}></span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '12px 22px' : '12px 20px',
              color: isActive ? '#FF9A3C' : 'var(--text-muted)',
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              background: isActive ? 'rgba(255,107,0,0.1)' : 'transparent',
              borderRight: isActive ? '3px solid #FF6B00' : '3px solid transparent',
              transition: 'all 0.2s',
            })}>
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          {!collapsed && (
            <div style={{ marginBottom: 12, padding: '10px 12px', background: 'var(--bg-card2)', borderRadius: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>{user?.fullName}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Incharge</p>
            </div>
          )}
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <LogOut size={16} />
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: collapsed ? 72 : 240, flex: 1, transition: 'margin-left 0.3s' }}>
        {/* Topbar */}
        <div style={{
          padding: '16px 28px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'rgba(26,16,53,0.8)', backdropFilter: 'blur(10px)',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <button onClick={() => setCollapsed(!collapsed)} className="btn btn-outline" style={{ padding: '8px' }}>
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Welcome back, <strong style={{ color: 'var(--saffron-light)' }}>{user?.fullName}</strong> 🙏
          </span>
        </div>
        <div style={{ padding: '28px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
