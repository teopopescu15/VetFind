import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { OpeningHours, DaySchedule } from '../../types/company.types';

/**
 * OpeningHoursPicker Component
 * Day-wise schedule picker with time selection
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
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const OpeningHoursPicker = ({
  value,
  onChange,
  disabled = false,
}: OpeningHoursPickerProps) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [selectedTimeType, setSelectedTimeType] = useState<'open' | 'close'>('open');

  // Parse time string to Date object
  const parseTime = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Format Date to time string
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Toggle day open/closed
  const toggleDay = (day: DayOfWeek) => {
    if (disabled) return;

    const currentSchedule = value[day];
    const newSchedule: DaySchedule = currentSchedule?.closed
      ? { open: '09:00', close: '17:00', closed: false }
      : { open: '00:00', close: '00:00', closed: true };

    onChange({
      ...value,
      [day]: newSchedule,
    });
  };

  // Show time picker
  const showTimePickerModal = (day: DayOfWeek, type: 'open' | 'close') => {
    if (disabled) return;

    const schedule = value[day];
    if (!schedule || schedule.closed) return;

    setSelectedDay(day);
    setSelectedTimeType(type);
    setShowTimePicker(true);
  };

  // Handle time change
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);

    if (selectedDate && selectedDay) {
      const schedule = value[selectedDay];
      if (!schedule) return;

      const timeStr = formatTime(selectedDate);

      const newSchedule: DaySchedule = {
        ...schedule,
        [selectedTimeType]: timeStr,
      };

      // Validate time range
      if (selectedTimeType === 'close') {
        const openTime = parseTime(newSchedule.open);
        const closeTime = selectedDate;

        if (closeTime <= openTime) {
          Alert.alert(
            'Invalid Time',
            'Closing time must be after opening time.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      onChange({
        ...value,
        [selectedDay]: newSchedule,
      });
    }
  };

  // Copy hours to all days
  const copyToAllDays = (sourceDay: DayOfWeek) => {
    if (disabled) return;

    const sourceSchedule = value[sourceDay];
    if (!sourceSchedule) return;

    Alert.alert(
      'Copy Hours',
      `Copy ${DAY_LABELS[sourceDay]}'s hours to all other days?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Copy',
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
              <Text style={styles.timeText}>
                {schedule.open} - {schedule.close}
              </Text>
            )}
            {!isOpen && <Text style={styles.closedText}>Closed</Text>}
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
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => showTimePickerModal(day, 'open')}
              disabled={disabled}
            >
              <Ionicons name="time-outline" size={20} color="#7c3aed" />
              <Text style={styles.timeButtonLabel}>Open: {schedule.open}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => showTimePickerModal(day, 'close')}
              disabled={disabled}
            >
              <Ionicons name="time-outline" size={20} color="#7c3aed" />
              <Text style={styles.timeButtonLabel}>Close: {schedule.close}</Text>
            </TouchableOpacity>

            {!disabled && (
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
        <Text style={styles.title}>Opening Hours</Text>
      </View>

      <ScrollView style={styles.daysContainer} showsVerticalScrollIndicator={false}>
        {DAYS.map(renderDayCard)}
      </ScrollView>

      {showTimePicker && selectedDay && (
        <DateTimePicker
          value={parseTime(
            selectedTimeType === 'open'
              ? value[selectedDay]?.open || '09:00'
              : value[selectedDay]?.close || '17:00'
          )}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={handleTimeChange}
        />
      )}
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
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  timeButtonLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  copyButton: {
    backgroundColor: '#f3f4f6',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
