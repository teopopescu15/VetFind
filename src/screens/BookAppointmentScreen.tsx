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
import { a11yProps, a11yLabels, touchTarget } from '../utils/accessibility';
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
import { useAuth } from '../context/AuthContext';
import AnimatedConfirmation from '../components/AnimatedConfirmation';

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
const formatPrice = (min: number | null | undefined, max: number | null | undefined): string => {
  // Convert to numbers and handle null/undefined
  const minPrice = Number(min) || 0;
  const maxPrice = Number(max) || minPrice;

  if (minPrice === maxPrice) return `$${minPrice.toFixed(0)}`;
  return `$${minPrice.toFixed(0)} - $${maxPrice.toFixed(0)}`;
};

export const BookAppointmentScreen = ({ route, navigation }: BookAppointmentScreenProps) => {
  // Support either selectedServices (multiple) or legacy single 'service'
  const params = route.params as any;
  const companyId: number = params.companyId;
  const companyName: string | undefined = params.companyName;
  const initialServices: CompanyService[] = params.selectedServices ?? (params.service ? [params.service] : []);

  const [selectedServicesState, setSelectedServicesState] = useState<CompanyService[]>(initialServices);

  // Total required duration is the sum of service durations
  const totalRequiredDuration = selectedServicesState.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || (params.serviceDuration || 0);
  const primaryService: CompanyService | undefined = selectedServicesState.length > 0 ? selectedServicesState[0] : (params.service ?? undefined);
  const { user } = useAuth();

  // Compute total price range across selected services
  const computeTotalPriceRange = (services: CompanyService[]) => {
    const minSum = services.reduce((sum, s) => sum + (Number(s.price_min) || 0), 0);
    const maxSum = services.reduce((sum, s) => sum + (Number(s.price_max) || 0), 0);
    return { min: minSum, max: maxSum };
  };
  const totalPrice = computeTotalPriceRange(selectedServicesState);

  // State management
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableDays, setAvailableDays] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAnimatedConfirm, setShowAnimatedConfirm] = useState(false);

  // Generate next 30 days for calendar
  const [calendarDates, setCalendarDates] = useState<Date[]>([]);

  const removeServiceById = (id: number) => {
    setSelectedServicesState((prev) => prev.filter((s) => s.id !== id));
  };

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
  }, [companyId, selectedServicesState.map((s: CompanyService) => s.id).join(','), totalRequiredDuration]);

  /**
   * Load available slots for the next 30 days
   */
  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 30);

      // Prefer the first selected service id, then fall back to known params.serviceId or legacy params.service?.id
      let serviceIdForQuery: number | undefined = selectedServicesState.length > 0
        ? selectedServicesState[0].id
        : undefined;

      if (!serviceIdForQuery) {
        serviceIdForQuery = params.serviceId ?? params.service?.id;
      }

      // Fallback: route may include selectedServiceIds as CSV or selectedServices as JSON/querystring
      if (!serviceIdForQuery && params.selectedServiceIds) {
        try {
          const ids = typeof params.selectedServiceIds === 'string'
            ? params.selectedServiceIds.split(',').map((v: string) => Number(v))
            : params.selectedServiceIds;
          if (Array.isArray(ids) && ids.length > 0) serviceIdForQuery = Number(ids[0]) || undefined;
        } catch (err) {
          // ignore
        }
      }

      if (!serviceIdForQuery && params.selectedServices) {
        try {
          const arr = typeof params.selectedServices === 'string' ? JSON.parse(params.selectedServices) : params.selectedServices;
          if (Array.isArray(arr) && arr.length > 0) {
            serviceIdForQuery = arr[0].id ?? arr[0].service_id ?? undefined;
          }
        } catch (err) {
          // ignore
        }
      }

      // Log the query so we can debug why the API may return no availability
      console.log('loadAvailableSlots: query', {
        companyId,
        serviceIdForQuery,
        from: formatDate(today),
        to: formatDate(endDate),
        duration: totalRequiredDuration,
      });

      // Only pass a duration if it's greater than zero; some backends treat 0 as invalid
      const durationParam = totalRequiredDuration && totalRequiredDuration > 0 ? totalRequiredDuration : undefined;

      if (!serviceIdForQuery) {
        console.warn('loadAvailableSlots: no serviceId available to query availability', { params });
        setAvailableDays([]);
        return;
      }

      const slots = await ApiService.getAvailableSlots(
        companyId,
        serviceIdForQuery,
        formatDate(today),
        formatDate(endDate),
        durationParam
      );

      console.log('loadAvailableSlots: response slots', slots);

      setAvailableDays(slots || []);
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

      // Create a single appointment for the first selected service and include others in notes
  const primaryServiceId = selectedServicesState.length > 0 ? selectedServicesState[0].id : params.serviceId;
  const otherServices = selectedServicesState.length > 1 ? selectedServicesState.slice(1) : [];

      if (!user || !user.id) {
        Alert.alert('Authentication required', 'Please sign in to book an appointment.');
        setLoading(false);
        return;
      }

      const appointmentData = {
        clinic_id: companyId,
        user_id: user.id,
        service_id: primaryServiceId,
        appointment_date: selectedSlot.datetime,
        notes: [
          notes.trim(),
          otherServices.length > 0 ? `Also includes services: ${otherServices.map((s: CompanyService) => s.service_name).join(', ')}` : undefined,
        ].filter(Boolean).join('\n') || undefined,
      } as any;

      await ApiService.createAppointment(appointmentData as any);

      setShowConfirmModal(false);

      // If the authenticated user is a pet owner (client), send them back to their dashboard
      // immediately after confirming the appointment.
      if (user?.role === 'user') {
        // Show an animated confirmation screen, then redirect to the user dashboard.
        setShowAnimatedConfirm(true);
        return;
      }

      // Fallback behaviour for other roles (e.g. vet companies): show the existing success alert
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
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            {...a11yProps.button('Go back', 'Navigate back to previous screen')}
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.companyInfo}>
              <MaterialCommunityIcons name="office-building" size={24} color="#2563eb" />
              <View style={styles.companyTextContainer}>
                <Text
                  style={styles.companyName}
                  {...a11yProps.header(companyName || '', 1)}
                >
                  {companyName}
                </Text>
                <Text style={styles.headerLabel}>Booking Appointment</Text>
              </View>
            </View>
          </View>

          {/* Selected Service Card */}
          <Card style={styles.serviceCard} mode="elevated" elevation={3}>
            <Card.Content>
              <View style={styles.serviceHeaderRow}>
                <View style={styles.serviceIconContainer}>
                  <MaterialCommunityIcons name="medical-bag" size={28} color="#7c3aed" />
                </View>
                <View style={styles.serviceInfoContainer}>
                  <Text style={styles.serviceLabel}>Programarea ta</Text>
                </View>
              </View>
              <Divider style={styles.serviceCardDivider} />
              <View style={styles.serviceDetails}>
                {(selectedServicesState.length > 0 || primaryService?.duration_minutes) && (
                  <Chip
                    icon={() => <Ionicons name="time-outline" size={16} color="#059669" />}
                    style={styles.detailChip}
                    textStyle={styles.chipText}
                  >
                    {formatDuration(totalRequiredDuration || primaryService?.duration_minutes)}
                  </Chip>
                )}
                <Chip
                  icon={() => <MaterialCommunityIcons name="currency-usd" size={16} color="#059669" />}
                  style={styles.priceChip}
                  textStyle={styles.priceChipText}
                >
                  {selectedServicesState.length > 0 ? formatPrice(totalPrice.min, totalPrice.max) : (primaryService ? formatPrice(primaryService.price_min, primaryService.price_max) : '—')}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        </Surface>

        {/* Selected services (editable) */}
        {selectedServicesState.length > 0 && (
          <View style={styles.selectedServicesRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectedServicesScroll}>
              {selectedServicesState.map((s) => (
                <Chip
                  key={s.id}
                  onClose={() => removeServiceById(s.id)}
                  style={styles.selectedServiceChip}
                  closeIcon={() => <Ionicons name="close" size={14} color="#374151" />}
                >
                  {s.service_name}
                </Chip>
              ))}
            </ScrollView>
            <View style={styles.totalDurationContainer}>
              <Text style={styles.totalDurationText}>{formatDuration(totalRequiredDuration)}</Text>
              <Text style={styles.totalPriceText}>{formatPrice(totalPrice.min, totalPrice.max)}</Text>
            </View>
          </View>
        )}

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
              const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const dayName = getDayName(date);

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
                  {...a11yProps.button(
                    a11yLabels.datePicker(dateStr, dayName, isAvailable),
                    isAvailable ? 'Select this date to view available appointment times' : 'No appointments available on this date',
                    !isAvailable || isPast
                  )}
                >
                  <Text
                    style={[
                      styles.dateDayName,
                      isSelected && styles.dateTextSelected,
                      !isAvailable && styles.dateTextDisabled,
                    ]}
                  >
                    {dayName}
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
              <View
                style={styles.loadingContainer}
                {...a11yProps.header(a11yLabels.loading('available appointment slots'), 2)}
              >
                <ActivityIndicator size="large" color="#2563eb" />
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
                  const formattedTime = formatTime12Hour(slot.time);
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
                      {...a11yProps.button(
                        a11yLabels.timeSlot(formattedTime, slot.available),
                        slot.available ? 'Book appointment at this time' : 'Time slot not available',
                        !slot.available
                      )}
                    >
                      <Text
                        style={[
                          styles.slotText,
                          isSelected && styles.slotTextSelected,
                          !slot.available && styles.slotTextDisabled,
                        ]}
                      >
                        {formattedTime}
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
              outlineColor="#e7e5e4"
              activeOutlineColor="#2563eb"
              {...a11yProps.textInput('Additional notes for veterinarian', false, 'Optional information about your pet or special requests')}
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
              buttonColor="#ea580c"
              {...a11yProps.button(
                'Confirm booking',
                'Proceed to confirm your appointment booking'
              )}
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
                  <Text style={styles.confirmLabel}>Service(s):</Text>
                  <View style={styles.confirmValue}>
                    {selectedServicesState.length > 0 ? (
                      selectedServicesState.map((s) => (
                        <View key={s.id} style={styles.confirmServiceRow}>
                          <Text style={styles.confirmValue}>{s.service_name}</Text>
                          <TouchableOpacity onPress={() => removeServiceById(s.id)}>
                            <Ionicons name="close-circle" size={18} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.confirmValue}>{primaryService?.service_name ?? '—'}</Text>
                    )}
                  </View>
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
                    {formatDuration(totalRequiredDuration)}
                  </Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Price:</Text>
                  <Text style={styles.confirmValue}>
                    {selectedServicesState.length > 0 ? formatPrice(totalPrice.min, totalPrice.max) : (primaryService ? formatPrice(primaryService.price_min, primaryService.price_max) : '—')}
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
      {/* Animated full-screen confirmation for pet owners */}
      <AnimatedConfirmation
        visible={showAnimatedConfirm}
        message="Programarea a fost trimisa. Așteaptă confirmarea clinicii."
        onFinish={() => {
          setShowAnimatedConfirm(false);
          // After animation completes, navigate to the user dashboard (they'll see the appointment as Pending)
          navigation.navigate('UserDashboard');
        }}
      />
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
    paddingTop: 20, // Safe area handled by SafeAreaView in parent
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceInfoContainer: {
    flex: 1,
  },
  serviceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
  },
  serviceCardDivider: {
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  detailChip: {
    backgroundColor: '#d1fae5',
    height: 36,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  priceChip: {
    backgroundColor: '#d1fae5',
    height: 36,
  },
  priceChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  selectedServicesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#ffffff',
    marginTop: 12,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  selectedServicesScroll: {
    alignItems: 'center',
  },
  selectedServiceChip: {
    marginRight: 8,
    backgroundColor: '#f3f4f6',
  },
  totalDurationContainer: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  totalDurationText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  totalPriceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7c3aed',
    marginTop: 6,
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
    minWidth: 68,
    minHeight: 92,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  dateCardSelected: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  dateCardDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#f3f4f6',
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
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
    paddingVertical: 16,
    paddingHorizontal: 22,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: '#e5e7eb',
    flex: 1,
    minWidth: '30%', // Responsive: will adapt to container width
    maxWidth: '32%', // Allows 3 columns with gap
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  slotChipSelected: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 7,
  },
  slotChipDisabled: {
    backgroundColor: '#f9fafb',
    borderColor: '#f3f4f6',
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
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
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
  confirmServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 6,
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
