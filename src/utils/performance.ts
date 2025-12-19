/**
 * Performance Optimization Utilities for VetFinder
 *
 * Provides tools for optimizing React Native app performance:
 * - Component memoization helpers
 * - FlatList optimization configs
 * - Render performance monitoring
 * - Memory management utilities
 */

import { Platform } from 'react-native';

/**
 * FlatList Performance Configuration
 * Optimized settings for smooth scrolling and memory efficiency
 */
export const flatListConfig = {
  /**
   * Standard configuration for most lists
   */
  standard: {
    removeClippedSubviews: true, // Unmount items off-screen
    maxToRenderPerBatch: 10, // Items to render per batch
    updateCellsBatchingPeriod: 50, // Delay between batches (ms)
    initialNumToRender: 10, // Items to render initially
    windowSize: 5, // Number of screen heights to render
    getItemLayout: undefined, // Set this if item heights are fixed
  },

  /**
   * High-performance configuration for large lists (100+ items)
   */
  highPerformance: {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 5,
    updateCellsBatchingPeriod: 100,
    initialNumToRender: 5,
    windowSize: 3,
    getItemLayout: undefined,
  },

  /**
   * Configuration for lists with complex items
   */
  complexItems: {
    removeClippedSubviews: Platform.OS === 'android', // Only on Android for complex items
    maxToRenderPerBatch: 3,
    updateCellsBatchingPeriod: 150,
    initialNumToRender: 3,
    windowSize: 2,
    getItemLayout: undefined,
  },

  /**
   * Configuration for short lists (< 20 items)
   */
  shortList: {
    removeClippedSubviews: false, // Not needed for short lists
    maxToRenderPerBatch: 20,
    updateCellsBatchingPeriod: 50,
    initialNumToRender: 20,
    windowSize: 10,
    getItemLayout: undefined,
  },
} as const;

/**
 * Create getItemLayout function for fixed-height list items
 * Significantly improves scrolling performance
 *
 * @param itemHeight - Fixed height of each item in points
 * @param itemSeparatorHeight - Height of separator between items (default: 0)
 * @returns getItemLayout function for FlatList
 *
 * @example
 * <FlatList
 *   data={items}
 *   getItemLayout={createGetItemLayout(80)}
 *   {...flatListConfig.standard}
 * />
 */
export const createGetItemLayout = (
  itemHeight: number,
  itemSeparatorHeight: number = 0
) => {
  return (data: any, index: number) => ({
    length: itemHeight,
    offset: (itemHeight + itemSeparatorHeight) * index,
    index,
  });
};

/**
 * Memoization utilities for React components
 */
export const memo = {
  /**
   * Shallow props comparison for React.memo
   * Compares primitive values and object references
   */
  shallowEqual: <T extends Record<string, any>>(
    prevProps: T,
    nextProps: T
  ): boolean => {
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);

    if (prevKeys.length !== nextKeys.length) {
      return false;
    }

    for (const key of prevKeys) {
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }

    return true;
  },

  /**
   * Deep comparison for specific props
   * Use for props with nested objects/arrays
   */
  deepEqual: <T extends Record<string, any>>(
    prevProps: T,
    nextProps: T,
    deepProps: string[]
  ): boolean => {
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);

    if (prevKeys.length !== nextKeys.length) {
      return false;
    }

    for (const key of prevKeys) {
      if (deepProps.includes(key)) {
        // Deep comparison for specified props
        if (JSON.stringify(prevProps[key]) !== JSON.stringify(nextProps[key])) {
          return false;
        }
      } else {
        // Shallow comparison for other props
        if (prevProps[key] !== nextProps[key]) {
          return false;
        }
      }
    }

    return true;
  },

  /**
   * Comparison function that ignores specific props
   * Useful for ignoring navigation or style props
   */
  ignoreProps: <T extends Record<string, any>>(
    propsToIgnore: string[]
  ) => {
    return (prevProps: T, nextProps: T): boolean => {
      const prevKeys = Object.keys(prevProps).filter(
        (key) => !propsToIgnore.includes(key)
      );
      const nextKeys = Object.keys(nextProps).filter(
        (key) => !propsToIgnore.includes(key)
      );

      if (prevKeys.length !== nextKeys.length) {
        return false;
      }

      for (const key of prevKeys) {
        if (prevProps[key] !== nextProps[key]) {
          return false;
        }
      }

      return true;
    };
  },
};

