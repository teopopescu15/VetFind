import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * MultiSelectCheckbox Component
 * Reusable multi-select checkbox group with grid or list layout
 * Follows object-literal pattern (no classes)
 */

export interface CheckboxOption {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface MultiSelectCheckboxProps {
  options: CheckboxOption[];
  value: string[];
  onChange: (selected: string[]) => void;
  columns?: number;
  maxSelections?: number;
  minSelections?: number;
  disabled?: boolean;
  title?: string;
}

export const MultiSelectCheckbox = ({
  options,
  value,
  onChange,
  columns = 2,
  maxSelections,
  minSelections = 0,
  disabled = false,
  title,
}: MultiSelectCheckboxProps) => {
  // Toggle selection
  const toggleOption = (optionValue: string) => {
    if (disabled) return;

    const isSelected = value.includes(optionValue);

    if (isSelected) {
      // Deselect
      const newValue = value.filter((v) => v !== optionValue);
      onChange(newValue);
    } else {
      // Select
      if (maxSelections && value.length >= maxSelections) {
        return; // Max selections reached
      }
      onChange([...value, optionValue]);
    }
  };

  // Select all
  const selectAll = () => {
    if (disabled) return;

    if (maxSelections) {
      onChange(options.slice(0, maxSelections).map((opt) => opt.value));
    } else {
      onChange(options.map((opt) => opt.value));
    }
  };

  // Deselect all
  const deselectAll = () => {
    if (disabled) return;
    onChange([]);
  };

  // Render option
  const renderOption = (option: CheckboxOption) => {
    const isSelected = value.includes(option.value);
    const isDisabled = disabled || (maxSelections && value.length >= maxSelections && !isSelected);

    return (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.option,
          columns > 1 && styles.optionGrid,
          { width: columns > 1 ? `${100 / columns - 2}%` : '100%' },
          isSelected && styles.optionSelected,
          isDisabled && styles.optionDisabled,
        ]}
        onPress={() => toggleOption(option.value)}
        disabled={isDisabled}
        accessibilityLabel={option.label}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected, disabled: isDisabled }}
      >
        <View style={styles.optionContent}>
          {option.icon && (
            <Ionicons
              name={option.icon}
              size={20}
              color={isSelected ? '#7c3aed' : '#666'}
              style={styles.optionIcon}
            />
          )}
          <Text
            style={[
              styles.optionLabel,
              isSelected && styles.optionLabelSelected,
              isDisabled && styles.optionLabelDisabled,
            ]}
            numberOfLines={2}
          >
            {option.label}
          </Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  const allSelected = value.length === options.length;
  const selectionCount = value.length;
  const maxReached = maxSelections && selectionCount >= maxSelections;
  const minNotMet = selectionCount < minSelections;

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.counter, minNotMet && styles.counterError]}>
            {`${selectionCount}${maxSelections ? `/${maxSelections}` : ''} selected${minSelections > 0 && selectionCount < minSelections ? ` (min ${minSelections})` : ''}`}
          </Text>
        </View>
      )}

      {!disabled && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={selectAll}
            disabled={allSelected}
          >
            <Text
              style={[styles.actionButtonText, allSelected && styles.actionButtonTextDisabled]}
            >
              Select All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={deselectAll}
            disabled={selectionCount === 0}
          >
            <Text
              style={[
                styles.actionButtonText,
                selectionCount === 0 && styles.actionButtonTextDisabled,
              ]}
            >
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {maxReached && (
        <Text style={styles.warningText}>Numărul maxim de opțiuni selectate a fost atins</Text>
      )}

      <View style={[styles.optionsContainer, columns > 1 && styles.optionsGrid]}>
        {options.map(renderOption)}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  counter: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  counterError: {
    color: '#e74c3c',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '500',
  },
  actionButtonTextDisabled: {
    color: '#999',
  },
  warningText: {
    fontSize: 12,
    color: '#f59e0b',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  optionGrid: {
    marginRight: '2%',
  },
  optionSelected: {
    backgroundColor: '#f3f0ff',
    borderColor: '#7c3aed',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 8,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: '#7c3aed',
  },
  optionLabelDisabled: {
    color: '#999',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  checkboxSelected: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
});
