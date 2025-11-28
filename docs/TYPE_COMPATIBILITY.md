# Type Compatibility Documentation

## Overview

This document ensures type consistency between frontend (React Native), backend (Express/TypeScript), and database (PostgreSQL) layers.

## Company ID Type Consistency

### Database Schema
```sql
-- companies table
id SERIAL PRIMARY KEY  -- PostgreSQL SERIAL = auto-incrementing integer (number)
```

### Backend Types (`backend/src/types/company.types.ts`)
```typescript
export interface Company {
  id: number;              // ✅ Matches database SERIAL type
  user_id: number;         // ✅ Matches database INTEGER type
  // ... other fields
}

export interface CreateCompanyDTO {
  user_id: number;         // ✅ Consistent with Company.user_id
  // ... other fields
}
```

### Frontend Types (`src/types/company.types.ts`)
```typescript
export interface Company {
  id: number;              // ✅ Matches backend number type
  user_id: number;         // ✅ Matches backend number type
  // ... other fields
}
```

### Navigation Types (`src/types/navigation.types.ts`)
```typescript
export type RootStackParamList = {
  CompanyCreatedSuccess: {
    companyId: number;     // ✅ Matches Company.id type
    companyName: string;
  };
  ClinicDetail: {
    clinicId: number;      // ✅ Matches Company.id type
  };
  BookAppointment: {
    clinicId: number;      // ✅ Matches Company.id type
    clinicName: string;
  };
};
```

## Form Data Type Flow

### Multi-Step Form Pattern

**Type Definition Hierarchy:**
```typescript
// Base Step Interfaces (required fields only)
Step1FormData, Step2FormData, Step3FormData, Step4FormData

// Partial Form Data (during form filling)
CompanyFormData {
  step1: Partial<Step1FormData>;  // Fields optional during editing
  step2: Partial<Step2FormData>;
  step3: Partial<Step3FormData>;
  step4: Partial<Step4FormData>;
}

// Component Props (accept partial data)
Step1BasicInfoProps {
  data: Partial<Step1FormData>;        // ✅ Matches CompanyFormData.step1
  onChange: (data: Partial<Step1FormData>) => void;
  errors?: { [key: string]: string };
}
```

### Why Partial Types for Form Steps?

1. **Progressive Filling**: Users fill forms step-by-step, fields start empty
2. **Validation Points**: Each step validates before moving to next
3. **Type Safety**: TypeScript ensures required fields validated before submission
4. **Flexibility**: Users can go back and modify previous steps

### Data Transformation on Submit

**Frontend Form → Backend DTO:**
```typescript
// CreateCompanyScreen.tsx - handleSubmit()
const companyData: CreateCompanyDTO = {
  // From Step 1 (validated as required)
  name: formData.step1.name!,           // ✅ Non-null assertion after validation
  email: formData.step1.email!,
  phone: formData.step1.phone!,

  // From Step 2 (Romanian → US format transformation)
  address: `${formData.step2.street} ${formData.step2.streetNumber}...`,
  city: formData.step2.city!,
  state: formData.step2.county!,        // County → State
  zip_code: formData.step2.postalCode!, // PostalCode → zip_code

  // From Step 3
  clinic_type: formData.step3.clinic_type!,
  specializations: formData.step3.specializations!,

  // From Step 4
  description: formData.step4.description,
  photos: formData.step4.photos || []
};
```

## Backend → Frontend Data Flow

### API Response Type
```typescript
// Backend returns full Company object
Company {
  id: number;                    // ✅ Database SERIAL
  user_id: number;
  name: string;
  // ... all required fields populated
}

// Frontend receives and stores
const createdCompany: Company = await ApiService.createCompany(companyData);
setCompany(createdCompany);      // Context state updated

// Navigation with typed params
navigation.navigate('CompanyCreatedSuccess', {
  companyId: createdCompany.id,  // ✅ number type
  companyName: createdCompany.name
});
```

## Type Validation Checklist

