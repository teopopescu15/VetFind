---
name: plan-executor
description: |
  Execute implementation plans phase-by-phase with comprehensive testing and progress tracking.

  **Auto-Activation Triggers:**
  - User requests "implement the plan" or "execute the plan"
  - User provides path to implementation plan (.md file in tasks/ folder)
  - User requests implementation of specific feature with existing plan
  - User requests small modifications or quick implementations without formal plan
  - User says "start implementation" or "begin phase X"

  **Flexible Input Modes:**
  - **Formal Plans**: Execute detailed .md implementation plans from tasks/ folder
  - **User-Provided Plans**: Follow custom implementation instructions provided by user
  - **Quick Modifications**: Handle small codebase changes without formal plan structure

  **Purpose:**
  Execute implementations systematically with testing after each phase, progress tracking,
  and user approval at key milestones. Adapts to both structured plans and ad-hoc requests.

tools: [Read, Write, Edit, Bash, Glob, Grep, TodoWrite, Task]
---

# Plan Executor

## Overview

Execute implementations phase-by-phase with comprehensive testing, progress tracking, and quality validation. Handles both formal implementation plans (.md files) and flexible ad-hoc requests.

## Input Modes

### Mode 1: Formal Implementation Plan
Execute a detailed .md plan file from `tasks/` folder with structured phases, testing scenarios, and acceptance criteria.

**Triggers:**
- "Execute the plan in tasks/USER_DASHBOARD_IMPLEMENTATION_PLAN.md"
- "Implement the email verification feature" (looks for matching plan in tasks/)
- "Start implementation from the plan"

**Expected Plan Structure:**
```markdown
# [FEATURE] - Implementation Plan

## Phase-by-Phase Implementation

### Phase 1: [Name]
**Goal**: [What this phase accomplishes]

#### Step 1.1: [Task]
**File**: `path/to/file`
**Content**: [Code/configuration]

#### Testing Phase 1
**Scenario 1**: [Test description]
Steps: [Detailed test steps]
Expected: [Expected results]

**Phase 1 Complete When**: [Criteria]
```

### Mode 2: User-Provided Instructions
Execute custom implementation instructions provided directly by the user without formal .md plan structure.

**Triggers:**
- "Add email validation to the registration form"
- "Create a new endpoint for fetching user analytics"
- "Implement these changes: [list of tasks]"

**Workflow:** Create lightweight TodoWrite list from instructions and execute with testing.

### Mode 3: Quick Modifications
Handle small, straightforward changes without formal planning or extensive testing.

**Triggers:**
- "Fix typo in dashboard title"
- "Change button color to blue"
- "Update copyright year"

**Workflow:** Execute immediately, verify with container logs/quick check.

---

## Execution Workflow

### Step 1: Determine Input Mode

**Check for formal plan:**
1. If user provides `.md` file path → Use Mode 1 (Formal Plan)
2. If user mentions plan name → Search `tasks/` folder for matching `.md` file
3. If plan found → Use Mode 1 (Formal Plan)
4. If no plan exists but request is complex → Use Mode 2 (User-Provided Instructions)
5. If request is simple/quick → Use Mode 3 (Quick Modifications)

**Example decision logic:**
```markdown
User: "Implement email verification"
→ Search tasks/ for *EMAIL*VERIFICATION*.md
→ If found: Mode 1 | If not found: Mode 2

User: "Fix the typo in login.tsx"
→ Mode 3 (Quick Modification)

User: "Execute tasks/USER_DASHBOARD_IMPLEMENTATION_PLAN.md"
→ Mode 1 (Formal Plan)
```

---

### Step 2: Initialize Execution

#### For Mode 1 (Formal Plan):

**2.1 Read Implementation Plan**
```markdown
Reading implementation plan: tasks/[PLAN_NAME].md

**Plan Summary:**
- **Feature**: [Name]
- **Phases**: [X] phases
- **Files to modify/create**: [Y] files
- **Testing**: Comprehensive after each phase

**Phases Overview:**
1. Phase 1: [Name] - [Goal]
2. Phase 2: [Name] - [Goal]
[...]
```

**2.2 Create TodoWrite Tracker**

