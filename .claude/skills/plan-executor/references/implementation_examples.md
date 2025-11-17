# Implementation Examples

This file contains detailed examples of how the plan-executor skill works in different scenarios.

## Example 1: Formal Plan Execution (Mode 1)

**User Request:**
```
Execute the plan in tasks/EMAIL_VERIFICATION_IMPLEMENTATION_PLAN.md
```

**Skill Workflow:**

### Step 1: Determine Mode
- User provided explicit .md plan path → Mode 1 (Formal Plan)

### Step 2: Initialize
```
Reading implementation plan: tasks/EMAIL_VERIFICATION_IMPLEMENTATION_PLAN.md

**Plan Summary:**
- **Feature**: Email Verification System
- **Phases**: 4 phases
- **Files to modify/create**: 12 files
- **Testing**: Playwright tests after each phase

**Phases Overview:**
1. Phase 1: Database Schema - Add email_verified column and verification_token
2. Phase 2: Backend API - Create verification endpoints and email service
3. Phase 3: Frontend UI - Build verification flow and email sent confirmation
4. Phase 4: Integration Testing - End-to-end verification workflow

Creating TodoWrite tracker with all 4 phases...
Verifying prerequisites...

✅ Plan loaded and validated
✅ TodoWrite tracker created with 15 subtasks
✅ Prerequisites verified - all containers running

**Ready to begin Phase 1: Database Schema**

Shall I start implementation?
```

**User:** "Yes, start please"

### Step 3: Phase 1 Implementation
```
## 🚀 Phase 1: Database Schema

**Goal**: Add email verification support to users table

**Deliverables**:
- email_verified boolean column (default false)
- verification_token varchar(255) column
- Database migration file

**Files to create**:
- `backend/migrations/003_add_email_verification.sql`

**Implementation Steps**:
- Step 1.1: Create migration file
- Step 1.2: Test migration applies successfully

Beginning implementation...

[Uses Write tool to create migration file]
[Uses Bash to test migration in Docker container]

## 🧪 Testing Phase 1

**Test scenarios from plan:**

### Scenario 1: Migration applies successfully
Steps:
1. Apply migration to test database
2. Verify columns exist
3. Verify default values correct

**First, read app-tester skill requirements...**

[Reads /home/ubuntu/teo-simulare/.claude/skills/app-tester/SKILL.md]
[Reads /home/ubuntu/teo-simulare/.claude/skills/app-tester/references/testing-checklist.md]

**Now delegating to @agent-general-purpose for comprehensive testing...**

@agent-general-purpose

TASK: Comprehensive testing of Haufe Hackathon application

BEFORE STARTING, you MUST read these files to understand all testing requirements:
1. /home/ubuntu/teo-simulare/.claude/skills/app-tester/SKILL.md
2. /home/ubuntu/teo-simulare/.claude/skills/app-tester/references/testing-checklist.md

After reading those files, follow ALL requirements from app-tester skill.

USER REQUEST: Test Phase 1 - Database Schema

WHAT WAS IMPLEMENTED:
Added email verification support to users table with:
- email_verified boolean column (default false)
- verification_token varchar(255) column

TEST SCENARIOS:
**Scenario 1: Migration Applies Successfully**
Steps:
1. Apply migration to test database
2. Verify columns exist with correct types
3. Verify default values are correct

Expected:
- Migration applies without errors
- Columns exist with correct types
- Default values correct
- No database errors

Follow the app-tester skill delegation pattern and testing-checklist.md standards you read above.

Execute comprehensive testing and provide detailed report.

[Agent reads app-tester files, follows all requirements, completes testing, returns report]

✅ **Phase 1 Complete - All Tests Passed**

**Test Results:**
- ✅ Migration applied successfully
- ✅ Columns exist with correct types
- ✅ Default values correct
- ✅ No database errors

**Update TodoWrite:**
- [x] Phase 1: Database Schema - Complete
- [x] Test Phase 1 - All tests passed

**Updating plan .md file to mark Phase 1 complete...**

Phase 1 is complete and verified.

**May I proceed to Phase 2?**
```

**User:** "Yes, continue"

[Process repeats for Phases 2, 3, and 4 with testing after each]

### Step 4: Final Validation
```
## 🎯 Final Validation - All Phases Complete

**Implementation Summary:**
- ✅ Phase 1: Database Schema - Complete
- ✅ Phase 2: Backend API - Complete
- ✅ Phase 3: Frontend UI - Complete
- ✅ Phase 4: Integration Testing - Complete

**Running comprehensive final tests with @app-tester skill**

[Final tests complete]

# 🎉 Implementation Complete - Email Verification System

## ✅ Summary

**Status**: ✅ **COMPLETE**

**Implementation Details:**
- **Total Phases**: 4 completed
- **Files Created**: 8
- **Files Modified**: 4
- **Tests Passed**: All ✅

**Modified/Created Files:**

**Backend:**
- `backend/migrations/003_add_email_verification.sql` - Database schema changes
- `backend/src/services/EmailService.ts` - Email sending service
- `backend/src/controllers/AuthController.ts` - Added verification endpoints
- `backend/src/routes/auth.ts` - Added verification routes

**Frontend:**
- `frontend/src/pages/VerifyEmail.tsx` - Email verification page
- `frontend/src/services/authService.ts` - Added verification API calls
- `frontend/src/components/EmailSentNotification.tsx` - Confirmation component

---

## 📋 Next Steps

**Would you like me to:**
1. Update code structure documentation (@code-structure-guide)?
2. Create/update API documentation?
3. Anything else?
```

---

## Example 2: User-Provided Instructions (Mode 2)

