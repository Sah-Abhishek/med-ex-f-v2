import { create } from 'zustand';
import api from '../services/api';

const ROLE_MAP = {
  2: 'teamlead',
  3: 'coder',
};

function decodeJWT(token) {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload));
}

function extractUser(decoded, attending) {
  const { tokenPayload } = decoded;
  return {
    email: tokenPayload.email,
    roleId: tokenPayload.RoleId,
    role: ROLE_MAP[tokenPayload.RoleId] || 'unknown',
    sourceSystem: tokenPayload.sourceSystem,
    requesterType: tokenPayload.requesterType,
    attending: attending ?? false,
  };
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  profile: null,
  loading: true,
  error: null,
  isAuthenticated: false,

  fetchProfile: async () => {
    try {
      const response = await api.get('https://uat-app.valerionhealth.com/users/profile');
      const data = response.data;
      if (data.success) {
        set({ profile: data.data });
      }
    } catch {
      // Profile fetch is non-critical
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      if (data.success && data.token) {
        const decoded = decodeJWT(data.token);
        const user = extractUser(decoded, data.attending);

        localStorage.setItem('token', data.token);
        set({ user, token: data.token, isAuthenticated: true, loading: false });

        get().fetchProfile();

        return { success: true, user };
      }

      set({ error: 'Login failed', loading: false });
      return { success: false, error: 'Login failed' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Login failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, profile: null, isAuthenticated: false, error: null });
  },

  initialize: () => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = decodeJWT(token);
        if (decoded.exp * 1000 > Date.now()) {
          const user = extractUser(decoded);
          set({ user, token, isAuthenticated: true, loading: false });
          useAuthStore.getState().fetchProfile();
          return;
        }
      } catch {
        // Invalid token, clear it
      }
      localStorage.removeItem('token');
    }
    set({ loading: false });
  },
}));
