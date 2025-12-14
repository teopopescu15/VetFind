# VetFinder API Documentation - Appointment Booking Feature

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Company Services API

### Get Company Services
Retrieve all active services for a specific company.

**Endpoint**: `GET /companies/:companyId/services`

**Authentication**: None (Public)

**URL Parameters**:
- `companyId` (number, required) - Company ID

**Query Parameters**:
- `category` (string, optional) - Filter by service category
  - `routine_care`
  - `dental_care`
  - `diagnostic_services`
  - `emergency_care`
  - `surgical_procedures`
  - `grooming`
  - `custom`

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 5,
      "category": "routine_care",
      "service_name": "General Checkup",
      "description": "Comprehensive health examination for your pet",
      "price_min": 30.00,
      "price_max": 50.00,
      "duration_minutes": 30,
      "is_custom": false,
      "is_active": true,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    },
    {
      "id": 2,
      "company_id": 5,
      "category": "dental_care",
      "service_name": "Dental Cleaning",
      "description": "Professional teeth cleaning and oral health check",
      "price_min": 80.00,
      "price_max": 120.00,
      "duration_minutes": 60,
      "is_custom": false,
      "is_active": true,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `404 Not Found` - Company not found
```json
{
  "success": false,
  "message": "Company not found"
}
```

---

### Get Service by ID
Retrieve details of a specific service.

**Endpoint**: `GET /services/:id`

**Authentication**: None (Public)

**URL Parameters**:
- `id` (number, required) - Service ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "company_id": 5,
    "category": "routine_care",
    "service_name": "General Checkup",
    "description": "Comprehensive health examination for your pet",
    "price_min": 30.00,
    "price_max": 50.00,
    "duration_minutes": 30,
    "is_custom": false,
    "is_active": true,
    "company": {
      "id": 5,
      "name": "Happy Paws Veterinary Clinic",
      "email": "info@happypaws.com",
      "phone": "+40 123 456 789"
    }
  }
}
```

**Error Responses**:
- `404 Not Found` - Service not found

---

## Appointments API

### Get Available Slots
Retrieve available appointment slots for a service.

**Endpoint**: `GET /appointments/availability/:companyId/:serviceId`

**Authentication**: Optional (better UX when authenticated)

**URL Parameters**:
- `companyId` (number, required) - Company ID
- `serviceId` (number, required) - Service ID

**Query Parameters**:
- `startDate` (string, required) - Start date (YYYY-MM-DD)
- `endDate` (string, required) - End date (YYYY-MM-DD)

**Example Request**:
```
GET /appointments/availability/5/1?startDate=2025-01-20&endDate=2025-01-27
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "service": {
      "id": 1,
      "service_name": "General Checkup",
      "duration_minutes": 30
    },
    "slots": [
      {
        "date": "2025-01-20",
        "dayName": "Monday",
        "isOpen": true,
        "slots": [
          {
            "time": "09:00",
            "datetime": "2025-01-20T09:00:00Z",
            "available": true
          },
          {
            "time": "09:30",
            "datetime": "2025-01-20T09:30:00Z",
            "available": true
          },
          {
            "time": "10:00",
            "datetime": "2025-01-20T10:00:00Z",
            "available": false
          },
          {
            "time": "10:30",
            "datetime": "2025-01-20T10:30:00Z",
            "available": true
          }
        ]
      },
      {
        "date": "2025-01-21",
        "dayName": "Tuesday",
        "isOpen": true,
        "slots": [...]
      },
      {
        "date": "2025-01-22",
        "dayName": "Sunday",
        "isOpen": false,
        "slots": []
      }
    ]
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid date range
- `404 Not Found` - Company or service not found

---

### Create Appointment
Book a new appointment (instant confirmation).

**Endpoint**: `POST /appointments`

**Authentication**: Required

