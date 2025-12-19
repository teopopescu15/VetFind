/**
 * VetFinder Responsive Utilities
 *
 * Object-literal based responsive design helpers for adaptive layouts.
 * Provides breakpoints, device detection, and layout utilities.
 *
 * Usage:
 * ```typescript
 * import { responsive } from '@/theme/responsive';
 *
 * const cardColumns = responsive.cardColumns(); // 1, 2, or 3
 * const padding = responsive.padding(); // 16, 24, or 32
 *
 * if (responsive.isTablet()) {
 *   // Tablet-specific logic
 * }
 * ```
 */

import { Dimensions } from 'react-native';
import { theme } from './index';

/**
 * Get current screen dimensions
 */
const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

/**
 * Breakpoint definitions (pixels)
 */
export const breakpoints = {
  phone: 0,        // 0-767px
  tablet: 768,     // 768-1023px
  desktop: 1024,   // 1024px+
} as const;

/**
 * Responsive Utilities
 * Object-literal pattern for device detection and adaptive styling
 */
export const responsive = {
  /**
   * Breakpoint values (read-only)
   */
  breakpoints,

  /**
   * Get current screen width
   */
  getScreenWidth: (): number => {
    return getScreenDimensions().width;
  },

  /**
   * Get current screen height
   */
  getScreenHeight: (): number => {
    return getScreenDimensions().height;
  },

  /**
   * Check if current device is a phone (< 768px)
   */
  isPhone: (): boolean => {
    const { width } = getScreenDimensions();
    return width < breakpoints.tablet;
  },

  /**
   * Check if current device is a tablet (768px - 1023px)
   */
  isTablet: (): boolean => {
    const { width } = getScreenDimensions();
    return width >= breakpoints.tablet && width < breakpoints.desktop;
  },

  /**
   * Check if current device is desktop (>= 1024px)
   */
  isDesktop: (): boolean => {
    const { width } = getScreenDimensions();
    return width >= breakpoints.desktop;
  },

  /**
   * Check if screen is small phone (< 375px, like iPhone SE)
   */
  isSmallPhone: (): boolean => {
    const { width } = getScreenDimensions();
    return width < 375;
  },

  /**
   * Check if screen is large tablet/iPad Pro (>= 900px)
   */
  isLargeTablet: (): boolean => {
    const { width } = getScreenDimensions();
    return width >= 900 && width < breakpoints.desktop;
  },

  /**
   * Get device type as string
   */
  getDeviceType: (): 'phone' | 'tablet' | 'desktop' => {
    const { width } = getScreenDimensions();
    if (width >= breakpoints.desktop) return 'desktop';
    if (width >= breakpoints.tablet) return 'tablet';
    return 'phone';
  },

  /**
   * Get number of card columns based on screen size
   * Phone: 1 column
   * Tablet: 2 columns
   * Desktop: 3 columns
   */
  cardColumns: (): 1 | 2 | 3 => {
    const { width } = getScreenDimensions();
    if (width >= breakpoints.desktop) return 3;
    if (width >= breakpoints.tablet) return 2;
    return 1;
  },

  /**
   * Get adaptive padding based on screen size
   * Phone: 16px
   * Tablet: 24px
   * Desktop: 32px
   */
  padding: (): number => {
    const { width } = getScreenDimensions();
    if (width >= breakpoints.desktop) return theme.spacing['3xl']; // 32
    if (width >= breakpoints.tablet) return theme.spacing['2xl']; // 24
    return theme.spacing.lg; // 16
  },

  /**
   * Get adaptive margin based on screen size
   * Phone: 16px
   * Tablet: 24px
   * Desktop: 32px
   */
  margin: (): number => {
    return responsive.padding();
  },

  /**
   * Get adaptive gap/spacing based on screen size
   * Phone: 12px
   * Tablet: 16px
   * Desktop: 20px
   */
  gap: (): number => {
    const { width } = getScreenDimensions();
    if (width >= breakpoints.desktop) return theme.spacing.xl; // 20
    if (width >= breakpoints.tablet) return theme.spacing.lg; // 16
    return theme.spacing.md; // 12
  },

  /**
   * Get adaptive font size multiplier
   * Useful for scaling text on larger screens
   */
  fontSizeMultiplier: (): number => {
    const { width } = getScreenDimensions();
    if (width >= breakpoints.desktop) return 1.1;
    if (width >= breakpoints.tablet) return 1.05;
    return 1;
  },

  /**
   * Get adaptive card width for grid layouts
   * Returns percentage width as string
   */
  cardWidth: (): string => {
    const columns = responsive.cardColumns();
    return `${100 / columns}%`;
  },

  /**
   * Get number of time slot columns for appointment booking
   * Phone: 3 columns
   * Tablet: 4 columns
   * Desktop: 5 columns
   */
  timeSlotColumns: (): 3 | 4 | 5 => {
    const { width } = getScreenDimensions();
    if (width >= breakpoints.desktop) return 5;
    if (width >= breakpoints.tablet) return 4;
    return 3;
  },

  /**
   * Get calendar date card width
   * Phone: 68px
   * Tablet: 80px
   * Desktop: 92px
   */
  dateCardWidth: (): number => {
    return responsive.getValue(68, 80, 92);
  },

  /**
   * Get form input width for multi-column layouts
   * Phone: 100% (single column)
   * Tablet+: 48% (two columns side-by-side)
   */
  formInputWidth: (): string => {
    const { width } = getScreenDimensions();
    return width >= breakpoints.tablet ? '48%' : '100%';
  },

  /**
   * Check if device should use side-by-side form inputs
   */
  shouldUseSideBySideInputs: (): boolean => {
    return responsive.isTablet() || responsive.isDesktop();
  },

  /**
   * Get modal/sheet max width
   * Phone: 100% (full width)
   * Tablet: 600px (centered)
   * Desktop: 800px (centered)
   */
  modalMaxWidth: (): number | string => {
    const { width } = getScreenDimensions();
    if (width >= breakpoints.desktop) return 800;
    if (width >= breakpoints.tablet) return 600;
    return '100%';
  },

  /**
   * Get number of facility/payment method columns for checkboxes
   * Phone: 2 columns
   * Tablet+: 3 columns
   */
  checkboxGridColumns: (): 2 | 3 => {
    const { width } = getScreenDimensions();
    return width >= breakpoints.tablet ? 3 : 2;
  },

  /**
   * Get adaptive border radius
   * Larger screens can have slightly larger border radius for visual balance
   */
  adaptiveBorderRadius: (size: 'sm' | 'md' | 'lg' | 'xl' = 'md'): number => {
    const multiplier = responsive.fontSizeMultiplier();
    const baseRadius = theme.borderRadius[size];
    return Math.round(baseRadius * multiplier);
  },

  /**
   * Check if device is in landscape orientation
   */
  isLandscape: (): boolean => {
    const { width, height } = getScreenDimensions();
    return width > height;
  },

  /**
   * Check if device is in portrait orientation
   */
  isPortrait: (): boolean => {
    const { width, height } = getScreenDimensions();
    return height > width;
  },

  /**
   * Get safe padding for screens with notches/home indicators
   * Returns padding object for SafeAreaView equivalent
   * Enhanced with platform detection for web vs native
   */
  safePadding: () => {
    const isPhone = responsive.isPhone();
    return {
      top: isPhone ? 50 : 40,
      bottom: isPhone ? 34 : 24,
      left: 0,
      right: 0,
    };
  },

  /**
   * Utility to listen to dimension changes
   * Returns cleanup function
   */
  onDimensionChange: (callback: (dimensions: { width: number; height: number }) => void) => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      callback({ width: window.width, height: window.height });
    });

    // Return cleanup function
    return () => {
      subscription?.remove();
    };
  },

  /**
   * Get responsive value based on breakpoint
   * Utility function for custom responsive logic
   */
  getValue: <T>(phoneValue: T, tabletValue: T, desktopValue: T): T => {
    const { width } = getScreenDimensions();
    if (width >= breakpoints.desktop) return desktopValue;
    if (width >= breakpoints.tablet) return tabletValue;
    return phoneValue;
  },

  /**
   * Check if value matches current breakpoint
   */
  matchesBreakpoint: (breakpoint: 'phone' | 'tablet' | 'desktop'): boolean => {
    const deviceType = responsive.getDeviceType();
    return deviceType === breakpoint;
  },

  /**
   * Get responsive typography with scaled font sizes
   * Applies device-specific multiplier to theme typography
   * Phone: 1x, Tablet: 1.05x, Desktop: 1.1x
   */
  responsiveTypography: () => {
    const multiplier = responsive.fontSizeMultiplier();
    return {
      h1: Math.round(theme.typography.h1.fontSize * multiplier),
      h2: Math.round(theme.typography.h2.fontSize * multiplier),
      h3: Math.round(theme.typography.h3.fontSize * multiplier),
      h4: Math.round(theme.typography.h4.fontSize * multiplier),
      body: Math.round(theme.typography.body.fontSize * multiplier),
      bodyMedium: Math.round(theme.typography.bodyMedium.fontSize * multiplier),
      bodySmall: Math.round(theme.typography.bodySmall.fontSize * multiplier),
      caption: Math.round(theme.typography.caption.fontSize * multiplier),
      label: Math.round(theme.typography.label.fontSize * multiplier),
    };
  },
} as const;

/**
 * Hook-like utility for use in functional components
 * Returns current dimensions and device type
 */
export const useResponsive = () => {
  const dimensions = getScreenDimensions();
  return {
    width: dimensions.width,
    height: dimensions.height,
    isPhone: responsive.isPhone(),
    isTablet: responsive.isTablet(),
    isDesktop: responsive.isDesktop(),
    deviceType: responsive.getDeviceType(),
    cardColumns: responsive.cardColumns(),
    padding: responsive.padding(),
    gap: responsive.gap(),
  };
};

/**
 * Type exports
 */
export type DeviceType = 'phone' | 'tablet' | 'desktop';
export type BreakpointKey = keyof typeof breakpoints;
export type Responsive = typeof responsive;
