// api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // backend của bạn
});

// Gắn token vào header Authorization
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // <-- dùng backtick
  }
  return config;
});

export default API;
