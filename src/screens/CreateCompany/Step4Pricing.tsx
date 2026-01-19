import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Text, HelperText, Button, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SpecializationPricingForm } from '../../components/FormComponents/SpecializationPricingForm';
import { AddCustomServiceModal } from '../../components/FormComponents/AddCustomServiceModal';
import { MultiImageUploader } from '../../components/FormComponents/MultiImageUploader';
import { ScrollContainer } from '../../components/FormComponents/ScrollContainer';
import {
  Step4FormData,
  ServicePricingDTO,
  CategoryWithSpecializations,
} from '../../types/company.types';
import { ApiService } from '../../services/api';

export interface Step4PricingProps {
  data: Partial<Step4FormData>;
  onChange: (data: Partial<Step4FormData>) => void;
  errors?: { [key: string]: string };
  // New props for Phase 5
  selectedSpecializationIds: number[];
}

/**
 * Step 4: Pricing & Photos (Phase 5 Redesign)
 * - Services & Pricing: Display selected specializations from Step 3 with price range
 * - Add Custom Service: Allow adding custom services not in the predefined list
 * - Photo Gallery Upload (4-10 photos, camera + gallery)
 * - Full Description (multiline, 500 char limit, required)
 */
export const Step4Pricing = ({
  data,
  onChange,
  errors = {},
  selectedSpecializationIds,
}: Step4PricingProps) => {
  const [categories, setCategories] = useState<CategoryWithSpecializations[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({});

  const updateField = (field: keyof Step4FormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleFocus = (field: string) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field: string) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  // Load categories with specializations on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const fetchedCategories = await ApiService.getServiceCategoriesWithSpecializations();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Handle services change from SpecializationPricingForm
  const handleServicesChange = (services: ServicePricingDTO[]) => {
    updateField('services', services);
  };

  // Handle adding a custom service
  const handleAddCustomService = (service: ServicePricingDTO) => {
    const currentServices = data.services || [];
    updateField('services', [...currentServices, service]);
  };

  // Handle removing a custom service
  const handleRemoveCustomService = (index: number) => {
    const currentServices = data.services || [];
    const customServices = currentServices.filter((s) => s.is_custom);
    const nonCustomServices = currentServices.filter((s) => !s.is_custom);

    // Remove the custom service at the given index
    customServices.splice(index, 1);

    updateField('services', [...nonCustomServices, ...customServices]);
  };

  // Update a custom service field
  const updateCustomService = (index: number, field: keyof ServicePricingDTO, value: any) => {
    const currentServices = data.services || [];
    const nonCustomServices = currentServices.filter((s) => !s.is_custom);
    const customServices = currentServices.filter((s) => s.is_custom);

    if (index >= 0 && index < customServices.length) {
      customServices[index] = { ...customServices[index], [field]: value };
    }

    updateField('services', [...nonCustomServices, ...customServices]);
  };

  // Get custom services
  const customServices = (data.services || []).filter((s) => s.is_custom);

  // Validate price range for custom service
  const validateCustomPriceRange = (service: ServicePricingDTO): string | null => {
    if (service.price_min !== null && service.price_max !== null) {
      const min = parseFloat(service.price_min);
      const max = parseFloat(service.price_max);
      if (!isNaN(min) && !isNaN(max) && min > max) {
        return 'Min price cannot exceed max price';
      }
    }
    return null;
  };

  // Render a custom service card
  const renderCustomServiceCard = (service: ServicePricingDTO, index: number) => {
    const priceError = validateCustomPriceRange(service);
    const categoryName = service.category_id
      ? categories.find((c) => c.id === service.category_id)?.name || 'Custom'
      : 'Custom';

    return (
      <View key={`custom-${index}`} style={styles.customServiceCard}>
        <View style={styles.customServiceHeader}>
          <View style={styles.customServiceHeaderLeft}>
            <View style={styles.customBadge}>
              <Text style={styles.customBadgeText}>Custom</Text>
            </View>
            {service.category_id && (
              <Text style={styles.customCategoryBadge}>{categoryName}</Text>
            )}
          </View>
          <IconButton
            icon="close"
            size={18}
            iconColor="#ef4444"
            onPress={() => handleRemoveCustomService(index)}
            style={styles.removeButton}
            accessibilityLabel="Remove custom service"
          />
        </View>

        <TextInput
          mode="outlined"
          label="Nume serviciu"
          value={service.service_name}
          onChangeText={(text) => updateCustomService(index, 'service_name', text)}
          style={styles.customInput}
          outlineColor="#e5e7eb"
          activeOutlineColor="#7c3aed"
        />

        <View style={styles.customPriceRow}>
          <View style={styles.customPriceInputContainer}>
            <TextInput
              mode="outlined"
              label="Min Price"
              value={service.price_min || ''}
              onChangeText={(text) => updateCustomService(index, 'price_min', text)}
              keyboardType="decimal-pad"
              style={styles.customPriceInput}
              outlineColor="#e5e7eb"
              activeOutlineColor="#7c3aed"
              right={<TextInput.Affix text="RON" />}
              error={!!priceError}
            />
          </View>

          <Text style={styles.customPriceSeparator}>to</Text>

          <View style={styles.customPriceInputContainer}>
            <TextInput
              mode="outlined"
              label="Max Price"
              value={service.price_max || ''}
              onChangeText={(text) => updateCustomService(index, 'price_max', text)}
              keyboardType="decimal-pad"
              style={styles.customPriceInput}
              outlineColor="#e5e7eb"
              activeOutlineColor="#7c3aed"
              right={<TextInput.Affix text="RON" />}
              error={!!priceError}
            />
          </View>
        </View>

        {priceError && (
          <Text style={styles.customErrorText}>{priceError}</Text>
        )}

        <View style={styles.customDurationRow}>
          <TextInput
            mode="outlined"
            label="Duration"
            value={service.duration_minutes?.toString() || ''}
            onChangeText={(text) => {
              const duration = parseInt(text, 10);
              updateCustomService(index, 'duration_minutes', isNaN(duration) ? undefined : duration);
            }}
            keyboardType="number-pad"
            style={styles.customDurationInput}
            outlineColor="#e5e7eb"
            activeOutlineColor="#7c3aed"
            right={<TextInput.Affix text="min" />}
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Setează prețurile și prezintă clinica
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Oferă transparență prețurilor și construiește încredere cu fotografii
        </Text>
      </View>

      {/* Full Description */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Descrierea clinicii *
        </Text>
        <Text variant="bodySmall" style={styles.sectionDescription}>
          Oferă o descriere detaliată a clinicii tale (5-100 caractere)
        </Text>
        <TextInput
          label="Descriere completă *"
          value={data.description || ''}
          onChangeText={(text) => updateField('description', text)}
          onFocus={() => handleFocus('description')}
          onBlur={() => handleBlur('description')}
          mode="outlined"
          error={!!errors.description}
          multiline
          numberOfLines={5}
          maxLength={500}
          placeholder="Spune proprietarilor de animale despre clinica ta, echipa ta, filosofia ta și ce te face special..."
          style={[styles.input, styles.textArea]}
          outlineColor="#e5e7eb"
          activeOutlineColor="#7c3aed"
          accessibilityLabel="Clinic Description"
          accessibilityHint="Descriere detaliată a clinicii tale (5-100 caractere)"
        />
        <HelperText type="error" visible={!!errors.description}>
          {errors.description || ' '}
        </HelperText>
        <HelperText type="info" visible={!errors.description && (isFocused.description || !!data.description)}>
          {data.description ? `${data.description.length}/100 caractere` : '5-100 caractere necesare'}
        </HelperText>
      </View>

      {/* Services & Pricing Section */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Servicii și prețuri *
        </Text>
        <Text variant="bodySmall" style={styles.sectionDescription}>
          Setează prețurile pentru specializările selectate din Pasul 3
        </Text>

        {/* Selected Specializations Pricing */}
        {isLoadingCategories ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Se încarcă serviciile...</Text>
          </View>
        ) : (
          <SpecializationPricingForm
            selectedSpecializationIds={selectedSpecializationIds}
            categories={categories}
            services={data.services || []}
            onChange={handleServicesChange}
          />
        )}

        {/* Custom Services Section */}
        {customServices.length > 0 && (
          <View style={styles.customServicesSection}>
            <View style={styles.customSectionHeader}>
              <View style={styles.customSectionHeaderLeft}>
                <Ionicons name="add-circle" size={20} color="#7c3aed" />
                <Text style={styles.customSectionTitle}>Servicii personalizate</Text>
              </View>
              <Text style={styles.customCount}>{customServices.length}</Text>
            </View>

            <View style={styles.customServicesContainer}>
              {customServices.map((service, index) => renderCustomServiceCard(service, index))}
            </View>
          </View>
        )}

        {/* Add Custom Service Button */}
        <TouchableOpacity
          style={styles.addCustomButton}
          onPress={() => setShowAddCustomModal(true)}
          accessibilityLabel="Add custom service"
        >
          <Ionicons name="add-circle-outline" size={24} color="#7c3aed" />
          <Text style={styles.addCustomButtonText}>Adaugă serviciu personalizat</Text>
        </TouchableOpacity>

        {errors.services && (
          <HelperText type="error" visible={true}>
            {errors.services}
          </HelperText>
        )}
      </View>

      {/* Photo Gallery */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Fotografii clinică (Opțional)
        </Text>
        <Text variant="bodySmall" style={styles.sectionDescription}>
          Prezintă clinica ta cu fotografii (până la 10). Fotografiile ajută la construirea încrederii cu proprietarii de animale.
        </Text>
        <MultiImageUploader
          value={data.photos || []}
          onChange={(photos) => updateField('photos', photos)}
          minPhotos={0}
          maxPhotos={10}
          required={false}
        />
        {errors.photos && (
          <HelperText type="error" visible={true}>
            {errors.photos}
          </HelperText>
        )}
        <HelperText type="info">
          Adaugă fotografii cu interiorul, exteriorul, echipa și facilitățile clinicii tale
        </HelperText>
      </View>

      {/* Required Fields Notice */}
      <View style={styles.notice}>
        <Text variant="bodySmall" style={styles.noticeText}>
          * Câmpuri obligatorii
        </Text>
      </View>

      {/* Submission Notice */}
      <View style={styles.submissionNotice}>
        <Text variant="bodyMedium" style={styles.submissionNoticeTitle}>
          Gata să trimiți?
        </Text>
        <Text variant="bodySmall" style={styles.submissionNoticeText}>
          Revizuiește toate informațiile înainte de trimitere. Poți edita profilul mai târziu.
        </Text>
      </View>

      {/* Add Custom Service Modal */}
      <AddCustomServiceModal
        visible={showAddCustomModal}
        onClose={() => setShowAddCustomModal(false)}
        onAdd={handleAddCustomService}
        categories={categories}
      />
    </ScrollContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6b7280',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionDescription: {
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  // Custom Services
  customServicesSection: {
    marginTop: 24,
  },
  customSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customSectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  customCount: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  customServicesContainer: {
    gap: 12,
  },
  customServiceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    padding: 16,
  },
  customServiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customServiceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  customBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7c3aed',
  },
  customCategoryBadge: {
    fontSize: 11,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  removeButton: {
    margin: 0,
  },
  customInput: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  customPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  customPriceInputContainer: {
    flex: 1,
  },
  customPriceInput: {
    backgroundColor: '#fff',
    height: 44,
  },
  customPriceSeparator: {
    fontSize: 13,
    color: '#9ca3af',
  },
  customDurationRow: {
    width: '50%',
  },
  customDurationInput: {
    backgroundColor: '#fff',
    height: 44,
  },
  customErrorText: {
    fontSize: 12,
    color: '#ef4444',
    marginBottom: 8,
  },
  // Add Custom Button
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ddd6fe',
    backgroundColor: '#faf5ff',
    marginTop: 16,
    gap: 8,
  },
  addCustomButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7c3aed',
  },
  notice: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  noticeText: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  submissionNotice: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  submissionNoticeTitle: {
    fontWeight: '700',
    color: '#166534',
    marginBottom: 4,
  },
  submissionNoticeText: {
    color: '#15803d',
    lineHeight: 18,
  },
});
