/**
 * VetCompanyDetailScreen - Detailed view of a vet company
 *
 * Features:
 * - Large photo/banner placeholder
 * - Company header (name, rating, contact info)
 * - Description section
 * - Services grouped by category with expandable sections
 * - Each service shows name, price range, and duration
 * - Back navigation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Linking,
} from 'react-native';
import { Text, ActivityIndicator, Card, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiService } from '../services/api';
import {
  Company,
  CompanyService,
  ClinicTypeLabels,
  ServiceCategoryLabels,
  ServiceCategoryType,
  DaySchedule,
  OpeningHours,
} from '../types/company.types';
import { RootStackParamList } from '../types/navigation.types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'VetCompanyDetail'>;
type RouteProps = RouteProp<RootStackParamList, 'VetCompanyDetail'>;

/**
 * Group services by category
 */
const groupServicesByCategory = (
  services: CompanyService[]
): Record<string, CompanyService[]> => {
  return services.reduce((acc, service) => {
    const category = service.category || 'custom';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, CompanyService[]>);
};

/**
 * Get category icon
 */
const getCategoryIcon = (category: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
    routine_care: 'stethoscope',
    dental_care: 'tooth',
    diagnostic_services: 'microscope',
    emergency_care: 'ambulance',
    surgical_procedures: 'scalpel',
    grooming: 'content-cut',
    custom: 'star',
  };
  return iconMap[category] || 'paw';
};

/**
 * Format price range
 */
const formatPrice = (min: number, max: number): string => {
  if (min === max) {
    return `$${min.toFixed(0)}`;
  }
  return `$${min.toFixed(0)} - $${max.toFixed(0)}`;
};

/**
 * Format duration
 */
const formatDuration = (minutes?: number): string => {
  if (!minutes) return '';
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Get today's schedule
 */
const getTodaySchedule = (openingHours?: OpeningHours): DaySchedule | null => {
  if (!openingHours) return null;
  const days: (keyof OpeningHours)[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
  ];
  const today = days[new Date().getDay()];
  return openingHours[today] || null;
};

/**
 * Format opening hours
 */
const formatOpeningHours = (schedule: DaySchedule | null): { text: string; isOpen: boolean } => {
  if (!schedule || schedule.closed || !schedule.open || !schedule.close) {
    return { text: 'Closed today', isOpen: false };
  }
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMin] = schedule.open.split(':').map(Number);
  const [closeHour, closeMin] = schedule.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  const isOpen = currentTime >= openTime && currentTime < closeTime;
  return {
    text: `${schedule.open} - ${schedule.close}`,
    isOpen,
  };
};

/**
 * ServiceCategorySection Component
 */
interface ServiceCategorySectionProps {
  category: string;
  services: CompanyService[];
  isExpanded: boolean;
  onToggle: () => void;
}

const ServiceCategorySection = ({
  category,
  services,
  isExpanded,
  onToggle,
}: ServiceCategorySectionProps) => {
  const rotateAnim = React.useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <Card style={styles.categoryCard}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryIconContainer}>
            <MaterialCommunityIcons
              name={getCategoryIcon(category)}
              size={24}
              color="#7c3aed"
            />
          </View>
          <View style={styles.categoryTitleContainer}>
            <Text style={styles.categoryTitle}>
              {ServiceCategoryLabels[category as ServiceCategoryType] || 'Other Services'}
            </Text>
            <Text style={styles.categoryCount}>
              {services.length} service{services.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.servicesContainer}>
          <Divider style={styles.categoryDivider} />
          {services.map((service, index) => (
            <View key={service.id}>
              <View style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.service_name}</Text>
                  {service.description && (
                    <Text style={styles.serviceDescription} numberOfLines={2}>
                      {service.description}
                    </Text>
                  )}
                </View>
                <View style={styles.servicePricing}>
                  <Text style={styles.servicePrice}>
                    {formatPrice(service.price_min, service.price_max)}
                  </Text>
                  {service.duration_minutes && (
                    <View style={styles.durationBadge}>
                      <Ionicons name="time-outline" size={12} color="#6b7280" />
                      <Text style={styles.durationText}>
                        {formatDuration(service.duration_minutes)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              {index < services.length - 1 && <Divider style={styles.serviceDivider} />}
            </View>
          ))}
        </View>
      )}
    </Card>
  );
};

