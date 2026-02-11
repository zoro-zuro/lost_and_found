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
    console.log('API Request:', config.method?.toUpperCase(), config.url, 'with token');
  } else {
    console.log('API Request:', config.method?.toUpperCase(), config.url, 'NO TOKEN');
  }
  
  // Don't set Content-Type for FormData - let browser set it automatically
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Add response interceptor for global error handling
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    console.log('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      message: error.message,
      is401: error.response?.status === 401
    });
    
    // Handle 401 unauthorized globally ONLY
    if (error.response?.status === 401) {
      console.log('🚨 API 401 Error - Logging out user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else {
      // Log other errors for debugging
      console.log('⚠️ API Error (not 401):', error.response?.status, error.message);
    }
    return Promise.reject(error);
  }
);

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
  return `${baseURL}${imagePath}`;
};

export default API;
