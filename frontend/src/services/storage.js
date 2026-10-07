/**
 * Cross-platform storage utility.
 * - On web: uses localStorage (AsyncStorage native module is null on web)
 * - On Android/iOS: uses @react-native-async-storage/async-storage
 */
import { Platform } from 'react-native';

const storage = {
  getItem: async (key) => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn(`storage.getItem(${key}) failed:`, e.message);
      return null;
    }
  },

  setItem: async (key, value) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn(`storage.setItem(${key}) failed:`, e.message);
    }
  },

  removeItem: async (key) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return;
      }
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn(`storage.removeItem(${key}) failed:`, e.message);
    }
  },
};

export default storage;
