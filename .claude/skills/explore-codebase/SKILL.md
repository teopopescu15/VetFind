---
name: explore-codebase
description: |
  Intelligent codebase exploration skill that searches and identifies relevant files and folders based on user requirements. This skill should be used when:
  - User wants to understand existing codebase structure before modifications
  - User needs to locate files/folders relevant to a specific feature or task
  - A step-by-step implementation plan requires contextual knowledge about existing code
  - User asks "where should I add X feature?" or "how is Y currently implemented?"

  This skill ONLY provides information and analysis - it NEVER modifies code or creates implementation plans directly. Its purpose is to provide relevant context that enables informed decision-making or feeds into the planning-implementation skill.

  **Dependencies**: This skill DEPENDS on the code-structure-guide skill for up-to-date structure and rules information.
tools: [Read, Glob, Grep, TodoWrite]
---

# Explore Codebase

## Overview

Analyze the codebase structure, understand user requirements, and identify relevant files and folders for modifications or implementation. This skill provides context-aware exploration based on the project's modular monolith architecture without making any code changes or creating implementation plans.

**IMPORTANT**: This skill DEPENDS on the `code-structure-guide` skill and ALWAYS references its up-to-date structure and rules files instead of duplicating information.

## Core Workflow

Follow this process for every codebase exploration request:

### 1. Load Project Structure Context

**IMPORTANT**: Before proceeding with codebase exploration, **activate the `code-structure-guide` skill** to load its reference files into context.

```bash
# Activate the code-structure-guide skill
Skill: code-structure-guide
```

This will load the comprehensive project structure references that this skill depends on:

**Structure References:**
- **backend_structure.md**: Complete backend folder structure with detailed descriptions
- **frontend_structure.md**: Complete frontend folder structure with detailed descriptions

**Implementation Rules:**
- **backend_rules.md**: Backend implementation rules (ALWAYS DO / NEVER DO)
- **frontend_rules.md**: Frontend implementation rules (ALWAYS DO / NEVER DO)
- **security_rules.md**: Security rules and best practices

**What These Files Contain:**
- Complete backend and frontend folder structures with file-by-file descriptions
- Layer separation guidelines (routes → controllers → repositories)
- Architectural patterns and conventions
- Security best practices
- TypeScript typing requirements
- All ALWAYS DO and NEVER DO rules

**Critical**:
1. **Always activate the `code-structure-guide` skill first** before exploring the codebase
2. This ensures all reference files are loaded as context
3. These files are maintained by the `code-structure-guide` skill and are always kept up-to-date
4. Use the loaded context throughout your exploration to cross-reference structure and rules

### 2. Understand the User's Task

Analyze what the user is asking for. Common patterns include:

**Feature Addition**
- "I want to add user profiles"
- "How do I implement notifications?"
- "Where should I add a shopping cart feature?"

**Bug Investigation**
- "Where is authentication handled?"
- "How does the order system work?"
- "Find where product categories are managed"

**Refactoring/Understanding**
- "Explain the analytics flow"
- "How is multi-tenancy implemented?"
- "What files handle AI agent logic?"

**Pre-Planning Context**
- "I need to implement X feature - show me relevant existing code"
- "What files will I need to modify for Y?"

### 3. Map Task to Architecture Layers

Based on the user's task and the loaded structure references from `code-structure-guide`, determine which architectural layers are involved.

**Reference the loaded structure files** (`backend_structure.md` and `frontend_structure.md`) to identify:

**Backend Layers** (see `backend_structure.md` for complete details):
- Routes, Controllers, Repositories, Services, Middleware, Config, Types, Agent

**Frontend Layers** (see `frontend_structure.md` for complete details):
- Pages, Components (analytics/, chat/, menu/, ui/), Hooks, Services, Context, Types, Lib

**Important**: Always refer back to the loaded structure files for the most current and detailed layer information, as they are maintained with the latest codebase changes.

### 4. Search for Relevant Files

Use targeted searches to identify existing implementations:

**Search Strategy**:

1. **Start Broad** - Use Glob to find files by pattern:
   ```
   Glob: backend/src/controllers/*Controller.ts
   Glob: frontend/src/pages/*.tsx
   Glob: backend/src/repositories/*Repository.ts
   ```