**User Request:**
```
Add a "last_login" timestamp field to track when users last logged in. Update the login endpoint to set this timestamp whenever a user successfully logs in.
```

**Skill Workflow:**

### Step 1: Determine Mode
- No .md plan provided
- Request is structured but not trivial → Mode 2 (User-Provided Instructions)

### Step 2: Initialize
```
**Understanding your request:**

**Goal**: Track user last login timestamp

**Tasks identified:**
1. Add last_login column to users table (database migration)
2. Update AuthController.login() to set last_login on successful login
3. Test login endpoint updates timestamp correctly

**Estimated approach:**
- Create database migration
- Modify backend login controller
- Test with Playwright

**Files to modify/create:**
- `backend/migrations/004_add_last_login.sql` (new)
- `backend/src/controllers/AuthController.ts` (modify)
- `backend/src/repositories/UserRepository.ts` (modify - add updateLastLogin method)

Creating TodoWrite tracker...

TodoWrite:
- [ ] Create database migration for last_login column
- [ ] Add updateLastLogin method to UserRepository
- [ ] Update AuthController.login to call updateLastLogin
- [ ] Test implementation

I'll implement this in 3 steps with testing after completion.

Shall I proceed?
```

**User:** "Yes"

### Step 3: Implementation
```
## 🚀 Task 1: Create Database Migration

**Goal**: Add last_login column to users table

[Uses Write tool to create migration file]
[Tests migration applies]

TodoWrite update:
- [x] Create database migration for last_login column
- [ ] Add updateLastLogin method to UserRepository

## 🚀 Task 2: Add Repository Method

**Goal**: Add method to update last login timestamp

[Uses Read to understand UserRepository structure]
[Uses Edit to add updateLastLogin method]

TodoWrite update:
- [x] Add updateLastLogin method to UserRepository
- [ ] Update AuthController.login to call updateLastLogin

## 🚀 Task 3: Update Login Controller

**Goal**: Call updateLastLogin on successful authentication

[Uses Read to find login method]
[Uses Edit to add updateLastLogin call after authentication]

TodoWrite update:
- [x] Update AuthController.login to call updateLastLogin
- [ ] Test implementation

## 🧪 Testing Implementation

**Testing approach:**
- Test user login updates last_login timestamp
- Verify timestamp format is correct
- Check database record updated

**Invoking @app-tester skill...**

[Tests complete]

✅ **Implementation Complete - All Tests Passed**

**Test Results:**
- ✅ Login sets last_login timestamp
- ✅ Timestamp format correct (ISO 8601)
- ✅ Database updated correctly
- ✅ No console errors

**Files Modified:**
- `backend/migrations/004_add_last_login.sql` - Created
- `backend/src/repositories/UserRepository.ts` - Added updateLastLogin()
- `backend/src/controllers/AuthController.ts` - Calls updateLastLogin on login

Done! Last login tracking is now implemented and tested.
```

---

## Example 3: Quick Modification (Mode 3)

**User Request:**
```
Change the dashboard welcome message from "Welcome back!" to "Welcome to your dashboard!"
```

**Skill Workflow:**

### Step 1: Determine Mode
- Simple text change → Mode 3 (Quick Modification)

### Step 2: Execute Immediately
```
Making quick modification: Update dashboard welcome message

[Uses Grep to find "Welcome back!" in frontend]
[Finds in frontend/src/pages/Dashboard.tsx]
[Uses Edit to replace text]

✅ **Modification Complete**

**Change made:**
- Updated welcome message from "Welcome back!" to "Welcome to your dashboard!"

**Verification:**
- Change applied successfully
- No compilation errors (checked container logs)

**File modified:**
- `frontend/src/pages/Dashboard.tsx:45`

Done!
```

---

## Example 4: Plan Search by Feature Name (Mode 1)

**User Request:**
```
Implement the user dashboard feature
```

**Skill Workflow:**

### Step 1: Determine Mode
- No .md file path provided
- Searches tasks/ folder for matching plan

```
Searching tasks/ folder for plans matching "user dashboard"...

Found: tasks/USER_DASHBOARD_IMPLEMENTATION_PLAN.md

This appears to match your request. The plan includes:
- 5 phases
- Dashboard layout and components
- Data visualization
- User settings panel

Would you like me to execute this plan?
```

**User:** "Yes"

[Proceeds with Mode 1 workflow using found plan]

---

## Example 5: Handling Missing Plan (Mode 1 → Mode 2 Fallback)

**User Request:**
```
Implement password reset functionality
```

**Skill Workflow:**

### Step 1: Determine Mode
```
Searching tasks/ folder for plans matching "password reset"...

No existing implementation plan found for "password reset".

**Options:**
1. I can implement this using Mode 2 (flexible instructions) - I'll create a TodoWrite tracker and implement with testing
2. You can provide a custom implementation plan
3. Use @planning_implementation skill to create a formal plan first

How would you like to proceed?
```

**User:** "Use Mode 2"

[Proceeds with Mode 2 workflow - user-provided instructions]

---

## Key Takeaways from Examples

### Mode Selection Logic:
1. **Explicit .md path** → Always Mode 1
2. **Feature name + plan exists** → Mode 1
3. **Feature name + no plan + complex** → Ask user (Mode 1 via planning skill OR Mode 2)
4. **Simple request** → Mode 3
5. **Structured instructions** → Mode 2

### Testing Approach:
- **Mode 1**: Use test scenarios from plan
- **Mode 2**: Create general validation tests
- **Mode 3**: Quick verification only

### Documentation Updates:
- **Mode 1**: Updates both TodoWrite AND plan .md file
- **Mode 2**: Updates only TodoWrite
- **Mode 3**: No tracking needed
