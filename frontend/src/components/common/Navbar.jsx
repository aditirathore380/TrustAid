import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Heart, Menu, X, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const getDashLink = () => {
    if (!user) return null;
    if (user.role === 'ngo') return '/ngo/dashboard';
    if (user.role === 'donor') return '/donor/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  const isLanding = location.pathname === '/';

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: isLanding ? 'rgba(255,255,255,0.95)' : '#fff',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#059669,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={18} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#059669' }}>TrustAid</span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NavLink to="/browse">Browse</NavLink>
          <NavLink to="/impact">Impact</NavLink>
          {user ? (
            <>
              <Link to={getDashLink()} style={btnStyle('outline')}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <button onClick={handleLogout} style={btnStyle('ghost')}>
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={btnStyle('outline')}>Login</Link>
              <Link to="/register" style={btnStyle('primary')}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, children }) {
  return (
    <Link to={to} style={{ textDecoration: 'none', color: '#374151', fontWeight: 500, fontSize: 14, padding: '6px 14px', borderRadius: 8, transition: 'background 0.15s' }}
      onMouseEnter={e => e.target.style.background = '#f3f4f6'}
      onMouseLeave={e => e.target.style.background = 'transparent'}
    >{children}</Link>
  );
}

function btnStyle(type) {
  const base = { display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s' };
  if (type === 'primary') return { ...base, background: '#059669', color: '#fff' };
  if (type === 'outline') return { ...base, background: 'transparent', color: '#059669', border: '1.5px solid #059669' };
  return { ...base, background: 'transparent', color: '#6b7280' };
}