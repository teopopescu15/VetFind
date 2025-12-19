# Photo Upload Feature - Implementation Guide

## 📋 Overview

Complete implementation plan for adding photo upload functionality to VetFinder, enabling vet companies to upload photos from:
- **Mobile**: Camera + Gallery with Expo Image Picker
- **Web**: File input with drag-and-drop support
- **Dashboard**: Photo management interface for existing companies
- **Onboarding**: Photo upload during company creation (Step 1)

---

## ✅ Current Implementation Status

### Database (PostgreSQL)
- ✅ `photos` field exists as JSONB array in companies table
- ✅ Supports up to 10 photos per company
- ✅ Schema already configured

### Backend API
- ✅ `POST /api/companies/:id/photos` exists (company.controller.ts:435)
- ✅ `DELETE /api/companies/:id/photos` exists (company.controller.ts:516)
- ⚠️ **Currently only accepts pre-uploaded URLs, no actual file upload**

### Frontend Mobile
- ✅ `ImageUploader` component for single images (logo) exists
- ✅ Expo Image Picker integration (camera + gallery)
- ❌ **No multi-photo support**
- ❌ **No server upload functionality**

### Frontend Web
- ❌ **No file upload interface implemented**

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      MOBILE & WEB CLIENT                        │
│  📱 Camera/Gallery Picker → Local Preview → Upload to Backend  │
└────────────────────────────┬────────────────────────────────────┘
                             │ FormData multipart/form-data
                             │ POST /api/companies/:id/photos
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express + Node.js)                  │
│  1. Multer Middleware: Handle file upload                      │
│  2. Sharp Processing: Resize (1200x1200) + Compress (85%)      │
│  3. File Storage: /uploads/companies/{companyId}/photo_xxx.jpg │
│  4. Database Update: Add URL to companies.photos array         │
└────────────────────────────┬────────────────────────────────────┘
                             │ Return { photo_url: "/uploads/..." }
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                         │
│  companies.photos: [                                            │
│    "/uploads/companies/1/photo_1735654321.jpg",                │
│    "/uploads/companies/1/photo_1735654322.jpg"                 │
│  ]                                                              │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STATIC FILE SERVING                        │
│  Express Static Middleware serves /uploads directory           │
│  Access: http://localhost:5000/uploads/companies/1/photo.jpg   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Implementation Roadmap

### **Phase 1: Backend File Upload System**

#### Step 1.1: Install Dependencies

```bash
cd backend
npm install multer @types/multer sharp @types/sharp
```

**Package Details:**
- `multer`: Express middleware for handling multipart/form-data file uploads
- `@types/multer`: TypeScript type definitions for multer
- `sharp`: High-performance image processing library (resize, compress, optimize)
- `@types/sharp`: TypeScript type definitions for sharp

#### Step 1.2: Create Upload Middleware

**File:** `backend/src/middleware/upload.ts` (NEW FILE)

```typescript
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// ===========================
// MULTER STORAGE CONFIGURATION
// ===========================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const companyId = req.params.id;
    const uploadDir = path.join(__dirname, '../../uploads/companies', companyId);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `photo_${timestamp}${ext}`);
  }
});

// ===========================
// FILE TYPE VALIDATION
// ===========================

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(ext);

  if (mimetype && extname) {
    return cb(null, true);
  }

  cb(new Error('Only image files are allowed (JPEG, PNG, WebP)'));
};

// ===========================
// MULTER CONFIGURATION
// ===========================

export const uploadPhoto = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum file size
  },
  fileFilter,
});

// ===========================
// IMAGE OPTIMIZATION MIDDLEWARE (Sharp)
// ===========================

export const optimizeImage = async (req: any, res: any, next: any) => {
  if (!req.file) return next();

  try {
    const filePath = req.file.path;
    const optimizedPath = filePath.replace(
      path.extname(filePath),
      '_optimized' + path.extname(filePath)
    );

    // Resize and compress image
    // - Max dimensions: 1200x1200 (maintains aspect ratio)
    // - JPEG quality: 85% (good balance of quality/size)
    // - Progressive: Better loading experience
    await sharp(filePath)
      .resize(1200, 1200, {
        fit: 'inside',           // Maintain aspect ratio
        withoutEnlargement: true // Don't upscale small images
      })
      .jpeg({
        quality: 85,      // 85% quality
        progressive: true // Progressive JPEG
      })
      .toFile(optimizedPath);

    // Replace original with optimized
    fs.unlinkSync(filePath);
    fs.renameSync(optimizedPath, filePath);

    next();
  } catch (error) {
    next(error);
  }
};
```

