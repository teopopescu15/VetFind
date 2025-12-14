# VetFinder Appointment Booking - Component Architecture

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      VetFinder Application                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User launches app
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        LoginScreen                               │
│  • Email/Password inputs                                         │
│  • Google authentication option                                  │
│  • "Create account" link                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Successful login
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       UserDashboard                              │
│  • List of vet companies (cards)                                 │
│  • Search and filter options                                     │
│  • Map view toggle                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User clicks company card
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  VetCompanyDetailScreen                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  • Company banner/photo                                     │ │
│ │  • Company name, rating, contact                            │ │
│ │  • Description                                              │ │
│ │  • Services grouped by category                             │ │
│ │  • Book Appointment FAB (floating action button)            │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User clicks "Book Appointment"
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               ServiceSelectionSheet (Modal)                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  Header:                                                    │ │
│ │  • Handle bar (drag indicator)                              │ │
│ │  • "Select a Service" title                                 │ │
│ │  • Company name subtitle                                    │ │
│ │  • Close button                                             │ │
│ │                                                             │ │
│ │  Search:                                                    │ │
│ │  • [🔍 Search services...]                                  │ │
│ │                                                             │ │
│ │  Services by Category:                                      │ │
│ │  ┌────────────────────────────────────────────────────┐    │ │
│ │  │ 🩺 Routine Care                                    │    │ │
│ │  │ ┌────────────────────────────────────────────────┐ │    │ │
│ │  │ │ General Checkup          $50-$100  ⏱️ 30 min  │ │    │ │
│ │  │ │ Annual Wellness Exam      $75-$150  ⏱️ 45 min  │ │    │ │
│ │  │ └────────────────────────────────────────────────┘ │    │ │
│ │  └────────────────────────────────────────────────────┘    │ │
│ │  ┌────────────────────────────────────────────────────┐    │ │
│ │  │ 🦷 Dental Care                                     │    │ │
│ │  │ ┌────────────────────────────────────────────────┐ │    │ │
│ │  │ │ Dental Cleaning          $100-$200  ⏱️ 60 min  │ │    │ │
│ │  │ └────────────────────────────────────────────────┘ │    │ │
│ │  └────────────────────────────────────────────────────┘    │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User selects a service
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BookAppointmentScreen                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  Header:                                                    │ │
│ │  🏢 [Company Name]                                          │ │
│ │  Booking Appointment                                        │ │
│ │                                                             │ │
│ │  Selected Service:                                          │ │
│ │  ┌───────────────────────────────────────────────────────┐ │ │
│ │  │ 💼 SELECTED SERVICE                                   │ │ │
│ │  │ General Checkup                                       │ │ │
│ │  │ [⏱️ 30 min] [$50-$100]                                 │ │ │
│ │  └───────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  Select Date:                                               │ │
│ │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │ │
│ │  │Mon │ │Tue │ │Wed │ │Thu │ │Fri │ │Sat │ │Sun │ │Mon │  │ │
│ │  │ 9  │ │ 10 │ │ 11 │ │ 12 │ │ 13 │ │ 14 │ │ 15 │ │ 16 │  │ │
│ │  │ •  │ │ •  │ │    │ │ •  │ │ •  │ │    │ │    │ │ •  │  │ │
│ │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘  │ │
│ │  (• = available)   (scroll horizontally →)                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                              │
│                              │ User selects Dec 9
│                              ▼
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  Available Times - December 9:                              │ │
│ │  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │ │
│ │  │ 9:00 AM  │ │ 10:00 AM │ │ 11:00 AM │                    │ │
│ │  └──────────┘ └──────────┘ └──────────┘                    │ │
│ │  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │ │
│ │  │ 1:00 PM  │ │ 2:00 PM  │ │ 3:00 PM  │                    │ │
│ │  └──────────┘ └──────────┘ └──────────┘                    │ │
│ │  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │ │
│ │  │ 4:00 PM  │ │ 5:00 PM  │ │ 6:00 PM  │                    │ │
│ │  └──────────┘ └──────────┘ └──────────┘                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                              │
│                              │ User selects 2:00 PM
│                              ▼
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  Additional Notes (Optional):                               │ │
│ │  ┌───────────────────────────────────────────────────────┐ │ │
│ │  │ Any special requests or information about your pet... │ │ │
│ │  │                                                       │ │ │
│ │  │                                                       │ │ │
│ │  └───────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  Selected Time: Dec 9 at 2:00 PM  [Confirm Booking] 📅     │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User clicks "Confirm Booking"
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Confirmation Modal (Overlay)                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                        ✅                                    │ │
│ │              Confirm Appointment                             │ │
│ │  ───────────────────────────────────────────────────────────│ │
│ │                                                             │ │
│ │  Company:      Happy Paws Veterinary Clinic                │ │
│ │  Service:      General Checkup                             │ │
│ │  Date & Time:  Mon, December 9                             │ │
│ │                2:00 PM                                      │ │
│ │  Duration:     30 min                                       │ │
│ │  Price:        $50-$100                                     │ │
│ │                                                             │ │
│ │           [Cancel]         [Confirm] 🔄                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User clicks "Confirm"
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Success Alert                               │
│  ✅ Success!                                                     │
│  Your appointment has been confirmed.                            │
│                                                                  │
│  [View Appointments]  [Done]                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User chooses action
                              ▼
                   [View Appointments] or [Back to Detail]
