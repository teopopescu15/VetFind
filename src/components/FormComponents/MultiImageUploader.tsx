import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

/**
 * MultiImageUploader Component
 * Multiple image upload component with camera and gallery support (4-10 photos)
 * Follows object-literal pattern (no classes)
 */

interface MultiImageUploaderProps {
  value: string[];
  onChange: (uris: string[]) => void;
  minPhotos?: number; // Default 0 (optional photos)
  maxPhotos?: number; // Default 10
  disabled?: boolean;
  required?: boolean; // Whether photos are required
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_SIZE = (SCREEN_WIDTH - 64) / 4; // 4 columns with padding (~75px)

export const MultiImageUploader = ({
  value,
  onChange,
  minPhotos = 0,
  maxPhotos = 10,
  disabled = false,
  required = false,
}: MultiImageUploaderProps) => {
  const [loading, setLoading] = useState(false);

  // Request permissions
  const requestPermissions = async (type: 'camera' | 'library'): Promise<boolean> => {
    try {
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permisiune necesară',
            'Accesul la cameră este necesar pentru a face fotografii.',
            [{ text: 'OK' }]
          );
          return false;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permisiune necesară',
            'Accesul la galerie este necesar pentru a selecta fotografii.',
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
    if (disabled || value.length >= maxPhotos) return;

    // Web fallback using HTML5 File API with camera capture
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use rear camera on mobile web, webcam on desktop
      input.multiple = true; // Allow multiple photos
      input.onchange = (e: any) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const remainingSlots = maxPhotos - value.length;
        const filesToProcess = Math.min(files.length, remainingSlots);
        const newUris: string[] = [];

        let processed = 0;
        for (let i = 0; i < filesToProcess; i++) {
          const file = files[i];
          const reader = new FileReader();
          reader.onload = (event: any) => {
            newUris.push(event.target.result);
            processed++;
            if (processed === filesToProcess) {
              onChange([...value, ...newUris]);
              if (files.length > remainingSlots) {
                alert(`Maxim ${maxPhotos} fotografii permise. ${files.length - remainingSlots} fotografie/fotografii vor fi omise.`);
              }
            }
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
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onChange([...value, result.assets[0].uri]);
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
    if (disabled || value.length >= maxPhotos) return;

    const hasPermission = await requestPermissions('library');
    if (!hasPermission) return;

    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: maxPhotos - value.length,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newUris = result.assets.map((asset) => asset.uri);
        const totalPhotos = value.length + newUris.length;

        if (totalPhotos > maxPhotos) {
          Alert.alert(
            'Prea multe fotografii',
            `Poți încărca maxim ${maxPhotos} fotografii. ${totalPhotos - maxPhotos} fotografie/fotografii vor fi omise.`
          );
          onChange([...value, ...newUris.slice(0, maxPhotos - value.length)]);
        } else {
          onChange([...value, ...newUris]);
        }
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Eroare', 'Imaginile nu au putut fi selectate. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  // Show picker options
  const showPickerOptions = () => {
    if (disabled || value.length >= maxPhotos) {
      if (value.length >= maxPhotos) {
        // On web, use browser alert
        if (Platform.OS === 'web') {
          alert(`Poți încărca maxim ${maxPhotos} fotografii.`);
        } else {
          Alert.alert('Maxim de fotografii', `Poți încărca maxim ${maxPhotos} fotografii.`);
        }
      }
      return;
    }

    // On web, directly open file picker (Alert.alert doesn't work on web)
    if (Platform.OS === 'web') {
      pickFromGallery();
      return;
    }

    // On mobile, show options dialog
    Alert.alert(
      'Adaugă fotografie',
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
  const removeImage = (index: number) => {
    if (disabled) return;

    // On web, use browser confirm dialog
    if (Platform.OS === 'web') {
      if (window.confirm('Ești sigur că vrei să ștergi această fotografie?')) {
        const newPhotos = value.filter((_, i) => i !== index);
        onChange(newPhotos);
      }
      return;
    }

    // On mobile, use Alert.alert
    Alert.alert(
      'Șterge fotografia',
      'Ești sigur că vrei să ștergi această fotografie?',
      [
        {
          text: 'Anulează',
          style: 'cancel',
        },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: () => {
            const newPhotos = value.filter((_, i) => i !== index);
            onChange(newPhotos);
          },
        },
      ]
    );
  };

  // Render photo item
  const renderPhotoItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.photoItem}>
      <Image source={{ uri: item }} style={styles.photo} resizeMode="cover" />
      {!disabled && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeImage(index)}
          accessibilityLabel={`Elimină fotografia ${index + 1}`}
          accessibilityRole="button"
        >
          <Ionicons name="close-circle" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );

  // Render add button
  const renderAddButton = () => {
    if (value.length >= maxPhotos) return null;

    return (
      <TouchableOpacity
        style={[styles.addButton, disabled && styles.addButtonDisabled]}
        onPress={showPickerOptions}
        disabled={disabled || loading}
        accessibilityLabel="Add photo"
        accessibilityRole="button"
      >
        <Ionicons
          name="camera-outline"
          size={32}
          color={disabled ? '#999' : '#666'}
        />
        <Text style={[styles.addButtonText, disabled && styles.addButtonTextDisabled]}>
          {loading ? 'Se încarcă...' : 'Adaugă fotografie'}
        </Text>
      </TouchableOpacity>
    );
  };

  const photoCount = value.length;
  const isValid = photoCount >= minPhotos && photoCount <= maxPhotos;
  const statusColor = photoCount < minPhotos ? '#e74c3c' : isValid ? '#27ae60' : '#666';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fotografii clinică</Text>
        <Text style={[styles.counter, { color: statusColor }]}>
          {photoCount}/{maxPhotos} fotografii
        </Text>
      </View>

      {minPhotos > 0 && photoCount < minPhotos && (
        <Text style={styles.requirementText}>
          Minim {minPhotos} fotografii necesare
        </Text>
      )}

      <FlatList
        data={value}
        renderItem={renderPhotoItem}
        keyExtractor={(item, index) => `photo-${index}`}
        numColumns={4}
        columnWrapperStyle={styles.row}
        ListFooterComponent={renderAddButton}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nicio fotografie adăugată încă</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={showPickerOptions}
              disabled={disabled || loading}
            >
              <Text style={styles.emptyButtonText}>
                {loading ? 'Se încarcă...' : 'Adaugă prima fotografie'}
              </Text>
            </TouchableOpacity>
          </View>
        }
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  counter: {
    fontSize: 14,
    fontWeight: '500',
  },
  requirementText: {
    fontSize: 12,
    color: '#e74c3c',
    marginBottom: 12,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  photoItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  addButton: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  addButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  addButtonTextDisabled: {
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
