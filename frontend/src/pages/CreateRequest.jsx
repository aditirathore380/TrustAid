// ── CreateRequest.jsx ─────────────────────────────────────────
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Upload, ArrowLeft, MapPin } from 'lucide-react';

export default function CreateRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title:'', description:'', category:'food', urgency:'medium',
    fundsRequired:'', targetDate:'', beneficiaries:'',
    tags:'', address:'', city:'', state:'',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] }, maxFiles: 5,
    onDrop: (files) => setImages(prev => [...prev, ...files].slice(0, 5))
  });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.description || !form.fundsRequired || !form.city)
      return toast.error('Fill in all required fields');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'address' || k === 'city' || k === 'state') return;
        fd.append(k, v);
      });
      fd.append('location', JSON.stringify({ address: form.address, city: form.city, state: form.state, country: 'India' }));
      images.forEach(img => fd.append('beforeImages', img));
      await api.post('/requests', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Request created successfully!');
      navigate('/ngo/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create request');
    }
    setLoading(false);
  };

  const inp = (label, key, type='text', placeholder='', required=false) => (
    <div style={{ marginBottom: 16 }}>
      <label style={lbl}>{label}{required && <span style={{ color:'#ef4444' }}>*</span>}</label>
      <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} required={required}
        style={inp_s} onFocus={e=>e.target.style.borderColor='#059669'} onBlur={e=>e.target.style.borderColor='#d1d5db'} />
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f9fafb', paddingBottom:60 }}>
      <div style={{ background:'linear-gradient(135deg,#ecfdf5,#d1fae5)', padding:'32px 24px 24px' }}>
        <div style={{ maxWidth:700, margin:'0 auto' }}>
          <button onClick={()=>navigate('/ngo/dashboard')} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'#065f46', cursor:'pointer', fontSize:14, marginBottom:16, fontWeight:500 }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 style={{ fontSize:28, fontWeight:800, color:'#064e3b' }}>Create New Request</h1>
          <p style={{ color:'#065f46', marginTop:4, fontSize:15 }}>Describe your community need in detail</p>
        </div>
      </div>

      <div style={{ maxWidth:700, margin:'0 auto', padding:'24px' }}>
        <form onSubmit={handleSubmit}>
          <Section title="Basic Information">
            {inp('Request Title','title','text','e.g. Food aid for 200 flood victims in Assam',true)}
            <div style={{ marginBottom:16 }}>
              <label style={lbl}>Description<span style={{color:'#ef4444'}}>*</span></label>
              <textarea value={form.description} onChange={set('description')} rows={4} placeholder="Describe the need, affected people, and how funds will be used..." required
                style={{...inp_s, resize:'vertical', lineHeight:1.6}} onFocus={e=>e.target.style.borderColor='#059669'} onBlur={e=>e.target.style.borderColor='#d1d5db'} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div>
                <label style={lbl}>Category<span style={{color:'#ef4444'}}>*</span></label>
                <select value={form.category} onChange={set('category')} style={{...inp_s, cursor:'pointer'}}>
                  {['food','medical','education','shelter','water','disaster','environment','other'].map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Urgency<span style={{color:'#ef4444'}}>*</span></label>
                <select value={form.urgency} onChange={set('urgency')} style={{...inp_s, cursor:'pointer'}}>
                  {['low','medium','high','critical'].map(u=><option key={u} value={u}>{u.charAt(0).toUpperCase()+u.slice(1)}</option>)}
                </select>
              </div>
              {inp('Funds Required (₹)','fundsRequired','number','50000',true)}
              {inp('Beneficiaries Count','beneficiaries','number','e.g. 200')}
              <div style={{gridColumn:'1/-1'}}>{inp('Target Date','targetDate','date')}</div>
              {inp('Tags (comma-separated)','tags','text','flood, relief, food')}
            </div>
          </Section>

          <Section title="Location">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div style={{gridColumn:'1/-1'}}>{inp('Address','address','text','Village/Area name')}</div>
              {inp('City / District','city','text','Mumbai',true)}
              {inp('State','state','text','Maharashtra',true)}
            </div>
          </Section>

          <Section title="Before-State Photos">
            <p style={{ fontSize:13, color:'#6b7280', marginBottom:12 }}>Upload current state photos (max 5) — these show the problem before intervention</p>
            <div {...getRootProps()} style={{ border:`2px dashed ${isDragActive?'#059669':'#d1d5db'}`, borderRadius:12, padding:'32px', textAlign:'center', cursor:'pointer', background:isDragActive?'#f0fdf4':'#fafafa', transition:'all 0.15s' }}>
              <input {...getInputProps()} />
              <Upload size={32} color={isDragActive?'#059669':'#9ca3af'} style={{margin:'0 auto 8px'}} />
              <p style={{ fontSize:14, color:isDragActive?'#059669':'#6b7280', fontWeight:500 }}>{isDragActive ? 'Drop images here...' : 'Drag & drop photos, or click to browse'}</p>
              <p style={{ fontSize:12, color:'#9ca3af', marginTop:4 }}>JPEG, PNG, WEBP — max 5 images</p>
            </div>
            {images.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginTop:12 }}>
                {images.map((img,i) => (
                  <div key={i} style={{ position:'relative' }}>
                    <img src={URL.createObjectURL(img)} alt={`preview-${i}`} style={{ width:'100%', aspectRatio:'1', objectFit:'cover', borderRadius:8, border:'2px solid #d1fae5' }} />
                    <button type="button" onClick={()=>setImages(imgs=>imgs.filter((_,idx)=>idx!==i))}
                      style={{ position:'absolute', top:2, right:2, background:'#ef4444', color:'#fff', border:'none', borderRadius:'50%', width:20, height:20, fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <button type="submit" disabled={loading} style={{ width:'100%', padding:15, borderRadius:12, background:loading?'#6ee7b7':'#059669', color:'#fff', border:'none', fontSize:16, fontWeight:700, cursor:loading?'not-allowed':'pointer', boxShadow:'0 4px 14px rgba(5,150,105,0.3)' }}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background:'#fff', borderRadius:14, padding:24, border:'1px solid #e5e7eb', marginBottom:20 }}>
      <h2 style={{ fontSize:16, fontWeight:700, color:'#111827', marginBottom:16, paddingBottom:10, borderBottom:'1px solid #f3f4f6' }}>{title}</h2>
      {children}
    </div>
  );
}
const lbl = { display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 };
const inp_s = { width:'100%', padding:'10px 13px', borderRadius:9, border:'1.5px solid #d1d5db', fontSize:13, outline:'none', boxSizing:'border-box', transition:'border-color 0.15s', background:'#fff' };