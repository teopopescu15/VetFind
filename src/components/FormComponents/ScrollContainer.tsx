import React from 'react';
import { ScrollView, StyleSheet, ScrollViewProps } from 'react-native';

interface ScrollContainerProps extends ScrollViewProps {
  children: React.ReactNode;
}

/**
 * Cross-platform scroll container that works on both web and native.
 * Uses React Native ScrollView for consistent behavior across platforms.
 */
export const ScrollContainer = ({ children, style, contentContainerStyle, ...props }: ScrollContainerProps) => {
  return (
    <ScrollView
      style={[styles.wrapper, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    backgroundColor: '#fff'
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100
  }
});
