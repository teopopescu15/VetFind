import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { CategoryWithSpecializations, ServicePricingDTO } from '../../types/company.types';

/**
 * AddCustomServiceModal Component
 * Modal for adding custom services not in the predefined specialization list
 * Follows object-literal pattern (no classes)
 */

export interface AddCustomServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (service: ServicePricingDTO) => void;
  categories: CategoryWithSpecializations[];
}

interface FormErrors {
  service_name?: string;
  price_min?: string;
  price_max?: string;
  price_range?: string;
  category?: string;
}

export const AddCustomServiceModal = ({
  visible,
  onClose,
  onAdd,
  categories,
}: AddCustomServiceModalProps) => {
  // Form state
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [duration, setDuration] = useState('30');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setServiceName('');
    setDescription('');
    setPriceMin('');
    setPriceMax('');
    setDuration('30');
    setSelectedCategoryId(null);
    setErrors({});
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Service name validation
    if (!serviceName.trim()) {
      newErrors.service_name = 'Service name is required';
    } else if (serviceName.length > 100) {
      newErrors.service_name = 'Service name must be 100 characters or less';
    }

    // Price validation
    if (priceMin && priceMax) {
      const min = parseFloat(priceMin);
      const max = parseFloat(priceMax);
      if (!isNaN(min) && !isNaN(max) && min > max) {
        newErrors.price_range = 'Minimum price cannot exceed maximum price';
      }
    }

    // Price format validation
    if (priceMin && isNaN(parseFloat(priceMin))) {
      newErrors.price_min = 'Enter a valid price';
    }
    if (priceMax && isNaN(parseFloat(priceMax))) {
      newErrors.price_max = 'Enter a valid price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const newService: ServicePricingDTO = {
      specialization_id: undefined, // Custom services don't have a specialization
      category_id: selectedCategoryId || undefined,
      service_name: serviceName.trim(),
      description: description.trim() || undefined,
      price_min: priceMin || null,
      price_max: priceMax || null,
      duration_minutes: parseInt(duration, 10) || 30,
      is_custom: true,
    };

    onAdd(newService);
    onClose();
  };

  // Get selected category name
  const getSelectedCategoryName = (): string => {
    if (!selectedCategoryId) return 'Select a category (optional)';
    const category = categories.find((c) => c.id === selectedCategoryId);
    return category?.name || 'Select a category (optional)';
  };

  // Render category picker modal
  const renderCategoryPicker = () => (
    <Modal
      visible={showCategoryPicker}
      animationType="slide"
      transparent
      onRequestClose={() => setShowCategoryPicker(false)}
    >
      <Pressable
        style={styles.categoryPickerOverlay}
        onPress={() => setShowCategoryPicker(false)}
      >
        <View style={styles.categoryPickerContainer}>
          <View style={styles.categoryPickerHeader}>
            <Text style={styles.categoryPickerTitle}>Select Category</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(false)}
              accessibilityLabel="Close category picker"
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.categoryList}>
            {/* None option */}
            <TouchableOpacity
              style={[
                styles.categoryOption,
                !selectedCategoryId && styles.categoryOptionSelected,
              ]}
              onPress={() => {
                setSelectedCategoryId(null);
                setShowCategoryPicker(false);
              }}
            >
              <Text style={[
                styles.categoryOptionText,
                !selectedCategoryId && styles.categoryOptionTextSelected,
              ]}>
                None (Uncategorized)
              </Text>
              {!selectedCategoryId && (
                <Ionicons name="checkmark" size={20} color="#7c3aed" />
              )}
            </TouchableOpacity>

            {/* Category options */}
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  selectedCategoryId === category.id && styles.categoryOptionSelected,
                ]}
                onPress={() => {
                  setSelectedCategoryId(category.id);
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={[
                  styles.categoryOptionText,
                  selectedCategoryId === category.id && styles.categoryOptionTextSelected,
                ]}>
                  {category.name}
                </Text>
                {selectedCategoryId === category.id && (
                  <Ionicons name="checkmark" size={20} color="#7c3aed" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Ionicons name="add-circle" size={24} color="#7c3aed" />
              </View>
              <Text style={styles.headerTitle}>Add Custom Service</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close modal"
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* Service Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Name *</Text>
              <TextInput
                mode="outlined"
                placeholder="e.g., Senior Pet Wellness Check"
                value={serviceName}
                onChangeText={setServiceName}
                maxLength={100}
                style={styles.input}
                outlineColor="#e5e7eb"
                activeOutlineColor="#7c3aed"
                error={!!errors.service_name}
                accessibilityLabel="Service name"
              />
              {errors.service_name && (
                <Text style={styles.errorText}>{errors.service_name}</Text>
              )}
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setShowCategoryPicker(true)}
                accessibilityLabel="Select category"
              >
                <Text style={[
                  styles.categorySelectorText,
                  !selectedCategoryId && styles.categorySelectorPlaceholder,
                ]}>
                  {getSelectedCategoryName()}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>
              {errors.category && (
                <Text style={styles.errorText}>{errors.category}</Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                mode="outlined"
                placeholder="Brief description of the service"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={255}
                style={[styles.input, styles.textArea]}
                outlineColor="#e5e7eb"
                activeOutlineColor="#7c3aed"
                accessibilityLabel="Service description"
              />
            </View>

            {/* Price Range */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price Range</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceInputContainer}>
                  <TextInput
                    mode="outlined"
                    placeholder="Min"
                    value={priceMin}
                    onChangeText={setPriceMin}
                    keyboardType="decimal-pad"
                    style={styles.priceInput}
                    outlineColor="#e5e7eb"
                    activeOutlineColor="#7c3aed"
                    left={<TextInput.Affix text="$" />}
                    error={!!errors.price_min || !!errors.price_range}
                    accessibilityLabel="Minimum price"
                  />
                </View>

                <View style={styles.priceSeparator}>
                  <Text style={styles.priceSeparatorText}>to</Text>
                </View>

                <View style={styles.priceInputContainer}>
                  <TextInput
                    mode="outlined"
                    placeholder="Max"
                    value={priceMax}
                    onChangeText={setPriceMax}
                    keyboardType="decimal-pad"
                    style={styles.priceInput}
                    outlineColor="#e5e7eb"
                    activeOutlineColor="#7c3aed"
                    left={<TextInput.Affix text="$" />}
                    error={!!errors.price_max || !!errors.price_range}
                    accessibilityLabel="Maximum price"
                  />
                </View>
              </View>
              {errors.price_min && (
                <Text style={styles.errorText}>{errors.price_min}</Text>
              )}
              {errors.price_max && (
                <Text style={styles.errorText}>{errors.price_max}</Text>
              )}
              {errors.price_range && (
                <Text style={styles.errorText}>{errors.price_range}</Text>
              )}
              <Text style={styles.helperText}>
                Use same value for fixed price, or different values for price range
              </Text>
            </View>

            {/* Duration */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Duration</Text>
              <View style={styles.durationContainer}>
                <TextInput
                  mode="outlined"
                  placeholder="30"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                  style={styles.durationInput}
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#7c3aed"
                  right={<TextInput.Affix text="minutes" />}
                  accessibilityLabel="Service duration"
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonLabel}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.addButton}
              buttonColor="#7c3aed"
            >
              Add Service
            </Button>
          </View>
        </View>
      </View>

      {/* Category Picker Modal */}
      {renderCategoryPicker()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    padding: 16,
    backgroundColor: '#fff',
  },
  categorySelectorText: {
    fontSize: 14,
    color: '#111827',
  },
  categorySelectorPlaceholder: {
    color: '#9ca3af',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceInput: {
    backgroundColor: '#fff',
    height: 44,
  },
  priceSeparator: {
    paddingHorizontal: 4,
  },
  priceSeparatorText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  durationContainer: {
    width: '60%',
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
  helperText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonLabel: {
    color: '#6b7280',
  },
  addButton: {
    flex: 1,
  },
  // Category Picker styles
  categoryPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  categoryPickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
  },
  categoryPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  categoryList: {
    padding: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  categoryOptionSelected: {
    backgroundColor: '#f5f3ff',
  },
  categoryOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  categoryOptionTextSelected: {
    color: '#7c3aed',
    fontWeight: '500',
  },
});
