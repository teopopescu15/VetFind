import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Portal, Modal, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AnimatedConfirmationProps {
  visible: boolean;
  message?: string;
  durationMs?: number;
  onFinish?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedConfirmation: React.FC<AnimatedConfirmationProps> = ({
  visible,
  message = 'Appointment confirmed!',
  durationMs = 1400,
  onFinish,
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timeout: any;
    if (visible) {
      // entrance animation
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 100,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          useNativeDriver: true,
          duration: 250,
        }),
      ]).start(() => {
        // After the animation and a short delay, call onFinish
        timeout = setTimeout(() => {
          // fade out
          Animated.timing(opacity, {
            toValue: 0,
            useNativeDriver: true,
            duration: 200,
          }).start(() => {
            // reset for next show
            scale.setValue(0);
            opacity.setValue(0);
            onFinish && onFinish();
          });
        }, durationMs);
      });
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [visible, scale, opacity, durationMs, onFinish]);

  return (
    <Portal>
      <Modal visible={visible} dismissable={false} contentContainerStyle={styles.modalContainer}>
        <View style={styles.center}>
          <Animated.View style={[styles.iconWrapper, { transform: [{ scale }], opacity }]}>
            <MaterialCommunityIcons name="check-circle" size={96} color="#10b981" />
          </Animated.View>

          <Animated.View style={[{ opacity, marginTop: 16 }]}>
            <Text variant="titleLarge" style={styles.messageText}>{message}</Text>
          </Animated.View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 20,
  },
  center: {
    width: Math.min(360, SCREEN_WIDTH - 40),
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  iconWrapper: {
    backgroundColor: 'transparent',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '700',
  },
});

export default AnimatedConfirmation;
