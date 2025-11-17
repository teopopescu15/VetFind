---
name: plan-creator
description: |
  Comprehensive planning workflow for generating detailed implementation plans before coding.

  **Auto-Activation Triggers:**
  - User explicitly requests "plan mode"
  - User asks to see implementation plan before coding
  - Planning complex features requiring multiple phases
  - Changes affecting both frontend and backend
  - Database schema modifications
  - Any task requiring detailed planning before execution

  **Purpose:**
  This skill creates comprehensive implementation plans with phase breakdowns, testing requirements,
  and acceptance criteria. Plans are executed using the @plan-executor skill.

tools: [Read, Write, Bash, Glob, Grep, Task]
---

# 📋 Plan Mode Workflow

## 🎯 Overview

This skill provides a comprehensive planning workflow for:
- **Codebase Exploration**: Understanding existing implementations before planning
- **Requirements Gathering**: Asking relevant questions based on exploration
- **Comprehensive Planning**: Detailed implementation plans with phases and testing requirements
- **User Approval**: Confirmation before creating plan document
- **Plan Document Creation**: Structured .md files in tasks/ folder for execution

---

## 🔄 Workflow Steps

### Step 0.5: Codebase Exploration Phase

**BEFORE asking questions, explore what already exists:**

1. **Invoke @explore-codebase skill** to:
   - Search for similar existing features
   - Identify where related functionality is implemented
   - Find relevant backend routes, controllers, repositories
   - Find relevant frontend pages, components, and services
   - Understand current implementation patterns for this feature type

2. **Invoke @ui-ux-designer skill** (if frontend work involved) to:
   - Check existing UI patterns for similar features
   - Identify current design system usage
   - Find related components and their styling
   - Review existing page layouts that might be similar

3. **Analyze findings** to understand:
   - What's already implemented (avoid duplicate work)
   - Where new code should be placed (follow existing patterns)
   - What can be reused vs. what needs to be created
   - Integration points with existing features

**Use findings to formulate RELEVANT questions in Step 1** - ask about what's missing or unclear, not what already exists.

---

### Step 1: Discovery Phase

Directly after exploring the codebase (Step 0.5), ask clarifying questions about **gaps and new requirements** (not about things already discovered):

**Question Template:**
```markdown
I'll help you implement [FEATURE_NAME] in plan mode.


**Clarifying questions for NEW requirements:**

**Core Requirements:**
1. [Question about main functionality - focusing on what's NOT already implemented]
2. [Question about user interaction - new behaviors needed]
3. [Question about data requirements - new data structures/fields]

**Integration Points:**
4. [Question about how new feature integrates with existing [FOUND_FEATURE]]
5. [Question about extending/modifying existing [FOUND_COMPONENT/ROUTE]]

**Constraints & Success Criteria:**
6. Are there any specific constraints I should know about?
7. What does "done" look like for this feature?

**Testing:**
8. What specific scenarios should we test?
9. Any edge cases or error conditions to handle?

Please provide answers so I can create a detailed implementation plan.
```

---

### Step 1.5: UI/UX Design Consultation (Frontend Only)

**If the feature involves ANY frontend work:**

Automatically invoke the **@ui-ux-designer** skill to handle all UI/UX design requirements.

**IMPORTANT**: The @ui-ux-designer skill maintains **always up-to-date** UI/UX requirements in dedicated reference files. **NEVER hardcode UI/UX specifications here** - always consult the latest versions from:

**During planning**: Consult the reference files:`@ui-ux-designer/references/color_palettes.md` , `@ui-ux-designer/references/responsive_design.md`,  `@ui-ux-designer/references/shadcn_components.md` to understand current UI/UX requirements. These files are constantly updated with the latest design patterns, color schemes, and implementation guidelines.

**Document in plan**: Reference to @ui-ux-designer workflow sections and specific reference files that will be followed during implementation.

---

### Step 2: Generate Implementation Plan

