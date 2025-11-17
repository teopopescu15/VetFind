# Plan Executor Best Practices

Guidelines for successful implementation execution across all three modes.

---

## Core Principles

### 0. MANDATORY Testing Delegation (MOST IMPORTANT)

**🚨 CRITICAL REQUIREMENT - READ FIRST 🚨**

ALL testing in plan-executor MUST be delegated to @agent-general-purpose. This is NOT optional.

**Testing Delegation Rules:**
- ❌ NEVER use native Task tool for testing
- ❌ NEVER execute Playwright MCP tools yourself during testing phases
- ❌ NEVER check containers yourself during testing phases
- ❌ NEVER take screenshots yourself during testing
- ✅ ALWAYS invoke @agent-general-purpose for ALL testing
- ✅ ALWAYS use the app-tester delegation pattern (see examples below)
- ✅ ALWAYS wait for comprehensive test report before proceeding

**Why This Matters:**
- Testing requires dedicated agent instance to avoid context pollution
- Comprehensive testing follows testing-checklist.md standards
- Container monitoring, log checking, and Playwright testing must be isolated
- @agent-general-purpose has full access to testing tools and can execute thoroughly

**When to Delegate:**
- Mode 1: After EVERY phase implementation
- Mode 1: Final comprehensive test after ALL phases
- Mode 2: After implementation complete
- Mode 3: Generally not needed (quick check only)

**Delegation Pattern:**
See "Using @agent-general-purpose for Testing" section below for exact templates.

---

### 1. Identify the Correct Mode

**Why**: Using the wrong mode leads to inefficiency or over-engineering.

**Decision Process:**
1. Check if user provided explicit .md path → Mode 1
2. Search for existing plan by feature name → Mode 1 if found
3. Evaluate complexity:
   - Simple text/style change → Mode 3
   - Structured multi-step task → Mode 2
   - Major feature without plan → Ask user (suggest planning skill OR Mode 2)

**Examples:**
```
"Execute tasks/USER_AUTH.md" → Mode 1 (explicit path)
"Implement user authentication" + plan exists → Mode 1 (search found it)
"Fix typo in header" → Mode 3 (simple)
"Add email field to registration form with validation" → Mode 2 (structured, no plan)
```

---

### 2. Test Appropriately for Each Mode

**Why**: Different modes require different testing rigor.

**Mode 1 (Formal Plan):**
- ✅ Use test scenarios from plan
- ✅ Test after EVERY phase
- ✅ Comprehensive final validation
- ✅ @app-tester skill for all testing

**Mode 2 (User Instructions):**
- ✅ Create general validation tests
- ✅ Test after implementation complete
- ✅ @app-tester skill for testing
- ✅ Cover happy path + edge cases

**Mode 3 (Quick Modification):**
- ✅ Quick visual/functional check
- ✅ Verify no errors in container logs
- ❌ No @app-tester needed (unless critical)

---

### 3. Track Progress Appropriately

**Mode 1:**
- Create TodoWrite with ALL phases and steps
- Update TodoWrite as steps complete
- ALSO update .md plan file in real-time
- Mark checkboxes: `- [ ]` → `- [x]`

**Mode 2:**
- Create TodoWrite with identified tasks
- Update as tasks complete
- No .md file to maintain

**Mode 3:**
- Optional TodoWrite (usually not needed)
- Direct execution

---

### 4. Follow Project Structure

**Always:**
- Consult @code-structure-guide BEFORE creating/modifying files
- Backend: Routes → Controllers → Repositories → Types
- Frontend: Pages → Components → Services → Types
- Place files in correct directories

**Never:**
- Don't guess file locations
- Don't create files in wrong directories
- Don't skip structure consultation

---

### 5. Handle Failures Properly

**Test Failures:**
1. ❌ Identify what failed and why
2. 🔍 Analyze root cause
3. 🛠️ Implement fix
4. 🧪 Re-test immediately
5. ✅ Verify all tests pass before proceeding

**DO NOT:**
- ❌ Proceed with failing tests
- ❌ Skip re-testing after fixes
- ❌ Hide failures from user
- ❌ Make assumptions about fixes

---

## Mode-Specific Best Practices

### Mode 1: Formal Plan Execution

**Reading the Plan:**
- Read entire plan first to understand scope
- Extract all phases and steps
- Identify test scenarios
- Note prerequisites

