# ✅ Backend Implementation Rules

## ALWAYS DO

### Database Architecture
- Use PostgreSQL for all database operations
- Use BOOLEAN type for boolean values
- Use TIMESTAMP or TIMESTAMPTZ for timestamps
- Implement UNIQUE constraints for business rules (e.g., unique email)
- Implement CASCADE deletion for dependent entities (ON DELETE CASCADE)
- Use parameterized queries with placeholders ($1, $2, $3)

### Controller Pattern
- Use object-based controllers: `const controller = { method() {} }`
- Export controller as default object
- Wrap all async methods in try-catch blocks
- Check validation errors at method start with `validationResult(req)`
- Return early on validation failures (400 status)
- Use repository calls for business logic
- Return consistent error responses
- Use appropriate HTTP status codes (200, 201, 400, 500)
- Import `Request, Response` from express
- Import `validationResult` from express-validator

### Repository & Data Access
- Route all database access through repositories
- Create one repository per entity (UserRepository, HabitRepository, etc.)
- Use exported functions in repositories (NOT classes)
- Use PostgreSQL query format with placeholders ($1, $2, $3)
- Always use parameterized queries (prevent SQL injection)
- Name repositories with PascalCase + "Repository" suffix
- Focus repositories on data access only (no business logic)
- Return properly typed objects from repository methods

### Project Structure
- Organize by layer: config/, controllers/, middleware/, models/, repositories/, routes/, services/
- Use PascalCase for repositories (UserRepository.ts)
- Use camelCase for controllers (authController.ts)
- Use lowercase for routes (auth.ts, users.ts)
- Place TypeScript interfaces in models/
- Place shared types in models/common.ts
- Maintain strict separation of concerns (routes → controllers → repositories)
- Use TypeScript strict mode for type safety

---

## ❌ NEVER DO - Anti-Patterns

### Controller Anti-Patterns
- NEVER use class-based controllers
- NEVER use `.bind()` in routes
- NEVER mix business logic in controllers
- NEVER access database directly from controllers
- NEVER skip validation checks
- NEVER return inconsistent error formats
- NEVER use `this` context in controllers

### Database Anti-Patterns
- NEVER concatenate SQL strings
- NEVER skip parameterized queries (SQL injection risk)
- NEVER store plain text passwords
- NEVER skip foreign key enforcement
- NEVER hardcode database connections
- NEVER use raw SQL queries without proper sanitization

### Architecture Anti-Patterns
- NEVER mix concerns across layers
- NEVER skip error handling in async functions
- NEVER expose internal errors to clients
- NEVER skip TypeScript type definitions
- NEVER create multiple repositories per entity
- NEVER skip documentation updates
- NEVER use class-based repositories
- NEVER use `any` types without strong justification
