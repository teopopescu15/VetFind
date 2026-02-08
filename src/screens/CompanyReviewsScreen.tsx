import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Text, Card, Divider } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../types/navigation.types';
import { vetApi } from '../services/vetApi';
import { Review } from '../types/vet.types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'CompanyReviews'>;
type RouteProps = RouteProp<RootStackParamList, 'CompanyReviews'>;

const getFirstName = (fullName?: string): string => {
  if (!fullName) return 'Anonim';
  const trimmed = fullName.trim();
  if (!trimmed) return 'Anonim';
  return trimmed.split(/\s+/)[0];
};

const getTimeAgo = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (!Number.isFinite(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMins < 1) return 'Acum o clipă';
  if (diffMins < 60) return `Acum ${diffMins} ${diffMins === 1 ? 'minut' : 'minute'}`;
  if (diffHours < 24) return `Acum ${diffHours} ${diffHours === 1 ? 'oră' : 'ore'}`;
  if (diffDays === 0) return 'Astăzi';
  if (diffDays === 1) return 'Ieri';
  if (diffDays < 7) return `Acum ${diffDays} zile`;
  if (diffWeeks < 4) return `Acum ${diffWeeks} ${diffWeeks === 1 ? 'săptămână' : 'săptămâni'}`;
  if (diffMonths < 12) return `Acum ${diffMonths} ${diffMonths === 1 ? 'lună' : 'luni'}`;
  const diffYears = Math.floor(diffDays / 365);
  return `Acum ${diffYears} ${diffYears === 1 ? 'an' : 'ani'}`;
};

const Stars = ({ value, size = 16 }: { value: number; size?: number }) => {
  const v = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <MaterialCommunityIcons
          key={i}
          name={i < v ? 'star' : 'star-outline'}
          size={size}
          color={i < v ? '#fbbf24' : '#d1d5db'}
        />
      ))}
    </View>
  );
};

export const CompanyReviewsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { companyId, companyName } = route.params;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
  const data = await vetApi.reviews.getByClinic(companyId);
        if (!isMounted) return;
        setReviews(data);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'Failed to load reviews');
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const title = useMemo(() => {
    if (companyName?.trim()) return `Reviews - ${companyName.trim()}`;
    return 'Reviews';
  }, [companyName]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.muted}>Se încarcă recenziile…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="alert-circle" size={42} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="star-outline" size={42} color="#9ca3af" />
          <Text style={styles.muted}>Nicio recenzie încă.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          <View style={styles.summaryBlock}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryRating}>
                {(reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length).toFixed(1)}
              </Text>
              <Text style={styles.summaryCount}>({reviews.length} {reviews.length === 1 ? 'recenzie' : 'recenzii'})</Text>
            </View>
            <Stars value={reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length} size={22} />
            <View style={styles.summarySubScores}>
              <View style={styles.summarySubCol}>
                <Text style={styles.summarySubLabel}>Profesionalitate</Text>
                <Stars value={reviews.reduce((s, r) => s + (r.professionalism ?? 5), 0) / reviews.length} size={18} />
              </View>
              <View style={styles.summarySubCol}>
                <Text style={styles.summarySubLabel}>Eficiență</Text>
                <Stars value={reviews.reduce((s, r) => s + (r.efficiency ?? 5), 0) / reviews.length} size={18} />
              </View>
              <View style={styles.summarySubCol}>
                <Text style={styles.summarySubLabel}>Amabilitate</Text>
                <Stars value={reviews.reduce((s, r) => s + (r.friendliness ?? 5), 0) / reviews.length} size={18} />
              </View>
            </View>
          </View>
          {reviews.map((r, idx) => (
            <Card key={r.id ?? idx} style={styles.reviewCard}>
              <Card.Content>
                <View style={styles.reviewHeaderRow}>
                  <View>
                    <Text style={styles.author}>{getFirstName(r.user_name)}</Text>
                    {(r.created_at || (r as any).created_at) ? (
                      <Text style={styles.reviewDate}>{getTimeAgo(r.created_at ?? (r as any).created_at)}</Text>
                    ) : null}
                  </View>
                  <Stars value={r.rating} />
                </View>
                <View style={styles.reviewMetaRow}>
                  {r.category && (
                    <Text style={styles.reviewMeta}>
                      Categorie: {r.category === 'pisica' ? 'Pisică' : r.category === 'caine' ? 'Câine' : r.category === 'pasare' ? 'Pasăre' : 'Altele'}
                    </Text>
                  )}
                  {(r.appointment_service_names ?? (r as any).appointment_service_names) ? (
                    <Text style={styles.reviewMeta} numberOfLines={2}>
                      Serviciu: {r.appointment_service_names ?? (r as any).appointment_service_names}
                    </Text>
                  ) : null}
                </View>
                {r.comment ? (
                  <Text style={styles.comment}>{r.comment}</Text>
                ) : (
                  <Text style={styles.commentMuted}>Fără text.</Text>
                )}
              </Card.Content>
              {idx < reviews.length - 1 ? <Divider /> : null}
            </Card>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default CompanyReviewsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  muted: {
    color: '#6b7280',
  },
  errorText: {
    color: '#991b1b',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  summaryBlock: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  summaryRating: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  summaryCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 4,
  },
  summarySubScores: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summarySubCol: {
    alignItems: 'center',
    flex: 1,
  },
  summarySubLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  author: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewMetaRow: {
    marginBottom: 8,
    gap: 2,
  },
  reviewMeta: {
    fontSize: 13,
    color: '#6b7280',
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  commentMuted: {
    fontSize: 14,
    lineHeight: 20,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});
