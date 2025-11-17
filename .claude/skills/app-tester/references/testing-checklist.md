# Comprehensive Testing Checklist

This document provides detailed checklists for testing the Haufe Hackathon application.

---

## ⚠️ CRITICAL: @agent-general-purpose Delegation Requirement

**🚨 MANDATORY REQUIREMENT**: This checklist is meant to be used by a testing agent that is invoked via **@agent-general-purpose**.

### Delegation Requirements

❌ **NEVER**:
- Use the native `Task` tool to delegate testing
- Use any other delegation methods
- Execute all tests directly in the skill without delegation

✅ **ALWAYS**:
- Invoke `@agent-general-purpose` to delegate all testing work
- Delegate comprehensive testing work to a dedicated agent instance
- Include this entire checklist in the prompt for @agent-general-purpose to follow

### Quick Delegation Check

Before starting any testing, verify:
- [ ] Testing was delegated using @agent-general-purpose
- [ ] @agent-general-purpose was invoked with complete testing context
- [ ] Prompt includes all necessary context from SKILL.md
- [ ] NOT using native Task tool or other delegation methods

**If delegation was NOT done properly, STOP and re-delegate using @agent-general-purpose.**

---

## Pre-Testing Validation

### Container Health Check
- [ ] Verify `haufe-frontend` container is running (port 5179)
- [ ] Verify `haufe-backend` container is running (port 8000)
- [ ] Verify `haufe-postgres` container is running (port 5432)
- [ ] Check container logs for startup errors
- [ ] Verify no port conflicts exist

### Implementation Plan Review
- [ ] Read and understand all requirements from the .md file
- [ ] Identify all components to be tested
- [ ] Identify all features to be tested
- [ ] Note specific implementation requirements (auth methods, themes, placement, etc.)
- [ ] Identify individual component tests
- [ ] Identify integration tests

## UI/UX Testing Standards

### Visual Consistency
- [ ] All components use consistent color palette
- [ ] Typography is consistent across pages
- [ ] Spacing and padding follow consistent patterns
- [ ] Button styles are consistent
- [ ] Form input styles are consistent
- [ ] Icons are consistent in size and style
- [ ] Loading states are visually consistent
- [ ] Error messages follow consistent styling

### Responsive Design Testing
Test each component and page at these breakpoints:
- [ ] **Desktop**: 1920x1080 (large desktop)
- [ ] **Laptop**: 1366x768 (standard laptop)
- [ ] **Tablet Portrait**: 768x1024 (iPad portrait)
- [ ] **Tablet Landscape**: 1024x768 (iPad landscape)
- [ ] **Mobile Large**: 414x896 (iPhone 11 Pro Max)
- [ ] **Mobile Medium**: 375x667 (iPhone SE)
- [ ] **Mobile Small**: 320x568 (iPhone 5/SE)

### Responsive Behavior Checks
- [ ] Text remains readable (no overflow, proper wrapping)
- [ ] Images scale appropriately
- [ ] Navigation adapts properly (hamburger menu on mobile)
- [ ] Forms are usable (inputs are tappable on mobile)
- [ ] Buttons are large enough for touch (min 44x44px)
- [ ] Tables scroll or adapt on small screens
- [ ] Modals/dialogs fit within viewport
- [ ] No horizontal scrolling on any device

## Functional Testing Standards

### Authentication & Authorization
- [ ] Login flow works correctly
- [ ] Authentication persists (cookies/tokens work)
- [ ] Logout works correctly
- [ ] Protected routes redirect properly
- [ ] Session timeout behaves correctly
- [ ] Error messages for invalid credentials are clear

### Component Functionality
For each component:
- [ ] Component renders without errors
- [ ] All interactive elements work (buttons, links, inputs)
- [ ] Event handlers trigger correctly
- [ ] State updates are reflected in UI
- [ ] Props are passed and used correctly
- [ ] Conditional rendering works as expected
- [ ] Loading states display properly
- [ ] Error states display properly

### Data Flow Testing
- [ ] API calls are made correctly
- [ ] Data fetched from backend displays properly
- [ ] Form submissions send correct data
- [ ] Database updates persist correctly
- [ ] Real-time updates work (if applicable)
- [ ] Data validation works on frontend and backend
- [ ] Error handling for failed API calls works

### Integration Testing
- [ ] Components work together correctly
- [ ] Navigation between pages works
- [ ] Data flows correctly between components
- [ ] Parent-child component communication works
- [ ] State management works across components
- [ ] Side effects are handled properly

## Error Detection Standards

### Frontend Errors
Check browser console for:
- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No 404 errors for assets
- [ ] No CORS errors
- [ ] No console errors during interactions
- [ ] Proper error boundaries exist

### Backend Errors
Check backend container logs for:
- [ ] No uncaught exceptions
- [ ] No database connection errors
- [ ] No authentication errors
- [ ] Proper error responses (appropriate status codes)
- [ ] No memory leaks or performance issues

### Database Errors
Check database container logs for:
- [ ] No connection errors
- [ ] No query errors
- [ ] Proper transaction handling
- [ ] No deadlocks

## Implementation Verification

