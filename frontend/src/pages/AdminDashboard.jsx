import React, { useState, useEffect } from 'react';
import api, { MEDIA_URL } from '../utils/api';
import toast from 'react-hot-toast';
import { ShieldCheck, Users, FileText, CheckCircle, Clock, PlayCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [pendingProofs, setPendingProofs] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('proofs');
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState({});
  const [playingVideo, setPlayingVideo] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, pRes, uRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/proofs/pending'),
        api.get('/admin/users')
      ]);
      setStats(sRes.data.data);
      setPendingProofs(pRes.data.data);
      setUsers(uRes.data.data);
    } catch (err) { toast.error('Failed to load admin data'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleProofReview = async (proofId, status) => {
    try {
      await api.patch(`/proofs/${proofId}/review`, { status, adminNote: adminNote[proofId] || '' });
      toast.success(`Proof ${status === 'approved' ? '✅ Approved' : '❌ Rejected'}`);
      fetchData();
    } catch { toast.error('Review failed'); }
  };

  const handleVerifyNGO = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/verify`);
      toast.success('NGO verified!');
      fetchData();
    } catch { toast.error('Verification failed'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', padding: '36px 24px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <ShieldCheck size={28} color="#a5b4fc" />
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>Admin Dashboard</h1>
          </div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
            {[
              { label: 'Total Users', value: stats.users || 0, icon: '👥', color: '#a5b4fc' },
              { label: 'Requests', value: stats.requests || 0, icon: '📋', color: '#67e8f9' },
              { label: 'Donations', value: stats.donations || 0, icon: '💝', color: '#6ee7b7' },
              { label: 'Completed', value: stats.completedRequests || 0, icon: '✅', color: '#86efac' },
              { label: 'Proofs Pending', value: stats.proofsPending || 0, icon: '⏳', color: '#fcd34d' },
              { label: 'Total Raised', value: `₹${((stats.totalRaised || 0) / 1000).toFixed(0)}K`, icon: '💰', color: '#f9a8d4' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#c7d2fe' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 4, marginBottom: 24, width: 'fit-content', gap: 4 }}>
          {[['proofs','⏳ Pending Proofs',pendingProofs.length],['users','👥 Users',users.length]].map(([t, label, count]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: tab === t ? '#fff' : 'transparent', fontWeight: tab === t ? 700 : 500, fontSize: 14, cursor: 'pointer', color: tab === t ? '#111827' : '#6b7280', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              {label}
              {count > 0 && <span style={{ background: tab === t ? '#059669' : '#e5e7eb', color: tab === t ? '#fff' : '#374151', borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{count}</span>}
            </button>
          ))}
        </div>

        {/* ── Pending Proofs Tab ── */}
        {tab === 'proofs' && (
          <div>
            {pendingProofs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80, background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No pending proofs!</h3>
                <p style={{ color: '#9ca3af' }}>All proofs have been reviewed</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {pendingProofs.map(proof => (
                  <div key={proof._id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ padding: 20 }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Clock size={16} color="#d97706" />
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{proof.title}</h3>
                          </div>
                          <p style={{ fontSize: 13, color: '#6b7280' }}>
                            NGO: <strong>{proof.ngo?.orgName || proof.ngo?.name}</strong> · Score: {proof.ngo?.credibilityScore}/100
                          </p>
                          {proof.request && <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Request: <strong>{proof.request.title}</strong> · {proof.request.location?.city}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          {proof.beneficiariesServed > 0 && <span style={statBadge}>{proof.beneficiariesServed} served</span>}
                          {proof.fundsUtilised > 0 && <span style={statBadge}>₹{proof.fundsUtilised.toLocaleString()} used</span>}
                        </div>
                      </div>

                      <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, marginBottom: 16, background: '#f9fafb', padding: 12, borderRadius: 8 }}>{proof.description}</p>

                      {/* Videos */}
                      {proof.videos?.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#374151' }}>📹 Video Evidence ({proof.videos.length})</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
                            {proof.videos.map((v, i) => (
                              <div key={i} style={{ borderRadius: 10, overflow: 'hidden', background: '#000', aspectRatio: '16/9' }}>
                                {playingVideo === `${proof._id}-${i}` ? (
                                  <video src={`${MEDIA_URL}${v.path}`} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <div onClick={() => setPlayingVideo(`${proof._id}-${i}`)} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#1f2937' }}>
                                    <PlayCircle size={40} color="#fff" style={{ opacity: 0.9 }} />
                                    <span style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>{v.originalName}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Images */}
                      {proof.images?.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#374151' }}>📸 Photo Evidence ({proof.images.length})</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(100px,1fr))', gap: 8 }}>
                            {proof.images.map((img, i) => (
                              <img key={i} src={`${MEDIA_URL}${img.path}`} alt={`img-${i}`} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, border: '2px solid #e5e7eb', cursor: 'pointer' }} onClick={() => window.open(`${MEDIA_URL}${img.path}`, '_blank')} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Admin note + Actions */}
                      <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
                        <textarea
                          value={adminNote[proof._id] || ''}
                          onChange={e => setAdminNote(n => ({ ...n, [proof._id]: e.target.value }))}
                          placeholder="Admin note (optional — visible to NGO if rejected)"
                          rows={2}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1.5px solid #e5e7eb', fontSize: 13, marginBottom: 12, resize: 'none', outline: 'none', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={() => handleProofReview(proof._id, 'approved')}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 9, background: '#059669', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 3px 10px rgba(5,150,105,0.3)' }}>
                            <CheckCircle size={16} /> Approve & Verify
                          </button>
                          <button onClick={() => handleProofReview(proof._id, 'rejected')}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 9, background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Users Tab ── */}
        {tab === 'users' && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Name','Email','Role','Verified','Credibility','Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderTop: '1px solid #f3f4f6' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{u.orgName || u.donorType}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: u.role === 'admin' ? '#fef3c7' : u.role === 'ngo' ? '#dbeafe' : '#dcfce7', color: u.role === 'admin' ? '#92400e' : u.role === 'ngo' ? '#1d4ed8' : '#065f46', textTransform: 'capitalize' }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {u.verified ? <span style={{ color: '#059669', fontWeight: 700, fontSize: 13 }}>✓ Yes</span> : <span style={{ color: '#9ca3af', fontSize: 13 }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#059669' }}>{u.credibilityScore}/100</td>
                      <td style={{ padding: '12px 16px' }}>
                        {u.role === 'ngo' && !u.verified && (
                          <button onClick={() => handleVerifyNGO(u._id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, background: '#f0fdf4', color: '#059669', border: '1px solid #d1fae5', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            <ShieldCheck size={13} /> Verify NGO
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const statBadge = { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 99, background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' };