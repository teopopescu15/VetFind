# Plan Mode Best Practices

Guidelines for successful planning using plan mode workflow.

---

## 🎯 Core Principles

### 1. Plan Before Code
**Why**: Comprehensive planning prevents wasted effort and missed requirements.

**DO**:
- ✅ Ask all clarifying questions upfront
- ✅ Document requirements clearly
- ✅ Identify constraints and edge cases
- ✅ Break down into logical phases
- ✅ Define success criteria

**DON'T**:
- ❌ Start coding without a plan
- ❌ Assume you understand all requirements
- ❌ Skip constraint identification
- ❌ Create phases that are too large
- ❌ Leave success criteria vague

---

### 2. User Involvement
**Why**: User approval ensures alignment and prevents rework.

**DO**:
- ✅ Present plan for approval before creating file
- ✅ Ask for confirmation between phases
- ✅ Report test results clearly
- ✅ Request permission before updating structure docs
- ✅ Communicate issues and solutions

**DON'T**:
- ❌ Create plan file without approval
- ❌ Proceed to next phase without confirmation
- ❌ Hide test failures
- ❌ Update documentation without asking
- ❌ Make assumptions about user intent

---

### 3. Include Testing Requirements in Plan
**Why**: Comprehensive test scenarios ensure quality implementation.

**DO**:
- ✅ Define test scenarios for each phase
- ✅ Include happy path, edge cases, and error scenarios
- ✅ Specify what to verify (console, database, UI)
- ✅ Document expected outcomes clearly
- ✅ Plan for integration testing

**DON'T**:
- ❌ Create plans without testing requirements
- ❌ Only plan for happy path testing
- ❌ Leave test scenarios vague
- ❌ Forget to specify validation criteria
- ❌ Omit edge case testing from plan

---

### 4. Document Everything in Plan
**Why**: Complete documentation enables smooth execution.

**DO**:
- ✅ Document all phases with clear goals
- ✅ Include file paths and locations
- ✅ Specify exact code changes where possible
- ✅ Define acceptance criteria
- ✅ Reference structure guide compliance

**DON'T**:
- ❌ Leave vague instructions
- ❌ Forget to specify file locations
- ❌ Omit success criteria
- ❌ Skip prerequisite documentation
- ❌ Assume executor knows implementation details

---

## 📋 Requirements Gathering

### Questions to Ask if unclarity

**Functionality**:
- What is the main purpose of this feature?
- How should users interact with it?
- What data needs to be stored?
- What should happen on success? On failure?

**Integration**:
- Does this integrate with existing features?
- Are there API endpoints to create/modify?
- Does it affect existing database tables?
- Will it impact other parts of the system?

**Constraints**:
- Are there any mandatory constraints?
- Security requirements?
- Performance requirements?
- Browser/device compatibility?

**Testing**:
- What scenarios should be tested?
- Are there specific edge cases?
- How should errors be handled?
- What does "done" look like?

---

## 🏗️ Phase Planning

### Characteristics of Good Phases

**Size**:
- 1-4 hours of implementation work
- Not too small (avoid 20-minute phases)
- Not too large (avoid 8-hour phases)

**Independence**:
- Each phase has clear deliverables
- Phase can be tested independently
- Failure doesn't block other phases unnecessarily

**Logical Grouping**:
- Database schema together
- Backend layer together (models, repos, controllers)
- Frontend layer together (types, services, components)
- Testing and deployment separate

**Dependencies**:
- Clear dependencies between phases
- Earlier phases provide foundation
- Later phases build on validated work

### Example Phase Breakdown

**Good Example**:
```
Phase 1: Database Schema (2h)
- Create tables
- Add indexes
- Test with sample data

Phase 2: Backend Models & Repositories (3h)
- Define TypeScript interfaces
- Implement repository functions
- Test database operations

Phase 3: Backend Controllers & Routes (3h)
- Implement business logic
- Add validation
- Test API endpoints

Phase 4: Frontend Types & Services (2h)
- Define frontend types
- Implement API client
- Test service methods

Phase 5: Frontend Components (4h)
- Build UI components
- Add forms
- Test user interactions
```

**Bad Example**:
```
Phase 1: Everything Backend (12h)
- Database, models, repos, controllers, routes all together
- Too large, hard to test
- Issues hard to isolate

Phase 2: Frontend (10h)
- Everything frontend at once
- No incremental testing
- Overwhelming scope
```

