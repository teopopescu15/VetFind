/**
 * VetCompanyCard - Premium card component for displaying vet company info
 *
 * Features:
 * - Photo placeholder with gradient background
 * - Rating badge (top-right)
 * - Clinic type badge (bottom-left of photo)
 * - Distance badge (bottom-right of photo, conditional)
 * - Company info section (name, address, phone)
 * - Open/Closed status bar
 * - Press animation and navigation
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Company, ClinicTypeLabels, OpeningHours, DaySchedule, CompanyService } from '../types/company.types';
import { RouteDistance } from '../types/routes.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VetCompanyCardProps {
  company: Company;
  distance?: number; // Haversine distance in km (fallback)
  routeDistance?: RouteDistance; // Google Routes driving distance (preferred)
  matchedService?: CompanyService; // Optional service matched by a search, used to display price
  onPress: () => void;
}

/**
 * Get today's day name
 */
const getTodayName = (): keyof OpeningHours => {
  const days: (keyof OpeningHours)[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return days[new Date().getDay()];
};

/**
 * Get today's schedule from opening hours
 */
const getTodaySchedule = (openingHours?: OpeningHours): DaySchedule | null => {
  if (!openingHours) return null;

  const today = getTodayName();
  return openingHours[today] || null;
};

/**
 * Format opening hours for display
 */
const formatOpeningHours = (schedule: DaySchedule | null): { text: string; isOpen: boolean } => {
  if (!schedule || schedule.closed || !schedule.open || !schedule.close) {
    return { text: 'Closed today', isOpen: false };
  }

  // Check if currently open
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [openHour, openMin] = schedule.open.split(':').map(Number);
  const [closeHour, closeMin] = schedule.close.split(':').map(Number);

  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  const isOpen = currentTime >= openTime && currentTime < closeTime;

  return {
    text: `${isOpen ? 'Open' : 'Closed'} · ${schedule.open} - ${schedule.close}`,
    isOpen,
  };
};

/**
 * Format distance for display
 */
const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
};

/**
 * Get clinic type icon
 */
const getClinicTypeIcon = (clinicType: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
    general_practice: 'hospital-building',
    emergency_care: 'ambulance',
    specialized_care: 'stethoscope',
    mobile_vet: 'car',
    emergency_24_7: 'clock-alert',
  };

  return iconMap[clinicType] || 'hospital-building';
};

export const VetCompanyCard = ({ company, distance, routeDistance, matchedService, onPress }: VetCompanyCardProps) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const todaySchedule = getTodaySchedule(company.opening_hours);
  const { text: hoursText, isOpen } = formatOpeningHours(todaySchedule);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      // useNativeDriver is not available in web's native animated module; use JS driver
      useNativeDriver: false,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      // useNativeDriver is not available in web's native animated module; use JS driver
      useNativeDriver: false,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  // Mock rating for now (you can add this to Company type later)
  const rating = 4.8;
  const hasRating = true;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Card style={styles.card}>
          {/* Photo Section */}
          <View style={styles.photoContainer}>
            {company.photos && company.photos.length > 0 ? (
              // TODO: Add actual image when photos are available
              <LinearGradient
                colors={['#e9d5ff', '#c4b5fd']}
                style={styles.photoPlaceholder}
              >
                <MaterialCommunityIcons name="camera" size={40} color="#9333ea" />
                <Text style={styles.photoPlaceholderText}>Photo</Text>
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={['#e9d5ff', '#c4b5fd']}
                style={styles.photoPlaceholder}
              >
                <MaterialCommunityIcons name="hospital-building" size={48} color="#9333ea" />
              </LinearGradient>
            )}

            {/* Rating Badge - Top Right */}
            {hasRating && (
              <View style={styles.ratingBadge}>
                <MaterialCommunityIcons name="star" size={14} color="#fbbf24" />
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              </View>
            )}

            {/* Bottom Badges Container */}
            <View style={styles.bottomBadgesContainer}>
              {/* Clinic Type Badge - Bottom Left */}
              <View style={styles.clinicTypeBadge}>
                <MaterialCommunityIcons
                  name={getClinicTypeIcon(company.clinic_type)}
                  size={14}
                  color="#7c3aed"
                />
                <Text style={styles.clinicTypeBadgeText}>
                  {ClinicTypeLabels[company.clinic_type]}
                </Text>
              </View>

              {/* Distance Badge - Bottom Right (conditional) */}
              {/* Prefer route distance (driving) over Haversine (straight-line) */}
              {routeDistance ? (
                <View style={styles.distanceBadge}>
                  <Ionicons name="car" size={12} color="#ffffff" />
                  <Text style={styles.distanceBadgeText}>
                    {routeDistance.distanceKm.toFixed(1)} km · {routeDistance.durationText}
                  </Text>
                </View>
              ) : distance !== undefined && (
                <View style={styles.distanceBadge}>
                  <Ionicons name="location" size={12} color="#ffffff" />
                  <Text style={styles.distanceBadgeText}>{formatDistance(distance)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Company Info Section */}
          <Card.Content style={styles.cardContent}>
              {/* Header row: company name */}
              <View style={styles.headerRow}>
                <Text variant="titleMedium" style={styles.companyName} numberOfLines={1}>
                  {company.name}
                </Text>
              </View>

            {/* Matched service price (when user searched for a service) */}
            {matchedService && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{matchedService.service_name}</Text>
                <View style={styles.priceBadgeSmall}>
                  <Text style={styles.priceBadgeTextLarge}>
                    ${Number(matchedService.price_min).toFixed(0)}{matchedService.price_max && matchedService.price_max !== matchedService.price_min ? ` - ${Number(matchedService.price_max).toFixed(0)}` : ''}
                  </Text>
                </View>
              </View>
            )}

            {/* Address */}
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text variant="bodyMedium" style={styles.infoText} numberOfLines={1}>
                {company.address}, {company.city}
              </Text>
            </View>

            {/* Phone */}
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={16} color="#6b7280" />
              <Text variant="bodyMedium" style={styles.infoText}>
                {company.phone}
              </Text>
            </View>

            {/* Opening Hours Status */}
            <View style={[styles.statusBar, isOpen ? styles.statusOpen : styles.statusClosed]}>
              <View style={[styles.statusDot, isOpen ? styles.dotOpen : styles.dotClosed]} />
              <Text style={[styles.statusText, isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>
                {hoursText}
              </Text>
            </View>

            {/* Chevron Indicator */}
            <View style={styles.chevronContainer}>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  photoContainer: {
    position: 'relative',
    height: 140,
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  photoPlaceholderText: {
    color: '#9333ea',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomBadgesContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clinicTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  clinicTypeBadgeText: {
    color: '#7c3aed',
    fontSize: 12,
    fontWeight: '600',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  distanceBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  /* header & sort button styles */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  companyName: {
    fontWeight: '700',
    fontSize: 18,
    color: '#1f2937',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  priceLabel: {
    color: '#6b7280',
    fontSize: 13,
    flex: 1,
  },
  priceBadgeSmall: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  priceBadgeText: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 13,
  },
  priceBadgeTextLarge: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    color: '#6b7280',
    flex: 1,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 8,
    gap: 8,
  },
  statusOpen: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusClosed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusTextOpen: {
    color: '#059669',
  },
  statusTextClosed: {
    color: '#dc2626',
  },
  chevronContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: 16,
  },
});

export default VetCompanyCard;
