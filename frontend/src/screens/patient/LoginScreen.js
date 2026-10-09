import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

const THEME = '#0a3d62';

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message);
  }
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const { login } = useContext(AuthContext);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const onPressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      shake();
      showAlert('Missing Fields', 'Please enter both email and password.');
      return;
    }
    setLocalLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      shake();
      showAlert('Login Failed', error.toString());
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Top Decoration */}
          <View style={styles.topDecor}>
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
          </View>

          {/* Logo & Branding */}
          <View style={styles.brandArea}>
            <View style={styles.logoCircle}>
              <Ionicons name="medical" size={40} color="#fff" />
            </View>
            <Text style={styles.appName}>Suwa Seva</Text>
            <Text style={styles.appTagline}>Hospital OPD Management</Text>
          </View>

          {/* Card */}
          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>Sign in to continue</Text>

            {/* Email */}
            <View style={[styles.inputGroup, emailFocused && styles.inputGroupFocused]}>
              <Ionicons name="mail-outline" size={18} color={emailFocused ? THEME : '#95a5a6'} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#bdc3c7"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            {/* Password */}
            <View style={[styles.inputGroup, passFocused && styles.inputGroupFocused]}>
              <Ionicons name="lock-closed-outline" size={18} color={passFocused ? THEME : '#95a5a6'} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#bdc3c7"
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#95a5a6" />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.loginBtn, localLoading && { opacity: 0.75 }]}
                onPress={handleLogin}
                disabled={localLoading}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={1}
              >
                {localLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.loginBtnText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Register Link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Create one</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Footer */}
          <Text style={styles.footer}>Suwa Seva • Secure Healthcare Platform</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f4f8' },
  scroll: { flexGrow: 1, paddingBottom: 40 },

  topDecor: { position: 'relative', height: 0 },
  decorCircle1: {
    position: 'absolute', top: -40, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: THEME + '12',
  },
  decorCircle2: {
    position: 'absolute', top: 60, right: 40,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: THEME + '08',
  },

  brandArea: { alignItems: 'center', paddingTop: 70, paddingBottom: 36 },
  logoCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: THEME,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 18,
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  appName: { fontSize: 32, fontWeight: '900', color: THEME, letterSpacing: 0.5 },
  appTagline: { fontSize: 14, color: '#7f8c8d', marginTop: 4, fontWeight: '500' },

  card: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  cardTitle: { fontSize: 26, fontWeight: '800', color: '#1a2b3c', marginBottom: 4 },
  cardSub: { fontSize: 14, color: '#95a5a6', marginBottom: 28, fontWeight: '500' },

  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2eaf2',
    marginBottom: 16,
    paddingHorizontal: 14,
    transition: 'border-color 0.2s',
  },
  inputGroupFocused: {
    borderColor: THEME,
    backgroundColor: '#f0f5fb',
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#2c3e50', paddingVertical: 14 },
  eyeBtn: { padding: 6 },

  loginBtn: {
    backgroundColor: THEME,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },

  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  registerText: { color: '#7f8c8d', fontSize: 14 },
  registerLink: { color: THEME, fontSize: 14, fontWeight: '700' },

  footer: { textAlign: 'center', color: '#bdc3c7', fontSize: 12, marginTop: 28 },
});

export default LoginScreen;