2. **Narrow Down** - Use Grep to search for specific keywords:
   ```
   Grep: "authentication" (case-insensitive)
   Grep: "product" in backend/src/repositories/
   Grep: "useAuth" in frontend/src/hooks/
   ```

3. **Read Key Files** - Read the most relevant files to understand implementation:
   ```
   Read: backend/src/controllers/authController.ts
   Read: frontend/src/hooks/useProducts.ts
   ```

**Examples**:

**Example 1: User wants to add "favorites" feature**
- Search: `Grep "product" --type ts` to find product-related files
- Identify: ProductController, ProductRepository, useProducts hook, ProductCard component
- Read: Key files to understand current product structure
- Report: Files that handle products (where favorites would integrate)

**Example 2: User asks "how is authentication implemented?"**
- Search: `Glob backend/src/**/auth*.ts` and `Glob frontend/src/**/auth*.ts*`
- Identify: authController, auth middleware, AuthContext, useAuth hook
- Read: Authentication flow files
- Report: Complete auth architecture with JWT cookies, role-based access

**Example 3: User wants to understand analytics**
- Search: `Grep "analytics" --type ts`
- Identify: analyticsController, AnalyticsRepository, useAnalytics hook, analytics components
- Read: Analytics data flow files
- Report: How analytics data flows from database to UI

### 5. Analyze Against Implementation Rules

Cross-reference findings with implementation rules from the loaded `code-structure-guide` reference files:

**Backend Checks** (reference `backend_rules.md`):
- Are repositories using parameterized queries?
- Are controllers using object-based pattern (not class-based)?
- Is business logic properly separated from controllers?
- Are types properly defined?
- Review all ALWAYS DO and NEVER DO rules from `backend_rules.md`

**Frontend Checks** (reference `frontend_rules.md`):
- Are components using functional patterns with hooks?
- Is API communication going through service files?
- Are custom hooks wrapping context (not useContext directly)?
- Are routes protected with ProtectedRoute wrapper?
- Review all ALWAYS DO and NEVER DO rules from `frontend_rules.md`

**Security Checks** (reference `security_rules.md`):
- Are JWT tokens stored in httpOnly cookies (NOT localStorage)?
- Is input validation present on both frontend and backend?
- Are passwords hashed with bcrypt?
- Is CORS properly configured?
- Review all security rules from `security_rules.md`

**Important**: Always consult the loaded rules files for complete and up-to-date implementation patterns. These files contain comprehensive ALWAYS DO and NEVER DO sections that must be followed.

### 6. Provide Structured Report

Return findings in this format:

```markdown
# Codebase Exploration Report

## User Task
[Brief summary of what the user wants to accomplish]

## Architecture Analysis
[Which layers are involved: routes, controllers, repositories, services, pages, components, hooks]

## Relevant Files Found

### Backend Files
- **Route**: `backend/src/routes/[name].ts` - [Purpose]
- **Controller**: `backend/src/controllers/[name]Controller.ts` - [Purpose]
- **Repository**: `backend/src/repositories/[Name]Repository.ts` - [Purpose]
- **Service**: `backend/src/services/[name]Service.ts` - [Purpose, if applicable]
- **Types**: `backend/src/types/[name].ts` - [Purpose, if applicable]

### Frontend Files
- **Page**: `frontend/src/pages/[Name].tsx` - [Purpose]
- **Components**: `frontend/src/components/[Name].tsx` - [Purpose]
- **Hook**: `frontend/src/hooks/use[Name].ts` - [Purpose]
- **Service**: `frontend/src/services/[name]Api.ts` - [Purpose]
- **Types**: `frontend/src/types/[name].ts` - [Purpose, if applicable]

## Implementation Patterns Observed
[Key patterns found: controller structure, repository usage, React patterns, etc.]

## Relevant Implementation Rules
[Critical rules from project_structure.md that apply to this task]

## Recommendations
[Suggestions for where new code should be placed based on architecture]

## Additional Context
[Any important architectural decisions, multi-tenancy considerations, security notes, etc.]
```

## Important Constraints