**Key Features:**
- **Dynamic Directories**: Creates `/uploads/companies/{companyId}/` per company
- **Unique Filenames**: Uses timestamp to prevent conflicts (`photo_1735654321.jpg`)
- **File Validation**: Only accepts JPEG, PNG, WebP images
- **Size Limit**: 10MB maximum (before compression)
- **Auto-Optimization**: Resizes to 1200x1200 max, compresses to ~85% quality

#### Step 1.3: Update Company Controller

**File:** `backend/src/controllers/company.controller.ts` (UPDATE)

**Update the `uploadPhoto` method (line 435):**

```typescript
/**
 * Upload company photo
 * POST /api/companies/:id/photos
 * Requires: authentication, ownership check, multer middleware
 *
 * CHANGES:
 * - OLD: Accepts { photo_url } in JSON body
 * - NEW: Accepts multipart/form-data with 'photo' field
 */
async uploadPhoto(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const companyId = parseInt(req.params.id);

    // ===========================
    // AUTHENTICATION CHECK
    // ===========================
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated',
      });
      return;
    }

    if (isNaN(companyId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid company ID',
      });
      return;
    }

    // ===========================
    // OWNERSHIP CHECK
    // ===========================
    const company = await CompanyModel.findById(companyId);
    if (!company) {
      res.status(404).json({
        success: false,
        message: 'Company not found',
      });
      return;
    }

    if (company.user_id !== userId) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this company',
      });
      return;
    }

    // ===========================
    // FILE UPLOAD VALIDATION
    // ===========================

    // NEW: Check if file was uploaded by multer middleware
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a photo.',
      });
      return;
    }

    // Check maximum photo limit (10)
    if (company.photos.length >= 10) {
      // Delete the uploaded file since we're rejecting it
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(400).json({
        success: false,
        message: 'Maximum 10 photos allowed',
      });
      return;
    }

    // ===========================
    // GENERATE PHOTO URL
    // ===========================

    // Generate relative URL from backend root
    // Format: /uploads/companies/{companyId}/photo_{timestamp}.jpg
    const photoUrl = `/uploads/companies/${companyId}/${req.file.filename}`;

    console.log('Photo uploaded:', {
      originalName: req.file.originalname,
      savedAs: req.file.filename,
      size: req.file.size,
      path: req.file.path,
      url: photoUrl,
    });

    // ===========================
    // UPDATE DATABASE
    // ===========================

    // Add photo to photos array
    const updatedPhotos = [...company.photos, photoUrl];

    const updatedCompany = await CompanyModel.update(companyId, {
      photos: updatedPhotos,
    });

    // ===========================
    // SUCCESS RESPONSE
    // ===========================

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photo_url: photoUrl,
        photo_count: updatedPhotos.length,
        company: updatedCompany,
      },
    });
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    next(error);
  }
}
```

**Changes Summary:**
- ✅ Removed `photo_url` from request body validation
- ✅ Added `req.file` validation (populated by multer)
- ✅ Added file cleanup on rejection (if photo limit exceeded)
- ✅ Generate photo URL from uploaded file path
- ✅ Enhanced logging for debugging

#### Step 1.4: Update Routes

**File:** `backend/src/routes/company.routes.ts` (UPDATE)

**Update photo upload route (line 25):**

