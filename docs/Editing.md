# Multi-Phase Implementation Plan: Company Dashboard Profile Editor

## Overview
Add inline profile editing to CompanyDashboardScreen with two key improvements:
1. **Filter categories** - Show only categories where the company has created services
2. **Edit profile form** - Full-screen overlay form for editing company information

**Total Estimated Duration:** 2-3 weeks
**Key Files:** `/src/screens/CompanyDashboardScreen.tsx`, `/src/components/CompanyProfileEditForm.tsx`
**Testing Framework:** Playwright MCP for all E2E tests

---

## Editable Fields in Profile Form

### Basic Information
- ✅ **Name** (required, text input with delete icon)
- ✅ **Email** (required, email input with delete icon)
- ✅ **Phone** (required, phone input with delete icon)
- ✅ **Website** (optional, URL input with delete icon)
- ✅ **Description** (optional, multiline textarea with delete icon)

### Address
- ✅ **Street Address** (required, text input with delete icon)
- ✅ **City** (required, text input with delete icon)
- ✅ **State/County** (required, text input with delete icon)
- ✅ **Zip Code** (required, text input with delete icon)

### Business Details
- ✅ **Clinic Type** (required, dropdown: general_practice, emergency_care, specialized_care, mobile_vet, emergency_24_7)
- ✅ **Years in Business** (optional, number input with delete icon)
- ✅ **Number of Veterinarians** (optional, number input with delete icon)

### Services & Amenities
- ✅ **Facilities** (optional, multi-select checkboxes: emergency_24_7, in_house_lab, surgery_room, isolation_ward, grooming_station, pharmacy, parking, wheelchair_accessible, pickup_dropoff)
- ✅ **Payment Methods** (optional, multi-select checkboxes: cash, credit_card, debit_card, mobile_payment, pet_insurance)

### NOT Included in Edit Form (managed elsewhere)
- ❌ **Logo** - Managed via "Add Photos" button
- ❌ **Photos** - Managed via "Add Photos" button
- ❌ **Business Hours** - Keep on main dashboard (too complex for this form)
- ❌ **Specializations** - Keep on main dashboard (managed via services)

---

## Phase 1: Filter Categories to Show Only Company's Services

### Objective
Modify the CompanyDashboardScreen to display only service categories where the company has created actual services, instead of showing all available categories from the database.

### What Changes
**Before:** Dashboard shows all 6 categories (Routine Care, Dental Care, Diagnostic Services, etc.) even if the company has no services in those categories.

**After:** Dashboard shows only categories where the company has at least one service. If the company has no services, show an empty state message.

### Implementation Steps

1. **Update `loadCategories` function in CompanyDashboardScreen.tsx**
   - After fetching all categories from API, cross-reference with company services
   - Filter categories array to include only those with matching services
   - Update state with filtered categories

2. **Update service count display**
   - Count only services that match filtered categories
   - Update "Total Services" chip to show accurate count

3. **Add empty state**
   - Show message when company has zero services
   - Include helpful CTA to navigate to "Manage Services"

### Files to Modify
- `/src/screens/CompanyDashboardScreen.tsx` (lines 116-131, 391-421)

### Playwright Test Cases

