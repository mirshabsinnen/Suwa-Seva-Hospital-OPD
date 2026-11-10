import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../../context/AuthContext';
import HospitalSvgIcon from '../HospitalSvgIcon';
import { HeartbeatDot } from '../MedicalAnimations';


/* =========================================================
   COLORS
========================================================= */

export const palette = {
  teal: '#005A71',
  navy: '#005A71',
  blue: '#2797BC',
  sky: '#77C8ED',

  ink: '#1A2B3C',
  muted: '#66788A',

  pale: '#F0F4F8',
  panel: '#EEF4FF',
  border: '#E4EBF2',

  green: '#16845B',
  amber: '#B56A12',
  red: '#C53F43',
};


/* =========================================================
   FORMAT HELPERS
========================================================= */

export const number = value =>
  value === null ||
  value === undefined ||
  !Number.isFinite(Number(value))
    ? '—'
    : Number(value).toLocaleString();


export const minutes = value =>
  value === null || value === undefined
    ? '—'
    : `${number(value)} min`;


export const percentage = value =>
  value === null || value === undefined
    ? '—'
    : `${number(value)}%`;


export const statusLabel = value =>
  ({
    waiting: 'Waiting',
    called: 'Called',
    serving: 'Serving',
    completed: 'Queue completed',

    Normal: 'Routine',
    Priority: 'Priority',
    Emergency: 'Emergency',
  }[value] || value);


/* =========================================================
   BADGE
========================================================= */

