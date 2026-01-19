import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

/**
 * ImageUploader Component
 * Single image upload component with camera and gallery support
 * Follows object-literal pattern (no classes)
 */

interface ImageUploaderProps {
  value: string | null;
  onChange: (uri: string | null) => void;
  placeholder?: string;
  aspectRatio?: [number, number];
  disabled?: boolean;
  maxWidth?: number; // Maximum width in pixels
  maxHeight?: number; // Maximum height in pixels
  centerAlign?: boolean; // Center the uploader
}

export const ImageUploader = ({
  value,
  onChange,
  placeholder = 'Încarcă imagine',
  aspectRatio = [4, 3],
  disabled = false,
  maxWidth,
  maxHeight,
  centerAlign = false,
}: ImageUploaderProps) => {
  const [loading, setLoading] = useState(false);

  // Request permissions
  const requestPermissions = async (type: 'camera' | 'library'): Promise<boolean> => {
    try {
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permisiune necesară',
            'Accesul la cameră este necesar pentru a face fotografii. Activează-l în setări.',
            [{ text: 'OK' }]
          );
          return false;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permisiune necesară',
            'Accesul la galerie este necesar pentru a selecta fotografii. Activează-l în setări.',
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

  // Pick image from camera
  const pickFromCamera = async () => {
    if (disabled) return;

    // Web fallback using HTML5 File API with camera capture
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use rear camera on mobile web, webcam on desktop
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            onChange(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    // Mobile implementation
    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) return;

    try {
      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Eroare', 'Fotografia nu a putut fi făcută. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  // Pick image from gallery
  const pickFromGallery = async () => {
    if (disabled) return;

    // Web fallback using HTML5 File API
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            onChange(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    // Mobile implementation
    const hasPermission = await requestPermissions('library');
    if (!hasPermission) return;

    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Eroare', 'Imaginea nu a putut fi selectată. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  // Show picker options
  const showPickerOptions = () => {
    if (disabled) return;

    // On web, directly open file picker (Alert.alert doesn't work on web)
    if (Platform.OS === 'web') {
      pickFromGallery();
      return;
    }

    // On mobile, show options dialog
    Alert.alert(
      'Selectează imagine',
      'Alege o opțiune',
      [
        {
          text: 'Fă fotografie',
          onPress: pickFromCamera,
        },
        {
          text: 'Alege din galerie',
          onPress: pickFromGallery,
        },
        {
          text: 'Anulează',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  // Remove image
  const removeImage = () => {
    if (disabled) return;

    // On web, use browser confirm dialog
    if (Platform.OS === 'web') {
      if (window.confirm('Ești sigur că vrei să ștergi această imagine?')) {
        onChange(null);
      }
      return;
    }

    // On mobile, use Alert.alert
    Alert.alert(
      'Șterge imaginea',
      'Ești sigur că vrei să ștergi această imagine?',
      [
        {
          text: 'Anulează',
          style: 'cancel',
        },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: () => onChange(null),
        },
      ]
    );
  };

  // Calculate container styles based on props
  const containerStyles = [
    styles.container,
    centerAlign && styles.containerCenter,
    maxWidth && { maxWidth },
  ];

  const uploaderStyles = [
    maxWidth && { width: maxWidth },
    maxHeight && { height: maxHeight },
  ];

  return (
    <View style={containerStyles}>
      {value ? (
        <View style={[styles.imageContainer, ...uploaderStyles]}>
          <Image source={{ uri: value }} style={styles.image} resizeMode="cover" />
          {!disabled && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={removeImage}
              accessibilityLabel="Remove image"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={32} color="#fff" />
            </TouchableOpacity>
          )}
          {!disabled && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={showPickerOptions}
              accessibilityLabel="Change image"
              accessibilityRole="button"
            >
              <Ionicons name="camera" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadButton, disabled && styles.uploadButtonDisabled, ...uploaderStyles]}
          onPress={showPickerOptions}
          disabled={disabled || loading}
          accessibilityLabel={placeholder}
          accessibilityRole="button"
        >
          <Ionicons
            name="camera-outline"
            size={48}
            color={disabled ? '#999' : '#666'}
          />
          <Text style={[styles.uploadText, disabled && styles.uploadTextDisabled]}>
            {loading ? 'Se încarcă...' : placeholder}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  containerCenter: {
    alignItems: 'center',
    alignSelf: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
  },
  editButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  uploadTextDisabled: {
    color: '#999',
  },
});
