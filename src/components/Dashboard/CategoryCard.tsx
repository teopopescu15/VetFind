import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { CategoryWithSpecializations } from '../../types/company.types';

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
    <Card style={styles.card}>
      <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.7}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.headerRow}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={getCategoryIcon(category.name)}
                size={32}
                color="#7c3aed"
              />
            </View>

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

                {category.specializations.map((specialization) => (
                  <View key={specialization.id} style={styles.specializationItem}>
                    <View style={styles.specializationHeader}>
                      <MaterialCommunityIcons
                        name="circle-small"
                        size={24}
                        color="#7c3aed"
                      />
                      <Text variant="bodyMedium" style={styles.specializationName}>
                        {specialization.name}
                      </Text>
                      {specialization.suggested_duration_minutes && (
                        <Chip
                          style={styles.durationChip}
                          textStyle={styles.durationChipText}
                          compact
                          icon={() => (
                            <Ionicons name="time-outline" size={12} color="#6b7280" />
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
    marginBottom: 12,
    elevation: 2,
  },
  cardContent: {
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f3e8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  categoryName: {
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  countChip: {
    backgroundColor: '#e9d5ff',
    borderRadius: 12,
    height: 24,
  },
  countChipText: {
    color: '#7c3aed',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    color: '#6b7280',
    lineHeight: 18,
  },
  chevron: {
    marginLeft: 8,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  fullDescription: {
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  specializationsContainer: {
    gap: 12,
  },
  specializationsTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  specializationItem: {
    paddingLeft: 8,
  },
  specializationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  specializationName: {
    flex: 1,
    fontWeight: '500',
    color: '#374151',
  },
  durationChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    height: 22,
  },
  durationChipText: {
    color: '#6b7280',
    fontSize: 11,
  },
  specializationDescription: {
    color: '#6b7280',
    paddingLeft: 28,
    lineHeight: 18,
  },
});