export function Badge({ children, tone = 'teal' }) {
  const color = palette[tone] || palette.teal;

  return (
    <View
      style={[
        ui.badge,
        {
          backgroundColor: `${color}12`,
        },
      ]}
    >
      <Text
        style={[
          ui.badgeText,
          {
            color,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

export function EmptyState({
  title,
  description,
  icon = 'file-tray-outline',
}) {
  return (
    <View style={ui.empty}>
      <Ionicons
        name={icon}
        size={30}
        color={palette.blue}
      />

      <Text style={ui.emptyTitle}>
        {title}
      </Text>

      {description ? (
        <Text style={[ui.caption, ui.emptyDescription]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}


/* =========================================================
   SECTION CARD
========================================================= */

export function SectionCard({
  title,
  subtitle,
  icon,
  children,
}) {
  return (
    <View style={ui.card}>
      <View style={ui.sectionHeading}>
        {icon ? (
          <Ionicons
            name={icon}
            size={17}
            color={palette.teal}
          />
        ) : null}

        <Text
          accessibilityRole="header"
          style={ui.sectionTitle}
        >
          {title}
        </Text>
      </View>

      {subtitle ? (
        <Text
          style={[
            ui.caption,
            {
              marginBottom: 14,
            },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}

      {children}
    </View>
  );
}


/* =========================================================
   METRIC CARD
========================================================= */

export function MetricCard({
  label,
  value,
  detail,
  icon = 'stats-chart-outline',
  tone = 'teal',
}) {
  const color = palette[tone] || palette.teal;

  return (
    <View
      style={ui.metric}
      accessible
      accessibilityLabel={`${label}: ${value}. ${detail || ''}`}
    >
      <View
        style={[
          ui.metricIcon,
          {
            backgroundColor: `${color}12`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={color}
        />
      </View>

      <Text style={ui.metricLabel}>
        {label}
      </Text>

      <Text
        style={[
          ui.metricValue,
          {
            color,
          },
        ]}
      >
        {value}
      </Text>

      {detail ? (
        <Text style={ui.metricDetail}>
          {detail}
        </Text>
      ) : null}
    </View>
  );
}


/* =========================================================
   STAT ROW
========================================================= */

export function StatRow({
  label,
  value,
  tone = 'ink',
}) {
  const valueColor = palette[tone] || palette.ink;

  return (
    <View style={ui.statRow}>
      <Text style={ui.rowLabel}>
        {label}
      </Text>

      <Text
        style={[
          ui.rowValue,
          {
            color: valueColor,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}


/* =========================================================
   ACTION BUTTON
========================================================= */

export function ActionButton({
  label,
  onPress,
  icon = 'share-outline',
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={ui.button}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={18}
        color="#FFFFFF"
      />

      <Text style={ui.buttonText}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}


/* =========================================================
   MISSING SOURCES
========================================================= */

export function MissingSources({
  feedback,
  consultation,
}) {
  return (
    <>
      <SectionCard
        title="Citizen feedback"
        icon="chatbubbles-outline"
        subtitle="Patient experience & recent comments"
      >
        <EmptyState
          title="No patient feedback available yet."
          description={
            feedback?.available
              ? 'No responses for this period.'
              : 'Feedback analytics will appear when the feedback data source is available.'
          }
          icon="chatbubble-ellipses-outline"
        />
      </SectionCard>

      <SectionCard
        title="Consultation analytics"
        icon="medkit-outline"
      >
        <EmptyState
          title="Consultation data unavailable"
          description={
            consultation?.available
              ? 'No consultation records for this period.'
              : 'Consultation analytics will appear when consultation records are available.'
          }
        />
      </SectionCard>
    </>
  );
}


/* =========================================================
   MAIN SCREEN WRAPPER
========================================================= */

export function Screen({
  title,
  subtitle,
  resource,
  children,
  live = false,
  hasHeader = false,
  hero,
  filters,
}) {
  const { logout } = useContext(AuthContext);

  const {
    data,
    loading,
    refreshing,
    error,
    refresh,
  } = resource;


  return (
    <SafeAreaView
      edges={
        hasHeader
          ? ['left', 'right']
          : ['top', 'left', 'right']
      }
      style={ui.safe}
    >
      {/* =====================================================
          TOP APPLICATION HEADER
      ===================================================== */}

      <View style={ui.header}>
        <View style={ui.brandIcon}>
          <HospitalSvgIcon
            size={22}
            color="#FFFFFF"
          />
        </View>

        <View style={ui.brandWrapper}>
          <Text style={ui.brand}>
            SuwaSeva{' '}
            <Text style={ui.brandTag}>
              HIO / ANALYTICS
            </Text>
          </Text>

          <Text style={ui.brandSub}>
            Government Hospital OPD
          </Text>
        </View>

        <TouchableOpacity
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={ui.iconButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color={palette.teal}
          />
        </TouchableOpacity>
      </View>


      {/* =====================================================
          SCROLLABLE CONTENT
      ===================================================== */}

      <ScrollView
        contentContainerStyle={ui.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing && !loading}
            onRefresh={refresh}
            tintColor={palette.teal}
            colors={[palette.teal]}
          />
        }
      >

        {/* ===================================================
            CUSTOM HERO OR DEFAULT HERO

            Dashboard can provide:
            <Screen hero={hero} ... />

            Queue / Performance / Reports will automatically
            receive the default hero below.
        =================================================== */}

        {hero !== undefined ? (
          hero
        ) : (
          <View style={ui.hero}>
            <View style={ui.heroTop}>
              <Badge>
                HIO TERMINAL
              </Badge>

              <Badge
                tone={live ? 'green' : 'teal'}
              >
                {live
                  ? 'Auto-refresh • 30s'
                  : 'Operational overview'}
              </Badge>
            </View>

            <Text
              accessibilityRole="header"
              style={ui.title}
            >
              {title}
            </Text>

            {subtitle ? (
              <Text style={ui.caption}>
                {subtitle}
              </Text>
            ) : null}

            {data?.generatedAt ? (
              <Text style={ui.timestamp}>
                Updated{' '}
                {new Date(
                  data.generatedAt
                ).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                • Asia/Colombo
              </Text>
            ) : null}
          </View>
        )}


        {/* ===================================================
            API ERROR
        =================================================== */}

        {error ? (
          <View
            accessibilityRole="alert"
            style={ui.error}
          >
            <View style={ui.errorHeader}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={palette.red}
              />

              <Text style={ui.errorTitle}>
                Unable to refresh data
              </Text>
            </View>

            <Text style={ui.errorText}>
              {error}
            </Text>

            {data ? (
              <Text style={ui.caption}>
                Showing the last successful response.
              </Text>
            ) : null}

            <ActionButton
              label="Try again"
              icon="refresh-outline"
              onPress={refresh}
            />
          </View>
        ) : null}


        {/* ===================================================
            LOADING / SCREEN CONTENT
        =================================================== */}

        {filters}
        {loading && !data ? (
          <View style={ui.loading}>
            <ActivityIndicator
              color={palette.teal}
              size="large"
            />

            <Text style={ui.caption}>
              Loading HIO data…
            </Text>
          </View>
        ) : (
          children
        )}


        {/* ===================================================
            FOOTER
        =================================================== */}

        <View style={ui.footer}>
          <HeartbeatDot color={palette.teal} size={7} />

          <Text style={[ui.footerText, { marginLeft: 6 }]}>
            Live monitoring • SuwaSeva HIO
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}


/* =========================================================
   STYLES
========================================================= */

export const ui = StyleSheet.create({

  /* Main screen */

  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },


  /* Header */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    backgroundColor: '#FFFFFF',
  },

  brandIcon: {
    backgroundColor: palette.teal,
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandWrapper: {
    flex: 1,
  },

  brand: {
    color: palette.navy,
    fontSize: 17,
    fontWeight: '800',
  },

  brandTag: {
    color: palette.teal,
    fontSize: 10,
    fontWeight: '700',
  },

  brandSub: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 2,
  },

  iconButton: {
    padding: 8,
    borderRadius: 20,
  },


  /* Main content */

  content: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    gap: 16,
    paddingBottom: 32,
    flexGrow: 1,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },


  /* Default hero */

  hero: {
    backgroundColor: palette.panel,
    padding: 17,
    borderRadius: 16,
    gap: 8,
  },

  heroTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  title: {
    color: palette.ink,
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 30,
  },

  caption: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 19,
  },

  timestamp: {
    color: palette.teal,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },


  /* Badge */

  badge: {
    alignSelf: 'flex-start',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },


  /* Generic section card */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,

    borderWidth: 1,
    borderColor: '#EDF1F6',

    shadowColor: palette.navy,
    shadowOpacity: 0.035,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 6,

    elevation: 1,
  },

  sectionHeading: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 15,
    color: palette.ink,
    fontWeight: '700',
    flex: 1,
  },


  /* Metric cards */

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  metric: {
    flexGrow: 1,
    flexBasis: '45%',

    backgroundColor: '#FFFFFF',

    borderRadius: 16,
    padding: 15,

    borderWidth: 1,
    borderColor: '#EDF1F6',
  },

  metricIcon: {
    height: 33,
    width: 33,
    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 10,
  },

  metricLabel: {
    fontSize: 12,
    color: palette.muted,
    lineHeight: 18,
  },

  metricValue: {
    fontSize: 27,
    fontWeight: '800',
    marginVertical: 5,
  },

  metricDetail: {
    fontSize: 10,
    lineHeight: 16,
    color: palette.muted,
  },


  /* Stat row */

  statRow: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 11,

    borderBottomWidth: 1,
    borderBottomColor: '#F1F4F7',

    gap: 12,
  },

  rowLabel: {
    flex: 1,
    color: palette.muted,
    fontSize: 13,
  },

  rowValue: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',

    flexShrink: 1,
    maxWidth: '60%',

    textAlign: 'right',
  },


  /* Empty state */

  empty: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    gap: 8,
  },

  emptyTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  emptyDescription: {
    textAlign: 'center',
  },


  /* Button */

  button: {
    backgroundColor: palette.teal,

    borderRadius: 11,

    paddingHorizontal: 14,
    paddingVertical: 13,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    marginTop: 8,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },


  /* Error */

  error: {
    backgroundColor: '#FFF0EF',

    borderRadius: 14,

    padding: 16,

    borderWidth: 1,
    borderColor: '#F8D4D4',

    gap: 8,
  },

  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  errorTitle: {
    color: palette.red,
    fontSize: 13,
    fontWeight: '700',
  },

  errorText: {
    color: '#A12C33',
    fontSize: 13,
    lineHeight: 20,
  },


  /* Loading */

  loading: {
    padding: 40,
    alignItems: 'center',
    gap: 14,
  },


  /* Footer */

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    paddingVertical: 10,
  },

  liveDot: {
    height: 6,
    width: 6,
    borderRadius: 3,

    backgroundColor: palette.green,
  },

  footerText: {
    color: palette.muted,
    fontSize: 10,
  },


  /* Info note */

  note: {
    padding: 13,
    borderRadius: 10,

    backgroundColor: palette.panel,

    marginTop: 12,
  },

});
