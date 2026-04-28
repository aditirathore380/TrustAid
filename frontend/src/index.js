import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" toastOptions={{ duration: 4000,
      style: { borderRadius: '10px', fontSize: '14px', fontFamily: 'Inter, sans-serif' }
    }} />
  </React.StrictMode>
);