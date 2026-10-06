import axios from 'axios';
import storage from './storage';

// IMPORTANT: For Android emulator use 10.0.2.2 or your machine's IP address.
// For physical devices, use your computer's local IP (e.g., 192.168.1.10)
// For web browser, use localhost
export const API_URL = 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor: always attach JWT token from storage before each request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItem('userToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Could not read token from storage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
