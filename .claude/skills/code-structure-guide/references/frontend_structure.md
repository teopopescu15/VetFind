# 🎨 Frontend Structure - React Native (Expo)

## Complete Folder Structure

```
/
├── src/                      # All React Native source code
│   ├── components/          # Reusable React Native components
│   │   └── EmptyCompanyState.tsx # Empty state component for vet company dashboard
│   │
│   ├── screens/             # Full screen components (one per route)
│   │   ├── BookAppointmentScreen.tsx # Appointment booking screen with date/time picker
│   │   ├── ClinicDetailScreen.tsx # Detailed view of clinic with services and reviews
│   │   ├── DashboardScreen.tsx # User dashboard (role-based: user/vetcompany/admin)
│   │   ├── LoginScreen.tsx # Email/password login screen
│   │   ├── MyAppointmentsScreen.tsx # User's appointments list and management
│   │   ├── SignupScreen.tsx # User registration screen with role selection
│   │   └── VetFinderHomeScreen.tsx # Main home screen with clinic search and map
│   │
│   ├── navigation/          # React Navigation configuration
│   │   ├── AppNavigator.tsx # Main stack navigator (protected routes, role-based access)
│   │   └── AuthNavigator.tsx # Auth stack navigator (login, signup screens)
│   │
│   ├── context/             # React Context API for global state management
│   │   └── AuthContext.tsx # Global authentication state (user, tokens, login/logout)
│   │                       # NOTE: Always access through useAuth() hook, NEVER useContext() directly
│   │
│   ├── services/            # API communication and external service integrations
│   │   ├── api.ts          # Base API service with authentication (factory pattern)
│   │   │                   # ⚠️ ALWAYS use ApiService from this file for ALL HTTP requests
│   │   │                   # Auto-detects localhost vs WSL IP for web/mobile compatibility
│   │   └── vetApi.ts       # VetFinder-specific API calls (clinics, appointments, reviews)
│   │
│   └── types/              # TypeScript type definitions for frontend
│       ├── auth.types.ts   # Authentication types (User with role, LoginCredentials, AuthResponse)
│       └── vet.types.ts    # VetFinder types (Clinic, Service, Review, Appointment)
│
├── assets/                  # Static assets (images, fonts, icons)
│   ├── adaptive-icon.png   # Adaptive icon for Android
│   ├── favicon.png         # Favicon for web
│   ├── icon.png           # App icon
│   └── splash.png         # Splash screen image
│
├── App.tsx                  # Main app component with navigation setup
├── index.ts                 # Application entry point (registers root component)
├── app.json                 # Expo configuration (app name, version, icons, splash)
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration (extends expo/tsconfig.base)
├── metro.config.js          # Metro bundler configuration
├── .env                     # Environment variables (NEVER commit this file)
└── backend/                 # Backend API server (separate from frontend)
    └── ...                  # See backend_structure.md
```

---

## Folder Descriptions

| Folder | Purpose | What Goes Here |
|--------|---------|----------------|
| **src/** | All React Native source code | Components, screens, navigation, services, types, context |
| **src/components/** | Reusable UI components | Reusable React Native components used across multiple screens |
| **src/screens/** | Full screen components | One component per route, corresponds to navigation screens |
| **src/navigation/** | Navigation configuration | React Navigation setup, stack navigators, route definitions |
| **src/context/** | Global state management | React Context providers (authentication, theme, user preferences) |
| **src/services/** | API communication | API client setup, authentication, VetFinder endpoints, external services<br>⚠️ **ALWAYS import and use `ApiService` from `src/services/api.ts` for ALL HTTP requests** |
| **src/types/** | TypeScript definitions | User types (role-based), API response types, domain models |
| **assets/** | Static assets | Images, fonts, icons, splash screens (managed by Expo) |
| **/** (root) | Configuration files | Expo config (app.json), package.json, TypeScript config, Metro bundler |

---

## Technology Stack

### Core Technologies
- **React Native 0.76.5** - Mobile app framework
- **Expo SDK ~52.0.23** - Development platform and build tools
- **TypeScript 5.3.3** - Type safety and developer experience
- **React Navigation v7** - Screen navigation and routing

### UI & Styling
- **React Native Paper** - Material Design 3 components
- **NativeWind** - Tailwind CSS for React Native
- **Expo Linear Gradient** - Gradient backgrounds and effects
- **React Native Vector Icons** - Icon library

### State Management & Data
- **React Context API** - Global authentication state
- **AsyncStorage** - Local data persistence (tokens, user preferences)

### Location & Features
- **Expo Location** - GPS and geolocation services
- **Expo Image Picker** - Camera and gallery access

---

## Key Patterns & Conventions

### 1. Object-Based Implementation (MANDATORY)
**CRITICAL**: This project uses object literals and factory functions instead of ES6 classes.

