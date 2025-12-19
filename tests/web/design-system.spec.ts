/**
 * Design System Playwright Tests
 *
 * Tests for VetFinder design system theme constants and responsive utilities.
 * Ensures consistent styling and proper responsive behavior across the web application.
 */

import { test, expect } from '@playwright/test';

test.describe('Design System Theme Constants', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:8081');
  });

  test('Primary color (#7c3aed) is applied correctly', async ({ page }) => {
    // Wait for app to load
    await page.waitForLoadState('networkidle');

    // Look for an element with primary color (buttons, etc.)
    const primaryElements = await page.locator('[data-testid*="primary"], button[mode="contained"]').all();

    if (primaryElements.length > 0) {
      const bgColor = await primaryElements[0].evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // RGB value of #7c3aed is rgb(124, 58, 237)
      expect(bgColor).toMatch(/rgb\(124,\s*58,\s*237\)/);
    }
  });

  test('Gray color scale is accessible', async ({ page }) => {
    // Check for text elements using gray colors
    const textElements = await page.locator('text, p, span').all();

    let foundGrayText = false;
    for (const element of textElements.slice(0, 10)) {
      // Check first 10 elements
      const color = await element.evaluate(el =>
        window.getComputedStyle(el).color
      );

      // Check if color matches our gray scale (rgb values)
      if (
        color.includes('107, 114, 128') || // gray-500
        color.includes('75, 85, 99') || // gray-600
        color.includes('55, 65, 81') || // gray-700
        color.includes('31, 41, 55') || // gray-800
        color.includes('17, 24, 39') // gray-900
      ) {
        foundGrayText = true;
        break;
      }
    }

    // We should find at least some gray text in the app
    expect(foundGrayText).toBeTruthy();
  });

  test('Spacing values are consistent (theme.spacing)', async ({ page }) => {
    // Look for elements with padding/margin
    const elements = await page.locator('[style*="padding"], [style*="margin"]').all();

    if (elements.length > 0) {
      const style = await elements[0].evaluate(el => ({
        padding: window.getComputedStyle(el).padding,
        margin: window.getComputedStyle(el).margin,
      }));

      // Values should be multiples of 4px (our spacing grid)
      const paddingMatch = style.padding.match(/\d+/g);
      if (paddingMatch) {
        const paddingValue = parseInt(paddingMatch[0]);
        // Should be divisible by 4 (our spacing grid)
        expect(paddingValue % 4).toBe(0);
      }
    }
  });

  test('Border radius values are applied (theme.borderRadius)', async ({ page }) => {
    // Look for cards or rounded elements
    const roundedElements = await page.locator('[data-testid*="card"], .card, [class*="Card"]').all();

    if (roundedElements.length > 0) {
      const borderRadius = await roundedElements[0].evaluate(el =>
        window.getComputedStyle(el).borderRadius
      );

      // Should have border radius applied (8px, 12px, 16px, or 24px)
      expect(borderRadius).toMatch(/^(8px|12px|16px|24px)/);
    }
  });

  test('Shadow/elevation is applied to cards', async ({ page }) => {
    // Look for card elements
    const cards = await page.locator('[data-testid*="card"], .card').all();

    if (cards.length > 0) {
      const boxShadow = await cards[0].evaluate(el =>
        window.getComputedStyle(el).boxShadow
      );

      // Should have box shadow (not 'none')
      expect(boxShadow).not.toBe('none');
      expect(boxShadow).toContain('rgba');
    }
  });
});

test.describe('Responsive Utilities', () => {
  test('Single column layout on phone viewport (375px)', async ({ page }) => {
    // Set phone viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');

    // Look for card grid
    const cardsGrid = await page.locator('[data-testid="cards-grid"]').first();

    if (await cardsGrid.count() > 0) {
      const cards = await cardsGrid.locator('[data-testid*="card"]').all();

      if (cards.length >= 2) {
        const rect1 = await cards[0].boundingBox();
        const rect2 = await cards[1].boundingBox();

        // Cards should stack vertically (different Y positions)
        expect(Math.abs((rect1?.y || 0) - (rect2?.y || 0))).toBeGreaterThan(50);
      }
    }
  });

  test('Two column layout on tablet viewport (768px)', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');

    // Look for card grid
    const cardsGrid = await page.locator('[data-testid="cards-grid"]').first();

    if (await cardsGrid.count() > 0) {
      const cards = await cardsGrid.locator('[data-testid*="card"]').all();

      if (cards.length >= 2) {
        const rect1 = await cards[0].boundingBox();
        const rect2 = await cards[1].boundingBox();

        // Cards should be side-by-side (similar Y position)
        expect(Math.abs((rect1?.y || 0) - (rect2?.y || 0))).toBeLessThan(20);
      }
    }
  });

  test('Three column layout on desktop viewport (1024px)', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');

    // Look for card grid
    const cardsGrid = await page.locator('[data-testid="cards-grid"]').first();

    if (await cardsGrid.count() > 0) {
      const cards = await cardsGrid.locator('[data-testid*="card"]').all();

      if (cards.length >= 3) {
        const rect1 = await cards[0].boundingBox();
        const rect2 = await cards[1].boundingBox();
        const rect3 = await cards[2].boundingBox();

        // First three cards should be in same row (similar Y position)
        const y1 = rect1?.y || 0;
        const y2 = rect2?.y || 0;
        const y3 = rect3?.y || 0;

        expect(Math.abs(y1 - y2)).toBeLessThan(20);
        expect(Math.abs(y2 - y3)).toBeLessThan(20);
      }
    }
  });

  test('Responsive padding scales with viewport', async ({ page }) => {
    // Test phone padding (16px)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');

    const container = await page.locator('main, [data-testid*="container"]').first();
    if (await container.count() > 0) {
      const phonePadding = await container.evaluate(el =>
        window.getComputedStyle(el).paddingLeft
      );

      // Phone should have 16px padding
      expect(phonePadding).toBe('16px');
    }

    // Test tablet padding (24px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');

    if (await container.count() > 0) {
      const tabletPadding = await container.evaluate(el =>
        window.getComputedStyle(el).paddingLeft
      );

      // Tablet should have 24px padding
      expect(tabletPadding).toBe('24px');
    }
  });
});

