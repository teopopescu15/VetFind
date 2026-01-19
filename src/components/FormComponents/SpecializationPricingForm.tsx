import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import {
  CategoryWithSpecializations,
  CategorySpecialization,
  ServicePricingDTO,
} from '../../types/company.types';

/**
 * SpecializationPricingForm Component
 * Displays selected specializations from Step 3 with pricing inputs
 * Groups services by category with price range (min/max) and duration
 * Follows object-literal pattern (no classes)
 */

export interface SpecializationPricingFormProps {
  selectedSpecializationIds: number[];
  categories: CategoryWithSpecializations[];
  services: ServicePricingDTO[];
  onChange: (services: ServicePricingDTO[]) => void;
  disabled?: boolean;
}

// Icon mapping for categories
const categoryIcons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  medical: 'medical',
  fitness: 'fitness',
  flask: 'flask',
  warning: 'warning',
  cut: 'cut',
  sparkles: 'sparkles',
  paw: 'paw',
  heart: 'heart',
};

// Get the icon for a category
const getCategoryIcon = (iconName?: string): keyof typeof Ionicons.glyphMap => {
  if (iconName && categoryIcons[iconName]) {
    return categoryIcons[iconName];
  }
  return 'medical';
};

export const SpecializationPricingForm = ({
  selectedSpecializationIds,
  categories,
  services,
  onChange,
  disabled = false,
}: SpecializationPricingFormProps) => {
  // Build a map of specialization ID to specialization details (including category info)
  const specializationMap = useMemo(() => {
    const map = new Map<number, CategorySpecialization & { category_name: string; category_icon?: string }>();
    categories.forEach((category) => {
      category.specializations.forEach((spec) => {
        map.set(spec.id, {
          ...spec,
          category_name: category.name,
          category_icon: category.icon,
        });
      });
    });
    return map;
  }, [categories]);

  // Group selected specializations by category
  const groupedSpecializations = useMemo(() => {
    const groups = new Map<string, { categoryId: number; categoryIcon?: string; specializations: (CategorySpecialization & { category_name: string })[] }>();

    selectedSpecializationIds.forEach((specId) => {
      const spec = specializationMap.get(specId);
      if (spec) {
        const categoryName = spec.category_name;
        if (!groups.has(categoryName)) {
          groups.set(categoryName, {
            categoryId: spec.category_id,
            categoryIcon: spec.category_icon,
            specializations: [],
          });
        }
        groups.get(categoryName)!.specializations.push(spec);
      }
    });

    // Sort specializations within each category by display_order
    groups.forEach((group) => {
      group.specializations.sort((a, b) => a.display_order - b.display_order);
    });

    return groups;
  }, [selectedSpecializationIds, specializationMap]);

  // Initialize services from selected specializations when they change
  useEffect(() => {
    console.log('🔵 [FIXED VERSION] SpecializationPricingForm useEffect triggered');
    console.log('🔵 Categories length:', categories.length);
    console.log('🔵 SpecializationMap size:', specializationMap.size);

    // Guard: Don't create services if categories haven't loaded yet
    if (categories.length === 0 || specializationMap.size === 0) {
      console.log('⚠️ [GUARD TRIGGERED] Categories not loaded yet, skipping service creation');
      console.log('⚠️ Categories:', categories);
      console.log('⚠️ Selected specialization IDs:', selectedSpecializationIds);
      return;
    }

    console.log('✅ Categories loaded, creating/updating services...');
    console.log('Selected specialization IDs:', selectedSpecializationIds);
    console.log('Specialization map size:', specializationMap.size);
    console.log('Existing services:', services);

    // Find which specializations are new (not in services yet) OR have empty names
    const existingSpecIds = new Set(
      services
        .filter((s) => !s.is_custom && s.specialization_id && s.service_name && s.service_name.trim() !== '')
        .map((s) => s.specialization_id!)
    );

    console.log('Existing spec IDs with valid names:', Array.from(existingSpecIds));

    const newSpecIds = selectedSpecializationIds.filter((id) => !existingSpecIds.has(id));
    console.log('New spec IDs to create:', newSpecIds);

    // Find which specializations were removed
    const removedServices = services.filter(
      (s) => !s.is_custom && s.specialization_id && !selectedSpecializationIds.includes(s.specialization_id)
    );

    console.log('Removed services:', removedServices.length);

    if (newSpecIds.length > 0 || removedServices.length > 0) {
      // Create new service entries for new specializations OR recreate services with empty names
      const newServices: ServicePricingDTO[] = newSpecIds.map((specId) => {
        const spec = specializationMap.get(specId);
        console.log('=== CREATING SERVICE FROM SPECIALIZATION ===');
        console.log('Specialization ID:', specId);
        console.log('Specialization data:', spec);
        console.log('Specialization name:', spec?.name);

        // CRITICAL FIX: Validate that spec exists and has a name
        if (!spec || !spec.name) {
          console.error(`❌ ERROR: Specialization ${specId} not found in specializationMap or missing name!`);
          console.error('Available specializations:', Array.from(specializationMap.keys()));
          console.error('Categories count:', categories.length);
        }

        // Check if there's an existing service with this specialization_id but empty name
        // If so, preserve the prices that user might have already entered
        const existingServiceWithEmptyName = services.find(
          (s) => s.specialization_id === specId && (!s.service_name || s.service_name.trim() === '')
        );

        const service = {
          specialization_id: specId,
          category_id: spec?.category_id,
          service_name: spec?.name || '',
          description: spec?.description || '',
          // Preserve existing prices if available
          price_min: existingServiceWithEmptyName?.price_min ?? null,
          price_max: existingServiceWithEmptyName?.price_max ?? null,
          duration_minutes: spec?.suggested_duration_minutes || 30,
          is_custom: false,
        };

        console.log('✅ Created service:', service);
        return service;
      });

      // Keep existing services with valid names AND custom services, then add new ones
      const updatedServices = [
        ...services.filter(
          (s) => (s.is_custom || (s.specialization_id && selectedSpecializationIds.includes(s.specialization_id) && s.service_name && s.service_name.trim() !== ''))
        ),
        ...newServices,
      ];

      console.log('📦 Final updated services:', updatedServices);
      onChange(updatedServices);
    } else {
      console.log('ℹ️ No new or removed specializations, keeping existing services');
    }
  }, [selectedSpecializationIds, specializationMap, categories.length]);

  // Update a service field
  const updateService = (specializationId: number, field: keyof ServicePricingDTO, value: any) => {
    const updatedServices = services.map((service) => {
      if (service.specialization_id === specializationId) {
        return { ...service, [field]: value };
      }
      return service;
    });
    onChange(updatedServices);
  };

  // Get service data for a specialization
  const getServiceData = (specializationId: number): ServicePricingDTO | undefined => {
    return services.find((s) => s.specialization_id === specializationId);
  };

  // Validate price (min should be <= max)
  const validatePriceRange = (service: ServicePricingDTO): string | null => {
    if (service.price_min !== null && service.price_max !== null) {
      const min = parseFloat(service.price_min);
      const max = parseFloat(service.price_max);
      if (!isNaN(min) && !isNaN(max) && min > max) {
        return 'Prețul minim nu poate depăși prețul maxim';
      }
    }
    return null;
  };

  // Render empty state
  if (selectedSpecializationIds.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="pricetags-outline" size={48} color="#9ca3af" />
        <Text style={styles.emptyTitle}>Niciun serviciu selectat</Text>
        <Text style={styles.emptyText}>
          Revino la Pasul 3 și selectează specializări pentru a seta prețurile.
        </Text>
      </View>
    );
  }

  // Render a service pricing card
  const renderServiceCard = (spec: CategorySpecialization & { category_name: string }) => {
    const serviceData = getServiceData(spec.id);
    const priceError = serviceData ? validatePriceRange(serviceData) : null;

    return (
      <View key={spec.id} style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{spec.name}</Text>
          {spec.description && (
            <Text style={styles.serviceDescription} numberOfLines={2}>
              {spec.description}
            </Text>
          )}
        </View>

        <View style={styles.inputsContainer}>
          {/* Price Range Row */}
          <View style={styles.priceRow}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.inputLabel}>Preț minim</Text>
              <TextInput
                mode="outlined"
                placeholder="0"
                value={serviceData?.price_min || ''}
                onChangeText={(text) => updateService(spec.id, 'price_min', text)}
                keyboardType="decimal-pad"
                disabled={disabled}
                style={styles.priceInput}
                outlineColor="#e5e7eb"
                activeOutlineColor="#7c3aed"
                right={<TextInput.Affix text="RON" />}
                error={!!priceError}
                accessibilityLabel={`Minimum price for ${spec.name}`}
              />
            </View>

            <View style={styles.priceSeparator}>
              <Text style={styles.priceSeparatorText}>până la</Text>
            </View>

            <View style={styles.priceInputContainer}>
              <Text style={styles.inputLabel}>Preț maxim</Text>
              <TextInput
                mode="outlined"
                placeholder="0"
                value={serviceData?.price_max || ''}
                onChangeText={(text) => updateService(spec.id, 'price_max', text)}
                keyboardType="decimal-pad"
                disabled={disabled}
                style={styles.priceInput}
                outlineColor="#e5e7eb"
                activeOutlineColor="#7c3aed"
                right={<TextInput.Affix text="RON" />}
                error={!!priceError}
                accessibilityLabel={`Maximum price for ${spec.name}`}
              />
            </View>
          </View>

          {priceError && (
            <Text style={styles.errorText}>{priceError}</Text>
          )}

          {/* Duration Row */}
          <View style={styles.durationRow}>
            <Text style={styles.inputLabel}>Durată</Text>
            <TextInput
              mode="outlined"
              placeholder="30"
              value={serviceData?.duration_minutes?.toString() || ''}
              onChangeText={(text) => {
                const duration = parseInt(text, 10);
                updateService(spec.id, 'duration_minutes', isNaN(duration) ? undefined : duration);
              }}
              keyboardType="number-pad"
              disabled={disabled}
              style={styles.durationInput}
              outlineColor="#e5e7eb"
              activeOutlineColor="#7c3aed"
              right={<TextInput.Affix text="min" />}
              accessibilityLabel={`Duration for ${spec.name}`}
            />
          </View>
        </View>
      </View>
    );
  };

  // Render category section
  const renderCategorySection = (categoryName: string, group: { categoryId: number; categoryIcon?: string; specializations: (CategorySpecialization & { category_name: string })[] }) => {
    return (
      <View key={categoryName} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryIconContainer}>
            <Ionicons
              name={getCategoryIcon(group.categoryIcon)}
              size={18}
              color="#7c3aed"
            />
          </View>
          <Text style={styles.categoryName}>{categoryName}</Text>
          <Text style={styles.categoryCount}>
            {group.specializations.length} service{group.specializations.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.servicesContainer}>
          {group.specializations.map(renderServiceCard)}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <Ionicons name="information-circle-outline" size={18} color="#6b7280" />
        <Text style={styles.headerInfoText}>
          Set pricing for each service. You can use a price range (min-max) for variable pricing, or set the same value for fixed pricing.
        </Text>
      </View>

      {Array.from(groupedSpecializations.entries()).map(([categoryName, group]) =>
        renderCategorySection(categoryName, group)
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  headerInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  categoryCount: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  servicesContainer: {
    gap: 12,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  serviceHeader: {
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  serviceDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 18,
  },
  inputsContainer: {
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  priceInputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  priceInput: {
    backgroundColor: '#fff',
    height: 44,
  },
  priceSeparator: {
    paddingBottom: 12,
  },
  priceSeparatorText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  durationRow: {
    width: '50%',
  },
  durationInput: {
    backgroundColor: '#fff',
    height: 44,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