```typescript
// File: e2e/companyDashboard.spec.ts

test.describe('Phase 1: Category Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.fill('[data-testid="email-input"]', 'vetcompany.test@example.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForSelector('[data-testid="company-dashboard"]');
  });

  test('TC1.1: Should show only categories with company services', async ({ page }) => {
    // Setup: Company has services in 2 categories only
    const categoryCards = page.locator('[data-testid="category-card"]');
    const count = await categoryCards.count();

    // Verify: Only 2 categories displayed (not all 6)
    expect(count).toBe(2);

    // Verify: Category names match company's services
    await expect(categoryCards.nth(0)).toContainText('Routine Care');
    await expect(categoryCards.nth(1)).toContainText('Dental Care');
  });

  test('TC1.2: Should display accurate service count', async ({ page }) => {
    // Company has 5 services total
    const serviceCountChip = page.locator('[data-testid="total-services-chip"]');

    await expect(serviceCountChip).toContainText('5 Total Services');
  });

  test('TC1.3: Should show empty state when no services exist', async ({ page }) => {
    // Setup: Login as company with no services
    // (requires separate test user or database reset)

    const emptyState = page.locator('[data-testid="no-services-message"]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No services created yet');

    // Verify: CTA button to create services
    const createServicesButton = page.locator('text=Manage Services');
    await expect(createServicesButton).toBeVisible();
  });

  test('TC1.4: Should maintain backward compatibility with legacy specializations', async ({ page }) => {
    // Verify legacy specializations array still displays
    const legacySection = page.locator('[data-testid="legacy-specializations"]');
    await expect(legacySection).toBeVisible();
    await expect(legacySection).toContainText('dogs');
    await expect(legacySection).toContainText('cats');
  });

  test('TC1.5: Should handle loading states correctly', async ({ page }) => {
    // Verify loading indicator appears initially
    const loadingIndicator = page.locator('[data-testid="categories-loading"]');
    await expect(loadingIndicator).toBeVisible();

    // Wait for categories to load
    await page.waitForSelector('[data-testid="category-card"]', { timeout: 5000 });

    // Verify loading indicator disappears
    await expect(loadingIndicator).not.toBeVisible();
  });
});
```

### Acceptance Criteria
- ✅ Only categories with company services are displayed
- ✅ "Total Services" count is accurate
- ✅ Empty state appears when no services exist
- ✅ Loading states work properly
- ✅ Backward compatibility with legacy specializations maintained
- ✅ All Playwright tests pass

### Dependencies
None (standalone phase)

---

## Phase 2: Create Full-Screen Edit Profile Form Component

### Objective
Create a reusable CompanyProfileEditForm component that displays as a full-screen overlay/modal when "Edit Profile" is clicked.

### What It Does
- Shows as a full-screen modal overlay
- Displays all editable company fields
- Each field has a delete icon (X) to clear the value
- Has Save and Cancel buttons
- Validates required fields on save
- Shows validation errors inline
- Handles API calls and error states

### Form UI Structure

```
┌─────────────────────────────────────┐
│  Edit Company Profile          [X]  │  <- Header with close button
├─────────────────────────────────────┤
│                                     │
│  Basic Information                  │
│  ─────────────────                  │
│  Name           [value...]  [🗑️]    │  <- Delete icon clears field
│  Email          [value...]  [🗑️]    │
│  Phone          [value...]  [🗑️]    │
│  Website        [value...]  [🗑️]    │
│  Description    [textarea]  [🗑️]    │
│                                     │
│  Address                            │
│  ───────                            │
│  Street         [value...]  [🗑️]    │
│  City           [value...]  [🗑️]    │
│  State/County   [value...]  [🗑️]    │
│  Zip Code       [value...]  [🗑️]    │
│                                     │
│  Business Details                   │
│  ────────────────                   │
│  Clinic Type    [dropdown]          │
│  Years in Business  [number] [🗑️]   │
│  Num Veterinarians [number]  [🗑️]   │
│                                     │
│  Services & Amenities               │
│  ───────────────────                │
│  Facilities      ☐ emergency_24_7   │
│                  ☐ in_house_lab     │
│                  ☐ surgery_room     │
│                  ...                │
│                                     │
│  Payment Methods ☐ cash             │
│                  ☐ credit_card      │
│                  ☐ debit_card       │
│                  ...                │
│                                     │
├─────────────────────────────────────┤
│          [Cancel]    [Save]         │  <- Action buttons
└─────────────────────────────────────┘
```

### Implementation Steps

1. **Create CompanyProfileEditForm.tsx component**
   - File: `/src/components/CompanyProfileEditForm.tsx`
   - Props: `{ company: Company, onSave: (data) => void, onCancel: () => void, isVisible: boolean }`
   - Use React Native Modal for full-screen overlay
   - Use ScrollView for scrollable content

