import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OpeningHours, DaySchedule } from '../../types/company.types';

/**
 * OpeningHoursPicker Component
 * Day-wise schedule picker with dropdown time selection
 * Follows object-literal pattern (no classes)
 */

interface OpeningHoursPickerProps {
  value: OpeningHours;
  onChange: (hours: OpeningHours) => void;
  disabled?: boolean;
}

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Luni',
  tuesday: 'Marți',
  wednesday: 'Miercuri',
  thursday: 'Joi',
  friday: 'Vineri',
  saturday: 'Sâmbătă',
  sunday: 'Duminică',
};

// Generate time options from 00:00 to 23:30 in 30-minute intervals
const generateTimeOptions = (): string[] => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeStr);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

export const OpeningHoursPicker = ({
  value,
  onChange,
  disabled = false,
}: OpeningHoursPickerProps) => {
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [selectedTimeType, setSelectedTimeType] = useState<'open' | 'close'>('open');

  // Validate time range
  const isValidTimeRange = (openTime: string, closeTime: string): boolean => {
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    return closeMinutes > openMinutes;
  };

  // Toggle day open/closed
  const toggleDay = (day: DayOfWeek) => {
    if (disabled) return;

    const currentSchedule = value[day];
    const newSchedule: DaySchedule = currentSchedule?.closed
      ? { open: null, close: null, closed: false } // Allow null times initially
      : { open: null, close: null, closed: true };

    onChange({
      ...value,
      [day]: newSchedule,
    });
  };

  // Open time picker modal
  const openTimePicker = (day: DayOfWeek, type: 'open' | 'close') => {
    if (disabled) return;

    const schedule = value[day];
    if (!schedule || schedule.closed) return;

    setSelectedDay(day);
    setSelectedTimeType(type);
    setShowTimeModal(true);
  };

  // Handle time selection from modal
  const handleTimeSelect = (timeValue: string) => {
    if (!selectedDay) return;

    const schedule = value[selectedDay];
    if (!schedule) return;

    const newSchedule: DaySchedule = {
      ...schedule,
      [selectedTimeType]: timeValue,
    };

    // Validate range if both times are set
    if (selectedTimeType === 'close' && newSchedule.open && newSchedule.close) {
      if (!isValidTimeRange(newSchedule.open, newSchedule.close)) {
        Alert.alert(
          'Interval orar invalid',
          'Ora de închidere trebuie să fie după ora de deschidere.',
          [{ text: 'OK' }]
        );
        setShowTimeModal(false);
        return;
      }
    }

    onChange({
      ...value,
      [selectedDay]: newSchedule,
    });

    setShowTimeModal(false);
  };

  // Clear time value (set to null)
  const clearTime = (day: DayOfWeek, type: 'open' | 'close') => {
    if (disabled) return;

    const schedule = value[day];
    if (!schedule) return;

    const newSchedule: DaySchedule = {
      ...schedule,
      [type]: null,
    };

    onChange({
      ...value,
      [day]: newSchedule,
    });
  };

  // Copy hours to all days
  const copyToAllDays = (sourceDay: DayOfWeek) => {
    if (disabled) return;

    const sourceSchedule = value[sourceDay];
    if (!sourceSchedule) return;

    Alert.alert(
      'Copiază orarul',
      `Copiezi orarul de ${DAY_LABELS[sourceDay]} pentru toate celelalte zile?`,
      [
        {
          text: 'Anulează',
          style: 'cancel',
        },
        {
          text: 'Copiază',
          onPress: () => {
            const newHours: OpeningHours = {};
            DAYS.forEach((day) => {
              newHours[day] = { ...sourceSchedule };
            });
            onChange(newHours);
          },
        },
      ]
    );
  };

  // Render day card
  const renderDayCard = (day: DayOfWeek) => {
    const schedule = value[day];
    const isOpen = schedule && !schedule.closed;

    return (
      <View key={day} style={styles.dayCard}>
        <View style={styles.dayHeader}>
          <View style={styles.dayInfo}>
            <Text style={styles.dayLabel}>{DAY_LABELS[day]}</Text>
            {isOpen && schedule && (
              <Text style={[
                styles.timeText,
                (!schedule.open || !schedule.close) && styles.timeTextIncomplete,
              ]}>
                {schedule.open || '--:--'} - {schedule.close || '--:--'}
              </Text>
            )}
            {!isOpen && <Text style={styles.closedText}>Închis</Text>}
          </View>
          <View style={styles.dayActions}>
            <Switch
              value={isOpen}
              onValueChange={() => toggleDay(day)}
              disabled={disabled}
              trackColor={{ false: '#ccc', true: '#a78bfa' }}
              thumbColor={isOpen ? '#7c3aed' : '#f4f3f4'}
            />
          </View>
        </View>

        {isOpen && schedule && (
          <View style={styles.timeControls}>
            <View style={styles.timeInputGroup}>
              <TouchableOpacity
                style={[
                  styles.timeSelectButton,
                  !schedule.open && styles.timeSelectButtonEmpty,
                ]}
                onPress={() => openTimePicker(day, 'open')}
                disabled={disabled}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={schedule.open ? '#7c3aed' : '#999'}
                />
                <Text
                  style={[
                    styles.timeSelectText,
                    !schedule.open && styles.timeSelectTextEmpty,
                  ]}
                >
                  {schedule.open || 'Alege ora'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={schedule.open ? '#7c3aed' : '#999'}
                />
              </TouchableOpacity>
              <Text style={styles.inputLabel}>Deschidere</Text>
              {schedule.open && !disabled && (
                <TouchableOpacity
                  style={styles.clearButtonAbsolute}
                  onPress={() => clearTime(day, 'open')}
                >
                  <Ionicons name="close-circle" size={18} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.timeInputGroup}>
              <TouchableOpacity
                style={[
                  styles.timeSelectButton,
                  !schedule.close && styles.timeSelectButtonEmpty,
                ]}
                onPress={() => openTimePicker(day, 'close')}
                disabled={disabled}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={schedule.close ? '#7c3aed' : '#999'}
                />
                <Text
                  style={[
                    styles.timeSelectText,
                    !schedule.close && styles.timeSelectTextEmpty,
                  ]}
                >
                  {schedule.close || 'Alege ora'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={schedule.close ? '#7c3aed' : '#999'}
                />
              </TouchableOpacity>
              <Text style={styles.inputLabel}>Închidere</Text>
              {schedule.close && !disabled && (
                <TouchableOpacity
                  style={styles.clearButtonAbsolute}
                  onPress={() => clearTime(day, 'close')}
                >
                  <Ionicons name="close-circle" size={18} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            {!disabled && (schedule.open || schedule.close) && (
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToAllDays(day)}
              >
                <Ionicons name="copy-outline" size={18} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Program</Text>
        <Text style={styles.subtitle}>Selectează orele de deschidere și închidere</Text>
      </View>

      <ScrollView style={styles.daysContainer} showsVerticalScrollIndicator={false}>
        {DAYS.map(renderDayCard)}
      </ScrollView>

      {/* Time Selection Modal */}
      <Modal
        visible={showTimeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Selectează ora de {selectedTimeType === 'open' ? 'deschidere' : 'închidere'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowTimeModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.timeOptionsContainer}>
              {TIME_OPTIONS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={styles.timeOption}
                  onPress={() => handleTimeSelect(time)}
                >
                  <Ionicons name="time-outline" size={20} color="#7c3aed" />
                  <Text style={styles.timeOptionText}>{time}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  daysContainer: {
    maxHeight: 400,
  },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: {
    flex: 1,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  timeTextIncomplete: {
    color: '#999',
    fontStyle: 'italic',
  },
  closedText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  dayActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    gap: 8,
  },
  timeInputGroup: {
    flex: 1,
    position: 'relative',
  },
  timeSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  timeSelectButtonEmpty: {
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  timeSelectText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  timeSelectTextEmpty: {
    color: '#999',
    fontStyle: 'italic',
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 2,
  },
  clearButtonAbsolute: {
    position: 'absolute',
    right: 40,
    top: 10,
    padding: 4,
    zIndex: 1,
  },
  copyButton: {
    backgroundColor: '#f3f4f6',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  timeOptionsContainer: {
    maxHeight: 400,
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  timeOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});