---

## 🧪 Testing Strategy

### Test Coverage

**Every Phase Must Include**:
1. **Happy Path**: Normal operation with valid data
2. **Validation**: Invalid inputs handled correctly
3. **Edge Cases**: Boundary conditions work
4. **Errors**: Error conditions handled gracefully
5. **Integration**: Works with existing features

### Playwright Test Quality

**Good Test Scenario**:
```markdown
**Scenario: Create New Habit**

Setup:
- User logged in
- On dashboard page

Steps:
1. Navigate to /dashboard
2. Click "Create Habit" button
3. Fill "name" with "Morning Meditation"
4. Select category "mindfulness"
5. Select schedule "daily"
6. Select difficulty "beginner"
7. Click "Save" button
8. Wait for success message

Expected:
- API POST /api/habits returns 201
- Success message displayed
- New habit appears in list
- Database has new habit record

Verification:
- [ ] Habit visible on dashboard
- [ ] Habit has correct properties
- [ ] No console errors
- [ ] Database updated
```

**Bad Test Scenario**:
```markdown
**Scenario: Test habit creation**

Steps:
1. Create a habit
2. Check it works

Expected:
- It works

Verification:
- [ ] Works
```

---

## 🧪 Test Scenario Quality Standards

### Characteristics of Good Test Scenarios in Plans

**REMEMBER**: Test scenarios in plans will be executed by @agent-general-purpose via app-tester skill.
They must be detailed enough for automated execution without human interpretation.

#### Required Elements Checklist

Every test scenario in a plan MUST include:

- [ ] **Descriptive name**: Clearly states what is being tested
- [ ] **Purpose statement**: One sentence explaining validation goal
- [ ] **Setup/Preconditions**: Explicit starting state (auth, page, data)
- [ ] **Numbered test steps**: Exact actions with specific elements
- [ ] **Expected outcomes**: Measurable results for UI, API, database, logs
- [ ] **Verification checklist**: Specific pass/fail criteria
- [ ] **Error scenarios**: How errors should be handled
- [ ] **Screenshot requirements**: When to capture evidence
- [ ] **MCP tools specification**: Which tools will be used

#### Test Scenario Quality Levels

**❌ Bad Example** (too vague for automation):
```markdown
**Scenario: Test login**
Steps:
1. Login
2. Check it works

Expected:
- User is logged in
```

**⚠️ Mediocre Example** (missing details):
```markdown
**Scenario: User Login**
Steps:
1. Navigate to login page
2. Enter credentials
3. Click login button
4. Verify dashboard appears

Expected:
- User sees dashboard
```

**✅ Good Example** (automation-ready):
```markdown
**Scenario: Successful User Login with Valid Credentials**

**Purpose**: Validate authentication flow redirects to dashboard on success

**Setup/Preconditions**:
- User exists in database: email=teopopescu15@gmail.com, password=TeoHack$44
- User is NOT authenticated (logged out)
- Starting page: Login page (https://app.hackathon-haufe-teo.com/)
- All containers (haufe-frontend, haufe-backend, haufe-postgres) running

**Test Steps**:
1. Navigate to https://app.hackathon-haufe-teo.com/ using Playwright MCP browser_navigate
2. Wait for login form to be visible (heading: "Welcome Back") using browser_wait_for
3. Locate email input field (label: "Email" or placeholder: "Enter your email")
4. Fill email field with: "teopopescu15@gmail.com" using browser_type
5. Locate password input field (label: "Password")
6. Fill password field with: "TeoHack$44" using browser_type
7. Click "Sign In" button using browser_click
8. Wait for page navigation or loading indicator using browser_wait_for

**Expected Outcomes**:
- **HTTP**: POST request to `/api/auth/login` returns 200
- **HTTP**: Response includes authentication token in cookie or response body
- **UI**: Page redirects to `/dashboard` or `/menu`
- **UI**: Dashboard heading displays: "Welcome, Teo"
- **UI**: Navigation shows authenticated user menu
- **Console**: No JavaScript errors (check with browser_console_messages)
- **Logs**: Backend logs show successful authentication entry (check with Bash)

**Verification Checklist**:
- [ ] URL changes to /dashboard or /menu (not /login)
- [ ] Dashboard heading is visible with user greeting
- [ ] User menu shows logged-in state
- [ ] Authentication token is stored (cookie or localStorage)
- [ ] No console errors in browser (browser_console_messages)
- [ ] Backend logs show successful login for teopopescu15@gmail.com
- [ ] No errors in any container logs (docker compose logs)

**Error Scenarios**:
1. **Invalid password**:
   - Fill email with "teopopescu15@gmail.com"
   - Fill password with "WrongPass123"
   - Click "Sign In"
   - Expected: Error message "Invalid credentials" displays below form
   - Expected: URL stays on /login
   - Expected: No authentication token set

2. **Empty fields**:
   - Leave both fields empty
   - Click "Sign In"
   - Expected: Validation messages appear for both fields
   - Expected: Form does not submit

**Responsive Testing**:
- Test at 375x667 (iPhone SE) using browser_resize
- Verify: Form fields are large enough to tap (min 44px height)
- Verify: No horizontal scrolling
- Verify: Error messages are visible

**Screenshot Requirements**:
- Capture on any failure using browser_take_screenshot
- Capture successful dashboard after login (for documentation)

**MCP Tools Used**:
- mcp__playwright__browser_navigate
- mcp__playwright__browser_wait_for
- mcp__playwright__browser_type
- mcp__playwright__browser_click
- mcp__playwright__browser_console_messages
- mcp__playwright__browser_take_screenshot
- mcp__playwright__browser_resize (for responsive testing)
```

