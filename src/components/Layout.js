import React, { useState, useEffect } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const closeMobile = () => setMobileOpen(false);

  const sidebarWidth = isMobile ? 260 : collapsed ? 72 : 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={closeMobile}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 200, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: isMobile ? 260 : sidebarWidth,
        background: 'linear-gradient(180deg, #1A1035 0%, #0F0A1E 100%)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.3s ease',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 201,
        transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        overflow: 'hidden',
        boxShadow: isMobile && mobileOpen ? '4px 0 24px rgba(0,0,0,0.4)' : 'none',
      }}>
        {/* Logo */}
        <div style={{ padding: (!isMobile && collapsed) ? '20px 16px' : '24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {(!isMobile && collapsed) ? (
            <span style={{ fontSize: 24 }}>✝</span>
          ) : (
            <div>
              <div style={{ fontSize: 22, marginBottom: 4 }}>✝</div>
              <h1 style={{ fontSize: 15, fontFamily: 'Cinzel, serif', lineHeight: 1.3,
                background: 'linear-gradient(135deg, #F5C518, #FF9A3C)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                EGF Book Library
              </h1>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Ammerpet EGF</p>
            </div>
          )}
          {isMobile && (
            <button onClick={closeMobile} className="btn btn-outline" style={{ padding: '6px', flexShrink: 0 }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={isMobile ? closeMobile : undefined}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: (!isMobile && collapsed) ? '12px 22px' : '12px 20px',
                color: isActive ? '#FF9A3C' : 'var(--text-muted)',
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                background: isActive ? 'rgba(255,107,0,0.1)' : 'transparent',
                borderRight: isActive ? '3px solid #FF6B00' : '3px solid transparent',
                transition: 'all 0.2s',
              })}>
              <Icon size={20} style={{ flexShrink: 0 }} />
              {(!isMobile && collapsed) ? null : label}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          {(isMobile || !collapsed) && (
            <div style={{ marginBottom: 12, padding: '10px 12px', background: 'var(--bg-card2)', borderRadius: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>{user?.fullName}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Incharge</p>
            </div>
          )}
          <button onClick={handleLogout} className="btn btn-outline"
            style={{ width: '100%', justifyContent: (!isMobile && collapsed) ? 'center' : 'flex-start' }}>
            <LogOut size={16} />
            {(!isMobile && collapsed) ? null : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: isMobile ? 0 : sidebarWidth,
        flex: 1,
        transition: 'margin-left 0.3s ease',
        minWidth: 0,
      }}>
        {/* Topbar */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(26,16,53,0.8)', backdropFilter: 'blur(10px)',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <button
            onClick={isMobile ? () => setMobileOpen(true) : () => setCollapsed(!collapsed)}
            className="btn btn-outline" style={{ padding: '8px', flexShrink: 0 }}>
            <Menu size={18} />
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Welcome, <strong style={{ color: 'var(--saffron-light)' }}>{user?.fullName}</strong> 🙏
          </span>
        </div>

        {/* Page content */}
        <div style={{ padding: isMobile ? '16px' : '28px' }}>
          <Outlet />
        </div>

        {/* Mobile bottom nav */}
        {isMobile && (
          <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(180deg, #1A1035 0%, #0F0A1E 100%)',
            borderTop: '1px solid var(--border)',
            display: 'flex', zIndex: 100,
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}>
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                style={({ isActive }) => ({
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '8px 4px', textDecoration: 'none',
                  color: isActive ? '#FF9A3C' : 'var(--text-muted)',
                  fontSize: 10, gap: 3, fontWeight: 500,
                  borderTop: isActive ? '2px solid #FF6B00' : '2px solid transparent',
                  transition: 'all 0.2s',
                })}>
                <Icon size={20} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', textAlign: 'center' }}>
                  {label === 'Issue / Return' ? 'Issues' : label}
                </span>
              </NavLink>
            ))}
          </nav>
        )}

        {/* Bottom nav spacer */}
        {isMobile && <div style={{ height: 64 }} />}
      </main>
    </div>
  );
}