**Prerequisites Verification:**
```
Check:
- [ ] Docker containers running (sudo docker compose ps)
- [ ] Database accessible
- [ ] Dependencies installed
- [ ] Existing features working
```

If any prerequisite fails, report to user and wait for resolution.

**Phase Implementation:**
1. Announce phase start with goal and deliverables
2. Implement all steps in order
3. Update TodoWrite as each step completes
4. Update .md plan file in real-time
5. Test with scenarios from plan
6. Get user confirmation before next phase

**Plan File Updates:**

Always keep the .md file in sync with progress:

```markdown
### Phase 2: 2025-10-29 15:30
- [x] Step 2.1: Create UserRepository methods
- [x] Step 2.2: Add type definitions
- [x] Step 2.3: Implement error handling
- [x] Testing: All tests passed
- [x] Issues: None
```

Use Edit tool to transform checkboxes after each step.

**User Communication:**
- Clear phase completion announcements
- Detailed test results
- Ask permission between phases
- Report any issues immediately

---

### Mode 2: User-Provided Instructions

**Parsing Instructions:**
1. Extract clear goal
2. Identify all tasks
3. Determine files to modify/create
4. Estimate approach

**Present Understanding:**
```
**Understanding your request:**

**Goal**: [What needs to be done]

**Tasks identified:**
1. [Task 1]
2. [Task 2]

**Files to modify/create:**
- [Files list]

Shall I proceed?
```

Wait for user confirmation before starting.

**Implementation:**
- Create TodoWrite tracker
- Implement tasks in logical order
- Update TodoWrite as you go
- Test after completion

**Testing:**
Since no formal test scenarios exist, create sensible tests:
- Happy path functionality
- Basic validation
- Integration with existing features
- No console errors

---

### Mode 3: Quick Modifications

**Identify Quick Modifications:**
- Single-file text changes
- Style/color tweaks
- Simple configuration updates
- Typo fixes
- Version number updates

**Execution:**
1. Acknowledge what you're changing
2. Find file with Grep (if needed)
3. Make change with Edit
4. Quick verification (container logs, visual check)
5. Confirm complete

**Example:**
```
Making quick modification: Fix typo in login button

[Grep finds: frontend/src/pages/Login.tsx]
[Edit changes "Logn" to "Login"]

✅ Modification Complete

**Change made:**
- Fixed typo in login button text

**File modified:**
- `frontend/src/pages/Login.tsx:87`

Done!
```

**When NOT to use Mode 3:**
- Multi-file changes
- Logic changes (not just text)
- Changes affecting multiple features
- Database modifications
- API changes

→ Use Mode 2 instead

---

## Testing Best Practices

### When to Test

**Mode 1:**
- After EVERY phase
- Comprehensive final test after all phases

**Mode 2:**
- After implementation complete
- Before marking done

**Mode 3:**
- Quick check only (unless critical change)

### Using @agent-general-purpose for Testing (MANDATORY)

**🚨 CRITICAL TESTING REQUIREMENT 🚨**

ALL testing MUST be delegated to @agent-general-purpose using the app-tester skill pattern.

**NEVER:**
- ❌ Use native Task tool for testing
- ❌ Execute Playwright tests yourself
- ❌ Check containers yourself during testing phase
- ❌ Take screenshots yourself
- ❌ Skip the delegation step
- ❌ Duplicate app-tester requirements in your prompt

**ALWAYS:**
- ✅ Read app-tester skill files BEFORE delegation
- ✅ Instruct @agent-general-purpose to read app-tester files
- ✅ Let @agent-general-purpose follow app-tester standards
- ✅ Wait for comprehensive test report
- ✅ Review full report before proceeding

**Delegation Pattern (Modular - No Duplication):**

```
First, read the app-tester requirements:
- Read: /home/ubuntu/teo-simulare/.claude/skills/app-tester/SKILL.md
- Read: /home/ubuntu/teo-simulare/.claude/skills/app-tester/references/testing-checklist.md

Then invoke @agent-general-purpose:

@agent-general-purpose

TASK: Comprehensive testing of Haufe Hackathon application

BEFORE STARTING, you MUST read these files to understand all testing requirements:
1. /home/ubuntu/teo-simulare/.claude/skills/app-tester/SKILL.md
2. /home/ubuntu/teo-simulare/.claude/skills/app-tester/references/testing-checklist.md

After reading those files, follow ALL requirements from app-tester skill.

USER REQUEST: Test Phase [N] - [Phase Name]

WHAT WAS IMPLEMENTED:
[Describe what was implemented in this phase]

TEST SCENARIOS:
**Scenario 1: User Registration**
Steps:
1. Navigate to /register
2. Fill form with valid data
3. Click submit
4. Verify success message

Expected:
- User created in database
- Redirect to dashboard
- No console errors

**Scenario 2: [Next scenario]**
[Continue with all test scenarios]

Follow the app-tester skill delegation pattern and testing-checklist.md standards you read above.

Execute comprehensive testing and provide detailed report.
```

