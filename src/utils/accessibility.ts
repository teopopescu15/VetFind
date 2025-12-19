/**
 * Accessibility Utilities for VetFinder
 *
 * Provides tools to ensure WCAG AA compliance:
 * - Color contrast ratios (4.5:1 for normal text, 3:1 for large text)
 * - Touch target sizes (minimum 44x44 points)
 * - Accessibility label generators
 */

/**
 * WCAG AA Requirements
 */
export const WCAG_AA = {
  // Contrast ratios
  NORMAL_TEXT_CONTRAST: 4.5, // For text under 18pt or 14pt bold
  LARGE_TEXT_CONTRAST: 3.0,  // For text 18pt+ or 14pt+ bold
  UI_COMPONENT_CONTRAST: 3.0, // For UI components and graphics

  // Touch targets (iOS and Android guidelines)
  MIN_TOUCH_TARGET: 44, // Minimum 44x44 points for touch targets
  RECOMMENDED_TOUCH_TARGET: 48, // Recommended size
} as const;

/**
 * Calculate relative luminance of a color
 * Formula from WCAG 2.1: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
const getRelativeLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const sRGB = val / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Convert hex color to RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Calculate contrast ratio between two colors
 * Returns ratio between 1:1 (no contrast) and 21:1 (maximum contrast)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    console.warn('Invalid color format. Use hex colors like #2563eb');
    return 1;
  }

  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if color combination meets WCAG AA standard
 */
export const meetsWCAG_AA = (
  foreground: string,
  background: string,
  isLargeText = false
): { passes: boolean; ratio: number; required: number } => {
  const ratio = getContrastRatio(foreground, background);
  const required = isLargeText
    ? WCAG_AA.LARGE_TEXT_CONTRAST
    : WCAG_AA.NORMAL_TEXT_CONTRAST;

  return {
    passes: ratio >= required,
    ratio: Math.round(ratio * 100) / 100,
    required,
  };
};

/**
 * Accessibility label generators
 */
export const a11yLabels = {
  /**
   * Button labels
   */
  button: (action: string, context?: string) => {
    return context ? `${action} ${context}` : action;
  },

  /**
   * Form input labels
   */
  input: (fieldName: string, required = false, hint?: string) => {
    let label = fieldName;
    if (required) label += ', required';
    if (hint) label += `, ${hint}`;
    return label;
  },

  /**
   * Status indicators
   */
  status: (status: string, item: string) => {
    return `${item} status: ${status}`;
  },

  /**
   * Navigation labels
   */
  navigation: (destination: string) => {
    return `Navigate to ${destination}`;
  },

  /**
   * Time slot labels for appointments
   */
  timeSlot: (time: string, available: boolean) => {
    return available
      ? `${time}, available`
      : `${time}, not available`;
  },

  /**
   * Date picker labels
   */
  datePicker: (date: string, dayName: string, available: boolean) => {
    return available
      ? `${dayName}, ${date}, has available appointments`
      : `${dayName}, ${date}, no available appointments`;
  },

  /**
   * Loading state
   */
  loading: (context: string) => {
    return `Loading ${context}`;
  },

  /**
   * Error state
   */
  error: (message: string) => {
    return `Error: ${message}`;
  },
};

/**
 * Touch target size validators
 */
export const touchTarget = {
  /**
   * Create style with minimum touch target size
   */
  minSize: (width?: number, height?: number) => ({
    minWidth: width || WCAG_AA.MIN_TOUCH_TARGET,
    minHeight: height || WCAG_AA.MIN_TOUCH_TARGET,
  }),

  /**
   * Create style with recommended touch target size
   */
  recommendedSize: (width?: number, height?: number) => ({
    minWidth: width || WCAG_AA.RECOMMENDED_TOUCH_TARGET,
    minHeight: height || WCAG_AA.RECOMMENDED_TOUCH_TARGET,
  }),

  /**
   * Check if dimensions meet minimum touch target
   */
  meetsMinimum: (width: number, height: number): boolean => {
    return width >= WCAG_AA.MIN_TOUCH_TARGET && height >= WCAG_AA.MIN_TOUCH_TARGET;
  },
};

/**
 * Accessibility props builder for React Native components
 */
export const a11yProps = {
  /**
   * Button accessibility props
   */
  button: (label: string, hint?: string, disabled = false) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: 'button' as const,
    accessibilityHint: hint,
    accessibilityState: { disabled },
  }),

  /**
   * Text input accessibility props
   */
  textInput: (label: string, required = false, hint?: string) => ({
    accessible: true,
    accessibilityLabel: a11yLabels.input(label, required, hint),
    accessibilityRole: 'text' as const,
  }),

  /**
   * Link accessibility props
   */
  link: (label: string, destination: string) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: 'link' as const,
    accessibilityHint: `Navigates to ${destination}`,
  }),

  /**
   * Image accessibility props
   */
  image: (description: string, decorative = false) => ({
    accessible: !decorative,
    accessibilityLabel: decorative ? undefined : description,
    accessibilityRole: 'image' as const,
  }),

  /**
   * Header accessibility props
   */
  header: (text: string, level = 1) => ({
    accessible: true,
    accessibilityLabel: text,
    accessibilityRole: 'header' as const,
    accessibilityLevel: level,
  }),
};

/**
 * Color contrast validation report
 * Useful for auditing the entire app
 */
export const validateColorPalette = () => {
  const results = {
    primary: {
      // Primary blue on white backgrounds
      onWhite: meetsWCAG_AA('#2563eb', '#ffffff'),
      onCream: meetsWCAG_AA('#2563eb', '#fafaf9'),
      onLightCream: meetsWCAG_AA('#2563eb', '#f5f5f4'),
    },
    accent: {
      // Terracotta accent on backgrounds
      onWhite: meetsWCAG_AA('#ea580c', '#ffffff'),
      onCream: meetsWCAG_AA('#ea580c', '#fafaf9'),
      onLightCream: meetsWCAG_AA('#ea580c', '#f5f5f4'),
    },
    text: {
      // Dark text on light backgrounds
      darkOnWhite: meetsWCAG_AA('#44403c', '#ffffff'),
      darkOnCream: meetsWCAG_AA('#44403c', '#fafaf9'),
      darkOnLightCream: meetsWCAG_AA('#44403c', '#f5f5f4'),
      // White text on colored backgrounds
      whiteOnPrimary: meetsWCAG_AA('#ffffff', '#2563eb'),
      whiteOnAccent: meetsWCAG_AA('#ffffff', '#ea580c'),
    },
  };

  // Log any failures
  Object.entries(results).forEach(([category, tests]) => {
    Object.entries(tests).forEach(([test, result]) => {
      if (!result.passes) {
        console.warn(
          `⚠️ WCAG AA Failure: ${category}.${test} - Ratio: ${result.ratio}:1 (Required: ${result.required}:1)`
        );
      }
    });
  });

  return results;
};

/**
 * Export all utilities as default
 */
export default {
  WCAG_AA,
  getContrastRatio,
  meetsWCAG_AA,
  a11yLabels,
  touchTarget,
  a11yProps,
  validateColorPalette,
};
