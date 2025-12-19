# VetFinder: Enhanced Company Detail & Service-Based Appointment Booking

## Overview
Comprehensive vet company detail page with service-based appointment booking system featuring instant confirmation and Material Design 3 styling.

**⚠️ DESIGN AUTHORITY**: All UI/UX styling, colors, and responsive design MUST follow **`/docs/Redesign.md`** specifications (warm professional blue/terracotta palette). This document covers functional requirements only.

## User Requirements Summary
- **Navigation**: Click on company card → redirect to detailed company info page
- **Company Details**: Display name, specializations, services, facilities, opening hours
- **Service-Based Booking**: Users select service first, then available time slots
- **Instant Booking**: Appointments are confirmed immediately (no pending state)
- **Design Style**: Material Design 3 (colorful & bold) using React Native Paper
- **Service Duration**: Use existing `duration_minutes` field from `company_services` table

## Database Schema Confirmed
✅ `company_services.duration_minutes` exists (line 30 in migration 004)
✅ Services include: category, name, description, price_min, price_max, duration_minutes
✅ Appointments table ready with: clinic_id, user_id, service_id, appointment_date, status

## Design Inspiration Insights

From healthcare UI research (50+ examples analyzed):
1. **Appointment Scheduling Best Practices**:
   - Clear calendar visualization with time slot selection
   - Service cards with duration, price, and description
   - Confirmation screens with summary and actions
   - Easy rescheduling/cancellation options

2. **Material Design 3 Patterns**:
   - Bold color surfaces with elevation
   - FAB (Floating Action Button) for primary actions
   - Bottom sheets for booking flows
   - Cards with rich imagery and content hierarchy
   - Colorful status indicators and badges

3. **Visual Hierarchy**:
   - Hero image/photo section at top
   - Key information cards (rating, hours, contact)
   - Tabbed or segmented sections (About, Services, Reviews)
   - Prominent CTA buttons for booking

## Implementation Plan

### Phase 1: Backend Service & Booking API

#### 1.1 Company Services API (NEW)
**File**: `backend/src/routes/services.ts` (NEW)
- GET `/api/companies/:companyId/services` - List all active services for a company
- GET `/api/services/:id` - Get single service details

**File**: `backend/src/controllers/services.ts` (NEW)
- `getCompanyServices()` - Fetch services with category grouping
- `getServiceById()` - Fetch single service with company info

**File**: `backend/src/models/service.ts` (NEW)
- `findByCompany(companyId)` - Get all active services for company
- `findById(serviceId)` - Get service with company details
- `findByCategory(companyId, category)` - Group services by category

#### 1.2 Appointment Booking API (ENHANCE EXISTING)
**File**: `backend/src/routes/appointments.ts` (EXISTS)
- POST `/api/appointments` - Create new appointment
- GET `/api/appointments/availability/:companyId/:serviceId` - Check available slots
- GET `/api/appointments/user` - Get user's appointments
- PATCH `/api/appointments/:id/cancel` - Cancel appointment

**File**: `backend/src/controllers/appointments.ts` (NEW)
- `create()` - Create instant-confirmed appointment
- `getAvailableSlots()` - Calculate available time slots based on:
  - Service duration
  - Company opening hours
  - Existing appointments (blocked slots)
  - Date range (next 30 days)
- `getUserAppointments()` - Get user's appointment list
- `cancelAppointment()` - Cancel appointment (status = 'cancelled')

**File**: `backend/src/models/appointment.ts` (EXISTS - ENHANCE)
- `create()` - Create appointment with status='confirmed'
- `findByCompanyAndDate()` - Get all appointments for date range
- `getOccupiedSlots()` - Return array of occupied time ranges
- `findByUser()` - Get user appointments with company & service details

#### 1.3 Slot Availability Logic
**Algorithm**: Generate available slots for a service
```
Input: companyId, serviceId, startDate, endDate
1. Fetch service (get duration_minutes)
2. Fetch company opening_hours
3. For each day in range:
   - Get opening hours for that day
   - Generate slots (start_time to end_time with duration interval)
   - Fetch occupied slots from appointments
   - Remove occupied slots
   - Return available slots
Output: Array of { date, time, available: boolean }
```