```typescript
import { Router } from 'express';
import { createCompanyController } from '../controllers/company.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { uploadPhoto, optimizeImage } from '../middleware/upload'; // NEW IMPORT

const router = Router();
const companyController = createCompanyController();

// ... existing routes ...

// ===========================
// PHOTO MANAGEMENT ROUTES
// ===========================

// Upload photo (NEW: with multer and sharp middleware)
router.post(
  '/:id/photos',
  authMiddleware,                // 1. Authenticate user
  uploadPhoto.single('photo'),   // 2. Handle file upload (field name: 'photo')
  optimizeImage,                 // 3. Optimize image with Sharp
  companyController.uploadPhoto  // 4. Save to database
);

// Delete photo (unchanged)
router.delete(
  '/:id/photos',
  authMiddleware,
  companyController.deletePhoto
);

export default router;
```

**Middleware Chain:**
1. `authMiddleware`: Validates JWT token, populates `req.user`
2. `uploadPhoto.single('photo')`: Multer handles file upload, populates `req.file`
3. `optimizeImage`: Sharp processes image (resize + compress)
4. `companyController.uploadPhoto`: Updates database with photo URL

#### Step 1.5: Serve Static Files

**File:** `backend/src/server.ts` (UPDATE)

**Add static file serving middleware:**

```typescript
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

const app = express();

// ===========================
// MIDDLEWARE
// ===========================

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===========================
// STATIC FILE SERVING (NEW)
// ===========================

// Serve uploads directory for photo access
// Example: http://localhost:5000/uploads/companies/1/photo_1735654321.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===========================
// ROUTES
// ===========================

// ... existing routes ...

export default app;
```

**What This Does:**
- Serves files from `/uploads` directory as static files
- Accessible via: `http://localhost:5000/uploads/companies/{companyId}/{filename}`
- No authentication required for static files (public access)

---

### **Phase 2: Mobile Frontend Implementation**

#### Step 2.1: Create MultipleImageUploader Component

**File:** `src/components/FormComponents/MultipleImageUploader.tsx` (NEW FILE)

```typescript
import React, { useState } from 'react';
import { View, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { Text, IconButton, ProgressBar, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../services/api';

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
      // Create FormData
      const formData = new FormData();

      // Platform-specific file handling
      const fileUri = Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri;
      const filename = fileUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('photo', {
        uri: fileUri,
        type,
        name: filename,
      } as any);

      // Upload to backend
      const response = await ApiService.uploadCompanyPhoto(companyId!, formData);

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
              source={{ uri: photo.uri }}
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
```

#### Step 2.2: Update ApiService

**File:** `src/services/api.ts` (UPDATE)

**Add photo upload methods:**

```typescript
// Add to ApiService object

/**
 * Upload company photo
 * POST /api/companies/:id/photos
 */
uploadCompanyPhoto: async (companyId: number, formData: FormData) => {
  try {
    const token = await AsyncStorage.getItem('token');

    const response = await fetch(`${API_URL}/api/companies/${companyId}/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - let browser set it with boundary
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Upload photo error:', error);
    throw error;
  }
},

/**
 * Delete company photo
 * DELETE /api/companies/:id/photos
 */
deleteCompanyPhoto: async (companyId: number, photoUrl: string) => {
  try {
    const token = await AsyncStorage.getItem('token');

    const response = await fetch(`${API_URL}/api/companies/${companyId}/photos`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photo_url: photoUrl }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete photo error:', error);
    throw error;
  }
},
```

#### Step 2.3: Update Step1BasicInfo (Company Creation)

**File:** `src/screens/CreateCompany/Step1BasicInfo.tsx` (UPDATE)

**Add after the logo upload section (around line 76):**

```typescript
import { MultipleImageUploader } from '../../components/FormComponents/MultipleImageUploader';

// Inside the component render, after Logo Upload Section:

{/* Company Photos Section */}
<FormSection
  title="Company Photos"
  subtitle="Add photos of your clinic (optional, up to 10)"
  icon="images-outline"
>
  <MultipleImageUploader
    existingPhotos={data.photos || []}
    maxPhotos={10}
    onPhotosChange={(photos) => updateField('photos', photos)}
    disabled={false}
  />
  <HelperText type="info" visible={true}>
    Photos help pet owners recognize your clinic and see your facilities
  </HelperText>