2. **Implement form state management**
   ```typescript
   const [formData, setFormData] = useState<Company>(company);
   const [errors, setErrors] = useState<Record<string, string>>({});
   const [isSaving, setIsSaving] = useState(false);
   ```

3. **Create field components with delete icons**
   - TextInput with delete icon button
   - Each field updates formData on change
   - Delete icon clears the field value
   - Show error message below field if validation fails

4. **Add validation logic**
   - Create validation object (object literal, NO classes)
   - Required fields: name, email, phone, address, city, state, zip_code, clinic_type
   - Email format validation
   - Phone format validation
   - URL validation for website

5. **Implement save/cancel handlers**
   - Cancel: Close modal without saving
   - Save: Validate → API call → Success/Error handling → Close modal

6. **Integrate with CompanyDashboardScreen**
   - Add state: `const [isEditFormVisible, setIsEditFormVisible] = useState(false)`
   - Update "Edit Profile" button to set state to true
   - Render CompanyProfileEditForm conditionally

### Files to Create
- `/src/components/CompanyProfileEditForm.tsx` (new component)

### Files to Modify
- `/src/screens/CompanyDashboardScreen.tsx` (integrate form)

### Playwright Test Cases

```typescript
// File: e2e/companyProfileEdit.spec.ts

test.describe('Phase 2: Edit Profile Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.fill('[data-testid="email-input"]', 'vetcompany.test@example.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForSelector('[data-testid="company-dashboard"]');
  });

  test('TC2.1: Should open edit profile form when clicking Edit Profile', async ({ page }) => {
    // Click Edit Profile button
    await page.click('[data-testid="edit-profile-button"]');

    // Verify form is visible
    const editForm = page.locator('[data-testid="company-profile-edit-form"]');
    await expect(editForm).toBeVisible();

    // Verify form header
    await expect(page.locator('text=Edit Company Profile')).toBeVisible();
  });

  test('TC2.2: Should display all editable fields with current values', async ({ page }) => {
    await page.click('[data-testid="edit-profile-button"]');

    // Verify all fields are present and populated
    const nameInput = page.locator('[data-testid="edit-name"]');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue(/\w+/); // Has some value

    const emailInput = page.locator('[data-testid="edit-email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveValue(/\S+@\S+\.\S+/); // Email format

    // Continue for all fields...
  });

  test('TC2.3: Should show delete icon next to each field', async ({ page }) => {
    await page.click('[data-testid="edit-profile-button"]');

    // Verify delete icons exist
    const deleteIcons = page.locator('[data-testid^="delete-icon-"]');
    const count = await deleteIcons.count();

    // Should have delete icons for all clearable fields
    expect(count).toBeGreaterThan(10);
  });

  test('TC2.4: Should clear field value when delete icon clicked', async ({ page }) => {
    await page.click('[data-testid="edit-profile-button"]');

    // Get initial value
    const websiteInput = page.locator('[data-testid="edit-website"]');
    const initialValue = await websiteInput.inputValue();
    expect(initialValue).toBeTruthy();

    // Click delete icon
    await page.click('[data-testid="delete-icon-website"]');

    // Verify field is cleared
    await expect(websiteInput).toHaveValue('');
  });

  test('TC2.5: Should close form when Cancel clicked without saving', async ({ page }) => {
    await page.click('[data-testid="edit-profile-button"]');

    // Edit a field
    await page.fill('[data-testid="edit-name"]', 'Temporary Name');

    // Click Cancel
    await page.click('[data-testid="cancel-button"]');

    // Verify form closed
    const editForm = page.locator('[data-testid="company-profile-edit-form"]');
    await expect(editForm).not.toBeVisible();

    // Verify change not saved (company name unchanged)
    const companyName = page.locator('[data-testid="company-name"]');
    await expect(companyName).not.toContainText('Temporary Name');
  });

  test('TC2.6: Should validate required fields before saving', async ({ page }) => {
    await page.click('[data-testid="edit-profile-button"]');

    // Clear required field (name)
    await page.click('[data-testid="delete-icon-name"]');

    // Attempt save
    await page.click('[data-testid="save-button"]');

    // Verify validation error appears
    const errorMessage = page.locator('[data-testid="error-name"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/name is required/i);

    // Verify form still open (didn't save)
    const editForm = page.locator('[data-testid="company-profile-edit-form"]');
    await expect(editForm).toBeVisible();
  });

  test('TC2.7: Should validate email format', async ({ page }) => {
    await page.click('[data-testid="edit-profile-button"]');

    // Enter invalid email
    await page.fill('[data-testid="edit-email"]', 'invalid-email');

    // Attempt save
    await page.click('[data-testid="save-button"]');

    // Verify validation error
    const errorMessage = page.locator('[data-testid="error-email"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/invalid email format/i);
  });

  test('TC2.8: Should validate website URL format', async ({ page }) => {
    await page.click('[data-testid="edit-profile-button"]');

    // Enter invalid URL
    await page.fill('[data-testid="edit-website"]', 'not-a-url');

    // Attempt save
    await page.click('[data-testid="save-button"]');

    // Verify validation error
    const errorMessage = page.locator('[data-testid="error-website"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/invalid URL/i);
  });

  test('TC2.9: Should show loading state while saving', async ({ page }) => {
    await page.click('[data-testid="edit-profile-button"]');

    // Make a change
    await page.fill('[data-testid="edit-description"]', 'Updated description');

    // Click save
    await page.click('[data-testid="save-button"]');

    // Verify loading indicator appears
    const loadingIndicator = page.locator('[data-testid="saving-indicator"]');
    await expect(loadingIndicator).toBeVisible();

    // Wait for save to complete
    await page.waitForSelector('[data-testid="saving-indicator"]', { state: 'hidden', timeout: 5000 });
  });

  test('TC2.10: Should close form and show success message after save', async ({ page }) => {
    await page.click('[data-testid="edit-profile-button"]');

    // Make a change
    await page.fill('[data-testid="edit-name"]', 'Updated Clinic Name');

    // Save
    await page.click('[data-testid="save-button"]');

    // Wait for save to complete
    await page.waitForSelector('[data-testid="company-profile-edit-form"]', { state: 'hidden', timeout: 5000 });

    // Verify form closed
    const editForm = page.locator('[data-testid="company-profile-edit-form"]');
    await expect(editForm).not.toBeVisible();

    // Verify success message
    const successMessage = page.locator('[data-testid="success-message"]');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText(/profile updated successfully/i);
  });

  test('TC2.11: Should display API error message if save fails', async ({ page }) => {
    // Mock API failure (requires test setup to simulate network error)
    await page.route('**/api/companies/*', route => route.abort());

    await page.click('[data-testid="edit-profile-button"]');
    await page.fill('[data-testid="edit-name"]', 'New Name');
    await page.click('[data-testid="save-button"]');

    // Verify error message appears
    const errorMessage = page.locator('[data-testid="api-error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/failed to save/i);

    // Verify form stays open
    const editForm = page.locator('[data-testid="company-profile-edit-form"]');
    await expect(editForm).toBeVisible();
  });
});
```

