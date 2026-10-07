import React, { createContext, useState, useEffect } from 'react';
import storage from '../services/storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.token) {
        setUserInfo(response.data);
        setUserToken(response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        await storage.setItem('userToken', response.data.token);
        await storage.setItem('userInfo', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data && response.data.token) {
        setUserInfo(response.data);
        setUserToken(response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        await storage.setItem('userToken', response.data.token);
        await storage.setItem('userInfo', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      // For this prototype, we'll update the local state.
      // In a real app, you would make an API call: await api.patch('/auth/profile', updatedData);
      const newUserInfo = { ...userInfo, ...updatedData };
      setUserInfo(newUserInfo);
      await storage.setItem('userInfo', JSON.stringify(newUserInfo));
      return newUserInfo;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update profile';
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.patch('/auth/password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update password';
    }
  };

  const logout = async () => {
    try {
      setUserToken(null);
      setUserInfo(null);
      delete api.defaults.headers.common['Authorization'];
      await storage.removeItem('userToken');
      await storage.removeItem('userInfo');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      const token = await storage.getItem('userToken');
      const info = await storage.getItem('userInfo');
      if (token && info) {
        setUserToken(token);
        setUserInfo(JSON.parse(info));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      console.log('isLoggedIn error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      login, logout, register, updateProfile, updatePassword, 
      isLoading, userToken, userInfo 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
