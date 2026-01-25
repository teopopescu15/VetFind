import React, { useState } from 'react';
import { View, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../services/api';
import { deleteByDownloadUrl, uploadCompanyPhotoFromUri } from '../../services/firebaseStorage';

// ===========================
// TYPE DEFINITIONS
// ===========================

interface Photo {
  uri: string;          // Local URI or server URL
  uploaded: boolean;    // Upload status
  uploading: boolean;   // Upload in progress
  serverUrl?: string;   // Server URL after successful upload
}

interface MultipleImageUploaderProps {
  companyId?: number;                           // Company ID for auto-upload
  existingPhotos?: string[];                    // Existing photos from server
  maxPhotos?: number;                           // Maximum photos allowed (default: 10)
  onPhotosChange?: (photos: string[]) => void;  // Callback when photos change
  disabled?: boolean;                           // Disable all interactions
}

// ===========================
// COMPONENT
// ===========================

export const MultipleImageUploader = ({
  companyId,
  existingPhotos = [],
  maxPhotos = 10,
  onPhotosChange,
  disabled = false,
}: MultipleImageUploaderProps) => {

  const getPhotoSrc = (uri: string) => {
    const u = String(uri || '');
    // local files / data URIs / absolute URLs
    if (u.startsWith('file:') || u.startsWith('data:') || u.startsWith('http')) return u;
    // backend returns relative paths like /uploads/...
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
    return `${apiUrl}${u}`;
  };

  // Initialize state with existing photos
  const [photos, setPhotos] = useState<Photo[]>(
    existingPhotos.map(url => ({
      uri: url,
      uploaded: true,
      uploading: false,
      serverUrl: url,
    }))
  );

  // ===========================
  // PERMISSION HANDLING
  // ===========================

  const requestPermissions = async (type: 'camera' | 'library'): Promise<boolean> => {
    try {
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Camera access is required to take photos. Please enable it in settings.',
            [{ text: 'OK' }]
          );
          return false;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Gallery access is required to select photos. Please enable it in settings.',
            [{ text: 'OK' }]
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  // ===========================
  // PHOTO SELECTION
  // ===========================

  const addPhoto = async (source: 'camera' | 'gallery') => {
    // Check photo limit
    if (disabled || photos.length >= maxPhotos) {
      Alert.alert('Limit Reached', `Maximum ${maxPhotos} photos allowed`);
      return;
    }

    // Request permissions
    const hasPermission = await requestPermissions(source === 'camera' ? 'camera' : 'library');
    if (!hasPermission) return;

    try {
      let result;

      if (source === 'camera') {
        // Launch camera
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        // Launch gallery (supports multiple selection on iOS 14+)
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets) {
        // Limit to remaining slots
        const remainingSlots = maxPhotos - photos.length;
        const selectedPhotos = result.assets.slice(0, remainingSlots);

        const newPhotos: Photo[] = selectedPhotos.map(asset => ({
          uri: asset.uri,
          uploaded: false,
          uploading: false,
        }));

        setPhotos(prev => [...prev, ...newPhotos]);

        // Auto-upload if companyId provided
        if (companyId) {
          for (const photo of newPhotos) {
            await uploadPhoto(photo);
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  // ===========================
  // PHOTO UPLOAD
  // ===========================

  const uploadPhoto = async (photo: Photo) => {
    // Mark as uploading
    setPhotos(prev =>
      prev.map(p => (p.uri === photo.uri ? { ...p, uploading: true } : p))
    );

    try {
      // 1) Upload to Firebase Storage
      const downloadUrl = await uploadCompanyPhotoFromUri(companyId!, photo.uri);
      // 2) Persist URL in backend (append to company.photos)
      const response = await ApiService.request(`/companies/${companyId}/photos`, {
        method: 'POST',
        body: JSON.stringify({ photo_url: downloadUrl }),
      });

      if (response.success) {
        // Mark as uploaded
        setPhotos(prev =>
          prev.map(p =>
            p.uri === photo.uri
              ? {
                  ...p,
                  uploaded: true,
                  uploading: false,
                  serverUrl: response.data.photo_url,
                  uri: response.data.photo_url, // Update to server URL
                }
              : p
          )
        );

        // Notify parent component
        if (onPhotosChange) {
          onPhotosChange(response.data.company.photos);
        }
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);

      // Mark as not uploading (failed)
      setPhotos(prev =>
        prev.map(p => (p.uri === photo.uri ? { ...p, uploading: false } : p))
      );

      Alert.alert(
        'Upload Failed',
        error.message || 'Failed to upload photo. Please try again.',
        [
          { text: 'Retry', onPress: () => uploadPhoto(photo) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  // ===========================
  // PHOTO REMOVAL
  // ===========================

  const removePhoto = async (photo: Photo) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            // If uploaded to server, delete from server
            if (photo.uploaded && photo.serverUrl && companyId) {
              try {
                await ApiService.deleteCompanyPhoto(companyId, photo.serverUrl);
                // Best-effort delete from Firebase if it's a Firebase URL
                try { await deleteByDownloadUrl(photo.serverUrl); } catch {}
              } catch (error) {
                console.error('Delete error:', error);
                Alert.alert('Error', 'Failed to delete photo from server');
                return;
              }
            }

            // Remove from local state
            setPhotos(prev => prev.filter(p => p.uri !== photo.uri));

            // Notify parent
            if (onPhotosChange && photo.uploaded) {
              const updatedPhotos = photos
                .filter(p => p.uri !== photo.uri && p.uploaded)
                .map(p => p.serverUrl!);
              onPhotosChange(updatedPhotos);
            }
          },
        },
      ]
    );
  };

  // ===========================
  // PICKER OPTIONS DIALOG
  // ===========================

  const showPickerOptions = () => {
    if (disabled) return;

    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => addPhoto('camera') },
        { text: 'Choose from Gallery', onPress: () => addPhoto('gallery') },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // ===========================
  // RENDER
  // ===========================

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Existing photos */}
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image
              source={{ uri: getPhotoSrc(photo.uri) }}
              style={styles.photo}
              resizeMode="cover"
            />

            {/* Upload progress overlay */}
            {photo.uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}

            {/* Upload success badge */}
            {photo.uploaded && !photo.uploading && (
              <View style={styles.uploadedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              </View>
            )}

            {/* Remove button */}
            {!disabled && !photo.uploading && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePhoto(photo)}
                accessibilityLabel="Remove photo"
                accessibilityRole="button"
              >
                <Ionicons name="close-circle" size={28} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Add photo button */}
        {photos.length < maxPhotos && !disabled && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={showPickerOptions}
            accessibilityLabel="Add photo"
            accessibilityRole="button"
          >
            <Ionicons name="camera-outline" size={40} color="#666" />
            <Text style={styles.addText}>Add Photo</Text>
            <Text style={styles.countText}>
              {photos.length}/{maxPhotos}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Info text */}
      <Text style={styles.infoText}>
        {photos.length === 0 && 'Add photos of your clinic, staff, and facilities'}
        {photos.length > 0 && photos.length < maxPhotos && `${photos.length} of ${maxPhotos} photos added`}
        {photos.length === maxPhotos && `Maximum ${maxPhotos} photos reached`}
      </Text>
    </View>
  );
};

// ===========================
// STYLES
// ===========================

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scrollView: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingRight: 12,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  uploadingText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 12,
  },
  uploadedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 14,
  },
  addButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  countText: {
    marginTop: 2,
    fontSize: 12,
    color: '#999',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});