### Acceptance Criteria
- ✅ Form opens as full-screen modal overlay
- ✅ All specified fields are present and editable
- ✅ Delete icons clear field values
- ✅ Required field validation works
- ✅ Email/URL format validation works
- ✅ Save button calls API and updates dashboard
- ✅ Cancel button closes form without saving
- ✅ Loading states display during save
- ✅ Success message shows after save
- ✅ Error messages show for API failures
- ✅ All Playwright tests pass

### Dependencies
None (standalone phase)

---

## Phase 3: Save Changes and Update Dashboard

### Objective
Integrate the edit form with the backend API and ensure the dashboard reflects saved changes immediately.

### What Happens
1. User edits fields in the form
2. Clicks "Save"
3. Form validates all fields
4. API call to `PUT /api/companies/:id` with updated data
5. On success:
   - Close modal
   - Update company state in dashboard
   - Show success notification
   - Dashboard displays new values
6. On error:
   - Show error message
   - Keep form open
   - Allow user to retry

### Implementation Steps

1. **Create API save handler in CompanyProfileEditForm**
   ```typescript
   const handleSave = async () => {
     // Validate
     const validationErrors = validateCompany(formData);
     if (Object.keys(validationErrors).length > 0) {
       setErrors(validationErrors);
       return;
     }

     // Save
     try {
       setIsSaving(true);
       const accessToken = await getAccessToken();
       const updated = await ApiService.updateCompany(
         formData.id,
         formData,
         accessToken
       );
       onSave(updated); // Pass back to parent
     } catch (error) {
       setApiError(error.message);
     } finally {
       setIsSaving(false);
     }
   };
   ```

