import axios from "axios";

export const API_URL = "https://api.alpha-code.site/api/v1";

export const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// optional: interceptor để log lỗi hoặc tự động refresh token
http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);
