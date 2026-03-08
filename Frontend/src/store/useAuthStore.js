import { create } from 'zustand';

// ⚠️ No more persist middleware
// accessToken is kept in MEMORY ONLY — not in localStorage
// This protects against XSS: malicious JS cannot steal the token
//
// On page refresh → accessToken is gone from memory
// ProtectedRoute will automatically call /api/auth/refresh
// The HTTP-only cookie is sent automatically by the browser
// → gets a fresh accessToken without the user having to login again

const useAuthStore = create((set) => ({
  accessToken: null,

  // Called after successful login — only stores in memory
  login: (accessToken) => {
    set({ accessToken });
  },

  // Called silently after token refresh
  setAccessToken: (accessToken) => {
    set({ accessToken });
  },

  // Clears memory — HTTP-only cookie is cleared by the server on /logout
  logout: () => {
    set({ accessToken: null });
  },
}));

export default useAuthStore;


// useAuthStore   →  stores tokens in memory + localStorage
//      ↓
// axiosConfig    →  reads tokens from store, auto-refreshes when expired
//      ↓
// ProtectedRoute →  reads accessToken from store, blocks page if null