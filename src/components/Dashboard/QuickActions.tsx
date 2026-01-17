/**
 * QuickActions Component
 *
 * Displays a 2x2 grid of quick action buttons for vet company dashboards.
 * Each action has a specific color and icon for visual hierarchy.
 *
 * Features:
 * - 2x2 grid layout (responsive)
 * - Color-coded actions (terracotta, blue, cyan, green)
 * - Icon + label for each action
 * - Press animations
 * - Warm professional design
 *
 * Usage:
 * ```tsx
 * <QuickActions
 *   onNewAppointment={() => navigate('NewAppointment')}
 *   onManageServices={() => navigate('ManageServices')}
 *   onUpdatePrices={() => navigate('ManagePrices')}
 *   onAddPhotos={() => navigate('AddPhotos')}
 * />
 * ```
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

/**
 * Action configuration interface
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  iconLibrary: 'Ionicons' | 'MaterialCommunityIcons';
  color: string;
  backgroundColor: string;
  onPress: () => void;
}

/**
 * Props interface
 */
export interface QuickActionsProps {
  onNewAppointment?: () => void;
  onManageServices?: () => void;
  onUpdatePrices?: () => void;
  onAddPhotos?: () => void;
  customActions?: QuickAction[];
}

/**
 * QuickActions Component
 */
export const QuickActions = ({
  onNewAppointment,
  onManageServices,
  onUpdatePrices,
  onAddPhotos,
  customActions,
}: QuickActionsProps) => {
  /**
   * Default actions configuration
   * Colors as per redesign spec: terracotta, blue, cyan, green
   */
  const defaultActions: QuickAction[] = [
    {
      id: 'new-appointment',
      label: 'Manage Appointments',
      icon: 'add-circle',
      iconLibrary: 'Ionicons',
      color: theme.colors.white,
      backgroundColor: theme.colors.accent.main,  // Terracotta #ea580c
      onPress: onNewAppointment || (() => console.log('New Appointment')),
    },
    {
      id: 'manage-services',
      label: 'Manage Services',
      icon: 'medical-bag',
      iconLibrary: 'MaterialCommunityIcons',
      color: theme.colors.white,
      backgroundColor: theme.colors.primary.main,  // Blue #2563eb
      onPress: onManageServices || (() => console.log('Manage Services')),
    },
    {
      id: 'update-prices',
      label: 'Update Prices',
      icon: 'pricetag',
      iconLibrary: 'Ionicons',
      color: theme.colors.white,
      backgroundColor: '#0284c7',  // Cyan
      onPress: onUpdatePrices || (() => console.log('Update Prices')),
    },
    {
      id: 'add-photos',
      label: 'Add Photos',
      icon: 'images',
      iconLibrary: 'Ionicons',
      color: theme.colors.white,
      backgroundColor: '#16a34a',  // Green
      onPress: onAddPhotos || (() => console.log('Add Photos')),
    },
  ];

  const actions = customActions || defaultActions;

  /**
   * Render individual action card
   */
  const renderActionCard = (action: QuickAction) => {
    const IconComponent = action.iconLibrary === 'Ionicons' ? Ionicons : MaterialCommunityIcons;

    return (
      <TouchableOpacity
        key={action.id}
        style={[
          styles.actionCard,
          { backgroundColor: action.backgroundColor },
          Platform.OS === 'web' && styles.actionCardWeb,
        ]}
        onPress={action.onPress}
        activeOpacity={0.8}
      >
        <IconComponent name={action.icon as any} size={32} color={action.color} />
        <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {actions.map(renderActionCard)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',  // Ensures 2 columns on mobile
    aspectRatio: 1.2,  // Slightly wider than tall
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.md,
  },
  actionCardWeb: {
    // Enhanced shadow for web
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  actionLabel: {
    ...theme.typography.bodyMedium,
    fontWeight: '700',
    textAlign: 'center',
  },
});
