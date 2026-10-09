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
import HospitalSvgIcon from '../../components/HospitalSvgIcon';
import { PulseView } from '../../components/MedicalAnimations';

const THEME = '#005A71';

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
              <HospitalSvgIcon size={38} color="#fff" />
            </View>
            <Text style={styles.appName}>Suwa Seva</Text>
            <Text style={styles.appTagline}>Hospital OPD Management</Text>
          </View>

          {/* Card */}
          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>Sign in to continue</Text>

            {/* Email */}
            <View collapsable={false} style={[styles.inputGroup, emailFocused && styles.inputGroupFocused]}>
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
            <View collapsable={false} style={[styles.inputGroup, passFocused && styles.inputGroupFocused]}>
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
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flexGrow: 1, paddingBottom: 40, backgroundColor: '#FFFFFF' },

  topDecor: { position: 'relative', height: 0 },
  decorCircle1: {
    position: 'absolute', top: -40, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(0, 90, 113, 0.04)',
  },
  decorCircle2: {
    position: 'absolute', top: 60, right: 40,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(0, 90, 113, 0.06)',
  },

  brandArea: { alignItems: 'center', paddingTop: 60, paddingBottom: 32 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: THEME,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: { fontSize: 30, fontWeight: '900', color: '#0F2A38', letterSpacing: 0.5 },
  appTagline: { fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: '500' },

  card: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: { fontSize: 24, fontWeight: '800', color: '#0F2A38', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#64748B', marginBottom: 24, fontWeight: '500' },

  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    paddingHorizontal: 14,
  },
  inputGroupFocused: {
    borderColor: THEME,
    backgroundColor: '#FFFFFF',
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#0F2A38', paddingVertical: 14 },
  eyeBtn: { padding: 6 },

  loginBtn: {
    backgroundColor: THEME,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    shadowColor: THEME,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  registerText: { color: '#64748B', fontSize: 14 },
  registerLink: { color: THEME, fontSize: 14, fontWeight: '700' },

  footer: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 28 },
});

export default LoginScreen;
