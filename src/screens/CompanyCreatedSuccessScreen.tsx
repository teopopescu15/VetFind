import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

/**
 * CompanyCreatedSuccessScreen
 *
 * Full-screen success celebration displayed after company creation
 *
 * Features:
 * - Gradient background with celebration design
 * - Company name display
 * - Welcome message
 * - Navigation to dashboard
 * - Prevents back navigation (gestureEnabled: false in navigator)
 */
export const CompanyCreatedSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { companyName } = route.params as { companyId: number; companyName: string };

  const handleViewDashboard = () => {
    // Navigate to Company Dashboard
    navigation.navigate('CompanyDashboard' as never);
  };

  return (
    <LinearGradient
      colors={['#7c3aed', '#a855f7', '#c084fc']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="check-circle"
            size={120}
            color="#ffffff"
          />
        </View>

        {/* Success Message */}
        <Text style={styles.title}>
          Succes!
        </Text>

        <Text style={styles.subtitle}>
          Bine ai venit pe VetFinder
        </Text>

        {/* Company Name */}
        <View style={styles.companyNameContainer}>
          <Text style={styles.companyName}>
            {companyName}
          </Text>
        </View>

        {/* Message */}
        <Text style={styles.message}>
          Profilul clinicii tale veterinare a fost creat cu succes. Acum poți gestiona serviciile, programările și poți fi contactat de proprietarii de animale din zonă.
        </Text>

        {/* View Dashboard Button */}
        <Button
          mode="contained"
          onPress={handleViewDashboard}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon={() => <MaterialCommunityIcons name="view-dashboard" size={24} color="#7c3aed" />}
        >
          Mergi la panou
        </Button>

        {/* Decorative Elements */}
        <View style={styles.decorativeContainer}>
          <MaterialCommunityIcons name="paw" size={40} color="rgba(255, 255, 255, 0.3)" style={styles.paw1} />
          <MaterialCommunityIcons name="paw" size={30} color="rgba(255, 255, 255, 0.2)" style={styles.paw2} />
          <MaterialCommunityIcons name="paw" size={35} color="rgba(255, 255, 255, 0.25)" style={styles.paw3} />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.95,
  },
  companyNameContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  companyName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 48,
    opacity: 0.9,
    maxWidth: 400,
  },
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonContent: {
    height: 56,
    paddingHorizontal: 16,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7c3aed',
  },
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  paw1: {
    position: 'absolute',
    top: 100,
    left: 40,
    transform: [{ rotate: '-15deg' }],
  },
  paw2: {
    position: 'absolute',
    top: 150,
    right: 60,
    transform: [{ rotate: '25deg' }],
  },
  paw3: {
    position: 'absolute',
    bottom: 120,
    left: 50,
    transform: [{ rotate: '10deg' }],
  },
});
