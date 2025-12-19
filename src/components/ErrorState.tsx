/**
 * ErrorState - User-friendly error display component
 *
 * Features:
 * - Customizable error messages
 * - Optional retry functionality
 * - Warm professional design (blue/terracotta palette from Redesign.md)
 * - Responsive sizing
 *
 * Usage:
 * <ErrorState
 *   title="Connection Error"
 *   message="Unable to load appointments. Please check your internet connection."
 *   onRetry={handleRetry}
 * />
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export const ErrorState = ({
  title = "Oops! Something went wrong",
  message,
  onRetry,
  retryText = "Try Again",
  icon = "alert-circle-outline",
}: ErrorStateProps) => {
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
      {/* Error Icon - Red */}
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={icon}
          size={responsive.getValue(80, 96, 112)}
          color={colors.error.main} // #ef4444 red
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

      {/* Error Message */}
      <Text
        style={[
          styles.message,
          {
            color: colors.text.secondary,
            fontSize: responsive.getValue(14, 16, 18),
          },
        ]}
      >
        {message}
      </Text>

      {/* Retry Button - Blue Primary */}
      {onRetry && (
        <Button
          mode="contained"
          onPress={onRetry}
          style={styles.retryButton}
          buttonColor={colors.primary.main} // #2563eb blue
          contentStyle={styles.retryButtonContent}
          labelStyle={[
            styles.retryButtonLabel,
            { fontSize: responsive.getValue(14, 16, 18) },
          ]}
          icon="refresh"
        >
          {retryText}
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
  message: {
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: '80%',
    lineHeight: 22,
  },
  retryButton: {
    borderRadius: 12,
    minWidth: 160,
  },
  retryButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryButtonLabel: {
    fontWeight: '700',
  },
});

export default ErrorState;
