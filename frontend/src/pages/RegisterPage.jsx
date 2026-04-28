import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Heart, Building2, Users } from 'lucide-react';

export default function RegisterPage() {
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') || 'donor');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    orgName: '', orgRegNumber: '', donorType: 'public',
    city: '', state: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const payload = {
        name: form.name, email: form.email, password: form.password,
        role, phone: form.phone,
        location: { city: form.city, state: form.state, country: 'India' },
        ...(role === 'ngo' && { orgName: form.orgName, orgRegNumber: form.orgRegNumber }),
        ...(role === 'donor' && { donorType: form.donorType }),
      };
      const data = await register(payload);
      toast.success(`Account created! Welcome, ${data.user.name}`);
      if (data.user.role === 'ngo') navigate('/ngo/dashboard');
      else navigate('/donor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const input = (label, key, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
        style={inputStyle} required={['name','email','password'].includes(key)}
        onFocus={e => e.target.style.borderColor = '#059669'}
        onBlur={e => e.target.style.borderColor = '#d1d5db'} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: 20, padding: 40, boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#059669,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Heart size={24} color="#fff" fill="#fff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Create Account</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Join TrustAid and make a difference</p>
        </div>

        {/* Role Toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { value: 'ngo', icon: <Building2 size={18} />, label: 'NGO / Organizer' },
            { value: 'donor', icon: <Users size={18} />, label: 'Donor / Supporter' },
          ].map(r => (
            <button key={r.value} type="button" onClick={() => setRole(r.value)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 14px', borderRadius: 10, border: `2px solid ${role === r.value ? '#059669' : '#e5e7eb'}`, background: role === r.value ? '#f0fdf4' : '#fff', color: role === r.value ? '#059669' : '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}>
              {r.icon}{r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1/-1' }}>{input('Full Name *', 'name', 'text', 'Your full name')}</div>
            {input('Email *', 'email', 'email', 'you@example.com')}
            {input('Password *', 'password', 'password', '••••••••')}
            {input('Phone', 'phone', 'tel', '+91 XXXXX XXXXX')}
            {input('City', 'city', 'text', 'Mumbai')}
            {input('State', 'state', 'text', 'Maharashtra')}

            {role === 'ngo' && <>
              <div style={{ gridColumn: '1/-1' }}>{input('Organisation Name *', 'orgName', 'text', 'Your NGO name')}</div>
              {input('Registration Number', 'orgRegNumber', 'text', 'NGO/REG/XXXX')}
            </>}

            {role === 'donor' && (
              <div style={{ gridColumn: '1/-1', marginBottom: 14 }}>
                <label style={labelStyle}>Donor Type</label>
                <select value={form.donorType} onChange={set('donorType')} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="public">General Public</option>
                  <option value="celebrity">Celebrity</option>
                  <option value="politician">Politician</option>
                </select>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: 13, borderRadius: 10, background: loading ? '#6ee7b7' : '#059669', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}>
            {loading ? 'Creating account...' : `Register as ${role === 'ngo' ? 'NGO' : 'Donor'}`}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
          Already have an account? <Link to="/login" style={{ color: '#059669', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 };
const inputStyle = { width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid #d1d5db', fontSize: 13, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', background: '#fff' };