#### Test Scenario Patterns by Feature Type

**Authentication Features**:
- Include test credentials explicitly
- Test both success and failure paths
- Verify token/cookie storage
- Test logout flow
- Test protected route access
- Use Playwright MCP for browser automation

**CRUD Features**:
- Test create with valid data
- Test read/list with multiple records
- Test update with changes
- Test delete with confirmation
- Test validation errors
- Verify database persistence with SQL queries
- Check container logs for API requests

**UI Component Features**:
- Test component renders without errors
- Test all interactive elements (buttons, inputs, links)
- Test responsive behavior at key viewports (use browser_resize)
- Test loading states
- Test error states
- Test empty states
- Verify accessibility (keyboard navigation if applicable)
- Use browser_snapshot for accessibility tree

**API Integration Features**:
- Test API call is made with correct parameters
- Test response handling (success and errors)
- Test data transformation (backend → frontend)
- Test error display to user
- Verify network tab shows expected requests
- Check backend logs for API activity

#### Common Test Scenario Mistakes to Avoid

1. **Vague element references**: "Click the button" → "Click the 'Submit' button in the form footer using browser_click"
2. **Missing expected outcomes**: Only UI outcomes → Include API, database, logs
3. **No error testing**: Only happy path → Include validation, errors, edge cases
4. **Implied setup**: Assumes logged in → Explicitly state authentication state
5. **Generic verification**: "Works correctly" → Specific measurable checks
6. **Missing container logs**: Only UI checks → Include backend/DB log verification
7. **No responsive specs**: "Test mobile" → "Test at 375px width using browser_resize, verify [specific behavior]"
8. **Missing MCP tool specs**: Not specifying which Playwright MCP functions → List exact MCP tools

### Test Coverage Requirements in Plans

Every implementation plan MUST include test scenarios for:

**Per-Phase Testing**:
- [ ] Happy path: Feature works with valid inputs
- [ ] Validation: Invalid inputs handled correctly
- [ ] Edge cases: Boundary conditions work
- [ ] Error handling: Errors displayed appropriately
- [ ] Integration: Works with existing features

**Final Comprehensive Testing**:
- [ ] End-to-end workflows: Complete user journeys
- [ ] Cross-feature integration: Interaction with other features
- [ ] Responsive design: All priority viewports
- [ ] Performance: Acceptable load times
- [ ] Security: User isolation, input sanitization (if applicable)

### Responsive Testing Specification

When plans include frontend work, specify responsive testing with exact viewports:

**Priority Viewports** (reference @ui-ux-designer standards):
```markdown
**Responsive Testing Requirements**:

**Desktop**:
- 1920x1080 (primary desktop) - browser_resize(1920, 1080)
- 1366x768 (laptop) - browser_resize(1366, 768)
- Verify: [desktop-specific behaviors]

**Tablet**:
- 768x1024 (iPad portrait) - browser_resize(768, 1024)
- Verify: [tablet adaptations]

**Mobile**:
- 375x667 (iPhone SE - minimum supported) - browser_resize(375, 667)
- 414x896 (iPhone 11 Pro Max) - browser_resize(414, 896)
- Verify: [mobile-specific behaviors]
  - Navigation collapses to hamburger menu
  - Touch targets minimum 44x44px
  - No horizontal scrolling
  - Content reflows properly
  - Images scale appropriately
```