```

---

## Component Hierarchy

```
App
└── NavigationContainer
    ├── AuthStack
    │   ├── LoginScreen
    │   └── RegisterScreen
    │
    └── MainStack (after authentication)
        ├── UserDashboard
        │   └── CompanyCard[] (list)
        │
        ├── VetCompanyDetailScreen
        │   ├── CompanyHeader
        │   ├── ServicesSection
        │   │   └── ServiceCard[]
        │   ├── FAB (Book Appointment)
        │   └── ServiceSelectionSheet (Portal)
        │       ├── SearchBar
        │       └── ServicesByCategory[]
        │           └── ServiceCard[]
        │
        └── BookAppointmentScreen
            ├── HeaderSection
            │   ├── CompanyInfo
            │   └── ServiceCard
            ├── CalendarSection
            │   └── DateCard[] (horizontal scroll)
            ├── TimeSlotsSection
            │   └── TimeSlotChip[] (grid)
            ├── NotesSection
            │   └── TextInput
            ├── BottomActionBar
            │   ├── SummaryText
            │   └── ConfirmButton
            └── ConfirmationModal (Portal)
                ├── AppointmentSummary
                └── ActionButtons
```

---

## Data Flow

### 1. Service Selection Flow

```
VetCompanyDetailScreen
    │
    ├── User clicks "Book Appointment" FAB
    │       │
    │       └── Opens ServiceSelectionSheet
    │               │
    │               ├── Displays services from props
    │               ├── User searches/filters
    │               └── User selects service
    │                       │
    │                       └── onSelectService(service)
    │                               │
    └───────────────────────────────┘
    │
    └── navigation.navigate('BookAppointmentScreen', {
            companyId: number,
            companyName: string,
            service: CompanyService
        })
```

### 2. Appointment Booking Flow

```
BookAppointmentScreen
    │
    ├── useEffect: componentDidMount
    │       │
    │       └── loadAvailableSlots()
    │               │
    │               └── API: GET /api/appointments/available-slots
    │                       │
    │                       └── setAvailableDays(slots)
    │
    ├── User selects date
    │       │
    │       └── handleDateSelect(date)
    │               │
    │               ├── setSelectedDate(date)
    │               ├── setSelectedSlot(null)
    │               └── Render time slots for date
    │
    ├── User selects time slot
    │       │
    │       └── handleSlotSelect(slot)
    │               │
    │               └── setSelectedSlot(slot)
    │                       │
    │                       └── Show notes section
    │                               │
    │                               └── Show bottom action bar
    │
    ├── User clicks "Confirm Booking"
    │       │
    │       └── setShowConfirmModal(true)
    │               │
    │               └── Render ConfirmationModal
    │
    └── User confirms in modal
            │
            └── handleBookAppointment()
                    │
                    └── API: POST /api/appointments
                            │
                            ├── Success
                            │   │
                            │   └── Alert: "Success!"
                            │       │
                            │       └── Navigate to MyAppointments or Back
                            │
                            └── Error
                                │
                                └── Alert: Error message
```

---

## API Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Components                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ ApiService
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API Endpoints                       │
│                                                                  │
│  GET /api/appointments/available-slots                           │
│    Query: companyId, serviceId, startDate, endDate              │
│    Returns: DayAvailability[]                                    │
│                                                                  │
│  POST /api/appointments                                          │
│    Body: { clinic_id, service_id, appointment_date, notes }     │
│    Returns: Appointment                                          │
│                                                                  │
│  GET /api/companies/:id                                          │
│    Returns: Company with services[]                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                         │
│                                                                  │
│  Tables:                                                         │
│  • users                                                         │
│  • companies                                                     │
│  • services                                                      │
│  • opening_hours                                                 │
│  • appointments                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Management

### BookAppointmentScreen State

```typescript
// Date/Time Selection
selectedDate: Date | null
selectedSlot: TimeSlot | null
availableDays: DayAvailability[]
calendarDates: Date[]

// UI State
loading: boolean
showConfirmModal: boolean

// User Input
notes: string

// Computed State (from functions)
slots = getSlotsForSelectedDate()
hasAvailableSlots = (date: Date) => boolean
```

### ServiceSelectionSheet State

```typescript
// Search
searchQuery: string

// Computed State (useMemo)
filteredServices = useMemo(() => {
  // Filter by searchQuery
}, [services, searchQuery])

