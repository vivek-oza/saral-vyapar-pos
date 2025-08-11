import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (email, password) => {
  return api.post("/auth/login", { email, password });
};

export const signupUser = async (email, password) => {
  return api.post("/auth/signup", { email, password });
};

export const validateToken = async () => {
  return api.get("/auth/validate");
};

// Get current authenticated user (includes profile and shop)
export const getCurrentUser = async () => {
  return api.get("/auth/me");
};

export const forgotPassword = async (email) => {
  return api.post("/auth/forgot-password", { email });
};

export const resetPassword = async (token, password) => {
  return api.post("/auth/reset-password", { token, password });
};

export const validateResetToken = async (token) => {
  return api.post("/auth/validate-reset-token", { token });
};

export default api;
