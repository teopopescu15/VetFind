/**
 * StatCard Component
 *
 * Displays a single statistic in a card format with an icon, value, and label.
 * Used for dashboard metrics like appointments count, average rating, growth percentage.
 *
 * Features:
 * - Icon with customizable color
 * - Large value display
 * - Descriptive label
 * - Optional trend indicator (up/down/neutral)
 * - Loading state support
 * - Warm professional design
 *
 * Usage:
 * ```tsx
 * <StatCard
 *   icon="calendar"
 *   iconColor="#3b82f6"
 *   value="12"
 *   label="Weekly Appointments"
 *   trend="up"
 *   trendValue="+15%"
 * />
 * ```
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

/**
 * Props interface
 */
export interface StatCardProps {
  icon: string;
  iconLibrary?: 'Ionicons' | 'MaterialCommunityIcons';
  iconColor?: string;
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;  // e.g., "+15%", "-5%"
  isLoading?: boolean;
  onPress?: () => void;
}

/**
 * StatCard Component
 */
export const StatCard = ({
  icon,
  iconLibrary = 'Ionicons',
  iconColor = theme.colors.primary.main,
  value,
  label,
  trend,
  trendValue,
  isLoading = false,
}: StatCardProps) => {
  const IconComponent = iconLibrary === 'Ionicons' ? Ionicons : MaterialCommunityIcons;

  const trendConfig = {
    up: { color: theme.colors.success.main, icon: 'trending-up-outline' as const },
    down: { color: theme.colors.error.main, icon: 'trending-down-outline' as const },
    neutral: { color: theme.colors.neutral[600], icon: 'remove-outline' as const },
  };

  return (
    <View style={styles.container}>
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <IconComponent name={icon as any} size={28} color={iconColor} />
      </View>

      {/* Value */}
      {isLoading ? (
        <ActivityIndicator size="small" color={theme.colors.primary.main} style={styles.loader} />
      ) : (
        <Text style={styles.value}>{value}</Text>
      )}

      {/* Label */}
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>

      {/* Trend Indicator */}
      {trend && trendValue && !isLoading && (
        <View style={styles.trendContainer}>
          <Ionicons
            name={trendConfig[trend].icon}
            size={16}
            color={trendConfig[trend].color}
          />
          <Text style={[styles.trendValue, { color: trendConfig[trend].color }]}>
            {trendValue}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    ...theme.shadows.sm,
    minHeight: 140,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...theme.typography.h2,
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    lineHeight: 18,
  },
  loader: {
    marginVertical: theme.spacing.md,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.neutral[100],
  },
  trendValue: {
    ...theme.typography.caption,
    fontWeight: '700',
  },
});
