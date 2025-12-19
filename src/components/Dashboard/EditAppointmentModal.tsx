import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, Button, TextInput, Chip, Portal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Appointment } from '../../types/appointment.types';
import { theme } from '../../theme';

export interface EditAppointmentModalProps {
  visible: boolean;
  appointment: Appointment;
  onSave: (data: Partial<Appointment>) => void;
  onCancel: () => void;
}

export const EditAppointmentModal = ({
  visible,
  appointment,
  onSave,
  onCancel,
}: EditAppointmentModalProps) => {
  const [appointmentDate, setAppointmentDate] = useState<Date>(new Date(appointment.appointment_date));
  const [status, setStatus] = useState<string>(appointment.status);
  const [notes, setNotes] = useState<string>(appointment.notes || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Reset form when appointment changes
  useEffect(() => {
    setAppointmentDate(new Date(appointment.appointment_date));
    setStatus(appointment.status);
    setNotes(appointment.notes || '');
  }, [appointment]);

  const handleSave = () => {
    const updatedData: Partial<Appointment> = {
      appointment_date: appointmentDate,
      status: status as any,
      notes: notes,
    };

    onSave(updatedData);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setAppointmentDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDate = new Date(appointmentDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setAppointmentDate(newDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case 'confirmed':
        return theme.colors.success.main;
      case 'pending':
        return theme.colors.warning.main;
      case 'cancelled':
        return theme.colors.error.main;
      case 'completed':
        return theme.colors.neutral[500];
      default:
        return theme.colors.neutral[400];
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text variant="titleLarge" style={styles.modalTitle}>
                Edit Appointment
              </Text>
              <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Client Info (Read-only) */}
              <View style={styles.section}>
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Client Information
                </Text>
                <View style={styles.infoRow}>
                  <Ionicons name="person" size={20} color={theme.colors.neutral[600]} />
                  <Text variant="bodyMedium" style={styles.infoText}>
                    {(appointment as any).user_name || 'Unknown Client'}
                  </Text>
                </View>
                {(appointment as any).user_email && (
                  <View style={styles.infoRow}>
                    <Ionicons name="mail" size={20} color={theme.colors.neutral[600]} />
                    <Text variant="bodyMedium" style={styles.infoText}>
                      {(appointment as any).user_email}
                    </Text>
                  </View>
                )}
              </View>

              {/* Service Info (Read-only) */}
              {(appointment as any).service_name && (
                <View style={styles.section}>
                  <Text variant="titleSmall" style={styles.sectionTitle}>
                    Service
                  </Text>
                  <View style={styles.serviceCard}>
                    <Ionicons name="medical" size={20} color={theme.colors.primary.main} />
                    <Text variant="bodyMedium" style={styles.serviceName}>
                      {(appointment as any).service_name}
                    </Text>
                  </View>
                </View>
              )}

              {/* Date & Time Picker */}
              <View style={styles.section}>
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Date & Time
                </Text>

                {/* Date Selector */}
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.dateTimeContent}>
                    <Ionicons name="calendar-outline" size={20} color={theme.colors.primary.main} />
                    <Text variant="bodyMedium" style={styles.dateTimeText}>
                      {formatDate(appointmentDate)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
                </TouchableOpacity>

                {/* Time Selector */}
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <View style={styles.dateTimeContent}>
                    <Ionicons name="time-outline" size={20} color={theme.colors.primary.main} />
                    <Text variant="bodyMedium" style={styles.dateTimeText}>
                      {formatTime(appointmentDate)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
                </TouchableOpacity>

                {/* Date Picker */}
                {showDatePicker && (
                  <DateTimePicker
                    value={appointmentDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}

                {/* Time Picker */}
                {showTimePicker && (
                  <DateTimePicker
                    value={appointmentDate}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                  />
                )}
              </View>

              {/* Status Selector */}
              <View style={styles.section}>
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Appointment Status
                </Text>
                <View style={styles.statusChips}>
                  <Chip
                    mode={status === 'pending' ? 'flat' : 'outlined'}
                    selected={status === 'pending'}
                    onPress={() => setStatus('pending')}
                    style={[
                      styles.statusChip,
                      status === 'pending' && { backgroundColor: theme.colors.warning[100] },
                    ]}
                    textStyle={[
                      styles.statusChipText,
                      status === 'pending' && { color: theme.colors.warning.main },
                    ]}
                  >
                    Pending
                  </Chip>
                  <Chip
                    mode={status === 'confirmed' ? 'flat' : 'outlined'}
                    selected={status === 'confirmed'}
                    onPress={() => setStatus('confirmed')}
                    style={[
                      styles.statusChip,
                      status === 'confirmed' && { backgroundColor: theme.colors.success[100] },
                    ]}
                    textStyle={[
                      styles.statusChipText,
                      status === 'confirmed' && { color: theme.colors.success.main },
                    ]}
                  >
                    Confirmed
                  </Chip>
                  <Chip
                    mode={status === 'completed' ? 'flat' : 'outlined'}
                    selected={status === 'completed'}
                    onPress={() => setStatus('completed')}
                    style={[
                      styles.statusChip,
                      status === 'completed' && { backgroundColor: theme.colors.neutral[200] },
                    ]}
                    textStyle={[
                      styles.statusChipText,
                      status === 'completed' && { color: theme.colors.neutral[700] },
                    ]}
                  >
                    Completed
                  </Chip>
                  <Chip
                    mode={status === 'cancelled' ? 'flat' : 'outlined'}
                    selected={status === 'cancelled'}
                    onPress={() => setStatus('cancelled')}
                    style={[
                      styles.statusChip,
                      status === 'cancelled' && { backgroundColor: theme.colors.error[100] },
                    ]}
                    textStyle={[
                      styles.statusChipText,
                      status === 'cancelled' && { color: theme.colors.error.main },
                    ]}
                  >
                    Cancelled
                  </Chip>
                </View>
              </View>

              {/* Notes */}
              <View style={styles.section}>
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Notes
                </Text>
                <TextInput
                  mode="outlined"
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any notes or comments..."
                  multiline
                  numberOfLines={4}
                  style={styles.notesInput}
                  outlineColor={theme.colors.neutral[300]}
                  activeOutlineColor={theme.colors.primary.main}
                />
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={onCancel}
                style={styles.cancelButton}
                labelStyle={styles.cancelButtonLabel}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.saveButton}
                labelStyle={styles.saveButtonLabel}
                buttonColor={theme.colors.primary.main}
              >
                Save Changes
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  modalTitle: {
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontWeight: '600',
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    color: theme.colors.neutral[800],
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary[50],
    borderRadius: 12,
  },
  serviceName: {
    color: theme.colors.primary[700],
    fontWeight: '600',
  },
  dateTimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    marginBottom: theme.spacing.sm,
  },
  dateTimeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dateTimeText: {
    color: theme.colors.neutral[800],
    fontWeight: '500',
  },
  statusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statusChip: {
    borderRadius: 8,
  },
  statusChipText: {
    fontWeight: '600',
    fontSize: 13,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
  },
  cancelButton: {
    flex: 1,
    borderColor: theme.colors.neutral[300],
  },
  cancelButtonLabel: {
    color: theme.colors.neutral[700],
  },
  saveButton: {
    flex: 1,
  },
  saveButtonLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
