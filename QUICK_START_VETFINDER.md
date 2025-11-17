# VetFinder Quick Start Guide

## Prerequisites
- PostgreSQL database running
- Node.js and npm installed
- Expo CLI installed globally

## Setup Steps

### 1. Database Setup

```sql
-- Connect to your PostgreSQL database
psql -U postgres

-- Execute the VetFinder migration
\i backend/src/migrations/005_create_vetfinder_tables.sql

-- Verify tables were created
\dt
```

Expected tables:
- `clinics`
- `services`
- `reviews`
- `appointments`

### 2. Add Sample Data (Optional)

```sql
-- Insert a sample clinic
INSERT INTO clinics (owner_id, name, description, address, city, state, zip_code, phone, email, latitude, longitude)
VALUES (
  1,  -- Use your user ID
  'Happy Paws Veterinary Clinic',
  'Professional veterinary care for dogs and cats',
  '123 Main Street',
  'San Francisco',
  'CA',
  '94102',
  '415-555-0123',
  'info@happypaws.com',
  37.7749,
  -122.4194
);

-- Insert services for the clinic
INSERT INTO services (clinic_id, name, description, price, duration_minutes)
VALUES
  (1, 'General Checkup', 'Routine health examination', 75.00, 30),
  (1, 'Vaccination', 'Core vaccinations for pets', 50.00, 15),
  (1, 'Dental Cleaning', 'Professional teeth cleaning', 150.00, 60),
  (1, 'Emergency Care', '24/7 emergency veterinary services', 200.00, null);

-- Add a sample review
INSERT INTO reviews (clinic_id, user_id, rating, comment)
VALUES (1, 1, 5, 'Excellent service! The staff was very caring and professional.');
```

### 3. Start Backend

```bash
cd backend
npm run dev
```

Backend should start on: http://localhost:5000

Verify with: http://localhost:5000/health

### 4. Start Frontend

#### For Web Testing:
```bash
npm run web
```

Frontend will open in browser: http://localhost:8082

#### For Mobile Testing:
```bash
# Android
npm run android

# iOS
npm run ios

# Or use tunnel for testing on physical device
npm run mobile
```

## User Journey

### 1. Login
- Email: (your registered email)
- Password: (your password)

### 2. Access VetFinder
Dashboard → Click "🏥 Find Clinics" button

### 3. Browse Clinics
- View all clinics in the list
- Search by city name
- (Mobile only) Click "📍 Nearby" for GPS-based search
- View clinic ratings and distances

### 4. View Clinic Details
- Click any clinic card
- Switch between "Services" and "Reviews" tabs
- See clinic contact information
- Read user reviews and ratings

### 5. Book Appointment
- Click "Book This Service" on a specific service
- OR click "Book General Appointment" for non-specific booking
- Fill in the form:
  - **Date**: YYYY-MM-DD format (e.g., 2025-11-20)
  - **Time**: HH:MM format in 24-hour (e.g., 14:30 for 2:30 PM)
  - **Notes**: Optional additional information
- Click "Book Appointment"
- You'll be redirected to "My Appointments"

### 6. Manage Appointments
Dashboard → Click "📅 My Appointments" button

#### Filter Options:
- **Upcoming**: Future appointments only
- **Past**: Historical appointments
- **All**: Complete appointment history

#### Actions:
- View appointment details
- Cancel appointments (if pending/confirmed)
- See appointment status (Pending, Confirmed, Cancelled, Completed)

## Testing Checklist

### ✅ Web Platform Testing
1. [ ] Login successfully
2. [ ] Navigate to VetFinder Home
3. [ ] View clinic list
4. [ ] Search clinics by city
5. [ ] Verify "Nearby" button is disabled with web warning
6. [ ] View clinic details
7. [ ] Switch between Services and Reviews tabs
8. [ ] Book an appointment
9. [ ] Navigate to My Appointments
10. [ ] View appointment details
11. [ ] Filter appointments (Upcoming/Past/All)
12. [ ] Cancel an appointment

