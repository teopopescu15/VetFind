# Implementation Plan Template

Use this template when generating implementation plans in plan mode.

---

# [FEATURE_NAME] - Implementation Plan

**Version**: 1.0.0
**Created**: [DATE]
**Purpose**: Comprehensive implementation guide for [FEATURE_NAME]

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites Checklist](#prerequisites-checklist)
3. [Requirements Summary](#requirements-summary)
4. [Key Constraints (MANDATORY)](#key-constraints-mandatory)
5. [Phase-by-Phase Implementation](#phase-by-phase-implementation)
6. [Testing Procedures](#testing-procedures)
7. [Acceptance Criteria](#acceptance-criteria)
8. [Final Validation Checklist](#final-validation-checklist)

---

## 📖 Overview

### What This Plan Covers
[2-3 sentences describing what will be implemented]

### Implementation Structure
- **Total Phases**: [X] phases
- **Total Subtasks**: [Y] subtasks
- **Estimated Time**: [Z] hours total
- **Testing Strategy**: Playwright tests after each phase + final comprehensive testing

### Technology Stack

**Backend**:
- [Technology 1]
- [Technology 2]
- [Framework/Library]

**Frontend**:
- [Technology 1]
- [Technology 2]
- [Framework/Library]

### Design Patterns
- [Pattern 1]: [Why using this pattern]
- [Pattern 2]: [Why using this pattern]

---

## ✅ Prerequisites Checklist

Before starting implementation, verify these items:

**Database**:
- [ ] PostgreSQL server running and accessible
- [ ] Database connection configured in `backend/.env`
- [ ] Existing migrations successfully applied
- [ ] Can connect via psql or database client

**Backend**:
- [ ] Node.js v18+ installed
- [ ] Dependencies installed (`npm install` in backend/)
- [ ] Backend server starts without errors (`npm run dev`)
- [ ] Existing features working (authentication, etc.)

**Frontend**:
- [ ] Node.js v18+ installed
- [ ] Dependencies installed (`npm install` in frontend/)
- [ ] Frontend dev server starts without errors (`npm run dev`)
- [ ] Existing pages render correctly

**Docker Environment** (if applicable):
- [ ] Docker containers running (`sudo docker compose up -d`)
- [ ] Frontend accessible at http://localhost:5179
- [ ] Backend accessible at http://localhost:8000
- [ ] Database accessible at localhost:5432

**Testing Tools**:
- [ ] Playwright MCP available
- [ ] @agent-general-purpose accessible
- [ ] Browser with DevTools for manual testing
- [ ] Database client for query verification

---

## 🎯 Requirements Summary

### Feature Overview
[Detailed description of what needs to be implemented]

### Subtasks Breakdown

| Subtask | Description | Est. Time | Key Features |
|---------|-------------|-----------|--------------|
| [X.1]   | [Name]      | [Hours]   | [Features]   |
| [X.2]   | [Name]      | [Hours]   | [Features]   |
| [X.3]   | [Name]      | [Hours]   | [Features]   |

**Total Estimation**: [Total hours]

---

## 🔒 Key Constraints (MANDATORY)

These constraints MUST be followed. Violations = implementation failure.

### Constraint 1: [Constraint Name]

**Requirement**: [Description of constraint]

**Implementation Requirements**:
- ✅ [Specific requirement 1]
- ✅ [Specific requirement 2]
- ✅ [Specific requirement 3]

**Verification Method**:
- [How to verify constraint is met]
- [Test to run]
- [Expected outcome]

### Constraint 2: [Constraint Name]

**Requirement**: [Description]

**Implementation Requirements**:
- ✅ [Requirement 1]
- ✅ [Requirement 2]

**Verification Method**:
- [Verification steps]

---

## 🚀 Phase-by-Phase Implementation

### Phase 1: [Phase Name] - [Est. Hours]

**Goal**: [What this phase accomplishes]

**Subtasks Covered**: [X.1, X.2]

#### Step 1.1: [Step Name]

**File**: `[exact/path/to/file]`

**Content**:
```[language]
[Exact code or configuration to add]
```

**Explanation**: [Why this code/config]

**How This Satisfies Requirements**:
- ✅ [Requirement 1]
- ✅ [Requirement 2]

**Expected Outcome**:
- [What should work after this step]

#### Step 1.2: [Step Name]

**File**: `[path/to/file]`

**Location**: Line [X] (or after [function/section])

**Before**:
```[language]
// Current code
```

**After**:
```[language]
// New code
```

**Expected Outcome**:
- [What changes]

#### Testing Phase 1

**IMPORTANT**: These test scenarios will be executed by @agent-general-purpose via app-tester skill.
Follow the structured format below. Reference app-tester/references/testing-checklist.md for standards.

**Test Environment Configuration**:
- **Application URL**: https://app.hackathon-haufe-teo.com (or http://localhost:5179 for local)
- **Backend API**: https://app.hackathon-haufe-teo.com/api (or http://localhost:8000 for local)
- **Test Credentials**: [Specify test user credentials if different from defaults]
- **Required Containers**: frontend (haufe-frontend), backend (haufe-backend), postgres (haufe-postgres)
- **Prerequisite Data**: [Any specific database records needed]
- **MCP Tools Required**: Playwright MCP for browser automation, standard tools for monitoring

---

**Scenario 1: [Descriptive Test Name - Be Specific]**

**Purpose**: [One sentence describing what this test validates]

**Setup/Preconditions**:
- User state: [authenticated/not authenticated/specific role]
- Starting page: [exact URL or page name]
- Database state: [specific records that must exist]
- Containers: All three containers running and healthy

**Test Steps**:
1. **Navigate** to [exact URL, e.g., https://app.hackathon-haufe-teo.com/menu]
2. **Wait for** [specific element description or selector] to be visible
   - Element identifier: [class name, id, or text content]
   - Expected wait time: [e.g., max 3 seconds]
3. **Verify** [specific element] displays [expected content/state]
   - Expected text: "[exact text]"
   - Expected attributes: [e.g., disabled=false]
4. **Click** [element description]
   - Selector: [CSS selector or text selector if known]
   - Element location: [e.g., "in header", "below product image"]
5. **Fill** field "[field name/label]" with value: "[exact test value]"
   - Field type: [text/email/password/number]
   - Validation: [any expected validation behavior]
6. **Submit** form by clicking [button description]
   - Button text: "[exact button text]"
7. **Wait for** [expected outcome - page change, message, loader disappears]

**Expected Outcomes**:
- **HTTP/API**:
  - Request: `[METHOD] /api/[endpoint]` with payload `{[data]}`
  - Response: Status [code] with body containing `[key fields]`
- **UI Changes**:
  - Element [description] displays: "[exact text or state]"
  - URL changes to: [new URL if navigation occurs]
  - Success message appears: "[message text]" at [location]
- **Database Changes**:
  - Table `[table_name]` has new record with:
    - `[field1]` = `[value1]`
    - `[field2]` = `[value2]`
- **Console/Logs**:
  - Browser console: No JavaScript errors
  - Frontend container logs: No error entries
  - Backend container logs: Shows `[expected log pattern]`

**Verification Checklist**:
- [ ] [Specific measurable check 1, e.g., "Cart badge shows '1'"]
- [ ] [Specific measurable check 2, e.g., "Product card has dimensions 280x360px"]
- [ ] [Specific measurable check 3, e.g., "API response includes order_id"]
- [ ] No JavaScript errors in browser console
- [ ] No errors in frontend container logs (`docker compose logs frontend`)
- [ ] No errors in backend container logs (`docker compose logs backend`)
- [ ] Database state matches expected (query: `SELECT * FROM [table] WHERE [condition]`)

**Error Scenarios to Test**:
1. **Invalid Input**:
   - Action: Submit with [invalid value, e.g., empty field, wrong format]
   - Expected: Error message "[exact error text]" displays at [location]
   - Verification: Form does not submit, no API call made
2. **Edge Case**:
   - Action: [Specific edge case action]
   - Expected: [How system should handle]
   - Verification: [What to check]

**Responsive Testing** (if UI-focused):
- **Viewport**: [Specific size, e.g., 375x667 for iPhone SE, 768x1024 for iPad]
- **Expected Behavior**:
  - [Specific responsive behavior, e.g., "Navigation collapses to hamburger menu"]
  - [Layout changes, e.g., "Cards stack vertically instead of grid"]
  - Touch targets minimum 44x44px
  - No horizontal scrolling

**Screenshot Requirements**:
- Capture on any failure for debugging
- Capture successful state: [specific state to document]

---

**Scenario 2: [Next Descriptive Test Name]**

[Repeat the complete structure above for each test scenario]

**Manual Testing**:
```bash
# Test command 1
[command]

# Test command 2
[command]

# Expected output:
[what output should show]
```

**Phase 1 Complete When**:
- ✅ [Criterion 1]
- ✅ [Criterion 2]
- ✅ All Playwright tests passing
- ✅ Manual tests passing
- ✅ No console errors

**User Confirmation Required**: "Phase 1 complete. All tests passed. May I proceed to Phase 2?"

---

### Phase 2: [Phase Name] - [Est. Hours]

**Goal**: [Phase goal]

**Dependencies**: Phase 1

[Repeat structure from Phase 1]

---

### Phase 3: [Phase Name] - [Est. Hours]

[Continue for all phases...]

---

## 🧪 Testing Procedures

### Testing Strategy Overview

**Per-Phase Testing**:
- After completing each phase, run phase-specific tests using app-tester skill
- Tests delegated to @agent-general-purpose with Playwright MCP and monitoring tools
- All tests must pass before proceeding to next phase
- Fix issues immediately, re-test until all pass, then continue

**Final Comprehensive Testing**:
- After all phases complete, run end-to-end tests
- Test complete user workflows across all features
- Verify no regressions in existing functionality
- Test error handling, edge cases, and responsive behavior
- Validate performance and security requirements

### Test Execution via app-tester

**IMPORTANT**: Always use the app-tester skill pattern for test execution:

```markdown
@agent-general-purpose

TASK: Comprehensive testing of Haufe Hackathon application

**BEFORE STARTING**, you MUST read these files:
1. /home/ubuntu/teo-simulare/.claude/skills/app-tester/SKILL.md
2. /home/ubuntu/teo-simulare/.claude/skills/app-tester/references/testing-checklist.md

After reading those files, follow ALL requirements from app-tester skill, including:
- Container health checks using scripts/check_containers.sh
- Responsive testing at all specified viewports
- Screenshot capture for failures
- Comprehensive error analysis

**USER REQUEST**: Test Phase [N] - [Phase Name]

**PHASE IMPLEMENTATION TO TEST**:
[Describe what was implemented in this phase]

**TESTING ENVIRONMENT**:
- Application URL: https://app.hackathon-haufe-teo.com
- Backend API: https://app.hackathon-haufe-teo.com/api
- Containers: haufe-frontend, haufe-backend, haufe-postgres
- Test Credentials: [specify credentials]

**SPECIFIC TEST SCENARIOS**:

[Copy the detailed test scenarios from the phase testing section above, including all the structured details]

**MCP TOOLS TO USE**:
1. **Playwright MCP** (mcp__playwright__*):
   - browser_navigate: Navigate to URLs
   - browser_snapshot: Get page accessibility tree
   - browser_click: Click elements
   - browser_type: Enter text in fields
   - browser_fill_form: Fill multiple form fields
   - browser_wait_for: Wait for elements/text
   - browser_take_screenshot: Capture evidence
   - browser_console_messages: Check for errors

2. **Standard Tools**:
   - Bash: Check container health and logs
   - Grep: Search for error patterns in logs
   - Read: Verify generated files

**TESTING CHECKLIST** (from app-tester/references/testing-checklist.md):
1. Container Health:
   - [ ] All containers running (docker compose ps)
   - [ ] No error logs in containers
   - [ ] Memory/CPU usage normal

2. Functionality Tests:
   - [ ] All test scenarios pass
   - [ ] Expected API responses received
   - [ ] Database changes verified
   - [ ] UI displays correct content

3. Error Handling:
   - [ ] Invalid inputs rejected properly
   - [ ] Error messages user-friendly
   - [ ] No crashes or unhandled exceptions

4. Responsive Testing (if UI):
   - [ ] Desktop: 1920x1080, 1366x768
   - [ ] Tablet: 768x1024
   - [ ] Mobile: 375x667, 414x896

5. Performance:
   - [ ] Page loads under 3 seconds
   - [ ] API responses under 500ms
   - [ ] No memory leaks detected

**FAILURE REPORT FORMAT**:
If any test fails, provide:
1. Scenario that failed
2. Step where failure occurred
3. Expected vs Actual outcome
4. Screenshot (if UI test)
5. Console errors (if any)
6. Container logs (relevant portions)
7. Suggested fix (if identifiable)

Please execute all test scenarios and provide comprehensive results.
```

### Responsive Testing Viewports

When testing UI features, use these exact viewport sizes:

**Priority Viewports**:
1. **Desktop Large**: 1920x1080 (primary desktop)
2. **Desktop Medium**: 1366x768 (laptop)
3. **Tablet Portrait**: 768x1024 (iPad)
4. **Mobile Small**: 375x667 (iPhone SE - minimum)
5. **Mobile Large**: 414x896 (iPhone 11 Pro Max)

**Additional Viewports** (if time permits):
6. **Desktop Small**: 1024x768
7. **Tablet Landscape**: 1024x768

### Final Comprehensive Testing

After all phases complete, run these end-to-end tests:

**Test Suite 1: Complete User Journey**
- Test entire workflow from login to feature completion
- Verify all integrated features work together
- Check data persistence across sessions

**Test Suite 2: Error Handling**
- Test all validation rules
- Verify error messages are helpful
- Ensure no data corruption on errors

**Test Suite 3: Performance & Security**
- Measure page load times
- Check for N+1 queries
- Verify user isolation (multi-tenant)
- Test input sanitization

**Test Suite 4: Cross-Browser Testing**
- Chrome (latest)
- Firefox (if required)
- Safari (if required)

**Test Suite 5: Data Integrity**
- Verify all CRUD operations
- Check referential integrity
- Validate business logic constraints

---

## ✅ Acceptance Criteria

### Phase-Level Criteria

**Phase 1**:
- [ ] [Specific criterion 1]
- [ ] [Specific criterion 2]
- [ ] All Phase 1 tests pass

**Phase 2**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] All Phase 2 tests pass

[Continue for all phases...]

### Overall Acceptance Criteria

**Functionality**:
- [ ] All requirements implemented
- [ ] All features working as specified
- [ ] Edge cases handled properly
- [ ] Error messages clear and helpful

**Testing**:
- [ ] All Playwright tests passing
- [ ] All manual tests passing
- [ ] No console errors
- [ ] No network errors

**Code Quality**:
- [ ] TypeScript compiles without errors
- [ ] Code follows project conventions
- [ ] Proper error handling throughout
- [ ] User isolation enforced (where applicable)

**Documentation**:
- [ ] Code comments where needed
- [ ] API endpoints documented (if applicable)
- [ ] README updated (if needed)
- [ ] Migration notes written (if applicable)

**Deployment**:
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Containers rebuild successfully
- [ ] No data loss during migration

---

## 🔍 Final Validation Checklist

Before marking as complete:

### Code Quality
- [ ] TypeScript compiles: `npm run build`
- [ ] No linting errors
- [ ] All imports resolved
- [ ] Naming conventions followed

### Functionality
- [ ] All requirements met
- [ ] All features work end-to-end
- [ ] Edge cases handled
- [ ] Error handling implemented

### Testing
- [ ] All Playwright tests pass
- [ ] Manual testing complete
- [ ] Cross-browser tested (if needed)
- [ ] Mobile responsive (if needed)

### Security
- [ ] User isolation verified
- [ ] Authentication/authorization correct
- [ ] Input validation in place
- [ ] SQL injection prevented (parameterized queries)

### Performance
- [ ] No N+1 queries
- [ ] Database indexes in place
- [ ] Frontend loads quickly
- [ ] No memory leaks

### Documentation
- [ ] Implementation plan updated
- [ ] Structure docs updated
- [ ] API docs updated (if applicable)
- [ ] Environment variables documented

---

## 📝 Implementation Log

Track progress as you implement:

### Phase 1: [Date/Time]
- ✅ Step 1.1: [Task] - Completed
- ✅ Step 1.2: [Task] - Completed
- ✅ Testing: All tests passed
- ⚠️ Issue: [Issue description] - Resolved by [solution]

### Phase 2: [Date/Time]
- ✅ Step 2.1: [Task] - Completed
- ✅ Step 2.2: [Task] - Completed
- ✅ Testing: All tests passed

[Continue for all phases...]

---

## 🎉 Completion Summary

**Status**: [PLANNING/IN PROGRESS/TESTING/COMPLETE]

**Total Implementation Time**: [Actual hours]

**Phases Completed**: [X/X]

**Tests Passed**: [Y/Y]

**Files Modified:**
- Backend: [Count] files
- Frontend: [Count] files
- Database: [Count] migrations

**Next Steps**: [What happens after this implementation]

---

**Last Updated**: [Date and Time]
**Implementation Completed**: [Date]
**Tested By**: @agent-general-purpose + Manual
**Approved By**: [User name/date]

---

## 📚 Test Scenario Examples Library

### Example Test Scenarios by Feature Type

Copy and adapt these examples when creating test scenarios for your plan. Each example follows the structured format that app-tester expects.

---

#### Example 1: Authentication Feature Test

```markdown
**Scenario 1: Successful User Login with Valid Credentials**

**Purpose**: Validate complete authentication flow with valid credentials

**Setup/Preconditions**:
- User exists: email=teopopescu15@gmail.com, password=TeoHack$44
- User is logged out (no auth token present)
- Starting URL: https://app.hackathon-haufe-teo.com/
- All containers (haufe-frontend, haufe-backend, haufe-postgres) running
- Database accessible with test user record

**Test Steps**:
1. Navigate to https://app.hackathon-haufe-teo.com/ using browser_navigate
2. Wait for login form heading "Welcome" to be visible using browser_wait_for
3. Locate email input field (label: "Email" or id: "email")
4. Type email: "teopopescu15@gmail.com" using browser_type
5. Locate password input field (label: "Password" or id: "password")
6. Type password: "TeoHack$44" using browser_type
7. Click "Sign In" or "Login" button using browser_click
8. Wait for page navigation to complete using browser_wait_for

**Expected Outcomes**:
- **HTTP**: POST to `/api/auth/login` returns 200 status
- **HTTP**: Response sets authentication cookie or returns token
- **UI**: URL changes to `/dashboard` or `/menu`
- **UI**: Page displays user-specific content (username, welcome message)
- **Console**: No JavaScript errors (check with browser_console_messages)
- **Logs**: Backend logs show successful authentication (docker compose logs backend)
- **Database**: Session or token record created for user

**Verification Checklist**:
- [ ] URL is /dashboard or /menu (not /login)
- [ ] User welcome message displays correct email/username
- [ ] Authentication token present in cookies or localStorage
- [ ] Navigation menu shows "Logout" option
- [ ] No console errors in browser DevTools
- [ ] Backend container logs show 200 response for /api/auth/login
- [ ] No error entries in postgres container logs

**Error Scenarios**:
1. **Wrong Password**:
   - Steps 1-4 same as above
   - Type password: "WrongPassword123"
   - Click "Sign In"
   - Expected: Error message "Invalid credentials" or similar
   - Expected: URL stays on /login
   - Expected: No authentication token set

2. **Empty Form**:
   - Navigate to login page
   - Click "Sign In" without filling fields
   - Expected: Validation errors for both fields
   - Expected: Form not submitted

**Responsive Testing**:
- Test at 375x667 using browser_resize
- Verify form fields are touch-friendly (min 44px height)
- Verify no horizontal scrolling

**Screenshot Requirements**:
- Capture on login failure using browser_take_screenshot
- Capture successful dashboard view (for documentation)

**MCP Tools Used**:
- mcp__playwright__browser_navigate
- mcp__playwright__browser_wait_for
- mcp__playwright__browser_type
- mcp__playwright__browser_click
- mcp__playwright__browser_console_messages
- mcp__playwright__browser_take_screenshot
- mcp__playwright__browser_resize
```

---

#### Example 2: CRUD Feature Test (Create Product Order)

```markdown
**Scenario 2: Create New Product Order from Menu**

**Purpose**: Validate product can be added to cart and order created successfully

**Setup/Preconditions**:
- User authenticated (logged in as teopopescu15@gmail.com)
- At least 1 product exists in database (product_id=1, price=29.99)
- User cart is empty initially
- Starting page: /menu
- All containers running

**Test Steps**:
1. Navigate to https://app.hackathon-haufe-teo.com/menu using browser_navigate
2. Wait for product list to load (check for elements with class "product-card") using browser_wait_for
3. Take snapshot of page structure using browser_snapshot
4. Locate first product card element
5. Click "Add to Cart" button on first product using browser_click
6. Wait for cart icon badge to update (should show "1") using browser_wait_for
7. Click shopping cart icon in navigation using browser_click
8. Verify product appears in cart with correct details
9. Click "Checkout" button using browser_click
10. Fill delivery address: "123 Test St, Bucharest" using browser_type
11. Click "Place Order" button using browser_click
12. Wait for order confirmation message using browser_wait_for

**Expected Outcomes**:
- **HTTP**: POST to `/api/cart/add` returns 201
- **HTTP**: POST to `/api/orders` returns 201 with order_id
- **UI**: Cart badge shows "1" after adding product
- **UI**: Cart page displays product name and price ($29.99)
- **UI**: Order confirmation shows order number
- **Console**: No errors (check with browser_console_messages)
- **Database**: New record in `orders` table for user_id
- **Database**: New record(s) in `order_items` table
- **Logs**: Backend shows successful order creation

**Verification Checklist**:
- [ ] Cart badge increments from 0 to 1
- [ ] Cart page shows correct product name and price
- [ ] Order confirmation page displays
- [ ] Order number is visible and formatted correctly
- [ ] Database query shows new order: `SELECT * FROM orders WHERE user_id = [id] ORDER BY created_at DESC LIMIT 1`
- [ ] Order total matches product price plus any taxes/fees
- [ ] No console errors throughout flow
- [ ] Backend logs show POST /api/orders with 201 response

**Error Scenarios**:
1. **Out of Stock**:
   - Attempt to add product with stock=0
   - Click "Add to Cart"
   - Expected: Error message "Product out of stock"
   - Expected: Product NOT added to cart
   - Expected: Cart badge remains at 0

2. **Empty Address**:
   - Add product to cart successfully
   - Click "Checkout"
   - Leave address field empty
   - Click "Place Order"
   - Expected: Validation error "Address is required"
   - Expected: Order NOT created
   - Expected: Remain on checkout page

**Responsive Testing**:
- Test at 768x1024 (iPad) using browser_resize
- Verify product cards display 2 per row
- Verify checkout form is touch-friendly

**Screenshot Requirements**:
- Capture cart with product added
- Capture order confirmation screen
- Capture on any errors

**MCP Tools Used**:
- mcp__playwright__browser_navigate
- mcp__playwright__browser_snapshot
- mcp__playwright__browser_click
- mcp__playwright__browser_wait_for
- mcp__playwright__browser_type
- mcp__playwright__browser_console_messages
- mcp__playwright__browser_take_screenshot
- Bash for checking container logs
```

---

#### Example 3: UI Component Test (Responsive Book-Style Menu)

```markdown
**Scenario 3: Book-Style Product Menu Responsive Layout**

**Purpose**: Validate product menu displays correctly in book format across device sizes

**Setup/Preconditions**:
- User authenticated (teopopescu15@gmail.com)
- At least 4 products exist in database
- Starting page: /menu
- Frontend container running

**Test Steps (Desktop 1920x1080)**:
1. Set browser viewport to 1920x1080 using browser_resize
2. Navigate to https://app.hackathon-haufe-teo.com/menu using browser_navigate
3. Wait for products to load using browser_wait_for
4. Take screenshot of full page using browser_take_screenshot
5. Get page snapshot using browser_snapshot
6. Count product cards per row
7. Measure card dimensions using browser_evaluate
8. Verify gap spacing between cards
9. Check for book spine separator element

**Expected Outcomes (Desktop)**:
- **Layout**: 4 products per row (2 on left page, 2 on right page)
- **Dimensions**: Each card is 280px wide × 360px tall
- **Spacing**: 16px gap between cards
- **UI**: Book spine separator visible between pages (class "book-spine")
- **UI**: Page background has book texture
- **Console**: No layout shift warnings

**Test Steps (Mobile 375x667)**:
1. Set browser viewport to 375x667 using browser_resize
2. Navigate to /menu (or reload if already there)
3. Wait for layout to adjust using browser_wait_for
4. Take screenshot using browser_take_screenshot
5. Verify layout changes to single column
6. Check card dimensions
7. Test horizontal scrolling (should be none)
8. Test touch interactions on cards

**Expected Outcomes (Mobile)**:
- **Layout**: 1 product per row (vertical stack)
- **Dimensions**: Cards are full width (~343px) × 140px tall
- **Spacing**: 12px vertical gap between cards
- **UI**: No book spine separator on mobile
- **UI**: All content readable without zooming
- **UI**: No horizontal scrolling
- **Touch**: Tap targets are minimum 44×44px

**Verification Checklist**:
- [ ] Desktop: 4 cards per row confirmed (2+2 book layout)
- [ ] Desktop: Each card measures 280×360px
- [ ] Desktop: Book spine visible with shadow effect
- [ ] Mobile: 1 card per row confirmed
- [ ] Mobile: Cards are full-width minus padding
- [ ] Mobile: No horizontal scroll detected
- [ ] Mobile: Touch targets meet 44×44px minimum
- [ ] No console errors at either viewport
- [ ] No layout shift (CLS) issues
- [ ] Images load correctly at all sizes

**Additional Viewports to Test**:
- **Tablet (768x1024)**:
  - Set viewport using browser_resize
  - Verify 2 products per row
  - Verify readable without zooming
- **Desktop Medium (1366x768)**:
  - Set viewport using browser_resize
  - Verify 4 products maintained (2+2)
  - Verify book layout intact

**Screenshot Requirements**:
- Capture desktop layout showing book format
- Capture mobile layout showing stacked cards
- Capture tablet layout showing 2-column grid
- Capture any layout breaks or issues

**MCP Tools Used**:
- mcp__playwright__browser_resize
- mcp__playwright__browser_navigate
- mcp__playwright__browser_wait_for
- mcp__playwright__browser_take_screenshot
- mcp__playwright__browser_snapshot
- mcp__playwright__browser_evaluate
- mcp__playwright__browser_console_messages
```

---

#### Example 4: Integration Test (Cart Persistence)

```markdown
**Scenario 4: Cart State Persists Across Authentication Sessions**

**Purpose**: Validate cart data persists in database and restores after logout/login

**Setup/Preconditions**:
- User authenticated as teopopescu15@gmail.com
- User cart is initially empty
- Product with id=1 exists (name="Test Product", price=29.99)
- Starting page: /menu
- All containers running

**Test Steps**:
1. Verify authenticated state (check for logout button) using browser_snapshot
2. Add product (id=1) to cart using browser_click
3. Wait for cart badge to show "1" using browser_wait_for
4. Navigate to cart page using browser_navigate
5. Verify product appears in cart
6. Take screenshot of cart contents using browser_take_screenshot
7. Click logout button using browser_click
8. Wait for redirect to login page using browser_wait_for
9. Verify logged out (no auth token)
10. Log back in with same credentials (teopopescu15@gmail.com / TeoHack$44)
11. Wait for dashboard/menu to load
12. Check cart icon badge (should show "1")
13. Navigate to cart page
14. Verify same product still in cart

**Expected Outcomes**:
- **Before logout**: Cart contains 1 item (Test Product)
- **After logout**: User redirected to login, cart cleared from UI
- **After re-login**: Cart badge shows "1" again
- **Database**: Cart items with user_id persist across sessions
- **UI**: Same product (id=1) appears in restored cart
- **Price**: Product price remains $29.99
- **Logs**: No errors during logout/login cycle

**Verification Checklist**:
- [ ] Product added successfully (badge shows 1)
- [ ] Cart page shows correct product before logout
- [ ] Logout clears UI state completely
- [ ] Login restores cart from database
- [ ] Cart badge shows correct count after login
- [ ] Cart contents match pre-logout state exactly
- [ ] Product price unchanged ($29.99)
- [ ] No console errors during entire cycle
- [ ] No cart data from other users visible
- [ ] Database query confirms cart persistence: `SELECT * FROM cart_items WHERE user_id = [id]`

**Error Scenarios**:
1. **Session Expiry**:
   - Add product to cart
   - Wait for session to expire (or manually invalidate token)
   - Try to view cart
   - Expected: Redirect to login
   - Expected: After re-login, cart is restored

2. **Different User Login**:
   - Add product to cart as user1
   - Logout
   - Login as user2 (different account)
   - Expected: Cart is empty for user2
   - Expected: user1's cart items not visible

**Network Monitoring**:
- Monitor API calls using browser_network_requests
- Verify /api/cart GET request after login
- Verify cart data in response matches database

**Screenshot Requirements**:
- Capture cart before logout
- Capture cart after re-login (should match)
- Capture any error states

**MCP Tools Used**:
- mcp__playwright__browser_snapshot
- mcp__playwright__browser_click
- mcp__playwright__browser_wait_for
- mcp__playwright__browser_navigate
- mcp__playwright__browser_take_screenshot
- mcp__playwright__browser_type
- mcp__playwright__browser_network_requests
- Bash for database queries
```

---

#### Example 5: Performance Test

```markdown
**Scenario 5: Menu Page Load Performance**

**Purpose**: Validate page loads within acceptable time limits with multiple products

**Setup/Preconditions**:
- User authenticated
- Database contains 20+ products with images
- Clear browser cache before test
- Starting page: /dashboard
- All containers running optimally

**Test Steps**:
1. Clear browser cache/storage using browser_evaluate
2. Start performance timer
3. Navigate to https://app.hackathon-haufe-teo.com/menu using browser_navigate
4. Wait for first product card to be visible using browser_wait_for
5. Wait for all images to load
6. Stop performance timer
7. Check network requests using browser_network_requests
8. Measure time to interactive using browser_evaluate
9. Check for console performance warnings using browser_console_messages

**Expected Outcomes**:
- **Load Time**: Page interactive in under 3 seconds
- **API Response**: /api/products returns in under 500ms
- **Images**: Lazy loading for below-fold images
- **Network**: No failed resource requests
- **Console**: No performance warnings
- **Memory**: No memory leaks detected
- **Container Logs**: No timeout errors

**Verification Checklist**:
- [ ] Time to first paint < 1 second
- [ ] Time to interactive < 3 seconds
- [ ] All API calls complete < 500ms
- [ ] Images use appropriate formats (WebP/JPEG)
- [ ] No layout shifts after initial load
- [ ] Browser memory usage stable
- [ ] No N+1 query warnings in backend logs
- [ ] Database queries optimized (check slow query log)

**Performance Metrics to Capture**:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)
- Total bundle size
- Number of HTTP requests

**MCP Tools Used**:
- mcp__playwright__browser_evaluate
- mcp__playwright__browser_navigate
- mcp__playwright__browser_wait_for
- mcp__playwright__browser_network_requests
- mcp__playwright__browser_console_messages
- Bash for container performance monitoring
```

---

### How to Use These Examples

1. **Choose the appropriate example** based on your feature type
2. **Copy the entire structure** including all sections
3. **Adapt the specifics** to your feature:
   - Replace URLs with your actual endpoints
   - Update element selectors/descriptions
   - Modify test data to match your requirements
   - Adjust expected outcomes
4. **Keep the format intact** - app-tester expects this structure
5. **Always specify MCP tools** that will be used
6. **Include both success and failure scenarios**
7. **Reference app-tester files** as mentioned in examples

### Cross-References to app-tester

When using these examples, remember that app-tester will:
- Read `/home/ubuntu/teo-simulare/.claude/skills/app-tester/references/testing-checklist.md`
- Use `/home/ubuntu/teo-simulare/.claude/skills/app-tester/scripts/check_containers.sh`
- Follow the delegation pattern to @agent-general-purpose
- Execute tests using Playwright MCP and monitoring tools

---

**Note**: These examples use the actual Haufe Hackathon application context. Adapt credentials, URLs, and specific details to match your implementation.