**Why This Approach:**
- **Single source of truth**: All testing requirements in app-tester skill
- **Modularity**: Changes to app-tester automatically apply
- **No duplication**: Avoids contradictions between skills
- **Fresh context**: @agent-general-purpose reads latest requirements every time

**After Delegation:**

Wait for @agent-general-purpose to complete ALL testing and provide comprehensive report. Do NOT proceed until report received.

### Handling Test Results

**All Tests Pass:**
```
✅ **All Tests Passed**

**Results:**
- ✅ Scenario 1: PASSED
- ✅ Scenario 2: PASSED
- ✅ No console errors

[Update TodoWrite and plan .md if Mode 1]

**May I proceed to next phase?** (Mode 1)
or
**Implementation complete!** (Mode 2/3)
```

**Tests Fail:**
```
⚠️ **Issues Found**

**Results:**
- ✅ Scenario 1: PASSED
- ❌ Scenario 2: FAILED - Form validation not working
  - Error: Email regex incorrect
  - Location: frontend/src/components/RegisterForm.tsx:45

**Root Cause:**
The email regex pattern is missing the @ symbol check

**Fix Strategy:**
Update regex pattern to: /^[^\s@]+@[^\s@]+\.[^\s@]+$/

**Implementing fix...**

[Implement fix]

**Re-testing...**

[Test again]

✅ All tests now passing after fix
```

---

## File Management Best Practices

### Reading Before Modifying

**Always:**
1. Use Read tool to understand current code
2. Identify where to make changes
3. Understand existing patterns
4. Check for similar implementations

**Example:**
```
Before adding validation to LoginController:
1. Read existing validation in RegisterController
2. Follow same pattern
3. Maintain consistency
```

### Editing vs Writing

**Prefer Edit for:**
- Modifying existing files
- Adding methods to existing classes
- Updating configurations
- Changing existing logic

**Use Write for:**
- New files only
- Migration files
- New components
- New services

**Never:**
- Don't use Write to overwrite existing files
- Don't use Edit without reading first

### Following Structure Rules

**Before creating ANY file:**

1. Consult @code-structure-guide
2. Determine correct directory
3. Follow naming conventions
4. Place in appropriate layer

**Backend Structure:**
```
backend/src/
├── routes/          → Express route definitions only
├── controllers/     → Business logic, validation
├── repositories/    → Database access only
├── services/        → External services (email, etc.)
├── types/           → TypeScript interfaces
└── middleware/      → Express middleware
```

**Frontend Structure:**
```
frontend/src/
├── pages/           → Full page components (Dashboard, Login, etc.)
├── components/      → Reusable UI components
├── services/        → API client functions
├── types/           → TypeScript interfaces
└── hooks/           → Custom React hooks
```

---

## UI/UX Best Practices (Frontend Work)

### Always Consult References

**Before implementing frontend UI:**

1. **Colors**: Read `@ui-ux-designer/references/color_palettes.md`
   - Use defined color scheme (Nexus, Aurora, or Monochrome)
   - Follow gradient patterns
   - Use correct icon colors

2. **Responsive**: Read `@ui-ux-designer/references/responsive_design.md`
   - Follow breakpoint strategy
   - Use responsive patterns
   - Test all screen sizes

3. **Components**: Read `@ui-ux-designer/references/shadcn_components.md`
   - Use shadcn components via MCP
   - Follow component patterns
   - Maintain design consistency

### Testing UI/UX

**Always test:**
- Desktop view (1920px)
- Tablet view (768px)
- Mobile view (375px)
- Browser console (no errors)
- Accessibility (keyboard navigation, ARIA labels)

---

## Communication Best Practices

### Clear Announcements

**Phase/Task Start:**
```
## 🚀 Phase 2: Backend API Layer

**Goal**: Create authentication endpoints

**Deliverables**:
- Login endpoint
- Logout endpoint
- Token validation middleware

**Files to modify/create**:
- `backend/src/controllers/AuthController.ts` (new)
- `backend/src/routes/auth.ts` (modify)
- `backend/src/middleware/authMiddleware.ts` (new)

Beginning implementation...
```

