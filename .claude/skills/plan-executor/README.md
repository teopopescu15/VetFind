# Plan Executor Skill

A comprehensive skill for executing implementation plans phase-by-phase with testing, progress tracking, and quality validation.

## What This Skill Does

The plan-executor skill handles implementation work across three flexible modes:

1. **Mode 1 - Formal Plan Execution**: Executes detailed .md implementation plans from the `tasks/` folder with structured phases and comprehensive testing
2. **Mode 2 - User-Provided Instructions**: Follows custom implementation instructions provided directly by the user
3. **Mode 3 - Quick Modifications**: Handles small, straightforward codebase changes

## When to Use This Skill

The skill automatically triggers when users:
- Request "implement the plan" or "execute the plan"
- Provide a path to an implementation plan (.md file)
- Request implementation of a feature with an existing plan
- Request small modifications or quick implementations
- Say "start implementation" or "begin phase X"

## Key Features

### Flexible Input Handling
- Automatically detects and selects appropriate mode based on user request
- Searches for existing plans by feature name
- Adapts workflow to match complexity of request

### Comprehensive Testing
- Integrates with @app-tester skill for Playwright-based testing
- Tests after each phase (Mode 1) or after completion (Mode 2/3)
- Handles test failures with fix-retest loops

### Progress Tracking
- Uses TodoWrite for real-time task tracking
- Updates .md plan files with completion status (Mode 1)
- Provides clear phase completion announcements

### Quality Validation
- Consults @code-structure-guide for correct file placement
- Follows @ui-ux-designer references for frontend styling
- Ensures architectural compliance
- Verifies all tests pass before proceeding

## Skill Structure

```
plan-executor/
├── SKILL.md                           # Main skill instructions
├── README.md                          # This file
└── references/
    ├── implementation_examples.md     # Detailed examples of all 3 modes
    └── best_practices.md              # Guidelines and best practices
```

## How It Works

### Mode 1: Formal Plan Execution

**Input**: .md plan file from `tasks/` folder

**Workflow:**
1. Read and parse implementation plan
2. Create TodoWrite tracker with all phases
3. Verify prerequisites
4. For each phase:
   - Implement code per plan specifications
   - Test with scenarios from plan using @app-tester
   - Update TodoWrite and .md plan file
   - Get user confirmation before next phase
5. Run comprehensive final validation
6. Generate completion report
7. Update structure documentation (if approved)

### Mode 2: User-Provided Instructions

**Input**: Custom implementation instructions from user

**Workflow:**
1. Parse user instructions
2. Identify tasks and files to modify/create
3. Create TodoWrite tracker
4. Implement tasks in logical order
5. Test with @app-tester after completion
6. Generate completion summary

### Mode 3: Quick Modifications

**Input**: Simple modification request

**Workflow:**
1. Acknowledge change
2. Execute immediately
3. Quick verification
4. Confirm complete

## Integration with Other Skills

### Required Skills:
- **@app-tester**: Comprehensive Playwright testing after each phase
- **@code-structure-guide**: Ensures correct file placement and architecture compliance
- **@ui-ux-designer**: Provides UI/UX requirements for frontend work

### Optional Skills:
- **@planning_implementation**: Can create formal plans before execution

## Reference Files

### implementation_examples.md
Detailed walkthroughs of all three modes with complete examples:
- Mode 1: Email verification system implementation
- Mode 2: Adding last_login timestamp tracking
- Mode 3: Changing dashboard welcome message
- Mode 1 variant: Plan search by feature name
- Mode 1→2 fallback: Handling missing plans

### best_practices.md
Comprehensive guidelines covering:
- Mode selection logic
- Testing strategies for each mode
- Progress tracking approaches
- File management best practices
- UI/UX integration
- Communication patterns
- Common pitfalls and solutions
- Success checklists

## Example Usage

### Example 1: Execute Formal Plan
```
User: "Execute the plan in tasks/USER_DASHBOARD_IMPLEMENTATION_PLAN.md"

Skill: [Reads plan, creates tracker, implements phase-by-phase with testing]
```

### Example 2: User Instructions
```
User: "Add a last_login timestamp field to track when users log in"

Skill: [Parses requirements, creates tracker, implements with testing]
```

### Example 3: Quick Modification
```
User: "Change the dashboard title from 'Dashboard' to 'My Dashboard'"

Skill: [Executes immediately, quick verification, done]
```

## Best Practices

1. **Always determine the correct mode first** - avoid over-engineering simple tasks
2. **Test after every phase** (Mode 1) or after completion (Mode 2)
3. **Never proceed with failing tests** - fix immediately and retest
4. **Consult structure guides** before creating/modifying files
5. **Update progress documentation** in real-time
6. **Get user confirmation** between phases (Mode 1)

## Version History

- **v1.0.0** (2025-10-29): Initial release with three flexible modes

## Author

Created for the Haufe Hackathon project to systematically execute implementation plans with quality validation.
