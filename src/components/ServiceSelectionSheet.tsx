/**
 * ServiceSelectionSheet - Bottom sheet for service selection before booking
 *
 * Features:
 * - List of services grouped by category
 * - Search/filter by service name
 * - Service cards showing name, price, duration
 * - Material Design 3 styling with React Native Paper
 * - Smooth animations
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Searchbar,
  Divider,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { CompanyService, ServiceCategoryLabels, ServiceCategoryType } from '../types/company.types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ServiceSelectionSheetProps {
  visible: boolean;
  services: CompanyService[];
  companyName: string;
  onDismiss: () => void;
  onSelectService?: (service: CompanyService) => void;
  /** Optional offset from bottom of screen to position the sheet above a button (in px) */
  bottomOffset?: number;
  /** If true, allow selecting multiple services and confirm selection */
  multiSelect?: boolean;
  /** Callback when multiple services are selected (used when multiSelect=true) */
  onSelectServices?: (services: CompanyService[]) => void;
}

/**
 * Get category icon
 */
const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    routine_care: 'stethoscope',
    dental_care: 'tooth',
    diagnostic_services: 'microscope',
    emergency_care: 'ambulance',
    surgical_procedures: 'scalpel',
    grooming: 'content-cut',
    custom: 'star',
  };
  return iconMap[category] || 'paw';
};

/**
 * Format price range
 */
const formatPrice = (min: number | null | undefined, max: number | null | undefined): string => {
  // Convert to numbers and handle null/undefined
  const minPrice = Number(min) || 0;
  const maxPrice = Number(max) || minPrice;

  if (minPrice === maxPrice) {
    return `$${minPrice.toFixed(0)}`;
  }
  return `$${minPrice.toFixed(0)} - $${maxPrice.toFixed(0)}`;
};

/**
 * Format duration
 */
const formatDuration = (minutes?: number): string => {
  if (!minutes) return '';
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Group services by category
 */
const groupServicesByCategory = (
  services: CompanyService[]
): Record<string, CompanyService[]> => {
  return services.reduce((acc, service) => {
    const category = service.category || 'custom';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, CompanyService[]>);
};

export const ServiceSelectionSheet = ({
  visible,
  services,
  companyName,
  onDismiss,
  onSelectService,
  bottomOffset = 0,
  multiSelect = false,
  onSelectServices,
}: ServiceSelectionSheetProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!searchQuery) return services;

    const query = searchQuery.toLowerCase();
    return services.filter(
      (service) =>
        service.service_name.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query)
    );
  }, [services, searchQuery]);

  const groupedServices = groupServicesByCategory(filteredServices);

  const effectiveMaxHeight = Math.min(SCREEN_HEIGHT * 0.85, SCREEN_HEIGHT - bottomOffset - 8);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modalContainer, { marginBottom: Math.max(0, bottomOffset) }]}
      >
        <View style={[styles.sheet, { maxHeight: effectiveMaxHeight }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.handle} />
              <View style={styles.headerTitleContainer}>
                <MaterialCommunityIcons name="medical-bag" size={24} color="#7c3aed" />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>Select a Service</Text>
                  <Text style={styles.headerSubtitle}>{companyName}</Text>
                </View>
              </View>
              <IconButton
                icon="close"
                iconColor="#6b7280"
                size={24}
                onPress={onDismiss}
                style={styles.closeButton}
              />
            </View>

            {/* Search Bar */}
            <Searchbar
              placeholder="Search services..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              iconColor="#7c3aed"
              inputStyle={styles.searchInput}
            />
          </View>

          {/* Services List */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {filteredServices.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="magnify" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>No services found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your search</Text>
              </View>
            ) : (
              Object.entries(groupedServices).map(([category, categoryServices]) => (
                <View key={category} style={styles.categorySection}>
                  {/* Category Header */}
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryIconContainer}>
                      <MaterialCommunityIcons
                        name={getCategoryIcon(category) as any}
                        size={20}
                        color="#7c3aed"
                      />
                    </View>
                    <Text style={styles.categoryTitle}>
                      {ServiceCategoryLabels[category as ServiceCategoryType] || 'Other Services'}
                    </Text>
                  </View>

                  {/* Service Cards */}
                  {categoryServices.map((service, index) => {
                    const isSelected = selectedIds.has(service.id);
                    return (
                    <TouchableOpacity
                      key={service.id}
                      style={[
                        styles.serviceCard,
                        index === categoryServices.length - 1 && styles.serviceCardLast,
                        isSelected && styles.serviceCardSelected,
                      ]}
                      onPress={() => {
                        if (multiSelect) {
                          setSelectedIds((prev) => {
                            const s = new Set(prev);
                            if (s.has(service.id)) s.delete(service.id);
                            else s.add(service.id);
                            return s;
                          });
                        } else {
                          onSelectService?.(service);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.serviceCardContent}>
                        <View style={styles.serviceInfo}>
                          <Text style={styles.serviceName}>{service.service_name}</Text>
                          {service.description && (
                            <Text style={styles.serviceDescription} numberOfLines={2}>
                              {service.description}
                            </Text>
                          )}
                        </View>

                        <View style={styles.servicePricing}>
                          <Text style={styles.servicePrice}>
                            {formatPrice(service.price_min, service.price_max)}
                          </Text>
                          {service.duration_minutes && (
                            <View style={styles.durationBadge}>
                              <Ionicons name="time-outline" size={12} color="#6b7280" />
                              <Text style={styles.durationText}>
                                {formatDuration(service.duration_minutes)}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9ca3af"
                        style={styles.chevronIcon}
                      />
                    </TouchableOpacity>
                    );
                  })}
                </View>
              ))
            )}
          </ScrollView>

          {/* Multi-select footer */}
          {multiSelect && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setSelectedIds(new Set());
                  onDismiss();
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, selectedIds.size === 0 && styles.confirmBtnDisabled]}
                disabled={selectedIds.size === 0}
                onPress={() => {
                  const selected = services.filter((s) => selectedIds.has(s.id));
                  setSelectedIds(new Set());
                  onSelectServices && onSelectServices(selected);
                }}
              >
                <Text style={styles.confirmText}>Continue ({selectedIds.size})</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerContent: {
    marginBottom: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 12,
  },
  searchBar: {
    backgroundColor: '#f9fafb',
    elevation: 0,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceCardLast: {
    marginBottom: 0,
  },
  serviceCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    paddingRight: 12,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
  },
  servicePricing: {
    alignItems: 'flex-end',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7c3aed',
    marginBottom: 4,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  chevronIcon: {
    marginLeft: 8,
  },
  serviceCardSelected: {
    borderColor: '#7c3aed',
    backgroundColor: '#f5f3ff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  cancelText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  confirmBtnDisabled: {
    backgroundColor: '#c7b3f5',
  },
  confirmText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ServiceSelectionSheet;