**✅ USE - Factory Functions**:
```typescript
// src/services/api.ts
export const createApiService = () => {
  return {
    async login(credentials: LoginCredentials) {
      // ...
    },
    async signup(data: SignupData) {
      // ...
    }
  };
};

export const ApiService = createApiService();
```

**✅ USE - Functional Components**:
```typescript
// src/screens/LoginScreen.tsx
export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const { login } = useAuth();

  return <View>...</View>;
};

export default LoginScreen;
```

**❌ NEVER USE - Classes**:
```typescript
// WRONG: Do not use class syntax
class LoginScreen extends React.Component { }
```

### 2. Import Path Convention
All imports from `src/` folder use relative paths:

```typescript
// App.tsx (root level)
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Within src/ folder (e.g., src/screens/LoginScreen.tsx)
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import type { LoginCredentials } from '../types/auth.types';
```

### 3. API Service Pattern
**Always use the singleton ApiService instance**:

```typescript
// ✅ CORRECT
import { ApiService } from '../services/api';

const login = async () => {
  const result = await ApiService.login(credentials);
};
```

```typescript
// ❌ WRONG - Never use fetch directly
const response = await fetch('http://...'); // DON'T DO THIS
```

### 4. Authentication Context Pattern
**Always use the useAuth() hook**:

```typescript
// ✅ CORRECT
import { useAuth } from '../context/AuthContext';

const MyScreen = () => {
  const { user, login, logout } = useAuth();
  // ...
};
```

```typescript
// ❌ WRONG - Never use useContext directly
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const { user } = useContext(AuthContext); // DON'T DO THIS
```

### 5. Type Safety
- Always use TypeScript types from `src/types/`
- No `any` types (use `unknown` if type is truly unknown)
- Define interfaces for all API responses and domain models

---

## Example: Adding a New Feature

### Scenario: Adding "Pet Profiles" feature

#### Frontend Files to Create:
```
src/
├── screens/
│   ├── PetProfileScreen.tsx       # View/edit pet profile
│   └── PetListScreen.tsx          # List all user's pets
├── components/
│   ├── PetCard.tsx                # Pet profile card component
│   └── PetForm.tsx                # Pet creation/editing form
├── services/
│   └── petApi.ts                  # Pet API calls (factory pattern)
└── types/
    └── pet.types.ts               # Pet TypeScript types
```

#### Implementation Steps:
1. **Define types** in `src/types/pet.types.ts`:
```typescript
export interface Pet {
  id: number;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  userId: number;
}
```

2. **Create API service** in `src/services/petApi.ts`:
```typescript
import { ApiService } from './api';
import type { Pet } from '../types/pet.types';

export const createPetApiService = () => {
  return {
    async getPets(): Promise<Pet[]> {
      return await ApiService.request<Pet[]>('/pets');
    },

    async createPet(pet: Pet): Promise<Pet> {
      return await ApiService.request<Pet>('/pets', {
        method: 'POST',
        body: JSON.stringify(pet)
      });
    }
  };
};

export const petApi = createPetApiService();
```

3. **Create screen** in `src/screens/PetListScreen.tsx`:
```typescript
import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { petApi } from '../services/petApi';
import type { Pet } from '../types/pet.types';
import PetCard from '../components/PetCard';

const PetListScreen = () => {
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    const data = await petApi.getPets();
    setPets(data);
  };

  return (
    <FlatList
      data={pets}
      renderItem={({ item }) => <PetCard pet={item} />}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

export default PetListScreen;
```

4. **Add to navigation** in `src/navigation/AppNavigator.tsx`:
```typescript
import PetListScreen from '../screens/PetListScreen';

// Add to Stack.Navigator
<Stack.Screen name="PetList" component={PetListScreen} />
```

5. **Update this reference file** with new entries

---

## Mobile-Specific Considerations

### Platform-Specific Code
Use `Platform.OS` for platform-specific logic:

```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0, // iOS status bar
  }
});
```

### Responsive Design
Use `Dimensions` or `useWindowDimensions` for responsive layouts:

```typescript
import { useWindowDimensions } from 'react-native';

const MyScreen = () => {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;

  return <View style={{ width: isTablet ? '50%' : '100%' }} />;
};
```

### Safe Area Handling
Always use `SafeAreaView` for proper spacing:

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

const MyScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Content */}
    </SafeAreaView>
  );
};
```

---

## Environment Configuration

### API Base URL Logic
The API service auto-detects the correct base URL:

```typescript
// src/services/api.ts
const BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'        // Web testing (Playwright)
  : 'http://172.23.126.178:5000/api';  // Mobile devices (WSL IP)
```

---

## Testing Strategy

### Web Testing (Playwright)
- Test on `http://localhost:8082` (Expo web)
- Backend connects to `localhost:5000`

### Mobile Testing (Physical Device/Emulator)
- Test using Expo Go or development builds
- Backend connects to WSL IP address (e.g., `172.23.126.178:5000`)

---

**Last Updated**: 2025-11-16
**Version**: 2.0.0 (React Native with /src structure)
