# CLAUDE.md - Project-Specific Instructions

## Project Tech Stack

### VetFinder - Veterinary Clinic Finder Mobile Application

**Frontend:**
- React Native 0.76.5
- Expo SDK ~52.0.23
- TypeScript 5.3.3
- React Navigation v7
- React Native Paper (Material Design 3)
- NativeWind (Tailwind CSS for React Native)
- Expo Location, Image Picker, Linear Gradient

**Backend:**
- Node.js with Express.js
- TypeScript
- **PostgreSQL** (Database)
- node-postgres (pg) - PostgreSQL client
- JWT Authentication (jsonwebtoken, bcrypt)
- dotenv for environment variables

**Development:**
- Nodemon for auto-restart
- tsx for TypeScript execution
- ESLint + Prettier for code quality

**Database Schema:**
- PostgreSQL 14+
- Users table with role-based access (user, vetcompany, admin)
- Companies/Clinics table for vet company profiles
- Services table for clinic services
- Reviews table for user ratings
- Appointments table for bookings

**IMPORTANT**: All database migrations and models MUST use PostgreSQL syntax (SERIAL, RETURNING, etc.), NOT MySQL syntax.

**Testing Strategy:**
- **Web Version**: Playwright MCP for E2E testing, browser automation, and web UI validation
- **Mobile Version**: React Native Testing Library and Detox for mobile E2E testing
- **Backend**: Jest for unit and integration testing of API endpoints

**Development Commands:**
- **Backend**: `npm run dev` (runs on port 5000)
- **Web Version**: `npm run web` (MUST run on port 8081)
  - **Port Verification**: Before testing with Playwright MCP, verify the frontend is running on port 8081
  - **Port Conflict Resolution**: If port 8081 is not available or frontend is on wrong port:
    1. Kill the incorrect port: `lsof -ti:8081 | xargs -r kill -9`
    2. Restart with: `npm run web`
    3. Verify port 8081 is now active before proceeding with Playwright tests

---

## Code Style Requirements

### Object-Based Implementation (MANDATORY)

**CRITICAL RULE**: This project MUST use object literals and factory functions instead of ES6 classes or class-based patterns.

#### Required Patterns

**✅ USE - Factory Functions with Object Literals**:
```typescript
// Correct: Factory function returning object literal
export const createUser = (name: string, email: string) => {
  return {
    name,
    email,
    greet() {
      return `Hello, ${this.name}`;
    },
    updateEmail(newEmail: string) {
      this.email = newEmail;
    }
  };
};

// Correct: Object literal with methods
export const userService = {
  users: [] as User[],

  addUser(user: User) {
    this.users.push(user);
  },

  findUserByEmail(email: string) {
    return this.users.find(u => u.email === email);
  }
};
```

**✅ USE - Composition Over Inheritance**:
```typescript
// Correct: Composing behavior using object spreading
const withTimestamps = () => ({
  createdAt: new Date(),
  updatedAt: new Date()
});

const withValidation = (validate: (data: any) => boolean) => ({
  validate,
  isValid(data: any) {
    return this.validate(data);
  }
});

export const createModel = (data: any) => ({
  ...data,
  ...withTimestamps(),
  ...withValidation((d) => d !== null)
});
```

#### Prohibited Patterns

**❌ NEVER USE - ES6 Classes**:
```typescript
// WRONG: Do not use class syntax
class User {
  constructor(public name: string, public email: string) {}

  greet() {
    return `Hello, ${this.name}`;
  }
}

// WRONG: Do not use class-based inheritance
class AdminUser extends User {
  constructor(name: string, email: string, public role: string) {
    super(name, email);
  }
}
```

**❌ NEVER USE - Class-Based React Components**:
```typescript
// WRONG: Do not use class components
class MyComponent extends React.Component {
  render() {
    return <div>Hello</div>;
  }
}
```

#### React/React Native Specific Rules

**✅ ALWAYS use functional components with hooks**:
```typescript
// Correct: Functional component
export const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return <View>...</View>;
};
```

#### State Management Rules

**✅ USE - Object-based stores**:
```typescript
// Correct: Zustand store with object methods
export const useUserStore = create((set) => ({
  users: [],

  addUser: (user: User) => set((state) => ({
    users: [...state.users, user]
  })),

  removeUser: (id: string) => set((state) => ({
    users: state.users.filter(u => u.id !== id)
  }))
}));
```

#### Service/API Layer Rules

**✅ USE - Object literal services**:
```typescript
// Correct: Service as object literal
export const apiService = {
  baseUrl: 'https://api.example.com',

  async get(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
```

### Rationale

This project enforces object-based patterns because:
1. **Simplicity**: Object literals and factory functions are simpler and more transparent
2. **Composition**: Easier to compose behavior without inheritance hierarchies
3. **Testing**: Factory functions are easier to mock and test
4. **Performance**: Slightly better performance characteristics in some JavaScript engines
5. **Functional Style**: Aligns with functional programming principles

### Enforcement

- **Code Review**: All PRs will be reviewed for class usage and rejected if found
- **Linting**: ESLint rules configured to prevent class declarations
- **Claude Code**: This CLAUDE.md ensures AI assistance follows these patterns
- **Team Agreement**: All developers must adhere to these conventions

### Exceptions

**NONE**: There are no exceptions to this rule. Even third-party integrations must be wrapped in object-based adapters if they use classes.

### Migration Guide

If you encounter existing class-based code:
1. Convert to factory function returning object literal
2. Replace inheritance with composition using object spreading
3. Convert class methods to object methods
4. Update all imports and usages

---

## File Naming Conventions

### Backend File Naming (MANDATORY)

**CRITICAL RULE**: Backend files MUST NOT include the folder name as a suffix in the filename.

**✅ CORRECT - Simple descriptive names**:
```
backend/src/controllers/auth.ts          (NOT auth.controller.ts)
backend/src/models/user.ts               (NOT user.model.ts)
backend/src/middleware/auth.ts           (NOT auth.middleware.ts)
backend/src/routes/auth.ts               (NOT auth.routes.ts)
backend/src/services/email.ts            (NOT email.service.ts)
backend/src/utils/validation.ts          (NOT validation.util.ts)
```

**❌ WRONG - Redundant folder name in filename**:
```
backend/src/controllers/auth.controller.ts   ❌
backend/src/models/user.model.ts             ❌
backend/src/middleware/auth.middleware.ts    ❌
backend/src/routes/auth.routes.ts            ❌
backend/src/services/email.service.ts        ❌
```

**Rationale**: 
- The folder name already indicates the file type (controllers/, models/, etc.)
- Adding the suffix creates redundancy: `controllers/auth.controller.ts`
- Simpler names are cleaner and easier to work with
- Reduces filename length and improves readability

**Enforcement**:
- All new backend files must follow this convention
- Existing files should be gradually refactored to match
- Claude Code will enforce this pattern in all generated code

### Frontend File Naming

**React Native components follow standard React conventions**:
```
src/components/UserProfile.tsx       (PascalCase for components)
src/screens/HomeScreen.tsx           (PascalCase for screens)
src/hooks/useAuth.ts                 (camelCase with 'use' prefix)
src/utils/formatDate.ts              (camelCase for utilities)
src/types/user.ts                    (camelCase for type definitions)
```

---

**Remember**: When in doubt, use object literals and factory functions. Never use classes.
