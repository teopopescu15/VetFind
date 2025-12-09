import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, IconButton } from 'react-native-paper';
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

  const renderItem = ({ item }: { item: CompanyService }) => (
    <Card style={styles.card}>
      <Card.Title
        title={item.service_name}
        subtitle={editing === item.id ? `${priceMin} - ${priceMax}` : `${item.price_min} - ${item.price_max}`}
        right={() => (
          editing === item.id ? (
            <View style={{ flexDirection: 'row' }}>
              <IconButton icon="check" onPress={saveEdit} />
              <IconButton icon="close" onPress={() => setEditing(null)} />
            </View>
          ) : (
            <IconButton icon="pencil" onPress={() => startEdit(item)} />
          )
        )}
      />
      {editing === item.id ? (
        <Card.Content>
          <TextInput value={priceMin} onChangeText={setPriceMin} keyboardType="numeric" style={styles.input} />
          <TextInput value={priceMax} onChangeText={setPriceMax} keyboardType="numeric" style={styles.input} />
        </Card.Content>
      ) : item.description ? (
        <Card.Content><Text>{item.description}</Text></Card.Content>
      ) : null}
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Prices</Text>
      {isLoading ? <ActivityIndicator size="large" color="#7c3aed" /> : (
        <FlatList
          data={services}
          keyExtractor={(s) => String(s.id)}
          renderItem={renderItem}
          ListEmptyComponent={<Text>No services available</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  card: { marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', padding: 8, borderRadius: 8, marginBottom: 8 },
});

export default ManagePricesScreen;
