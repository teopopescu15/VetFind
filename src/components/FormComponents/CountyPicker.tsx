import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { TextInput, Portal, Modal, Text, Searchbar, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { ROMANIAN_COUNTIES, CountyCode } from '../../constants/romania';

/**
 * CountyPicker Component
 * Picker for Romanian counties (județe) with search functionality
 * Follows object-literal pattern (no classes)
 */

export interface CountyPickerProps {
  value: CountyCode | '';
  onChange: (county: CountyCode) => void;
  error?: string;
  disabled?: boolean;
}

export const CountyPicker = ({ value, onChange, error, disabled }: CountyPickerProps) => {
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCounty = ROMANIAN_COUNTIES.find((c) => c.code === value);

  // Filter counties based on search query
  const filteredCounties = ROMANIAN_COUNTIES.filter((county) =>
    county.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    county.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (county: typeof ROMANIAN_COUNTIES[number]) => {
    onChange(county.code);
    setVisible(false);
    setSearchQuery('');
  };

  const renderCountyItem = ({ item }: { item: typeof ROMANIAN_COUNTIES[number] }) => (
    <TouchableOpacity
      style={[
        styles.countyItem,
        item.code === value && styles.countyItemSelected,
      ]}
      onPress={() => handleSelect(item)}
      accessibilityLabel={item.name}
      accessibilityRole="button"
    >
      <View style={styles.countyItemContent}>
        <Text style={[styles.countyName, item.code === value && styles.countyNameSelected]}>
          {item.name}
        </Text>
        <Text style={styles.countyCode}>{item.code}</Text>
      </View>
      {item.code === value && (
        <Ionicons name="checkmark-circle" size={24} color="#7c3aed" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View>
        <TextInput
          label="Județ *"
          value={selectedCounty?.name || ''}
          mode="outlined"
          error={!!error}
          disabled={disabled}
          editable={false}
          right={
            <TextInput.Icon 
              icon="chevron-down" 
              onPress={() => !disabled && setVisible(true)}
              disabled={disabled}
            />
          }
          style={styles.input}
          outlineColor="#e5e7eb"
          activeOutlineColor="#7c3aed"
          onTouchStart={() => !disabled && setVisible(true)}
        />
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => {
            setVisible(false);
            setSearchQuery('');
          }}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Select County (Județ)
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => {
                setVisible(false);
                setSearchQuery('');
              }}
            />
          </View>

          <Searchbar
            placeholder="Caută județul..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            autoFocus
          />

          <FlatList
            data={filteredCounties}
            renderItem={renderCountyItem}
            keyExtractor={(item) => item.code}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No counties found</Text>
              </View>
            }
          />

          <View style={styles.modalFooter}>
            <Text variant="bodySmall" style={styles.footerText}>
              {filteredCounties.length} of {ROMANIAN_COUNTIES.length} counties
            </Text>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 12,
  },
  modal: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 60,
    borderRadius: 12,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    elevation: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  countyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  countyItemSelected: {
    backgroundColor: '#f5f3ff',
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  countyItemContent: {
    flex: 1,
  },
  countyName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  countyNameSelected: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  countyCode: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  modalFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
  },
});
