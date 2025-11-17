# 🔙 Backend Structure

## Complete Folder Structure

```
backend/
├── src/
│   ├── agent/               # AI agent core logic and implementation
│   │   ├── agent.ts         # OpenAI SDK agent with streaming responses and tool calling
│   │   └── restaurantAnalytics.ts # AI agent tool for restaurant analytics insights
│   │
│   ├── config/              # Configuration files for external services and integrations
│   │   ├── database.ts      # PostgreSQL connection pool configuration
│   │   └── passport.ts      # Google OAuth Passport strategy configuration
│   │
│   ├── controllers/         # HTTP request/response handlers (no business logic)
│   │   ├── agentController.ts # AI agent endpoints logic (chat, streaming, conversations)
│   │   ├── analyticsController.ts # Analytics endpoints (revenue, orders, insights, product rankings)
│   │   ├── authController.ts # Multi-tenant authentication endpoints (register with restaurant, login, logout, email verification)
│   │   ├── categoryController.ts # Category management endpoints (CRUD for product categories)
│   │   ├── componentController.ts # Component inventory endpoints (CRUD for components)
│   │   ├── ordersController.ts # Order management endpoints (create, list, update status)
│   │   ├── productController.ts # Product management endpoints (CRUD for menu items)
│   │   ├── staffController.ts # Staff management endpoints (create, list, update, delete staff members)
│   │   ├── tableController.ts # Table management endpoint (single table operations)
│   │   └── tablesController.ts # Tables collection endpoints (list, create, manage multiple tables)
│   │
│   ├── middleware/          # Express middleware for request processing
│   │   ├── auth.ts          # JWT verification middleware for protected routes
│   │   └── roleAuth.ts      # Role-based authorization middleware (requireAdmin, requireStaff)
│   │
│   ├── repositories/        # Database access layer (data operations only)
│   │   ├── AnalyticsRepository.ts # Analytics data queries (revenue, orders, product rankings, insights)
│   │   ├── CategoryRepository.ts # Category CRUD operations (create, list, update, delete categories)
│   │   ├── ComponentRepository.ts # Component inventory CRUD operations
│   │   ├── ConversationRepository.ts # Conversation and message CRUD operations
│   │   ├── OrderRepository.ts # Order CRUD operations (create, list, update order status)
│   │   ├── ProductRepository.ts # Product CRUD operations (create, list, update, delete menu items)
│   │   ├── RestaurantRepository.ts # Restaurant CRUD operations (create, findByName, findById)
│   │   ├── TableRepository.ts # Table CRUD operations (create, list, update, delete tables)
│   │   └── UserRepository.ts # Multi-tenant user operations (create users, staff queries, restaurant-scoped operations)
│   │
│   ├── routes/              # API route definitions and endpoint mapping
│   │   ├── agent.ts         # AI agent routes: POST /chat, GET /conversations
│   │   ├── analytics.ts     # Analytics routes: GET /revenue, /orders, /insights, /product-rankings
│   │   ├── auth.ts          # Multi-tenant authentication routes with restaurant registration
│   │   ├── categories.ts    # Category routes: CRUD endpoints for categories
│   │   ├── components.ts    # Component inventory routes: CRUD endpoints for components
│   │   ├── orders.ts        # Order routes: POST /create, GET /list, PATCH /update-status
│   │   ├── products.ts      # Product routes: CRUD endpoints for menu items
│   │   ├── staff.ts         # Staff management routes (CRUD endpoints, admin-only access)
│   │   ├── table.ts         # Single table route (individual table operations)
│   │   └── tables.ts        # Tables collection routes (list, create, manage tables)
│   │
│   ├── services/            # Business logic and external service integrations
│   │   ├── emailService.ts  # Email sending for verification and password reset
│   │   └── jwtService.ts    # JWT token generation with restaurant_id and role claims
│   │
│   ├── types/               # TypeScript type extensions and ambient declarations
│   │   ├── agent.ts         # AI agent types (Conversation, Message, AgentResponse)
│   │   ├── analytics.ts     # Analytics data types (Revenue, OrderStats, Insights, ProductRankings)
│   │   ├── express.d.ts     # Express Request/Response type extensions for auth
│   │   └── table.ts         # Table and order types (Table, Order, OrderItem, TableStatus)
│   │
│   └── index.ts             # Express server entry point and app initialization
│
├── .env                     # Environment variables (NEVER commit this file)
├── .env.example             # Environment variables template for setup
├── .gitignore               # Files and folders to exclude from version control
├── init-db.sql              # Multi-tenant database schema (restaurants, users with restaurant_id, role-based access)
├── package.json             # Node.js dependencies and scripts
└── tsconfig.json            # TypeScript compiler configuration
```

---

## Folder Descriptions

| Folder | Purpose | What Goes Here |
|--------|---------|----------------|
| **agent/** | AI agent implementation | OpenAI agent logic, streaming handlers, tool definitions, analytics integration for AI insights |
| **config/** | External service configurations | Database connections, OAuth strategies, third-party integrations |
| **controllers/** | HTTP request/response handling | Multi-tenant auth, staff management, product/category/table/order/component CRUD, analytics endpoints, validation checks, calling repositories, formatting responses |
| **middleware/** | Request processing pipeline | JWT authentication, role-based authorization (admin/staff), logging, error handling |
| **repositories/** | Database operations | Multi-tenant SQL queries, restaurant/user/staff/product/category/table/order/component CRUD, analytics queries, data access logic scoped by restaurant_id |
| **routes/** | API endpoint definitions | Route mapping for auth, products, categories, tables, orders, components, analytics, agent; middleware attachment (auth + role checks), request validation rules |
| **services/** | Business logic & integrations | JWT token generation with restaurant_id/role claims, email service, external API calls |
| **types/** | TypeScript type extensions | Ambient type declarations, agent types, analytics types, table/order types, module augmentations |

---

## Example: Adding a New Feature

### Scenario: Adding "User Profile" feature

#### Backend Files to Create:
```
backend/src/
├── controllers/
│   └── profileController.ts   # Profile CRUD endpoints
├── repositories/
│   └── ProfileRepository.ts   # Profile database operations
├── routes/
│   └── profile.ts             # Profile API routes
├── models/
│   └── Profile.ts             # Profile TypeScript interface
└── services/
    └── profileService.ts      # Profile business logic
```

#### After Creating Files:
1. Update this reference file with new file entries
2. Add descriptions for each new file
3. Ensure structure remains organized
4. Keep descriptions concise (one line maximum)