2. **Update CompanyDashboardScreen to handle save**
   ```typescript
   const handleProfileSave = (updatedCompany: Company) => {
     setCompany(updatedCompany); // Update local state
     setIsEditFormVisible(false); // Close modal
     showSuccessNotification('Profile updated successfully!');
   };
   ```

3. **Add optimistic updates**
   - Show updated values immediately in dashboard
   - If API call fails, revert to previous values

4. **Add success/error notifications**
   - Use Snackbar or Toast component
   - Success: "Profile updated successfully!"
   - Error: "Failed to save changes. Please try again."

### Files to Modify
- `/src/components/CompanyProfileEditForm.tsx` (add save logic)
- `/src/screens/CompanyDashboardScreen.tsx` (handle updates)

### Playwright Test Cases

```typescript
// File: e2e/companyProfileSave.spec.ts

test.describe('Phase 3: Save Changes and Update Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.fill('[data-testid="email-input"]', 'vetcompany.test@example.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForSelector('[data-testid="company-dashboard"]');
  });

  test('TC3.1: Should save all field changes and update dashboard', async ({ page }) => {
    // Open form
    await page.click('[data-testid="edit-profile-button"]');

    // Change multiple fields
    await page.fill('[data-testid="edit-name"]', 'New Clinic Name');
    await page.fill('[data-testid="edit-description"]', 'Updated description text');
    await page.fill('[data-testid="edit-phone"]', '0712345678');
    await page.fill('[data-testid="edit-website"]', 'https://newsite.com');

    // Save
    await page.click('[data-testid="save-button"]');

    // Wait for modal to close
    await page.waitForSelector('[data-testid="company-profile-edit-form"]', { state: 'hidden' });

    // Verify changes reflected in dashboard
    await expect(page.locator('[data-testid="company-name"]')).toContainText('New Clinic Name');
    await expect(page.locator('[data-testid="company-description"]')).toContainText('Updated description text');
    await expect(page.locator('[data-testid="company-phone"]')).toContainText('0712345678');
    await expect(page.locator('[data-testid="company-website"]')).toContainText('https://newsite.com');
  });

  test('TC3.2: Should save address changes', async ({ page }) => {
    await page.click('[data-testid="edit-profile-button"]');

    // Update address fields
    await page.fill('[data-testid="edit-address"]', 'Str. Noua 123');
    await page.fill('[data-testid="edit-city"]', 'Cluj-Napoca');
    await page.fill('[data-testid="edit-state"]', 'Cluj');
    await page.fill('[data-testid="edit-zip"]', '400001');

    await page.click('[data-testid="save-button"]');
    await page.waitForSelector('[data-testid="company-profile-edit-form"]', { state: 'hidden' });

    // Verify address updated
    const addressText = await page.locator('[data-testid="company-address"]').textContent();
    expect(addressText).toContain('Str. Noua 123');
    expect(addressText).toContain('Cluj-Napoca');
    expect(addressText).toContain('Cluj');
  });

  test('TC3.3: Should save business details changes', async ({ page }) => {
    await page.click('[data-testid="edit-profile-button"]');

    // Change business details
    await page.selectOption('[data-testid="edit-clinic-type"]', 'emergency_24_7');
    await page.fill('[data-testid="edit-years-in-business"]', '15');
    await page.fill('[data-testid="edit-num-veterinarians"]', '8');

    await page.click('[data-testid="save-button"]');
    await page.waitForSelector('[data-testid="company-profile-edit-form"]', { state: 'hidden' });

    // Verify business details updated
    await expect(page.locator('[data-testid="clinic-type"]')).toContainText('Emergency 24/7');
    await expect(page.locator('[data-testid="years-in-business"]')).toContainText('15');
    await expect(page.locator('[data-testid="num-veterinarians"]')).toContainText('8');
  });

  test('TC3.4: Should save facilities selections', async ({ page }) => {
    await page.click('[data-testid="edit-profile-button"]');

    // Select facilities
    await page.check('[data-testid="facility-emergency_24_7"]');
    await page.check('[data-testid="facility-surgery_room"]');
    await page.check('[data-testid="facility-parking"]');

    await page.click('[data-testid="save-button"]');
    await page.waitForSelector('[data-testid="company-profile-edit-form"]', { state: 'hidden' });

    // Verify facilities displayed as chips
    await expect(page.locator('text=emergency_24_7')).toBeVisible();
    await expect(page.locator('text=surgery_room')).toBeVisible();
    await expect(page.locator('text=parking')).toBeVisible();
  });

  test('TC3.5: Should save payment methods selections', async ({ page }) => {
    await page.click('[data-testid="edit-profile-button"]');

    // Select payment methods
    await page.check('[data-testid="payment-cash"]');
    await page.check('[data-testid="payment-credit_card"]');
    await page.check('[data-testid="payment-pet_insurance"]');

    await page.click('[data-testid="save-button"]');
    await page.waitForSelector('[data-testid="company-profile-edit-form"]', { state: 'hidden' });

    // Verify payment methods displayed
    await expect(page.locator('text=cash')).toBeVisible();
    await expect(page.locator('text=credit_card')).toBeVisible();
    await expect(page.locator('text=pet_insurance')).toBeVisible();
  });

  test('TC3.6: Should handle API failure gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/companies/*', route => {
      if (route.request().method() === 'PUT') {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ message: 'Internal server error' })
        });
      } else {
        route.continue();
      }
    });

    await page.click('[data-testid="edit-profile-button"]');
    await page.fill('[data-testid="edit-name"]', 'New Name');
    await page.click('[data-testid="save-button"]');

    // Verify error message
    const errorMessage = page.locator('[data-testid="api-error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/failed to save/i);

    // Verify form still open
    await expect(page.locator('[data-testid="company-profile-edit-form"]')).toBeVisible();

    // Verify original data unchanged in dashboard
    await page.click('[data-testid="cancel-button"]');
    await expect(page.locator('[data-testid="company-name"]')).not.toContainText('New Name');
  });

  test('TC3.7: Should display success notification after save', async ({ page }) => {
    await page.click('[data-testid="edit-profile-button"]');
    await page.fill('[data-testid="edit-description"]', 'New description');
    await page.click('[data-testid="save-button"]');

    // Wait for success notification
    const successToast = page.locator('[data-testid="success-notification"]');
    await expect(successToast).toBeVisible();
    await expect(successToast).toContainText(/profile updated successfully/i);

    // Notification should auto-dismiss after a few seconds
    await page.waitForSelector('[data-testid="success-notification"]', { state: 'hidden', timeout: 5000 });
  });

  test('TC3.8: Should persist changes after page reload', async ({ page }) => {
    // Save changes
    await page.click('[data-testid="edit-profile-button"]');
    const newName = 'Persistent Clinic Name';
    await page.fill('[data-testid="edit-name"]', newName);
    await page.click('[data-testid="save-button"]');
    await page.waitForSelector('[data-testid="company-profile-edit-form"]', { state: 'hidden' });

    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="company-dashboard"]');

    // Verify changes persisted
    await expect(page.locator('[data-testid="company-name"]')).toContainText(newName);
  });
});
```

