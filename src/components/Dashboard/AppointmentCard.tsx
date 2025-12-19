/**
 * AppointmentCard Component
 *
 * Displays appointment information for pet owners in a compact, visually appealing card.
 * Can show both upcoming and past appointments with different styling.
 *
 * Features:
 * - Prominent display for upcoming appointments
 * - Compact display for past appointments
 * - Status indicators (pending, confirmed, completed, cancelled)
 * - Action buttons (view details, cancel, rebook)
 * - Warm professional design with blue/terracotta colors
 *
 * Usage:
 * ```tsx
 * <AppointmentCard
 *   appointment={appointment}
 *   variant="upcoming"
 *   onPress={() => handlePress(appointment.id)}
 * />
 * ```
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

/**
 * Appointment interface
 */
export interface AppointmentData {
  id: number;
  clinicName: string;
  clinicLogo?: string;
  clinicAddress?: string;
  date: string;  // e.g., "Dec 25, 2024"
  time: string;  // e.g., "10:00 AM"
  petName: string;
  service: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price?: number;
}

/**
 * Props interface
 */
export interface AppointmentCardProps {
  appointment: AppointmentData;
  variant?: 'upcoming' | 'past' | 'compact';
  onPress?: () => void;
  onCancel?: () => void;
  onRebook?: () => void;
}

/**
 * AppointmentCard Component
 */
export const AppointmentCard = ({
  appointment,
  variant = 'upcoming',
  onPress,
  onCancel,
  onRebook,
}: AppointmentCardProps) => {
  const statusConfig = {
    pending: {
      color: theme.colors.warning.main,
      bg: theme.colors.warning[100],
      border: theme.colors.warning[300],
      icon: 'time-outline' as const,
      label: 'Pending',
    },
    confirmed: {
      color: theme.colors.primary.main,
      bg: theme.colors.primary[100],
      border: theme.colors.primary[300],
      icon: 'checkmark-circle-outline' as const,
      label: 'Confirmed',
    },
    completed: {
      color: theme.colors.success.main,
      bg: theme.colors.success[100],
      border: theme.colors.success[300],
      icon: 'checkmark-done-outline' as const,
      label: 'Completed',
    },
    cancelled: {
      color: theme.colors.neutral[600],
      bg: theme.colors.neutral[100],
      border: theme.colors.neutral[300],
      icon: 'close-circle-outline' as const,
      label: 'Cancelled',
    },
  };

  const config = statusConfig[appointment.status];

  /**
   * Render upcoming appointment (prominent card)
   */
  if (variant === 'upcoming') {
    return (
      <TouchableOpacity
        style={[styles.card, styles.upcomingCard]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: config.bg, borderBottomColor: config.border }]}>
          <Ionicons name={config.icon} size={18} color={config.color} />
          <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
        </View>

        {/* Clinic Info */}
        <View style={styles.clinicSection}>
          {appointment.clinicLogo ? (
            <Image source={{ uri: appointment.clinicLogo }} style={styles.clinicLogo} />
          ) : (
            <View style={styles.clinicLogoPlaceholder}>
              <MaterialCommunityIcons name="hospital-building" size={32} color={theme.colors.primary.main} />
            </View>
          )}

          <View style={styles.clinicInfo}>
            <Text style={styles.clinicName}>{appointment.clinicName}</Text>
            {appointment.clinicAddress && (
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={14} color={theme.colors.neutral[600]} />
                <Text style={styles.clinicAddress} numberOfLines={1}>{appointment.clinicAddress}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Appointment Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary.main} />
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{appointment.date}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={theme.colors.primary.main} />
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{appointment.time}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="paw" size={20} color={theme.colors.primary.main} />
            <Text style={styles.detailLabel}>Pet:</Text>
            <Text style={styles.detailValue}>{appointment.petName}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="medical-bag" size={20} color={theme.colors.primary.main} />
            <Text style={styles.detailLabel}>Service:</Text>
            <Text style={styles.detailValue}>{appointment.service}</Text>
          </View>

          {appointment.price && (
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={20} color={theme.colors.accent.main} />
              <Text style={styles.detailLabel}>Price:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.accent.main, fontWeight: '700' }]}>
                ${appointment.price}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {appointment.status === 'confirmed' && onCancel && (
          <Button
            mode="outlined"
            onPress={onCancel}
            style={styles.cancelButton}
            textColor={theme.colors.error.main}
            icon={() => <Ionicons name="close-circle-outline" size={18} color={theme.colors.error.main} />}
          >
            Cancel Appointment
          </Button>
        )}
      </TouchableOpacity>
    );
  }

  /**
   * Render past or compact appointment (smaller card)
   */
  return (
    <TouchableOpacity
      style={[styles.card, styles.compactCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.compactHeader}>
        <View style={[styles.compactStatusDot, { backgroundColor: config.color }]} />
        <Text style={styles.compactDate}>{appointment.date}</Text>
        <Text style={styles.compactTime}>{appointment.time}</Text>
      </View>

      <View style={styles.compactBody}>
        <View style={styles.compactMain}>
          <Text style={styles.compactClinicName} numberOfLines={1}>{appointment.clinicName}</Text>
          <Text style={styles.compactService} numberOfLines={1}>
            {appointment.service} • {appointment.petName}
          </Text>
        </View>

        {variant === 'past' && appointment.status === 'completed' && onRebook && (
          <Button
            mode="outlined"
            compact
            onPress={onRebook}
            style={styles.rebookButton}
            textColor={theme.colors.primary.main}
            icon={() => <Ionicons name="refresh-outline" size={16} color={theme.colors.primary.main} />}
          >
            Rebook
          </Button>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    overflow: 'hidden',
  },
  upcomingCard: {
    ...theme.shadows.md,
  },
  compactCard: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
  },
  statusLabel: {
    ...theme.typography.bodyMedium,
    fontWeight: '700',
  },
  clinicSection: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  clinicLogo: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.neutral[100],
  },
  clinicLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary[300],
  },
  clinicInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  clinicName: {
    ...theme.typography.h4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  clinicAddress: {
    ...theme.typography.bodySmall,
    color: theme.colors.neutral[600],
    flex: 1,
  },
  detailsSection: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  detailLabel: {
    ...theme.typography.bodyMedium,
    color: theme.colors.neutral[600],
    width: 60,
  },
  detailValue: {
    ...theme.typography.bodyMedium,
    fontWeight: '600',
    color: theme.colors.neutral[900],
    flex: 1,
  },
  cancelButton: {
    margin: theme.spacing.lg,
    marginTop: 0,
    borderColor: theme.colors.error.main,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  compactStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactDate: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.neutral[700],
  },
  compactTime: {
    ...theme.typography.bodySmall,
    color: theme.colors.neutral[500],
  },
  compactBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  compactMain: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  compactClinicName: {
    ...theme.typography.bodyMedium,
    fontWeight: '600',
    color: theme.colors.neutral[900],
  },
  compactService: {
    ...theme.typography.bodySmall,
    color: theme.colors.neutral[600],
  },
  rebookButton: {
    borderColor: theme.colors.primary.main,
  },
});