**Request Body**:
```json
{
  "clinic_id": 5,
  "service_id": 1,
  "appointment_date": "2025-01-20T09:00:00Z",
  "notes": "My dog has been coughing lately"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Appointment confirmed successfully",
  "data": {
    "id": 42,
    "clinic_id": 5,
    "user_id": 10,
    "service_id": 1,
    "appointment_date": "2025-01-20T09:00:00Z",
    "status": "confirmed",
    "notes": "My dog has been coughing lately",
    "created_at": "2025-01-15T14:30:00Z",
    "company": {
      "id": 5,
      "name": "Happy Paws Veterinary Clinic",
      "address": "Strada Mihai Viteazu 15",
      "city": "Cluj-Napoca",
      "phone": "+40 123 456 789",
      "logo_url": "https://example.com/logo.jpg"
    },
    "service": {
      "id": 1,
      "service_name": "General Checkup",
      "duration_minutes": 30,
      "price_min": 30.00,
      "price_max": 50.00
    }
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid data or slot already occupied
```json
{
  "success": false,
  "message": "This time slot is no longer available"
}
```
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Company or service not found

---

### Get User Appointments
Retrieve all appointments for the authenticated user.

**Endpoint**: `GET /appointments/user`

**Authentication**: Required

**Query Parameters**:
- `status` (string, optional) - Filter by status
  - `confirmed`
  - `cancelled`
  - `completed`
- `upcoming` (boolean, optional) - Only future appointments (default: false)
- `past` (boolean, optional) - Only past appointments (default: false)

**Example Request**:
```
GET /appointments/user?upcoming=true
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "clinic_id": 5,
      "user_id": 10,
      "service_id": 1,
      "appointment_date": "2025-01-20T09:00:00Z",
      "status": "confirmed",
      "notes": "My dog has been coughing lately",
      "created_at": "2025-01-15T14:30:00Z",
      "company": {
        "id": 5,
        "name": "Happy Paws Veterinary Clinic",
        "address": "Strada Mihai Viteazu 15",
        "city": "Cluj-Napoca",
        "phone": "+40 123 456 789",
        "logo_url": "https://example.com/logo.jpg",
        "latitude": 46.7712,
        "longitude": 23.6236
      },
      "service": {
        "id": 1,
        "service_name": "General Checkup",
        "duration_minutes": 30,
        "price_min": 30.00,
        "price_max": 50.00,
        "category": "routine_care"
      }
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized` - Not authenticated

---

### Cancel Appointment
Cancel an existing appointment.

**Endpoint**: `PATCH /appointments/:id/cancel`

**Authentication**: Required

**URL Parameters**:
- `id` (number, required) - Appointment ID

**Request Body** (optional):
```json
{
  "cancellation_reason": "Emergency came up, need to reschedule"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "id": 42,
    "status": "cancelled",
    "updated_at": "2025-01-16T10:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Cannot cancel past appointments
```json
{
  "success": false,
  "message": "Cannot cancel past appointments"
}
```
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not your appointment
```json
{
  "success": false,
  "message": "You can only cancel your own appointments"
}
```
- `404 Not Found` - Appointment not found

---

## Slot Availability Algorithm

### How Slots Are Generated

1. **Fetch Service Duration**:
   - Get `duration_minutes` from service (e.g., 30 minutes)

2. **Fetch Company Opening Hours**:
   - Get opening hours for each day from company data
   - Example: Monday 09:00-17:00, Sunday closed

3. **Generate Time Slots**:
   - For each day in the requested range:
     - Check if company is open on that day
     - Generate slots from opening to closing time with service duration intervals
     - Example: 30-min service → slots at 09:00, 09:30, 10:00, ..., 16:30

4. **Fetch Occupied Slots**:
   - Query appointments table for the company and date range
   - Mark slots as unavailable where appointments exist
   - Account for appointment duration (30-min appointment at 10:00 blocks 10:00-10:30)

5. **Return Available Slots**:
   - Return array with all slots marked as available/unavailable

### Edge Cases Handled

- **Company Closed**: Return `isOpen: false` for that day
- **Past Dates**: Automatically exclude past dates/times
- **Overlapping Appointments**: Block all slots within appointment duration
- **Service Duration Overflow**: Don't create slot if service extends past closing time
- **Time Zone**: All times stored in UTC, converted for display

---

## Error Handling

All API errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional: validation errors array
}
```

### HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., slot already booked)
- `500 Internal Server Error` - Server error

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

---

## Testing Endpoints

Use these tools to test the API:
- **Postman**: Import collection from `docs/postman_collection.json`
- **Thunder Client**: VS Code extension
- **curl**: Command-line testing

Example curl request:
```bash
# Get company services
curl http://localhost:5000/api/companies/5/services

# Create appointment (authenticated)
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "clinic_id": 5,
    "service_id": 1,
    "appointment_date": "2025-01-20T09:00:00Z",
    "notes": "First visit"
  }'
```