After gathering requirements, directly generate a comprehensive plan following the template in `references/plan_template.md`.

**🏗️ CRITICAL: Use Exploration Findings for Planning**

Use the findings from Step 0.5 (@explore-codebase already loaded @code-structure-guide):
1. **Reference exploration report**: Identify affected layers from codebase exploration
2. **Plan file placement**: Where do new files belong per existing structure patterns
3. **Verify compliance**: Ensure all architectural rules are followed

**Plan Must Include:**
- Prerequisites checklist
- Requirements summary
- Key constraints (mandatory)
- **File placement per structure rules** (NEW)
- **UI/UX Design Requirements** (if frontend - sourced from @ui-ux-designer reference files)
- Phase-by-phase breakdown with testing
- **Detailed Test Scenarios** (NEW - automation-ready for @app-tester)
- Acceptance criteria
- Final validation checklist

**Test Scenarios Requirements** (CRITICAL for app-tester compatibility):
- **Per-phase testing**: Detailed test scenarios after each implementation phase
- **Structured format**: Follow app-tester compatible format (Setup, Steps, Expected, Verification)
- **Automation-ready**: Scenarios detailed enough for @agent-general-purpose to execute via Playwright MCP
- **Element specificity**: Include selectors, expected text, exact URLs
- **Expected outcomes**: Cover UI, API, database, logs, console
- **Error scenarios**: Test validation, errors, edge cases in each phase
- **Responsive specs**: Exact viewport sizes for responsive features
- **MCP tool specification**: Which Playwright MCP functions will be used
- **Verification checklists**: Measurable pass/fail criteria (8-12 checkpoints per scenario)

**Reference for Test Quality**:
- See `references/plan_template.md` for detailed test scenario structure
- See `references/best_practices.md` Section "Test Scenario Quality Standards"
- Use test scenario examples library in plan_template.md as templates
- Reference `@app-tester/references/testing-checklist.md` for testing standards

**For Frontend Features - UI/UX Integration:**
- **Mandatory**: Include "UI/UX Design" section in plan
- **Mandatory**: Reference @ui-ux-designer skill and its reference files for all design requirements
- **Note**: All color palette, component patterns, responsive design, and accessibility requirements are sourced from:
  - `@ui-ux-designer/references/color_palettes.md` (color schemes, gradients, icons)
  - `@ui-ux-designer/references/responsive_design.md` (breakpoints, patterns)
  - `@ui-ux-designer/references/shadcn_components.md` (components, MCP generation)

**Each Phase Must Specify:**
- Files to create/modify with **exact paths** per structure
- Which layer each file belongs to (route/controller/repository/component/page)
- Why this placement follows structure rules
- **Detailed test scenarios** following app-tester compatible format:
  - Setup/preconditions (auth state, page, data)
  - Numbered step-by-step actions with specific elements
  - Expected outcomes for UI, API, database, and logs
  - Verification checklist with measurable criteria (8-12 items)
  - Error scenarios with expected error handling
  - MCP tools that will be used (Playwright MCP functions)
  - Screenshot requirements

**For Frontend Phases, include:**
- Reference to @ui-ux-designer workflow sections to follow during implementation
- Reference to specific @ui-ux-designer reference files that apply:
  - Color palette variation to use (from `color_palettes.md`)
  - Responsive breakpoints and patterns (from `responsive_design.md`)
  - shadcn components needed (from `shadcn_components.md`)
- Note which UI/UX design patterns apply (authentication, dashboard, forms, etc.)

**Plan Naming Convention:**
```
tasks/[FEATURE_NAME]_IMPLEMENTATION_PLAN.md
```

Examples:
- `tasks/EMAIL_VERIFICATION_IMPLEMENTATION_PLAN.md`
- `tasks/USER_DASHBOARD_IMPLEMENTATION_PLAN.md`
- `tasks/NOTIFICATION_SYSTEM_IMPLEMENTATION_PLAN.md`

