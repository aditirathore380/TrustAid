// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        const res = await api.post('/auth/login', { email, password });
        set({ user: res.data.user, token: res.data.token, loading: false });
        localStorage.setItem('ngo_token', res.data.token);
        return res.data;
      },

      register: async (data) => {
        set({ loading: true });
        const res = await api.post('/auth/register', data);
        set({ user: res.data.user, token: res.data.token, loading: false });
        localStorage.setItem('ngo_token', res.data.token);
        return res.data;
      },

      logout: () => {
        localStorage.removeItem('ngo_token');
        set({ user: null, token: null });
      },

      setUser: (user) => set({ user }),
    }),
    { name: 'ngo-auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);