### Test Data Specification

Plans should include explicit test data:

```markdown
**Test Data Requirements**:

**Existing Data** (must exist in database before testing):
- User account: email=teopopescu15@gmail.com, password=TeoHack$44
- Product records: [at least 5 products for list testing]
- [Any other prerequisite data]

**Data to Create During Tests**:
- New habit: name="Morning Meditation", category="mindfulness"
- New order: product_id=1, quantity=2
- [Data created during test execution]

**Data Cleanup** (if needed):
- Tests create data in transactions (auto-rollback)
- OR: Cleanup step at end of test
- OR: Use test database that resets
```

### MCP Tool Specification for Tests

Always specify which MCP tools will be used in test scenarios:

**Playwright MCP Tools** (mcp__playwright__*):
- `browser_navigate`: Navigate to URLs
- `browser_snapshot`: Get page accessibility tree
- `browser_click`: Click elements
- `browser_type`: Enter text in fields
- `browser_fill_form`: Fill multiple form fields
- `browser_wait_for`: Wait for elements/text
- `browser_take_screenshot`: Capture evidence
- `browser_console_messages`: Check for errors
- `browser_resize`: Test responsive behavior
- `browser_select_option`: Select dropdown options
- `browser_network_requests`: Monitor API calls

**Tavily MCP Tools** (if external data needed):
- `tavily_search`: Search web for test data
- `tavily_extract`: Extract content from URLs

**Standard Tools**:
- `Bash`: Check container health and logs
- `Grep`: Search for error patterns
- `Read`: Verify generated files

---

**Remember**: The better your test scenarios in plans, the more effective @agent-general-purpose
will be at automated testing via app-tester skill. Invest time in detailed scenario design during
planning to save debugging time during execution.

---

## 🎯 Test Scenario Quality Validation Checklist

Before presenting a plan to the user, validate ALL test scenarios against this checklist:

### Phase Testing Validation (Check EVERY scenario in EVERY phase)

For each test scenario in the plan, verify:

#### Structure Validation ✓
- [ ] Has descriptive name explaining what is being tested
- [ ] Includes purpose statement (one sentence)
- [ ] Has Setup/Preconditions section
- [ ] Has numbered Test Steps (not bullet points)
- [ ] Has Expected Outcomes section
- [ ] Has Verification Checklist section
- [ ] Includes Error Scenarios (at least 1)
- [ ] Has MCP Tools Used section
- [ ] Has Screenshot Requirements section

#### Content Validation ✓
- [ ] Setup specifies authentication state explicitly (logged in/out)
- [ ] Setup specifies starting page/URL (complete URL)
- [ ] Setup lists required data in database
- [ ] Steps use specific element descriptions (not "click button" but "click 'Submit' button")
- [ ] Steps include wait conditions where needed
- [ ] Steps specify which MCP tool to use (browser_click, browser_type, etc.)
- [ ] Expected outcomes cover ALL of: UI, API/HTTP, Database, Logs, Console
- [ ] Expected outcomes are measurable (not "works" but "displays text 'Success'")
- [ ] Verification has specific checkboxes (minimum 8-12 items)
- [ ] Error scenarios specify exact error messages expected

#### Automation Readiness ✓
- [ ] @agent-general-purpose could execute this with Playwright without human clarification
- [ ] Element references are specific enough to locate in DOM
- [ ] Expected outcomes can be verified programmatically
- [ ] Test data is explicitly provided (no "use appropriate values")
- [ ] URLs are complete (not "/page" but "https://app.hackathon-haufe-teo.com/page")
- [ ] MCP tools are correctly named (mcp__playwright__browser_navigate, etc.)

#### Coverage Validation (Per Phase) ✓
- [ ] Happy path scenario included
- [ ] At least one validation/error scenario included
- [ ] If UI feature: responsive behavior specified with exact viewports
- [ ] If API feature: HTTP status codes specified
- [ ] If database feature: database checks with SQL queries specified
- [ ] Container log verification included (docker compose logs)

### Final Testing Section Validation

After all phases, plan must include:

