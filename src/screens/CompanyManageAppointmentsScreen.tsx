import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types/navigation.types';

import { ManageAppointmentsSection } from '../components/Dashboard/ManageAppointmentsSection';
import { theme } from '../theme';

/**
 * CompanyManageAppointmentsScreen
 *
 * Dedicated screen for managing a clinic's appointments.
 * Extracted from CompanyDashboardScreen to keep the dashboard lightweight.
 */
export const CompanyManageAppointmentsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'CompanyManageAppointments'>>();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            iconColor={theme.colors.primary.main}
            size={24}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          />
          <Text variant="titleLarge" style={styles.headerTitle}>
            Gestionează programări
          </Text>
          <Button
            mode="contained"
            compact
            icon="plus"
            onPress={() => navigation.navigate('CompanyAddAppointment')}
            style={styles.addButton}
            contentStyle={styles.addButtonContent}
            labelStyle={styles.addButtonLabel}
          >
            Adaugă programare
          </Button>
        </View>

        <View style={styles.content}>
          <ManageAppointmentsSection />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.neutral[100],
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.neutral[50],
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: theme.colors.neutral[900],
    fontWeight: '700',
  },
  addButton: {
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.accent.main,
  },
  addButtonContent: {
    flexDirection: 'row-reverse',
    paddingHorizontal: theme.spacing.sm,
    height: 36,
  },
  addButtonLabel: {
    color: theme.colors.white,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
});
