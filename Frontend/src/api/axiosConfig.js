import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // ← sends HTTP-only cookies automatically with every request
});

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
// Attaches the short-lived accessToken from memory to every outgoing request
axiosInstance.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
// When any API call returns 401 (access token expired in memory):
//   1. Call /api/auth/refresh — NO body needed, browser auto-sends the HTTP-only cookie
//   2. Save the new accessToken in memory
//   3. Retry the original failed request
// If refresh also fails (cookie expired/missing) → logout
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Plain axios so this call doesn't hit the interceptor again
        // withCredentials: true → browser sends the HTTP-only refreshToken cookie
        const { data } = await axios.post(
          "http://localhost:8080/api/auth/refresh",
          {},
          { withCredentials: true }
        );

        const { default: useAuthStore } = await import("../store/useAuthStore");
        useAuthStore.getState().setAccessToken(data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // Cookie expired or missing → force logout
        const { default: useAuthStore } = await import("../store/useAuthStore");
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
