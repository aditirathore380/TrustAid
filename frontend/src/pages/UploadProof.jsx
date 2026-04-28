import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Upload, Video, Image, ArrowLeft, CheckCircle } from 'lucide-react';

export default function UploadProof() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', beneficiariesServed: '', fundsUtilised: '' });
  const [videos, setVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/requests/${requestId}`).then(r => setRequest(r.data.data)).catch(() => toast.error('Request not found'));
  }, [requestId]);

  const onDropVideos = useCallback(files => setVideos(prev => [...prev, ...files].slice(0, 3)), []);
  const onDropImages = useCallback(files => setImages(prev => [...prev, ...files].slice(0, 10)), []);

  const { getRootProps: getVideoProps, getInputProps: getVideoInput, isDragActive: videoDrag } = useDropzone({
    accept: { 'video/*': ['.mp4', '.mov', '.mpeg', '.webm'] }, maxFiles: 3, onDrop: onDropVideos
  });
  const { getRootProps: getImageProps, getInputProps: getImageInput, isDragActive: imageDrag } = useDropzone({
    accept: { 'image/*': [] }, maxFiles: 10, onDrop: onDropImages
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.description) return toast.error('Title and description are required');
    if (videos.length === 0 && images.length === 0) return toast.error('Upload at least one video or image as proof');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('beneficiariesServed', form.beneficiariesServed || 0);
      fd.append('fundsUtilised', form.fundsUtilised || 0);
      videos.forEach(v => fd.append('videos', v));
      images.forEach(img => fd.append('images', img));
      await api.post(`/proofs/${requestId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('✅ Proof uploaded! Awaiting admin verification.');
      navigate('/ngo/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', padding: '32px 24px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <button onClick={() => navigate('/ngo/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontSize: 14, marginBottom: 14, fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#064e3b' }}>Upload Completion Proof</h1>
          {request && <p style={{ color: '#065f46', marginTop: 6, fontSize: 14 }}>For: <strong>{request.title}</strong></p>}
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px' }}>
        {/* Info box */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 10 }}>
          <CheckCircle size={18} color="#1d4ed8" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
            <strong>Transparency requirement:</strong> Every completed task must have video and/or photo proof. Admin will review and grant a "Verified" badge. Donors can then see the real impact of their contribution.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Details */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #e5e7eb', marginBottom: 20 }}>
            <h2 style={sectionTitle}>Proof Details</h2>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Proof Title *</label>
              <input value={form.title} onChange={set('title')} placeholder="e.g. Food distributed to 200 families in Assam"
                required style={inp} onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Description *</label>
              <textarea value={form.description} onChange={set('description')} rows={4}
                placeholder="Describe what was accomplished, how funds were used, and the impact created..."
                required style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>Beneficiaries Served</label>
                <input type="number" value={form.beneficiariesServed} onChange={set('beneficiariesServed')}
                  placeholder="e.g. 200" style={inp}
                  onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </div>
              <div>
                <label style={lbl}>Funds Utilised (₹)</label>
                <input type="number" value={form.fundsUtilised} onChange={set('fundsUtilised')}
                  placeholder="e.g. 45000" style={inp}
                  onFocus={e => e.target.style.borderColor = '#059669'} onBlur={e => e.target.style.borderColor = '#d1d5db'} />
              </div>
            </div>
          </div>

          {/* Video Upload */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #e5e7eb', marginBottom: 20 }}>
            <h2 style={sectionTitle}><Video size={18} color="#7c3aed" /> Video Proof (Recommended)</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>Upload up to 3 videos showing the work done. Videos carry the most credibility with donors.</p>
            <div {...getVideoProps()} style={{ border: `2px dashed ${videoDrag ? '#7c3aed' : '#e9d5ff'}`, borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer', background: videoDrag ? '#faf5ff' : '#fefcff', transition: 'all 0.15s' }}>
              <input {...getVideoInput()} />
              <Video size={36} color={videoDrag ? '#7c3aed' : '#c084fc'} style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, color: videoDrag ? '#7c3aed' : '#9ca3af', fontWeight: 500 }}>
                {videoDrag ? 'Drop videos here...' : 'Drag & drop videos, or click to select'}
              </p>
              <p style={{ fontSize: 12, color: '#d1d5db', marginTop: 4 }}>MP4, MOV, WEBM — max 3 videos, 100MB each</p>
            </div>
            {videos.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {videos.map((v, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#faf5ff', borderRadius: 9, padding: '10px 14px', border: '1px solid #e9d5ff' }}>
                    <Video size={16} color="#7c3aed" />
                    <span style={{ flex: 1, fontSize: 13, color: '#374151', fontWeight: 500 }}>{v.name}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{(v.size / 1024 / 1024).toFixed(1)} MB</span>
                    <button type="button" onClick={() => setVideos(vids => vids.filter((_, idx) => idx !== i))}
                      style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #e5e7eb', marginBottom: 24 }}>
            <h2 style={sectionTitle}><Image size={18} color="#059669" /> Photo Proof</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>Upload up to 10 photos showing before/after and the work in progress.</p>
            <div {...getImageProps()} style={{ border: `2px dashed ${imageDrag ? '#059669' : '#d1fae5'}`, borderRadius: 12, padding: 28, textAlign: 'center', cursor: 'pointer', background: imageDrag ? '#f0fdf4' : '#f9fffe', transition: 'all 0.15s' }}>
              <input {...getImageInput()} />
              <Image size={36} color={imageDrag ? '#059669' : '#6ee7b7'} style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, color: imageDrag ? '#059669' : '#9ca3af', fontWeight: 500 }}>
                {imageDrag ? 'Drop photos here...' : 'Drag & drop photos, or click to select'}
              </p>
              <p style={{ fontSize: 12, color: '#d1d5db', marginTop: 4 }}>JPEG, PNG, WEBP — max 10 images</p>
            </div>
            {images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginTop: 12 }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={URL.createObjectURL(img)} alt={`proof-${i}`} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, border: '2px solid #d1fae5' }} />
                    <button type="button" onClick={() => setImages(imgs => imgs.filter((_, idx) => idx !== i))}
                      style={{ position: 'absolute', top: 2, right: 2, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: 16, borderRadius: 12, background: loading ? '#6ee7b7' : '#059669', color: '#fff', border: 'none', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(5,150,105,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Upload size={18} />
            {loading ? 'Uploading... please wait' : 'Submit Proof for Verification'}
          </button>
        </form>
      </div>
    </div>
  );
}

const sectionTitle = { fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 };
const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 };
const inp = { width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid #d1d5db', fontSize: 13, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', background: '#fff' };