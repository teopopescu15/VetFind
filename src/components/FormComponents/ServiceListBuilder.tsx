import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CreateServiceDTO,
  ServiceTemplate,
  ServiceCategoryType,
} from '../../types/company.types';
import { ServiceCategoryLabelsRO } from '../../constants/serviceTranslations';

/**
 * ServiceListBuilder Component
 * Dynamic list builder for managing company services
 * Follows object-literal pattern (no classes)
 */

interface ServiceListBuilderProps {
  value: CreateServiceDTO[];
  onChange: (services: CreateServiceDTO[]) => void;
  templates: ServiceTemplate[];
  disabled?: boolean;
}

export const ServiceListBuilder = ({
  value,
  onChange,
  templates,
  disabled = false,
}: ServiceListBuilderProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Add new service
  const addService = () => {
    if (disabled) return;

    const newService: CreateServiceDTO = {
      category: 'routine_care',
      service_name: '',
      description: '',
      price_min: 0,
      price_max: 0,
      duration_minutes: 30,
      is_custom: true,
    };

    onChange([...value, newService]);
    setExpandedIndex(value.length);
  };

  // Remove service
  const removeService = (index: number) => {
    if (disabled) return;

    Alert.alert(
      'Eliminare serviciu',
      'Sigur vrei să elimini acest serviciu?',
      [
        { text: 'Anulare', style: 'cancel' },
        {
          text: 'Elimină',
          style: 'destructive',
          onPress: () => {
            const newServices = value.filter((_, i) => i !== index);
            onChange(newServices);
            if (expandedIndex === index) {
              setExpandedIndex(null);
            }
          },
        },
      ]
    );
  };

  // Update service field
  const updateService = (index: number, field: keyof CreateServiceDTO, fieldValue: any) => {
    if (disabled) return;

    const newServices = [...value];
    newServices[index] = {
      ...newServices[index],
      [field]: fieldValue,
    };
    onChange(newServices);
  };

  // Load templates
  const loadTemplate = (template: ServiceTemplate) => {
    const newService: CreateServiceDTO = {
      category: template.category,
      service_name: template.service_name,
      description: template.description,
      price_min: template.suggested_price_min,
      price_max: template.suggested_price_max,
      duration_minutes: template.duration_minutes,
      is_custom: false,
    };

    onChange([...value, newService]);
    setShowTemplates(false);
    setExpandedIndex(value.length);
  };

  // Render service card
  const renderServiceCard = (service: CreateServiceDTO, index: number) => {
    const isExpanded = expandedIndex === index;
    const isValid =
      service.service_name.trim().length > 0 &&
      service.price_min >= 0 &&
      service.price_max >= service.price_min;

    return (
      <View key={index} style={styles.serviceCard}>
        <TouchableOpacity
          style={styles.serviceHeader}
          onPress={() => setExpandedIndex(isExpanded ? null : index)}
          disabled={disabled}
        >
          <View style={styles.serviceHeaderLeft}>
            <Ionicons
              name={isValid ? 'checkmark-circle' : 'alert-circle'}
              size={20}
              color={isValid ? '#27ae60' : '#e74c3c'}
            />
            <View style={styles.serviceHeaderText}>
              <Text style={styles.serviceName} numberOfLines={1}>
                {service.service_name || 'Unnamed Service'}
              </Text>
              <Text style={styles.servicePrice}>
                {service.price_min} - {service.price_max} lei
              </Text>
            </View>
          </View>
          <View style={styles.serviceHeaderRight}>
            {!service.is_custom && (
              <View style={styles.templateBadge}>
                <Text style={styles.templateBadgeText}>Template</Text>
              </View>
            )}
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#666"
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.serviceForm}>
            {/* Category Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Categorie *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {Object.entries(ServiceCategoryLabelsRO).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.categoryChip,
                      service.category === key && styles.categoryChipSelected,
                    ]}
                    onPress={() => updateService(index, 'category', key as ServiceCategoryType)}
                    disabled={disabled}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        service.category === key && styles.categoryChipTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Service Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Denumire serviciu *</Text>
              <TextInput
                style={styles.input}
                value={service.service_name}
                onChangeText={(text) => updateService(index, 'service_name', text)}
                placeholder="ex.: Consult general"
                editable={!disabled}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Descriere</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={service.description}
                onChangeText={(text) => updateService(index, 'description', text)}
                placeholder="Scurtă descriere a serviciului"
                multiline
                numberOfLines={3}
                editable={!disabled}
              />
            </View>

            {/* Price Range */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>Preț min (lei) *</Text>
                <TextInput
                  style={styles.input}
                  value={String(service.price_min)}
                  onChangeText={(text) =>
                    updateService(index, 'price_min', parseInt(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  editable={!disabled}
                />
              </View>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>Preț max (lei) *</Text>
                <TextInput
                  style={styles.input}
                  value={String(service.price_max)}
                  onChangeText={(text) =>
                    updateService(index, 'price_max', parseInt(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  editable={!disabled}
                />
              </View>
            </View>

            {/* Duration */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                value={String(service.duration_minutes || '')}
                onChangeText={(text) =>
                  updateService(index, 'duration_minutes', parseInt(text) || undefined)
                }
                keyboardType="numeric"
                placeholder="30"
                editable={!disabled}
              />
            </View>

            {/* Remove Button */}
            {!disabled && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeService(index)}
              >
                <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                <Text style={styles.removeButtonText}>Elimină serviciul</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Services ({value.length})</Text>
        {!disabled && (
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={() => setShowTemplates(true)}>
              <Ionicons name="list-outline" size={18} color="#7c3aed" />
              <Text style={styles.headerButtonText}>Templates</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={addService}>
              <Ionicons name="add-circle-outline" size={18} color="#7c3aed" />
              <Text style={styles.headerButtonText}>Add Custom</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.servicesList} showsVerticalScrollIndicator={false}>
        {value.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Niciun serviciu adăugat încă</Text>
            {!disabled && (
              <TouchableOpacity style={styles.emptyButton} onPress={() => setShowTemplates(true)}>
                <Text style={styles.emptyButtonText}>Încarcă din șabloane</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          value.map((service, index) => renderServiceCard(service, index))
        )}
      </ScrollView>

      {/* Templates Modal */}
      <Modal
        visible={showTemplates}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTemplates(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Service Templates</Text>
            <TouchableOpacity onPress={() => setShowTemplates(false)}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.templatesList}>
            {templates.map((template, index) => (
              <TouchableOpacity
                key={index}
                style={styles.templateCard}
                onPress={() => loadTemplate(template)}
              >
                <View style={styles.templateHeader}>
                  <Text style={styles.templateName}>{template.service_name}</Text>
                  <Text style={styles.templatePrice}>
                    {template.suggested_price_min} - {template.suggested_price_max} lei
                  </Text>
                </View>
                <Text style={styles.templateCategory}>
                  {ServiceCategoryLabelsRO[template.category]}
                </Text>
                <Text style={styles.templateDescription} numberOfLines={2}>
                  {template.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f0ff',
    borderRadius: 8,
  },
  headerButtonText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '500',
  },
  servicesList: {
    maxHeight: 500,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    marginBottom: 12,
    overflow: 'hidden',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  serviceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  serviceHeaderText: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    color: '#666',
  },
  serviceHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  templateBadge: {
    backgroundColor: '#f3f0ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  templateBadgeText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '500',
  },
  serviceForm: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#7c3aed',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fee',
    marginTop: 8,
  },
  removeButtonText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  templatesList: {
    flex: 1,
    padding: 16,
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    padding: 16,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  templatePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7c3aed',
  },
  templateCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
  },
});
