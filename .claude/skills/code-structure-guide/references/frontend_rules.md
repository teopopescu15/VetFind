# ✅ Frontend Implementation Rules - React Native (Expo)

## ALWAYS DO

### React Native Component Patterns
- Use functional components with hooks (NOT class components)
- Use TypeScript for all components with proper prop typing
- Use default exports for screens, named exports for components
- Implement proper error boundaries for error handling
- Keep components focused (single responsibility principle)
- Use `StyleSheet.create()` for performance optimization
- Import types separately from values: `import type { User } from '../types/auth.types'`

### Object-Based Patterns (MANDATORY)
- **ALWAYS** use factory functions returning object literals (NEVER classes)
- **ALWAYS** use functional components (NEVER class components)
- Use object composition over inheritance
- Example:
```typescript
// ✅ CORRECT - Factory function
export const createApiService = () => {
  return {
    async login(credentials: LoginCredentials) { ... },
    async signup(data: SignupData) { ... }
  };
};

// ❌ WRONG - Class
class ApiService { }
```

### State Management
- Always access context through custom hooks (e.g., `useAuth()`)
- **NEVER** use `useContext()` directly in components
- Use `useState` for local component state
- Use Context API for global state (auth, theme, etc.)
- Keep state as close to where it's used as possible
- Use `useReducer` for complex state logic

### API Integration
- **ALWAYS** use `ApiService` from `src/services/api.ts` for ALL HTTP requests
- **NEVER** use `fetch()` or `axios` directly in components
- Route all API calls through service files using factory pattern
- Implement proper error handling for all API calls
- Always handle loading and error states in UI
- Use environment-aware base URL (localhost for web, WSL IP for mobile)

### Navigation & Routing
- Use React Navigation v7 patterns
- Implement stack navigators for logical flow
- Use proper navigation guards for authentication
- Handle deep linking and universal links
- Use `navigation.navigate()` for screen transitions
- Implement proper back button handling

### Styling & UI
- Use React Native Paper components for Material Design
- Use NativeWind (Tailwind) for utility-first styling
- Use `StyleSheet.create()` for standard React Native styles
- Follow mobile-first responsive design principles
- Use `SafeAreaView` for proper spacing on notched devices
- Handle platform-specific styles with `Platform.OS`
- Use `useWindowDimensions()` for responsive layouts

### Mobile-Specific Best Practices
- Always test on both iOS and Android platforms
- Use platform-specific code when necessary (`Platform.select()`)
- Implement proper keyboard handling (`KeyboardAvoidingView`)
- Use `FlatList` or `SectionList` for long lists (NOT ScrollView)
- Optimize images and assets for mobile bandwidth
- Use Expo's asset loading and caching
- Test on physical devices, not just simulators

### Performance Optimization
- Use `React.memo()` for expensive components
- Implement `useMemo()` and `useCallback()` wisely
- Avoid inline function definitions in render
- Use `FlatList` with `getItemLayout` for better performance
- Lazy load heavy components and screens
- Optimize images (use appropriate formats and sizes)

---

## ❌ NEVER DO - Anti-Patterns

### React Native Anti-Patterns
- **NEVER** use class components (use functional components with hooks)
- **NEVER** use ES6 classes anywhere in the project (factory functions only)
- **NEVER** call hooks conditionally or in loops
- **NEVER** mutate state directly (always use setState)
- **NEVER** use `useContext()` directly (always use custom hooks like `useAuth()`)
- **NEVER** skip prop type definitions in TypeScript
- **NEVER** place business logic in components (use services)
- **NEVER** use inline styles for static styles (use `StyleSheet.create()`)
- **NEVER** use `ScrollView` for long lists (use `FlatList`)

### API Anti-Patterns
- **NEVER** make API calls directly in components (use service files)
- **NEVER** use `fetch()` or `axios` directly (use `ApiService`)
- **NEVER** hardcode API URLs in components (use BASE_URL logic)
- **NEVER** expose sensitive data in frontend code
- **NEVER** skip error handling for API calls
- **NEVER** store sensitive tokens in AsyncStorage without encryption
- **NEVER** trust client-side validation alone (always validate on backend)

### Navigation Anti-Patterns
- **NEVER** skip navigation protection for authenticated screens
- **NEVER** allow navigation to protected routes without auth check
- **NEVER** expose admin/vetcompany routes without proper role guards
- **NEVER** use `navigation.push()` when `navigation.navigate()` is appropriate
- **NEVER** forget to handle the back button behavior