- [ ] "Final Comprehensive Testing" section
- [ ] End-to-end workflow scenarios (complete user journeys)
- [ ] Cross-feature integration tests
- [ ] Performance validation (if applicable)
- [ ] Security validation (if applicable)
- [ ] All priority viewports tested (if frontend feature):
  - Desktop: 1920x1080, 1366x768
  - Tablet: 768x1024
  - Mobile: 375x667, 414x896

### Red Flags 🚩 (Fix Before Presenting Plan)

If you see any of these in test scenarios, the plan is NOT ready:

- ❌ "Test that it works" (too vague)
- ❌ "Verify the component renders" without specifying how to verify
- ❌ "Check for errors" without specifying what errors where
- ❌ Steps say "enter data" without specifying exact test data
- ❌ No specific element identifiers (just "click the button")
- ❌ No expected HTTP status codes for API calls
- ❌ No database verification for CRUD operations
- ❌ No error scenario testing
- ❌ Verification checklist has items like "Everything works"
- ❌ Missing responsive viewport specifications for UI features
- ❌ Missing MCP tool specifications
- ❌ URLs without domain (relative paths instead of absolute)

### Green Flags ✅ (Quality Test Scenarios)

Good test scenarios have:

- ✅ Specific element descriptions: "Click 'Add to Cart' button below product image using browser_click"
- ✅ Exact test data: "Fill email with 'teopopescu15@gmail.com' using browser_type"
- ✅ Measurable outcomes: "API returns 201 status", "Badge shows '1'"
- ✅ Database checks: "Table orders has new record with user_id=5"
- ✅ Log verification: "Backend logs show POST /api/cart with 201 response"
- ✅ Error messages: "Expected error message: 'Email is required'"
- ✅ Responsive specs: "At viewport 375x667 using browser_resize, cards stack vertically"
- ✅ Multiple verification points: 8-12 specific checkboxes
- ✅ MCP tools specified: "using browser_navigate", "using browser_click"
- ✅ Complete URLs: "https://app.hackathon-haufe-teo.com/menu"

### Quality Gate Decision Tree

```
START: Review all test scenarios
    ↓
Are all scenarios structured correctly? (9 required sections)
    NO → FIX: Add missing sections
    YES ↓
Do all scenarios have specific, measurable outcomes?
    NO → FIX: Replace vague outcomes with specific ones
    YES ↓
Are MCP tools specified for each action?
    NO → FIX: Add MCP tool specifications
    YES ↓
Are there 8-12 verification checkpoints per scenario?
    NO → FIX: Add more specific checkpoints
    YES ↓
Do error scenarios exist for each feature?
    NO → FIX: Add error scenarios
    YES ↓
Are URLs complete with domain?
    NO → FIX: Add full URLs
    YES ↓
READY: Present plan to user
```

### Final Checklist Before Presenting Plan

- [ ] All test scenarios pass structure validation (9 sections each)
- [ ] All test scenarios pass content validation (specific, measurable)
- [ ] All test scenarios pass automation readiness (executable by agent)
- [ ] All phases have appropriate test coverage
- [ ] Final comprehensive testing section exists
- [ ] No red flags present
- [ ] Multiple green flags present
- [ ] Quality gate passed

---

**Quality Standard**: Do NOT present a plan to the user until ALL test scenarios pass this validation checklist.
Poor test scenarios = ineffective automated testing = implementation delays = user frustration.

**Time Investment**: Spend 20-30% of planning time on test scenario quality. This investment saves 50-70% debugging time during execution.

---

## 📝 Plan Document Quality

### Good Plan Characteristics

**Specificity**:
- Exact file paths (not "update the controller")
- Line numbers or context ("after the `login` method")
- Specific code snippets (not "add validation logic")

**Completeness**:
- All files identified
- All modifications documented
- All test scenarios defined
- All constraints listed

**Clarity**:
- Clear phase goals
- Unambiguous instructions
- Expected outcomes defined
- Success criteria measurable

### Plan Document Checklist

Before presenting plan to user:

- [ ] Prerequisites clearly listed
- [ ] Requirements fully captured
- [ ] Constraints identified and detailed
- [ ] All phases have clear goals
- [ ] Each phase has test scenarios
- [ ] File paths are exact
- [ ] Code snippets provided where needed
- [ ] Acceptance criteria measurable
- [ ] Estimated times realistic

---

## 🎯 Common Pitfalls in Planning

