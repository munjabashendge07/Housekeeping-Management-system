import axios from "axios";

// Determine the base API URL
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;
  if (!url) {
    url = import.meta.env.PROD
      ? "https://housekeeping-management-system-2.onrender.com/api"
      : "http://localhost:5000/api";
  }
  // Remove trailing slashes
  url = url.replace(/\/+$/, "");
  // Ensure /api suffix exists
  if (!url.endsWith("/api")) {
    url += "/api";
  }
  return url;
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor to add Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Handle both raw token and 'Bearer token' formats safely
      config.headers.Authorization = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid session
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/" && window.location.pathname !== "/register") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
