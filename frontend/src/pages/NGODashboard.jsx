import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { Plus, FileText, CheckCircle, Clock, Upload, TrendingUp, MapPin, Eye } from 'lucide-react';

const STATUS_COLOR = { active:'#3b82f6', funded:'#8b5cf6', in_progress:'#f59e0b', completed:'#059669', rejected:'#ef4444' };
const STATUS_LABEL = { active:'Active', funded:'Funded', in_progress:'In Progress', completed:'Completed', rejected:'Rejected' };

export default function NGODashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/requests/ngo/my').then(r => setRequests(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const active    = requests.filter(r => r.status === 'active');
  const funded    = requests.filter(r => ['funded','in_progress'].includes(r.status));
  const completed = requests.filter(r => r.status === 'completed');
  const pendingProof = requests.filter(r => r.proofStatus === 'pending');

  const totalRaised = requests.reduce((sum, r) => sum + (r.fundsRaised || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', padding: '36px 24px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#064e3b', marginBottom: 4 }}>NGO Dashboard</h1>
              <p style={{ color: '#065f46', fontSize: 15 }}>{user?.orgName || user?.name} {user?.verified && <span style={{ background: '#059669', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 99, marginLeft: 8 }}>✓ Verified</span>}</p>
            </div>
            <button onClick={() => navigate('/ngo/create-request')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 11, background: '#059669', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(5,150,105,0.3)' }}>
              <Plus size={18} /> New Request
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginTop: 24 }}>
            {[
              { label: 'Active Requests', value: active.length, icon: '📋', color: '#3b82f6' },
              { label: 'Funded/In Progress', value: funded.length, icon: '🚀', color: '#8b5cf6' },
              { label: 'Completed', value: completed.length, icon: '✅', color: '#059669' },
              { label: 'Total Raised', value: `₹${totalRaised.toLocaleString()}`, icon: '💰', color: '#f59e0b' },
              { label: 'Credibility', value: `${user?.credibilityScore || 50}/100`, icon: '⭐', color: '#ec4899' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px' }}>
        {/* Pending proof alert */}
        {pendingProof.length > 0 && (
          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={18} color="#d97706" />
            <span style={{ fontSize: 14, color: '#92400e', fontWeight: 600 }}>{pendingProof.length} proof(s) are under admin review</span>
          </div>
        )}

        {/* Requests table */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Your Requests ({requests.length})</h2>
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
          ) : requests.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No requests yet</h3>
              <p style={{ color: '#9ca3af', marginBottom: 20 }}>Create your first request to get started</p>
              <button onClick={() => navigate('/ngo/create-request')} style={{ padding: '12px 24px', borderRadius: 10, background: '#059669', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Create Request
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Title','Category','Status','Proof','Raised','Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r._id} style={{ borderTop: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', maxWidth: 200 }}>{r.title}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                          <MapPin size={11} /> {r.location?.city}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, background: '#f3f4f6', color: '#374151', textTransform: 'capitalize' }}>{r.category}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: `${STATUS_COLOR[r.status]}18`, color: STATUS_COLOR[r.status] }}>
                          {STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {r.proofStatus === 'none' && r.status !== 'active' && (
                          <button onClick={() => navigate(`/ngo/upload-proof/${r._id}`)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            <Upload size={13} /> Upload
                          </button>
                        )}
                        {r.proofStatus === 'pending' && <span style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>⏳ Reviewing</span>}
                        {r.proofStatus === 'approved' && <span style={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>✅ Verified</span>}
                        {r.proofStatus === 'rejected' && <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>❌ Rejected</span>}
                        {r.proofStatus === 'none' && r.status === 'active' && <span style={{ fontSize: 12, color: '#9ca3af' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>₹{(r.fundsRaised||0).toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>of ₹{(r.fundsRequired||0).toLocaleString()}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button onClick={() => navigate(`/requests/${r._id}`)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, background: '#f3f4f6', color: '#374151', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
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