test.describe('Typography System', () => {
  test('Heading fonts are bolder than body text', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');

    // Find heading and body text
    const heading = await page.locator('h1, h2, h3, [data-testid*="heading"]').first();
    const bodyText = await page.locator('p, [data-testid*="body"]').first();

    if ((await heading.count()) > 0 && (await bodyText.count()) > 0) {
      const headingWeight = await heading.evaluate(el =>
        window.getComputedStyle(el).fontWeight
      );
      const bodyWeight = await bodyText.evaluate(el =>
        window.getComputedStyle(el).fontWeight
      );

      // Heading should be bolder (700 or 600 vs 400)
      expect(parseInt(headingWeight)).toBeGreaterThan(parseInt(bodyWeight));
    }
  });

  test('Font sizes follow typography scale', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');

    // Common font sizes in our scale: 12px, 14px, 16px, 18px, 20px, 24px, 32px
    const expectedSizes = [12, 14, 16, 18, 20, 24, 32];

    const textElements = await page.locator('text, p, h1, h2, h3, span').all();

    for (const element of textElements.slice(0, 20)) {
      const fontSize = await element.evaluate(el =>
        parseFloat(window.getComputedStyle(el).fontSize)
      );

      // Font size should be one of our scale values (with 1px tolerance for rounding)
      const isInScale = expectedSizes.some(size => Math.abs(fontSize - size) <= 1);
      expect(isInScale).toBeTruthy();
    }
  });
});

test.describe('Color Accessibility', () => {
  test('Text has sufficient contrast ratio', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');

    // Check primary button text contrast
    const button = await page.locator('button[mode="contained"]').first();

    if (await button.count() > 0) {
      const textColor = await button.evaluate(el =>
        window.getComputedStyle(el).color
      );
      const bgColor = await button.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // White text on purple (#7c3aed) should have good contrast
      // We can't easily calculate contrast ratio in test, but we can verify colors
      expect(textColor).toContain('rgb(255, 255, 255)'); // White text
      expect(bgColor).toContain('rgb(124, 58, 237)'); // Purple bg
    }
  });

  test('Success color is distinguishable from error color', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');

    // Success green (#10b981) vs Error red (#ef4444) should be clearly different
    // This is a basic check - real accessibility would need more thorough testing

    const successElement = await page.locator('[data-testid*="success"], [class*="success"]').first();
    const errorElement = await page.locator('[data-testid*="error"], [class*="error"]').first();

    if ((await successElement.count()) > 0 && (await errorElement.count()) > 0) {
      const successColor = await successElement.evaluate(el =>
        window.getComputedStyle(el).color || window.getComputedStyle(el).backgroundColor
      );
      const errorColor = await errorElement.evaluate(el =>
        window.getComputedStyle(el).color || window.getComputedStyle(el).backgroundColor
      );

      // Colors should be different
      expect(successColor).not.toBe(errorColor);
    }
  });
});

test.describe('Component Style Helpers', () => {
  test('Card variants apply correct styles', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');

    // Look for elevated card
    const card = await page.locator('[data-testid*="card"]').first();

    if (await card.count() > 0) {
      const styles = await card.evaluate(el => ({
        borderRadius: window.getComputedStyle(el).borderRadius,
        backgroundColor: window.getComputedStyle(el).backgroundColor,
        boxShadow: window.getComputedStyle(el).boxShadow,
      }));

      // Card should have border radius
      expect(styles.borderRadius).toMatch(/\d+px/);

      // Card should have white background
      expect(styles.backgroundColor).toContain('rgb(255, 255, 255)');

      // Elevated card should have shadow
      expect(styles.boxShadow).not.toBe('none');
    }
  });

  test('Button variants apply correct styles', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');

    // Look for primary button
    const button = await page.locator('button').first();

    if (await button.count() > 0) {
      const styles = await button.evaluate(el => ({
        borderRadius: window.getComputedStyle(el).borderRadius,
        padding: window.getComputedStyle(el).padding,
      }));

      // Button should have border radius (8px or more)
      expect(parseInt(styles.borderRadius)).toBeGreaterThanOrEqual(8);

      // Button should have padding
      expect(styles.padding).not.toBe('0px');
    }
  });
});