### Phase 2: Frontend Enhanced Detail Screen

#### 2.1 VetCompanyDetailScreen (ENHANCE EXISTING)
**File**: `src/screens/VetCompanyDetailScreen.tsx` (EXISTS)

**New Sections**:
1. **Hero Section** (Enhanced)
   - Large photo carousel (if multiple photos)
   - Floating back button
   - Gradient overlay with company name
   - Verification badge
   - Rating badge (prepare for future reviews)

2. **Quick Info Cards** (NEW)
   - Opening hours with live status (Open/Closed)
   - Phone with direct call action
   - Address with map navigation
   - Distance from user

3. **Tabs/Segments** (NEW - Material Design 3 SegmentedButtons)
   - About Tab: Description, facilities, payment methods
   - Services Tab: Service cards grouped by category
   - Reviews Tab: Placeholder for future reviews
   - Photos Tab: Photo gallery

4. **Services Section** (NEW)
   - Category headers (Routine Care, Dental, etc.)
   - Service cards showing:
     - Service name
     - Duration badge (e.g., "30 min")
     - Price range ($20 - $50)
     - Description (truncated)
     - "Book Now" button
   - Material Design 3 Card with elevation

5. **Floating Action Button** (NEW)
   - Material Design FAB
   - "Book Appointment" primary action
   - Opens service selection bottom sheet

#### 2.2 Navigation Enhancement
**File**: `src/components/VetCompanyCard.tsx` (EXISTS - ENHANCE)
- Add `onPress` handler to navigate to detail screen
- Pass company ID to detail screen via route params
- Add haptic feedback on press

**File**: `src/navigation/AppNavigator.tsx` (EXISTS - VERIFY)
- Ensure `VetCompanyDetail` screen registered
- Configure header for detail screen

### Phase 3: Appointment Booking Flow

#### 3.1 Service Selection Bottom Sheet (NEW)
**File**: `src/components/ServiceSelectionSheet.tsx` (NEW)

**Features**:
- React Native Paper Modal/Portal
- List of services grouped by category
- Search/filter by service name
- Service card with full details
- Material Design 3 styling
- Smooth animations

**Props**: `{ companyId, visible, onDismiss, onSelectService }`

#### 3.2 Time Slot Selection Screen (NEW)
**File**: `src/screens/BookAppointmentScreen.tsx` (EXISTS - MAJOR ENHANCEMENT)

**Layout**:
1. **Header Section**:
   - Company name and logo
   - Selected service (name, duration, price)
   - Option to change service

2. **Calendar Section**:
   - React Native Paper DatePicker or custom calendar
   - Material Design 3 calendar style
   - Next 30 days selectable
   - Disabled dates (closed days)
   - Visual indicators for availability

3. **Time Slots Grid**:
   - Grid of available time slots for selected date
   - Pills/chips showing time (e.g., "09:00 AM")
   - Occupied slots disabled/grayed out
   - Selected slot highlighted
   - Material Design 3 Chip components

4. **Confirmation Section**:
   - Summary card:
     - Company name
     - Service name & duration
     - Selected date & time
     - Total price
   - Text input for notes (optional)
   - "Confirm Appointment" button (FAB or large button)

#### 3.3 Appointment Confirmation Screen (NEW)
**File**: `src/screens/AppointmentConfirmationScreen.tsx` (NEW)

**Content**:
- Success animation/icon (checkmark)
- "Appointment Confirmed!" heading
- Appointment summary card:
  - Company name, address, phone
  - Service name
  - Date and time
  - Price
  - Appointment ID
- Action buttons:
  - "View My Appointments" (navigate to MyAppointmentsScreen)
  - "Add to Calendar" (use expo-calendar)
  - "Get Directions" (open maps)
  - "Done" (go back to dashboard)
- Material Design 3 surface cards