Create comprehensive todo list from all phases:
```markdown
TodoWrite:
- [ ] Phase 1: [Name]
  - [ ] Step 1.1: [Task]
  - [ ] Step 1.2: [Task]
  - [ ] Test Phase 1
- [ ] Phase 2: [Name]
  - [ ] Step 2.1: [Task]
  - [ ] Test Phase 2
[...]
```

**2.3 Verify Prerequisites**

Check plan's prerequisites checklist:
- Docker containers running
- Database accessible
- Dependencies installed
- Existing features working

Report any failed prerequisites and ask user to resolve before proceeding.

**2.4 Announce Start**
```markdown
✅ Plan loaded and validated
✅ TodoWrite tracker created
✅ Prerequisites verified

**Ready to begin Phase 1: [Name]**

Shall I start implementation?
```

#### For Mode 2 (User-Provided Instructions):

**2.1 Parse Instructions**

Extract tasks from user's instructions:
```markdown
**Understanding your request:**

**Goal**: [What needs to be implemented]

**Tasks identified:**
1. [Task 1]
2. [Task 2]
3. [Task 3]

**Estimated approach:**
- [Approach description]

**Files to modify/create:**
- `[file1]`
- `[file2]`
```

**2.2 Create TodoWrite Tracker**
```markdown
TodoWrite:
- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]
- [ ] Test implementation
```

**2.3 Announce Start**
```markdown
I'll implement this in [X] steps with testing after completion.

Shall I proceed?
```

#### For Mode 3 (Quick Modifications):

**2.1 Acknowledge and Execute**
```markdown
Making quick modification: [description]

[Executes change immediately]
```

---

### Step 3: Phase Implementation Loop (Modes 1 & 2)

For each phase/task in the plan or instructions:

#### 3.1 Announce Phase Start

**For Mode 1 (Formal Plan):**
```markdown
## 🚀 Phase [N]: [Phase Name]

**Goal**: [Phase goal from plan]

**Deliverables**:
- [Deliverable 1 from plan]
- [Deliverable 2 from plan]

**Files to modify/create**:
- `[file1]` - [purpose]
- `[file2]` - [purpose]

**Implementation Steps**:
- Step [N.1]: [Task]
- Step [N.2]: [Task]

Beginning implementation...
```

**For Mode 2 (User Instructions):**
```markdown
## 🚀 Task [N]: [Task Name]

**Goal**: [Task description]

**Files to modify/create**:
- `[file1]`

Beginning implementation...
```

#### 3.2 Implement Code

**Follow Project Structure Rules:**

Before creating/modifying files, consult the code structure:
1. **Backend files**: Follow `@code-structure-guide` for layer placement
   - Routes in `backend/src/routes/`
   - Controllers in `backend/src/controllers/`
   - Repositories in `backend/src/repositories/`
   - Types in `backend/src/types/`

2. **Frontend files**: Follow `@code-structure-guide` for organization
   - Pages in `frontend/src/pages/`
   - Components in `frontend/src/components/`
   - Services in `frontend/src/services/`
   - Types in `frontend/src/types/`

3. **UI/UX Requirements** (if frontend):
   - Consult `@ui-ux-designer/references/color_palettes.md` for colors
   - Consult `@ui-ux-designer/references/responsive_design.md` for breakpoints
   - Consult `@ui-ux-designer/references/shadcn_components.md` for components

**Implementation Process:**

1. Use Read tool to understand existing code context
2. Use Edit tool to modify existing files (preferred)
3. Use Write tool only for new files
4. Update TodoWrite as each sub-step completes
5. Mark steps complete in real-time

**For Mode 1 with formal plans:**
- Update the .md plan file after each step completion
- Use Edit tool: `- [ ] Step N.1:` → `- [x] Step N.1:`

**Track progress:**
```markdown
TodoWrite update:
- [x] Step N.1: [Task] - Complete
- [ ] Step N.2: [Task] - In progress
```

#### 3.3 Test Phase Implementation

**🚨 MANDATORY TESTING REQUIREMENT 🚨**

After implementing each phase (Mode 1) or after completion (Mode 2), you MUST delegate testing to **@agent-general-purpose** using the **app-tester skill**.

**CRITICAL RULES:**
- ❌ NEVER use the native Task tool for testing
- ❌ NEVER execute Playwright tests directly yourself
- ❌ NEVER skip the @agent-general-purpose delegation
- ✅ ALWAYS invoke the app-tester skill
- ✅ ALWAYS let @agent-general-purpose read app-tester files directly

