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
import { View, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
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
  const { width } = useWindowDimensions();

  // Responsive breakpoints
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  /**
   * Default actions configuration
   * Colors as per redesign spec: terracotta, blue, cyan, green
   */
  const defaultActions: QuickAction[] = [
    {
      id: 'new-appointment',
      label: 'Gestionează programările',
      icon: 'add-circle',
      iconLibrary: 'Ionicons',
      color: theme.colors.white,
      backgroundColor: theme.colors.accent.main,  // Terracotta #ea580c
      onPress: onNewAppointment || (() => console.log('New Appointment')),
    },
    {
      id: 'manage-services',
      label: 'Gestionează serviciile',
      icon: 'medical-bag',
      iconLibrary: 'MaterialCommunityIcons',
      color: theme.colors.white,
      backgroundColor: theme.colors.primary.main,  // Blue #2563eb
      onPress: onManageServices || (() => console.log('Manage Services')),
    },
    {
      id: 'update-prices',
      label: 'Actualizează prețurile',
      icon: 'pricetag',
      iconLibrary: 'Ionicons',
      color: theme.colors.white,
      backgroundColor: '#0284c7',  // Cyan
      onPress: onUpdatePrices || (() => console.log('Update Prices')),
    },
    {
      id: 'add-photos',
      label: 'Adaugă fotografii',
      icon: 'images',
      iconLibrary: 'Ionicons',
      color: theme.colors.white,
      backgroundColor: '#16a34a',  // Green
      onPress: onAddPhotos || (() => console.log('Add Photos')),
    },
  ];

  const actions = customActions || defaultActions;

  // Responsive sizing
  const cardPadding = isDesktop ? 12 : isTablet ? 14 : theme.spacing.lg;
  const iconSize = isDesktop ? 24 : isTablet ? 28 : 32;
  const fontSize = isDesktop ? 13 : isTablet ? 14 : 15;

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
          {
            backgroundColor: action.backgroundColor,
            padding: cardPadding,
            // Desktop: 4 columns in a row, more compact
            minWidth: isDesktop ? '23%' : isTablet ? '30%' : '45%',
            aspectRatio: isDesktop ? 1.4 : isTablet ? 1.2 : 1.0,
          },
          Platform.OS === 'web' && styles.actionCardWeb,
        ]}
        onPress={action.onPress}
        activeOpacity={0.8}
      >
        <IconComponent name={action.icon as any} size={iconSize} color={action.color} />
        <Text
          style={[
            styles.actionLabel,
            {
              color: action.color,
              fontSize,
              lineHeight: isDesktop ? 16 : isTablet ? 18 : 20,
            }
          ]}
          numberOfLines={isDesktop ? 2 : undefined}
        >
          {action.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.grid,
        isDesktop && { justifyContent: 'flex-start' }
      ]}>
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
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  actionCardWeb: {
    // Enhanced shadow for web
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionLabel: {
    ...theme.typography.bodyMedium,
    fontWeight: '700',
    textAlign: 'center',
  },
});
