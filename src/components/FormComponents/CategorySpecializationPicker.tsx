import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryWithSpecializations, CategorySpecialization } from '../../types/company.types';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * CategorySpecializationPicker Component
 * Hierarchical category/specialization picker with collapsible sections
 * Follows object-literal pattern (no classes)
 */

export interface CategorySpecializationPickerProps {
  categories: CategoryWithSpecializations[];
  selectedCategories: number[];
  selectedSpecializations: number[];
  onCategoryChange: (categoryIds: number[]) => void;
  onSpecializationChange: (specializationIds: number[]) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
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

export const CategorySpecializationPicker = ({
  categories,
  selectedCategories,
  selectedSpecializations,
  onCategoryChange,
  onSpecializationChange,
  disabled = false,
  loading = false,
  error,
}: CategorySpecializationPickerProps) => {
  // Track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Get the icon for a category
  const getCategoryIcon = (iconName?: string): keyof typeof Ionicons.glyphMap => {
    if (iconName && categoryIcons[iconName]) {
      return categoryIcons[iconName];
    }
    return 'medical';
  };

  // Toggle category expansion
  const toggleCategoryExpansion = useCallback((categoryId: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  // Get count of selected specializations for a category
  const getSelectedCountForCategory = useCallback((category: CategoryWithSpecializations): number => {
    return category.specializations.filter((spec) => selectedSpecializations.includes(spec.id)).length;
  }, [selectedSpecializations]);

  // Check if all specializations in a category are selected
  const isAllSpecializationsSelected = useCallback((category: CategoryWithSpecializations): boolean => {
    return category.specializations.every((spec) => selectedSpecializations.includes(spec.id));
  }, [selectedSpecializations]);

  // Check if some (but not all) specializations are selected
  const isSomeSpecializationsSelected = useCallback((category: CategoryWithSpecializations): boolean => {
    const count = getSelectedCountForCategory(category);
    return count > 0 && count < category.specializations.length;
  }, [getSelectedCountForCategory]);

  // Toggle all specializations in a category
  const toggleAllSpecializationsInCategory = useCallback((category: CategoryWithSpecializations) => {
    if (disabled) return;

    const categorySpecIds = category.specializations.map((spec) => spec.id);
    const allSelected = isAllSpecializationsSelected(category);

    if (allSelected) {
      // Deselect all specializations in this category
      const newSpecializations = selectedSpecializations.filter((id) => !categorySpecIds.includes(id));
      onSpecializationChange(newSpecializations);

      // Also remove category from selected categories
      const newCategories = selectedCategories.filter((id) => id !== category.id);
      onCategoryChange(newCategories);
    } else {
      // Select all specializations in this category
      const newSpecializations = [...new Set([...selectedSpecializations, ...categorySpecIds])];
      onSpecializationChange(newSpecializations);

      // Also add category to selected categories
      if (!selectedCategories.includes(category.id)) {
        onCategoryChange([...selectedCategories, category.id]);
      }
    }
  }, [disabled, selectedSpecializations, selectedCategories, isAllSpecializationsSelected, onSpecializationChange, onCategoryChange]);

  // Toggle a single specialization
  const toggleSpecialization = useCallback((specialization: CategorySpecialization) => {
    if (disabled) return;

    const isSelected = selectedSpecializations.includes(specialization.id);

    if (isSelected) {
      // Deselect specialization
      const newSpecializations = selectedSpecializations.filter((id) => id !== specialization.id);
      onSpecializationChange(newSpecializations);

      // Check if any specializations from this category are still selected
      const category = categories.find((cat) => cat.id === specialization.category_id);
      if (category) {
        const hasOtherSelected = category.specializations.some(
          (spec) => spec.id !== specialization.id && newSpecializations.includes(spec.id)
        );
        if (!hasOtherSelected) {
          // Remove category from selected categories
          onCategoryChange(selectedCategories.filter((id) => id !== specialization.category_id));
        }
      }
    } else {
      // Select specialization
      onSpecializationChange([...selectedSpecializations, specialization.id]);

      // Auto-add category to selected categories
      if (!selectedCategories.includes(specialization.category_id)) {
        onCategoryChange([...selectedCategories, specialization.category_id]);
      }
    }
  }, [disabled, selectedSpecializations, selectedCategories, categories, onSpecializationChange, onCategoryChange]);

  // Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  // Render empty state
  if (categories.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={40} color="#9ca3af" />
          <Text style={styles.emptyText}>No categories available</Text>
        </View>
      </View>
    );
  }

  // Calculate total selections
  const totalSelections = selectedSpecializations.length;

  // Render a specialization item
  const renderSpecialization = (specialization: CategorySpecialization) => {
    const isSelected = selectedSpecializations.includes(specialization.id);

    return (
      <TouchableOpacity
        key={specialization.id}
        style={[
          styles.specializationItem,
          isSelected && styles.specializationItemSelected,
          disabled && styles.itemDisabled,
        ]}
        onPress={() => toggleSpecialization(specialization)}
        disabled={disabled}
        accessibilityLabel={specialization.name}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected, disabled }}
      >
        <View style={styles.specializationContent}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <View style={styles.specializationInfo}>
            <Text style={[styles.specializationName, isSelected && styles.textSelected]}>
              {specialization.name}
            </Text>
            {specialization.description && (
              <Text style={styles.specializationDescription} numberOfLines={1}>
                {specialization.description}
              </Text>
            )}
          </View>
        </View>
        {specialization.suggested_duration_minutes > 0 && (
          <Text style={styles.durationBadge}>
            {specialization.suggested_duration_minutes} min
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // Render a category section
  const renderCategory = (category: CategoryWithSpecializations) => {
    const isExpanded = expandedCategories.has(category.id);
    const selectedCount = getSelectedCountForCategory(category);
    const totalCount = category.specializations.length;
    const allSelected = isAllSpecializationsSelected(category);
    const someSelected = isSomeSpecializationsSelected(category);

    return (
      <View key={category.id} style={styles.categoryContainer}>
        {/* Category Header */}
        <TouchableOpacity
          style={[
            styles.categoryHeader,
            selectedCount > 0 && styles.categoryHeaderSelected,
          ]}
          onPress={() => toggleCategoryExpansion(category.id)}
          disabled={disabled}
          accessibilityLabel={`${category.name} category, ${selectedCount} of ${totalCount} selected`}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
        >
          <View style={styles.categoryHeaderLeft}>
            <View style={[styles.categoryIconContainer, selectedCount > 0 && styles.categoryIconContainerSelected]}>
              <Ionicons
                name={getCategoryIcon(category.icon)}
                size={20}
                color={selectedCount > 0 ? '#7c3aed' : '#6b7280'}
              />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, selectedCount > 0 && styles.categoryNameSelected]}>
                {category.name}
              </Text>
              {category.description && (
                <Text style={styles.categoryDescription} numberOfLines={1}>
                  {category.description}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.categoryHeaderRight}>
            {selectedCount > 0 && (
              <View style={styles.selectionBadge}>
                <Text style={styles.selectionBadgeText}>
                  {selectedCount}/{totalCount}
                </Text>
              </View>
            )}
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6b7280"
            />
          </View>
        </TouchableOpacity>

        {/* Specializations (expanded content) */}
        {isExpanded && (
          <View style={styles.specializationsContainer}>
            {/* Select All toggle for this category */}
            <TouchableOpacity
              style={styles.selectAllRow}
              onPress={() => toggleAllSpecializationsInCategory(category)}
              disabled={disabled}
              accessibilityLabel={allSelected ? 'Deselect all' : 'Select all'}
              accessibilityRole="button"
            >
              <View style={[
                styles.selectAllCheckbox,
                allSelected && styles.selectAllCheckboxSelected,
                someSelected && styles.selectAllCheckboxPartial,
              ]}>
                {allSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
                {someSelected && !allSelected && <View style={styles.partialIndicator} />}
              </View>
              <Text style={styles.selectAllText}>
                {allSelected ? 'Deselect all' : 'Select all'}
              </Text>
            </TouchableOpacity>

            {/* Specialization list */}
            <View style={styles.specializationsList}>
              {category.specializations.map(renderSpecialization)}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with total count */}
      <View style={styles.header}>
        <Text style={[styles.totalCount, totalSelections === 0 && styles.totalCountWarning]}>
          {`${totalSelections} specialization${totalSelections !== 1 ? 's' : ''} selected`}
        </Text>
        {totalSelections === 0 && (
          <Text style={styles.minSelectionWarning}>
            (at least 1 required)
          </Text>
        )}
      </View>

      {/* Categories list */}
      <View style={styles.categoriesList}>
        {categories.map(renderCategory)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  totalCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  totalCountWarning: {
    color: '#ef4444',
  },
  minSelectionWarning: {
    fontSize: 12,
    color: '#ef4444',
    fontStyle: 'italic',
  },
  categoriesList: {
    gap: 12,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  categoryHeaderSelected: {
    backgroundColor: '#f5f3ff',
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
    paddingLeft: 12,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconContainerSelected: {
    backgroundColor: '#ede9fe',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoryNameSelected: {
    color: '#7c3aed',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  categoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  specializationsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 16,
    backgroundColor: '#e0f2fe', // Light blue to separate from teal items
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 10,
  },
  selectAllCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectAllCheckboxSelected: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  selectAllCheckboxPartial: {
    borderColor: '#7c3aed',
    backgroundColor: '#fff',
  },
  partialIndicator: {
    width: 8,
    height: 2,
    backgroundColor: '#7c3aed',
    borderRadius: 1,
  },
  selectAllText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  specializationsList: {
    padding: 8,
    gap: 6,
  },
  specializationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0fdfa', // Teal background
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  specializationItemSelected: {
    backgroundColor: '#ccfbf1', // Lighter teal
    borderWidth: 2,
    borderColor: '#5eead4', // Teal border
  },
  itemDisabled: {
    opacity: 0.5,
  },
  specializationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0d9488', // Teal checkbox
    borderColor: '#0d9488',
  },
  specializationInfo: {
    flex: 1,
  },
  specializationName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#134e4a', // Teal-900 text
  },
  textSelected: {
    color: '#0d9488', // Teal-600 for selected
    fontWeight: '600',
  },
  specializationDescription: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  durationBadge: {
    fontSize: 11,
    color: '#065f46', // Dark teal
    backgroundColor: '#d1fae5', // Light teal
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
