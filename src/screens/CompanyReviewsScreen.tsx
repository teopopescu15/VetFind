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

const Stars = ({ value }: { value: number }) => {
  const v = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <MaterialCommunityIcons
          key={i}
          name={i < v ? 'star' : 'star-outline'}
          size={16}
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
          <Text style={styles.muted}>Loading reviews…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="alert-circle" size={42} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="star-outline" size={42} color="#9ca3af" />
          <Text style={styles.muted}>No reviews yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {reviews.map((r, idx) => (
            <Card key={r.id ?? idx} style={styles.reviewCard}>
              <Card.Content>
                <View style={styles.reviewHeaderRow}>
                  <Text style={styles.author}>{getFirstName(r.user_name)}</Text>
                  <Stars value={r.rating} />
                </View>
                {r.comment ? (
                  <Text style={styles.comment}>{r.comment}</Text>
                ) : (
                  <Text style={styles.commentMuted}>No text provided.</Text>
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
  starsRow: {
    flexDirection: 'row',
    gap: 2,
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
