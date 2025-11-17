# Persistent Session Management in TypeScript

This document explains how to maintain conversation history across multiple runs in the TypeScript agent implementation.

## Overview

Unlike the Python version which uses `SQLiteSession`, the TypeScript SDK doesn't provide built-in persistent session storage. However, we've implemented **three approaches** to achieve persistent memory:

## Approach 1: JSON File Storage (Current Implementation) ✅

### How It Works

The implementation uses a simple `SessionManager` class that:

1. **Stores session mappings** in `sessions.json`
2. **Maps custom session IDs** (e.g., `user_123`) to **OpenAI conversation IDs** (e.g., `conv_abc...`)
3. **Automatically loads/saves** on each operation

### Usage

```typescript
import { runWorkflow } from './agent1-refactored';

// First conversation
const result1 = await runWorkflow({
  input_as_text: "Give me a beginner workout",
  session_id: "user_alice_session"
});

// Later conversation - SAME session ID = conversation continues!
const result2 = await runWorkflow({
  input_as_text: "How many times per week should I do it?",
  session_id: "user_alice_session"  // Agent remembers the workout!
});
```

### Sessions.json Structure

```json
{
  "user_alice_session": {
    "session_id": "user_alice_session",
    "conversation_id": "conv_abc123xyz",
    "created_at": "2025-10-26T10:00:00.000Z",
    "last_used": "2025-10-26T10:05:00.000Z"
  }
}
```

### Pros & Cons

✅ **Pros:**
- Simple to implement
- No external dependencies
- Easy to debug (human-readable JSON)
- Works immediately

❌ **Cons:**
- Not suitable for production (file I/O on every request)
- No concurrency control
- Limited scalability

---

## Approach 2: Database Storage (Recommended for Production)

For production use, replace the JSON file with a database:

### Option A: SQLite

```typescript
import Database from 'better-sqlite3';

class DatabaseSessionManager {
  private db: Database.Database;

  constructor(dbPath: string = './sessions.db') {
    this.db = new Database(dbPath);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        conversation_id TEXT,
        created_at TEXT,
        last_used TEXT
      )
    `);
  }

  getSession(sessionId: string): SessionData | undefined {
    const row = this.db.prepare(
      'SELECT * FROM sessions WHERE session_id = ?'
    ).get(sessionId);
    return row as SessionData | undefined;
  }

  setConversationId(sessionId: string, conversationId: string) {
    this.db.prepare(`
      INSERT OR REPLACE INTO sessions
      (session_id, conversation_id, created_at, last_used)
      VALUES (?, ?, COALESCE((SELECT created_at FROM sessions WHERE session_id = ?), ?), ?)
    `).run(sessionId, conversationId, sessionId, new Date().toISOString(), new Date().toISOString());
  }
}
```

**Install:** `npm install better-sqlite3 @types/better-sqlite3`

### Option B: PostgreSQL/MySQL

```typescript
import { Pool } from 'pg';

class PostgresSessionManager {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  async getSession(sessionId: string): Promise<SessionData | undefined> {
    const result = await this.pool.query(
      'SELECT * FROM sessions WHERE session_id = $1',
      [sessionId]
    );
    return result.rows[0];
  }

  async setConversationId(sessionId: string, conversationId: string) {
    await this.pool.query(`
      INSERT INTO sessions (session_id, conversation_id, created_at, last_used)
      VALUES ($1, $2, NOW(), NOW())
      ON CONFLICT (session_id)
      DO UPDATE SET conversation_id = $2, last_used = NOW()
    `, [sessionId, conversationId]);
  }
}
```

**Install:** `npm install pg @types/pg`

### Option C: Redis (Best for High Traffic)

```typescript
import { createClient } from 'redis';

class RedisSessionManager {
  private client: ReturnType<typeof createClient>;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL
    });
    this.client.connect();
  }

  async getSession(sessionId: string): Promise<SessionData | undefined> {
    const data = await this.client.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : undefined;
  }

  async setConversationId(sessionId: string, conversationId: string) {
    const session: SessionData = {
      session_id: sessionId,
      conversation_id: conversationId,
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString()
    };
    await this.client.setEx(
      `session:${sessionId}`,
      86400 * 7,  // 7 days TTL
      JSON.stringify(session)
    );
  }
}
```

**Install:** `npm install redis`

---

## Approach 3: Manual History Management

If you don't want to rely on OpenAI's conversation IDs, you can manually manage the conversation history:

```typescript
import { runWorkflow } from './agent1-refactored';
import { AgentInputItem } from '@openai/agents';

