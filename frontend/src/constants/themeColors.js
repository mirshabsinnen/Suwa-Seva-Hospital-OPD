import { StyleSheet } from 'react-native';

export const Colors = {
  primary: '#005A71',           // Primary Deep Medical Teal
  primaryHover: '#00495C',
  primaryLight: '#E6F0F2',      // Very subtle teal tint for cards/chips
  primarySubtle: '#F0F6F8',
  primaryBorder: 'rgba(0, 90, 113, 0.15)',

  // Clean Medical Palette - white backgrounds
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',        // Secondary clean crisp background
  card: '#FFFFFF',
  border: '#E8ECEF',
  borderLight: '#F1F4F6',

  // Typography
  text: '#0F2A38',
  textSecondary: '#5A6E7C',
  textMuted: '#8E9DA8',
  textWhite: '#FFFFFF',

  // Status Indicators (Clinical Standard)
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  info: '#0284C7',
  infoLight: '#F0F9FF',
};

export const Shadows = {
  soft: {
    shadowColor: '#005A71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#005A71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
  glow: {
    shadowColor: '#005A71',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
};

export const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  secondaryBtnText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
