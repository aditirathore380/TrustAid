import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { MEDIA_URL } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { MapPin, Users, PlayCircle, CheckCircle, Clock, Shield, Heart, ArrowLeft, CreditCard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const URGENCY_COLOR = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' };
const CATEGORY_EMOJI = { food: 'Food', medical: 'Medical', education: 'Education', shelter: 'Shelter', water: 'Water', disaster: 'Disaster', environment: 'Environment', other: 'Other' };

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [req, setReq] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [payMethod, setPayMethod] = useState('upi');
  const [message, setMessage] = useState('');
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/requests/' + id),
      api.get('/donations/request/' + id).catch(() => ({ data: { data: [] } }))
    ]).then(function (results) {
      setReq(results[0].data.data);
      setDonations(results[1].data.data);
    }).catch(function () {
      toast.error('Failed to load');
    }).finally(function () {
      setLoading(false);
    });
  }, [id]);

  const handleDonate = async function () {
    if (!user) return navigate('/login');
    if (user.role === 'ngo') return toast.error('NGOs cannot donate.');
    if (!amount || parseFloat(amount) < 1) return toast.error('Enter a valid amount');
    setDonating(true);
    try {
      const res = await api.post('/donations', {
        requestId: id,
        amount: parseFloat(amount),
        paymentMethod: payMethod,
        message: message
      });
      toast.success('Donated Rs.' + amount + ' successfully! TXN: ' + res.data.transactionId);
      setShowModal(false);
      setAmount('');
      setMessage('');
      const updated = await api.get('/requests/' + id);
      setReq(updated.data.data);
      const dUpdated = await api.get('/donations/request/' + id).catch(function () { return { data: { data: [] } }; });
      setDonations(dUpdated.data.data);
    } catch (err) {
      toast.error((err.response && err.response.data && err.response.data.message) || 'Donation failed');
    }
    setDonating(false);
  };

  if (loading) {
    return React.createElement('div', { style: { textAlign: 'center', padding: 80, color: '#9ca3af' } }, 'Loading...');
  }
  if (!req) {
    return React.createElement('div', { style: { textAlign: 'center', padding: 80 } }, 'Request not found.');
  }

  const pct = Math.min(100, Math.round(((req.fundsRaised || 0) / (req.fundsRequired || 1)) * 100));
  const isVerified = req.proofStatus === 'approved';
  const proof = req.proof;
  const urgencyColor = URGENCY_COLOR[req.urgency] || '#6b7280';

  const isSelected = function (a) {
    return amount === String(a);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', paddingBottom: 60 }}>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 24px 0' }}>
        <button
          onClick={function () { navigate(-1); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
        >
          <ArrowLeft size={16} />
          Back to Browse
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

          {/* Left Column */}
          <div>
            {req.beforeImages && req.beforeImages[0] ? (
              <img
                src={MEDIA_URL + req.beforeImages[0]}
                alt={req.title}
                style={{ width: '100%', height: 280, objectFit: 'cover', borderRadius: 16, marginBottom: 24 }}
              />
            ) : (
              <div style={{ width: '100%', height: 200, background: 'linear-gradient(135deg,#f0fdf4,#d1fae5)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#059669', marginBottom: 24 }}>
                {CATEGORY_EMOJI[req.category] || 'Request'}
              </div>
            )}

            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: urgencyColor + '18', color: urgencyColor, border: '1px solid ' + urgencyColor + '40', textTransform: 'uppercase' }}>
                {req.urgency}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', textTransform: 'capitalize' }}>
                {req.category}
              </span>
              {isVerified && (
                <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' }}>
                  Verified
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 12, lineHeight: 1.3 }}>{req.title}</h1>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20, fontSize: 13, color: '#6b7280' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={14} />
                {req.location && req.location.city}, {req.location && req.location.state}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={14} />
                {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
              </span>
              {req.beneficiaries > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={14} />
                  {req.beneficiaries} beneficiaries
                </span>
              )}
            </div>

            <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e5e7eb', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: '#111827' }}>About this Request</h2>
              <p style={{ color: '#4b5563', lineHeight: 1.7, fontSize: 14 }}>{req.description}</p>
            </div>

            {/* Proof Section */}
            {proof && (
              <div style={{ background: isVerified ? '#f0fdf4' : '#fffbeb', borderRadius: 14, padding: 20, border: '1px solid ' + (isVerified ? '#6ee7b7' : '#fcd34d'), marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  {isVerified
                    ? <CheckCircle size={20} color="#059669" />
                    : <Clock size={20} color="#d97706" />
                  }
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: isVerified ? '#065f46' : '#92400e' }}>
                    {isVerified ? 'Verified Proof of Completion' : 'Proof Under Review'}
                  </h2>
                </div>
                <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 16, lineHeight: 1.6 }}>{proof.description}</p>

                {proof.beneficiariesServed > 0 && (
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                    <StatPill label="Beneficiaries Served" value={proof.beneficiariesServed} color="#059669" />
                    <StatPill label="Funds Utilised" value={'Rs.' + ((proof.fundsUtilised || 0).toLocaleString())} color="#059669" />
                  </div>
                )}

                {/* Video proof */}
                {proof.videos && proof.videos.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#374151' }}>Video Proof</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
                      {proof.videos.map(function (v, i) {
                        const videoKey = 'v-' + i;
                        return (
                          <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#000', aspectRatio: '16/9' }}>
                            {playingVideo === videoKey ? (
                              <video src={MEDIA_URL + v.path} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div
                                onClick={function () { setPlayingVideo(videoKey); }}
                                style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#1f2937', minHeight: 120 }}
                              >
                                <PlayCircle size={48} color="#fff" style={{ opacity: 0.9 }} />
                                <span style={{ color: '#fff', fontSize: 12, marginTop: 6, opacity: 0.7 }}>Play Video Proof</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Image proof */}
                {proof.images && proof.images.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#374151' }}>Photo Proof</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 8 }}>
                      {proof.images.map(function (img, i) {
                        return (
                          <img key={i} src={MEDIA_URL + img.path} alt={'proof-' + i} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, border: '2px solid #d1fae5' }} />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Donors */}
            {donations.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#111827' }}>Donors ({donations.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {donations.slice(0, 8).map(function (d) {
                    return (
                      <div key={d._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderRadius: 9 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#059669' }}>
                            {(d.donor && d.donor.name && d.donor.name[0]) || '?'}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{(d.donor && d.donor.name) || 'Anonymous'}</div>
                            {d.message && <div style={{ fontSize: 11, color: '#9ca3af' }}>"{d.message}"</div>}
                          </div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>Rs.{d.amount.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: 16 }}>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#059669' }}>Rs.{(req.fundsRaised || 0).toLocaleString()}</span>
                  <span style={{ fontSize: 14, color: '#6b7280', alignSelf: 'flex-end' }}>of Rs.{(req.fundsRequired || 0).toLocaleString()}</span>
                </div>
                <div style={{ height: 8, borderRadius: 99, background: '#f3f4f6', overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ height: '100%', borderRadius: 99, background: pct >= 100 ? '#059669' : '#34d399', width: pct + '%', transition: 'width 0.8s' }} />
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{pct}% funded - {donations.length} donors</div>
              </div>

              {req.status !== 'completed' ? (
                <button
                  onClick={function () { setShowModal(true); }}
                  style={{ width: '100%', padding: '14px', borderRadius: 11, background: 'linear-gradient(135deg,#059669,#34d399)', color: '#fff', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(5,150,105,0.3)' }}
                >
                  <Heart size={18} fill="#fff" />
                  Donate Now
                </button>
              ) : (
                <div style={{ textAlign: 'center', padding: 14, background: '#d1fae5', borderRadius: 11, color: '#065f46', fontWeight: 700 }}>
                  Task Completed
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 12, fontSize: 12, color: '#9ca3af' }}>
                <Shield size={13} /> Secure mock payment
              </div>
            </div>

            {/* NGO Info */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 18, border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#111827' }}>About the NGO</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#059669' }}>
                  {(req.ngo && (req.ngo.orgName || req.ngo.name) || 'N')[0]}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{req.ngo && (req.ngo.orgName || req.ngo.name)}</div>
                  {req.ngo && req.ngo.verified && (
                    <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Verified NGO</div>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                <div style={{ marginBottom: 4 }}>Credibility: {(req.ngo && req.ngo.credibilityScore) || 50}/100</div>
                <div>Tasks Completed: {(req.ngo && req.ngo.tasksCompleted) || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: '#111827' }}>Make a Donation</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>{req.title}</p>

            {/* Quick amount buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
              {[100, 500, 1000, 5000].map(function (a) {
                var selected = isSelected(a);
                return (
                  <button
                    key={a}
                    onClick={function () { setAmount(String(a)); }}
                    style={{
                      padding: '9px 4px',
                      borderRadius: 8,
                      border: selected ? '1.5px solid #059669' : '1.5px solid #e5e7eb',
                      background: selected ? '#f0fdf4' : '#fff',
                      color: selected ? '#059669' : '#374151',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                  >
                    Rs.{a}
                  </button>
                );
              })}
            </div>

            <input
              type="number"
              value={amount}
              onChange={function (e) { setAmount(e.target.value); }}
              placeholder="Enter custom amount"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #d1d5db', fontSize: 15, marginBottom: 14, outline: 'none', boxSizing: 'border-box', fontWeight: 600 }}
            />

            <select
              value={payMethod}
              onChange={function (e) { setPayMethod(e.target.value); }}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #d1d5db', fontSize: 14, marginBottom: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' }}
            >
              <option value="upi">UPI</option>
              <option value="card">Credit / Debit Card</option>
              <option value="netbanking">Net Banking</option>
              <option value="wallet">Wallet</option>
            </select>

            <input
              type="text"
              value={message}
              onChange={function (e) { setMessage(e.target.value); }}
              placeholder="Leave a message (optional)"
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #d1d5db', fontSize: 14, marginBottom: 20, outline: 'none', boxSizing: 'border-box' }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={function () { setShowModal(false); }}
                style={{ flex: 1, padding: 12, borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDonate}
                disabled={donating}
                style={{ flex: 2, padding: 12, borderRadius: 10, background: '#059669', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <CreditCard size={16} />
                {donating ? 'Processing...' : 'Donate Rs.' + (amount || '...')}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 12 }}>This is a simulated payment for demo purposes</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill(props) {
  return (
    <div style={{ background: props.color + '10', border: '1px solid ' + props.color + '30', borderRadius: 8, padding: '8px 14px', display: 'inline-block' }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: props.color }}>{props.value}</div>
      <div style={{ fontSize: 11, color: '#6b7280' }}>{props.label}</div>
    </div>
  );
}