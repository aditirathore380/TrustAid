import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, ShieldCheck, TrendingUp, Heart, PlayCircle, Star, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../utils/api';

const URGENCY_COLOR = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' };
const CATEGORY_EMOJI = { food: '🍱', medical: '🏥', education: '📚', shelter: '🏠', water: '💧', disaster: '🆘', environment: '🌿', other: '📦' };

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, requests: 0, donations: 0, totalRaised: 0 });
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    api.get('/donations/stats').then(r => setStats(s => ({ ...s, ...r.data.data }))).catch(() => {});
    api.get('/requests/completed').then(r => setCompleted(r.data.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 40%, #a7f3d0 100%)',
        padding: '80px 24px 60px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 99, padding: '6px 16px', marginBottom: 20, fontSize: 13, color: '#065f46', fontWeight: 600 }}>
            <ShieldCheck size={14} /> Verified · Transparent · Trusted
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 800, color: '#064e3b', lineHeight: 1.15, marginBottom: 20 }}>
            Community Aid,<br />
            <span style={{ color: '#059669' }}>Built on Trust</span>
          </h1>
          <p style={{ fontSize: 18, color: '#374151', lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
            We connect NGOs with donors and volunteers — with full proof of impact. Every rupee tracked, every task verified.
          </p>

          {/* ── Two Main CTA Buttons ─────────────────────────── */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <button
              onClick={() => navigate('/register?role=ngo')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#059669', color: '#fff',
                padding: '18px 32px', borderRadius: 14, border: 'none',
                fontSize: 17, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(5,150,105,0.35)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(5,150,105,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(5,150,105,0.35)'; }}
            >
              <Building2 size={22} />
              <div style={{ textAlign: 'left' }}>
                <div>NGO / Organizer</div>
                <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.85 }}>Post requests & upload proofs</div>
              </div>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate('/register?role=donor')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#fff', color: '#059669',
                padding: '18px 32px', borderRadius: 14,
                border: '2px solid #059669',
                fontSize: 17, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#f0fdf4'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = '#fff'; }}
            >
              <Heart size={22} />
              <div style={{ textAlign: 'left' }}>
                <div>Donor / Supporter</div>
                <div style={{ fontSize: 12, fontWeight: 400, color: '#374151' }}>Donate & track your impact</div>
              </div>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Browse link */}
          <button onClick={() => navigate('/browse')} style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 600, fontSize: 15, cursor: 'pointer', textDecoration: 'underline' }}>
            Browse open requests without signing up →
          </button>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section style={{ background: '#059669', padding: '40px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 0 }}>
          {[
            { label: 'NGOs & Donors', value: '500+', icon: '👥' },
            { label: 'Requests Posted', value: '1,200+', icon: '📋' },
            { label: 'Donations Made', value: stats.donations || '800+', icon: '💝' },
            { label: 'Funds Raised', value: `₹${((stats.totalRaised || 0) / 100000).toFixed(1)}L`, icon: '💰' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '16px 24px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginTop: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#a7f3d0', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section style={{ padding: '64px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 8, color: '#111827' }}>How TrustAid Works</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 48, fontSize: 16 }}>3 steps from request to verified impact</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {[
            { step: '01', icon: '📝', title: 'NGO Posts Request', desc: 'NGO submits a detailed request with location, urgency, and required funds. Before-state photos uploaded.' },
            { step: '02', icon: '💝', title: 'Donors Contribute', desc: 'Donors browse, filter by urgency/location, and donate. Smart matching shows most relevant causes.' },
            { step: '03', icon: '✅', title: 'Proof Verified', desc: 'NGO uploads video + photo proof. Admin reviews and grants Verified badge. Donors see real impact.' },
          ].map(s => (
            <div key={s.step} style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 36 }}>{s.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '2px 10px', borderRadius: 99 }}>Step {s.step}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#111827' }}>{s.title}</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.6, fontSize: 14 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Completed Projects Showcase ───────────────────────── */}
      {completed.length > 0 && (
        <section style={{ padding: '48px 24px', background: '#f0fdf4' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, color: '#064e3b' }}>✅ Verified Impact</h2>
            <p style={{ color: '#065f46', marginBottom: 32, fontSize: 15 }}>Real projects, real proof</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {completed.map(req => (
                <div key={req._id} onClick={() => navigate(`/requests/${req._id}`)} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #d1fae5', cursor: 'pointer', transition: 'transform 0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  {req.proof?.images?.[0] && (
                    <img src={`${process.env.REACT_APP_MEDIA_URL}${req.proof.images[0].path}`} alt="proof" style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span style={{ background: '#059669', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>✓ VERIFIED</span>
                      <span style={{ fontSize: 20 }}>{CATEGORY_EMOJI[req.category]}</span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#111827' }}>{req.title}</h3>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>{req.ngo?.orgName || req.ngo?.name} · {req.location?.city}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ background: '#064e3b', color: '#a7f3d0', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
          <Heart size={18} fill="#34d399" color="#34d399" />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>TrustAid</span>
        </div>
        <p style={{ fontSize: 13, marginBottom: 16 }}>Transparent community aid — powered by proof</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13 }}>
          {['Browse Requests', 'Register NGO', 'Become a Donor', 'Impact Reports'].map(l => (
            <span key={l} style={{ cursor: 'pointer', opacity: 0.8 }}>{l}</span>
          ))}
        </div>
        <p style={{ marginTop: 24, fontSize: 12, opacity: 0.5 }}>© 2024 TrustAid · Hackathon Edition</p>
      </footer>
    </div>
  );
}