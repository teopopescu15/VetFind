/**
 * VetFinder Design System - Centralized Theme Constants
 *
 * Object-literal based design system following project conventions.
 * Provides consistent colors, spacing, typography, shadows, and style utilities.
 *
 * Redesigned with warm professional aesthetic:
 * - Primary: Professional blues (#2563eb)
 * - Neutral: Warm beiges/creams (#fafaf9, #f5f5f4)
 * - Accent: Terracotta (#ea580c) for CTAs
 *
 * Usage:
 * ```typescript
 * import { theme, styleHelpers } from '@/theme';
 *
 * const styles = StyleSheet.create({
 *   card: {
 *     backgroundColor: theme.colors.neutral[50],
 *     padding: theme.spacing.lg,
 *     borderRadius: theme.borderRadius.lg,
 *     ...theme.shadows.md,
 *   }
 * });
 * ```
 */

import { colors } from './colors';

/**
 * Main Theme Object
 * Centralized design system with new warm professional color palette
 */
export const theme = {
  colors,

  /**
   * Spacing System (4px grid)
   * Consistent spacing values for padding, margin, gaps
   */
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
  },

  /**
   * Typography Scale
   * Font sizes, weights, and line heights for consistent text styling
   * Updated to use warm neutral colors
   */
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
      color: colors.neutral[900],  // Warm black for headings
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 32,
      color: colors.neutral[900],  // Warm black for headings
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
      color: colors.neutral[900],  // Warm black for headings
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
      color: colors.neutral[800],  // Darker warm gray
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
      color: colors.neutral[700],  // Warm gray for body text
    },
    bodyMedium: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 22,
      color: colors.neutral[700],  // Warm gray for body text
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
      color: colors.neutral[600],  // Medium warm gray
    },
    caption: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
      color: colors.neutral[500],  // Medium warm gray
    },
    label: {
      fontSize: 13,
      fontWeight: '600' as const,
      lineHeight: 18,
      color: colors.neutral[700],  // Warm gray
    },
  },

  /**
   * Border Radius Values
   * Consistent corner rounding
   */
  borderRadius: {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    full: 9999,
  },

  /**
   * Shadow/Elevation Presets
   * Platform-aware shadows (iOS uses shadowColor/shadowOpacity, Android uses elevation)
   */
  shadows: {
    none: {
      elevation: 0,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    },
    sm: {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    md: {
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    lg: {
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    xl: {
      elevation: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
    },
    // Primary-colored shadows for emphasis (blue instead of purple)
    primarySm: {
      elevation: 2,
      shadowColor: colors.primary.main,  // Blue shadow
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    primaryMd: {
      elevation: 6,
      shadowColor: colors.primary.main,  // Blue shadow
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    primaryLg: {
      elevation: 8,
      shadowColor: colors.primary.main,  // Blue shadow
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
  },

  /**
   * Z-Index Layers
   * Consistent layering for overlays, modals, etc.
   */
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

/**
 * Style Helper Utilities
 * Object-literal pattern for generating common style combinations
 * Updated to use new warm professional color palette
 */
export const styleHelpers = {
  /**
   * Generate card styles with variants
   * Using warm neutral backgrounds instead of pure white
   */
  card: (variant: 'default' | 'elevated' | 'outlined' | 'primary' = 'default') => {
    const base = {
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.neutral[50],  // Warm cream instead of white
      overflow: 'hidden' as const,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...base,
          ...theme.shadows.md,
        };
      case 'outlined':
        return {
          ...base,
          borderWidth: 1,
          borderColor: theme.colors.neutral[200],  // Warm beige border
        };
      case 'primary':
        return {
          ...base,
          ...theme.shadows.primaryMd,
          borderWidth: 2,
          borderColor: theme.colors.primary[300],  // Blue border
        };
      default:
        return base;
    }
  },

  /**
   * Generate button styles with variants
   * Primary uses blue, accent variant available for terracotta CTAs
   */
  button: (variant: 'primary' | 'secondary' | 'outlined' | 'ghost' | 'accent' = 'primary') => {
    const base = {
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
    };

    switch (variant) {
      case 'primary':
        return {
          ...base,
          backgroundColor: theme.colors.primary.main,  // Blue
          ...theme.shadows.sm,
        };
      case 'accent':
        return {
          ...base,
          backgroundColor: theme.colors.accent.main,  // Terracotta for CTAs
          ...theme.shadows.sm,
        };
      case 'secondary':
        return {
          ...base,
          backgroundColor: theme.colors.neutral[100],  // Warm beige
        };
      case 'outlined':
        return {
          ...base,
          backgroundColor: theme.colors.transparent,
          borderWidth: 2,
          borderColor: theme.colors.primary.main,  // Blue border
        };
      case 'ghost':
        return {
          ...base,
          backgroundColor: theme.colors.transparent,
        };
      default:
        return base;
    }
  },

  /**
   * Generate input/form field styles with states
   * Using warm neutrals and blue for focus, terracotta for error
   */
  input: (state: 'default' | 'focused' | 'error' | 'success' | 'disabled' = 'default') => {
    const base = {
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.neutral[50],  // Warm cream background
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.neutral[300],  // Warm beige border
      fontSize: 16,
      color: theme.colors.neutral[900],  // Warm black text
    };

    switch (state) {
      case 'focused':
        return {
          ...base,
          borderWidth: 2,
          borderColor: theme.colors.primary.main,  // Blue focus border
          ...theme.shadows.sm,
        };
      case 'error':
        return {
          ...base,
          borderWidth: 2,
          borderColor: theme.colors.accent.main,  // Terracotta error border
          backgroundColor: theme.colors.accent[50],  // Light terracotta background
        };
      case 'success':
        return {
          ...base,
          borderColor: theme.colors.success[300],
        };
      case 'disabled':
        return {
          ...base,
          backgroundColor: theme.colors.neutral[100],  // Light warm beige
          borderColor: theme.colors.neutral[200],  // Soft beige border
          color: theme.colors.neutral[400],  // Warm gray text
        };
      default:
        return base;
    }
  },

  /**
   * Generate badge styles
   * Updated to use new color palette
   */
  badge: (variant: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'accent' = 'primary') => {
    const base = {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: theme.spacing.xs,
    };

    const colorMap = {
      primary: { bg: theme.colors.primary.main, text: theme.colors.white },  // Blue
      accent: { bg: theme.colors.accent.main, text: theme.colors.white },  // Terracotta
      success: { bg: theme.colors.success.main, text: theme.colors.white },
      error: { bg: theme.colors.error.main, text: theme.colors.white },
      warning: { bg: theme.colors.warning.main, text: theme.colors.white },
      info: { bg: theme.colors.info.main, text: theme.colors.white },
      neutral: { bg: theme.colors.neutral[200], text: theme.colors.neutral[700] },  // Warm beige
    };

    const colors = colorMap[variant];

    return {
      ...base,
      backgroundColor: colors.bg,
      color: colors.text,
    };
  },

  /**
   * Generate chip/pill styles (lighter version of badges)
   * Updated to use new color palette
   */
  chip: (variant: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'accent' = 'neutral') => {
    const base = {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: theme.spacing.xs,
    };

    const colorMap = {
      primary: { bg: theme.colors.primary[100], text: theme.colors.primary[700], border: theme.colors.primary[300] },  // Blue
      accent: { bg: theme.colors.accent[100], text: theme.colors.accent[700], border: theme.colors.accent[300] },  // Terracotta
      success: { bg: theme.colors.success[100], text: theme.colors.success[700], border: theme.colors.success[300] },
      error: { bg: theme.colors.error[100], text: theme.colors.error[700], border: theme.colors.error[300] },
      warning: { bg: theme.colors.warning[100], text: theme.colors.warning[700], border: theme.colors.warning[300] },
      info: { bg: theme.colors.info[100], text: theme.colors.info[700], border: theme.colors.info[300] },
      neutral: { bg: theme.colors.neutral[100], text: theme.colors.neutral[700], border: theme.colors.neutral[300] },  // Warm beige
    };

    const colors = colorMap[variant];

    return {
      ...base,
      backgroundColor: colors.bg,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    };
  },

  /**
   * Generate divider styles
   * Using warm neutral colors
   */
  divider: (variant: 'horizontal' | 'vertical' = 'horizontal', thickness: number = 1) => {
    if (variant === 'horizontal') {
      return {
        height: thickness,
        backgroundColor: theme.colors.neutral[200],  // Warm beige
        width: '100%' as const,
      };
    }
    return {
      width: thickness,
      backgroundColor: theme.colors.neutral[200],  // Warm beige
      height: '100%' as const,
    };
  },

  /**
   * Utility for flexbox centering
   */
  centerContent: () => ({
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  }),

  /**
   * Utility for full flex container
   */
  flexContainer: (direction: 'row' | 'column' = 'column', gap: number = theme.spacing.md) => ({
    display: 'flex' as const,
    flexDirection: direction,
    gap,
  }),
} as const;

/**
 * Type exports for TypeScript support
 */
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeTypography = typeof theme.typography;
export type ThemeShadows = typeof theme.shadows;
