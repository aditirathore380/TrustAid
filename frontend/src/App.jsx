import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import NGODashboard   from './pages/NGODashboard';
import DonorDashboard from './pages/DonorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BrowsePage     from './pages/BrowsePage';
import RequestDetail  from './pages/RequestDetail';
import CreateRequest  from './pages/CreateRequest';
import UploadProof    from './pages/UploadProof';
import ImpactPage     from './pages/ImpactPage';
import Navbar         from './components/common/Navbar';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/browse"   element={<BrowsePage />} />
        <Route path="/requests/:id" element={<RequestDetail />} />
        <Route path="/impact"   element={<ImpactPage />} />

        <Route path="/ngo/dashboard" element={
          <ProtectedRoute roles={['ngo', 'admin']}><NGODashboard /></ProtectedRoute>
        } />
        <Route path="/ngo/create-request" element={
          <ProtectedRoute roles={['ngo', 'admin']}><CreateRequest /></ProtectedRoute>
        } />
        <Route path="/ngo/upload-proof/:requestId" element={
          <ProtectedRoute roles={['ngo', 'admin']}><UploadProof /></ProtectedRoute>
        } />

        <Route path="/donor/dashboard" element={
          <ProtectedRoute roles={['donor', 'admin']}><DonorDashboard /></ProtectedRoute>
        } />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}