import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Text, HelperText } from 'react-native-paper';
import { ServiceListBuilder } from '../../components/FormComponents/ServiceListBuilder';
import { MultiImageUploader } from '../../components/FormComponents/MultiImageUploader';
import { Step4FormData, ServiceTemplate } from '../../types/company.types';
import ApiService from '../../services/api';

export interface Step4PricingProps {
  data: Step4FormData;
  onChange: (data: Step4FormData) => void;
  errors?: { [key: string]: string };
}

/**
 * Step 4: Pricing & Photos
 * - Service List Builder (load from templates + custom services)
 * - Photo Gallery Upload (4-10 photos, camera + gallery)
 * - Full Description (multiline, 500 char limit, required)
 */
export const Step4Pricing = ({ data, onChange, errors = {} }: Step4PricingProps) => {
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({});

  const updateField = (field: keyof Step4FormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleFocus = (field: string) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field: string) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  // Load service templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        const fetchedTemplates = await ApiService.getServiceTemplates();
        setTemplates(fetchedTemplates);
      } catch (error) {
        console.error('Error loading service templates:', error);
        // Use empty array as fallback
        setTemplates([]);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    loadTemplates();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Pricing & Photos
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Showcase your services and clinic with photos
        </Text>
      </View>

      {/* Full Description */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Clinic Description *
        </Text>
        <Text variant="bodySmall" style={styles.sectionDescription}>
          Provide a detailed description of your clinic (50-500 characters)
        </Text>
        <TextInput
          label="Full Description *"
          value={data.description || ''}
          onChangeText={(text) => updateField('description', text)}
          onFocus={() => handleFocus('description')}
          onBlur={() => handleBlur('description')}
          mode="outlined"
          error={!!errors.description}
          multiline
          numberOfLines={5}
          maxLength={500}
          placeholder="Tell pet owners about your clinic, your team, your philosophy, and what makes you special..."
          style={[styles.input, styles.textArea]}
          outlineColor="#e5e7eb"
          activeOutlineColor="#7c3aed"
          accessibilityLabel="Clinic Description"
          accessibilityHint="Detailed description of your clinic (50-500 characters)"
        />
        <HelperText type="error" visible={!!errors.description}>
          {errors.description || ' '}
        </HelperText>
        <HelperText type="info" visible={!errors.description && (isFocused.description || data.description)}>
          {data.description ? `${data.description.length}/500 characters` : '50-500 characters required'}
        </HelperText>
      </View>

      {/* Service List Builder */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Services & Pricing *
        </Text>
        <Text variant="bodySmall" style={styles.sectionDescription}>
          Add your services with pricing information
        </Text>
        <ServiceListBuilder
          value={data.services || []}
          onChange={(services) => updateField('services', services)}
          templates={templates}
        />
        {errors.services && (
          <HelperText type="error" visible={true}>
            {errors.services}
          </HelperText>
        )}
      </View>

      {/* Photo Gallery */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Clinic Photos *
        </Text>
        <Text variant="bodySmall" style={styles.sectionDescription}>
          Upload 4-10 photos of your clinic (interior, exterior, team, facilities)
        </Text>
        <MultiImageUploader
          value={data.photos || []}
          onChange={(photos) => updateField('photos', photos)}
          minPhotos={4}
          maxPhotos={10}
        />
        {errors.photos && (
          <HelperText type="error" visible={true}>
            {errors.photos}
          </HelperText>
        )}
        <HelperText type="info">
          High-quality photos help build trust with pet owners
        </HelperText>
      </View>

      {/* Required Fields Notice */}
      <View style={styles.notice}>
        <Text variant="bodySmall" style={styles.noticeText}>
          * Required fields
        </Text>
      </View>

      {/* Submission Notice */}
      <View style={styles.submissionNotice}>
        <Text variant="bodyMedium" style={styles.submissionNoticeTitle}>
          Ready to Submit?
        </Text>
        <Text variant="bodySmall" style={styles.submissionNoticeText}>
          Review all your information before submitting. You can always edit your profile later.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8
  },
  subtitle: {
    color: '#6b7280',
    lineHeight: 20
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  sectionDescription: {
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 18
  },
  input: {
    backgroundColor: '#fff'
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top'
  },
  notice: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed'
  },
  noticeText: {
    color: '#6b7280',
    fontStyle: 'italic'
  },
  submissionNotice: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac'
  },
  submissionNoticeTitle: {
    fontWeight: '700',
    color: '#166534',
    marginBottom: 4
  },
  submissionNoticeText: {
    color: '#15803d',
    lineHeight: 18
  }
});
