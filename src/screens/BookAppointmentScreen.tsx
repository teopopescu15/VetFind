/**
 * BookAppointmentScreen - Enhanced appointment booking with calendar and time slots
 *
 * Phase 3 Features:
 * - Company and service information header
 * - Calendar selection (next 30 days)
 * - Time slot grid showing available slots
 * - Real-time availability checking
 * - Booking confirmation with notes
 * - Material Design 3 styling
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Chip,
  Divider,
  Surface,
  Portal,
  Modal,
} from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/api';
import { CompanyService } from '../types/company.types';
import { DayAvailability, TimeSlot } from '../types/appointment.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BookAppointmentScreenProps {
  route: any;
  navigation: any;
}

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get day name from date
 */
const getDayName = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

/**
 * Format time to 12-hour format
 */
const formatTime12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Format duration
 */
const formatDuration = (minutes?: number): string => {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours} hr`;
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format price range
 */
const formatPrice = (min: number, max: number): string => {
  if (min === max) return `$${min.toFixed(0)}`;
  return `$${min.toFixed(0)} - $${max.toFixed(0)}`;
};

export const BookAppointmentScreen = ({ route, navigation }: BookAppointmentScreenProps) => {
  const { companyId, companyName, service } = route.params as {
    companyId: number;
    companyName: string;
    service: CompanyService;
  };

  // State management
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableDays, setAvailableDays] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Generate next 30 days for calendar
  const [calendarDates, setCalendarDates] = useState<Date[]>([]);

  useEffect(() => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    setCalendarDates(dates);
  }, []);

  // Fetch available slots when component mounts
  useEffect(() => {
    loadAvailableSlots();
  }, [companyId, service.id]);

  /**
   * Load available slots for the next 30 days
   */
  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 30);

      const slots = await ApiService.getAvailableSlots(
        companyId,
        service.id,
        formatDate(today),
        formatDate(endDate)
      );

      setAvailableDays(slots);
    } catch (error: any) {
      console.error('Failed to load available slots:', error);
      Alert.alert('Error', 'Failed to load available time slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get availability for a specific date
   */
  const getAvailabilityForDate = (date: Date): DayAvailability | undefined => {
    const dateStr = formatDate(date);
    return availableDays.find((day) => day.date === dateStr);
  };

  /**
   * Get slots for selected date
   */
  const getSlotsForSelectedDate = (): TimeSlot[] => {
    if (!selectedDate) return [];
    const availability = getAvailabilityForDate(selectedDate);
    return availability?.slots || [];
  };

  /**
   * Check if a date has available slots
   */
  const hasAvailableSlots = (date: Date): boolean => {
    const availability = getAvailabilityForDate(date);
    return availability?.slots.some((slot) => slot.available) || false;
  };

  /**
   * Handle date selection
   */
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null); // Reset slot selection
  };

  /**
   * Handle slot selection
   */
  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    }
  };

  /**
   * Handle booking confirmation
   */
  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      Alert.alert('Selection Required', 'Please select a date and time for your appointment.');
      return;
    }

    try {
      setLoading(true);

      const appointmentData = {
        clinic_id: companyId,
        service_id: service.id,
        appointment_date: selectedSlot.datetime,
        notes: notes.trim() || undefined,
      };

      await ApiService.createAppointment(appointmentData);

      setShowConfirmModal(false);

      Alert.alert(
        'Success!',
        'Your appointment has been confirmed.',
        [
          {
            text: 'View Appointments',
            onPress: () => navigation.navigate('MyAppointments'),
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Booking error:', error);
      Alert.alert('Error', error.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const slots = getSlotsForSelectedDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <Surface style={styles.headerSection} elevation={1}>
          <View style={styles.headerContent}>
            <View style={styles.companyInfo}>
              <MaterialCommunityIcons name="office-building" size={24} color="#7c3aed" />
              <View style={styles.companyTextContainer}>
                <Text style={styles.companyName}>{companyName}</Text>
                <Text style={styles.headerLabel}>Booking Appointment</Text>
              </View>
            </View>
          </View>

          {/* Selected Service Card */}
          <Card style={styles.serviceCard} mode="outlined">
            <Card.Content>
              <View style={styles.serviceHeader}>
                <MaterialCommunityIcons name="medical-bag" size={20} color="#7c3aed" />
                <Text style={styles.serviceLabel}>Selected Service</Text>
              </View>
              <Text style={styles.serviceName}>{service.service_name}</Text>
              <View style={styles.serviceDetails}>
                {service.duration_minutes && (
                  <Chip
                    icon={() => <Ionicons name="time-outline" size={14} color="#6b7280" />}
                    style={styles.detailChip}
                    textStyle={styles.chipText}
                  >
                    {formatDuration(service.duration_minutes)}
                  </Chip>
                )}
                <Chip style={styles.priceChip} textStyle={styles.priceChipText}>
                  {formatPrice(service.price_min, service.price_max)}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        </Surface>

        {/* Calendar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarScroll}
          >
            {calendarDates.map((date, index) => {
              const isSelected = selectedDate && formatDate(selectedDate) === formatDate(date);
              const isAvailable = hasAvailableSlots(date);
              const isPast = date < today;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateCard,
                    isSelected && styles.dateCardSelected,
                    !isAvailable && styles.dateCardDisabled,
                  ]}
                  onPress={() => handleDateSelect(date)}
                  disabled={!isAvailable || isPast}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dateDayName,
                      isSelected && styles.dateTextSelected,
                      !isAvailable && styles.dateTextDisabled,
                    ]}
                  >
                    {getDayName(date)}
                  </Text>
                  <Text
                    style={[
                      styles.dateNumber,
                      isSelected && styles.dateTextSelected,
                      !isAvailable && styles.dateTextDisabled,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  {isAvailable && !isSelected && <View style={styles.availableDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <Divider />

        {/* Time Slots Section */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Available Times - {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7c3aed" />
                <Text style={styles.loadingText}>Loading available slots...</Text>
              </View>
            ) : slots.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="calendar-remove" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>No available time slots</Text>
                <Text style={styles.emptySubtext}>Please select another date</Text>
              </View>
            ) : (
              <View style={styles.slotsGrid}>
                {slots.map((slot, index) => {
                  const isSelected = selectedSlot?.time === slot.time;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.slotChip,
                        isSelected && styles.slotChipSelected,
                        !slot.available && styles.slotChipDisabled,
                      ]}
                      onPress={() => handleSlotSelect(slot)}
                      disabled={!slot.available}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.slotText,
                          isSelected && styles.slotTextSelected,
                          !slot.available && styles.slotTextDisabled,
                        ]}
                      >
                        {formatTime12Hour(slot.time)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Notes Section */}
        {selectedSlot && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
            <TextInput
              mode="outlined"
              placeholder="Any special requests or information about your pet..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              style={styles.notesInput}
              outlineColor="#e5e7eb"
              activeOutlineColor="#7c3aed"
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Button */}
      {selectedSlot && (
        <Surface style={styles.bottomBar} elevation={4}>
          <View style={styles.bottomBarContent}>
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryLabel}>Selected Time</Text>
              <Text style={styles.summaryValue}>
                {selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at{' '}
                {formatTime12Hour(selectedSlot.time)}
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => setShowConfirmModal(true)}
              style={styles.bookButton}
              contentStyle={styles.bookButtonContent}
              labelStyle={styles.bookButtonLabel}
              buttonColor="#7c3aed"
            >
              Confirm Booking
            </Button>
          </View>
        </Surface>
      )}

      {/* Confirmation Modal */}
      <Portal>
        <Modal
          visible={showConfirmModal}
          onDismiss={() => setShowConfirmModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <View style={styles.modalHeader}>
                <MaterialCommunityIcons name="check-circle" size={48} color="#7c3aed" />
                <Text style={styles.modalTitle}>Confirm Appointment</Text>
              </View>

              <Divider style={styles.modalDivider} />

              <View style={styles.confirmationDetails}>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Company:</Text>
                  <Text style={styles.confirmValue}>{companyName}</Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Service:</Text>
                  <Text style={styles.confirmValue}>{service.service_name}</Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Date & Time:</Text>
                  <Text style={styles.confirmValue}>
                    {selectedDate?.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'long',
                      day: 'numeric'
                    })}
                    {'\n'}
                    {selectedSlot && formatTime12Hour(selectedSlot.time)}
                  </Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Duration:</Text>
                  <Text style={styles.confirmValue}>
                    {formatDuration(service.duration_minutes)}
                  </Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Price:</Text>
                  <Text style={styles.confirmValue}>
                    {formatPrice(service.price_min, service.price_max)}
                  </Text>
                </View>
              </View>
            </Card.Content>

            <Card.Actions style={styles.modalActions}>
              <Button onPress={() => setShowConfirmModal(false)} textColor="#6b7280">
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleBookAppointment}
                loading={loading}
                disabled={loading}
                buttonColor="#7c3aed"
              >
                Confirm
              </Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerSection: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    marginBottom: 16,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  companyTextContainer: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  serviceCard: {
    backgroundColor: '#f3e8ff',
    borderColor: '#7c3aed',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  serviceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  detailChip: {
    backgroundColor: '#ffffff',
  },
  chipText: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceChip: {
    backgroundColor: '#7c3aed',
  },
  priceChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
  },
  calendarScroll: {
    gap: 12,
  },
  dateCard: {
    width: 60,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCardSelected: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  dateCardDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#f3f4f6',
    opacity: 0.5,
  },
  dateDayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  dateTextSelected: {
    color: '#ffffff',
  },
  dateTextDisabled: {
    color: '#d1d5db',
  },
  availableDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10b981',
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minWidth: (SCREEN_WIDTH - 64) / 3,
    alignItems: 'center',
  },
  slotChipSelected: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  slotChipDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#f3f4f6',
    opacity: 0.4,
  },
  slotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  slotTextSelected: {
    color: '#ffffff',
  },
  slotTextDisabled: {
    color: '#d1d5db',
  },
  notesInput: {
    backgroundColor: '#ffffff',
  },
  bottomBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  bookButton: {
    borderRadius: 8,
  },
  bookButtonContent: {
    paddingHorizontal: 16,
  },
  bookButtonLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalContainer: {
    margin: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 12,
  },
  modalDivider: {
    marginVertical: 16,
  },
  confirmationDetails: {
    gap: 16,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  confirmLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    flex: 1,
  },
  confirmValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 2,
    textAlign: 'right',
  },
  modalActions: {
    justifyContent: 'flex-end',
    paddingTop: 8,
  },
});

export default BookAppointmentScreen;