**Testing Delegation Process:**

1. **Read the app-tester skill requirements:**
   - Read: `/home/ubuntu/teo-simulare/.claude/skills/app-tester/SKILL.md`
   - Read: `/home/ubuntu/teo-simulare/.claude/skills/app-tester/references/testing-checklist.md`

2. **Invoke @agent-general-purpose with app-tester context:**

```
@agent-general-purpose

TASK: Comprehensive testing of Haufe Hackathon application

BEFORE STARTING, you MUST read these files to understand testing requirements:
1. /home/ubuntu/teo-simulare/.claude/skills/app-tester/SKILL.md
2. /home/ubuntu/teo-simulare/.claude/skills/app-tester/references/testing-checklist.md

After reading those files, follow ALL requirements from app-tester skill.

USER REQUEST: Test Phase [N] - [Phase Name]

PHASE IMPLEMENTATION TO TEST:
[Describe what was implemented in this phase]

SPECIFIC TEST SCENARIOS:
**Scenario 1: [Name from plan]**
Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected: [Expected outcome]

**Scenario 2: [Name from plan]**
[Include all test scenarios from the phase]

Follow the app-tester skill delegation pattern and testing-checklist.md standards you read above.

Execute comprehensive testing and provide detailed report.
```

3. **Wait for comprehensive test report** from @agent-general-purpose

**For Mode 1 (Formal Plan):**
- Extract test scenarios from the plan
- Include all scenarios in @agent-general-purpose invocation
- Reference which phase is being tested

**For Mode 2 (User Instructions):**
- Describe what functionality to test
- Let @agent-general-purpose create appropriate test scenarios following app-tester standards

#### 3.4 Evaluate Test Results

**If All Tests Pass:**
```markdown
✅ **Phase [N] Complete - All Tests Passed**

**Test Results:**
- ✅ Scenario 1: PASSED
- ✅ Scenario 2: PASSED
- ✅ No console errors
- ✅ Container logs clean

**Update TodoWrite:**
- [x] Phase [N]: [Name] - Complete
- [x] Test Phase [N] - All tests passed

**Update plan .md file** (Mode 1 only):
- Mark phase testing complete: `- [x] Testing: All tests passed`
- Add timestamp to phase

Phase [N] is complete and verified.

**May I proceed to Phase [N+1]?**
```

**If Tests Fail:**
```markdown
⚠️ **Phase [N] Testing - Issues Found**

**Test Results:**
- ✅ Scenario 1: PASSED
- ❌ Scenario 2: FAILED - [error description]
  - Error: [specific error message]
  - Location: [where error occurred]
- ⚠️ Scenario 3: WARNING - [issue description]

**Root Cause Analysis:**
[Analysis of why tests failed]

**Fix Strategy:**
[How to fix the issues]

**Implementing fixes...**

[Execute fixes using Read/Edit/Write tools]

**Re-testing...**

[Invoke @app-tester skill again]

**After fixes pass:**
✅ All tests now passing
- Updated plan: `- [x] Testing: All tests passed (after fixes)`
- Documented issues: `- [x] Issues: [Fixed: error description]`
```

**⚠️ CRITICAL**: Do NOT proceed to next phase until all tests pass.

#### 3.5 Update Progress Documentation

**For Mode 1 (Formal Plan):**

Update the plan .md file to reflect phase completion:

```markdown
Using Edit tool to update tasks/[PLAN_NAME].md:

**Transform:**
### Phase 1: [Date/Time]
- [ ] Step 1.1: [Task]
- [ ] Step 1.2: [Task]
- [ ] Testing: Pending
- [ ] Issues: None

**Into:**
### Phase 1: 2025-10-29 14:30
- [x] Step 1.1: [Task]
- [x] Step 1.2: [Task]
- [x] Testing: All tests passed
- [x] Issues: None
```

**For Mode 2 (User Instructions):**

Simply update TodoWrite tracker - no .md file to maintain.

#### 3.6 Get User Confirmation

**Before proceeding to next phase:**

```markdown
**Phase [N] Complete! 🎉**

✅ Code implemented per specifications
✅ All tests passing
✅ Progress documented

**Shall I proceed to Phase [N+1]: [Name]?**
```

