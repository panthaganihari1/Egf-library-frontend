import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api';
import toast from 'react-hot-toast';
import { BookOpen, Lock, User } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginApi(form);
      login({ username: res.data.username, fullName: res.data.fullName, role: res.data.role }, res.data.token);
      toast.success(`Welcome, ${res.data.fullName}! 🙏`);
      navigate('/dashboard');
    } catch {
      toast.error('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #2D0060 0%, #0F0A1E 60%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative orbs */}
      <div style={{ position:'absolute', top:'10%', left:'15%', width:300, height:300,
        background:'radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)',
        borderRadius:'50%', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'15%', right:'10%', width:400, height:400,
        background:'radial-gradient(circle, rgba(123,47,190,0.2) 0%, transparent 70%)',
        borderRadius:'50%', pointerEvents:'none' }} />

      <div style={{ width: '100%', maxWidth: 420, padding: 24, zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}></div>
          <h1 style={{ fontSize: 28, fontFamily: 'Cinzel, serif', marginBottom: 6,
            background: 'linear-gradient(135deg, #F5C518, #FF9A3C)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EGF Book Library
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Ammerpet Branch — Incharge Login</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Enter username"
                  value={form.username}
                  onChange={e => setForm({...form, username: e.target.value})}
                  required
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width:'100%', justifyContent:'center', padding:'13px', marginTop: 8, fontSize: 15 }}>
              <BookOpen size={18} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:12, color:'var(--text-muted)' }}>
            Default: admin / egf@2024
          </p>
        </div>

        <p style={{ textAlign:'center', marginTop:24, fontSize:12, color:'var(--text-muted)' }}>
          🙏 Serving the Word of God — Ammerpet EGF
        </p>
      </div>
    </div>
  );
}
