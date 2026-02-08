import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, Alert, ScrollView, Switch } from 'react-native';
import { Text, Button, Card, ActivityIndicator, IconButton, Menu, Surface, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCompany } from '../context/CompanyContext';
import { ApiService } from '../services/api';
import { CompanyService, ServiceCategoryLabels, ServiceCategoryType } from '../types/company.types';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

export const ManageServicesScreen: React.FC = () => {
  const { company, refreshCompany, updateCompany } = useCompany();
  const { accessToken } = useAuth();
  const [services, setServices] = useState<CompanyService[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Regim de urgență (salvat pe company)
  const [emergencyAvailable, setEmergencyAvailable] = useState(false);
  const [emergencyFee, setEmergencyFee] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencySaving, setEmergencySaving] = useState(false);

  // Form state for adding
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategoryType>('custom');
  const [menuVisible, setMenuVisible] = useState(false);
  const [priceMin, setPriceMin] = useState('0');
  const [priceMax, setPriceMax] = useState('0');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadServices();
  }, [company]);

  useEffect(() => {
    if (company) {
      setEmergencyAvailable((company as any).emergency_available === true);
      const fee = (company as any).emergency_fee;
      setEmergencyFee(fee != null && fee !== '' ? String(fee) : '');
      setEmergencyContactPhone(String((company as any).emergency_contact_phone ?? ''));
    }
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

  const handleAdd = async () => {
    if (!company) return;
    const pm = parseFloat(priceMin) || 0;
    const px = parseFloat(priceMax) || 0;
    if (!name.trim()) {
      Alert.alert('Validation', 'Service name is required');
      return;
    }
    if (px < pm) {
      Alert.alert('Validation', 'Max price must be >= min price');
      return;
    }

    try {
      setIsLoading(true);
      const dto = {
        category,
        service_name: name,
        description: description || undefined,
        price_min: pm,
        price_max: px,
        duration_minutes: duration ? parseInt(duration, 10) : undefined,
      };

  const created = await ApiService.createService(company.id, dto as any);
      // Refresh local list
      await loadServices();
      // Also refresh company context
      try { await refreshCompany(); } catch (e) { /* ignore */ }

      // Clear form
      setName(''); setPriceMin('0'); setPriceMax('0'); setDuration(''); setDescription('');

      Alert.alert('Success', 'Service created');
    } catch (err: any) {
      console.error('Create service error:', err);
      Alert.alert('Error', err.message || 'Failed to create service');
    } finally {
      setIsLoading(false);
    }
  };

  const saveEmergencySettings = async () => {
    if (!company) return;
    try {
      setEmergencySaving(true);
      const feeVal = emergencyFee.trim();
      const phoneVal = emergencyContactPhone.trim();
      await updateCompany({
        emergency_available: Boolean(emergencyAvailable),
        emergency_fee: feeVal ? parseFloat(feeVal) : (null as any),
        emergency_contact_phone: phoneVal || (null as any),
      });
      Alert.alert('Salvat', 'Setările de urgență au fost actualizate.');
    } catch (err: any) {
      console.error('Save emergency settings error:', err);
      Alert.alert('Eroare', err?.message || 'Nu s-au putut salva setările de urgență.');
    } finally {
      setEmergencySaving(false);
    }
  };

  const handleDelete = (serviceId: number) => {
    Alert.alert('Delete service', 'Are you sure you want to delete this service?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          setIsLoading(true);
          await ApiService.deleteService(company!.id, serviceId);
          await loadServices();
          try { await refreshCompany(); } catch (e) {}
        } catch (err) {
          console.error('Delete service error:', err);
          Alert.alert('Error', 'Failed to delete service');
        } finally {
          setIsLoading(false);
        }
      }}
    ]);
  };

  const renderItem = ({ item }: { item: CompanyService }) => (
    <Card style={styles.card} mode="elevated" elevation={2}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="medical-bag" size={24} color="#7c3aed" />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.serviceName}>{item.service_name}</Text>
            <View style={styles.metaRow}>
              <Chip
                mode="outlined"
                compact
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
              >
                {ServiceCategoryLabels[item.category as ServiceCategoryType] || item.category}
              </Chip>
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
          </View>
        </View>

        {item.description ? (
          <>
            <Divider style={styles.cardDivider} />
            <Text style={styles.cardDescription}>{item.description}</Text>
          </>
        ) : null}

        <Divider style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <MaterialCommunityIcons name="currency-usd" size={20} color="#059669" />
            <Text style={styles.priceText}>
              ${Number(item.price_min).toFixed(0)}
              {item.price_max && item.price_max !== item.price_min ? ` - $${Number(item.price_max).toFixed(0)}` : ''}
            </Text>
          </View>
          <IconButton
            icon="delete"
            iconColor="#ef4444"
            size={20}
            onPress={() => handleDelete(item.id)}
            style={styles.deleteButton}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <Surface style={styles.headerSection} elevation={0}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="clipboard-text" size={28} color="#7c3aed" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Manage Services</Text>
            <Text style={styles.subtitle}>Add, edit, and organize your clinic services</Text>
          </View>
        </View>
      </Surface>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Services List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : services.length === 0 ? (
          <Card style={styles.emptyCard} mode="outlined">
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons name="clipboard-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No services yet</Text>
              <Text style={styles.emptySubtitle}>Add your first service below to make it visible to pet owners.</Text>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.servicesContainer}>
            {services.map((item) => (
              <View key={item.id}>{renderItem({ item })}</View>
            ))}
          </View>
        )}

        {/* Regim de urgență */}
        <Surface style={styles.emergencySection} elevation={3}>
          <View style={styles.emergencyHeader}>
            <MaterialCommunityIcons name="alert-circle" size={24} color="#dc2626" />
            <Text style={styles.emergencySectionTitle}>Regim de urgență</Text>
          </View>
          <Text style={styles.emergencySubtitle}>
            Când clinica e închisă, proprietarii cu opțiunea de urgență activată te vor vedea cu taxă și contact.
          </Text>
          <View style={styles.emergencyRow}>
            <Text style={styles.emergencyLabel}>Acceptă urgențe când clinica e închisă</Text>
            <Switch
              value={emergencyAvailable}
              onValueChange={setEmergencyAvailable}
              trackColor={{ false: theme.colors.neutral[300], true: '#dc2626' }}
              thumbColor="#fff"
            />
          </View>
          {emergencyAvailable && (
            <>
              <TextInput
                placeholder="Taxă urgență (RON)"
                keyboardType="decimal-pad"
                value={emergencyFee}
                onChangeText={setEmergencyFee}
                style={styles.input}
                placeholderTextColor="#9ca3af"
              />
              <TextInput
                placeholder="Telefon urgență (ex: +40 7xx xxx xxx)"
                value={emergencyContactPhone}
                onChangeText={setEmergencyContactPhone}
                style={styles.input}
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
            </>
          )}
          <Button
            mode="contained"
            onPress={saveEmergencySettings}
            loading={emergencySaving}
            disabled={emergencySaving}
            style={styles.emergencySaveButton}
            buttonColor="#dc2626"
          >
            Salvează setările de urgență
          </Button>
        </Surface>

        {/* Add Service Form */}
        <Surface style={styles.formSection} elevation={3}>
          <View style={styles.formHeader}>
            <MaterialCommunityIcons name="plus-circle" size={24} color="#7c3aed" />
            <Text style={styles.formTitle}>Add New Service</Text>
          </View>

          <Divider style={styles.formDivider} />

          <TextInput
            placeholder="Service name (e.g., Vaccination, Surgery)"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />

          <View style={styles.row}>
            <View style={styles.flexItem}>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMenuVisible(true)}
                    style={styles.pickerButton}
                    icon="format-list-bulleted"
                  >
                    {ServiceCategoryLabels[category] || category}
                  </Button>
                }
              >
                {Object.entries(ServiceCategoryLabels).map(([key, label]) => (
                  <Menu.Item
                    key={key}
                    onPress={() => {
                      setCategory(key as ServiceCategoryType);
                      setMenuVisible(false);
                    }}
                    title={label}
                  />
                ))}
              </Menu>
            </View>
            <View style={[styles.flexItem, { marginLeft: 12 }]}>
              <TextInput
                placeholder="Duration (min)"
                keyboardType="numeric"
                value={duration}
                onChangeText={setDuration}
                style={styles.input}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flexItem}>
              <TextInput
                placeholder="Min price ($)"
                keyboardType="numeric"
                value={priceMin}
                onChangeText={setPriceMin}
                style={styles.input}
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={[styles.flexItem, { marginLeft: 12 }]}>
              <TextInput
                placeholder="Max price ($)"
                keyboardType="numeric"
                value={priceMax}
                onChangeText={setPriceMax}
                style={styles.input}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <TextInput
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.descriptionInput]}
            multiline
            numberOfLines={3}
            placeholderTextColor="#9ca3af"
          />

          <Button
            mode="contained"
            onPress={handleAdd}
            style={styles.addButton}
            buttonColor="#7c3aed"
            icon="plus"
            contentStyle={styles.addButtonContent}
          >
            Add Service
          </Button>
        </Surface>
      </ScrollView>
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
  servicesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
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
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryChip: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    height: 28,
  },
  categoryChipText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  durationChip: {
    backgroundColor: '#f3f4f6',
    height: 28,
  },
  durationChipText: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardDivider: {
    marginVertical: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  deleteButton: {
    margin: 0,
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
    borderRadius: 16,
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
  formSection: {
    margin: 16,
    marginTop: 24,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  formDivider: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    fontSize: 15,
    color: '#111827',
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexItem: {
    flex: 1,
  },
  pickerButton: {
    justifyContent: 'flex-start',
    borderRadius: 12,
    borderColor: '#e5e7eb',
    borderWidth: 1.5,
  },
  addButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  addButtonContent: {
    paddingVertical: 6,
  },
  emergencySection: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#fffbfb',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  emergencySectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  emergencySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 4,
  },
  emergencyLabel: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    marginRight: 12,
  },
  emergencySaveButton: {
    marginTop: 8,
    borderRadius: 12,
  },
});

export default ManageServicesScreen;
