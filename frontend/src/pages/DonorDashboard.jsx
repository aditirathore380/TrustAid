import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { MEDIA_URL } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { Heart, TrendingUp, PlayCircle, Eye, Star } from 'lucide-react';

const STATUS_COLOR = { pending: '#f59e0b', completed: '#059669', refunded: '#ef4444' };
const PROOF_STATUS = { none: null, pending: '⏳ Proof Pending', approved: '✅ Verified', rejected: '❌ Proof Rejected' };

export default function DonorDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [matched, setMatched] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/donations/my'),
      api.get('/matches/for-me').catch(() => ({ data: { data: [] } }))
    ]).then(([dRes, mRes]) => {
      setDonations(dRes.data.data);
      setMatched(mRes.data.data.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  const total = donations.reduce((s, d) => s + (d.amount || 0), 0);
  const verified = donations.filter(d => d.request?.proofStatus === 'approved').length;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', padding: '36px 24px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#064e3b', marginBottom: 4 }}>Donor Dashboard</h1>
          <p style={{ color: '#065f46', fontSize: 15 }}>Welcome back, {user?.name} {user?.donorType !== 'public' && `· ${user?.donorType}`}</p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginTop: 24 }}>
            {[
              { label: 'Total Donated', value: `₹${total.toLocaleString()}`, icon: '💝', color: '#059669' },
              { label: 'Causes Supported', value: donations.length, icon: '🌍', color: '#3b82f6' },
              { label: 'Verified Impact', value: verified, icon: '✅', color: '#8b5cf6' },
              { label: 'Donor Type', value: user?.donorType === 'celebrity' ? '⭐ Celebrity' : user?.donorType === 'politician' ? '🏛 Politician' : '🙋 Public', icon: '👤', color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
        {/* Smart Matches */}
        {matched.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>🎯 Smart Matches for You</h2>
              <button onClick={() => navigate('/browse?view=matched')} style={{ fontSize: 13, color: '#059669', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
              {matched.map(({ request: req, score, reasons }) => req && (
                <div key={req._id} onClick={() => navigate(`/requests/${req._id}`)}
                  style={{ background: '#f9fafb', borderRadius: 12, padding: 14, border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.border = '1px solid #6ee7b7'; e.currentTarget.style.background = '#f0fdf4'; }}
                  onMouseLeave={e => { e.currentTarget.style.border = '1px solid #e5e7eb'; e.currentTarget.style.background = '#f9fafb'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', flex: 1, lineHeight: 1.3 }}>{req.title}</h3>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#ede9fe', color: '#5b21b6', marginLeft: 6, whiteSpace: 'nowrap' }}>{score}% match</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>{req.location?.city}, {req.location?.state}</p>
                  <div style={{ height: 4, borderRadius: 99, background: '#e5e7eb', overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ height: '100%', borderRadius: 99, background: '#34d399', width: `${Math.min(100, Math.round(((req.fundsRaised||0)/(req.fundsRequired||1))*100))}%` }} />
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {reasons.slice(0, 2).map(r => (
                      <span key={r} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: '#d1fae5', color: '#065f46' }}>{r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Donation History */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Your Donation History ({donations.length})</h2>
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
          ) : donations.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💝</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No donations yet</h3>
              <p style={{ color: '#9ca3af', marginBottom: 20 }}>Make your first donation and track the impact</p>
              <button onClick={() => navigate('/browse')} style={{ padding: '12px 24px', borderRadius: 10, background: '#059669', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Browse Requests
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Request','NGO','Amount','Method','Proof Status','Date','Action'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {donations.map(d => (
                    <tr key={d._id} style={{ borderTop: '1px solid #f3f4f6' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', maxWidth: 180 }}>{d.request?.title || 'Deleted request'}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'capitalize' }}>{d.request?.category}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{d.ngo?.orgName || d.ngo?.name}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#059669' }}>₹{d.amount.toLocaleString()}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: '#6b7280', textTransform: 'capitalize' }}>{d.paymentMethod}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {d.request?.proofStatus && PROOF_STATUS[d.request.proofStatus] ? (
                          <span style={{ fontSize: 12, fontWeight: 600, color: d.request.proofStatus === 'approved' ? '#059669' : d.request.proofStatus === 'pending' ? '#d97706' : '#ef4444' }}>
                            {PROOF_STATUS[d.request.proofStatus]}
                          </span>
                        ) : <span style={{ fontSize: 12, color: '#9ca3af' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                        {new Date(d.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button onClick={() => navigate(`/requests/${d.request?._id}`)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, background: '#f3f4f6', color: '#374151', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}