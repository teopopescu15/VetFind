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
      <Card.Title
        title={item.service_name}
        subtitle={`${item.price_min} - ${item.price_max} ${item.duration_minutes ? `· ${item.duration_minutes}min` : ''}`}
        right={() => (
          <IconButton icon="delete" onPress={() => handleDelete(item.id)} />
        )}
      />
      {item.description ? <Card.Content><Text>{item.description}</Text></Card.Content> : null}
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Services</Text>

      {isLoading ? <ActivityIndicator size="large" color="#7c3aed" /> : (
        <FlatList
          data={services}
          keyExtractor={(s) => String(s.id)}
          renderItem={renderItem}
          ListEmptyComponent={<Text>No services yet</Text>}
        />
      )}

      <Card style={styles.formCard}>
        <Card.Content>
          <Text style={styles.formTitle}>Add Service</Text>
          <TextInput placeholder="Service name" value={name} onChangeText={setName} style={styles.input} />
          {/* Category picker using react-native-paper Menu to enforce valid enums */}
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setMenuVisible(true)} style={styles.input}>
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
          <TextInput placeholder="Min price" keyboardType="numeric" value={priceMin} onChangeText={setPriceMin} style={styles.input} />
          <TextInput placeholder="Max price" keyboardType="numeric" value={priceMax} onChangeText={setPriceMax} style={styles.input} />
          <TextInput placeholder="Duration minutes" keyboardType="numeric" value={duration} onChangeText={setDuration} style={styles.input} />
          <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />

          <Button mode="contained" onPress={handleAdd} style={{ marginTop: 12 }}>
            Add Service
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  card: { marginBottom: 12 },
  formCard: { marginTop: 12 },
  formTitle: { fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', padding: 8, borderRadius: 8, marginBottom: 8 },
});

export default ManageServicesScreen;
