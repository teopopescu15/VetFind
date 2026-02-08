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
  const [busyIds, setBusyIds] = useState<number[]>([]);

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
      Alert.alert('Eroare', 'Nu s-au putut încărca programările.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalVisible(true);
  };

  const handleAccept = async (appointment: Appointment) => {
    if (!appointment.id) return;

    // Optimistic UI: mark as confirmed immediately
    const prevStatus = appointment.status;
    setAppointments((prev) => prev.map((a) => (a.id === appointment.id ? { ...a, status: 'confirmed' } : a)));
    setBusyIds((b) => [...b, appointment.id!]);

    try {
  // Use the standard ApiService PATCH endpoint for appointment updates
  await ApiService.updateAppointment(appointment.id!, { status: 'confirmed' } as any);
      // success - reload to ensure fresh data
      loadAppointments();
      onRefresh?.();
    } catch (error: any) {
      // revert and show detailed error
      setAppointments((prev) => prev.map((a) => (a.id === appointment.id ? { ...a, status: prevStatus } : a)));
      console.error('Accept appointment error:', error);
      Alert.alert('Eroare la acceptare', (error && (error.message || String(error))) || 'Nu s-a putut accepta programarea.');
    } finally {
      setBusyIds((b) => b.filter((id) => id !== appointment.id));
    }
  };

  const handleReject = async (appointment: Appointment) => {
    if (!appointment.id) return;

    const prevStatus = appointment.status;
    setAppointments((prev) => prev.map((a) => (a.id === appointment.id ? { ...a, status: 'cancelled' } : a)));
    setBusyIds((b) => [...b, appointment.id!]);

    try {
      // Try to update the appointment status via the standard PATCH endpoint
      await ApiService.updateAppointment(appointment.id!, { status: 'cancelled' } as any);
      // success - reload to ensure fresh data
      loadAppointments();
      onRefresh?.();
    } catch (error: any) {
      // If the PATCH update fails (CORS/404/network or other), try the dedicated cancel endpoint as a fallback
      console.warn('Update to cancelled failed, attempting cancel endpoint as fallback', error);
      try {
        const cancelled = await ApiService.cancelAppointment(appointment.id!);
        if (cancelled) {
          // refresh list after successful cancel
          loadAppointments();
          onRefresh?.();
          return;
        }
        // if cancel endpoint returned false, fallthrough to revert + alert
        throw new Error('Cancel endpoint did not succeed');
      } catch (fallbackError: any) {
        // revert optimistic change
        setAppointments((prev) => prev.map((a) => (a.id === appointment.id ? { ...a, status: prevStatus } : a)));
        console.error('Cancel appointment error (fallback):', fallbackError);
        Alert.alert('Eroare la anulare', (fallbackError && (fallbackError.message || String(fallbackError))) || 'Nu s-a putut anula programarea.');
      }
    } finally {
      setBusyIds((b) => b.filter((id) => id !== appointment.id));
    }
  };

  const handleSaveAppointment = async (updatedData: Partial<Appointment>) => {
    if (!selectedAppointment) return;

    try {
      await ApiService.updateAppointment(selectedAppointment.id!, updatedData);
      Alert.alert('Succes', 'Programarea a fost actualizată.');
      setIsEditModalVisible(false);
      setSelectedAppointment(null);
      loadAppointments();
      onRefresh?.();
    } catch (error: any) {
      Alert.alert('Eroare', error.message || 'Nu s-a putut actualiza programarea.');
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
            Gestionează programări
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
      <View style={styles.filterContainer}>
        <Chip
          mode={statusFilter === undefined ? 'flat' : 'outlined'}
          selected={statusFilter === undefined}
          onPress={() => setStatusFilter(undefined)}
          style={styles.filterChip}
          textStyle={statusFilter === undefined ? styles.filterChipTextActive : styles.filterChipText}
          compact
        >
          All
        </Chip>
        <Chip
          mode={statusFilter === 'pending' ? 'flat' : 'outlined'}
          selected={statusFilter === 'pending'}
          onPress={() => setStatusFilter('pending')}
          style={styles.filterChip}
          textStyle={statusFilter === 'pending' ? styles.filterChipTextActive : styles.filterChipText}
          compact
        >
          În așteptare
        </Chip>
        <Chip
          mode={statusFilter === 'confirmed' ? 'flat' : 'outlined'}
          selected={statusFilter === 'confirmed'}
          onPress={() => setStatusFilter('confirmed')}
          style={styles.filterChip}
          textStyle={statusFilter === 'confirmed' ? styles.filterChipTextActive : styles.filterChipText}
          compact
        >
          Confirmat
        </Chip>
        <Chip
          mode={statusFilter === 'completed' ? 'flat' : 'outlined'}
          selected={statusFilter === 'completed'}
          onPress={() => setStatusFilter('completed')}
          style={styles.filterChip}
          textStyle={statusFilter === 'completed' ? styles.filterChipTextActive : styles.filterChipText}
          compact
        >
          Finalizat
        </Chip>
        <Chip
          mode={statusFilter === 'cancelled' ? 'flat' : 'outlined'}
          selected={statusFilter === 'cancelled'}
          onPress={() => setStatusFilter('cancelled')}
          style={styles.filterChip}
          textStyle={statusFilter === 'cancelled' ? styles.filterChipTextActive : styles.filterChipText}
          compact
        >
          Anulate
        </Chip>
      </View>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={theme.colors.neutral[300]} />
          <Text variant="titleMedium" style={styles.emptyTitle}>
            Nu s-au găsit programări
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {statusFilter
              ? `Nicio programare ${({ pending: 'în așteptare', confirmed: 'confirmată', completed: 'finalizată', cancelled: 'anulată' } as Record<string, string>)[statusFilter] || statusFilter} în acest moment`
              : 'Programările tale vor apărea aici'}
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
                      {({ pending: 'În așteptare', confirmed: 'Confirmat', completed: 'Finalizat', cancelled: 'Anulat' } as Record<string, string>)[appointment.status] || appointment.status}
                    </Text>
                  </View>
                </View>

                {/* Client Info */}
                <View style={styles.clientInfo}>
                  <Ionicons name="person" size={16} color={theme.colors.neutral[600]} />
                  <Text variant="bodyMedium" style={styles.clientName}>
                    {(appointment as any).user_name || 'Client necunoscut'}
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
                      Note:
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
                    Editează
                  </Button>
                  {appointment.status === 'pending' && (
                    <View style={styles.pendingActions}>
                      <Button
                        mode="contained"
                        onPress={() => handleAccept(appointment)}
                        style={styles.acceptButton}
                        compact
                        disabled={busyIds.includes(appointment.id)}
                      >
                        {busyIds.includes(appointment.id) ? 'Se procesează...' : 'Acceptă'}
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => handleReject(appointment)}
                        style={styles.rejectButton}
                        compact
                        disabled={busyIds.includes(appointment.id)}
                      >
                        {busyIds.includes(appointment.id) ? 'Se procesează...' : 'Anulare'}
                      </Button>
                    </View>
                  )}
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
  },
  pendingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  acceptButton: {
    marginLeft: theme.spacing.sm,
  },
  rejectButton: {
    marginLeft: theme.spacing.xs,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    rowGap: theme.spacing.xs,
  },
  filterChip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: 2,
  },
  filterChipText: {
    color: theme.colors.neutral[600],
    fontSize: 12,
  },
  filterChipTextActive: {
    color: theme.colors.primary.main,
    fontWeight: '600',
    fontSize: 12,
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
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 11,
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
