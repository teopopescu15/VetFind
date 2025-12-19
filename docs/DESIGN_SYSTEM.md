# VetFinder Design System - Material Design 3

## ⚠️ DEPRECATION NOTICE

**This document is OUTDATED and superseded by `/docs/Redesign.md`**

**Status**: ❌ DEPRECATED (as of Dec 2024)
**Replacement**: ✅ **Use `/docs/Redesign.md`** for current design system

**What Changed**:
- **Old**: Purple theme (`#7c3aed`) → **New**: Blue theme (`#2563eb`)
- **Old**: White backgrounds → **New**: Warm cream backgrounds (`#fafaf9`)
- **New**: Terracotta accent color (`#ea580c`) for CTAs
- **New**: Responsive design utilities (`responsive.*`)
- **New**: Theme hook system (`useTheme()`)

**Migration Status**: Redesign.md implementation is 50% complete (Phases 1-3 done)

---

## Historical Overview (For Reference Only)
VetFinder uses Material Design 3 (Material You) principles with React Native Paper for a modern, bold, and accessible UI.

**⚠️ NOTE**: The color specifications below are OUTDATED. See Redesign.md for current palette.

---

## Color Palette

### Primary Colors
```typescript
// Purple - Main brand color
primary: {
  main: '#7c3aed',      // violet-600
  light: '#a78bfa',     // violet-400
  dark: '#6d28d9',      // violet-700
  contrast: '#ffffff'
}

// Secondary Colors
secondary: {
  main: '#3b82f6',      // blue-500
  light: '#60a5fa',     // blue-400
  dark: '#2563eb',      // blue-600
  contrast: '#ffffff'
}

// Tertiary Colors
tertiary: {
  main: '#10b981',      // green-500
  light: '#34d399',     // green-400
  dark: '#059669',      // green-600
  contrast: '#ffffff'
}
```

### Semantic Colors
```typescript
// Success - for confirmations, open status
success: {
  main: '#10b981',      // green-500
  light: '#d1fae5',     // green-100
  dark: '#065f46',      // green-800
}

// Error - for errors, closed status, cancellations
error: {
  main: '#ef4444',      // red-500
  light: '#fee2e2',     // red-100
  dark: '#991b1b',      // red-800
}

// Warning - for important notices
warning: {
  main: '#f59e0b',      // amber-500
  light: '#fef3c7',     // amber-100
  dark: '#92400e',      // amber-800
}

// Info - for general information
info: {
  main: '#3b82f6',      // blue-500
  light: '#dbeafe',     // blue-100
  dark: '#1e3a8a',      // blue-800
}
```

### Surface & Background
```typescript
// Surfaces
surface: {
  background: '#f9fafb',    // gray-50 - Main app background
  card: '#ffffff',          // white - Card background
  elevated: '#ffffff',      // white - Elevated surfaces
  overlay: 'rgba(0,0,0,0.5)' // Modal overlay
}

// Text Colors
text: {
  primary: '#111827',       // gray-900
  secondary: '#6b7280',     // gray-500
  tertiary: '#9ca3af',      // gray-400
  disabled: '#d1d5db',      // gray-300
  inverse: '#ffffff'        // white on dark backgrounds
}
```

---

## Typography

### Font Family
```typescript
// Default: System fonts for best performance
fontFamily: {
  regular: 'System',
  medium: 'System',
  bold: 'System',

  // Optional: Custom fonts (if needed)
  // heading: 'Poppins-SemiBold',
  // body: 'Inter-Regular'
}
```

### Font Sizes & Scale
```typescript
fontSize: {
  // Display - Hero sections
  displayLarge: 57,
  displayMedium: 45,
  displaySmall: 36,

  // Headline - Section titles
  headlineLarge: 32,
  headlineMedium: 28,
  headlineSmall: 24,

  // Title - Card headers, dialog titles
  titleLarge: 22,
  titleMedium: 16,
  titleSmall: 14,

  // Body - Main content
  bodyLarge: 16,
  bodyMedium: 14,
  bodySmall: 12,

  // Label - Buttons, tabs
  labelLarge: 14,
  labelMedium: 12,
  labelSmall: 11
}
```

### Font Weights
```typescript
fontWeight: {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700'
}
```

### Line Heights
```typescript
lineHeight: {
  tight: 1.2,     // Headlines
  normal: 1.5,    // Body text
  relaxed: 1.75   // Long-form content
}
```

---

## Spacing System

### Base Unit: 4px
All spacing values are multiples of 4px for consistency.

```typescript
spacing: {
  xs: 4,      // 4px
  sm: 8,      // 8px
  md: 12,     // 12px
  base: 16,   // 16px (default)
  lg: 20,     // 20px
  xl: 24,     // 24px
  '2xl': 32,  // 32px
  '3xl': 40,  // 40px
  '4xl': 48,  // 48px
  '5xl': 64,  // 64px
}
```