#### 3.4 My Appointments Screen (ENHANCE EXISTING)
**File**: `src/screens/MyAppointmentsScreen.tsx` (EXISTS - ENHANCE)

**Enhancements**:
- Segment upcoming vs past appointments
- Appointment cards showing:
  - Company logo and name
  - Service name
  - Date and time
  - Status badge (confirmed/cancelled/completed)
  - Actions: "Cancel", "Reschedule", "Get Directions"
- Pull-to-refresh
- Empty state with "Book your first appointment" CTA
- Material Design 3 styling

### Phase 4: API Service Integration

#### 4.1 API Service Methods (ENHANCE)
**File**: `src/services/api.ts` (EXISTS - ADD METHODS)

**New Methods**:
```typescript
// Services
getCompanyServices: (companyId: number) => Promise<Service[]>
getServiceById: (serviceId: number) => Promise<Service>

// Appointments
getAvailableSlots: (companyId: number, serviceId: number, startDate: string, endDate: string) => Promise<TimeSlot[]>
createAppointment: (data: CreateAppointmentDTO) => Promise<Appointment>
getUserAppointments: () => Promise<Appointment[]>
cancelAppointment: (appointmentId: number) => Promise<void>
```

#### 4.2 TypeScript Types (NEW/UPDATE)
**File**: `src/types/service.types.ts` (NEW)
```typescript
export type ServiceCategory =
  | 'routine_care'
  | 'dental_care'
  | 'diagnostic_services'
  | 'emergency_care'
  | 'surgical_procedures'
  | 'grooming'
  | 'custom';

export interface Service {
  id: number;
  company_id: number;
  category: ServiceCategory;
  service_name: string;
  description: string;
  price_min: number;
  price_max: number;
  duration_minutes: number;
  is_custom: boolean;
  is_active: boolean;
}

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  available: boolean;
}

export interface CreateAppointmentDTO {
  clinic_id: number;
  service_id: number;
  appointment_date: string; // ISO datetime
  notes?: string;
}
```

**File**: `src/types/appointment.types.ts` (NEW)
```typescript
export type AppointmentStatus =
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export interface Appointment {
  id: number;
  clinic_id: number;
  user_id: number;
  service_id: number;
  appointment_date: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;

  // Joined data
  company?: Company;
  service?: Service;
}
```

### Phase 5: UI/UX Polish & Material Design 3

#### 5.1 Design System Integration (Per Redesign.md)
**CRITICAL**: All styling MUST use the warm professional design system from `/docs/Redesign.md`

**Required Implementation**:
- ✅ **Import and use `useTheme()` hook** in ALL appointment screens
- ✅ **Use `theme.colors.*` tokens** - NO hardcoded hex values
- ✅ **Use `responsive.*` utilities** - NO hardcoded dimensions (SCREEN_WIDTH, etc.)
- ✅ **Reference Redesign.md** for complete color palette and spacing

**Color Palette (from Redesign.md)**:
- **Primary**: Blue `#2563eb` (professional trust) - ALL primary buttons, focus states
- **Accent/CTA**: Terracotta `#ea580c` - Call-to-action buttons, important highlights
- **Success**: Green `#10b981` - Confirmations, available slots, open status
- **Error**: Red `#ef4444` - Errors, closed status, cancellations
- **Backgrounds**: Warm cream `#fafaf9` (main), Light cream `#f5f5f4` (cards)
- **Text**: Dark `#44403c` (primary), Gray `#6b7280` (secondary)

**❌ DEPRECATED**: Purple `#7c3aed` theme - See Redesign.md for migration

#### 5.2 Component Styling (Material Design 3 with Redesign Theme)
**Files to Style**:
- All screens with Material Design 3 components from React Native Paper:
  - **Surface, Card**: Use `theme.colors.surface.card` backgrounds with warm cream
  - **Button, FAB**: Primary = `theme.colors.primary.main` (blue), CTA = `theme.colors.accent.main` (terracotta)
  - **Chip, SegmentedButtons**: Follow theme token system
  - **Modal, Portal**: Bottom sheets with warm backgrounds
  - **TextInput**: Blue focus borders `theme.colors.primary.main`, terracotta error borders
  - **Badge**: Status badges using semantic colors from theme
  - **Divider**: Subtle dividers with warm neutral tones

