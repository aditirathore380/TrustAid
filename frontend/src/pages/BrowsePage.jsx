import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { Search, Filter, MapPin, Clock, TrendingUp, Heart, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['all','food','medical','education','shelter','water','disaster','environment','other'];
const URGENCIES  = ['all','critical','high','medium','low'];
const URGENCY_COLOR = { critical:'#ef4444', high:'#f97316', medium:'#f59e0b', low:'#22c55e' };
const CATEGORY_EMOJI = { food:'🍱',medical:'🏥',education:'📚',shelter:'🏠',water:'💧',disaster:'🆘',environment:'🌿',other:'📦' };

export default function BrowsePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [matched, setMatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category:'all', urgency:'all', search:'', sort:'newest', page:1 });
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [view, setView] = useState('all'); // 'all' | 'matched'

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 12, sort: filters.sort };
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.urgency !== 'all')  params.urgency  = filters.urgency;
      if (filters.search)             params.search   = filters.search;
      const res = await api.get('/requests', { params });
      setRequests(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { setRequests([]); }
    setLoading(false);
  }, [filters]);

  const fetchMatched = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/matches/for-me');
      setMatched(res.data.data);
    } catch {}
  }, [user]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { if (user) fetchMatched(); }, [fetchMatched, user]);

  const setF = (k) => (v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  const displayList = view === 'matched' ? matched.map(m => m.request) : requests;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#064e3b', marginBottom: 6 }}>Browse Requests</h1>
          <p style={{ color: '#065f46', marginBottom: 24, fontSize: 15 }}>{total} open requests need your support</p>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 500 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input value={filters.search} onChange={e => setF('search')(e.target.value)}
              placeholder="Search by title, category, location..."
              style={{ width: '100%', padding: '12px 14px 12px 44px', borderRadius: 12, border: '1.5px solid #d1fae5', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px' }}>
        {/* Filter Row */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
          {/* View toggle */}
          {user && (
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 9, padding: 3, gap: 2 }}>
              {[['all','All Requests'],['matched','🎯 Matched for Me']].map(([v, l]) => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: view === v ? '#fff' : 'transparent', fontWeight: view === v ? 700 : 500, fontSize: 13, cursor: 'pointer', color: view === v ? '#059669' : '#6b7280', boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                  {l}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280' }}>
            <SlidersHorizontal size={15} /> Filters:
          </div>

          <select value={filters.category} onChange={e => setF('category')(e.target.value)} style={selectStyle}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? '📂 All Categories' : `${CATEGORY_EMOJI[c]} ${c.charAt(0).toUpperCase()+c.slice(1)}`}</option>)}
          </select>

          <select value={filters.urgency} onChange={e => setF('urgency')(e.target.value)} style={selectStyle}>
            {URGENCIES.map(u => <option key={u} value={u}>{u === 'all' ? '⚡ All Urgencies' : `${u.charAt(0).toUpperCase()+u.slice(1)}`}</option>)}
          </select>

          <select value={filters.sort} onChange={e => setF('sort')(e.target.value)} style={selectStyle}>
            <option value="newest">Newest First</option>
            <option value="urgency">Most Urgent</option>
            <option value="amount">Highest Funding</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#9ca3af' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#374151', marginBottom: 6 }}>No requests found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
            {displayList.filter(Boolean).map(req => <RequestCard key={req._id} req={req} navigate={navigate} matchData={view==='matched' ? matched.find(m=>m.request?._id===req._id) : null} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && view === 'all' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            {[...Array(pages)].map((_, i) => (
              <button key={i} onClick={() => setFilters(f => ({ ...f, page: i+1 }))}
                style={{ width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${filters.page === i+1 ? '#059669' : '#e5e7eb'}`, background: filters.page === i+1 ? '#059669' : '#fff', color: filters.page === i+1 ? '#fff' : '#374151', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                {i+1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RequestCard({ req, navigate, matchData }) {
  const pct = Math.min(100, Math.round((req.fundsRaised / req.fundsRequired) * 100));
  const uColor = URGENCY_COLOR[req.urgency] || '#6b7280';

  return (
    <div onClick={() => navigate(`/requests/${req._id}`)}
      style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
    >
      {/* Image */}
      {req.beforeImages?.[0] ? (
        <img src={`${process.env.REACT_APP_MEDIA_URL}${req.beforeImages[0]}`} alt={req.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: 160, background: `linear-gradient(135deg,#f0fdf4,#d1fae5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>
          {CATEGORY_EMOJI[req.category] || '📦'}
        </div>
      )}

      <div style={{ padding: 16 }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: `${uColor}18`, color: uColor, border: `1px solid ${uColor}40`, textTransform: 'uppercase' }}>
            {req.urgency}
          </span>
          {req.proofStatus === 'approved' && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' }}>✓ Verified</span>
          )}
          {matchData && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: '#ede9fe', color: '#5b21b6' }}>🎯 {matchData.score}% match</span>
          )}
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: '#111827', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{req.title}</h3>
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={12} /> {req.location?.city}, {req.location?.state}
        </p>

        {/* Funding bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: '#6b7280' }}>₹{(req.fundsRaised||0).toLocaleString()} raised</span>
            <span style={{ fontWeight: 700, color: '#059669' }}>{pct}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: '#f3f4f6', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, background: pct >= 100 ? '#059669' : '#34d399', width: `${pct}%`, transition: 'width 0.6s' }} />
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Goal: ₹{(req.fundsRequired||0).toLocaleString()}</div>
        </div>

        {/* NGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#059669' }}>
            {(req.ngo?.orgName || req.ngo?.name || 'N')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{req.ngo?.orgName || req.ngo?.name}</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>⭐ {req.ngo?.credibilityScore || 50}/100</div>
          </div>
          {req.ngo?.verified && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#059669', fontWeight: 700 }}>✓ Verified</span>}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <div style={{ height: 160, background: 'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: 16 }}>
        {[80, 100, 60].map((w, i) => (
          <div key={i} style={{ height: 14, borderRadius: 7, background: '#f3f4f6', marginBottom: 10, width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

const selectStyle = { padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, color: '#374151', background: '#fff', cursor: 'pointer', outline: 'none' };