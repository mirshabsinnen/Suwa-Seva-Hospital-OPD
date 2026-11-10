import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ToastContext = createContext(null);

const TOAST_TYPES = {
  success: { bg: '#059669', icon: 'checkmark-circle', border: '#047857' },
  error:   { bg: '#DC2626', icon: 'close-circle',     border: '#B91C1C' },
  warning: { bg: '#D97706', icon: 'warning',           border: '#B45309' },
  info:    { bg: '#005A71', icon: 'information-circle', border: '#004558' },
};

let toastQueue = [];

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback(({ message, title, type = 'success', duration = 3500 }) => {
    const id = ++idRef.current;
    const anim = new Animated.Value(0);

    const toast = { id, message, title, type, anim };
    setToasts(prev => [...prev, toast]);

    // Slide in
    Animated.spring(anim, {
      toValue: 1,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();

    // Auto dismiss
    setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      });
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    const toast = toasts.find(t => t.id === id);
    if (!toast) return;
    Animated.timing(toast.anim, {
      toValue: 0, duration: 250, useNativeDriver: true,
    }).start(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    });
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map(toast => {
          const cfg = TOAST_TYPES[toast.type] || TOAST_TYPES.success;
          const translateY = toast.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [-80, 0],
          });
          const opacity = toast.anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 1],
          });
          return (
            <Animated.View
              key={toast.id}
              style={[
                styles.toast,
                { backgroundColor: cfg.bg, borderLeftColor: cfg.border },
                { transform: [{ translateY }], opacity },
              ]}
            >
              <Ionicons name={cfg.icon} size={22} color="#fff" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                {toast.title ? (
                  <Text style={styles.toastTitle}>{toast.title}</Text>
                ) : null}
                <Text style={styles.toastMessage}>{toast.message}</Text>
              </View>
              <TouchableOpacity onPress={() => dismiss(toast.id)} style={{ padding: 4 }}>
                <Ionicons name="close" size={16} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 16,
    right: 14,
    zIndex: 9999,
    maxWidth: 320,
    width: '90%',
    alignSelf: 'flex-end',
    pointerEvents: 'box-none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  toastTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 2,
  },
  toastMessage: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