</FormSection>
```

**Note:** Since there's no `companyId` yet during creation, photos will be stored locally and uploaded after company creation or handled differently.

#### Step 2.4: Update CompanyDashboardScreen

**File:** `src/screens/CompanyDashboardScreen.tsx` (UPDATE)

**Update Quick Actions (line 230):**

```typescript
<QuickActions
  onNewAppointment={() => Alert.alert('Coming Soon', 'New appointment booking')}
  onManageServices={() => navigation.navigate('ManageServices')}
  onUpdatePrices={() => navigation.navigate('ManagePrices')}
  onAddPhotos={() => navigation.navigate('ManagePhotos')} // NEW
/>
```

#### Step 2.5: Create ManagePhotosScreen

**File:** `src/screens/ManagePhotosScreen.tsx` (NEW FILE)

```typescript
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MultipleImageUploader } from '../components/FormComponents/MultipleImageUploader';
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

      <MultipleImageUploader
        companyId={company.id}
        existingPhotos={company.photos || []}
        maxPhotos={10}
        onPhotosChange={handlePhotosChange}
      />

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
```

#### Step 2.6: Update Navigation

**File:** `src/types/navigation.types.ts` (UPDATE)

```typescript
export type RootStackParamList = {
  // ... existing routes ...
  ManagePhotos: undefined; // NEW
};
```

**File:** `src/navigation/AppNavigator.tsx` (UPDATE)

```typescript
import { ManagePhotosScreen } from '../screens/ManagePhotosScreen';

// Inside Stack.Navigator:
<Stack.Screen
  name="ManagePhotos"
  component={ManagePhotosScreen}
  options={{ title: 'Manage Photos' }}
/>
```

---

### **Phase 3: Web Frontend Implementation**

#### Step 3.1: Create WebPhotoUploader Component

**File:** `src/components/WebPhotoUploader.tsx` (NEW FILE)

```typescript
import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Button, ProgressBar, IconButton } from 'react-native-paper';
import { ApiService } from '../services/api';
import { theme } from '../theme';

interface WebPhotoUploaderProps {
  companyId: number;
  existingPhotos?: string[];
  maxPhotos?: number;
  onUploadSuccess?: (photoUrl: string) => void;
  onDeleteSuccess?: (photoUrl: string) => void;
}

export const WebPhotoUploader = ({
  companyId,
  existingPhotos = [],
  maxPhotos = 10,
  onUploadSuccess,
  onDeleteSuccess,
}: WebPhotoUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only render on web
  if (Platform.OS !== 'web') {
    return null;
  }

  const handleFileSelect = async (event: any) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check limit
    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      alert(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots) as File[];

    setUploading(true);
    setProgress(0);

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];

        // Create FormData
        const formData = new FormData();
        formData.append('photo', file);

        // Upload
        const response = await ApiService.uploadCompanyPhoto(companyId, formData as any);

        if (response.success) {
          const photoUrl = response.data.photo_url;
          setPhotos(prev => [...prev, photoUrl]);
          onUploadSuccess?.(photoUrl);
        } else {
          throw new Error(response.message || 'Upload failed');
        }

        setProgress((i + 1) / filesToUpload.length);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (photoUrl: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      await ApiService.deleteCompanyPhoto(companyId, photoUrl);
      setPhotos(prev => prev.filter(url => url !== photoUrl));
      onDeleteSuccess?.(photoUrl);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete photo');
    }
  };

  return (
    <View style={styles.container}>
      {/* File input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Upload button */}
      <Button
        mode="contained"
        onPress={() => fileInputRef.current?.click()}
        disabled={uploading || photos.length >= maxPhotos}
        style={styles.uploadButton}
      >
        {uploading ? 'Uploading...' : 'Choose Photos'}
      </Button>

      {/* Upload progress */}
      {uploading && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} color={theme.colors.primary.main} />
          <Text style={styles.progressText}>
            Uploading {Math.round(progress * 100)}%
          </Text>
        </View>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <View style={styles.photoGrid}>
          {photos.map((photoUrl, index) => (
            <View key={index} style={styles.photoItem}>
              <img
                src={photoUrl.startsWith('http') ? photoUrl : `${process.env.REACT_APP_API_URL}${photoUrl}`}
                alt={`Photo ${index + 1}`}
                style={styles.photoImage as any}
              />
              <IconButton
                icon="close-circle"
                size={24}
                onPress={() => handleDelete(photoUrl)}
                style={styles.deleteButton}
              />
            </View>
          ))}
        </View>
      )}

      {/* Info text */}
      <Text style={styles.infoText}>
        {photos.length} of {maxPhotos} photos
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  uploadButton: {
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    marginTop: 8,
    textAlign: 'center',
    color: theme.colors.neutral[600],
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  photoItem: {
    width: 150,
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.neutral[100],
  },
  photoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  infoText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.neutral[600],
  },
});
```

---

## 🔧 Configuration & Environment

### Backend Environment Variables

**File:** `backend/.env`

```env
# Existing variables
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=...

