// ── ImpactPage.jsx ────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { MEDIA_URL } from '../utils/api';
import { PlayCircle, CheckCircle, Users, Heart } from 'lucide-react';

export default function ImpactPage() {
  const navigate = useNavigate();
  const [proofs, setProofs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/proofs'),
      api.get('/donations/stats')
    ]).then(([pRes, sRes]) => {
      setProofs(pRes.data.data);
      setStats(sRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#064e3b,#065f46)', padding: '60px 24px 48px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 99, padding: '6px 16px', marginBottom: 20, fontSize: 13, color: '#6ee7b7', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)' }}>
          <CheckCircle size={14} /> Verified Impact Reports
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>Real Impact,<br />Real Proof</h1>
        <p style={{ color: '#a7f3d0', fontSize: 16, maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.7 }}>Every completed project is verified with video and photo evidence. No claims without proof.</p>

        {/* Stats */}
        <div style={{ display: 'inline-flex', gap: 0, background: 'rgba(255,255,255,0.1)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
          {[
            { label: 'Verified Projects', value: proofs.length, icon: '✅' },
            { label: 'Total Raised', value: `₹${((stats.totalAmount || 0) / 100000).toFixed(1)}L`, icon: '💰' },
            { label: 'Donors', value: stats.totalDonors || 0, icon: '❤️' },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: '16px 28px', textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginTop: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#6ee7b7', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Proof Grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: '#111827' }}>Verified Completions</h2>
        <p style={{ color: '#6b7280', marginBottom: 32, fontSize: 15 }}>All proofs reviewed and approved by our admin team</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading verified projects...</div>
        ) : proofs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🎯</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No verified projects yet</h3>
            <p style={{ color: '#9ca3af' }}>Completed projects with approved proofs will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 24 }}>
            {proofs.map(proof => (
              <div key={proof._id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: 'transform 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                {/* Video / Image */}
                {proof.videos?.[0] ? (
                  <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000', overflow: 'hidden' }}>
                    {playingVideo === proof._id ? (
                      <video src={`${MEDIA_URL}${proof.videos[0].path}`} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div onClick={() => setPlayingVideo(proof._id)} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                        {proof.images?.[0] && (
                          <img src={`${MEDIA_URL}${proof.images[0].path}`} alt="thumbnail" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                        )}
                        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                          <PlayCircle size={52} color="#fff" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }} />
                          <p style={{ color: '#fff', fontSize: 13, marginTop: 8, fontWeight: 600 }}>Play Video Proof</p>
                        </div>
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 10, right: 10, background: '#059669', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>✓ VERIFIED</div>
                  </div>
                ) : proof.images?.[0] && (
                  <div style={{ position: 'relative' }}>
                    <img src={`${MEDIA_URL}${proof.images[0].path}`} alt="proof" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 10, right: 10, background: '#059669', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>✓ VERIFIED</div>
                  </div>
                )}

                <div style={{ padding: 18 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8, lineHeight: 1.3 }}>{proof.title}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 12 }}>{proof.description.substring(0, 120)}{proof.description.length > 120 ? '...' : ''}</p>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                    {proof.beneficiariesServed > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#059669', fontWeight: 600 }}>
                        <Users size={13} /> {proof.beneficiariesServed} served
                      </div>
                    )}
                    {proof.fundsUtilised > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#059669', fontWeight: 600 }}>
                        <Heart size={13} /> ₹{proof.fundsUtilised.toLocaleString()} used
                      </div>
                    )}
                  </div>

                  {/* Photo strip */}
                  {proof.images?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                      {proof.images.slice(0, 4).map((img, i) => (
                        <img key={i} src={`${MEDIA_URL}${img.path}`} alt={`img-${i}`} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '2px solid #d1fae5' }} />
                      ))}
                      {proof.images.length > 4 && (
                        <div style={{ width: 48, height: 48, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#6b7280' }}>+{proof.images.length - 4}</div>
                      )}
                    </div>
                  )}

                  {/* NGO + Request */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      <div style={{ fontWeight: 600, color: '#374151' }}>{proof.ngo?.orgName || proof.ngo?.name}</div>
                      <div style={{ marginTop: 1 }}>{proof.request?.location?.city}, {proof.request?.location?.state}</div>
                    </div>
                    <button onClick={() => navigate(`/requests/${proof.request?._id}`)}
                      style={{ fontSize: 12, padding: '6px 12px', borderRadius: 7, background: '#f0fdf4', color: '#059669', border: '1px solid #d1fae5', cursor: 'pointer', fontWeight: 600 }}>
                      View Request
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}