**Phase/Task Complete:**
```
✅ **Phase 2 Complete - All Tests Passed**

**Completed:**
- ✅ All endpoints implemented
- ✅ Validation working
- ✅ Tests passing

Phase 2 verified.

**May I proceed to Phase 3?**
```

### Reporting Issues

**Be specific:**
```
❌ Test failed: User registration form validation

**Error**: Form submits with invalid email
**Location**: frontend/src/components/RegisterForm.tsx:45
**Root Cause**: Missing email validation check
**Fix**: Add email regex validation before form submission
```

### Getting User Approval

**Between phases:**
```
Phase [N] complete! May I proceed to Phase [N+1]?
```

**Before starting:**
```
I'll implement this in [X] steps with testing after completion.

Shall I proceed?
```

**Before major operations:**
```
Would you like me to update code structure documentation?
```

---

## Common Pitfalls

### Pitfall 1: Wrong Mode Selection
**Symptom**: Using Mode 1 for simple text changes or Mode 3 for complex features
**Problem**: Inefficiency or inadequate rigor
**Solution**: Follow mode selection decision tree

### Pitfall 2: Skipping Tests
**Symptom**: Proceeding without testing (especially in Mode 1)
**Problem**: Bugs compound, hard to debug later
**Solution**: ALWAYS test after each phase (Mode 1) or after implementation (Mode 2)

### Pitfall 3: Ignoring Structure Rules
**Symptom**: Creating files in wrong directories
**Problem**: Violates architecture, causes confusion
**Solution**: Always consult @code-structure-guide first

### Pitfall 4: Not Reading Before Editing
**Symptom**: Making changes without understanding existing code
**Problem**: Breaks existing functionality, inconsistent patterns
**Solution**: Always Read first, understand context, then Edit

### Pitfall 5: Batch Phases Without Testing (Mode 1)
**Symptom**: Implementing multiple phases before any testing
**Problem**: Violates plan, accumulates bugs
**Solution**: Test after EVERY phase, no exceptions

### Pitfall 6: Forgetting Plan Updates (Mode 1)
**Symptom**: TodoWrite updated but .md plan file not updated
**Problem**: Plan becomes stale, loses value as implementation log
**Solution**: Update both TodoWrite AND .md file in real-time

### Pitfall 7: Proceeding with Failed Tests
**Symptom**: Moving to next phase despite test failures
**Problem**: Building on broken foundation
**Solution**: Fix immediately, re-test, verify all pass, THEN proceed

### Pitfall 8: Not Consulting UI/UX References
**Symptom**: Frontend work without checking color schemes or component patterns
**Problem**: Inconsistent styling, wrong colors, poor UX
**Solution**: Always read UI/UX reference files before implementing frontend

---

## Success Checklist

### Before Starting
- [ ] Identified correct mode (1, 2, or 3)
- [ ] Read plan (Mode 1) or parsed instructions (Mode 2)
- [ ] Created TodoWrite tracker (Modes 1 & 2)
- [ ] Verified prerequisites (Mode 1)
- [ ] Got user approval to start

### During Implementation
- [ ] Consulting @code-structure-guide for file placement
- [ ] Reading existing code before modifying
- [ ] Using Edit for existing files, Write for new files only
- [ ] Consulting @ui-ux-designer references for frontend work
- [ ] Updating TodoWrite in real-time
- [ ] Updating .md plan file in real-time (Mode 1 only)

### Testing
- [ ] Testing after EVERY phase (Mode 1) or after completion (Mode 2)
- [ ] Using @app-tester skill appropriately
- [ ] Fixing failures immediately
- [ ] Re-testing after fixes
- [ ] Verifying all tests pass before proceeding

### Communication
- [ ] Clear phase/task announcements
- [ ] Detailed test result reporting
- [ ] Getting user confirmation between phases (Mode 1)
- [ ] Asking before structure doc updates

### Completion
- [ ] All phases/tasks complete
- [ ] All tests passing
- [ ] TodoWrite fully checked off
- [ ] .md plan fully updated (Mode 1 only)
- [ ] Completion report generated
- [ ] Structure docs updated (if approved)

---

**Last Updated**: 2025-10-29
**Version**: 1.0.0
