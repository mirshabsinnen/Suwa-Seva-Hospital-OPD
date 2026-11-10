import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import storage from './storage';

// ─── API URL resolution ────────────────────────────────────────────────────────
// Priority 1: explicit env var baked in at build time (EXPO_PUBLIC_API_URL).
// Priority 2: Metro host auto-detect (LAN / USB dev sessions via Expo Go).
// Priority 3: Hardcoded LAN fallback for standalone APK builds where the env
//             var was not embedded — avoids a synchronous throw that would
//             freeze the splash screen before React can mount.
const HARDCODED_LAN_FALLBACK = 'http://192.168.1.4:5002/api';

const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
const apiHost = Platform.OS === 'web' ? (typeof window !== 'undefined' ? window.location.hostname : null) : metroHost;
const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_URL = configuredUrl
  ? configuredUrl.replace(/\/+$/, '')
  : apiHost && !apiHost.endsWith('.exp.direct')
    ? `http://${apiHost}:5002/api`
    : HARDCODED_LAN_FALLBACK;

// Log which URL is being used (visible in Metro / device logs).
console.log('[API] Base URL:', API_URL);

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

// Response interceptor: surface network errors clearly instead of crashing.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.warn('[API] Network error — is the backend running at', API_URL, '?');
    }
    return Promise.reject(error);
  }
);

export default api;
