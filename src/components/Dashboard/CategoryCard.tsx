import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, useWindowDimensions } from 'react-native';
import { Text, Card, Chip, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CategoryWithSpecializations, CreateServiceDTO, ServiceCategoryType } from '../../types/company.types';
import { useTheme } from '../../hooks/useTheme';
import { useCompany } from '../../context/CompanyContext';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { translateCategoryName, translateSpecializationName, translateCategoryDescription, translateSpecializationDescription } from '../../constants/serviceTranslations';

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
  const { width } = useWindowDimensions();
  const [isExpanded, setIsExpanded] = useState(false);
  const { company, refreshCompany } = useCompany();
  const { accessToken } = useAuth();

  const [activeSpecializationId, setActiveSpecializationId] = useState<number | null>(null);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [duration, setDuration] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Responsive breakpoints
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Get icon name based on category name
  const getCategoryIcon = (categoryName: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
      'Routine Care': 'stethoscope',
      'Dental Care': 'tooth',
      'Surgical Procedures': 'knife',
      'Emergency Care': 'ambulance',
      'Diagnostic Services': 'microscope',
      'Grooming & Wellness': 'content-cut',
    };

    return iconMap[categoryName] || 'paw';
  };

  const categoryType = useMemo((): ServiceCategoryType => {
    const map: Record<string, ServiceCategoryType> = {
      'Routine Care': 'routine_care',
      'Dental Care': 'dental_care',
      'Diagnostic Services': 'diagnostic_services',
      'Emergency Care': 'emergency_care',
      'Surgical Procedures': 'surgical_procedures',
      'Grooming & Wellness': 'grooming',
      'Grooming': 'grooming',
    };
    return map[category.name] || 'custom';
  }, [category.name]);

  const isSpecializationAlreadyAdded = (specializationId: number, specializationName: string) => {
    const list = ((company as any)?.services || []) as any[];
    if (!Array.isArray(list) || list.length === 0) return false;

    // Preferred: link through specialization_id
    if (list.some(s => Number(s?.specialization_id) === specializationId && (s.is_active === undefined || s.is_active === true))) {
      return true;
    }

    // Fallback for older data: match by service name
    const needle = (specializationName || '').trim().toLowerCase();
    return list.some(s => (String(s?.service_name || '').trim().toLowerCase() === needle) && (s.is_active === undefined || s.is_active === true));
  };

  const handleStartAddService = (specializationId: number, _suggestedDurationMinutes?: number) => {
    setActiveSpecializationId(prev => (prev === specializationId ? null : specializationId));
    setPriceMin('');
    setPriceMax('');
    // Keep empty so placeholder is visible (Duration(min))
    setDuration('');
  };

  const handleDoneAddService = async (specializationId: number, specializationName: string) => {
    if (!company) {
      Alert.alert('Eroare', 'Compania nu este încărcată.');
      return;
    }

    if (!priceMin.trim()) {
      Alert.alert('Validare', 'Prețul minim este obligatoriu.');
      return;
    }
    if (!duration.trim()) {
      Alert.alert('Validare', 'Durata (min) este obligatorie.');
      return;
    }

    const pm = parseFloat(priceMin);
    const px = priceMax.trim() ? parseFloat(priceMax) : pm;
    const dur = parseInt(duration, 10);

    if (!Number.isFinite(pm) || pm < 0) {
      Alert.alert('Validare', 'Prețul minim trebuie să fie un număr valid.');
      return;
    }
    if (!Number.isFinite(dur) || dur <= 0) {
      Alert.alert('Validare', 'Durata trebuie să fie un număr pozitiv.');
      return;
    }
    if (priceMax.trim() && (!Number.isFinite(px) || px < 0)) {
      Alert.alert('Validare', 'Prețul maxim trebuie să fie un număr valid.');
      return;
    }

    if (px < pm) {
      Alert.alert('Validare', 'Prețul maxim trebuie să fie >= prețul minim.');
      return;
    }

    try {
      setIsSaving(true);
      const dto: CreateServiceDTO = {
        category: categoryType,
        service_name: specializationName,
        specialization_id: specializationId,
        category_id: category.id,
        price_min: pm,
        price_max: px,
        duration_minutes: dur,
        is_custom: false,
      };

      await ApiService.createService(company.id, dto, accessToken || undefined);
      try { await refreshCompany(); } catch (e) { /* ignore */ }

      setActiveSpecializationId(null);
      Alert.alert('Succes', 'Serviciu adăugat.');
    } catch (err: any) {
      console.error('Add service error:', err);
      Alert.alert('Eroare', err.message || 'Nu s-a putut adăuga serviciul.');
    } finally {
      setIsSaving(false);
    }
  };

  // Responsive sizing
  const iconContainerSize = isDesktop ? 44 : isTablet ? 52 : 56;
  const iconSize = isDesktop ? 24 : isTablet ? 28 : 30;
  const cardPadding = isDesktop ? 14 : isTablet ? 16 : 20;

  return (
    <Card style={styles.card} elevation={isDesktop ? 1 : 3}>
      <Card.Content style={[styles.cardContent, { paddingVertical: cardPadding, paddingHorizontal: isDesktop ? 12 : 16 }]}>
        <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.8}>
          <View style={styles.headerRow}>
            {/* Icon with Gradient */}
            <LinearGradient
              colors={[colors.primary.main, colors.primary.light]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.iconContainer, {
                width: iconContainerSize,
                height: iconContainerSize,
                marginRight: isDesktop ? 10 : 16,
              }]}
            >
              <MaterialCommunityIcons
                name={getCategoryIcon(category.name)}
                size={iconSize}
                color="#ffffff"
              />
            </LinearGradient>

            {/* Category Info */}
            <View style={styles.categoryInfo}>
              <View style={styles.titleRow}>
                <Text
                  variant="titleMedium"
                  style={[styles.categoryName, { fontSize: isDesktop ? 15 : isTablet ? 16 : 18 }]}
                >
                  {translateCategoryName(category.name)}
                </Text>
                <Chip
                  style={[styles.countChip, { height: isDesktop ? 24 : 28 }]}
                  textStyle={[styles.countChipText, { fontSize: isDesktop ? 11 : 13 }]}
                  compact
                >
                  {category.specializations.length}
                </Chip>
              </View>

              {category.description && !isExpanded && (
                <Text
                  variant="bodySmall"
                  style={[styles.description, { fontSize: isDesktop ? 12 : 14 }]}
                  numberOfLines={isDesktop ? 1 : 2}
                >
                  {translateCategoryDescription(category.name) || category.description}
                </Text>
              )}
            </View>

            {/* Expand/Collapse Icon */}
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={isDesktop ? 20 : 24}
              color="#6b7280"
              style={styles.chevron}
            />
          </View>
        </TouchableOpacity>

          {/* Expanded Content */}
          {isExpanded && (
            <View style={[
              styles.expandedContent,
              { marginTop: isDesktop ? 14 : 20, paddingTop: isDesktop ? 14 : 20 }
            ]} onStartShouldSetResponder={() => true}>
              {category.description && (
                <Text
                  variant="bodyMedium"
                  style={[styles.fullDescription, { fontSize: isDesktop ? 13 : 14, marginBottom: isDesktop ? 14 : 20 }]}
                >
                  {translateCategoryDescription(category.name) || category.description}
                </Text>
              )}

              {/* Specializations List */}
              <View style={[styles.specializationsContainer, { gap: isDesktop ? 6 : 10 }]}>
                <Text
                  variant="titleSmall"
                  style={[styles.specializationsTitle, { fontSize: isDesktop ? 14 : 16, marginBottom: isDesktop ? 8 : 12 }]}
                >
                  Servicii oferite:
                </Text>

                {category.specializations.map((specialization, index) => (
                  <View key={specialization.id} style={[styles.specializationItem, { marginBottom: isDesktop ? 6 : 8 }]}>
                    <View style={[styles.specializationCard, { padding: isDesktop ? 10 : 14 }]}>
                      <View style={[styles.specializationHeader, { marginBottom: isDesktop ? 4 : 6, gap: isDesktop ? 6 : 8 }]}>
                        <View style={[styles.bulletPoint, { width: isDesktop ? 20 : 24, height: isDesktop ? 20 : 24 }]}>
                          <MaterialCommunityIcons
                            name="circle-small"
                            size={isDesktop ? 16 : 20}
                            color="#9ca3af"
                          />
                        </View>
                        <Text
                          variant="bodyMedium"
                          style={[styles.specializationName, { fontSize: isDesktop ? 13 : 15 }]}
                        >
                          {translateSpecializationName(specialization.name)}
                        </Text>
                        {isSpecializationAlreadyAdded(specialization.id, specialization.name) ? (
                          <Chip
                            style={[styles.addedChip, { height: isDesktop ? 24 : 28 }]}
                            textStyle={[styles.addedChipText, { fontSize: isDesktop ? 10 : 12 }]}
                            compact
                          >
                            Adăugat
                          </Chip>
                        ) : (
                          <Button
                            mode={activeSpecializationId === specialization.id ? 'outlined' : 'contained'}
                            compact
                            disabled={isSaving}
                            onPress={() => handleStartAddService(specialization.id, specialization.suggested_duration_minutes)}
                            style={[styles.addServiceButton, { height: isDesktop ? 24 : 28 }]}
                            labelStyle={[styles.addServiceButtonLabel, { fontSize: isDesktop ? 10 : 12 }]}
                          >
                            {activeSpecializationId === specialization.id ? 'Anulare' : 'Adaugă serviciu'}
                          </Button>
                        )}
                      </View>

                      {activeSpecializationId === specialization.id && !isSpecializationAlreadyAdded(specialization.id, specialization.name) && (
                        <View style={styles.addServiceInlineForm}>
                          <View style={styles.inlineRow}>
                            <View style={styles.inlineField}>
                              <TextInput
                                placeholder="Pret min*"
                                keyboardType="numeric"
                                value={priceMin}
                                onChangeText={setPriceMin}
                                style={styles.inlineInput}
                                placeholderTextColor="#9ca3af"
                              />
                            </View>
                            <View style={styles.inlineField}>
                              <TextInput
                                placeholder="Pret max"
                                keyboardType="numeric"
                                value={priceMax}
                                onChangeText={setPriceMax}
                                style={styles.inlineInput}
                                placeholderTextColor="#9ca3af"
                              />
                            </View>
                          </View>

                          <View style={styles.inlineRow}>
                            <View style={styles.inlineField}>
                              <TextInput
                                placeholder="Durată (min)*"
                                keyboardType="numeric"
                                value={duration}
                                onChangeText={setDuration}
                                style={styles.inlineInput}
                                placeholderTextColor="#9ca3af"
                              />
                            </View>
                            <View style={styles.inlineActions}>
                              <Button
                                mode="contained"
                                disabled={isSaving}
                                onPress={() => handleDoneAddService(specialization.id, specialization.name)}
                                style={styles.doneButton}
                                labelStyle={styles.doneButtonLabel}
                              >
                                Finalizare
                              </Button>
                              {isSaving && (
                                <ActivityIndicator size="small" color={colors.primary.main} style={styles.savingSpinner} />
                              )}
                            </View>
                          </View>
                        </View>
                      )}

                      {specialization.description && (
                        <Text
                          variant="bodySmall"
                          style={[
                            styles.specializationDescription,
                            { fontSize: isDesktop ? 11 : 13, paddingLeft: isDesktop ? 26 : 32 }
                          ]}
                        >
                          {translateSpecializationDescription(category.name, specialization.name) || specialization.description}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.1)',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardContent: {
    // Dynamic padding applied inline
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  categoryName: {
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  countChip: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
  },
  countChipText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  description: {
    color: '#6b7280',
    lineHeight: 18,
  },
  chevron: {
    marginLeft: 10,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(37, 99, 235, 0.1)',
  },
  fullDescription: {
    color: '#6b7280',
    lineHeight: 20,
  },
  specializationsContainer: {
    // Gap applied dynamically
  },
  specializationsTitle: {
    fontWeight: '700',
    color: '#111827',
  },
  specializationItem: {
    // Margin applied dynamically
  },
  specializationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  specializationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletPoint: {
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  specializationName: {
    flex: 1,
    fontWeight: '600',
    color: '#1f2937',
  },
  addServiceButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    justifyContent: 'center',
  },
  addServiceButtonLabel: {
    color: '#ffffff',
    fontWeight: '700',
    marginVertical: 0,
    marginHorizontal: 8,
  },
  addedChip: {
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    borderRadius: 8,
  },
  addedChipText: {
    color: '#16a34a',
    fontWeight: '800',
  },
  addServiceInlineForm: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 10,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  inlineField: {
    flex: 1,
  },
  inlineInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
  },
  inlineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  doneButton: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
  },
  doneButtonLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    marginVertical: 0,
    marginHorizontal: 14,
  },
  savingSpinner: {
    marginLeft: 2,
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
