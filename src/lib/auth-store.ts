import { create } from 'zustand';
import { User } from '@workspace/api-client-react';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('boost_earn_token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('boost_earn_token'),
  setAuth: (token, user) => {
    localStorage.setItem('boost_earn_token', token);
    set({ token, user, isAuthenticated: true });
  },
  clearAuth: () => {
    localStorage.removeItem('boost_earn_token');
    set({ token: null, user: null, isAuthenticated: false });
  },
  setUser: (user) => set({ user }),
}));