// Store history in your own database
const conversationHistory = new Map<string, AgentInputItem[]>();

export async function runWithManualHistory(
  sessionId: string,
  userMessage: string
) {
  // Get previous history
  const history = conversationHistory.get(sessionId) || [];

  // Add new user message
  const newHistory: AgentInputItem[] = [
    ...history,
    {
      role: 'user',
      content: [{ type: 'input_text', text: userMessage }]
    }
  ];

  // Run agent with full history
  const result = await runner.run(
    triageAgent,
    newHistory,  // Pass entire history!
    { context: context }
  );

  // Save updated history
  conversationHistory.set(sessionId, [
    ...newHistory,
    ...result.output  // Add agent's response
  ]);

  return result;
}
```

### Pros & Cons

✅ **Pros:**
- Full control over history
- No dependency on OpenAI conversation IDs
- Can filter/edit history before sending

❌ **Cons:**
- More complex to implement
- You manage storage yourself
- More API tokens used (sending full history each time)

---

## Comparison Table

| Approach | Persistence | Complexity | Production Ready | Cost |
|----------|-------------|------------|------------------|------|
| **JSON File** (current) | Yes | Low | ❌ No | Free |
| **SQLite** | Yes | Medium | ✅ Yes (small scale) | Free |
| **PostgreSQL/MySQL** | Yes | Medium | ✅ Yes | Database hosting |
| **Redis** | Yes | Medium | ✅ Yes (high traffic) | Redis hosting |
| **Manual History** | Yes | High | ✅ Yes | Higher API costs |
| **No Persistence** | No | Minimal | ❌ No | Lowest API costs |

---

## Recommendations

### For Development/Testing
- ✅ Use **JSON File** (current implementation)

### For Small Production Apps (<1000 users)
- ✅ Use **SQLite** with the database approach

### For Medium/Large Production Apps
- ✅ Use **PostgreSQL** or **MySQL**
- Store sessions in your existing database

### For High-Traffic/Real-Time Apps
- ✅ Use **Redis**
- Fast session lookups
- Automatic expiration (TTL)

### For Maximum Control
- ✅ Use **Manual History Management**
- Full control over conversation context
- Can implement custom logic (filtering, summarization)

---

## Example: Switching to Database

To switch from JSON to database, just replace the `sessionManager` initialization:

```typescript
// OLD (in agent1-refactored.ts):
const sessionManager = new SessionManager();  // JSON file

// NEW:
const sessionManager = new DatabaseSessionManager();  // SQLite
// or
const sessionManager = new PostgresSessionManager();  // PostgreSQL
// or
const sessionManager = new RedisSessionManager();     // Redis
```

The rest of the code remains unchanged!

---

## Testing Persistent Sessions

Run the example:

```bash
npx ts-node example-persistent-sessions.ts
```

This will demonstrate:
1. Starting a new conversation
2. Following up in the same session (agent remembers context)
3. How session data is stored

---

## Common Issues

### Issue: "Invalid conversation ID"

**Problem:** OpenAI expects conversation IDs to start with `conv_`

**Solution:** The implementation handles this automatically - it only uses conversation IDs returned by OpenAI, not custom ones.

### Issue: Agent doesn't remember previous messages

**Possible causes:**
1. Using a **different session_id** for each request
2. Conversation ID not being saved properly
3. Check `sessions.json` - does it have a `conversation_id`?

**Debug:**
```typescript
const result = await runWorkflow({
  input_as_text: "...",
  session_id: "test"
});

console.log('Conversation ID:', result.conversation_id);
// Should show: conv_xxxxx
```

### Issue: File permissions error on sessions.json

**Solution:**
```bash
chmod 644 sessions.json
```

Or specify a different path:
```typescript
const sessionManager = new SessionManager('./data/sessions.json');
```

---

## Next Steps

1. ✅ Try the `example-persistent-sessions.ts` demo
2. Choose the right persistence approach for your use case
3. For production, implement database storage
4. Add session cleanup/expiration logic

For questions, check the main README or agent documentation.
