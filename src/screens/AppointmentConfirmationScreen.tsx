/**
 * AppointmentConfirmationScreen - Success screen after booking appointment
 *
 * Features:
 * - Success animation with terracotta checkmark
 * - Appointment summary card
 * - Action buttons: View Appointments, Add to Calendar, Get Directions
 * - Warm professional design (blue/terracotta palette from Redesign.md)
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Divider,
  Surface,
} from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import type { Appointment } from '../types/appointment.types';
import type { Company } from '../types/company.types';

interface AppointmentConfirmationScreenProps {
  route: any;
  navigation: any;
}

/**
 * Format date to readable format
 */
const formatAppointmentDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format time to 12-hour format
 */
const formatAppointmentTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const AppointmentConfirmationScreen = ({
  route,
  navigation,
}: AppointmentConfirmationScreenProps) => {
  const { colors, responsive } = useTheme();
  const { appointment } = route.params as { appointment: Appointment };

  /**
   * Navigate to My Appointments screen
   */
  const handleViewAppointments = () => {
    navigation.navigate('MyAppointments');
  };

  /**
   * Add appointment to device calendar
   */
  const handleAddToCalendar = async () => {
    // TODO: Implement with expo-calendar when available
    // For now, just show a message
    console.log('Add to calendar functionality will be implemented with expo-calendar');

    // Future implementation:
    // const { status } = await Calendar.requestCalendarPermissionsAsync();
    // if (status === 'granted') {
    //   await Calendar.createEventAsync(defaultCalendarId, {
    //     title: `Vet Appointment - ${appointment.service_name}`,
    //     startDate: new Date(appointment.appointment_date),
    //     endDate: new Date(new Date(appointment.appointment_date).getTime() + 30 * 60000),
    //     location: appointment.company?.address,
    //   });
    // }
  };

  /**
   * Open directions to clinic in maps app
   */
  const handleGetDirections = () => {
    const company = appointment.company;
    if (!company) return;

    const address = encodeURIComponent(company.address || '');
    const label = encodeURIComponent(company.name || 'Clinic');

    let url = '';
    if (Platform.OS === 'ios') {
      url = `maps://app?daddr=${address}&q=${label}`;
    } else {
      url = `geo:0,0?q=${address}(${label})`;
    }

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to Google Maps web
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
      }
    });
  };

  /**
   * Go back to dashboard
   */
  const handleDone = () => {
    navigation.navigate('Dashboard');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Back Button at Top */}
      <View style={[styles.topBar, { backgroundColor: colors.surface.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleDone}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text.primary }]}>Confirmation</Text>
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.surface.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Success Icon - Terracotta Accent */}
        <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="check-circle"
          size={responsive.getValue(80, 96, 112)}
          color={colors.accent.main} // #ea580c terracotta
        />
      </View>

      {/* Success Message */}
      <Text
        style={[
          styles.title,
          {
            color: colors.text.primary,
            fontSize: responsive.getValue(24, 28, 32),
          },
        ]}
      >
        Appointment Confirmed!
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color: colors.text.secondary,
            fontSize: responsive.getValue(14, 16, 18),
          },
        ]}
      >
        Your appointment has been successfully booked
      </Text>

      {/* Appointment Summary Card */}
      <Card
        style={[
          styles.summaryCard,
          {
            backgroundColor: colors.surface.card,
            marginHorizontal: responsive.padding,
          },
        ]}
        mode="elevated"
      >
        <Card.Content>
          {/* Company Information */}
          <View style={styles.section}>
            <View style={styles.iconRow}>
              <MaterialCommunityIcons
                name="office-building"
                size={20}
                color={colors.primary.main}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text.secondary },
                ]}
              >
                Clinic
              </Text>
            </View>
            <Text
              style={[
                styles.sectionValue,
                { color: colors.text.primary },
              ]}
            >
              {appointment.company?.name || 'Clinic Name'}
            </Text>
            {appointment.company?.address && (
              <Text
                style={[
                  styles.sectionSubvalue,
                  { color: colors.text.secondary },
                ]}
              >
                {appointment.company.address}
              </Text>
            )}
            {appointment.company?.phone && (
              <Text
                style={[
                  styles.sectionSubvalue,
                  { color: colors.text.secondary },
                ]}
              >
                📞 {appointment.company.phone}
              </Text>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Service Information */}
          <View style={styles.section}>
            <View style={styles.iconRow}>
              <MaterialCommunityIcons
                name="medical-bag"
                size={20}
                color={colors.primary.main}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text.secondary },
                ]}
              >
                Service
              </Text>
            </View>
            <Text
              style={[
                styles.sectionValue,
                { color: colors.text.primary },
              ]}
            >
              {appointment.service?.service_name || 'Service'}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Date & Time */}
          <View style={styles.section}>
            <View style={styles.iconRow}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={20}
                color={colors.primary.main}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text.secondary },
                ]}
              >
                Date & Time
              </Text>
            </View>
            <Text
              style={[
                styles.sectionValue,
                { color: colors.text.primary },
              ]}
            >
              {formatAppointmentDate(appointment.appointment_date)}
            </Text>
            <Text
              style={[
                styles.sectionSubvalue,
                { color: colors.accent.main }, // Terracotta for time
                { fontWeight: '700' },
              ]}
            >
              {formatAppointmentTime(appointment.appointment_date)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Appointment ID */}
          <View style={styles.section}>
            <View style={styles.iconRow}>
              <MaterialCommunityIcons
                name="identifier"
                size={20}
                color={colors.primary.main}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text.secondary },
                ]}
              >
                Appointment ID
              </Text>
            </View>
            <Text
              style={[
                styles.sectionValue,
                { color: colors.text.primary },
              ]}
            >
              #{appointment.id}
            </Text>
          </View>

          {/* Notes (if any) */}
          {appointment.notes && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <View style={styles.iconRow}>
                  <MaterialCommunityIcons
                    name="note-text"
                    size={20}
                    color={colors.primary.main}
                  />
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: colors.text.secondary },
                    ]}
                  >
                    Notes
                  </Text>
                </View>
                <Text
                  style={[
                    styles.sectionSubvalue,
                    { color: colors.text.primary },
                  ]}
                >
                  {appointment.notes}
                </Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View
        style={[
          styles.actionsContainer,
          { paddingHorizontal: responsive.padding },
        ]}
      >
        {/* Primary Action - View My Appointments (Blue) */}
        <Button
          mode="contained"
          onPress={handleViewAppointments}
          style={styles.primaryButton}
          buttonColor={colors.primary.main} // #2563eb blue
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          View My Appointments
        </Button>

        {/* Secondary Actions */}
        <View style={styles.secondaryActions}>
          {/* Add to Calendar (Terracotta) */}
          <Button
            mode="outlined"
            onPress={handleAddToCalendar}
            style={styles.secondaryButton}
            textColor={colors.accent.main} // #ea580c terracotta
            buttonColor="transparent"
            icon="calendar-plus"
          >
            Add to Calendar
          </Button>

          {/* Get Directions (Terracotta) */}
          <Button
            mode="outlined"
            onPress={handleGetDirections}
            style={styles.secondaryButton}
            textColor={colors.accent.main} // #ea580c terracotta
            buttonColor="transparent"
            icon="map-marker"
          >
            Get Directions
          </Button>
        </View>

        {/* Done Button - Return to Dashboard */}
        <Button
          mode="contained"
          onPress={handleDone}
          style={styles.doneButton}
          buttonColor={colors.neutral[600]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="home"
        >
          Back to Dashboard
        </Button>
      </View>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  summaryCard: {
    width: '100%',
    borderRadius: 16,
    marginBottom: 24,
  },
  section: {
    marginVertical: 8,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionSubvalue: {
    fontSize: 14,
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryActions: {
    gap: 12,
  },
  secondaryButton: {
    borderRadius: 12,
  },
  doneButton: {
    marginTop: 12,
    borderRadius: 12,
  },
});

export default AppointmentConfirmationScreen;
