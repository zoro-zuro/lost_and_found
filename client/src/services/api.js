import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000'),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
  return `${baseURL}${imagePath}`;
};

export default API;
