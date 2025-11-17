import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Text, HelperText, SegmentedButtons } from 'react-native-paper';
import { MultiSelectCheckbox } from '../../components/FormComponents/MultiSelectCheckbox';
import { Step3FormData, ClinicType, Specialization, Facility, PaymentMethod } from '../../types/company.types';
import { Ionicons } from '@expo/vector-icons';

export interface Step3ServicesProps {
  data: Step3FormData;
  onChange: (data: Step3FormData) => void;
  errors?: { [key: string]: string };
}

/**
 * Step 3: Services & Specializations
 * - Clinic Type (required)
 * - Specializations (multi-select, required, min 1)
 * - Available Facilities (multi-select, required, min 1)
 * - Number of Vets (optional)
 * - Years in Business (optional)
 * - Payment Methods (multi-select, required, min 1)
 */
export const Step3Services = ({ data, onChange, errors = {} }: Step3ServicesProps) => {
  const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({});

  const updateField = (field: keyof Step3FormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleFocus = (field: string) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field: string) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  // Clinic Type Options
  const clinicTypeOptions = [
    { value: 'general', label: 'General' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'specialty', label: 'Specialty' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'exotic', label: 'Exotic' }
  ];

  // Specialization Options
  const specializationOptions = [
    { label: 'General Care', value: 'general_care', icon: 'medical' as const },
    { label: 'Surgery', value: 'surgery', icon: 'cut' as const },
    { label: 'Dentistry', value: 'dentistry', icon: 'fitness' as const },
    { label: 'Dermatology', value: 'dermatology', icon: 'body' as const },
    { label: 'Cardiology', value: 'cardiology', icon: 'heart' as const },
    { label: 'Oncology', value: 'oncology', icon: 'medkit' as const },
    { label: 'Orthopedics', value: 'orthopedics', icon: 'body' as const },
    { label: 'Ophthalmology', value: 'ophthalmology', icon: 'eye' as const },
    { label: 'Neurology', value: 'neurology', icon: 'pulse' as const },
    { label: 'Internal Medicine', value: 'internal_medicine', icon: 'medical' as const },
    { label: 'Exotic Pets', value: 'exotic_pets', icon: 'bug' as const },
    { label: 'Emergency Care', value: 'emergency_care', icon: 'warning' as const },
    { label: 'Preventive Care', value: 'preventive_care', icon: 'shield-checkmark' as const }
  ];

  // Facility Options
  const facilityOptions = [
    { label: 'Surgery Suite', value: 'surgery_suite', icon: 'cut' as const },
    { label: 'Pharmacy', value: 'pharmacy', icon: 'medical' as const },
    { label: 'Laboratory', value: 'laboratory', icon: 'flask' as const },
    { label: 'X-Ray', value: 'xray', icon: 'scan' as const },
    { label: 'Ultrasound', value: 'ultrasound', icon: 'pulse' as const },
    { label: 'Grooming', value: 'grooming', icon: 'cut' as const },
    { label: 'Boarding', value: 'boarding', icon: 'bed' as const },
    { label: 'Pet Store', value: 'pet_store', icon: 'storefront' as const },
    { label: 'Parking', value: 'parking', icon: 'car' as const }
  ];

  // Payment Method Options
  const paymentMethodOptions = [
    { label: 'Cash', value: 'cash', icon: 'cash' as const },
    { label: 'Credit Card', value: 'credit_card', icon: 'card' as const },
    { label: 'Debit Card', value: 'debit_card', icon: 'card' as const },
    { label: 'Insurance', value: 'insurance', icon: 'shield' as const },
    { label: 'Payment Plans', value: 'payment_plans', icon: 'calendar' as const }
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Services & Specializations
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Tell us about the services and expertise you offer
        </Text>
      </View>

      {/* Clinic Type */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Clinic Type *
        </Text>
        <Text variant="bodySmall" style={styles.sectionDescription}>
          Select the primary type of your veterinary clinic
        </Text>
        <SegmentedButtons
          value={data.clinic_type || ''}
          onValueChange={(value) => updateField('clinic_type', value as ClinicType)}
          buttons={clinicTypeOptions}
          style={styles.segmentedButtons}
        />
        {errors.clinic_type && (
          <HelperText type="error" visible={true}>
            {errors.clinic_type}
          </HelperText>
        )}
      </View>

      {/* Specializations */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Specializations *
        </Text>
        <Text variant="bodySmall" style={styles.sectionDescription}>
          Select all areas of expertise (at least 1 required)
        </Text>
        <MultiSelectCheckbox
          title=""
          options={specializationOptions}
          value={data.specializations || []}
          onChange={(selected) => updateField('specializations', selected as Specialization[])}
          columns={2}
          minSelections={1}
        />
        {errors.specializations && (
          <HelperText type="error" visible={true}>
            {errors.specializations}
          </HelperText>
        )}
      </View>

      {/* Facilities */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Available Facilities *
        </Text>
        <Text variant="bodySmall" style={styles.sectionDescription}>
          Select all facilities available at your clinic (at least 1 required)
        </Text>
        <MultiSelectCheckbox
          title=""
          options={facilityOptions}
          value={data.facilities || []}
          onChange={(selected) => updateField('facilities', selected as Facility[])}
          columns={2}
          minSelections={1}
        />
        {errors.facilities && (
          <HelperText type="error" visible={true}>
            {errors.facilities}
          </HelperText>
        )}
      </View>

      {/* Payment Methods */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Payment Methods *
        </Text>
        <Text variant="bodySmall" style={styles.sectionDescription}>
          Select all accepted payment methods (at least 1 required)
        </Text>
        <MultiSelectCheckbox
          title=""
          options={paymentMethodOptions}
          value={data.payment_methods || []}
          onChange={(selected) => updateField('payment_methods', selected as PaymentMethod[])}
          columns={2}
          minSelections={1}
        />
        {errors.payment_methods && (
          <HelperText type="error" visible={true}>
            {errors.payment_methods}
          </HelperText>
        )}
      </View>

      {/* Number of Veterinarians */}
      <View style={styles.section}>
        <TextInput
          label="Number of Veterinarians (Optional)"
          value={data.num_veterinarians ? String(data.num_veterinarians) : ''}
          onChangeText={(text) => {
            const num = parseInt(text, 10);
            updateField('num_veterinarians', isNaN(num) ? undefined : num);
          }}
          onFocus={() => handleFocus('num_veterinarians')}
          onBlur={() => handleBlur('num_veterinarians')}
          mode="outlined"
          error={!!errors.num_veterinarians}
          keyboardType="number-pad"
          placeholder="e.g., 3"
          style={styles.input}
          outlineColor="#e5e7eb"
          activeOutlineColor="#7c3aed"
          accessibilityLabel="Number of Veterinarians"
          accessibilityHint="Optional number of veterinarians at your clinic"
        />
        <HelperText type="error" visible={!!errors.num_veterinarians}>
          {errors.num_veterinarians || ' '}
        </HelperText>
      </View>

      {/* Years in Business */}
      <View style={styles.section}>
        <TextInput
          label="Years in Business (Optional)"
          value={data.years_in_business ? String(data.years_in_business) : ''}
          onChangeText={(text) => {
            const num = parseInt(text, 10);
            updateField('years_in_business', isNaN(num) ? undefined : num);
          }}
          onFocus={() => handleFocus('years_in_business')}
          onBlur={() => handleBlur('years_in_business')}
          mode="outlined"
          error={!!errors.years_in_business}
          keyboardType="number-pad"
          placeholder="e.g., 10"
          style={styles.input}
          outlineColor="#e5e7eb"
          activeOutlineColor="#7c3aed"
          accessibilityLabel="Years in Business"
          accessibilityHint="Optional number of years your clinic has been operating"
        />
        <HelperText type="error" visible={!!errors.years_in_business}>
          {errors.years_in_business || ' '}
        </HelperText>
      </View>

      {/* Required Fields Notice */}
      <View style={styles.notice}>
        <Text variant="bodySmall" style={styles.noticeText}>
          * Required fields
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8
  },
  subtitle: {
    color: '#6b7280',
    lineHeight: 20
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  sectionDescription: {
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 18
  },
  input: {
    backgroundColor: '#fff'
  },
  segmentedButtons: {
    marginTop: 8
  },
  notice: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed'
  },
  noticeText: {
    color: '#6b7280',
    fontStyle: 'italic'
  }
});