**Theme Integration Pattern**:
```typescript
import { useTheme } from '../hooks/useTheme';

const MyScreen = () => {
  const { theme, responsive } = useTheme();

  return (
    <Button
      buttonColor={theme.colors.primary.main}  // Blue #2563eb
      style={{ padding: responsive.padding() }} // Adaptive padding
    >
      Book Now
    </Button>
  );
};
```

#### 5.3 Responsive Design Integration (Per Redesign Phase 2)
**Critical Fixes Required**:
- ❌ **Remove `SCREEN_WIDTH`** calculations - Use `responsive.getValue(phone, tablet, desktop)`
- ✅ **Time slot grid**: Use `responsive.timeSlotColumns()` - Returns 3/4/5 columns based on device
- ✅ **Date cards**: Use `responsive.getValue(68, 80, 92)` for adaptive sizing
- ✅ **Padding**: Use `responsive.padding()` - Returns 16/24/32px based on device
- ✅ **Safe areas**: Use `responsive.safePadding()` for notch handling

#### 5.4 Animations & Interactions
- Animated scale on button press (1 → 0.95 → 1, 150ms)
- Bottom sheet slide-in animation with fade
- Calendar date selection with subtle scale
- Success checkmark animation on confirmation (terracotta accent)
- Skeleton loaders with warm neutral backgrounds (1.5s pulse)
- Pull-to-refresh with terracotta indicator color

## Critical Files to Modify/Create

### Backend (New/Modified)
1. ✨ `backend/src/routes/services.ts` - NEW
2. ✨ `backend/src/controllers/services.ts` - NEW
3. ✨ `backend/src/models/service.ts` - NEW
4. ✨ `backend/src/routes/appointments.ts` - NEW or enhance existing
5. ✨ `backend/src/controllers/appointments.ts` - NEW
6. 📝 `backend/src/models/appointment.ts` - ENHANCE existing
7. 📝 `backend/src/index.ts` - Register new routes

### Frontend (New/Modified)
1. 📝 `src/screens/VetCompanyDetailScreen.tsx` - MAJOR ENHANCEMENT
2. 📝 `src/components/VetCompanyCard.tsx` - Add navigation
3. 📝 `src/screens/BookAppointmentScreen.tsx` - MAJOR ENHANCEMENT
4. ✨ `src/screens/AppointmentConfirmationScreen.tsx` - NEW
5. 📝 `src/screens/MyAppointmentsScreen.tsx` - ENHANCE
6. ✨ `src/components/ServiceSelectionSheet.tsx` - NEW
7. ✨ `src/components/ServiceCard.tsx` - NEW
8. ✨ `src/components/TimeSlotPicker.tsx` - NEW
9. 📝 `src/services/api.ts` - Add new methods
10. ✨ `src/types/service.types.ts` - NEW
11. ✨ `src/types/appointment.types.ts` - NEW
12. 📝 `src/navigation/AppNavigator.tsx` - Register new screens

### Supporting Files
1. ✅ `src/theme/index.ts` - **USE EXISTING** theme from Redesign.md (warm professional palette)
2. ✅ `src/theme/responsive.ts` - **USE EXISTING** responsive utilities from Redesign Phase 2
3. ✅ `src/hooks/useTheme.ts` - **USE EXISTING** theme hook from Redesign Phase 2
4. ✨ `src/utils/dateHelpers.ts` - Date formatting utilities (NEW)
5. ✨ `src/utils/slotGenerator.ts` - Slot generation logic (NEW)

**⚠️ DO NOT CREATE**: `src/theme/colors.ts` with old purple palette - Theme already exists from Redesign.md!

## Implementation Order

### Sprint 1: Backend Foundation
1. Create service routes, controllers, models
2. Create appointment booking controller with slot logic
3. Test API endpoints with Postman/Thunder Client
4. Verify database queries perform well

