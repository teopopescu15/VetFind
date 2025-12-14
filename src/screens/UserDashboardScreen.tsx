/**
 * UserDashboardScreen - Main dashboard for pet owners
 *
 * Features:
 * - Hero header with title
 * - Location filter banner with distance picker
 * - Scrollable list of vet company cards
 * - Pull-to-refresh functionality
 * - Loading and empty states
 * - Location-based filtering when distance is selected
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text, ActivityIndicator, Chip, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiService } from '../services/api';
import { Company } from '../types/company.types';
import { RouteDistance } from '../types/routes.types';
import { RootStackParamList } from '../types/navigation.types';
import { VetCompanyCard } from '../components/VetCompanyCard';
import { useLocation, calculateDistance } from '../hooks/useLocation';
import { useRouteDistance } from '../hooks/useRouteDistance';
import { useAuth } from '../context/AuthContext';

type NavigationProp = StackNavigationProp<RootStackParamList, 'UserDashboard'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Distance options in kilometers
const DISTANCE_OPTIONS = [
  { label: 'All', value: null },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
];

export const UserDashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { logout } = useAuth();
  const { location, permissionStatus, requestPermission, isLoading: locationLoading } = useLocation();
  const {
    fetchDistances,
    getDistance,
    clearCache: clearRouteCache,
    isLoading: isLoadingRoutes,
    error: routeError,
  } = useRouteDistance();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companiesWithDistance, setCompaniesWithDistance] = useState<
    Array<{ company: Company; distance?: number; matchedService?: any }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortMode, setSortMode] = useState<'none' | 'min_asc' | 'max_desc'>('none');

  /**
   * Fetch all companies from API
   */
  const fetchCompanies = useCallback(async () => {
    try {
      setError(null);
      const data = await ApiService.searchCompanies();
      // Sort by creation date (newest first)
      const sorted = data.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
      setCompanies(sorted);
    } catch (err: any) {
      setError(err.message || 'Failed to load vet companies');
      console.error('Error fetching companies:', err);
    }
  }, []);

  /**
   * Initial data load
   */
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchCompanies();
      setIsLoading(false);
    };
    loadData();
  }, [fetchCompanies]);

  /**
   * Filter and calculate distances when location or distance filter changes
   */
  useEffect(() => {
    if (!companies.length) {
      setFilteredCompanies([]);
      setCompaniesWithDistance([]);
      return;
    }

    // If no distance filter selected, show all companies
    if (selectedDistance === null) {
      setFilteredCompanies(companies);
      setCompaniesWithDistance(companies.map((company) => ({ company })));
      return;
    }

    // If distance selected but no location permission
    if (!location) {
      setFilteredCompanies(companies);
      setCompaniesWithDistance(companies.map((company) => ({ company })));
      return;
    }

    // Calculate distances and filter
    const withDistances = companies
      .map((company) => {
        if (company.latitude && company.longitude) {
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            company.latitude,
            company.longitude
          );
          return { company, distance };
        }
        return { company, distance: undefined };
      })
      .filter((item) => {
        // If company has no location, include it anyway
        if (item.distance === undefined) return true;
        // Filter by distance
        return item.distance <= selectedDistance;
      })
      .sort((a, b) => {
        // Sort by distance (companies without location go to end)
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });

    setFilteredCompanies(withDistances.map((item) => item.company));
    setCompaniesWithDistance(withDistances);
  }, [companies, selectedDistance, location]);

  /**
   * Search companies for a given service name and attach matched service/pricing
   */
  const searchCompaniesByService = useCallback(
    async (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) {
        // Clear search - restore previous filteredCompanies state
        // Recompute companiesWithDistance from filteredCompanies
        const base = filteredCompanies.length ? filteredCompanies : companies;
        setFilteredCompanies(base);
        setCompaniesWithDistance(base.map((company) => ({ company })));
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        // Base list respects distance filter when active
        const baseList = selectedDistance === null ? companies : filteredCompanies.length ? filteredCompanies : companies;

        // Fetch services for each company in parallel (safe with Promise.allSettled)
        const promises = baseList.map((c) => ApiService.getServices(c.id).then((s) => ({ company: c, services: s })));
        const results = await Promise.allSettled(promises);

        const matches: Array<{ company: Company; matchedService: any; distance?: number }> = [];

        results.forEach((res) => {
          if (res.status === 'fulfilled') {
            const { company, services } = res.value as { company: Company; services: any[] };
            const found = (services || []).find((svc) => svc && svc.service_name && svc.service_name.toLowerCase().includes(q));
            if (found) {
              // calculate haversine distance if location is available
              let d: number | undefined = undefined;
              if (location && company.latitude && company.longitude) {
                d = calculateDistance(location.latitude, location.longitude, company.latitude, company.longitude);
              }
              matches.push({ company, matchedService: found, distance: d });
            }
          }
        });

        // Sort matches by distance when available by default
        matches.sort((a, b) => {
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });

        // Apply user-selected sort over the matched service price
        if (sortMode === 'min_asc') {
          matches.sort((a, b) => {
            const pa = a.matchedService?.price_min ?? Number.POSITIVE_INFINITY;
            const pb = b.matchedService?.price_min ?? Number.POSITIVE_INFINITY;
            return pa - pb;
          });
        } else if (sortMode === 'max_desc') {
          matches.sort((a, b) => {
            const pa = a.matchedService?.price_max ?? Number.NEGATIVE_INFINITY;
            const pb = b.matchedService?.price_max ?? Number.NEGATIVE_INFINITY;
            return pb - pa;
          });
        }

        setFilteredCompanies(matches.map((m) => m.company));
        setCompaniesWithDistance(matches.map((m) => ({ company: m.company, distance: m.distance, matchedService: m.matchedService })));
      } catch (err) {
        console.error('Service search error:', err);
      } finally {
        setIsSearching(false);
      }
    },
    [companies, filteredCompanies, location, selectedDistance]
  );

  // Debounce search queries
  useEffect(() => {
    const t = setTimeout(() => {
      searchCompaniesByService(searchQuery);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, searchCompaniesByService]);

  /**
   * Fetch route distances when location filter is active and companies are loaded
   * This provides actual driving distances from Google Routes API
   */
  useEffect(() => {
    // Only fetch route distances when:
    // 1. Location filter is active (selectedDistance !== null)
    // 2. User location is available
    // 3. We have filtered companies with coordinates
    if (selectedDistance === null || !location || filteredCompanies.length === 0) {
      return;
    }

    // Get company IDs that have coordinates
    const companyIdsWithCoords = filteredCompanies
      .filter((c) => c.latitude && c.longitude)
      .map((c) => String(c.id));

    if (companyIdsWithCoords.length === 0) {
      return;
    }

    // Get access token from localStorage (for web) or AsyncStorage (for mobile)
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    if (accessToken) {
      fetchDistances(location, companyIdsWithCoords, accessToken);
    }
  }, [selectedDistance, location, filteredCompanies, fetchDistances]);

  /**
   * Handle distance selection
   */
  const handleDistanceSelect = async (distance: number | null) => {
    setSelectedDistance(distance);

    // Request location permission if selecting a distance and not already granted
    if (distance !== null && permissionStatus !== 'granted') {
      await requestPermission();
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Clear route distance cache on refresh to get fresh data
    clearRouteCache();
    await fetchCompanies();
    setIsRefreshing(false);
  };

  /**
   * Navigate to company detail
   */
  const handleCompanyPress = (companyId: number) => {
    navigation.navigate('VetCompanyDetail', { companyId });
  };

  /**
   * Handle sort requests coming from the card buttons.
   * dir: 'asc' => sort by matchedService.price_min ascending
   * dir: 'desc' => sort by matchedService.price_max descending
   */
  const handleSortPrice = (dir: 'asc' | 'desc') => {
    const mode = dir === 'asc' ? 'min_asc' : 'max_desc';
    setSortMode(mode);

    // If we have a current search with matchedService info, re-sort those results
    const matches = companiesWithDistance.filter((c) => c.matchedService) as Array<{ company: Company; distance?: number; matchedService: any }>;
    if (matches.length === 0) return;

    if (mode === 'min_asc') {
      matches.sort((a, b) => (a.matchedService?.price_min ?? Number.POSITIVE_INFINITY) - (b.matchedService?.price_min ?? Number.POSITIVE_INFINITY));
    } else if (mode === 'max_desc') {
      matches.sort((a, b) => (b.matchedService?.price_max ?? Number.NEGATIVE_INFINITY) - (a.matchedService?.price_max ?? Number.NEGATIVE_INFINITY));
    }

    setFilteredCompanies(matches.map((m) => m.company));
    setCompaniesWithDistance(matches);
  };

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f3ff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading vet clinics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f3ff" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#7c3aed']}
            tintColor="#7c3aed"
          />
        }
      >
        {/* Header Section */}
        <LinearGradient
          colors={['#f5f3ff', '#ffffff']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            {/* Title and Logout */}
            <View style={styles.titleContainer}>
              <MaterialCommunityIcons name="paw" size={32} color="#7c3aed" />
              <View style={styles.titleTextContainer}>
                <Text style={styles.titleMain}>Find Your Perfect</Text>
                <Text style={styles.titleHighlight}>Vet Clinic</Text>
              </View>
              {/* Compact service search - appears to the left of logout */}
              <TextInput
                mode="flat"
                placeholder="Cauta serviciu..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                right={isSearching ? <TextInput.Icon icon={() => <ActivityIndicator size={16} color="#7c3aed" />} /> : undefined}
              />
              {/* Sort controls for search results (price sort chips) */}
              <View style={styles.sortControls}>
                <TouchableOpacity
                  style={[styles.sortChip, sortMode === 'min_asc' && styles.sortChipActive]}
                  onPress={() => handleSortPrice('asc')}
                >
                  <Text style={styles.sortChipText}>Preț min ↑</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortChip, sortMode === 'max_desc' && styles.sortChipActive]}
                  onPress={() => handleSortPrice('desc')}
                >
                  <Text style={styles.sortChipText}>Preț max ↓</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutButton}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>

            {/* Location Filter Card */}
            <View style={styles.filterCard}>
              <View style={styles.filterHeader}>
                <Ionicons name="location" size={20} color="#7c3aed" />
                <Text style={styles.filterTitle}>
                  Search vet companies close to you
                </Text>
              </View>

              {/* Distance Options */}
              <View style={styles.distanceOptions}>
                {DISTANCE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    onPress={() => handleDistanceSelect(option.value)}
                    style={[
                      styles.distanceChip,
                      selectedDistance === option.value && styles.distanceChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.distanceChipText,
                        selectedDistance === option.value && styles.distanceChipTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Location Status Message */}
              {selectedDistance !== null && permissionStatus === 'denied' && (
                <View style={styles.locationWarning}>
                  <Ionicons name="warning" size={16} color="#f59e0b" />
                  <Text style={styles.locationWarningText}>
                    Location access denied. Enable in settings to filter by distance.
                  </Text>
                </View>
              )}

              {selectedDistance !== null && locationLoading && (
                <View style={styles.locationStatus}>
                  <ActivityIndicator size="small" color="#7c3aed" />
                  <Text style={styles.locationStatusText}>Getting your location...</Text>
                </View>
              )}

              {/* Route distances loading indicator */}
              {selectedDistance !== null && !locationLoading && isLoadingRoutes && (
                <View style={styles.locationStatus}>
                  <ActivityIndicator size="small" color="#3b82f6" />
                  <Text style={styles.locationStatusText}>Calculating driving distances...</Text>
                </View>
              )}
            </View>

            {/* Results Count */}
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsText}>
                Found{' '}
                <Text style={styles.resultsCount}>{filteredCompanies.length}</Text>{' '}
                vet clinic{filteredCompanies.length !== 1 ? 's' : ''}
                {selectedDistance !== null && isLoadingRoutes && ' (loading drive times...)'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!error && filteredCompanies.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="magnify" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No vet clinics found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedDistance !== null
                ? `No clinics within ${selectedDistance} km of your location`
                : 'There are no registered vet clinics yet'}
            </Text>
            {selectedDistance !== null && (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={() => setSelectedDistance(null)}
              >
                <Text style={styles.clearFilterButtonText}>Show all clinics</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Company Cards List */}
        {!error && filteredCompanies.length > 0 && (
          <View style={styles.cardsContainer}>
            {companiesWithDistance.map(({ company, distance, matchedService }) => (
              <VetCompanyCard
                key={company.id}
                company={company}
                distance={selectedDistance !== null ? distance : undefined}
                routeDistance={selectedDistance !== null ? getDistance(String(company.id)) : undefined}
                matchedService={matchedService}
                onPress={() => handleCompanyPress(company.id)}
              />
            ))}
          </View>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3ff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
  },
  headerGradient: {
    paddingBottom: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  titleTextContainer: {
    flex: 1,
  },
  searchInput: {
    width: SCREEN_WIDTH * 0.38,
    height: 38,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginRight: 8,
    paddingHorizontal: 8,
    elevation: 2,
  },
  titleMain: {
    fontSize: 24,
    fontWeight: '300',
    color: '#374151',
  },
  titleHighlight: {
    fontSize: 28,
    fontWeight: '700',
    color: '#7c3aed',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  sortChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sortChipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  sortChipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  distanceChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  distanceChipSelected: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  distanceChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  distanceChipTextSelected: {
    color: '#ffffff',
  },
  locationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
  },
  locationWarningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  locationStatusText: {
    fontSize: 13,
    color: '#6b7280',
  },
  resultsContainer: {
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 15,
    color: '#6b7280',
  },
  resultsCount: {
    fontWeight: '700',
    color: '#7c3aed',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    paddingTop: 64,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  clearFilterButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
  },
  clearFilterButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  cardsContainer: {
    paddingTop: 8,
  },
  bottomPadding: {
    height: 32,
  },
});

export default UserDashboardScreen;