### ✅ Database Types Match Backend Types
- [x] `id SERIAL` → `id: number`
- [x] `user_id INTEGER` → `user_id: number`
- [x] All enum types defined consistently

### ✅ Backend Types Match Frontend Types
- [x] `Company` interface identical in both layers
- [x] DTOs compatible with form data structures
- [x] Number types used consistently for IDs

### ✅ Navigation Types Match Data Flow
- [x] `companyId: number` matches `Company.id`
- [x] All route params typed correctly
- [x] No `string` → `number` mismatches

### ✅ Form Component Props Match Form State
- [x] All Step components accept `Partial<StepXFormData>`
- [x] `onChange` callbacks accept `Partial<StepXFormData>`
- [x] No type assertion needed in `renderStep()`

## Common Type Errors Fixed

### ❌ Before: Type Mismatch in Navigation
```typescript
// Navigation types expected string
CompanyCreatedSuccess: {
  companyId: string;  // ❌ Wrong - database uses number
}

// But Company.id is number
navigation.navigate('CompanyCreatedSuccess', {
  companyId: createdCompany.id  // ❌ Type error: number → string
});
```

### ✅ After: Consistent Number Types
```typescript
// Navigation types use number
CompanyCreatedSuccess: {
  companyId: number;  // ✅ Matches database/backend
}

// Works correctly
navigation.navigate('CompanyCreatedSuccess', {
  companyId: createdCompany.id  // ✅ number → number
});
```

### ❌ Before: Step Component Type Mismatch
```typescript
// Step component expected full data
Step1BasicInfoProps {
  data: Step1FormData;  // ❌ All fields required
}

// But form state has partial data
CompanyFormData {
  step1: Partial<Step1FormData>;  // ❌ Type error
}
```

### ✅ After: Partial Types for Progressive Forms
```typescript
// Step component accepts partial data
Step1BasicInfoProps {
  data: Partial<Step1FormData>;  // ✅ Fields optional
  onChange: (data: Partial<Step1FormData>) => void;
}

// Form state matches
CompanyFormData {
  step1: Partial<Step1FormData>;  // ✅ No type error
}
```

## Best Practices

### 1. Always Use `number` for Database IDs
```typescript
// ✅ Correct
interface Company {
  id: number;
  user_id: number;
}

// ❌ Wrong
interface Company {
  id: string;  // Database SERIAL is number, not string
}
```

### 2. Use `Partial<T>` for Progressive Forms
```typescript
// ✅ Correct for multi-step forms
formData: {
  step1: Partial<Step1FormData>;  // Fields filled progressively
}

// ❌ Wrong for forms in progress
formData: {
  step1: Step1FormData;  // Would require all fields immediately
}
```

### 3. Validate Before Type Assertions
```typescript
// ✅ Correct - validate then assert
if (!formData.step1.name) {
  throw new Error('Name required');
}
const name: string = formData.step1.name!;  // Safe assertion

// ❌ Wrong - blind assertion
const name: string = formData.step1.name!;  // Might be undefined
```

### 4. Transform Data at API Boundaries
```typescript
// ✅ Correct - transform at submission
const companyData: CreateCompanyDTO = {
  state: formData.step2.county!,  // County → State transformation
  zip_code: formData.step2.postalCode!  // PostalCode → zip_code
};

// ❌ Wrong - store transformed data in form
formData.step2.state = formData.step2.county;  // Confusing data model
```

## Type Safety Guarantees

1. **Database → Backend**: PostgreSQL types enforced by `pg` driver
2. **Backend → Frontend**: TypeScript types validated at compile time
3. **Frontend Forms**: Progressive validation ensures completeness
4. **Navigation**: Typed routes prevent parameter mismatches

## Maintenance Notes

When adding new fields:
1. Update database migration (`.sql` file)
2. Update backend types (`backend/src/types/*.types.ts`)
3. Update frontend types (`src/types/*.types.ts`)
4. Update form step types if needed
5. Update validation logic
6. Run TypeScript compiler to catch mismatches

---

**Last Updated**: 2025-01-27
**Verified By**: Claude Code SuperClaude
