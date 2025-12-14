import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import { Text, Button, Card, ActivityIndicator, IconButton, Menu } from 'react-native-paper';
import { useCompany } from '../context/CompanyContext';
import { ApiService } from '../services/api';
import { CompanyService, ServiceCategoryLabels, ServiceCategoryType } from '../types/company.types';
import { useAuth } from '../context/AuthContext';

export const ManageServicesScreen: React.FC = () => {
  const { company, refreshCompany } = useCompany();
  const { accessToken } = useAuth();
  const [services, setServices] = useState<CompanyService[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    <Card style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.cardLeft}>
          <Text style={styles.serviceName}>{item.service_name}</Text>
          <Text style={styles.serviceMeta}>{ServiceCategoryLabels[item.category as ServiceCategoryType] || item.category}</Text>
          {item.description ? <Text style={styles.cardDescription}>{item.description}</Text> : null}
        </View>

        <View style={styles.cardRight}>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>${Number(item.price_min).toFixed(0)}{item.price_max && item.price_max !== item.price_min ? ` - ${Number(item.price_max).toFixed(0)}` : ''}</Text>
            {item.duration_minutes ? <Text style={styles.durationSmall}>{item.duration_minutes}m</Text> : null}
          </View>
          <IconButton icon="delete" onPress={() => handleDelete(item.id)} />
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Services</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#7c3aed" />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(s) => String(s.id)}
          renderItem={renderItem}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyTitle}>No services yet</Text>
                <Text style={styles.emptySubtitle}>Add your first service below to make it visible to pet owners.</Text>
              </Card.Content>
            </Card>
          }
          contentContainerStyle={services.length === 0 ? { paddingVertical: 8 } : undefined}
        />
      )}

      <Card style={styles.formCard}>
        <Card.Content>
          <Text style={styles.formTitle}>Add Service</Text>
          <TextInput placeholder="Service name" value={name} onChangeText={setName} style={styles.input} />

          <View style={styles.row}>
            <View style={styles.flexItem}>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button mode="outlined" onPress={() => setMenuVisible(true)} style={styles.pickerButton}>
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
            <View style={[styles.flexItem, { marginLeft: 8 }]}>
              <TextInput placeholder="Duration (min)" keyboardType="numeric" value={duration} onChangeText={setDuration} style={styles.input} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flexItem}>
              <TextInput placeholder="Min price" keyboardType="numeric" value={priceMin} onChangeText={setPriceMin} style={styles.input} />
            </View>
            <View style={[styles.flexItem, { marginLeft: 8 }]}>
              <TextInput placeholder="Max price" keyboardType="numeric" value={priceMax} onChangeText={setPriceMax} style={styles.input} />
            </View>
          </View>

          <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />

          <Button mode="contained" onPress={handleAdd} style={styles.addButton}>
            Add Service
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: '#f3f4f6' },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 6, color: '#111827' },
  subtitle: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  card: { marginBottom: 12, borderRadius: 12, elevation: 2, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  cardLeft: { flex: 1 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  serviceName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  serviceMeta: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  cardDescription: { marginTop: 8, color: '#374151' },
  priceBadge: { backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginBottom: 6 },
  priceText: { color: '#4f46e5', fontWeight: '700' },
  durationSmall: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  formCard: { marginTop: 14, borderRadius: 12, elevation: 2 },
  formTitle: { fontWeight: '800', marginBottom: 10, fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#e6e9ef', padding: 10, borderRadius: 10, marginBottom: 10, backgroundColor: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center' },
  flexItem: { flex: 1 },
  pickerButton: { justifyContent: 'flex-start' },
  addButton: { marginTop: 10, borderRadius: 10 },
  emptyCard: { marginVertical: 12, borderRadius: 12, elevation: 1 },
  emptyTitle: { fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { color: '#6b7280' },
});

export default ManageServicesScreen;
