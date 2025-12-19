/**
 * ResponsiveLayout Component
 *
 * Responsive wrapper component that provides consistent responsive behavior.
 * Automatically adjusts padding, margins, and layout based on screen size.
 *
 * Usage:
 * ```typescript
 * import { ResponsiveLayout } from '@/components/ResponsiveLayout';
 *
 * const MyScreen = () => (
 *   <ResponsiveLayout maxWidth={1200} centered>
 *     <Text>Content here</Text>
 *   </ResponsiveLayout>
 * );
 * ```
 */

import * as React from 'react';
import { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ResponsiveLayoutProps {
  children: ReactNode;
  /**
   * Apply responsive padding to the container
   * Default: true
   */
  applyPadding?: boolean;
  /**
   * Center content horizontally
   * Default: false
   */
  centered?: boolean;
  /**
   * Maximum width for content (useful on desktop)
   * Default: undefined (full width)
   */
  maxWidth?: number;
  /**
   * Background color
   * Default: undefined (transparent)
   */
  backgroundColor?: string;
  /**
   * Additional custom styles
   */
  style?: ViewStyle;
  /**
   * Use safe area padding for notched devices
   * Default: false
   */
  useSafeArea?: boolean;
}

/**
 * ResponsiveLayout Component
 * Factory function pattern for object-literal compliance
 */
export const ResponsiveLayout = ({
  children,
  applyPadding = true,
  centered = false,
  maxWidth,
  backgroundColor,
  style,
  useSafeArea = false,
}: ResponsiveLayoutProps) => {
  const { responsive, colors } = useTheme();

  const containerStyles: ViewStyle = {
    flex: 1,
    backgroundColor: backgroundColor || colors.transparent,
    ...(applyPadding && { padding: responsive.padding }),
    ...(centered && { alignItems: 'center' }),
  };

  const contentWrapperStyles: ViewStyle = {
    flex: 1,
    width: '100%',
    ...(maxWidth && responsive.isDesktop && { maxWidth }),
  };

  const safeAreaStyles: ViewStyle = useSafeArea
    ? {
        paddingTop: responsive.safePadding.top,
        paddingBottom: responsive.safePadding.bottom,
      }
    : {};

  return (
    <View style={[styles.container, containerStyles, safeAreaStyles, style]}>
      {maxWidth && responsive.isDesktop ? (
        <View style={contentWrapperStyles}>{children}</View>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
