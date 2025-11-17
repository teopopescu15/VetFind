import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform
} from 'react-native';
import { vetApi } from '../services/vetApi';

interface BookAppointmentScreenProps {
  route: any;
  navigation: any;
}

export const BookAppointmentScreen = ({ route, navigation }: BookAppointmentScreenProps) => {
  const { clinicId, clinicName, serviceId, serviceName } = route.params;

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!selectedDate) {
      Alert.alert('Required Field', 'Please select a date for your appointment.');
      return;
    }

    if (!selectedTime) {
      Alert.alert('Required Field', 'Please select a time for your appointment.');
      return;
    }

    try {
      setLoading(true);

      // Combine date and time
      const appointmentDateTime = `${selectedDate}T${selectedTime}:00`;

      const appointmentData = {
        clinic_id: clinicId,
        service_id: serviceId || undefined,
        appointment_date: appointmentDateTime,
        notes: notes.trim() || undefined,
        status: 'pending' as const
      };

      await vetApi.appointments.create(appointmentData);

      Alert.alert(
        'Success',
        'Your appointment has been booked successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to appointments list or back to clinic detail
              navigation.navigate('MyAppointments');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', error.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Book Appointment</Text>
        <Text style={styles.subtitle}>{clinicName}</Text>
      </View>

      <View style={styles.formContainer}>
        {serviceName && (
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceLabel}>Service Selected:</Text>
            <Text style={styles.serviceName}>{serviceName}</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Appointment Date *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholderTextColor="#999999"
          />
          <Text style={styles.helpText}>Format: 2025-11-20</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Appointment Time *</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM (24-hour format)"
            value={selectedTime}
            onChangeText={setSelectedTime}
            placeholderTextColor="#999999"
          />
          <Text style={styles.helpText}>Format: 14:30 for 2:30 PM</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any additional information about your pet or reason for visit..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999999"
          />
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>📝 Note:</Text>
          <Text style={styles.noteText}>
            Your appointment request will be sent to the clinic. They will contact you to confirm the appointment.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Booking...' : 'Book Appointment'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9
  },
  formContainer: {
    padding: 20
  },
  serviceInfo: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20
  },
  serviceLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32'
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333333'
  },
  textArea: {
    height: 100,
    paddingTop: 15
  },
  helpText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 5
  },
  noteBox: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 5
  },
  noteText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20
  },
  submitButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10
  },
  submitButtonDisabled: {
    backgroundColor: '#B0B0B0',
    opacity: 0.6
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700'
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default BookAppointmentScreen;