# Photo upload configuration (optional)
MAX_PHOTO_SIZE=10485760        # 10MB in bytes
MAX_PHOTOS_PER_COMPANY=10      # Maximum photos allowed
UPLOAD_DIR=uploads/companies   # Upload directory path
```

### Frontend Environment Variables

**File:** `.env` (React Native / Expo)

```env
# API URL
REACT_APP_API_URL=http://localhost:5000
EXPO_PUBLIC_API_URL=http://localhost:5000
```

---

## 🧪 Testing Checklist

### Backend Testing

- [ ] Install dependencies (`npm install multer @types/multer sharp @types/sharp`)
- [ ] Create upload middleware (`backend/src/middleware/upload.ts`)
- [ ] Update company controller (`uploadPhoto` method)
- [ ] Update routes (`company.routes.ts` with multer middleware)
- [ ] Add static file serving (`server.ts`)
- [ ] Test file upload with Postman:
  - POST `http://localhost:5000/api/companies/:id/photos`
  - Headers: `Authorization: Bearer <token>`
  - Body: form-data, key: `photo`, value: (select file)
  - Expected: `{ success: true, data: { photo_url: "/uploads/..." } }`
- [ ] Test file deletion with Postman:
  - DELETE `http://localhost:5000/api/companies/:id/photos`
  - Body: `{ "photo_url": "/uploads/companies/1/photo_xxx.jpg" }`
- [ ] Verify photo optimization (file size should be ~200KB or less)
- [ ] Verify static file access: `http://localhost:5000/uploads/companies/1/photo_xxx.jpg`

### Mobile Testing (iOS)

- [ ] Create `MultipleImageUploader.tsx` component
- [ ] Update `ApiService` with upload methods
- [ ] Update `Step1BasicInfo.tsx` with photo uploader
- [ ] Create `ManagePhotosScreen.tsx`
- [ ] Update navigation
- [ ] Test camera permission request
- [ ] Test gallery permission request
- [ ] Test single photo upload
- [ ] Test multiple photo upload (gallery)
- [ ] Test upload progress indicator
- [ ] Test photo deletion
- [ ] Test 10-photo limit
- [ ] Test file size limit (10MB)
- [ ] Test upload retry on failure
- [ ] Test offline behavior

### Mobile Testing (Android)

- [ ] Test camera permission request
- [ ] Test gallery permission request
- [ ] Test single photo upload
- [ ] Test multiple photo upload
- [ ] Test all other features (same as iOS)

### Web Testing

- [ ] Create `WebPhotoUploader.tsx` component
- [ ] Test file input selection
- [ ] Test multiple file upload
- [ ] Test drag-and-drop (if implemented)
- [ ] Test photo deletion
- [ ] Test upload progress
- [ ] Test browser compatibility (Chrome, Firefox, Safari)

---

## 📊 Expected File Sizes

### Before Optimization
- Original photo: 2-5 MB (from phone camera)

### After Optimization (Sharp)
- Optimized photo: ~150-250 KB
- Dimensions: Max 1200x1200px (maintains aspect ratio)
- Format: JPEG with 85% quality

### Storage Calculation
- 10 photos per company × 200 KB average = ~2 MB per company
- 1000 companies = ~2 GB storage required