### Acceptance Criteria
- ✅ All form fields save correctly via API
- ✅ Dashboard updates immediately after save
- ✅ Success notification displays
- ✅ API errors handled gracefully
- ✅ Changes persist after page reload
- ✅ Optimistic updates work correctly
- ✅ All Playwright tests pass

### Dependencies
- Phase 2 (requires edit form component)

---

## Code Style Requirements (MANDATORY)

### Object-Based Implementation

All code MUST use object literals and factory functions. NO ES6 classes.

**✅ CORRECT - Validation object:**
```typescript
// src/utils/companyValidation.ts

export const companyValidation = {
  validateName(name: string): string | null {
    if (!name || name.trim().length === 0) {
      return 'Name is required';
    }
    if (name.length < 3) {
      return 'Name must be at least 3 characters';
    }
    return null;
  },

  validateEmail(email: string): string | null {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }
    return null;
  },

  validateWebsite(website: string): string | null {
    if (!website) return null; // Optional field
    try {
      new URL(website);
      return null;
    } catch {
      return 'Invalid URL format';
    }
  },

  validateAll(company: Partial<Company>): Record<string, string> {
    const errors: Record<string, string> = {};

    const nameError = this.validateName(company.name || '');
    if (nameError) errors.name = nameError;

    const emailError = this.validateEmail(company.email || '');
    if (emailError) errors.email = emailError;

    const websiteError = this.validateWebsite(company.website || '');
    if (websiteError) errors.website = websiteError;

    // ... more validations

    return errors;
  }
};
```

