/**
 * EmptyState - Reusable empty state component
 *
 * Features:
 * - Customizable icon, title, subtitle
 * - Optional CTA button
 * - Warm professional design (blue/terracotta palette from Redesign.md)
 * - Responsive sizing
 *
 * Usage:
 * <EmptyState
 *   icon="calendar-blank"
 *   title="No Appointments Yet"
 *   subtitle="Book your first appointment to get started"
 *   ctaText="Find a Clinic"
 *   onCtaPress={() => navigation.navigate('UserDashboard')}
 * />
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface EmptyStateProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  ctaText?: string;
  onCtaPress?: () => void;
  ctaIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export const EmptyState = ({
  icon,
  title,
  subtitle,
  ctaText,
  onCtaPress,
  ctaIcon,
}: EmptyStateProps) => {
  const { colors, responsive } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: responsive.padding,
          paddingVertical: responsive.getValue(48, 64, 80),
        },
      ]}
    >
      {/* Icon - Neutral Gray */}
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={icon}
          size={responsive.getValue(80, 96, 112)}
          color={colors.neutral[300]} // Light gray #d1d5db
        />
      </View>

      {/* Title */}
      <Text
        style={[
          styles.title,
          {
            color: colors.text.primary,
            fontSize: responsive.getValue(20, 24, 28),
          },
        ]}
      >
        {title}
      </Text>

      {/* Subtitle */}
      <Text
        style={[
          styles.subtitle,
          {
            color: colors.text.secondary,
            fontSize: responsive.getValue(14, 16, 18),
          },
        ]}
      >
        {subtitle}
      </Text>

      {/* CTA Button - Terracotta Accent */}
      {ctaText && onCtaPress && (
        <Button
          mode="contained"
          onPress={onCtaPress}
          style={styles.ctaButton}
          buttonColor={colors.accent.main} // #ea580c terracotta
          contentStyle={styles.ctaButtonContent}
          labelStyle={[
            styles.ctaButtonLabel,
            { fontSize: responsive.getValue(14, 16, 18) },
          ]}
          icon={ctaIcon}
        >
          {ctaText}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    maxWidth: '80%',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: '80%',
    lineHeight: 22,
  },
  ctaButton: {
    borderRadius: 12,
    minWidth: 200,
  },
  ctaButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  ctaButtonLabel: {
    fontWeight: '700',
  },
});

export default EmptyState;