### Component Spacing Guidelines

**Screen Padding**: 16px (base)
**Card Padding**: 16px (base)
**Section Gap**: 24px (xl)
**Element Gap**: 12px (md)
**Small Gap**: 8px (sm)

---

## Elevation (Shadows)

Material Design 3 uses elevation to create hierarchy.

```typescript
elevation: {
  0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0
  },
  1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3
  },
  4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4
  }
}
```

**Usage**:
- **Level 0**: Flat surfaces, dividers
- **Level 1**: Cards at rest
- **Level 2**: Cards on hover/press
- **Level 3**: Modals, dialogs
- **Level 4**: FAB, app bar

---

## Border Radius

```typescript
borderRadius: {
  none: 0,
  sm: 4,      // Small elements
  md: 8,      // Buttons, chips
  lg: 12,     // Input fields
  xl: 16,     // Cards
  '2xl': 20,  // Large cards
  '3xl': 24,  // Bottom sheets
  full: 9999  // Pills, badges
}
```

---

## Component Styles

### Button
```typescript
// Primary Button
<Button
  mode="contained"
  buttonColor="#7c3aed"
  textColor="#ffffff"
  style={{
    borderRadius: 8,
    paddingVertical: 4
  }}
>
  Book Now
</Button>

// Secondary Button
<Button
  mode="outlined"
  textColor="#7c3aed"
  style={{
    borderRadius: 8,
    borderColor: '#7c3aed'
  }}
>
  View Details
</Button>

// Text Button
<Button
  mode="text"
  textColor="#7c3aed"
>
  Cancel
</Button>
```

### Card
```typescript
<Card
  mode="elevated"
  elevation={2}
  style={{
    borderRadius: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16
  }}
>
  <Card.Content>
    {/* Content */}
  </Card.Content>
</Card>
```

### Chip (Time Slots)
```typescript
// Available Slot
<Chip
  mode="outlined"
  selected={false}
  onPress={() => {}}
  style={{
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff'
  }}
  textStyle={{ color: '#111827' }}
>
  09:00 AM
</Chip>

// Selected Slot
<Chip
  mode="flat"
  selected={true}
  style={{
    backgroundColor: '#7c3aed'
  }}
  textStyle={{ color: '#ffffff' }}
>
  09:00 AM
</Chip>

// Disabled Slot
<Chip
  mode="outlined"
  disabled={true}
  style={{
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb'
  }}
  textStyle={{ color: '#9ca3af' }}
>
  10:00 AM
</Chip>
```

### Badge
```typescript
// Status Badge
<Badge
  size={20}
  style={{
    backgroundColor: '#10b981',
    color: '#ffffff'
  }}
>
  Open
</Badge>

// Rating Badge
<Badge
  size={24}
  style={{
    backgroundColor: '#f59e0b',
    color: '#ffffff'
  }}
>
  ⭐ 4.8
</Badge>
```

### FAB (Floating Action Button)
```typescript
<FAB
  icon="calendar-plus"
  label="Book Appointment"
  onPress={() => {}}
  style={{
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#7c3aed'
  }}
  color="#ffffff"
/>
```

### Segmented Buttons (Tabs)
```typescript
<SegmentedButtons
  value={selectedTab}
  onValueChange={setSelectedTab}
  buttons={[
    { value: 'about', label: 'About' },
    { value: 'services', label: 'Services' },
    { value: 'reviews', label: 'Reviews' }
  ]}
  style={{
    marginHorizontal: 16,
    marginVertical: 12
  }}
/>
```

---

## Animation & Transitions

### Spring Animation (Buttons, Cards)
```typescript
import { Animated } from 'react-native';

const scaleAnim = useRef(new Animated.Value(1)).current;

const handlePressIn = () => {
  Animated.spring(scaleAnim, {
    toValue: 0.95,
    useNativeDriver: true
  }).start();
};

const handlePressOut = () => {
  Animated.spring(scaleAnim, {
    toValue: 1,
    friction: 3,
    tension: 40,
    useNativeDriver: true
  }).start();
};
```

### Slide Animation (Bottom Sheets)
```typescript
<Modal
  visible={visible}
  transparent
  animationType="slide"
  onRequestClose={onDismiss}
>
  {/* Modal content */}
</Modal>
```

### Fade Animation (Loading States)
```typescript
const fadeAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true
  }).start();
}, []);
```

---

## Accessibility

### Color Contrast Ratios
All color combinations meet WCAG AA standards:
- **Normal Text**: 4.5:1 minimum
- **Large Text**: 3:1 minimum
- **UI Components**: 3:1 minimum

