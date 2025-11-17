import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { vetApi } from '../services/vetApi';
import type { Appointment } from '../types/vet.types';

interface MyAppointmentsScreenProps {
  navigation: any;
}

export const MyAppointmentsScreen = ({ navigation }: MyAppointmentsScreenProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      let data: Appointment[];

      if (filter === 'upcoming') {
        data = await vetApi.appointments.getUpcoming();
      } else if (filter === 'past') {
        data = await vetApi.appointments.getPast();
      } else {
        data = await vetApi.appointments.getMyAppointments();
      }

      setAppointments(data);
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      Alert.alert('Error', 'Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = (appointmentId: number) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await vetApi.appointments.cancel(appointmentId);
              Alert.alert('Success', 'Appointment cancelled successfully');
              loadAppointments();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel appointment');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      case 'completed':
        return '#2196F3';
      default:
        return '#999999';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderAppointmentCard = ({ item }: { item: Appointment }) => {
    const appointmentDate = new Date(item.appointment_date);
    const isPast = appointmentDate < new Date();
    const canCancel = item.status === 'pending' || item.status === 'confirmed';

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.clinicName}>{item.clinic_name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📅 Date:</Text>
            <Text style={styles.infoValue}>{appointmentDate.toLocaleDateString()}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>⏰ Time:</Text>
            <Text style={styles.infoValue}>
              {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {item.service_name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🏥 Service:</Text>
              <Text style={styles.infoValue}>
                {item.service_name}
                {item.service_price && ` - $${item.service_price.toFixed(2)}`}
              </Text>
            </View>
          )}

          {item.clinic_address && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍 Location:</Text>
              <Text style={styles.infoValue}>{item.clinic_address}</Text>
            </View>
          )}

          {item.clinic_phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📞 Phone:</Text>
              <Text style={styles.infoValue}>{item.clinic_phone}</Text>
            </View>
          )}

          {item.notes && (
            <View style={styles.notesRow}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesValue}>{item.notes}</Text>
            </View>
          )}
        </View>

        {!isPast && canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelAppointment(item.id!)}
          >
            <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Appointments</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'upcoming' && styles.activeFilterButton]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterButtonText, filter === 'upcoming' && styles.activeFilterButtonText]}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'past' && styles.activeFilterButton]}
          onPress={() => setFilter('past')}
        >
          <Text style={[styles.filterButtonText, filter === 'past' && styles.activeFilterButtonText]}>
            Past
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilterButton]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.activeFilterButtonText]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No appointments found</Text>
          <Text style={styles.emptySubtext}>
            {filter === 'upcoming' ? 'You have no upcoming appointments' : 'No appointments to show'}
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('VetFinderHome')}
          >
            <Text style={styles.exploreButtonText}>Find a Clinic</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointmentCard}
          keyExtractor={(item) => item.id?.toString() || '0'}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  header: {
    backgroundColor: '#4ECDC4',
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 40
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 10
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F5F5F5'
  },
  activeFilterButton: {
    backgroundColor: '#4ECDC4'
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666'
  },
  activeFilterButtonText: {
    color: '#FFFFFF'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 20
  },
  exploreButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  listContainer: {
    padding: 15
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  clinicName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    flex: 1,
    marginRight: 10
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  cardBody: {
    marginBottom: 10
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    width: 100
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333333'
  },
  notesRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 5
  },
  notesValue: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20
  },
  cancelButton: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FF9800'
  },
  cancelButtonText: {
    color: '#E65100',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default MyAppointmentsScreen;