### Mobile Performance Anti-Patterns
- **NEVER** render large lists without virtualization
- **NEVER** load all images at once (use lazy loading)
- **NEVER** block the main thread with heavy computations
- **NEVER** forget to clean up subscriptions and listeners
- **NEVER** use `console.log` in production builds
- **NEVER** skip platform-specific optimizations

---

## Code Style & Conventions

### File Naming
- Screens: `PascalCase` (e.g., `LoginScreen.tsx`)
- Components: `PascalCase` (e.g., `EmptyCompanyState.tsx`)
- Services: `camelCase` (e.g., `api.ts`, `vetApi.ts`)
- Types: `camelCase.types.ts` (e.g., `auth.types.ts`, `vet.types.ts`)
- Contexts: `PascalCaseContext.tsx` (e.g., `AuthContext.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useAuth.ts`)

### Import Order
```typescript
// 1. React and React Native imports
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Third-party libraries
import { Button } from 'react-native-paper';

// 3. Navigation
import { useNavigation } from '@react-navigation/native';

// 4. Context and hooks
import { useAuth } from '../context/AuthContext';

// 5. Services
import { ApiService } from '../services/api';
import { vetApi } from '../services/vetApi';

// 6. Components
import EmptyCompanyState from '../components/EmptyCompanyState';

// 7. Types (always use 'import type')
import type { User } from '../types/auth.types';
import type { Clinic } from '../types/vet.types';
```

### Component Structure
```typescript
// 1. Imports (as above)

// 2. Type definitions
interface Props {
  userId: number;
  onSuccess?: () => void;
}

// 3. Component definition
const MyScreen = ({ userId, onSuccess }: Props) => {
  // 4. Hooks (state, context, navigation)
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();

  // 5. Effects
  useEffect(() => {
    loadData();
  }, [userId]);

  // 6. Handler functions
  const loadData = async () => {
    // ...
  };

  const handleSubmit = () => {
    // ...
  };

  // 7. Render
  return (
    <View style={styles.container}>
      {/* JSX */}
    </View>
  );
};

// 8. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

// 9. Export
export default MyScreen;
```

---

## Security Best Practices

### Authentication
- Store tokens in AsyncStorage (NOT in-memory only)
- Implement token refresh mechanism
- Clear tokens on logout
- Validate JWT tokens on backend
- Use httpOnly cookies for web, AsyncStorage for mobile

### Data Protection
- Never log sensitive data (passwords, tokens)
- Sanitize all user inputs before sending to backend
- Use HTTPS for all API calls
- Implement proper error messages (don't expose internals)
- Validate all data from API responses

### Role-Based Access
- Check user role before rendering admin/vetcompany features
- Implement navigation guards based on user role
- Never trust client-side role checks alone
- Always validate roles on backend

---

## Testing Guidelines

### Web Testing (Playwright)
- Test core user flows (login, signup, navigation)
- Test on `http://localhost:8082`
- Verify API integration with `localhost:5000` backend
- Take screenshots for visual regression

### Mobile Testing
- Test on iOS simulator and Android emulator
- Test on physical devices when possible
- Verify API integration with WSL IP backend
- Test different screen sizes and orientations
- Test offline mode and poor connectivity

### Unit Testing
- Test utility functions and services
- Test custom hooks
- Test component logic (not UI)
- Mock API calls and external dependencies

---

## Error Handling

### API Errors
```typescript
try {
  const data = await ApiService.login(credentials);
  // Handle success
} catch (error: any) {
  if (error.message === 'Invalid email or password') {
    // Show user-friendly error
  } else {
    // Show generic error
  }
  console.error('Login error:', error);
}
```

### Component Errors
```typescript
const [error, setError] = useState<string | null>(null);

const loadData = async () => {
  try {
    setError(null);
    const data = await vetApi.clinics.getAll();
    setClinics(data);
  } catch (err: any) {
    setError(err.message || 'Failed to load clinics');
  }
};

return (
  <View>
    {error && <Text style={styles.error}>{error}</Text>}
    {/* Content */}
  </View>
);
```

---

## Common Patterns

### Loading States
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await apiCall();
    setData(data);
  } finally {
    setLoading(false);
  }
};

if (loading) {
  return <ActivityIndicator />;
}
```

### Navigation with Params
```typescript
// Navigate with params
navigation.navigate('ClinicDetail', { clinicId: 123 });

// Receive params
const { clinicId } = route.params;
```

### Platform-Specific Code
```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
});
```

---

**Last Updated**: 2025-11-16
**Version**: 2.0.0 (React Native best practices)