### Sprint 2: Company Detail Screen
1. Enhance VetCompanyDetailScreen with tabs
2. Add hero section with photos
3. Add quick info cards
4. Create ServiceCard component
5. Display services grouped by category
6. Add navigation from VetCompanyCard

### Sprint 3: Booking Flow
1. Create ServiceSelectionSheet
2. Enhance BookAppointmentScreen with calendar
3. Create TimeSlotPicker component
4. Integrate slot availability API
5. Implement booking confirmation

### Sprint 4: Appointment Management
1. Create AppointmentConfirmationScreen
2. Enhance MyAppointmentsScreen
3. Add cancellation flow
4. Add calendar export
5. Add directions integration

### Sprint 5: Design System Integration & Testing
1. **Migrate to Redesign.md theme** - Replace all purple colors with blue/terracotta palette
2. **Integrate useTheme() hook** - Remove all hardcoded colors, use theme tokens
3. **Apply responsive utilities** - Remove SCREEN_WIDTH, use responsive.*
4. Add animations and transitions (per Redesign.md Phase 5 specs)
5. Test with Playwright (web) for responsive breakpoints (375px, 768px, 1024px)
6. Handle edge cases and errors with user-friendly messages
7. Add skeleton loaders and empty states (warm neutral backgrounds)

## Code Style Compliance

**MANDATORY PATTERNS** (per CLAUDE.md):
- ✅ Object literals and factory functions (NO ES6 classes)
- ✅ Functional React components with hooks
- ✅ Backend file naming: `services.ts` NOT `services.service.ts`
- ✅ TypeScript interfaces for all data structures
- ✅ Composition over inheritance

## Success Metrics

1. ✅ Users can view full company details with services
2. ✅ Users can select service and see available time slots
3. ✅ Users can book appointments with instant confirmation
4. ✅ Booked slots are blocked for other users
5. ✅ Users can view and manage their appointments
6. ✅ UI matches Material Design 3 guidelines
7. ✅ Smooth animations and transitions
8. ✅ All tests pass (backend + frontend)

---

**Total Estimated Files**: ~25 files (12 new, 13 modified)
**Complexity**: High (full booking system with slot management)
**Timeline**: 4-5 sprints for complete implementation

---

## Design System Migration Guide

### From Purple Theme → Warm Professional (Redesign.md)

**Color Replacements**:
```typescript
// OLD (DEPRECATED)          →  NEW (Redesign.md)
#7c3aed (purple)            →  #2563eb (blue) - Primary buttons, icons
#3b82f6 (blue secondary)    →  #ea580c (terracotta) - CTAs, accents
#f9fafb (light gray bg)     →  #fafaf9 (warm cream) - Backgrounds
#ffffff (white cards)       →  #f5f5f4 (light cream) - Cards
```

**Implementation Checklist**:
- [ ] Import `useTheme()` hook in all appointment screens
- [ ] Replace ALL hardcoded hex colors with `theme.colors.*` tokens
- [ ] Remove `SCREEN_WIDTH` - Use `responsive.getValue()` or `responsive.*` utilities
- [ ] Update all button colors to blue primary or terracotta accent
- [ ] Apply warm neutral backgrounds to all cards and surfaces
- [ ] Update loading indicators to use terracotta color
- [ ] Test responsive layouts at 375px (phone), 768px (tablet), 1024px (desktop)
- [ ] Verify color contrast meets WCAG AA standards (per Redesign Phase 6)

**Files Requiring Migration** (Already implemented with old colors):
1. `src/screens/BookAppointmentScreen.tsx` - 12 purple color instances
2. `src/screens/VetCompanyDetailScreen.tsx` - Purple gradients and icons
3. `src/screens/MyAppointmentsScreen.tsx` - Status badge colors
4. `src/components/ServiceSelectionSheet.tsx` - Purple accents
5. `src/components/VetCompanyCard.tsx` - Purple gradient and badges

**See**: `/docs/Redesign.md` for complete color palette, responsive utilities, and implementation examples.
