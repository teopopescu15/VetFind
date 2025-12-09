import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Company, CategoryWithSpecializations, CompanyService } from '../types/company.types';
import { ApiService } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types/navigation.types';
import { useAuth } from '../context/AuthContext';
import { CategoryCard } from '../components/Dashboard/CategoryCard';

/**
 * CompanyDashboardScreen - Main dashboard for vet company users
 *
 * Features:
 * - Company info card (logo, name, address)
 * - Profile completion indicator
 * - Quick stats cards (placeholders for future features)
 * - Quick action buttons (manage services, update prices, add photos, edit profile)
 * - Loading states
 */
export const CompanyDashboardScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'CompanyDashboard'>>();
  const { logout } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [categories, setCategories] = useState<CategoryWithSpecializations[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [services, setServices] = useState<CompanyService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  useEffect(() => {
    loadCompany();
  }, []);

  useEffect(() => {
    if (company) {
      loadCategories();
    }
  }, [company]);

  useEffect(() => {
    const loadServices = async () => {
      if (!company) return;
      try {
        setIsLoadingServices(true);

        // Prefer services embedded in company payload (returned by backend) to avoid stale or cross-company data
        const svcFromCompany = (company as any).services as any[] | undefined;
        if (Array.isArray(svcFromCompany)) {
          const filtered = svcFromCompany.filter(s => s && (s.company_id === company.id || s.companyId === company.id) && (s.is_active === undefined || s.is_active === true));
          setServices(filtered);
        } else {
          const svc = await ApiService.getServices(company.id);
          setServices(svc || []);
        }
      } catch (err) {
        console.error('Error loading services:', err);
      } finally {
        setIsLoadingServices(false);
      }
    };

    loadServices();
  }, [company]);

  const loadCompany = async () => {
    try {
      setIsLoading(true);
      const fetchedCompany = await ApiService.getMyCompany();

      if (fetchedCompany) {
        setCompany(fetchedCompany);
        calculateProfileCompletion(fetchedCompany);
      }
    } catch (error) {
      console.error('Error loading company:', error);
      Alert.alert('Error', 'Failed to load company profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const calculateProfileCompletion = (company: Company) => {
    let completedFields = 0;
    const totalFields = 15;

    // Required fields (always filled)
    completedFields += 7; // name, email, phone, address, city, state, zip_code

    // Optional fields
    if (company.logo_url) completedFields++;
    if (company.website) completedFields++;
    if (company.description && company.description.length >= 50) completedFields++;
    if (company.photos && company.photos.length >= 4) completedFields++;
    if (company.specializations && company.specializations.length > 0) completedFields++;
    if (company.facilities && company.facilities.length > 0) completedFields++;
    if (company.payment_methods && company.payment_methods.length > 0) completedFields++;
    if (company.num_veterinarians) completedFields++;

    const percentage = Math.round((completedFields / totalFields) * 100);
    setProfileCompletion(percentage);
  };

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const allCategories = await ApiService.getServiceCategoriesWithSpecializations();

      // Filter categories that have at least one specialization selected by the company
      // For now, we'll show all categories since the company profile uses the old specializations array
      // In the future, this should be filtered based on company.selected_specializations
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Don't show alert for categories loading failure - it's not critical
    } finally {
      setIsLoadingCategories(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading your company profile...
        </Text>
      </View>
    );
  }

  if (!company) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text variant="headlineSmall" style={styles.errorText}>
          Company profile not found
        </Text>
        <Button
          mode="contained"
          onPress={loadCompany}
          buttonColor="#7c3aed"
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <LinearGradient
        colors={['#7c3aed', '#a855f7']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text variant="headlineMedium" style={styles.headerTitle}>
              Welcome back!
            </Text>
            <Text variant="bodyLarge" style={styles.headerSubtitle}>
              {company.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Company Info Card */}
      <Card style={styles.companyCard}>
        <Card.Content>
          <View style={styles.companyHeader}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              {company.logo_url ? (
                <Image source={{ uri: company.logo_url }} style={styles.logo} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Ionicons name="business" size={40} color="#7c3aed" />
                </View>
              )}
            </View>

            {/* Company Info */}
            <View style={styles.companyInfo}>
              <Text variant="titleLarge" style={styles.companyName}>
                {company.name}
              </Text>

              {company.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                  <Text variant="bodySmall" style={styles.verifiedText}>
                    Verified
                  </Text>
                </View>
              )}

              <View style={styles.addressRow}>
                <Ionicons name="location" size={16} color="#6b7280" />
                <Text variant="bodyMedium" style={styles.addressText}>
                  {company.address}, {company.city}, {company.state}
                </Text>
              </View>
            </View>
          </View>

          {/* Profile Completion */}
          <View style={styles.profileCompletionContainer}>
            <View style={styles.profileCompletionHeader}>
              <Text variant="titleMedium" style={styles.profileCompletionTitle}>
                Profile Status
              </Text>
              {company.company_completed ? (
                <Chip
                  icon={() => <Ionicons name="checkmark-circle" size={16} color="#22c55e" />}
                  style={styles.completedChip}
                  textStyle={styles.completedChipText}
                >
                  Complete
                </Chip>
              ) : (
                <Chip
                  icon={() => <Ionicons name="alert-circle" size={16} color="#f59e0b" />}
                  style={styles.incompleteChip}
                  textStyle={styles.incompleteChipText}
                >
                  Incomplete
                </Chip>
              )}
            </View>

            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${profileCompletion}%`,
                    backgroundColor: profileCompletion === 100 ? '#22c55e' : '#7c3aed'
                  }
                ]}
              />
            </View>

            <Text variant="bodySmall" style={styles.profileCompletionPercentage}>
              {profileCompletion}% Complete
            </Text>

            {profileCompletion < 100 && (
              <Text variant="bodySmall" style={styles.profileCompletionHint}>
                Complete your profile to attract more clients
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statCardContent}>
            <Ionicons name="calendar" size={32} color="#3b82f6" />
            <Text variant="headlineSmall" style={styles.statNumber}>
              --
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Today's Appointments
            </Text>
          </Card.Content>
        </Card>

      {/* Services preview for owner */}
      <Card style={styles.servicesPreviewCard}>
        <Card.Content>
          <View style={styles.servicesHeader}>
            <MaterialCommunityIcons name="medical-bag" size={20} color="#7c3aed" />
            <Text variant="titleMedium" style={styles.servicesTitle}>Your Services</Text>
          </View>

          {isLoadingServices ? (
            <ActivityIndicator size="small" color="#7c3aed" />
          ) : services.length === 0 ? (
            <Text style={styles.noServicesText}>No services created yet. Use Manage Services to add procedures.</Text>
          ) : (
            services.slice(0, 5).map(s => (
              <View key={s.id} style={styles.serviceRow}>
                <Text style={styles.serviceName}>{s.service_name}</Text>
                <Text style={styles.servicePrice}>${s.price_min} - ${s.price_max}</Text>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statCardContent}>
            <Ionicons name="star" size={32} color="#f59e0b" />
            <Text variant="headlineSmall" style={styles.statNumber}>
              --
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Average Rating
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statCardContent}>
            <Ionicons name="people" size={32} color="#22c55e" />
            <Text variant="headlineSmall" style={styles.statNumber}>
              --
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Total Reviews
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.actionsGrid}>
          <Button
            mode="outlined"
            icon={() => <Ionicons name="list" size={24} color="#7c3aed" />}
            onPress={() => navigation.navigate('ManageServices')}
            style={styles.actionButton}
            labelStyle={styles.actionButtonLabel}
          >
            Manage Services
          </Button>

          <Button
            mode="outlined"
            icon={() => <Ionicons name="pricetag" size={24} color="#7c3aed" />}
            onPress={() => navigation.navigate('ManagePrices')}
            style={styles.actionButton}
            labelStyle={styles.actionButtonLabel}
          >
            Update Prices
          </Button>

          <Button
            mode="outlined"
            icon={() => <Ionicons name="images" size={24} color="#7c3aed" />}
            onPress={() => Alert.alert('Coming Soon', 'Photo gallery manager will be available soon')}
            style={styles.actionButton}
            labelStyle={styles.actionButtonLabel}
          >
            Add Photos
          </Button>

          <Button
            mode="outlined"
            icon={() => <Ionicons name="create" size={24} color="#7c3aed" />}
            onPress={() => Alert.alert('Coming Soon', 'Profile editor will be available soon')}
            style={styles.actionButton}
            labelStyle={styles.actionButtonLabel}
          >
            Edit Profile
          </Button>
        </View>
      </View>

      {/* Services & Categories */}
      {categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <View style={styles.categoriesHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Services & Specializations
            </Text>
            <Chip
              style={styles.totalServicesChip}
              textStyle={styles.totalServicesChipText}
              compact
            >
              {categories.reduce((sum, cat) => sum + cat.specializations.length, 0)} Total Services
            </Chip>
          </View>

          {isLoadingCategories ? (
            <View style={styles.categoriesLoading}>
              <ActivityIndicator size="small" color="#7c3aed" />
              <Text variant="bodyMedium" style={styles.categoriesLoadingText}>
                Loading services...
              </Text>
            </View>
          ) : (
            <View style={styles.categoriesList}>
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Specializations (Legacy) */}
      {company.specializations && company.specializations.length > 0 && (
        <View style={styles.specializationsContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Specializations
          </Text>
          <View style={styles.chipsContainer}>
            {company.specializations.map((spec, index) => (
              <Chip key={index} mode="outlined" style={styles.chip}>
                {spec.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Chip>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  contentContainer: {
    paddingBottom: 32
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    color: '#ef4444',
    textAlign: 'center'
  },
  retryButton: {
    paddingHorizontal: 24
  },
  header: {
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)'
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  companyCard: {
    margin: 16,
    marginTop: -24,
    elevation: 4
  },
  companyHeader: {
    flexDirection: 'row',
    marginBottom: 24
  },
  logoContainer: {
    marginRight: 16
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f3f4f6'
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9d5ff'
  },
  companyInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  companyName: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8
  },
  verifiedText: {
    color: '#22c55e',
    fontWeight: '600'
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  addressText: {
    color: '#6b7280',
    flex: 1
  },
  profileCompletionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  profileCompletionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  profileCompletionTitle: {
    fontWeight: '600',
    color: '#111827'
  },
  profileCompletionPercentage: {
    marginTop: 8,
    color: '#6b7280'
  },
  completedChip: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e'
  },
  completedChipText: {
    color: '#166534',
    fontWeight: '600'
  },
  incompleteChip: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b'
  },
  incompleteChipText: {
    color: '#92400e',
    fontWeight: '600'
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 12
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4
  },
  profileCompletionHint: {
    marginTop: 8,
    color: '#6b7280',
    fontStyle: 'italic'
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24
  },
  statCard: {
    flex: 1,
    elevation: 2
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: 16
  },
  statNumber: {
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4
  },
  statLabel: {
    color: '#6b7280',
    textAlign: 'center'
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    borderColor: '#7c3aed'
  },
  actionButtonLabel: {
    color: '#7c3aed'
  },
  specializationsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    borderColor: '#7c3aed'
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 24
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  totalServicesChip: {
    backgroundColor: '#f3e8ff',
    borderColor: '#7c3aed'
  },
  totalServicesChipText: {
    color: '#7c3aed',
    fontWeight: '600',
    fontSize: 12
  },
  categoriesLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12
  },
  categoriesLoadingText: {
    color: '#6b7280'
  },
  categoriesList: {
    gap: 12
  }
  ,
  /* Services preview styles */
  servicesPreviewCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  servicesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  servicesTitle: {
    fontWeight: '700',
    color: '#111827',
  },
  noServicesText: {
    color: '#6b7280',
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  serviceName: {
    color: '#374151',
  },
  servicePrice: {
    color: '#7c3aed',
    fontWeight: '600',
  }
});
