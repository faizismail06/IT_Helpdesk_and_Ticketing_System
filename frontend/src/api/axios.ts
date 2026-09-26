import axios from 'axios';

export const api = axios.create({
 baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1',
 headers: {
 'Content-Type': 'application/json',
 },
});

// Inject JWT token into every outgoing request
api.interceptors.request.use(
 (config) => {
 const token = localStorage.getItem('token');
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
 },
 (error) => Promise.reject(error)
);

// Global response interceptor for auth errors
api.interceptors.response.use(
 (response) => response,
 (error) => {
 if (error.response?.status === 401) {
 // Clear token if unauthorized / token expired
 localStorage.removeItem('token');
 if (window.location.pathname !== '/login') {
 window.location.href = '/login';
 }
 }
 return Promise.reject(error);
 }
);
