import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { TextInput, Portal, Modal, Text, Searchbar, IconButton, HelperText } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { CountyCode } from '../../constants/romania';
import { getLocalitiesForCounty } from '../../constants/romaniaLocalities';

export interface LocalityPickerProps {
  county: CountyCode | '';
  value: string;
  onChange: (locality: string) => void;
  error?: string;
  disabled?: boolean;
}

export const LocalityPicker = ({ county, value, onChange, error, disabled }: LocalityPickerProps) => {
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allLocalities = useMemo(() => getLocalitiesForCounty(county), [county]);
  const filteredLocalities = useMemo(
    () =>
      allLocalities.filter((loc) => loc.toLowerCase().includes(searchQuery.toLowerCase())),
    [allLocalities, searchQuery]
  );

  const canOpen = !!county && !disabled;

  const handleSelect = (locality: string) => {
    onChange(locality);
    setVisible(false);
    setSearchQuery('');
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.item, item === value && styles.itemSelected]}
      onPress={() => handleSelect(item)}
      accessibilityLabel={item}
      accessibilityRole="button"
    >
      <View style={styles.itemContent}>
        <Text style={[styles.itemName, item === value && styles.itemNameSelected]}>{item}</Text>
      </View>
      {item === value && <Ionicons name="checkmark-circle" size={24} color="#7c3aed" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        label="Localitate *"
        value={value || ''}
        mode="outlined"
        error={!!error}
        disabled={disabled}
        editable={false}
        right={
          <TextInput.Icon
            icon="chevron-down"
            onPress={() => canOpen && setVisible(true)}
            disabled={!canOpen}
          />
        }
        style={styles.input}
        outlineColor="#e5e7eb"
        activeOutlineColor="#7c3aed"
        onTouchStart={() => canOpen && setVisible(true)}
      />

      {!county ? (
        <HelperText type="info">Selectează întâi județul</HelperText>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
              Select Locality
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
            placeholder="Search locality..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            autoFocus
          />

          <FlatList
            data={filteredLocalities}
            renderItem={renderItem}
            keyExtractor={(item) => item}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No localities found</Text>
              </View>
            }
          />

          <View style={styles.modalFooter}>
            <Text variant="bodySmall" style={styles.footerText}>
              {filteredLocalities.length} of {allLocalities.length} localities
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  itemSelected: {
    backgroundColor: '#f5f3ff',
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  itemNameSelected: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
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