### Touch Targets
Minimum touch target size: **44x44 dp** (iOS) / **48x48 dp** (Android)

### Screen Reader Support
```typescript
<Button
  accessibilityLabel="Book appointment at Happy Paws Clinic"
  accessibilityHint="Opens appointment booking screen"
  accessibilityRole="button"
>
  Book Now
</Button>
```

---

## Icon System

### Icon Library
Using **MaterialCommunityIcons** from `@expo/vector-icons`

### Common Icons
```typescript
icons: {
  // Navigation
  back: 'arrow-left',
  close: 'close',

  // Actions
  add: 'plus',
  edit: 'pencil',
  delete: 'delete',
  save: 'content-save',

  // Info
  info: 'information',
  warning: 'alert',
  error: 'alert-circle',
  success: 'check-circle',

  // Veterinary
  pet: 'paw',
  clinic: 'hospital-building',
  doctor: 'doctor',
  calendar: 'calendar',
  clock: 'clock-outline',
  phone: 'phone',
  location: 'map-marker',

  // Services
  checkup: 'stethoscope',
  dental: 'tooth',
  surgery: 'medical-bag',
  grooming: 'content-cut',
  emergency: 'ambulance'
}
```

### Icon Sizes
```typescript
iconSize: {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48
}
```

---

## Responsive Design

### Breakpoints
```typescript
breakpoints: {
  phone: 0,       // 0-599px
  tablet: 600,    // 600-1023px
  desktop: 1024   // 1024px+
}
```

### Device-Specific Spacing
```typescript
// Phone: 16px padding
// Tablet: 24px padding
// Desktop: 32px padding

const horizontalPadding = Platform.select({
  ios: 16,
  android: 16,
  web: windowWidth >= 1024 ? 32 : windowWidth >= 600 ? 24 : 16
});
```

---

## Loading States

### Skeleton Loader
```typescript
<Surface style={styles.card}>
  <View style={styles.skeleton}>
    <View style={[styles.skeletonImage, { backgroundColor: '#e5e7eb' }]} />
    <View style={[styles.skeletonText, { backgroundColor: '#e5e7eb' }]} />
    <View style={[styles.skeletonText, { width: '60%', backgroundColor: '#e5e7eb' }]} />
  </View>
</Surface>
```

### Activity Indicator
```typescript
<ActivityIndicator
  size="large"
  color="#7c3aed"
  style={{ marginVertical: 24 }}
/>
```

---

## Empty States

### No Appointments
```typescript
<View style={styles.emptyState}>
  <MaterialCommunityIcons name="calendar-blank" size={64} color="#d1d5db" />
  <Text style={styles.emptyTitle}>No appointments yet</Text>
  <Text style={styles.emptyDescription}>
    Book your first appointment to get started
  </Text>
  <Button mode="contained" onPress={navigateToBooking}>
    Find a Clinic
  </Button>
</View>
```

---

## Form Elements

### Text Input
```typescript
<TextInput
  mode="outlined"
  label="Notes (optional)"
  placeholder="Any special requirements?"
  value={notes}
  onChangeText={setNotes}
  multiline
  numberOfLines={4}
  outlineColor="#d1d5db"
  activeOutlineColor="#7c3aed"
  style={{
    backgroundColor: '#ffffff',
    marginBottom: 16
  }}
/>
```

### Date Picker
```typescript
import { DatePickerModal } from 'react-native-paper-dates';

<DatePickerModal
  locale="en"
  mode="single"
  visible={visible}
  onDismiss={onDismiss}
  date={date}
  onConfirm={onConfirm}
  validRange={{
    startDate: new Date(),
    endDate: addDays(new Date(), 30)
  }}
/>
```

---

## Best Practices

### Do's ✅
- Use elevation for hierarchy
- Maintain consistent spacing (4px grid)
- Use semantic colors for states
- Provide loading states
- Add haptic feedback on press
- Support both light and dark mode (future)
- Meet accessibility standards

### Don'ts ❌
- Don't use random spacing values
- Don't use too many colors
- Don't skip loading states
- Don't ignore touch target sizes
- Don't hardcode colors
- Don't forget error states

---

## Implementation Example

```typescript
// src/theme/theme.ts
import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#7c3aed',
    secondary: '#3b82f6',
    tertiary: '#10b981',
    error: '#ef4444',
    background: '#f9fafb',
    surface: '#ffffff',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onBackground: '#111827',
    onSurface: '#111827',
  },
  roundness: 16,
};
```

Usage:
```typescript
import { Provider as PaperProvider } from 'react-native-paper';
import { theme } from './theme/theme';

export default function App() {
  return (
    <PaperProvider theme={theme}>
      {/* App content */}
    </PaperProvider>
  );
}
```