/**
 * Debounce utility for performance-sensitive operations
 * Delays execution until after a period of inactivity
 *
 * @param func - Function to debounce
 * @param wait - Milliseconds to wait before executing
 * @returns Debounced function
 *
 * @example
 * const debouncedSearch = debounce((query: string) => {
 *   searchAPI(query);
 * }, 300);
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * Throttle utility for rate-limiting expensive operations
 * Ensures function executes at most once per time period
 *
 * @param func - Function to throttle
 * @param limit - Minimum milliseconds between executions
 * @returns Throttled function
 *
 * @example
 * const throttledScroll = throttle((event) => {
 *   handleScroll(event);
 * }, 100);
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Performance monitoring utilities
 */
export const perf = {
  /**
   * Measure render time of a component
   * Logs to console in development mode
   */
  measureRender: (componentName: string, startTime: number) => {
    if (__DEV__) {
      const renderTime = performance.now() - startTime;
      if (renderTime > 16) {
        // Log if render takes longer than one frame (16ms at 60fps)
        console.warn(
          `[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`
        );
      }
    }
  },

  /**
   * Track component mount/unmount
   */
  trackLifecycle: (componentName: string) => {
    if (__DEV__) {
      console.log(`[Lifecycle] ${componentName} mounted`);
      return () => {
        console.log(`[Lifecycle] ${componentName} unmounted`);
      };
    }
    return () => {};
  },

  /**
   * Log prop changes for debugging unnecessary re-renders
   */
  logPropChanges: <T extends Record<string, any>>(
    componentName: string,
    prevProps: T,
    nextProps: T
  ) => {
    if (__DEV__) {
      const changes: string[] = [];
      const allKeys = new Set([
        ...Object.keys(prevProps),
        ...Object.keys(nextProps),
      ]);

      allKeys.forEach((key) => {
        if (prevProps[key] !== nextProps[key]) {
          changes.push(key);
        }
      });

      if (changes.length > 0) {
        console.log(`[Props Changed] ${componentName}:`, changes);
      }
    }
  },
};

/**
 * Memory management utilities
 */
export const memory = {
  /**
   * Clear large data structures when unmounting
   */
  cleanup: <T>(ref: { current: T | null }) => {
    ref.current = null;
  },

  /**
   * Chunk large arrays for processing
   * Prevents blocking the UI thread
   */
  chunkArray: <T>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  },

  /**
   * Process large arrays in batches with delay
   * Allows UI to remain responsive
   */
  processBatch: async <T, R>(
    items: T[],
    processor: (item: T) => R,
    batchSize: number = 10,
    delayMs: number = 0
  ): Promise<R[]> => {
    const results: R[] = [];
    const chunks = memory.chunkArray(items, batchSize);

    for (const chunk of chunks) {
      results.push(...chunk.map(processor));
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return results;
  },
};

/**
 * Image optimization utilities
 */
export const image = {
  /**
   * Calculate optimal image dimensions based on screen size
   */
  getOptimalSize: (
    containerWidth: number,
    containerHeight: number,
    scale: number = 2 // 2x for retina displays
  ) => ({
    width: Math.ceil(containerWidth * scale),
    height: Math.ceil(containerHeight * scale),
  }),

  /**
   * Generate responsive image source set
   */
  createSourceSet: (baseUrl: string, sizes: number[]) => {
    return sizes.map((size) => ({
      uri: `${baseUrl}?w=${size}`,
      width: size,
    }));
  },
};

/**
 * Export all utilities
 */
export default {
  flatListConfig,
  createGetItemLayout,
  memo,
  debounce,
  throttle,
  perf,
  memory,
  image,
};
