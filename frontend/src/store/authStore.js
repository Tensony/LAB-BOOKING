import { create } from 'zustand';
import api from '../api/client';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: true,

  init: async () => {
    const token = localStorage.getItem('token');
    if (!token) return set({ loading: false });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token });
    return data.user;
  },

  register: async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token });
    return data.user;
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
