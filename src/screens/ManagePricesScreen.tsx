import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, Alert, ScrollView } from 'react-native';
import { Text, Card, Button, ActivityIndicator, IconButton, Surface, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCompany } from '../context/CompanyContext';
import { ApiService } from '../services/api';
import { CompanyService } from '../types/company.types';

export const ManagePricesScreen: React.FC = () => {
  const { company, refreshCompany } = useCompany();
  const [services, setServices] = useState<CompanyService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [priceMin, setPriceMin] = useState('0');
  const [priceMax, setPriceMax] = useState('0');

  useEffect(() => {
    loadServices();
  }, [company]);

  const loadServices = async () => {
    if (!company) return;
    try {
      setIsLoading(true);
      const svc = (company as any).services as CompanyService[] | undefined;
      if (Array.isArray(svc)) {
        setServices(svc.filter(s => s && (s.is_active === undefined || s.is_active === true)));
      } else {
        const fetched = await ApiService.getServices(company.id);
        setServices(fetched || []);
      }
    } catch (err) {
      console.error('Error loading services:', err);
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (s: CompanyService) => {
    setEditing(s.id);
    setPriceMin(String(s.price_min));
    setPriceMax(String(s.price_max));
  };

  const saveEdit = async () => {
    if (!company || editing === null) return;
    const pm = parseFloat(priceMin) || 0;
    const px = parseFloat(priceMax) || 0;
    if (px < pm) {
      Alert.alert('Validation', 'Max price must be >= min price');
      return;
    }
    try {
      setIsLoading(true);
      await ApiService.updateService(company.id, editing, { price_min: pm, price_max: px });
      await loadServices();
      try { await refreshCompany(); } catch (e) {}
      setEditing(null);
      Alert.alert('Success', 'Prices updated');
    } catch (err) {
      console.error('Update price error:', err);
      Alert.alert('Error', 'Failed to update price');
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: CompanyService }) => {
    const isEditing = editing === item.id;

    return (
      <Card style={styles.card} mode="elevated" elevation={2}>
        <Card.Content>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="cash-multiple" size={24} color="#ea580c" />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.serviceName}>{item.service_name}</Text>
              {!isEditing && item.description ? (
                <Text style={styles.serviceDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </View>
          </View>

          <Divider style={styles.cardDivider} />

          {/* Price Section */}
          {isEditing ? (
            <View style={styles.editSection}>
              <Text style={styles.editLabel}>Update Prices</Text>
              <View style={styles.priceInputRow}>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.inputLabel}>Min Price ($)</Text>
                  <TextInput
                    value={priceMin}
                    onChangeText={setPriceMin}
                    keyboardType="numeric"
                    style={styles.priceInput}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.inputLabel}>Max Price ($)</Text>
                  <TextInput
                    value={priceMax}
                    onChangeText={setPriceMax}
                    keyboardType="numeric"
                    style={styles.priceInput}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.priceDisplay}>
              <View style={styles.priceTag}>
                <MaterialCommunityIcons name="currency-usd" size={20} color="#059669" />
                <Text style={styles.priceRangeText}>
                  ${Number(item.price_min).toFixed(0)} - ${Number(item.price_max).toFixed(0)}
                </Text>
              </View>
              {item.duration_minutes ? (
                <Chip
                  icon={() => <MaterialCommunityIcons name="clock-outline" size={14} color="#6b7280" />}
                  compact
                  style={styles.durationChip}
                  textStyle={styles.durationChipText}
                >
                  {item.duration_minutes}m
                </Chip>
              ) : null}
            </View>
          )}

          <Divider style={styles.cardDivider} />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isEditing ? (
              <>
                <Button
                  mode="contained"
                  onPress={saveEdit}
                  style={[styles.actionButton, styles.saveButton]}
                  buttonColor="#059669"
                  icon="check"
                  contentStyle={styles.buttonContent}
                >
                  Save
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => setEditing(null)}
                  style={[styles.actionButton, styles.cancelButton]}
                  textColor="#6b7280"
                  icon="close"
                  contentStyle={styles.buttonContent}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                mode="contained"
                onPress={() => startEdit(item)}
                style={styles.editButton}
                buttonColor="#ea580c"
                icon="pencil"
                contentStyle={styles.buttonContent}
              >
                Edit Prices
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <Surface style={styles.headerSection} elevation={0}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="cash-multiple" size={28} color="#ea580c" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Update Prices</Text>
            <Text style={styles.subtitle}>Manage pricing for your clinic services</Text>
          </View>
        </View>
      </Surface>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ea580c" />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      ) : services.length === 0 ? (
        <Card style={styles.emptyCard} mode="outlined">
          <Card.Content style={styles.emptyContent}>
            <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No services available</Text>
            <Text style={styles.emptySubtitle}>Add services in the Manage Services section to update their prices.</Text>
          </Card.Content>
        </Card>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {services.map((item) => (
            <View key={item.id}>{renderItem({ item })}</View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyCard: {
    margin: 16,
    borderRadius: 20,
    borderColor: '#e5e7eb',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeaderText: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  cardDivider: {
    marginVertical: 12,
  },
  priceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  priceRangeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  durationChip: {
    backgroundColor: '#f3f4f6',
    height: 32,
  },
  durationChipText: {
    fontSize: 13,
    color: '#6b7280',
  },
  editSection: {
    gap: 12,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  priceInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
  },
  priceInput: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    fontSize: 15,
    color: '#111827',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#e5e7eb',
    borderWidth: 1.5,
  },
  editButton: {
    flex: 1,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 4,
  },
});

export default ManagePricesScreen;