**❌ WRONG - ES6 classes:**
```typescript
// DO NOT USE THIS PATTERN
class CompanyValidator {
  validateName(name: string) { ... }
}
```

---

## Critical Files Summary

### Files to Create
1. **`/src/components/CompanyProfileEditForm.tsx`** - Full-screen edit form component
2. **`/src/utils/companyValidation.ts`** - Validation logic (object literal)

### Files to Modify
1. **`/src/screens/CompanyDashboardScreen.tsx`** - Integrate edit form + filter categories

### Files to Use (No Changes)
1. `/src/services/api.ts` - Already has `updateCompany()` method
2. `/src/types/company.types.ts` - Company type definitions
3. `/src/components/FormComponents/RomanianPhoneInput.tsx` - For phone formatting
4. `/src/components/FormComponents/MultiSelectCheckbox.tsx` - For facilities/payment methods

---

## Testing Strategy

### Playwright MCP E2E Tests
- **Framework**: Playwright MCP for web version (http://localhost:8081)
- **Coverage**: All user flows from login to save
- **Location**: `/e2e/` directory

### Test Organization
```
e2e/
├── companyDashboard.spec.ts (Phase 1: Category filtering)
├── companyProfileEdit.spec.ts (Phase 2: Form display and validation)
└── companyProfileSave.spec.ts (Phase 3: Save and update dashboard)
```

### Test Execution
```bash
# Start backend and frontend
cd backend && npm run dev
npm run web

# Run Playwright tests
npx playwright test e2e/
```

---

## Implementation Timeline

**Week 1:**
- Phase 1: Category filtering (2 days)
- Phase 2: Create edit form component (3 days)

**Week 2:**
- Phase 3: Save integration (2 days)
- Bug fixes and polish (2 days)
- Full E2E testing (1 day)

**Total: 2 weeks**

---

## Success Metrics

- ✅ All 3 phases completed
- ✅ All Playwright tests passing (30+ test cases)
- ✅ Zero TypeScript errors
- ✅ Backend API unchanged (no backend modifications)
- ✅ Form validation prevents invalid data
- ✅ Changes persist after page reload
- ✅ Error handling covers all edge cases
- ✅ Success/error notifications work properly

---

End of Plan
