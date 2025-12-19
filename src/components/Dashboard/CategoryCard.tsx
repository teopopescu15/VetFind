import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CategoryWithSpecializations } from '../../types/company.types';
import { useTheme } from '../../hooks/useTheme';

/**
 * CategoryCard - Expandable category card showing specializations
 *
 * Features:
 * - Category icon, name, and description
 * - Specialization count badge
 * - Expand/collapse functionality
 * - List of specializations when expanded
 * - Duration badges for each specialization
 */

interface CategoryCardProps {
  category: CategoryWithSpecializations;
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const { colors, responsive } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Get icon name based on category name
  const getCategoryIcon = (categoryName: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
      'Routine Care': 'stethoscope',
      'Dental Care': 'tooth',
      'Surgical Procedures': 'scalpel',
      'Emergency Care': 'ambulance',
      'Diagnostic Services': 'microscope',
      'Grooming & Wellness': 'content-cut',
    };

    return iconMap[categoryName] || 'paw';
  };

  // Format duration for display
  const formatDuration = (minutes: number): string => {
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

  return (
    <Card style={styles.card} elevation={3}>
      <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.8}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.headerRow}>
            {/* Icon with Gradient */}
            <LinearGradient
              colors={[colors.primary.main, colors.primary.light]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.iconContainer, {
                width: responsive.getValue(56, 64, 72),
                height: responsive.getValue(56, 64, 72),
              }]}
            >
              <MaterialCommunityIcons
                name={getCategoryIcon(category.name)}
                size={responsive.getValue(30, 34, 38)}
                color="#ffffff"
              />
            </LinearGradient>

            {/* Category Info */}
            <View style={styles.categoryInfo}>
              <View style={styles.titleRow}>
                <Text variant="titleMedium" style={styles.categoryName}>
                  {category.name}
                </Text>
                <Chip
                  style={styles.countChip}
                  textStyle={styles.countChipText}
                  compact
                >
                  {category.specializations.length}
                </Chip>
              </View>

              {category.description && !isExpanded && (
                <Text
                  variant="bodySmall"
                  style={styles.description}
                  numberOfLines={2}
                >
                  {category.description}
                </Text>
              )}
            </View>

            {/* Expand/Collapse Icon */}
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#6b7280"
              style={styles.chevron}
            />
          </View>

          {/* Expanded Content */}
          {isExpanded && (
            <View style={styles.expandedContent}>
              {category.description && (
                <Text variant="bodyMedium" style={styles.fullDescription}>
                  {category.description}
                </Text>
              )}

              {/* Specializations List */}
              <View style={styles.specializationsContainer}>
                <Text variant="titleSmall" style={styles.specializationsTitle}>
                  Services Offered:
                </Text>

                {category.specializations.map((specialization, index) => (
                  <View key={specialization.id} style={styles.specializationItem}>
                    <View style={styles.specializationCard}>
                      <View style={styles.specializationHeader}>
                        <View style={styles.bulletPoint}>
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={20}
                            color={colors.primary.main}
                          />
                        </View>
                        <Text variant="bodyMedium" style={styles.specializationName}>
                          {specialization.name}
                        </Text>
                        {specialization.suggested_duration_minutes && (
                          <Chip
                            style={styles.durationChip}
                            textStyle={styles.durationChipText}
                            compact
                            icon={() => (
                              <Ionicons name="time-outline" size={12} color="#ffffff" />
                            )}
                          >
                            {formatDuration(specialization.suggested_duration_minutes)}
                          </Chip>
                        )}
                      </View>

                      {specialization.description && (
                        <Text
                          variant="bodySmall"
                          style={styles.specializationDescription}
                        >
                          {specialization.description}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.1)',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
  categoryName: {
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    fontSize: 18,
  },
  countChip: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    height: 28,
  },
  countChipText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    color: '#6b7280',
    lineHeight: 20,
    fontSize: 14,
  },
  chevron: {
    marginLeft: 12,
  },
  expandedContent: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: 'rgba(37, 99, 235, 0.1)',
  },
  fullDescription: {
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 22,
    fontSize: 14,
  },
  specializationsContainer: {
    gap: 10,
  },
  specializationsTitle: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    fontSize: 16,
  },
  specializationItem: {
    marginBottom: 8,
  },
  specializationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  specializationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  bulletPoint: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  specializationName: {
    flex: 1,
    fontWeight: '600',
    color: '#1f2937',
    fontSize: 15,
  },
  durationChip: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    height: 26,
  },
  durationChipText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  specializationDescription: {
    color: '#6b7280',
    paddingLeft: 32,
    lineHeight: 20,
    fontSize: 13,
  },
});