**Note**: Create the `tasks/` folder if it doesn't exist.

---

### Step 3: Present Plan for Approval

Present the generated plan to user:

```markdown
🎯 **Implementation Plan Generated**

I've created a comprehensive implementation plan for [FEATURE_NAME]:

**Summary:**
- **Phases**: [X] phases identified
- **Files**: [Y] files to create/modify
- **Testing**: [Z] test scenarios planned with @app-tester skill
- **Estimated Time**: [Hours] hours

**Plan Highlights:**
- [Key highlight 1]
- [Key highlight 2]
- [Key highlight 3]

**Would you like to:**
1. ✅ **Approve and create plan document** - Save as .md and begin implementation
2. ✏️ **Request modifications** - Tell me what to change
3. 📖 **Review specific sections** - Deep dive into any part

How would you like to proceed?
```

**⚠️ CRITICAL**: DO NOT create the .md file until user explicitly approves.

---

### Step 4: Create Plan Document

Only after user approval:

```markdown
✅ Creating implementation plan document...

[First check if tasks/ folder exists, create it if needed]
[Use Write tool to create the .md file in tasks/ folder]

✅ Plan document created: `tasks/[FILENAME]_IMPLEMENTATION_PLAN.md`

**Next Steps:**
To execute this plan, use the @plan-executor skill:
- @plan-executor will read the plan file
- Execute phases systematically with testing after each phase
- Update the plan document with progress
- Handle all implementation, testing, and documentation

You can also manually implement following the phases in the plan.
```

---

## 📚 Reference Documents

For detailed information, see:
- **Plan Template**: `references/plan_template.md` - Complete implementation plan structure
- **Best Practices**: `references/best_practices.md` - Planning guidelines and standards

---

## 🎯 Key Principles

### Always Do ✅
1. **Explore codebase FIRST** with @explore-codebase and @ui-ux-designer skills
2. Ask clarifying questions based on exploration findings
3. Wait for user approval before creating plan file
4. Include comprehensive testing requirements in plan
5. Reference @ui-ux-designer files for frontend UI/UX requirements
6. Specify exact file paths following @code-structure-guide
7. Define clear acceptance criteria
8. Break down into manageable phases (2-4 hours each)

### Never Do ❌
1. Don't skip codebase exploration (Step 0.5) - always explore first
2. Don't ask questions about things that already exist - explore first
3. Don't create plan without user approval
4. Don't create vague phases without clear deliverables
5. Don't skip testing requirements in the plan
6. Don't forget to specify file placement per structure guide

---

## 🔗 Integration

Works with other skills:
- **explore-codebase**: MUST invoke FIRST (Step 0.5) - discovers existing features, patterns, and integration points
- **ui-ux-designer**: MUST invoke in Step 0.5 for frontend features - discovers existing UI patterns; references in plan
- **plan-executor**: Executes the generated plan with testing and validation

---

## 📖 Quick Checklist

- [ ] Step 0.5: Explore codebase with @explore-codebase and @ui-ux-designer skills
- [ ] Step 1: Ask clarifying questions (context-aware, based on exploration)
- [ ] Step 2: Generate comprehensive plan
- [ ] Step 3: Present plan for approval
- [ ] Step 4: Create plan document (after approval)
- [ ] Hand off to @plan-executor skill for execution

---

**Remember**: Quality planning prevents implementation issues. Explore first, plan thoroughly, get approval.

**Last Updated**: 2025-10-29
**Version**: 2.0.0
**Changelog**:
- v2.0.0 (2025-10-29): Removed all execution steps (5-8) - now pure planning skill. Execution handled by @plan-executor
- v1.3.0 (2025-10-29): Added Step 0.5: Codebase Exploration Phase
- v1.2.0 (2025-10-29): Referenced @ui-ux-designer files dynamically
- v1.1.0 (2025-10-29): Delegated to @code-structure-guide
