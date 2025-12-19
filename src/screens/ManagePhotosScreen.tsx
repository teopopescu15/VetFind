import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MultipleImageUploader } from '../components/FormComponents/MultipleImageUploader';
import { WebPhotoUploader } from '../components/WebPhotoUploader';
import { ApiService } from '../services/api';
import { Company } from '../types/company.types';
import { theme } from '../theme';

export const ManagePhotosScreen = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      setIsLoading(true);
      const fetchedCompany = await ApiService.getMyCompany();
      setCompany(fetchedCompany);
    } catch (error) {
      console.error('Error loading company:', error);
      Alert.alert('Error', 'Failed to load company data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotosChange = (photos: string[]) => {
    // Update local state
    if (company) {
      setCompany({ ...company, photos });
    }
  };

  const handleWebUploadSuccess = (photoUrl: string) => {
    // Update local state when web upload succeeds
    if (company) {
      setCompany({ ...company, photos: [...(company.photos || []), photoUrl] });
    }
  };

  const handleWebDeleteSuccess = (photoUrl: string) => {
    // Update local state when web delete succeeds
    if (company) {
      setCompany({
        ...company,
        photos: (company.photos || []).filter(url => url !== photoUrl)
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>Loading photos...</Text>
      </View>
    );
  }

  if (!company) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Company not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Manage Company Photos
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Add photos of your clinic, staff, and facilities to attract more clients
        </Text>
      </View>

      {/* Platform-specific photo uploader */}
      {Platform.OS === 'web' ? (
        <WebPhotoUploader
          companyId={company.id}
          existingPhotos={company.photos || []}
          maxPhotos={10}
          onUploadSuccess={handleWebUploadSuccess}
          onDeleteSuccess={handleWebDeleteSuccess}
        />
      ) : (
        <MultipleImageUploader
          companyId={company.id}
          existingPhotos={company.photos || []}
          maxPhotos={10}
          onPhotosChange={handlePhotosChange}
        />
      )}

      <View style={styles.tips}>
        <Text variant="titleMedium" style={styles.tipsTitle}>
          Photo Tips
        </Text>
        <Text variant="bodyMedium" style={styles.tipText}>
          • Use high-quality, well-lit photos
        </Text>
        <Text variant="bodyMedium" style={styles.tipText}>
          • Show your clinic's exterior and interior
        </Text>
        <Text variant="bodyMedium" style={styles.tipText}>
          • Include photos of your staff and equipment
        </Text>
        <Text variant="bodyMedium" style={styles.tipText}>
          • Avoid blurry or dark images
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[50],
  },
  loadingText: {
    marginTop: 12,
    color: theme.colors.neutral[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: theme.colors.error.main,
    textAlign: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
    color: theme.colors.neutral[900],
  },
  subtitle: {
    color: theme.colors.neutral[600],
    lineHeight: 20,
  },
  tips: {
    marginTop: 32,
    padding: 16,
    backgroundColor: theme.colors.primary[50],
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary.main,
  },
  tipsTitle: {
    fontWeight: '700',
    marginBottom: 12,
    color: theme.colors.neutral[900],
  },
  tipText: {
    color: theme.colors.neutral[700],
    marginBottom: 4,
  },
});