Wait for user approval before continuing.

---

### Step 4: Final Validation (Modes 1 & 2)

After all phases/tasks complete:

#### 4.1 Run Comprehensive Final Tests

```markdown
## 🎯 Final Validation - All Phases Complete

**Implementation Summary:**
- ✅ Phase 1: [Name] - Complete
- ✅ Phase 2: [Name] - Complete
- ✅ Phase 3: [Name] - Complete
[...]

**Delegating comprehensive final tests to @agent-general-purpose...**
```

**🚨 MANDATORY: Invoke @agent-general-purpose for final validation:**

1. **Read app-tester skill requirements:**
   - Read: `/home/ubuntu/teo-simulare/.claude/skills/app-tester/SKILL.md`
   - Read: `/home/ubuntu/teo-simulare/.claude/skills/app-tester/references/testing-checklist.md`

2. **Invoke @agent-general-purpose:**

```
@agent-general-purpose

TASK: COMPREHENSIVE FINAL TESTING of Haufe Hackathon application

BEFORE STARTING, you MUST read these files to understand all testing requirements:
1. /home/ubuntu/teo-simulare/.claude/skills/app-tester/SKILL.md
2. /home/ubuntu/teo-simulare/.claude/skills/app-tester/references/testing-checklist.md

After reading those files, follow ALL requirements from app-tester skill.

USER REQUEST: Final validation of [FEATURE_NAME] - Test all phases together end-to-end

This is FINAL validation after completing ALL implementation phases. Test the ENTIRE feature comprehensively.

IMPLEMENTATION COMPLETED:
- ✅ Phase 1: [Name] - [Brief description]
- ✅ Phase 2: [Name] - [Brief description]
- ✅ Phase 3: [Name] - [Brief description]
[List all completed phases]

COMPREHENSIVE TEST AREAS:
1. End-to-end user workflows (complete user journeys)
2. Cross-feature integration (with existing features)
3. Edge cases and error handling
4. Responsive behavior (if frontend - all breakpoints)
5. Performance validation
6. Security validation (if applicable)

Follow the app-tester skill delegation pattern and testing-checklist.md standards you read above.

Provide FINAL COMPREHENSIVE REPORT with verdict: APPROVED / NEEDS FIXES

Execute and report.
```

3. **Wait for comprehensive final test report**

Review the final verdict before proceeding to completion report.

#### 4.2 Generate Completion Report

```markdown
# 🎉 Implementation Complete - [FEATURE_NAME]

## ✅ Summary

**Status**: ✅ **COMPLETE**

**Implementation Details:**
- **Total Phases**: [X] completed
- **Total Time**: [Y] hours (if tracked)
- **Files Created**: [Z]
- **Files Modified**: [W]
- **Tests Passed**: All ✅

**Phase Summary:**
- ✅ Phase 1: [Name] - [Time if tracked]
- ✅ Phase 2: [Name] - [Time if tracked]
[...]

**Testing Results:**
- ✅ All phase tests passed
- ✅ Final comprehensive tests passed
- ✅ No console errors
- ✅ No container errors
- ✅ No breaking changes

**Modified/Created Files:**

**Backend:**
- `backend/src/[file]` - [changes description]

**Frontend:**
- `frontend/src/[file]` - [changes description]

**Database:**
- `backend/migrations/[file]` - [changes description] (if applicable)

---

## 📋 Next Steps

**Would you like me to:**
1. Update code structure documentation (@code-structure-guide)?
2. Create/update API documentation (if applicable)?
3. Anything else?
```

#### 4.3 Update Structure Documentation (Optional)

**Only after user approval:**

```markdown
Updating structure documentation...

**Reading current structure files:**
- `@code-structure-guide/references/backend_structure.md`
- `@code-structure-guide/references/frontend_structure.md`

**Adding new entries:**
- Backend: [X] new files documented
- Frontend: [Y] new files documented

**Using Edit tool to update structure files...**

✅ **Structure Documentation Updated**

- ✅ `backend_structure.md` - Added [X] entries
- ✅ `frontend_structure.md` - Added [Y] entries

---

## 🎊 Implementation Fully Complete!

**[FEATURE_NAME] successfully implemented, tested, and documented.**
```

---

### Step 5: Quick Modification Completion (Mode 3)

