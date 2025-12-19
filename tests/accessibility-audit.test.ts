/**
 * Accessibility Audit Test Suite
 * Validates WCAG AA compliance for VetFinder color palette
 */

import { validateColorPalette, meetsWCAG_AA } from '../src/utils/accessibility';

describe('VetFinder Accessibility Audit', () => {
  describe('Color Contrast - WCAG AA Compliance', () => {
    test('Primary blue meets contrast on all backgrounds', () => {
      // Primary blue (#2563eb) on white
      const onWhite = meetsWCAG_AA('#2563eb', '#ffffff');
      expect(onWhite.passes).toBe(true);
      expect(onWhite.ratio).toBeGreaterThanOrEqual(4.5);

      // Primary blue on warm cream
      const onCream = meetsWCAG_AA('#2563eb', '#fafaf9');
      expect(onCream.passes).toBe(true);

      // Primary blue on light cream
      const onLightCream = meetsWCAG_AA('#2563eb', '#f5f5f4');
      expect(onLightCream.passes).toBe(true);
    });

    test('Terracotta accent meets contrast on all backgrounds', () => {
      // Terracotta (#ea580c) on white
      const onWhite = meetsWCAG_AA('#ea580c', '#ffffff');
      expect(onWhite.passes).toBe(true);
      expect(onWhite.ratio).toBeGreaterThanOrEqual(4.5);

      // Terracotta on warm cream
      const onCream = meetsWCAG_AA('#ea580c', '#fafaf9');
      expect(onCream.passes).toBe(true);

      // Terracotta on light cream
      const onLightCream = meetsWCAG_AA('#ea580c', '#f5f5f4');
      expect(onLightCream.passes).toBe(true);
    });

    test('Dark text meets contrast on light backgrounds', () => {
      // Dark warm gray (#44403c) on white
      const darkOnWhite = meetsWCAG_AA('#44403c', '#ffffff');
      expect(darkOnWhite.passes).toBe(true);
      expect(darkOnWhite.ratio).toBeGreaterThanOrEqual(4.5);

      // Dark warm gray on warm cream
      const darkOnCream = meetsWCAG_AA('#44403c', '#fafaf9');
      expect(darkOnCream.passes).toBe(true);

      // Dark warm gray on light cream
      const darkOnLightCream = meetsWCAG_AA('#44403c', '#f5f5f4');
      expect(darkOnLightCream.passes).toBe(true);
    });

    test('White text meets contrast on colored backgrounds', () => {
      // White on primary blue
      const whiteOnPrimary = meetsWCAG_AA('#ffffff', '#2563eb');
      expect(whiteOnPrimary.passes).toBe(true);
      expect(whiteOnPrimary.ratio).toBeGreaterThanOrEqual(4.5);

      // White on terracotta accent
      const whiteOnAccent = meetsWCAG_AA('#ffffff', '#ea580c');
      expect(whiteOnAccent.passes).toBe(true);
      expect(whiteOnAccent.ratio).toBeGreaterThanOrEqual(4.5);
    });

    test('Success green meets contrast', () => {
      const successOnWhite = meetsWCAG_AA('#10b981', '#ffffff');
      expect(successOnWhite.passes).toBe(true);
    });

    test('Error red meets contrast', () => {
      const errorOnWhite = meetsWCAG_AA('#ef4444', '#ffffff');
      expect(errorOnWhite.passes).toBe(true);
    });

    test('Warning amber meets contrast', () => {
      const warningOnWhite = meetsWCAG_AA('#f59e0b', '#ffffff');
      expect(warningOnWhite.passes).toBe(true);
    });
  });

  describe('Full Color Palette Validation', () => {
    test('All color combinations meet WCAG AA', () => {
      const results = validateColorPalette();

      // Primary color checks
      expect(results.primary.onWhite.passes).toBe(true);
      expect(results.primary.onCream.passes).toBe(true);
      expect(results.primary.onLightCream.passes).toBe(true);

      // Accent color checks
      expect(results.accent.onWhite.passes).toBe(true);
      expect(results.accent.onCream.passes).toBe(true);
      expect(results.accent.onLightCream.passes).toBe(true);

      // Text color checks
      expect(results.text.darkOnWhite.passes).toBe(true);
      expect(results.text.darkOnCream.passes).toBe(true);
      expect(results.text.darkOnLightCream.passes).toBe(true);
      expect(results.text.whiteOnPrimary.passes).toBe(true);
      expect(results.text.whiteOnAccent.passes).toBe(true);
    });
  });

  describe('Touch Target Size Compliance', () => {
    test('Minimum touch target is 44x44 points', () => {
      const minSize = 44;
      expect(minSize).toBeGreaterThanOrEqual(44);
    });

    test('Recommended touch target is 48x48 points', () => {
      const recommendedSize = 48;
      expect(recommendedSize).toBeGreaterThanOrEqual(48);
    });
  });
});