groupedServices = groupServicesByCategory(filteredServices)
```

---

## Type Safety

### TypeScript Interfaces

```typescript
// Component Props
interface BookAppointmentScreenProps {
  route: {
    params: {
      companyId: number;
      companyName: string;
      service: CompanyService;
    }
  };
  navigation: NavigationProp;
}

// Data Types
interface CompanyService {
  id: number;
  service_name: string;
  description?: string;
  price_min: number;
  price_max: number;
  duration_minutes?: number;
  category?: ServiceCategoryType;
}

interface TimeSlot {
  time: string;           // "14:00"
  datetime: string;       // "2025-12-09T14:00:00Z"
  available: boolean;
}

interface DayAvailability {
  date: string;           // "2025-12-09"
  slots: TimeSlot[];
}

// API Request/Response
interface CreateAppointmentDTO {
  clinic_id: number;
  service_id: number;
  appointment_date: string;
  notes?: string;
}
```

---

## Styling Architecture

### Theme Colors

```typescript
const theme = {
  primary: '#7c3aed',        // Purple
  background: '#f9fafb',     // Light gray
  surface: '#ffffff',        // White
  textPrimary: '#1f2937',    // Dark gray
  textSecondary: '#6b7280',  // Medium gray
  success: '#10b981',        // Green
  disabled: '#d1d5db',       // Light gray
  border: '#e5e7eb',         // Border gray
};
```

### Component Styling Pattern

```typescript
const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  // Sections
  section: {
    padding: 20,
  },

  // Interactive Elements
  dateCard: {
    width: 60,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.surface,
    borderWidth: 2,
    borderColor: theme.border,
  },

  dateCardSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },

  // Typography
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
  },
});
```

---

## Performance Optimizations

### Implemented

1. **useMemo for filtering:**
   ```typescript
   const filteredServices = useMemo(() => {
     // Expensive filter operation
   }, [services, searchQuery]);
   ```

2. **StyleSheet.create for styles:**
   ```typescript
   const styles = StyleSheet.create({
     // Styles compiled once
   });
   ```

3. **Conditional rendering:**
   ```typescript
   {selectedDate && (
     <TimeSlotsSection />
   )}
   ```

4. **Efficient list rendering:**
   ```typescript
   {calendarDates.map((date, index) => (
     <DateCard key={index} />
   ))}
   ```

### Recommended

1. **React.memo for components:**
   ```typescript
   export const DateCard = React.memo(({ date, onSelect }) => {
     // Component
   });
   ```

2. **useCallback for handlers:**
   ```typescript
   const handleDateSelect = useCallback((date: Date) => {
     // Handler
   }, []);
   ```

3. **Virtualized lists for long service lists:**
   ```typescript
   <FlatList
     data={services}
     renderItem={renderServiceCard}
     keyExtractor={(item) => item.id.toString()}
   />
   ```

---

## Error Handling Strategy

```
User Action
    │
    ├── Optimistic UI Update (immediate)
    │
    └── API Call
            │
            ├── Success
            │   │
            │   └── Confirm UI Update
            │       └── Show Success Message
            │
            └── Error
                │
                ├── Revert UI Update
                ├── Log to Console
                └── Show User-Friendly Alert
                    │
                    └── Offer Retry Option
```

### Example

```typescript
try {
  setLoading(true);
  const result = await ApiService.createAppointment(data);

  // Success
  Alert.alert('Success!', 'Your appointment has been confirmed.');
  navigation.navigate('MyAppointments');

} catch (error: any) {
  console.error('Booking error:', error);

  Alert.alert(
    'Error',
    error.message || 'Failed to book appointment. Please try again.'
  );
} finally {
  setLoading(false);
}
```

---

## Testing Strategy

### Unit Tests (Recommended)

```typescript
// Helper functions
describe('formatDate', () => {
  it('should format date as YYYY-MM-DD', () => {
    expect(formatDate(new Date('2025-12-09'))).toBe('2025-12-09');
  });
});

// Components
describe('BookAppointmentScreen', () => {
  it('should render calendar dates', () => {
    // Test
  });
});
```

### Integration Tests (Playwright)

```typescript
test('Complete booking flow', async ({ page }) => {
  // 1. Login
  // 2. Select company
  // 3. Select service
  // 4. Select date and time
  // 5. Confirm booking
  // 6. Verify success
});
```

---

## Deployment Checklist

### Frontend
- ✅ Build for web: `npm run web`
- ✅ Environment variables configured
- ✅ API endpoints point to production
- ✅ Error tracking enabled (e.g., Sentry)

### Backend
- ✅ Database migrations run
- ✅ Seed data created (test companies, services)
- ✅ API endpoints tested
- ✅ CORS configured for frontend domain
- ✅ Rate limiting enabled
- ✅ Logging configured

### Testing
- ✅ Run Playwright tests
- ✅ Manual QA testing
- ✅ Cross-browser testing
- ✅ Mobile responsive testing
- ✅ Accessibility testing

---

**Architecture documented:** December 9, 2025
**Phase:** Phase 3 - Appointment Booking
**Status:** ✅ Implementation Complete
