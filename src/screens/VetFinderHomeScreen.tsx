import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { vetApi } from '../services/vetApi';
import type { Clinic } from '../types/vet.types';

interface VetFinderHomeScreenProps {
  navigation: any;
}

export const VetFinderHomeScreen = ({ navigation }: VetFinderHomeScreenProps) => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [locationAvailable, setLocationAvailable] = useState(false);

  useEffect(() => {
    loadClinics();
    checkLocationAvailability();
  }, []);

  const checkLocationAvailability = () => {
    // Location is available on mobile but may not work on web
    const isWeb = Platform.OS === 'web';
    setLocationAvailable(!isWeb && typeof navigator !== 'undefined' && 'geolocation' in navigator);
  };

  const loadClinics = async () => {
    try {
      setLoading(true);
      const data = await vetApi.clinics.getAll();
      setClinics(data);
    } catch (error: any) {
      console.error('Error loading clinics:', error);
      Alert.alert('Error', 'Failed to load clinics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchByCity = async () => {
    if (!searchCity.trim()) {
      loadClinics();
      return;
    }

    try {
      setLoading(true);
      const data = await vetApi.clinics.getByCity(searchCity);
      setClinics(data);
    } catch (error: any) {
      console.error('Error searching clinics:', error);
      Alert.alert('Error', 'Failed to search clinics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchNearby = async () => {
    if (!locationAvailable) {
      Alert.alert(
        'Location Not Available',
        'Location services are not available on this platform. Please use city search instead.'
      );
      return;
    }

    try {
      setLoading(true);

      // Get user's location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const data = await vetApi.clinics.getNearby(latitude, longitude, 10);
          setClinics(data);
          setLoading(false);
        },
        (error) => {
          setLoading(false);
          Alert.alert('Location Error', 'Failed to get your location. Please enable location services.');
        }
      );
    } catch (error: any) {
      setLoading(false);
      console.error('Error getting nearby clinics:', error);
      Alert.alert('Error', 'Failed to get nearby clinics. Please try again.');
    }
  };

  const renderClinicCard = ({ item }: { item: Clinic }) => {
    return {
      rating: (item.avg_rating || 0).toFixed(1),
      reviews: item.review_count || 0,
      distance: item.distance ? `${item.distance.toFixed(1)} km` : null,

      card: (
        <TouchableOpacity
          key={item.id}
          style={styles.clinicCard}
          onPress={() => navigation.navigate('ClinicDetail', { clinicId: item.id })}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.clinicName}>{item.name}</Text>
            {item.avg_rating && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>⭐ {(item.avg_rating).toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({item.review_count} reviews)</Text>
              </View>
            )}
          </View>

          <Text style={styles.address}>{item.address}, {item.city}</Text>
          <Text style={styles.phone}>📞 {item.phone}</Text>

          {item.distance && (
            <Text style={styles.distance}>📍 {item.distance.toFixed(1)} km away</Text>
          )}

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate('ClinicDetail', { clinicId: item.id })}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VetFinder</Text>
        <Text style={styles.subtitle}>Find the best veterinary care for your pet</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by city..."
          value={searchCity}
          onChangeText={setSearchCity}
          onSubmitEditing={searchByCity}
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchByCity}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterButtons}>
        <TouchableOpacity style={styles.filterButton} onPress={loadClinics}>
          <Text style={styles.filterButtonText}>All Clinics</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, !locationAvailable && styles.filterButtonDisabled]}
          onPress={searchNearby}
          disabled={!locationAvailable}
        >
          <Text style={[styles.filterButtonText, !locationAvailable && styles.filterButtonTextDisabled]}>
            📍 Nearby
            {!locationAvailable && ' (N/A on web)'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Loading clinics...</Text>
        </View>
      ) : clinics.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No clinics found</Text>
          <Text style={styles.emptySubtext}>Try searching in a different city</Text>
        </View>
      ) : (
        <FlatList
          data={clinics}
          renderItem={({ item }) => renderClinicCard({ item }).card}
          keyExtractor={(item) => item.id?.toString() || '0'}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  header: {
    backgroundColor: '#4ECDC4',
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 40
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  searchInput: {
    flex: 1,
    height: 45,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 10
  },
  searchButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  filterButtons: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 10
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  filterButtonDisabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.6
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333'
  },
  filterButtonTextDisabled: {
    color: '#999999'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center'
  },
  listContainer: {
    padding: 15
  },
  clinicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  clinicName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    flex: 1,
    marginRight: 10
  },
  ratingContainer: {
    alignItems: 'flex-end'
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B'
  },
  reviewCount: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2
  },
  address: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5
  },
  phone: {
    fontSize: 14,
    color: '#4ECDC4',
    marginBottom: 5
  },
  distance: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
    marginTop: 5
  },
  viewButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default VetFinderHomeScreen;