export const VetCompanyDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { companyId } = route.params;

  const [company, setCompany] = useState<Company | null>(null);
  const [services, setServices] = useState<CompanyService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch company data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch company and services in parallel
        const [companyData, servicesData] = await Promise.all([
          ApiService.getCompanyById(companyId),
          ApiService.getServices(companyId),
        ]);

        if (!companyData) {
          setError('Company not found');
          return;
        }

        setCompany(companyData);
        setServices(servicesData);

        // Auto-expand first category
        const grouped = groupServicesByCategory(servicesData);
        const firstCategory = Object.keys(grouped)[0];
        if (firstCategory) {
          setExpandedCategories(new Set([firstCategory]));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load company details');
        console.error('Error fetching company:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleCall = () => {
    if (company?.phone) {
      Linking.openURL(`tel:${company.phone}`);
    }
  };

  const groupedServices = groupServicesByCategory(services);
  const todaySchedule = company ? getTodaySchedule(company.opening_hours) : null;
  const { text: hoursText, isOpen } = formatOpeningHours(todaySchedule);

  // Mock rating (can be added to Company type later)
  const rating = 4.8;
  const reviewCount = 124;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading clinic details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !company) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorText}>{error || 'Company not found'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#7c3aed" />

      {/* Back Button Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
          <Text style={styles.headerBackText}>Back to clinics</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Photo Banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#7c3aed', '#9333ea']}
            style={styles.bannerGradient}
          >
            <MaterialCommunityIcons name="hospital-building" size={64} color="rgba(255,255,255,0.3)" />
          </LinearGradient>

          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <MaterialCommunityIcons name="star" size={16} color="#fbbf24" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviewCountText}>({reviewCount})</Text>
          </View>
        </View>

        {/* Company Info Section */}
        <View style={styles.infoSection}>
          {/* Company Name */}
          <Text style={styles.companyName}>{company.name}</Text>

          {/* Clinic Type Badge */}
          <View style={styles.clinicTypeBadge}>
            <MaterialCommunityIcons name="hospital-building" size={16} color="#7c3aed" />
            <Text style={styles.clinicTypeText}>
              {ClinicTypeLabels[company.clinic_type]}
            </Text>
          </View>

          {/* Contact Info Card */}
          <Card style={styles.contactCard}>
            <Card.Content>
              {/* Address */}
              <TouchableOpacity style={styles.contactRow}>
                <Ionicons name="location" size={20} color="#7c3aed" />
                <Text style={styles.contactText}>
                  {company.address}, {company.city}
                </Text>
              </TouchableOpacity>

              <Divider style={styles.contactDivider} />

              {/* Phone */}
              <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
                <Ionicons name="call" size={20} color="#7c3aed" />
                <Text style={[styles.contactText, styles.phoneText]}>{company.phone}</Text>
                <Ionicons name="open-outline" size={16} color="#9ca3af" />
              </TouchableOpacity>

              <Divider style={styles.contactDivider} />

              {/* Hours */}
              <View style={styles.contactRow}>
                <Ionicons name="time" size={20} color="#7c3aed" />
                <View style={styles.hoursContainer}>
                  <View style={[styles.statusDot, isOpen ? styles.dotOpen : styles.dotClosed]} />
                  <Text style={[styles.hoursStatus, isOpen ? styles.hoursOpen : styles.hoursClosed]}>
                    {isOpen ? 'Open' : 'Closed'}
                  </Text>
                  <Text style={styles.hoursText}>{hoursText}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Description */}
          {company.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descriptionText}>{company.description}</Text>
            </View>
          )}

          {/* Services Section */}
          <View style={styles.servicesSection}>
            <View style={styles.servicesSectionHeader}>
              <MaterialCommunityIcons name="medical-bag" size={24} color="#7c3aed" />
              <Text style={styles.servicesSectionTitle}>Our Services & Prices</Text>
            </View>

            {services.length === 0 ? (
              <View style={styles.noServicesContainer}>
                <MaterialCommunityIcons name="clipboard-list-outline" size={48} color="#d1d5db" />
                <Text style={styles.noServicesText}>No services listed yet</Text>
              </View>
            ) : (
              Object.entries(groupedServices).map(([category, categoryServices]) => (
                <ServiceCategorySection
                  key={category}
                  category={category}
                  services={categoryServices}
                  isExpanded={expandedCategories.has(category)}
                  onToggle={() => toggleCategory(category)}
                />
              ))
            )}
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  headerBar: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBackText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  bannerContainer: {
    position: 'relative',
    height: 200,
  },
  bannerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  reviewCountText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  infoSection: {
    padding: 16,
  },
  companyName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  clinicTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 16,
  },
  clinicTypeText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '600',
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  contactText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  phoneText: {
    color: '#7c3aed',
    fontWeight: '500',
  },
  contactDivider: {
    backgroundColor: '#f3f4f6',
  },
  hoursContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOpen: {
    backgroundColor: '#10b981',
  },
  dotClosed: {
    backgroundColor: '#ef4444',
  },
  hoursStatus: {
    fontSize: 15,
    fontWeight: '600',
  },
  hoursOpen: {
    color: '#059669',
  },
  hoursClosed: {
    color: '#dc2626',
  },
  hoursText: {
    fontSize: 15,
    color: '#6b7280',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },
  servicesSection: {
    marginBottom: 16,
  },
  servicesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  servicesSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  noServicesContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  noServicesText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  categoryCount: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  categoryDivider: {
    backgroundColor: '#e5e7eb',
  },
  servicesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    paddingVertical: 14,
  },
  serviceInfo: {
    flex: 1,
    paddingRight: 12,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
  },
  servicePricing: {
    alignItems: 'flex-end',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7c3aed',
    marginBottom: 4,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  serviceDivider: {
    backgroundColor: '#f3f4f6',
  },
  bottomPadding: {
    height: 32,
  },
});

export default VetCompanyDetailScreen;