### What This Skill DOES
✅ Search and identify relevant files and folders
✅ Analyze existing code structure and patterns
✅ Provide context about how features are currently implemented
✅ Cross-reference findings with architectural rules
✅ Recommend where new code should be placed
✅ Explain data flow and component relationships

### What This Skill NEVER DOES
❌ NEVER modify any code files
❌ NEVER create implementation plans directly
❌ NEVER write code or suggest code changes
❌ NEVER execute bash commands beyond reading files
❌ NEVER make architectural decisions for the user
❌ NEVER create new files or folders

## Usage Patterns

### Standalone Exploration
User wants to understand existing code:
```
User: "How is the order system implemented?"
→ This skill: Search and report on order-related files
→ Output: Structured report with file locations and explanations
```

### Pre-Planning Context
User wants to implement a new feature:
```
User: "I want to add a ratings feature for products"
→ This skill: Search product-related files and report findings
→ Output: Context about existing product implementation
→ Next step: User or planning-implementation skill uses this context
```

### Debugging/Investigation
User needs to find where something is broken:
```
User: "Where is email verification handled?"
→ This skill: Search auth and email-related files
→ Output: Report on authentication flow and email service
```

## Reference Files (from code-structure-guide skill)

This skill DEPENDS on the `code-structure-guide` skill and uses its comprehensive reference documentation:

### Structure References
- `../.claude/skills/code-structure-guide/references/backend_structure.md` - Complete backend folder structure and purposes
- `../.claude/skills/code-structure-guide/references/frontend_structure.md` - Complete frontend folder structure and purposes

### Rules References
- `../.claude/skills/code-structure-guide/references/backend_rules.md` - Backend implementation rules (ALWAYS DO / NEVER DO)
- `../.claude/skills/code-structure-guide/references/frontend_rules.md` - Frontend implementation rules (ALWAYS DO / NEVER DO)
- `../.claude/skills/code-structure-guide/references/security_rules.md` - Security implementation rules

**Always load these files first** to understand the modular monolith architecture before searching the codebase. These files are maintained by the `code-structure-guide` skill and are always kept up-to-date with the latest codebase changes.

## Tips for Effective Exploration

1. **Always Start with Structure**: Load all reference files from `code-structure-guide` skill first
2. **Use Up-to-Date References**: Always consult `code-structure-guide` references for latest structure and rules
3. **Think in Layers**: Map user tasks to architectural layers (routes → controllers → repositories)
4. **Search Progressively**: Start broad (Glob), narrow down (Grep), then read specific files
5. **Cross-Reference Rules**: Always check findings against loaded implementation rules files
6. **Be Thorough**: Search both backend and frontend when features span both
7. **Focus on Relevance**: Only report files directly related to the user's task
8. **Provide Context**: Explain WHY files are relevant, not just WHAT they are
9. **Respect Boundaries**: NEVER modify code or create plans - only provide information
10. **Trust the Dependency**: The `code-structure-guide` skill maintains the source of truth for structure and rules

## Special Considerations

### Multi-Tenancy
This project uses multi-tenant architecture:
- Users belong to restaurants (restaurant_id)
- All queries must be scoped by restaurant_id
- JWT tokens include restaurant_id and role claims
- Check UserRepository, authController for patterns

### Role-Based Access
Two roles: admin and staff
- Admin: Full CRUD on products, tables, categories, components, staff
- Staff: View and manage orders, tables, components (read-only)
- Check roleAuth middleware for authorization patterns

### Security Focus
- JWT tokens MUST be in httpOnly cookies (NEVER localStorage)
- Always validate on both frontend and backend
- Use parameterized queries to prevent SQL injection
- Check `security_rules.md` from `code-structure-guide` skill for all security rules

## Integration with Planning Skill

When this skill is used to provide context for implementation planning:

1. **This skill provides**: Relevant files, existing patterns, architectural context
2. **Planning skill receives**: Structured report with file locations and rules
3. **Planning skill uses**: Context to create informed implementation plan
4. **Result**: Implementation plans that integrate seamlessly with existing code

This creates a two-stage workflow:
```
explore-codebase (gather context) → planning-implementation (create plan with context)
```
