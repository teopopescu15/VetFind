import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Text, HelperText } from 'react-native-paper';
import { ImageUploader } from '../../components/FormComponents/ImageUploader';
import { Step1FormData } from '../../types/company.types';

export interface Step1BasicInfoProps {
  data: Step1FormData;
  onChange: (data: Step1FormData) => void;
  errors?: { [key: string]: string };
}

/**
 * Step 1: Basic Info
 * - Company Name (required, 3-100 chars)
 * - Logo Upload (optional, camera + gallery)
 * - Business Email (required, email validation)
 * - Phone Number (required, format validation)
 * - Short Description (optional, 100 char limit)
 */
export const Step1BasicInfo = ({ data, onChange, errors = {} }: Step1BasicInfoProps) => {
  const [isFocused, setIsFocused] = useState<{ [key: string]: boolean }>({});

  const updateField = (field: keyof Step1FormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleFocus = (field: string) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field: string) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Basic Information
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Let's start with the basics about your veterinary clinic
        </Text>
      </View>

      {/* Logo Upload */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Company Logo
        </Text>
        <Text variant="bodySmall" style={styles.sectionDescription}>
          Upload your clinic's logo (optional)
        </Text>
        <ImageUploader
          value={data.logo_url || null}
          onChange={(uri) => updateField('logo_url', uri)}
          placeholder="Upload Logo"
          aspectRatio={[1, 1]}
        />
        {errors.logo_url && (
          <HelperText type="error" visible={true}>
            {errors.logo_url}
          </HelperText>
        )}
      </View>

      {/* Company Name */}
      <View style={styles.section}>
        <TextInput
          label="Company Name *"
          value={data.name || ''}
          onChangeText={(text) => updateField('name', text)}
          onFocus={() => handleFocus('name')}
          onBlur={() => handleBlur('name')}
          mode="outlined"
          error={!!errors.name}
          maxLength={100}
          placeholder="e.g., Happy Paws Veterinary Clinic"
          style={styles.input}
          outlineColor="#e5e7eb"
          activeOutlineColor="#7c3aed"
          accessibilityLabel="Company Name"
          accessibilityHint="Enter your veterinary clinic's name (3-100 characters)"
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name || ' '}
        </HelperText>
        <HelperText type="info" visible={!errors.name && (isFocused.name || data.name)}>
          {data.name ? `${data.name.length}/100 characters` : '3-100 characters required'}
        </HelperText>
      </View>

      {/* Business Email */}
      <View style={styles.section}>
        <TextInput
          label="Business Email *"
          value={data.email || ''}
          onChangeText={(text) => updateField('email', text)}
          onFocus={() => handleFocus('email')}
          onBlur={() => handleBlur('email')}
          mode="outlined"
          error={!!errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="contact@happypaws.com"
          style={styles.input}
          outlineColor="#e5e7eb"
          activeOutlineColor="#7c3aed"
          accessibilityLabel="Business Email"
          accessibilityHint="Enter your clinic's email address"
        />
        <HelperText type="error" visible={!!errors.email}>
          {errors.email || ' '}
        </HelperText>
      </View>

      {/* Phone Number */}
      <View style={styles.section}>
        <TextInput
          label="Phone Number *"
          value={data.phone || ''}
          onChangeText={(text) => updateField('phone', text)}
          onFocus={() => handleFocus('phone')}
          onBlur={() => handleBlur('phone')}
          mode="outlined"
          error={!!errors.phone}
          keyboardType="phone-pad"
          placeholder="+1 (555) 123-4567"
          style={styles.input}
          outlineColor="#e5e7eb"
          activeOutlineColor="#7c3aed"
          accessibilityLabel="Phone Number"
          accessibilityHint="Enter your clinic's phone number"
        />
        <HelperText type="error" visible={!!errors.phone}>
          {errors.phone || ' '}
        </HelperText>
      </View>

      {/* Short Description */}
      <View style={styles.section}>
        <TextInput
          label="Short Description (Optional)"
          value={data.description || ''}
          onChangeText={(text) => updateField('description', text)}
          onFocus={() => handleFocus('description')}
          onBlur={() => handleBlur('description')}
          mode="outlined"
          error={!!errors.description}
          multiline
          numberOfLines={3}
          maxLength={100}
          placeholder="Brief description of your clinic (max 100 characters)"
          style={[styles.input, styles.textArea]}
          outlineColor="#e5e7eb"
          activeOutlineColor="#7c3aed"
          accessibilityLabel="Short Description"
          accessibilityHint="Optional brief description of your clinic"
        />
        <HelperText type="error" visible={!!errors.description}>
          {errors.description || ' '}
        </HelperText>
        <HelperText type="info" visible={!errors.description && (isFocused.description || data.description)}>
          {data.description ? `${data.description.length}/100 characters` : 'Optional, max 100 characters'}
        </HelperText>
      </View>

      {/* Required Fields Notice */}
      <View style={styles.notice}>
        <Text variant="bodySmall" style={styles.noticeText}>
          * Required fields
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
    marginBottom: 16
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
    minHeight: 80,
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
  }
});
