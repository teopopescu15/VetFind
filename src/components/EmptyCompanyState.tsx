import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export interface EmptyCompanyStateProps {
  onCreatePress: () => void;
}

/**
 * EmptyCompanyState - Displayed when vet company user has no company profile
 *
 * Features:
 * - Engaging paw icon and imagery
 * - Clear call-to-action button
 * - Estimated completion time
 * - Purple gradient theme
 * - Encourages profile creation
 */
export const EmptyCompanyState = ({ onCreatePress }: EmptyCompanyStateProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon Section */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="paw" size={64} color="#7c3aed" />
          </View>
          <View style={styles.decorativeIcons}>
            <Ionicons name="medical" size={32} color="#a855f7" style={[styles.decorativeIcon, { top: -10, right: -10 }]} />
            <Ionicons name="heart" size={28} color="#c084fc" style={[styles.decorativeIcon, { bottom: -10, left: -10 }]} />
          </View>
        </View>

        {/* Title */}
        <Text variant="headlineLarge" style={styles.title}>
          Your Vet Company Awaits!
        </Text>

        {/* Subtitle */}
        <Text variant="bodyLarge" style={styles.subtitle}>
          Set up your clinic profile to start receiving bookings from pet owners
        </Text>

        {/* Benefits List */}
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
            <Text variant="bodyMedium" style={styles.benefitText}>
              Reach thousands of pet owners in your area
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
            <Text variant="bodyMedium" style={styles.benefitText}>
              Manage appointments and services online
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
            <Text variant="bodyMedium" style={styles.benefitText}>
              Showcase your expertise and facilities
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
            <Text variant="bodyMedium" style={styles.benefitText}>
              Build trust with reviews and ratings
            </Text>
          </View>
        </View>

        {/* Call-to-Action Button */}
        <Button
          mode="contained"
          onPress={onCreatePress}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          icon={() => <Ionicons name="add-circle-outline" size={24} color="#fff" />}
          buttonColor="#7c3aed"
        >
          Create Company Profile
        </Button>

        {/* Estimated Time */}
        <View style={styles.timeEstimate}>
          <Ionicons name="time-outline" size={20} color="#6b7280" />
          <Text variant="bodySmall" style={styles.timeText}>
            Takes only 5 minutes to complete
          </Text>
        </View>

        {/* Decorative Background Gradient */}
        <LinearGradient
          colors={['rgba(124, 58, 237, 0.05)', 'rgba(168, 85, 247, 0.05)']}
          style={styles.backgroundGradient}
        />
      </View>
    </View>
  );
};

export default EmptyCompanyState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  content: {
    maxWidth: 500,
    width: '100%',
    alignItems: 'center',
    position: 'relative'
  },
  iconContainer: {
    marginBottom: 32,
    alignItems: 'center',
    position: 'relative'
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e9d5ff'
  },
  decorativeIcons: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  decorativeIcon: {
    position: 'absolute'
  },
  title: {
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16
  },
  benefitsList: {
    width: '100%',
    marginBottom: 32,
    gap: 12
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8
  },
  benefitText: {
    color: '#374151',
    flex: 1
  },
  button: {
    width: '100%',
    paddingVertical: 8
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16
  },
  timeText: {
    color: '#6b7280',
    fontStyle: 'italic'
  },
  backgroundGradient: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    zIndex: -1,
    borderRadius: 200
  }
});
