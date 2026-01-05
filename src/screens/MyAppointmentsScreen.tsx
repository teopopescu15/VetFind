import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/api';
import type { Appointment } from '../types/vet.types';
import { theme } from '../theme';

interface MyAppointmentsScreenProps {
  navigation: any;
}

export const MyAppointmentsScreen = ({ navigation }: MyAppointmentsScreenProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedAppointments, setExpandedAppointments] = useState<number[]>([]);

  const toggleExpand = (id?: number | null) => {
    if (!id) return;
    setExpandedAppointments((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getUserAppointments();

      const now = Date.now();

      const cleaned = (data || [])
        // Defensive: server may return soft-deleted entries
        .filter((a: any) => !a?.deleted)
        // Defensive: ignore invalid dates
        .filter((a: any) => Number.isFinite(new Date((a as any).appointment_date).getTime()));

      const filtered = cleaned.filter((a: any) => {
        const t = new Date((a as any).appointment_date).getTime();
        const isFuture = t >= now;
        if (filter === 'upcoming') return isFuture;
        if (filter === 'past') return !isFuture;
        return true;
      });

      // Upcoming: soonest first; Past: most recent first
      filtered.sort((a: any, b: any) => {
        const ta = new Date((a as any).appointment_date).getTime();
        const tb = new Date((b as any).appointment_date).getTime();
        if (filter === 'past' || filter === 'all') return tb - ta;
        return ta - tb;
      });

      setAppointments(filtered as any);
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      Alert.alert('Error', 'Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadAppointments();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelAppointment = (appointmentId: number) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const ok = await ApiService.cancelAppointment(appointmentId);
              if (!ok) throw new Error('Failed to cancel appointment');
              Alert.alert('Success', 'Appointment cancelled successfully');
              loadAppointments();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel appointment');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return theme.colors.success.main;
      case 'pending':
        return theme.colors.warning.main;
      case 'cancelled':
        return theme.colors.error.main;
      case 'completed':
        return theme.colors.info.main;
      default:
        return theme.colors.neutral[500];
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderAppointmentCard = ({ item }: { item: Appointment }) => {
    const appointmentDate = new Date(item.appointment_date);
    const isPast = appointmentDate < new Date();
    const canCancel = item.status === 'pending' || item.status === 'confirmed';

    // Normalize services selection: support multiple shapes returned from backend
    let servicesList: Array<any> = [];
    const anyItem: any = item as any;
    if (Array.isArray(anyItem.services) && anyItem.services.length) {
      servicesList = anyItem.services;
    } else if (Array.isArray(anyItem.selected_services) && anyItem.selected_services.length) {
      servicesList = anyItem.selected_services;
    } else if (Array.isArray(anyItem.service) && anyItem.service.length) {
      servicesList = anyItem.service;
    } else if (anyItem.service_name || anyItem.service) {
      // single service fallback
      servicesList = [
        {
          service_name: anyItem.service_name || anyItem.service?.service_name || anyItem.service || 'Service',
          price_min: anyItem.service?.price_min ?? anyItem.service_price ?? anyItem.price ?? undefined,
          price_max: anyItem.service?.price_max ?? anyItem.service_price ?? anyItem.price ?? undefined,
          duration_minutes: anyItem.service?.duration_minutes ?? undefined,
        },
      ];
    }

    const totalPriceMin = servicesList.length
      ? servicesList.reduce((sum, s) => sum + Number(s?.price_min ?? s?.price ?? 0), 0)
      : 0;
    const totalPriceMax = servicesList.length
      ? servicesList.reduce((sum, s) => sum + Number(s?.price_max ?? s?.price ?? 0), 0)
      : 0;
    const totalDuration = servicesList.length
      ? servicesList.reduce((sum, s) => sum + Number(s?.duration_minutes ?? 0), 0)
      : 0;

    const isExpanded = expandedAppointments.includes(item.id || 0);

    const formatPriceRange = (min?: number, max?: number) => {
      const minN = Number(min ?? 0) || 0;
      const maxN = Number(max ?? minN) || minN;
      if (minN === maxN) return `$${minN}`;
      return `$${minN} - $${maxN}`;
    };

    const formatDuration = (minutes?: number) => {
      const m = Number(minutes ?? 0) || 0;
      if (!m) return '0 min';
      if (m < 60) return `${m} min`;
      const hrs = Math.floor(m / 60);
      const rem = m % 60;
      return rem === 0 ? `${hrs} hr` : `${hrs}h ${rem}m`;
    };

    const hasServicesInNotes = (notes?: string | null) => {
      if (!notes) return false;

      // Backend sometimes duplicates services inside notes like:
      // "Notes: Also includes services: General Checkup, Microchipping"
      return /also\s+includes\s+services\s*:/i.test(notes);
    };

    return (
      <View style={styles.appointmentCard}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => toggleExpand(item.id)} style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.clinicName}>{item.clinic_name}</Text>
            {!!item.clinic_address && (
              <Text style={styles.subText} numberOfLines={1}>
                {item.clinic_address}
              </Text>
            )}
          </View>

          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.neutral[600]} />
                <Text style={styles.metaText}>
                {appointmentDate.toLocaleDateString()} •{' '}
                {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>

            <TouchableOpacity
              onPress={() => toggleExpand(item.id)}
              activeOpacity={0.7}
              style={styles.expandChevron}
              accessibilityRole="button"
              accessibilityLabel={isExpanded ? 'Collapse appointment details' : 'Expand appointment details'}
            >
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.colors.neutral[700]}
              />
            </TouchableOpacity>

          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedDetails}>
            {/* Services list */}
            {servicesList.length > 0 ? (
              <View style={{ marginBottom: theme.spacing.sm }}>
                <Text style={styles.expandedHeading}>Services</Text>
                {servicesList.map((s, idx) => {
                  const priceText =
                    s?.price_min != null || s?.price_max != null || s?.price != null
                      ? (s?.price_min != null && s?.price_max != null
                          ? formatPriceRange(Number(s.price_min), Number(s.price_max))
                          : formatPriceRange(Number(s.price ?? s.price_min ?? s.price_max ?? 0), Number(s.price ?? s.price_min ?? s.price_max ?? 0)))
                      : '$0';
                  const durationText = s?.duration_minutes ? `${Number(s.duration_minutes)} min` : '0 min';

                  return (
                    <Text key={idx} style={styles.expandedLine}>
                      {s?.service_name || s?.name || item.service_name || 'Service'} — {priceText} • {durationText}
                    </Text>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.expandedLine}>No services</Text>
            )}

            {/* Totals */}
            <Text style={styles.expandedLine}>
              <Text style={styles.detailLabel}>Price:</Text> {formatPriceRange(totalPriceMin, totalPriceMax)}
            </Text>
            <Text style={styles.expandedLine}>
              <Text style={styles.detailLabel}>Duration:</Text> {formatDuration(totalDuration)}
            </Text>

            {!!item.notes && !hasServicesInNotes(item.notes) && (
              <Text style={[styles.expandedLine, { marginTop: theme.spacing.xs }]}>
                <Text style={styles.detailLabel}>Notes:</Text> {item.notes}
              </Text>
            )}

            {!!item.clinic_phone && (
              <Text style={styles.expandedLine}>
                <Text style={styles.detailLabel}>Phone:</Text> {item.clinic_phone}
              </Text>
            )}
          </View>
        )}

        {!isPast && canCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelAppointment(item.id!)}>
            <Ionicons name="close-circle-outline" size={18} color={theme.colors.error.main} />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.primary.main, theme.colors.accent.main]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack?.()} style={styles.backButton} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>My Appointments</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <Chip
          selected={filter === 'upcoming'}
          onPress={() => setFilter('upcoming')}
          style={[styles.filterChip, filter === 'upcoming' && styles.filterChipSelected]}
          textStyle={[styles.filterChipText, filter === 'upcoming' && styles.filterChipTextSelected]}
        >
          Upcoming
        </Chip>
        <Chip
          selected={filter === 'past'}
          onPress={() => setFilter('past')}
          style={[styles.filterChip, filter === 'past' && styles.filterChipSelected]}
          textStyle={[styles.filterChipText, filter === 'past' && styles.filterChipTextSelected]}
        >
          Past
        </Chip>
        <Chip
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={[styles.filterChip, filter === 'all' && styles.filterChipSelected]}
          textStyle={[styles.filterChipText, filter === 'all' && styles.filterChipTextSelected]}
        >
          All
        </Chip>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={56} color={theme.colors.neutral[300]} />
          <Text style={styles.emptyText}>No appointments found</Text>
          <Text style={styles.emptySubtext}>
            {filter === 'upcoming' ? 'You have no upcoming appointments' : 'No appointments to show'}
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('UserDashboard')}
          >
            <Text style={styles.exploreButtonText}>Find a Clinic</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointmentCard}
          keyExtractor={(item) => item.id?.toString() || '0'}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[100],
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'web' ? theme.spacing.lg : theme.spacing['2xl'],
    paddingBottom: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  filterChip: {
    backgroundColor: theme.colors.neutral[100],
    borderColor: theme.colors.neutral[200],
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary.main,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.neutral[700],
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: 15,
    color: theme.colors.neutral[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['3xl'],
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.neutral[800],
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  exploreButton: {
    backgroundColor: theme.colors.accent.main,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.primarySm,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  listContainer: {
    padding: theme.spacing.lg,
  },
  appointmentCard: {
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    ...theme.shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.neutral[900],
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  subText: {
    marginTop: theme.spacing.xs,
    fontSize: 13,
    color: theme.colors.neutral[600],
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.neutral[700],
  },
  cardBody: {
    marginBottom: theme.spacing.sm,
  },
  expandedDetails: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  expandedHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.xs,
  },
  expandedLine: {
    fontSize: 14,
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.neutral[700],
  },
  expandChevron: {
    marginLeft: 'auto',
    paddingLeft: theme.spacing.sm,
    paddingRight: theme.spacing.xs,
    paddingVertical: 2,
    alignSelf: 'center',
  },
  detailLine: {
    fontSize: 14,
    color: theme.colors.neutral[700],
    marginBottom: theme.spacing.xs,
  },
  detailLabel: {
    fontWeight: '800',
    color: theme.colors.neutral[800],
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.22)',
  },
  cancelButtonText: {
    color: theme.colors.error.main,
    fontSize: 14,
    fontWeight: '800',
  }
});

export default MyAppointmentsScreen;
