import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, HelperText, SegmentedButtons } from 'react-native-paper';
import { MultiSelectCheckbox } from '../../components/FormComponents/MultiSelectCheckbox';
import { CategorySpecializationPicker } from '../../components/FormComponents/CategorySpecializationPicker';
import { ScrollContainer } from '../../components/FormComponents/ScrollContainer';
import { Step3FormData, ClinicType, Facility, PaymentMethod, CategoryWithSpecializations } from '../../types/company.types';
import { ApiService } from '../../services/api';

export interface Step3ServicesProps {
  data: Partial<Step3FormData>;
  onChange: (data: Partial<Step3FormData>) => void;
  errors?: { [key: string]: string };
}

/**
 * Step 3: Services & Specializations
 * - Clinic Type (required)
 * - Categories & Specializations (hierarchical picker, required, min 1 specialization)
 * - Available Facilities (multi-select, required, min 1)
 * - Number of Vets (optional)
 * - Years in Business (optional)
 * - Payment Methods (multi-select, required, min 1)
 */
export const Step3Services = ({ data, onChange, errors = {} }: Step3ServicesProps) => {
  const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({});

  // Categories state
  const [categories, setCategories] = useState<CategoryWithSpecializations[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | undefined>();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(undefined);

      try {
        const data = await ApiService.getServiceCategoriesWithSpecializations();
        setCategories(data);
      } catch (error: any) {
        console.error('Failed to fetch categories:', error);
        setCategoriesError(error.message || 'Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const updateField = (field: keyof Step3FormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleFocus = (field: string) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field: string) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  // Handle category selection changes
  const handleCategoryChange = useCallback((categoryIds: number[]) => {
    updateField('selected_categories', categoryIds);
  }, [data]);

  // Handle specialization selection changes
  const handleSpecializationChange = useCallback((specializationIds: number[]) => {
    updateField('selected_specializations', specializationIds);
  }, [data]);

  // Clinic Type Options
  const clinicTypeOptions = [
    { value: 'general_practice', label: 'General' },
    { value: 'emergency_care', label: 'Emergency' },
    { value: 'specialized_care', label: 'Specialty' },
    { value: 'mobile_vet', label: 'Mobile' },
    { value: 'emergency_24_7', label: '24/7' }
  ];

  // Facility Options
  const facilityOptions = [
    { label: 'Surgery Suite', value: 'surgery_room', icon: 'cut' as const },
    { label: 'Pharmacy', value: 'pharmacy', icon: 'medical' as const },
    { label: 'In-House Lab', value: 'in_house_lab', icon: 'flask' as const },
    { label: 'Isolation Ward', value: 'isolation_ward', icon: 'shield' as const },
    { label: 'Grooming Station', value: 'grooming_station', icon: 'cut' as const },
    { label: 'Parking', value: 'parking', icon: 'car' as const },
    { label: 'Wheelchair Access', value: 'wheelchair_accessible', icon: 'accessibility' as const },
    { label: 'Pickup/Dropoff', value: 'pickup_dropoff', icon: 'car' as const }
  ];

  // Payment Method Options
  const paymentMethodOptions = [
    { label: 'Cash', value: 'cash', icon: 'cash' as const },
    { label: 'Credit Card', value: 'credit_card', icon: 'card' as const },
    { label: 'Debit Card', value: 'debit_card', icon: 'card' as const },
    { label: 'Mobile Payment', value: 'mobile_payment', icon: 'phone-portrait' as const },
    { label: 'Pet Insurance', value: 'pet_insurance', icon: 'shield' as const }
  ];

  return (
    <ScrollContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          What Services Do You Offer?
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Showcase your expertise and specializations
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

      {/* Categories & Specializations - NEW Hierarchical Picker */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Services & Specializations *
        </Text>
        <Text variant="bodySmall" style={styles.sectionDescription}>
          Select the service categories and specific specializations you offer.
          Expand each category to see available services.
        </Text>
        <CategorySpecializationPicker
          categories={categories}
          selectedCategories={data.selected_categories || []}
          selectedSpecializations={data.selected_specializations || []}
          onCategoryChange={handleCategoryChange}
          onSpecializationChange={handleSpecializationChange}
          loading={categoriesLoading}
          error={categoriesError}
        />
        {errors.selected_specializations && (
          <HelperText type="error" visible={true}>
            {errors.selected_specializations}
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
    </ScrollContainer>
  );
};

const styles = StyleSheet.create({
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
