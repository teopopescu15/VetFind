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

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Alert,
  BackHandler,
  Platform,
} from 'react-native';
import { Text, ActivityIndicator, Chip, TextInput, Button, Snackbar, Portal, Dialog } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiService } from '../services/api';
import { vetApi } from '../services/vetApi';
import { Company } from '../types/company.types';
import { RouteDistance } from '../types/routes.types';
import { RootStackParamList } from '../types/navigation.types';
import { VetCompanyCard } from '../components/VetCompanyCard';
import { useLocation, calculateDistance } from '../hooks/useLocation';
import { useRouteDistance } from '../hooks/useRouteDistance';
import { useAuth } from '../context/AuthContext';
import { AppointmentCard, type AppointmentData } from '../components/Dashboard/AppointmentCard';
import { theme } from '../theme';

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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<any>(null);
  const [sortMode, setSortMode] = useState<'none' | 'min_asc' | 'max_desc' | 'rating_desc'>('none');
  // Snackbar for web/native feedback and a deleting indicator for buttons
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  // Review modal state
  const [reviewVisible, setReviewVisible] = useState(false);
  const [reviewClinicId, setReviewClinicId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [reviewAppointmentId, setReviewAppointmentId] = useState<number | null>(null);

  const isServiceSearchActive = (searchQuery || '').trim().length > 0;

  // Android back behavior: when searching, back should exit search and return to dashboard state.
  useEffect(() => {
    const onBackPress = () => {
      const hasSearchText = (searchQuery || '').trim().length > 0;
      if (isSearchExpanded || hasSearchText) {
        setSearchQuery('');
        setIsSearchExpanded(false);
        setSortMode('none');

        // restore default list
        setFilteredCompanies(companies);
        setCompaniesWithDistance(companies.map((company) => ({ company })));
        return true; // handled
      }

      return false; // allow default navigation
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [companies, isSearchExpanded, searchQuery]);

  // Web/browser back behavior: when searching, back should exit search and keep user on dashboard.
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      const hasSearchText = (searchQuery || '').trim().length > 0;
      if (!isSearchExpanded && !hasSearchText) return;

      // Prevent leaving the dashboard; instead clear search state.
      e.preventDefault();
      setSearchQuery('');
      setIsSearchExpanded(false);
      setSortMode('none');
      setFilteredCompanies(companies);
      setCompaniesWithDistance(companies.map((company) => ({ company })));
    });

    return unsubscribe;
  }, [companies, isSearchExpanded, navigation, searchQuery]);

  /**
   * Fetch all companies from API
   */
  const fetchCompanies = useCallback(async () => {
    try {
      setError(null);
      const data = await ApiService.searchCompanies();
      // Sort by creation date (newest first)
      const sorted = data.sort((a: any, b: any) => {
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

  // ===== User appointments (pet owner) =====
  const [userAppointments, setUserAppointments] = useState<any[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [expandedAppointments, setExpandedAppointments] = useState<number[]>([]);

  // Dashboard should show only a small, priority subset of appointments.
  // Priority rules:
  // - Include only: pending, confirmed, completed (ONLY if not reviewed yet)
  // - Pick max 3 closest to now (past + future) by |appointment_date - now|
  // - Completed with review should NOT be shown on dashboard
  const getPriorityDashboardAppointments = useCallback(
    (allAppointments: any[], reviews: any[]) => {
      const reviewedAppointmentIds = new Set(
        (reviews || [])
          .map((r) => r?.appointment_id)
          .filter((id) => typeof id === 'number')
      );

      const now = Date.now();

      const eligible = (allAppointments || [])
        .filter((a) => !a?.deleted)
        .map((a) => {
          const t = new Date(a?.appointment_date).getTime();
          return { a, t, delta: Math.abs(t - now) };
        })
        .filter((x) => Number.isFinite(x.t))
        .filter(({ a, t }) => {
          const status = String(a?.status || '').toLowerCase();
          const isPast = t < now;

          // Past appointments on dashboard: ONLY completed and ONLY if review not yet left
          if (isPast) {
            if (status !== 'completed') return false;
            const id = a?.id;
            return typeof id === 'number' ? !reviewedAppointmentIds.has(id) : true;
          }

          // Future appointments on dashboard: ONLY pending/confirmed
          if (status === 'pending' || status === 'confirmed' || status === 'cancelled') return true;

          // Future completed appointments shouldn't show on dashboard (completed are for review flow)
          return false;
        });

      eligible.sort((x, y) => {
        if (x.delta !== y.delta) return x.delta - y.delta;
        return x.t - y.t;
      });

      return eligible.slice(0, 3).map((x) => x.a);
    },
    []
  );

  const toggleExpand = (id: number) => {
    setExpandedAppointments((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const fetchUserAppointments = useCallback(async () => {
    try {
      setIsLoadingAppointments(true);
      const data = await ApiService.getUserAppointments();
      // Ensure we don't show appointments that have been soft-deleted
      setUserAppointments((data || []).filter((a: any) => !a.deleted));
    } catch (err: any) {
      console.error('Error fetching user appointments:', err);
      setUserAppointments([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, []);

  const fetchMyReviews = useCallback(async () => {
    try {
      const data = await vetApi.reviews.getMyReviews();
      setMyReviews(data || []);
    } catch (err: any) {
      console.error('Error fetching my reviews:', err);
      setMyReviews([]);
    }
  }, []);

  const priorityAppointments = getPriorityDashboardAppointments(userAppointments, myReviews);
  const hasAnyDashboardEligibleAppointments =
    (userAppointments || []).filter((a) => {
      const status = String(a?.status || '').toLowerCase();
      if (status === 'pending' || status === 'confirmed') return true;
      if (status === 'completed') {
        const hasReviewed = myReviews.some((r) => r?.appointment_id === a?.id);
        return !hasReviewed;
      }
      return false;
    }).length > 0;

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) fetchUserAppointments();
  }, [isFocused, fetchUserAppointments]);

  /**
   * Initial data load
   */
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // load companies and user appointments in parallel
      await Promise.all([fetchCompanies(), fetchUserAppointments(), fetchMyReviews()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchCompanies, fetchUserAppointments]);

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

        // Apply user-selected sorting
        if (sortMode === 'rating_desc') {
          matches.sort((a, b) => {
            const ar = typeof (a.company as any).avg_rating === 'number' ? (a.company as any).avg_rating : Number((a.company as any).avg_rating || 0);
            const br = typeof (b.company as any).avg_rating === 'number' ? (b.company as any).avg_rating : Number((b.company as any).avg_rating || 0);
            return (br || 0) - (ar || 0);
          });
        } else if (sortMode === 'min_asc') {
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
    [companies, filteredCompanies, location, selectedDistance, sortMode]
  );

  // Debounce search queries
  useEffect(() => {
    const t = setTimeout(() => {
      searchCompaniesByService(searchQuery);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, searchCompaniesByService]);

  useEffect(() => {
    if (isSearchExpanded) {
      // Let the input mount before focusing
      const t = setTimeout(() => searchInputRef.current?.focus?.(), 50);
      return () => clearTimeout(t);
    }
  }, [isSearchExpanded]);

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
    await Promise.all([fetchCompanies(), fetchUserAppointments()]);
    setIsRefreshing(false);
  };

  /**
   * Navigate to company detail
   */
  const handleCompanyPress = (companyId: number) => {
    navigation.navigate('VetCompanyDetail', { companyId });
  };

  const handleUserCancel = async (appointmentId: number) => {
    try {
      const ok = await ApiService.cancelAppointment(appointmentId);
      if (ok) {
        Alert.alert('Success', 'Appointment cancelled');
        fetchUserAppointments();
      } else {
        Alert.alert('Error', 'Could not cancel appointment');
      }
    } catch (err: any) {
      console.error('Cancel appointment error (user):', err);
      Alert.alert('Error', err.message || 'Failed to cancel appointment');
    }
  };

  const handleUserDelete = async (appointmentId: number) => {
    // Immediate soft-delete without dialog. Show a Snackbar for feedback and a loading state on the button.
    try {
      setDeletingId(appointmentId);
      const ok = await ApiService.deleteAppointment(appointmentId);
      if (ok) {
        setSnackMessage('Appointment removed');
        setSnackVisible(true);
        await fetchUserAppointments();
      } else {
        setSnackMessage('Could not remove appointment');
        setSnackVisible(true);
      }
    } catch (err: any) {
      console.error('Remove appointment error (user):', err);
      setSnackMessage(err?.message || 'Failed to remove appointment');
      setSnackVisible(true);
    } finally {
      setDeletingId(null);
    }
  };

  const openReview = (clinicId: number | null, appointmentId?: number | null) => {
    if (!clinicId) return;
    setReviewClinicId(clinicId);
    setReviewAppointmentId(appointmentId ?? null);
    setReviewRating(5);
    setReviewComment('');
    setReviewVisible(true);
  };

  const closeReview = () => {
    setReviewVisible(false);
    setReviewClinicId(null);
    setReviewAppointmentId(null);
    setReviewRating(5);
    setReviewComment('');
  };

  const submitReview = async () => {
    if (!reviewClinicId) return;
    if (reviewRating < 1 || reviewRating > 5) {
      setSnackMessage('Rating must be between 1 and 5');
      setSnackVisible(true);
      return;
    }

    try {
      setReviewSubmitting(true);
  const payload = { rating: reviewRating, comment: reviewComment, appointment_id: reviewAppointmentId };
  const saved = await vetApi.reviews.create(reviewClinicId, payload as any);
  setSnackMessage('Multumesc pentru review');
  setSnackVisible(true);
  // Refresh my reviews so the Review button hides immediately
  try { await fetchMyReviews(); } catch {}
  closeReview();
    } catch (err: any) {
      console.error('Submit review error:', err);
      setSnackMessage(err?.message || 'Failed to save review');
      setSnackVisible(true);
    } finally {
      setReviewSubmitting(false);
    }
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

  const handleSortRating = () => {
    const mode: 'rating_desc' = 'rating_desc';
    setSortMode(mode);

    // Only meaningful when we have a current service search (matchedService present)
    const matches = companiesWithDistance.filter((c) => c.matchedService) as Array<{ company: Company; distance?: number; matchedService: any }>;
    if (matches.length === 0) return;

    matches.sort((a, b) => {
      const ar = typeof (a.company as any).avg_rating === 'number' ? (a.company as any).avg_rating : Number((a.company as any).avg_rating || 0);
      const br = typeof (b.company as any).avg_rating === 'number' ? (b.company as any).avg_rating : Number((b.company as any).avg_rating || 0);
      return (br || 0) - (ar || 0);
    });

    setFilteredCompanies(matches.map((m) => m.company));
    setCompaniesWithDistance(matches);

    // Re-run search to ensure the full results set respects this sort choice
    // (e.g., if async search rebuilt list after a previous sort).
    if ((searchQuery || '').trim().length > 0) {
      searchCompaniesByService(searchQuery);
    }
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
        <StatusBar barStyle="dark-content" backgroundColor="#fafaf9" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Loading vet clinics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafaf9" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.accent.main]}
            tintColor={theme.colors.accent.main}
          />
        }
      >
        {/* Compact Header */}
        <LinearGradient
          colors={[theme.colors.primary.main, theme.colors.accent.main]}
          style={styles.compactHeader}
        >
          <View style={styles.compactHeaderContent}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="paw" size={28} color="#FFFFFF" />
              <Text style={styles.compactHeaderTitle}>VetFinder</Text>
            </View>

            {/* Right side: search + sort + logout */}
            <View style={styles.headerRight}>
              <View style={[styles.headerSearchContainer, !isSearchExpanded && styles.headerSearchContainerCollapsed]}>
                {isSearchExpanded ? (
                  <TextInput
                    ref={searchInputRef}
                    mode="outlined"
                    placeholder="Caută un serviciu"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                    // No left icon when expanded: keep maximum room for placeholder text
                    right={
                      <TextInput.Icon
                        icon={() => (
                          <Ionicons
                            name="close"
                            size={15}
                            color="#6b7280"
                          />
                        )}
                        onPress={() => {
                          setSearchQuery('');
                          setIsSearchExpanded(false);
                        }}
                      />
                    }
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => setIsSearchExpanded(true)}
                    style={styles.searchIconButton}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Search"
                  >
                    <Ionicons name="search" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.sortControls}>
                <TouchableOpacity
                  onPress={handleLogout}
                  style={styles.logoutButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>

        {!isServiceSearchActive && (
        <View style={styles.myAppointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Appointments</Text>
            <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('MyAppointments')}>
              <Text style={styles.viewAllButtonText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.primary.main} />
            </TouchableOpacity>
          </View>

          {/* User appointments: show upcoming or empty state */}
          {isLoadingAppointments ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary.main} />
            </View>
          ) : !hasAnyDashboardEligibleAppointments ? (
            <View style={styles.emptyAppointments}>
              <Ionicons name="calendar-outline" size={48} color={theme.colors.neutral[400]} />
              <Text style={styles.emptyAppointmentsText}>No upcoming appointments</Text>
              <TouchableOpacity style={styles.bookNowButton} onPress={() => navigation.navigate('BookAppointment' as any)}>
                <Text style={styles.bookNowButtonText}>Book Your First Appointment</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/** Map server appointments to AppointmentCard shape */}
              {priorityAppointments
                .slice()
                .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
                .map((a, idx) => {
                  // Normalize services selection: support multiple shapes returned from backend
                  let servicesList: Array<any> = [];
                  if (Array.isArray(a.services) && a.services.length) {
                    servicesList = a.services;
                  } else if (Array.isArray(a.selected_services) && a.selected_services.length) {
                    servicesList = a.selected_services;
                  } else if (Array.isArray(a.service) && a.service.length) {
                    servicesList = a.service;
                  } else if (a.service_name || a.service) {
                    // single service fallback
                    servicesList = [
                      {
                        service_name: a.service_name || a.service?.service_name || a.service || 'Service',
                        price_min: a.service?.price_min ?? a.service_price ?? a.price ?? undefined,
                        price_max: a.service?.price_max ?? a.service_price ?? a.price ?? undefined,
                        duration_minutes: a.service?.duration_minutes ?? undefined,
                      },
                    ];
                  }

                  // Compute totals across selected services (sum of mins, sum of maxes, sum of durations)
                  const totalPriceMin = servicesList.length
                    ? servicesList.reduce((sum, s) => sum + Number(s?.price_min ?? s?.price ?? 0), 0)
                    : 0;
                  const totalPriceMax = servicesList.length
                    ? servicesList.reduce((sum, s) => sum + Number(s?.price_max ?? s?.price ?? 0), 0)
                    : 0;
                  const totalDuration = servicesList.length
                    ? servicesList.reduce((sum, s) => sum + Number(s?.duration_minutes ?? 0), 0)
                    : 0;

                  const mapped: AppointmentData & { servicesList?: any[]; total_price_min?: number; total_price_max?: number; total_duration_minutes?: number } = {
                    id: a.id,
                    clinicName: a.clinic_name || a.company?.name || 'Clinic',
                    clinicLogo: a.company?.photo_url || undefined,
                    clinicAddress: a.clinic_address || a.company?.address || undefined,
                    date: new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    time: new Date(a.appointment_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    petName: a.pet_name || 'Your pet',
                    service: a.service_name || a.service?.service_name || 'Service',
                    status: a.status,
                    price: a.service_price || a.service?.price_min,
                    servicesList,
                    total_price_min: totalPriceMin,
                    total_price_max: totalPriceMax,
                    total_duration_minutes: totalDuration,
                  };

                  // Resolve clinic/company id using multiple possible shapes
                  const clinicId = a.company?.id ?? a.company_id ?? a.clinic_id ?? null;

                  // Determine if the appointment is in the future; show upcoming variant for future appointments
                  const isFuture = new Date(a.appointment_date).getTime() > Date.now();
                  const variant = isFuture ? 'upcoming' : 'past';

                  const isExpanded = expandedAppointments.includes(a.id);

                  const statusColor = (s: string) => {
                    switch (s) {
                      case 'confirmed':
                        // show confirmed as green
                        return theme.colors.success.main;
                      case 'pending':
                        return theme.colors.warning.main;
                      case 'cancelled':
                        return theme.colors.error.main;
                      case 'completed':
                        // show completed as blue/info
                        return theme.colors.info.main;
                      default:
                        return theme.colors.neutral[600];
                    }
                  };

                  return (
                    <View key={a.id} style={styles.appRowContainer}>
                      <TouchableOpacity onPress={() => toggleExpand(a.id)} activeOpacity={0.8} style={styles.appRow}>
                        <View style={styles.appRowLeft}>
                          <Text style={styles.clinicNameSmall}>{mapped.clinicName}</Text>
                          <Text style={styles.dateTimeText}>{mapped.date} • {mapped.time}</Text>
                        </View>

                        <View style={styles.appRowRight}>
                          {mapped.status === 'completed' && (() => {
                            const hasReviewed = myReviews.some((r) => r.appointment_id === a.id);
                            if (hasReviewed) return null;
                            return (
                              <TouchableOpacity
                                onPress={() => openReview(clinicId, a.id)}
                                style={styles.reviewButton}
                                activeOpacity={0.8}
                              >
                                <MaterialCommunityIcons name="star-outline" size={16} color={theme.colors.primary.main} />
                                <Text style={styles.reviewButtonText}>Review</Text>
                              </TouchableOpacity>
                            );
                          })()}
                          <View style={[styles.statusBadge, { borderColor: statusColor(mapped.status) }]}>
                            <Text style={[styles.statusBadgeText, { color: statusColor(mapped.status) }]}>{mapped.status.charAt(0).toUpperCase() + mapped.status.slice(1)}</Text>
                          </View>
                          <TouchableOpacity onPress={() => toggleExpand(a.id)} style={styles.expandButton}>
                            <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={theme.colors.neutral[700]} />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={styles.appDetails}>
                          {/* Services list */}
                          {mapped.servicesList && mapped.servicesList.length > 0 ? (
                            <View>
                              <Text style={[styles.detailText, { fontWeight: '700' }]}>Services:</Text>
                              {mapped.servicesList.map((s, si) => {
                                const priceMin = s?.price_min ?? s?.price ?? 0;
                                const priceMax = s?.price_max ?? s?.price ?? 0;
                                const duration = s?.duration_minutes ?? 0;
                                const hasPrice = !!(s?.price_min || s?.price_max || s?.price);
                                const priceText = hasPrice
                                  ? (s?.price_min != null && s?.price_max != null
                                      ? `$${Number(s.price_min)} - $${Number(s.price_max)}`
                                      : `$${Number(s.price ?? s.price_min ?? s.price_max ?? 0)}`)
                                  : '$0';

                                return (
                                  <Text key={si} style={styles.detailText}>
                                    {s.service_name || s.name || 'Service'} — {priceText}{' '}
                                    • {duration ? `${duration} min` : '0 min'}
                                  </Text>
                                );
                              })}

                              {/* Totals: sum of mins, sum of maxes, sum of durations (fallback 0) */}
                              <Text style={[styles.detailText, { marginTop: theme.spacing.sm }]}>
                                <Text style={{ fontWeight: '700' }}>Price:</Text>{' '}
                                {typeof mapped.total_price_min === 'number' && typeof mapped.total_price_max === 'number'
                                  ? `$${mapped.total_price_min} - $${mapped.total_price_max}`
                                  : `$0 - $0`}
                              </Text>

                              <Text style={styles.detailText}>
                                <Text style={{ fontWeight: '700' }}>Duration:</Text>{' '}
                                {typeof mapped.total_duration_minutes === 'number'
                                  ? `${mapped.total_duration_minutes} min`
                                  : `0 min`}
                              </Text>
                            </View>
                          ) : (
                            <>
                              <Text style={styles.detailText}><Text style={{ fontWeight: '700' }}>Service:</Text> {mapped.service}</Text>
                              <Text style={styles.detailText}><Text style={{ fontWeight: '700' }}>Price:</Text> {mapped.price ? `$${mapped.price}` : '$0'}</Text>
                              <Text style={styles.detailText}><Text style={{ fontWeight: '700' }}>Duration:</Text> {a.service?.duration_minutes ? `${a.service.duration_minutes} min` : '0 min'}</Text>
                            </>
                          )}

                          {(mapped.status === 'confirmed' || mapped.status === 'pending') && (
                            <View style={styles.detailsActions}>
                              <Button mode="outlined" onPress={() => handleUserCancel(a.id)} textColor={theme.colors.error.main} style={styles.cancelButton}>
                                Cancel
                              </Button>
                            </View>
                          )}
                          {mapped.status === 'cancelled' && (
                            <View style={styles.detailsActions}>
                              <Button
                                mode="outlined"
                                onPress={() => handleUserDelete(a.id)}
                                loading={deletingId === a.id}
                                disabled={deletingId !== null && deletingId !== a.id}
                                textColor={theme.colors.error.main}
                                style={styles.cancelButton}
                                icon={() => <Ionicons name="trash-outline" size={16} color={theme.colors.error.main} />}
                              >
                                Delete
                              </Button>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
            </View>
          )}
  </View>
  )}

        {/* 2. Find Clinics Section (MIDDLE) */}
        <View style={styles.findClinicsSection}>
          <Text style={styles.sectionTitle}>Find Clinics</Text>

          {/* Search moved to top bar */}

          {/* Location Filter Banner */}
          <View style={styles.filterCard}>
            <View style={styles.filterHeader}>
              <Ionicons name="location" size={20} color={theme.colors.primary.main} />
              <Text style={styles.filterTitle}>
                Filter by Distance
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
                  <ActivityIndicator size="small" color={theme.colors.primary.main} />
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
        </View>

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
            {(searchQuery || '').trim().length > 0 && (
              <View style={styles.resultsSortSection}>
                <Text style={styles.resultsSortLabel}>Sortează după:</Text>
                <View style={styles.resultsSortBar}>
                  <TouchableOpacity
                    onPress={() => handleSortPrice('asc')}
                    style={[styles.sortChip, sortMode === 'min_asc' && styles.sortChipActive]}
                  >
                    <Text style={[styles.sortChipText, sortMode === 'min_asc' && { color: '#ffffff' }]}>Price ↑</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSortPrice('desc')}
                    style={[styles.sortChip, sortMode === 'max_desc' && styles.sortChipActive]}
                  >
                    <Text style={[styles.sortChipText, sortMode === 'max_desc' && { color: '#ffffff' }]}>Price ↓</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSortRating}
                    style={[styles.sortChip, sortMode === 'rating_desc' && styles.sortChipActive]}
                  >
                    <Text style={[styles.sortChipText, sortMode === 'rating_desc' && { color: '#ffffff' }]}>Rating ★</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

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
      {/* Review dialog */}
      <Portal>
        <Dialog visible={reviewVisible} onDismiss={closeReview}>
          <Dialog.Title>Leave a review</Dialog.Title>
          <Dialog.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <TouchableOpacity key={i} onPress={() => setReviewRating(i)} style={{ padding: 4 }}>
                  <MaterialCommunityIcons
                    name={i <= reviewRating ? 'star' : 'star-outline'}
                    size={28}
                    color={i <= reviewRating ? '#f59e0b' : '#d1d5db'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              mode="outlined"
              label="Comment (optional)"
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={4}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeReview} mode="text">Cancel</Button>
            <Button onPress={submitReview} loading={reviewSubmitting} mode="contained">Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      {/* Feedback Snackbar (web + native) */}
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}
        action={{ label: 'OK', onPress: () => setSnackVisible(false) }}
      >
        {snackMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[100],  // Warm beige instead of purple tint
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
    flex: 1,
    minWidth: 120,  // Responsive minimum width
    height: 38,
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.borderRadius.md,
    marginRight: 0,
    paddingHorizontal: 0,
    fontSize: 13,
    paddingVertical: 0,
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
    color: theme.colors.primary.main,
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
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    elevation: 3,
    shadowColor: theme.colors.primary.main,
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
  resultsSortSection: {
    marginBottom: theme.spacing.lg,
  },
  resultsSortLabel: {
    color: theme.colors.neutral[700],
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  resultsSortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
    shadowColor: theme.colors.primary.main,
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
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
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
    color: theme.colors.primary.main,
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
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.md,
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
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.md,
  },
  clearFilterButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  cardsContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  bottomPadding: {
    height: 32,
  },
  // Compact Header Styles
  compactHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  compactHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSearchContainer: {
    flexShrink: 1,
    width: Math.min(210, Math.max(160, SCREEN_WIDTH * 0.48)),
    marginLeft: 6,
    marginRight: 6,
  },
  headerSearchContainerCollapsed: {
    width: 40,
    marginRight: 8,
  },
  searchIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // My Appointments Section Styles
  myAppointmentsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.neutral[700],
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary.main,
  },
  emptyAppointments: {
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing['2xl'],
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  emptyAppointmentsText: {
    fontSize: 15,
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },
  bookNowButton: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.accent.main,
    borderRadius: theme.borderRadius.md,
  },
  bookNowButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  /* Appointment compact list styles */
  appRowContainer: {
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  appRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appRowLeft: {
    flex: 1,
  },
  clinicNameSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.neutral[900],
  },
  dateTimeText: {
    fontSize: 13,
    color: theme.colors.neutral[600],
    marginTop: theme.spacing.xs,
  },
  appRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.md,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: theme.spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  reviewButtonText: {
    fontSize: 13,
    color: theme.colors.primary.main,
    fontWeight: '700',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  expandButton: {
    marginLeft: theme.spacing.sm,
  },
  appDetails: {
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    paddingTop: theme.spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.xs,
  },
  detailsActions: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    borderColor: theme.colors.error.main,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  // Find Clinics Section Styles
  findClinicsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  searchContainer: {
    marginBottom: theme.spacing.md,
  },
});

export default UserDashboardScreen;
