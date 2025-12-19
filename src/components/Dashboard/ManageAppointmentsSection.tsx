import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, IconButton, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../services/api';
import { Appointment } from '../../types/appointment.types';
import { theme } from '../../theme';
import { EditAppointmentModal } from './EditAppointmentModal';

export interface ManageAppointmentsSectionProps {
  onRefresh?: () => void;
}

export const ManageAppointmentsSection = ({ onRefresh }: ManageAppointmentsSectionProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await ApiService.getCompanyAppointments(undefined, statusFilter);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalVisible(true);
  };

  const handleSaveAppointment = async (updatedData: Partial<Appointment>) => {
    if (!selectedAppointment) return;

    try {
      await ApiService.updateAppointment(selectedAppointment.id!, updatedData);
      Alert.alert('Success', 'Appointment updated successfully');
      setIsEditModalVisible(false);
      setSelectedAppointment(null);
      loadAppointments();
      onRefresh?.();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update appointment');
    }
  };

  const handleCancelModal = () => {
    setIsEditModalVisible(false);
    setSelectedAppointment(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      case 'completed':
        return 'checkmark-done-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading appointments...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar" size={24} color={theme.colors.primary.main} />
          <Text variant="titleLarge" style={styles.title}>
            Manage Appointments
          </Text>
        </View>
        <Chip
          style={styles.countChip}
          textStyle={styles.countChipText}
          compact
        >
          {appointments.length}
        </Chip>
      </View>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <Chip
          mode={statusFilter === undefined ? 'flat' : 'outlined'}
          selected={statusFilter === undefined}
          onPress={() => setStatusFilter(undefined)}
          style={styles.filterChip}
          textStyle={statusFilter === undefined ? styles.filterChipTextActive : styles.filterChipText}
        >
          All
        </Chip>
        <Chip
          mode={statusFilter === 'pending' ? 'flat' : 'outlined'}
          selected={statusFilter === 'pending'}
          onPress={() => setStatusFilter('pending')}
          style={styles.filterChip}
          textStyle={statusFilter === 'pending' ? styles.filterChipTextActive : styles.filterChipText}
        >
          Pending
        </Chip>
        <Chip
          mode={statusFilter === 'confirmed' ? 'flat' : 'outlined'}
          selected={statusFilter === 'confirmed'}
          onPress={() => setStatusFilter('confirmed')}
          style={styles.filterChip}
          textStyle={statusFilter === 'confirmed' ? styles.filterChipTextActive : styles.filterChipText}
        >
          Confirmed
        </Chip>
        <Chip
          mode={statusFilter === 'completed' ? 'flat' : 'outlined'}
          selected={statusFilter === 'completed'}
          onPress={() => setStatusFilter('completed')}
          style={styles.filterChip}
          textStyle={statusFilter === 'completed' ? styles.filterChipTextActive : styles.filterChipText}
        >
          Completed
        </Chip>
        <Chip
          mode={statusFilter === 'cancelled' ? 'flat' : 'outlined'}
          selected={statusFilter === 'cancelled'}
          onPress={() => setStatusFilter('cancelled')}
          style={styles.filterChip}
          textStyle={statusFilter === 'cancelled' ? styles.filterChipTextActive : styles.filterChipText}
        >
          Cancelled
        </Chip>
      </ScrollView>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={theme.colors.neutral[300]} />
          <Text variant="titleMedium" style={styles.emptyTitle}>
            No appointments found
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {statusFilter
              ? `No ${statusFilter} appointments at the moment`
              : 'Your appointments will appear here'}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.appointmentsList} showsVerticalScrollIndicator={false}>
          {appointments.map((appointment) => (
            <Card key={appointment.id} style={styles.appointmentCard}>
              <Card.Content style={styles.cardContent}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.dateTimeContainer}>
                    <View style={styles.dateRow}>
                      <Ionicons name="calendar-outline" size={16} color={theme.colors.neutral[600]} />
                      <Text variant="bodyMedium" style={styles.dateText}>
                        {formatDate(appointment.appointment_date)}
                      </Text>
                    </View>
                    <View style={styles.timeRow}>
                      <Ionicons name="time-outline" size={16} color={theme.colors.neutral[600]} />
                      <Text variant="bodyMedium" style={styles.timeText}>
                        {formatTime(appointment.appointment_date)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statusContainer}>
                    <Ionicons
                      name={getStatusIcon(appointment.status) as any}
                      size={20}
                      color={getStatusColor(appointment.status)}
                    />
                    <Text
                      variant="bodySmall"
                      style={[styles.statusText, { color: getStatusColor(appointment.status) }]}
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Client Info */}
                <View style={styles.clientInfo}>
                  <Ionicons name="person" size={16} color={theme.colors.neutral[600]} />
                  <Text variant="bodyMedium" style={styles.clientName}>
                    {(appointment as any).user_name || 'Unknown Client'}
                  </Text>
                </View>
                {(appointment as any).user_email && (
                  <View style={styles.clientInfo}>
                    <Ionicons name="mail" size={16} color={theme.colors.neutral[600]} />
                    <Text variant="bodySmall" style={styles.clientEmail}>
                      {(appointment as any).user_email}
                    </Text>
                  </View>
                )}

                {/* Service Info */}
                {(appointment as any).service_name && (
                  <View style={styles.serviceInfo}>
                    <Ionicons name="medical" size={16} color={theme.colors.primary.main} />
                    <Text variant="bodyMedium" style={styles.serviceName}>
                      {(appointment as any).service_name}
                    </Text>
                  </View>
                )}

                {/* Notes */}
                {appointment.notes && (
                  <View style={styles.notesContainer}>
                    <Text variant="bodySmall" style={styles.notesLabel}>
                      Notes:
                    </Text>
                    <Text variant="bodySmall" style={styles.notesText}>
                      {appointment.notes}
                    </Text>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.actionsContainer}>
                  <Button
                    mode="outlined"
                    onPress={() => handleEditAppointment(appointment)}
                    icon="pencil"
                    style={styles.editButton}
                    labelStyle={styles.editButtonLabel}
                    compact
                  >
                    Edit
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* Edit Appointment Modal */}
      {selectedAppointment && (
        <EditAppointmentModal
          visible={isEditModalVisible}
          appointment={selectedAppointment}
          onSave={handleSaveAppointment}
          onCancel={handleCancelModal}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: theme.spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.neutral[600],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  countChip: {
    backgroundColor: theme.colors.primary[100],
  },
  countChipText: {
    color: theme.colors.primary[700],
    fontWeight: '600',
  },
  filterContainer: {
    marginBottom: theme.spacing.lg,
  },
  filterChip: {
    marginRight: theme.spacing.sm,
  },
  filterChipText: {
    color: theme.colors.neutral[600],
  },
  filterChipTextActive: {
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing['3xl'],
  },
  emptyTitle: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    color: theme.colors.neutral[700],
    fontWeight: '600',
  },
  emptyText: {
    color: theme.colors.neutral[500],
    textAlign: 'center',
  },
  appointmentsList: {
    flex: 1,
  },
  appointmentCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  dateTimeContainer: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  dateText: {
    color: theme.colors.neutral[700],
    fontWeight: '600',
  },
  timeText: {
    color: theme.colors.neutral[600],
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.neutral[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 8,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  clientName: {
    color: theme.colors.neutral[800],
    fontWeight: '600',
  },
  clientEmail: {
    color: theme.colors.neutral[600],
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
    borderRadius: 8,
  },
  serviceName: {
    color: theme.colors.primary[700],
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.neutral[50],
    borderRadius: 8,
  },
  notesLabel: {
    color: theme.colors.neutral[600],
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  notesText: {
    color: theme.colors.neutral[700],
  },
  actionsContainer: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    borderColor: theme.colors.primary.main,
  },
  editButtonLabel: {
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
});