---

## 🔒 Security Considerations

### File Upload Security

1. **File Type Validation**
   - Only allow JPEG, PNG, WebP formats
   - Validate MIME type and file extension
   - Reject executables, scripts, or malicious files

2. **File Size Limits**
   - Maximum 10MB per upload
   - Maximum 10 photos per company
   - Total storage limit per company: ~20MB

3. **Authentication & Authorization**
   - Require JWT authentication for all upload endpoints
   - Verify company ownership before upload/delete
   - Prevent users from uploading to other companies

4. **Path Traversal Prevention**
   - Use `path.join()` to construct safe file paths
   - Validate company ID format (must be integer)
   - Never allow user-controlled filenames

5. **Rate Limiting** (Future Enhancement)
   - Limit uploads to 10 photos per hour per user
   - Prevent spam/abuse

### Static File Serving Security

1. **Public Access**
   - Photos are publicly accessible (no authentication required)
   - This is intentional - users need to view clinic photos

2. **Directory Listing**
   - Disable directory listing in Express
   - Only serve files, not directory structure

3. **File Permissions**
   - Ensure upload directory has proper permissions
   - Web server should have read/write access only

---

## 🚀 Deployment Considerations

### Production Environment

1. **Storage Strategy**
   - **Current**: Local file storage on server
   - **Recommended for Scale**: Migrate to AWS S3, Cloudinary, or similar
   - **Backup**: Implement regular backups of `/uploads` directory

2. **CDN Integration** (Future)
   - Serve photos through CDN for faster loading
   - Reduce bandwidth costs on main server

3. **Image Optimization**
   - Current: Sharp on upload (1200x1200, 85% quality)
   - Future: Generate multiple sizes (thumbnail, medium, large)
   - Implement lazy loading on frontend

4. **Monitoring**
   - Track upload success/failure rates
   - Monitor disk space usage
   - Alert when storage exceeds threshold

---

## 📝 Implementation Order

### Phase 1: Backend (Day 1)
1. Install dependencies
2. Create upload middleware
3. Update controller
4. Update routes
5. Add static file serving
6. Test with Postman

### Phase 2: Mobile (Day 2-3)
1. Create `MultipleImageUploader` component
2. Update `ApiService`
3. Update `Step1BasicInfo`
4. Create `ManagePhotosScreen`
5. Update navigation
6. Test on iOS/Android

### Phase 3: Web (Day 4)
1. Create `WebPhotoUploader` component
2. Integrate into web dashboard
3. Test on multiple browsers

### Phase 4: Polish & Testing (Day 5)
1. Handle edge cases
2. Add error handling
3. Improve UX (loading states, animations)
4. Final testing

---

## 🐛 Known Issues & Limitations

### Current Limitations

1. **No Cloud Storage**
   - Photos stored on local server
   - Not suitable for large-scale production
   - Requires backup strategy

2. **No Image Thumbnails**
   - All photos loaded at full size
   - May slow down on slow connections

3. **No Offline Support**
   - Upload requires active internet connection
   - Photos not queued for later upload

4. **No Progress for Individual Photos**
   - Shows overall progress, not per-photo
   - Cannot cancel individual uploads

### Future Enhancements

1. **Multiple Image Sizes**
   - Generate thumbnail, medium, large versions
   - Serve appropriate size based on context

2. **Cloud Storage Migration**
   - Integrate AWS S3 or Cloudinary
   - Enable CDN for faster delivery

3. **Offline Queue**
   - Queue photos when offline
   - Auto-upload when connection restored

4. **Image Editing**
   - Crop, rotate, adjust brightness
   - Filters and effects

5. **Bulk Upload**
   - Upload all photos at once
   - Show individual progress per photo

---

## 📚 References

- [Multer Documentation](https://github.com/expressjs/multer)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [FormData MDN](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

---

## ✅ Ready to Implement

This documentation provides a complete implementation guide for photo upload functionality. All code examples follow the project's object-based pattern (no classes) and integrate seamlessly with the existing architecture.

**Next Step**: Begin implementation with Phase 1 (Backend) by installing dependencies.