### ✅ Mobile Platform Testing
All web tests PLUS:
13. [ ] Test GPS-based nearby search
14. [ ] Verify location permissions prompt
15. [ ] Test native scrolling and gestures
16. [ ] Test on both iOS and Android

## API Testing with Postman

### Get All Clinics
```
GET http://localhost:5000/api/vet/clinics
```

### Get Nearby Clinics
```
GET http://localhost:5000/api/vet/clinics/nearby?latitude=37.7749&longitude=-122.4194&radius=10
```

### Search by City
```
GET http://localhost:5000/api/vet/clinics/city/San Francisco
```

### Get Clinic Details
```
GET http://localhost:5000/api/vet/clinics/1
```

### Get Services
```
GET http://localhost:5000/api/vet/clinics/1/services
```

### Get Reviews
```
GET http://localhost:5000/api/vet/clinics/1/reviews
```

### Create Appointment (Requires Auth Token)
```
POST http://localhost:5000/api/vet/appointments
Headers:
  Authorization: Bearer <your_token>
  Content-Type: application/json

Body:
{
  "clinic_id": 1,
  "service_id": 1,
  "appointment_date": "2025-11-20T14:30:00",
  "notes": "First time visit with my dog"
}
```

## Common Issues & Solutions

### Issue: "Nearby" button not working
**Solution**: This is expected on web platform. Use city search instead or test on mobile device.

### Issue: Backend connection failed
**Solution**:
1. Check backend is running: http://localhost:5000/health
2. Verify API base URL in `config/api.config.ts`
3. Check console for CORS errors

### Issue: Database connection error
**Solution**:
1. Verify PostgreSQL is running
2. Check `.env` file in backend folder
3. Verify database credentials are correct

### Issue: Clinics not showing
**Solution**:
1. Check if database tables were created
2. Verify sample data was inserted
3. Check browser/app console for errors

### Issue: Appointment booking fails
**Solution**:
1. Verify you're logged in (check auth token)
2. Use correct date/time format:
   - Date: YYYY-MM-DD
   - Time: HH:MM (24-hour format)
3. Check backend logs for validation errors

## Feature Availability Matrix

| Feature | Web | Mobile (iOS/Android) |
|---------|-----|---------------------|
| Browse Clinics | ✅ | ✅ |
| Search by City | ✅ | ✅ |
| GPS Nearby Search | ❌ | ✅ |
| View Clinic Details | ✅ | ✅ |
| Read Reviews | ✅ | ✅ |
| Book Appointments | ✅ | ✅ |
| Manage Appointments | ✅ | ✅ |
| Cancel Appointments | ✅ | ✅ |
| Image Upload | ❌ | 🔄 (Future) |

Legend:
- ✅ Fully Working
- ❌ Not Available
- 🔄 Planned/In Development

## Support & Troubleshooting

### Check Logs
```bash
# Backend logs
cd backend && npm run dev
# Watch for API request logs and errors

# Frontend logs
# Open browser console (F12)
# Or React Native debugger for mobile
```

### Database Queries
```sql
-- Check if clinics exist
SELECT COUNT(*) FROM clinics;

-- Check appointments
SELECT * FROM appointments WHERE user_id = YOUR_USER_ID;

-- View clinic with ratings
SELECT c.*,
       AVG(r.rating) as avg_rating,
       COUNT(r.id) as review_count
FROM clinics c
LEFT JOIN reviews r ON c.id = r.clinic_id
GROUP BY c.id;
```

### Reset Data (if needed)
```sql
-- Clear all appointments
TRUNCATE appointments CASCADE;

-- Clear all reviews
TRUNCATE reviews CASCADE;

-- Clear all services
TRUNCATE services CASCADE;

-- Clear all clinics
TRUNCATE clinics CASCADE;
```

## Next Steps

After successfully testing:
1. Add more sample clinics and services
2. Test different user roles (clinic owners vs pet owners)
3. Customize UI colors and branding
4. Add more clinics in different cities
5. Implement additional features (image upload, map view, etc.)

---

**Happy Testing! 🐾**