### Requirement Alignment
- [ ] Implementation matches specification exactly
- [ ] No shortcuts or workarounds used
- [ ] No mocked data (unless specified)
- [ ] No placeholder content (unless specified)
- [ ] Specific requirements met (auth method, themes, placement)

### Code Quality Indicators
- [ ] No commented-out code left behind
- [ ] No console.log statements in production code
- [ ] No "TODO" or "FIXME" comments for completed features
- [ ] No hardcoded values that should be configurable

## Browser Testing

### Console Monitoring
For each test:
- [ ] Clear console before test
- [ ] Execute test
- [ ] Check for any errors or warnings
- [ ] Document all console output

### Network Monitoring
- [ ] Check network tab for failed requests
- [ ] Verify correct API endpoints are called
- [ ] Verify request/response payloads are correct
- [ ] Check for slow requests (>2s)

## Test Reporting Standards

### For Successful Tests
Document:
- Test name and description
- Test steps executed
- Expected behavior
- Actual behavior
- Confirmation of success

### For Failed Tests
Document:
- Test name and description
- Test steps executed
- Expected behavior
- Actual behavior
- Exact error message
- Screenshot of error (if visual)
- Console output at time of failure
- Backend/database logs at time of failure
- Potential root cause analysis
- Suggestions for investigation (NOT fixes)

### Error Analysis Requirements
When reporting errors, NEVER simplify. Include:
1. **Exact error message** - Copy verbatim from console/logs
2. **Error context** - What was happening when error occurred
3. **Error location** - Component, file, line number if available
4. **Related logs** - Frontend console + backend logs + database logs
5. **Reproduction steps** - Exact steps to reproduce
6. **Environment state** - Container status, network state
7. **Root cause hypothesis** - Why this error might be occurring
8. **Implementation vs specification** - How implementation differs from requirements

## Screenshot Management

### During Testing
- [ ] Take screenshots at critical test points
- [ ] Store all screenshots in `.playwright-mcp/` directory
- [ ] Reference screenshot filenames in test reports
- [ ] Use descriptive naming for screenshots

### After Testing - All Tests Pass
- [ ] Delete all `.png` files from `.playwright-mcp/`:
  ```bash
  rm -f /home/ubuntu/teo-simulare/.playwright-mcp/*.png
  ```
- [ ] Confirm cleanup in final summary
- [ ] Report storage space saved

### After Testing - Any Tests Fail
- [ ] **PRESERVE all screenshots** - Do NOT delete
- [ ] Reference screenshots in failure reports
- [ ] Keep screenshots as evidence for debugging
- [ ] Organize screenshots by test case if helpful

## Failure Report Management

### When to Create Detailed Failure Reports
- [ ] Test fails 4+ consecutive times on the same test
- [ ] Failure is blocking critical functionality
- [ ] Root cause is complex and requires detailed analysis

### Failure Report Creation Steps
- [ ] Create reports directory:
  ```bash
  mkdir -p /home/ubuntu/teo-simulare/reports
  ```
- [ ] Generate report with naming: `failure-report-{test-name}-{timestamp}.md`
- [ ] Use the mandatory report structure from SKILL.md
- [ ] Include ALL required sections (no shortcuts)

### Failure Report Mandatory Sections
- [ ] Executive Summary (2-3 sentences)
- [ ] Test Information (objective, requirements, acceptance criteria)
- [ ] Test Execution Details (steps executed, failure point)
- [ ] Error Analysis (all error messages, visual evidence)
- [ ] Root Cause Analysis (primary cause, contributing factors)
- [ ] Impact Assessment (severity, affected areas, user impact)
- [ ] Solution Analysis (recommended solution, implementation details, verification steps)
- [ ] Prevention (how to prevent, testing improvements)
- [ ] Related Information (references, container status, environment)
- [ ] Appendix (complete error logs, network activity)

### Failure Report Quality Standards
- [ ] All error messages included verbatim
- [ ] Step-by-step solution provided
- [ ] File paths and line numbers referenced
- [ ] Code snippets showing current vs expected patterns
- [ ] Alternative solutions listed with pros/cons
- [ ] Verification steps after fix implementation
- [ ] Prevention measures to avoid similar issues

## Testing Best Practices

### Sequential Testing Approach
1. Test containers and environment first
2. Test authentication flow
3. Test individual components in isolation
4. Test component integration
5. Test complete user flows
6. Test edge cases and error scenarios
7. Test responsive behavior last

### When to Ask for Clarification
Ask the user when:
- Implementation plan is unclear or ambiguous
- Uncertain which containers to monitor
- Unclear what "correct" behavior should be
- Test requirements conflict with each other
- Cannot access expected files or containers

### What NOT to Do
- **NEVER use native Task tool** - Use @agent-general-purpose only
- **NEVER execute tests directly in skill without delegation** - Always delegate via @agent-general-purpose
- **NEVER modify application code** - Only report findings
- **NEVER skip errors** - Document everything
- **NEVER simplify problems** - Provide full details
- **NEVER assume behavior** - Test explicitly
- **NEVER leave test files** - Clean up or organize properly
- **NEVER delete screenshots when tests fail** - Preserve evidence
- **NEVER omit sections from failure reports** - Use complete structure
- **NEVER provide vague solutions** - Give specific, actionable steps
