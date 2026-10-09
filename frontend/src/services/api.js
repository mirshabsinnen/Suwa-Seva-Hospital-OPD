import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import storage from './storage';

// LAN follows Metro's current host; USB uses localhost with port 5002 reversed.
// A tunnel only forwards Metro, so it requires an explicit reachable backend URL.
const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
const apiHost = Platform.OS === 'web' ? window.location.hostname : metroHost;
const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
export const API_URL = configuredUrl
  ? configuredUrl.replace(/\/+$/, '')
  : apiHost && !apiHost.endsWith('.exp.direct')
    ? `http://${apiHost}:5002/api`
    : null;

if (!API_URL) {
  throw new Error('Set EXPO_PUBLIC_API_URL to a reachable backend URL, or start Expo using LAN/USB.');
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
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
