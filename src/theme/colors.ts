/**
 * VetFinder Color Palette - Redesigned
 *
 * New warm professional aesthetic:
 * - Primary: Professional blues (#2563eb) - Trust and reliability
 * - Neutral: Warm beiges/creams (#fafaf9, #f5f5f4) - Comfort and approachability
 * - Accent: Terracotta (#ea580c) - Action and warmth
 *
 * Replaces previous purple theme with business-yet-warm color system
 */

/**
 * Primary Blue - Professional & Trustworthy
 * Replaces purple #7c3aed → blue #2563eb
 */
export const primary = {
  main: '#2563eb',        // Royal blue - Primary brand color
  light: '#60a5fa',       // Light blue
  lighter: '#93c5fd',     // Lighter blue
  lightest: '#dbeafe',    // Very light blue tint
  dark: '#1e40af',        // Dark blue
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',         // Main color
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
} as const;

/**
 * Warm Neutrals - Comfort & Approachability
 * Replaces cool grays with warm beige/cream tones
 */
export const neutral = {
  50: '#fafaf9',          // Warm cream background (replaces pure white #ffffff)
  100: '#f5f5f4',         // Light cream
  200: '#e7e5e4',         // Soft beige borders (replaces #e5e7eb)
  300: '#d6d3d1',         // Medium beige
  400: '#a8a29e',         // Warm gray
  500: '#78716c',         // Medium warm gray text
  600: '#57534e',         // Dark warm gray
  700: '#44403c',         // Dark text (replaces #374151)
  800: '#292524',         // Darker text
  900: '#1c1917',         // Deep warm black (replaces #111827)
} as const;

/**
 * Terracotta Accent - Action & Warmth
 * New accent color for CTAs and interactive elements
 */
export const accent = {
  main: '#ea580c',        // Vibrant terracotta for CTAs
  light: '#fb923c',       // Light terracotta
  lighter: '#fdba74',     // Lighter terracotta
  lightest: '#fed7aa',    // Very light terracotta tint
  dark: '#c2410c',        // Dark terracotta
  50: '#fff7ed',
  100: '#ffedd5',
  200: '#fed7aa',
  300: '#fdba74',
  400: '#fb923c',
  500: '#f97316',
  600: '#ea580c',         // Main accent color
  700: '#c2410c',
  800: '#9a3412',
  900: '#7c2d12',
} as const;

/**
 * Success/Green - Keep existing
 * Works well with new palette
 */
export const success = {
  main: '#10b981',
  light: '#34d399',
  dark: '#059669',
  50: '#ecfdf5',
  100: '#d1fae5',
  200: '#a7f3d0',
  300: '#6ee7b7',
  400: '#34d399',
  500: '#10b981',
  600: '#059669',
  700: '#047857',
  800: '#065f46',
  900: '#064e3b',
} as const;

/**
 * Error/Red - Keep existing
 * Works well with new palette
 */
export const error = {
  main: '#ef4444',
  light: '#f87171',
  dark: '#dc2626',
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
} as const;

/**
 * Warning/Amber - Keep existing
 * Works well with new palette
 */
export const warning = {
  main: '#f59e0b',
  light: '#fbbf24',
  dark: '#d97706',
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
} as const;

/**
 * Info/Blue - Updated to complement primary blue
 * Lighter shade for informational messages
 */
export const info = {
  main: '#0ea5e9',        // Sky blue (lighter than primary)
  light: '#38bdf8',
  dark: '#0284c7',
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',
  600: '#0284c7',
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e',
} as const;

/**
 * Common Colors
 */
export const common = {
  white: '#ffffff',       // Pure white for high contrast
  black: '#000000',
  transparent: 'transparent' as const,
} as const;

/**
 * Complete color palette export
 */
export const colors = {
  primary,
  neutral,
  accent,
  success,
  error,
  warning,
  info,
  ...common,

  // Legacy compatibility aliases (will be removed in future)
  gray: neutral,  // Map gray to neutral for backward compatibility
} as const;

/**
 * Color migration notes:
 *
 * Old → New Mappings:
 * - #7c3aed (purple) → #2563eb (blue) - Primary brand color
 * - #ffffff (pure white) → #fafaf9 (warm cream) - Backgrounds
 * - #f9fafb (cool gray bg) → #f5f5f4 (warm beige bg) - Secondary backgrounds
 * - #e5e7eb (cool gray border) → #e7e5e4 (warm beige border) - Borders
 * - #374151 (cool gray text) → #44403c (warm gray text) - Body text
 * - #111827 (cool gray heading) → #1c1917 (warm black heading) - Headings
 * - Primary CTAs now use #ea580c (terracotta) for warmth
 */