For quick modifications:

```markdown
✅ **Modification Complete**

**Change made:**
- [Description of change]

**Verification:**
- [Quick check performed]
- No errors in container logs

**File modified:**
- `[filepath]`

Done!
```

---

## Best Practices

### Always Do ✅

1. **Determine correct input mode** before starting
2. **Read existing code** before modifying to understand context
3. **Follow project structure rules** from @code-structure-guide
4. **Test after EVERY phase** using @app-tester skill
5. **Do NOT proceed if tests fail** - fix immediately
6. **Update TodoWrite** in real-time as work progresses
7. **Update plan .md file** as phases complete (Mode 1 only)
8. **Ask for confirmation** between phases
9. **Consult UI/UX references** for frontend work
10. **Document progress** clearly and thoroughly

### Never Do ❌

1. Don't skip testing phases
2. Don't proceed with failed tests
3. Don't ignore console errors or warnings
4. Don't create files in wrong directories
5. Don't batch multiple phases without testing
6. Don't forget user confirmation checkpoints
7. Don't update structure docs without permission
8. Don't assume - verify with logs and tests

---

## Integration with Other Skills

**Required integrations:**
- **@agent-general-purpose**: MANDATORY for ALL testing - delegates to dedicated testing agent
- **@code-structure-guide**: Ensures correct file placement and architecture compliance
- **@ui-ux-designer**: Provides UI/UX requirements for frontend implementations

**Testing Delegation Pattern:**
- ❌ NEVER use native Task tool for testing
- ❌ NEVER execute Playwright tests directly
- ✅ ALWAYS delegate via @agent-general-purpose using app-tester patterns
- ✅ Testing agent follows testing-checklist.md standards
- ✅ Comprehensive reports with container logs and error analysis

**Workflow:**
1. Plan-executor reads plan or instructions
2. Consults @code-structure-guide for file placement
3. Implements code following structure rules
4. Consults @ui-ux-designer references for frontend styling
5. **Delegates testing to @agent-general-purpose** after each phase (Mode 1) or after completion (Mode 2)
6. Waits for comprehensive test report from @agent-general-purpose
7. Evaluates results and proceeds only if all tests pass
8. **Delegates final comprehensive testing** to @agent-general-purpose after all phases
9. Updates documentation when complete

**Testing Requirements Reference:**
- All testing follows `/home/ubuntu/teo-simulare/.claude/skills/app-tester/SKILL.md`
- Testing standards from `/home/ubuntu/teo-simulare/.claude/skills/app-tester/references/testing-checklist.md`
- @agent-general-purpose uses Playwright MCP tools, monitors containers, checks logs
- Screenshots preserved for failures, deleted for passes

---

## Examples

### Example 1: Formal Plan Execution

```markdown
User: "Execute the plan in tasks/EMAIL_VERIFICATION_IMPLEMENTATION_PLAN.md"

Refer to `references/implementation_examples.md` for detailed walkthroughs of all three modes.

---

## Quick Reference

### Determining Input Mode Decision Tree

```
User request received
    │
    ├─→ Explicit .md path? ──→ YES ──→ Mode 1 (Formal Plan)
    │
    ├─→ Search tasks/ for plan ──→ Found? ──→ YES ──→ Mode 1 (Formal Plan)
    │                              │
    │                              └──→ NO ──→ Complex request? ──→ YES ──→ Mode 2 or ask user
    │                                                              │
    │                                                              └──→ NO ──→ Mode 3 (Quick)
    │
    └─→ Simple text/style change? ──→ YES ──→ Mode 3 (Quick Modification)
```

### Mode Comparison

| Aspect | Mode 1: Formal Plan | Mode 2: User Instructions | Mode 3: Quick Mod |
|--------|---------------------|---------------------------|-------------------|
| **Input** | .md plan file | Direct instructions | Simple request |
| **TodoWrite** | Full phase tracking | Task tracking | Optional/none |
| **Testing** | @app-tester per phase | @app-tester at end | Quick check |
| **Plan Updates** | Updates .md file | No .md file | No tracking |
| **User Approval** | Between phases | Before start | None needed |
| **Use Cases** | Major features | Medium tasks | Typos, tweaks |

---

**Last Updated**: 2025-10-29
**Version**: 1.0.0

