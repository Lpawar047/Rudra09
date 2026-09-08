/// <reference types="vite/client" />
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT bearer token & preserve FormData content-type for multipart upload
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rudra_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If request payload is FormData, delete default application/json Content-Type
  // so browser/Axios automatically sets 'multipart/form-data; boundary=...'
  if (config.data instanceof FormData && config.headers) {
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
      config.headers.delete('content-type');
    } else {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle global 401 unauthenticated response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('rudra_token');
      localStorage.removeItem('rudra_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
