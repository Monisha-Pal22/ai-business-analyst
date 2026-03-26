import axios from "axios";

// Auto-switch: use local backend when running locally, Railway when deployed
const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";

const api = axios.create({
  baseURL: isLocal
    ? "http://127.0.0.1:8000/api"
    : "https://ai-business-analyst-production.up.railway.app/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
