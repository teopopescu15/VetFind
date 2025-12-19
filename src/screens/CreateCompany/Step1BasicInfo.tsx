import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, HelperText } from 'react-native-paper';
import { ImageUploader } from '../../components/FormComponents/ImageUploader';
import { RomanianPhoneInput } from '../../components/FormComponents/RomanianPhoneInput';
import { ScrollContainer } from '../../components/FormComponents/ScrollContainer';
import { FormSection } from '../../components/FormComponents/FormSection';
import { ContextualHelp } from '../../components/FormComponents/ContextualHelp';
import { Step1FormData } from '../../types/company.types';
import { useTheme } from '../../hooks/useTheme';

export interface Step1BasicInfoProps {
  data: Partial<Step1FormData>;
  onChange: (data: Partial<Step1FormData>) => void;
  errors?: { [key: string]: string };
}

/**
 * Step 1: Basic Info (Phase 3 Redesign - Card-Based Sections)
 * - Company Name (required, 3-100 chars)
 * - Logo Upload (optional, camera + gallery)
 * - Business Email (required, email validation)
 * - Phone Number (required, format validation)
 * - CUI (optional, with contextual help)
 * - Short Description (optional, 100 char limit)
 */
export const Step1BasicInfo = ({ data, onChange, errors = {} }: Step1BasicInfoProps) => {
  const { colors } = useTheme();
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
    <ScrollContainer>
      {/* Header */}
      <View style={[styles.header, { marginBottom: 24 }]}>
        <Text variant="headlineMedium" style={[styles.title, { color: colors.neutral[900] }]}>
          Tell Us About Your Clinic
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.neutral[600] }]}>
          Start with the basics so pet owners can recognize and contact you
        </Text>
      </View>

      {/* Logo Upload Section */}
      <FormSection
        title="Company Logo"
        subtitle="Upload your clinic's logo (optional)"
        icon="business-outline"
      >
        <ImageUploader
          value={data.logo_url || null}
          onChange={(uri) => updateField('logo_url', uri)}
          placeholder="Upload Logo"
          aspectRatio={[1, 1]}
          maxWidth={150}
          maxHeight={150}
          centerAlign={true}
        />
        {errors.logo_url && (
          <HelperText type="error" visible={true}>
            {errors.logo_url}
          </HelperText>
        )}
      </FormSection>

      {/* Basic Information Section */}
      <FormSection
        title="Basic Information"
        subtitle="Company name, email, and phone"
        icon="information-circle-outline"
      >
        {/* Company Name */}
        <View style={styles.inputGroup}>
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
            style={[styles.input, { backgroundColor: colors.neutral[50] }]}
            outlineColor={colors.neutral[300]}
            activeOutlineColor={colors.primary.main}
            accessibilityLabel="Company Name"
            accessibilityHint="Enter your veterinary clinic's name (3-100 characters)"
          />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name || ' '}
          </HelperText>
          <HelperText type="info" visible={!errors.name && (isFocused.name || !!data.name)}>
            {data.name ? `${data.name.length}/100 characters` : '3-100 characters required'}
          </HelperText>
        </View>

        {/* Business Email */}
        <View style={styles.inputGroup}>
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
            style={[styles.input, { backgroundColor: colors.neutral[50] }]}
            outlineColor={colors.neutral[300]}
            activeOutlineColor={colors.primary.main}
            accessibilityLabel="Business Email"
            accessibilityHint="Enter your clinic's email address"
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email || ' '}
          </HelperText>
        </View>

        {/* Phone Number */}
        <View style={styles.inputGroup}>
          <RomanianPhoneInput
            value={data.phone || ''}
            onChange={(phone) => updateField('phone', phone)}
            error={errors.phone}
            disabled={false}
          />
        </View>
      </FormSection>

      {/* Tax Information Section */}
      <FormSection
        title="Tax Information"
        subtitle="Romanian company identification (optional)"
        icon="document-text-outline"
      >
        {/* CUI with Contextual Help */}
        <View style={styles.inputGroup}>
          <View style={styles.inputWithHelp}>
            <View style={{ flex: 1 }}>
              <TextInput
                label="CUI (Cod Unic de Înregistrare)"
                value={data.cui || ''}
                onChangeText={(text) => updateField('cui', text)}
                onFocus={() => handleFocus('cui')}
                onBlur={() => handleBlur('cui')}
                mode="outlined"
                error={!!errors.cui}
                placeholder="RO12345678 sau 12345678"
                style={[styles.input, { backgroundColor: colors.neutral[50] }]}
                outlineColor={colors.neutral[300]}
                activeOutlineColor={colors.primary.main}
                accessibilityLabel="CUI"
                accessibilityHint="Optional - Romanian Tax ID (can be added later)"
              />
            </View>
            <ContextualHelp
              title="CUI Format"
              content="Enter your company's unique identifier (CUI). This can be with or without the 'RO' prefix."
              examples={['RO12345678', '12345678']}
            />
          </View>
          <HelperText type="error" visible={!!errors.cui}>
            {errors.cui || ' '}
          </HelperText>
          <HelperText type="info" visible={!errors.cui}>
            Optional - poate fi adăugat mai târziu
          </HelperText>
        </View>
      </FormSection>

      {/* Additional Information Section */}
      <FormSection
        title="Additional Information"
        subtitle="Brief description of your clinic (optional)"
        icon="text-outline"
      >
        {/* Short Description */}
        <View style={styles.inputGroup}>
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
            style={[styles.input, styles.textArea, { backgroundColor: colors.neutral[50] }]}
            outlineColor={colors.neutral[300]}
            activeOutlineColor={colors.primary.main}
            accessibilityLabel="Short Description"
            accessibilityHint="Optional brief description of your clinic"
          />
          <HelperText type="error" visible={!!errors.description}>
            {errors.description || ' '}
          </HelperText>
          <HelperText type="info" visible={!errors.description && (isFocused.description || !!data.description)}>
            {data.description ? `${data.description.length}/100 characters` : 'Optional, max 100 characters'}
          </HelperText>
        </View>
      </FormSection>

      {/* Required Fields Notice */}
      <View style={[styles.notice, { backgroundColor: colors.primary[50], borderLeftColor: colors.primary.main }]}>
        <Text variant="bodySmall" style={[styles.noticeText, { color: colors.neutral[700] }]}>
          * Required fields
        </Text>
      </View>
    </ScrollContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    // Removed hardcoded marginBottom, now inline
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputWithHelp: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  input: {
    // Background color now dynamic via theme
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  notice: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  noticeText: {
    fontStyle: 'italic',
  },
});