### Pitfall 1: Skipping Codebase Exploration
**Symptom**: Jump straight to questions without exploring
**Problem**: Ask about things that already exist, miss patterns
**Solution**: Always use @explore-codebase FIRST (Step 0.5)

### Pitfall 2: Large Phases in Plan
**Symptom**: Plan has phases taking 6+ hours each
**Problem**: Hard for executor to manage, test, and debug
**Solution**: Break into smaller 2-4 hour phases in the plan

### Pitfall 3: Missing Testing Requirements
**Symptom**: Plan doesn't specify what/how to test
**Problem**: Executor doesn't know what to verify
**Solution**: Include detailed test scenarios for every phase

### Pitfall 4: Vague Instructions
**Symptom**: Plan says "add validation" without details
**Problem**: Ambiguous, hard to implement correctly
**Solution**: Be specific with file paths, code examples, and expected behavior

### Pitfall 5: Missing Constraints
**Symptom**: Plan created without identifying constraints
**Problem**: Implementation violates security, architecture, or business rules
**Solution**: Identify and document all constraints upfront in plan

### Pitfall 6: No File Placement Guidance
**Symptom**: Plan doesn't specify where files should go
**Problem**: Executor places files in wrong locations
**Solution**: Always reference @code-structure-guide and specify exact paths

### Pitfall 7: Poor Test Scenarios in Plan
**Symptom**: Only test happy path
**Problem**: Edge cases and errors not caught
**Solution**: Include validation, edge cases, error scenarios

---

## ✅ Success Indicators for Good Plans

You're creating quality plans when:

1. **Exploration is Complete**:
   - Explored codebase with @explore-codebase
   - Consulted @ui-ux-designer for frontend features
   - Found existing patterns and integration points
   - Questions are based on actual gaps, not assumptions

2. **Plan Quality is High**:
   - All phases have clear, specific goals
   - File paths are exact and follow structure guide
   - Testing requirements are detailed
   - Constraints are documented
   - Acceptance criteria are measurable

3. **Plan is Executable**:
   - Phases are manageable size (2-4 hours)
   - Each phase can be tested independently
   - Dependencies between phases are clear
   - Executor can follow without asking questions

4. **Documentation is Complete**:
   - Prerequisites checklist included
   - Technology stack documented
   - Design patterns explained
   - UI/UX requirements referenced
   - Final validation checklist provided

---

## 🚀 Quick Reference

### Planning Workflow
- [ ] Step 0.5: Explore codebase (@explore-codebase + @ui-ux-designer)
- [ ] Step 1: Ask clarifying questions (based on exploration)
- [ ] Step 1.5: UI/UX consultation (if frontend)
- [ ] Step 2: Generate detailed plan
- [ ] Step 3: Present for approval
- [ ] Step 4: Create plan file (after approval)
- [ ] Hand off to @plan-executor for implementation

---

## 📖 Example Good vs Bad Plans

### Good Phase in Plan

```markdown
## Phase 2: Backend Repository Layer - 3 hours

**Goal**: Implement data access functions with parameterized queries

**Files to create**:
- `backend/src/repositories/HabitRepository.ts`

**Implementation Details**:
```typescript
// Create repository with CRUD operations
export class HabitRepository {
  async createHabit(userId: number, habitData: HabitInput): Promise<Habit> {
    // Use parameterized query to prevent SQL injection
    const query = 'INSERT INTO habits (user_id, name, category) VALUES ($1, $2, $3) RETURNING *';
    return db.query(query, [userId, habitData.name, habitData.category]);
  }
  // ... other CRUD methods
}
```

**Deliverables**:
- All CRUD operations (create, read, update, delete)
- User isolation in all queries (WHERE user_id = $1)
- Parameterized queries only (no string concatenation)
- TypeScript interfaces enforced

**Testing Requirements**:
- ✅ Can create habit for user
- ✅ Can retrieve habits filtered by user
- ✅ User isolation prevents cross-user access
- ✅ Parameterized queries prevent SQL injection
- ✅ TypeScript types enforced

**Phase 2 Complete When**:
- All CRUD methods implemented
- All tests passing
- No SQL injection vulnerabilities
```

### Bad Phase in Plan

```markdown
## Phase 2: Backend Stuff

Implement the backend.

[No clear goal, no file paths, no code examples, no testing requirements]

Done when backend works.
```

---

**Remember**: Quality planning prevents implementation issues. Explore thoroughly, plan specifically, get approval.

**Last Updated**: 2025-10-29
