# Web Application Integration Guide

Complete guide for integrating the AI Agent workflow into your web application.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [API Key Setup](#api-key-setup)
4. [Architecture Options](#architecture-options)
5. [Backend Integration](#backend-integration)
6. [Frontend Integration](#frontend-integration)
7. [Session Management](#session-management)
8. [Security Best Practices](#security-best-practices)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## System Overview

### What This Agent Does

This is a **multi-agent AI system** with three specialized agents:

```
┌─────────────────────────────────────────────────────────┐
│                      User Request                       │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
            ┌─────────────────┐
            │  Triage Agent   │ ◄── Routes requests
            │  (gpt-5-mini)   │
            └────────┬────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌──────────────┐
│ Mentor Agent  │         │ Gym Builder  │
│ (gpt-5-mini)  │         │ (gpt-5-mini) │
├───────────────┤         ├──────────────┤
│ • Habit       │         │ • Workout    │
│   coaching    │         │   plans      │
│ • Motivation  │         │ • Exercise   │
│ • Productivity│         │   guidance   │
└───────────────┘         └──────────────┘
```

### Key Features

✅ **Automatic routing** - Triage agent picks the right specialist
✅ **Context-aware** - Mentor agent receives habit list
✅ **Persistent memory** - Conversations continue across sessions
✅ **Web search** - Agents can fetch real-time information
✅ **Multi-turn conversations** - Follow-up questions work seamlessly

---

## Prerequisites

### Required Accounts

1. **OpenAI Account** (Required)
   - Sign up at: https://platform.openai.com
   - Need access to GPT-5-mini model
   - Credit card required for API usage

2. **Node.js Environment**
   - Node.js v18+ installed
   - npm or yarn package manager

### Installation

```bash
# Clone or copy the agent files
cd your-project

# Install dependencies
npm install @openai/agents zod

# For TypeScript projects
npm install --save-dev typescript @types/node ts-node
```

---

## API Key Setup

### Step 1: Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Name it (e.g., "Habit Coach Agent")
4. **Copy the key immediately** - you won't see it again!
5. It looks like: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Configure the Key

**IMPORTANT: Never commit API keys to Git!**

#### Option A: Environment Variable (Recommended for Production)

```bash
# Linux/Mac - Add to ~/.bashrc or ~/.zshrc
export OPENAI_API_KEY="sk-proj-YOUR_KEY_HERE"

# Windows PowerShell
$env:OPENAI_API_KEY="sk-proj-YOUR_KEY_HERE"

# Or create .env file in your project root:
echo "OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE" > .env
```

**Load .env in your app:**
```bash
npm install dotenv
```

```typescript
// At the top of your main file
import dotenv from 'dotenv';
dotenv.config();
```

#### Option B: Direct in Code (Development Only!)

```typescript
// ⚠️ ONLY for local development!
process.env.OPENAI_API_KEY = 'sk-proj-YOUR_KEY_HERE';
```

### Step 3: Verify API Key Works

```bash
# Quick test
npx ts-node -e "
import { runWorkflow } from './agent1-refactored';
runWorkflow({
  input_as_text: 'Hello, test',
  session_id: 'test'
}).then(() => console.log('✅ API key works!'));
"
```

---

## Architecture Options

### Option 1: Backend API Server (Recommended)

```
┌──────────────┐      HTTP/REST      ┌──────────────┐
│   Frontend   │ ◄──────────────────► │   Backend    │
│ (React/Vue)  │      JSON           │  (Express)   │
└──────────────┘                      └──────┬───────┘
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │  AI Agents   │
                                      │   Workflow   │
                                      └──────────────┘
```

**Pros:**
- ✅ Secure (API key hidden from users)
- ✅ Rate limiting control
- ✅ Session management on server
- ✅ Easy to monitor/log

**Cons:**
- ❌ Requires backend infrastructure

### Option 2: Serverless Functions

```
Frontend → API Gateway → Lambda/Vercel/Netlify Functions → AI Agents
```

**Pros:**
- ✅ No server management
- ✅ Auto-scaling
- ✅ Pay-per-use

**Cons:**
- ❌ Cold start latency
- ❌ Function timeout limits

### Option 3: Direct Client-Side (NOT RECOMMENDED)

**❌ Never expose your OpenAI API key in client-side code!**

---

## Backend Integration

### Express.js Example

```typescript
// server.ts
import express from 'express';
import dotenv from 'dotenv';
import { runWorkflow } from './agent1-refactored';

dotenv.config();

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main agent endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId, habitList } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Run the agent workflow
    const result = await runWorkflow({
      input_as_text: message,
      session_id: sessionId,
      habit_list: habitList || []
    });

    // Return response
    res.json({
      success: true,
      message: result.output_text,
      agentUsed: result.agent_used,
      sessionId: result.session_id,
      conversationId: result.conversation_id
    });

  } catch (error: any) {
    console.error('Agent error:', error);

    // Handle specific OpenAI errors
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.'
      });
    }

    if (error.status === 401) {
      return res.status(500).json({
        error: 'API configuration error'
      });
    }

    res.status(500).json({
      error: 'Failed to process request',
      details: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Agent API running on http://localhost:${PORT}`);
});
```

**Install dependencies:**
```bash
npm install express dotenv
npm install --save-dev @types/express
```

**Start the server:**
```bash
npx ts-node server.ts
```

### Next.js API Route Example

```typescript
// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { runWorkflow } from '@/lib/agent1-refactored';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sessionId, habitList } = req.body;

    const result = await runWorkflow({
      input_as_text: message,
      session_id: sessionId,
      habit_list: habitList || []
    });

    res.status(200).json({
      success: true,
      message: result.output_text,
      agentUsed: result.agent_used
    });

  } catch (error: any) {
    console.error('Agent error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}
```

### Vercel Serverless Function Example

```typescript
// api/chat.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { runWorkflow } from '../lib/agent1-refactored';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { message, sessionId, habitList } = req.body;

  try {
    const result = await runWorkflow({
      input_as_text: message,
      session_id: sessionId,
      habit_list: habitList || []
    });

    return res.status(200).json({
      message: result.output_text,
      agentUsed: result.agent_used
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
```

---

## Frontend Integration

### React Example

```typescript
// hooks/useAgent.ts
import { useState } from 'react';

interface HabitItem {
  name: string;
  time: string;
  achieved: boolean;
}

export function useAgent(sessionId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (
    message: string,
    habitList: HabitItem[] = []
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId,
          habitList
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error };
}
```

```typescript
// components/ChatInterface.tsx
import { useState } from 'react';
import { useAgent } from '@/hooks/useAgent';

export function ChatInterface() {
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'agent';
    content: string;
    agentUsed?: string;
  }>>([]);
  const [input, setInput] = useState('');
  const { sendMessage, loading } = useAgent('user-123');

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }]);

    try {
      // Send to agent
      const result = await sendMessage(input);

      // Add agent response
      setMessages(prev => [...prev, {
        role: 'agent',
        content: result.message,
        agentUsed: result.agentUsed
      }]);

      setInput('');

    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <div className="message-content">{msg.content}</div>
            {msg.agentUsed && (
              <div className="agent-badge">Agent: {msg.agentUsed}</div>
            )}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about habits or request a workout..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
```

### Vue.js Example

```vue
<!-- ChatInterface.vue -->
<template>
  <div class="chat-container">
    <div class="messages">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="['message', `message-${msg.role}`]"
      >
        <div class="message-content">{{ msg.content }}</div>
        <div v-if="msg.agentUsed" class="agent-badge">
          Agent: {{ msg.agentUsed }}
        </div>
      </div>
    </div>

    <div class="input-area">
      <input
        v-model="input"
        @keyup.enter="sendMessage"
        :disabled="loading"
        placeholder="Ask about habits or request a workout..."
      />
      <button @click="sendMessage" :disabled="loading">
        {{ loading ? 'Sending...' : 'Send' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const messages = ref<Array<{
  role: 'user' | 'agent';
  content: string;
  agentUsed?: string;
}>>([]);
const input = ref('');
const loading = ref(false);

const sendMessage = async () => {
  if (!input.value.trim()) return;

  messages.value.push({ role: 'user', content: input.value });

  loading.value = true;
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input.value,
        sessionId: 'user-123'
      })
    });

    const data = await response.json();

    messages.value.push({
      role: 'agent',
      content: data.message,
      agentUsed: data.agentUsed
    });

    input.value = '';

  } catch (error) {
    console.error('Failed to send message:', error);
  } finally {
    loading.value = false;
  }
};
</script>
```

### Vanilla JavaScript Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>AI Habit Coach</title>
</head>
<body>
  <div id="chat-container">
    <div id="messages"></div>
    <input id="user-input" placeholder="Type your message..." />
    <button id="send-btn">Send</button>
  </div>

  <script>
    const sessionId = 'user-' + Date.now();

    async function sendMessage() {
      const input = document.getElementById('user-input');
      const message = input.value.trim();
      if (!message) return;

      // Display user message
      addMessage('user', message);
      input.value = '';

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            sessionId
          })
        });

        const data = await response.json();

        // Display agent response
        addMessage('agent', data.message);

      } catch (error) {
        addMessage('error', 'Failed to get response');
      }
    }

    function addMessage(role, content) {
      const messagesDiv = document.getElementById('messages');
      const msgDiv = document.createElement('div');
      msgDiv.className = `message message-${role}`;
      msgDiv.textContent = content;
      messagesDiv.appendChild(msgDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  </script>
</body>
</html>
```

---

## Session Management

### Generating Session IDs

**Per User:**
```typescript
// Use user ID from your auth system
const sessionId = `user_${userId}`;
```

**Per Conversation:**
```typescript
// New session for each conversation thread
const sessionId = `conv_${userId}_${Date.now()}`;
```

**Per Device:**
```typescript
// Browser fingerprint or device ID
const sessionId = `device_${deviceId}`;
```

### Session Cleanup

```typescript
// cleanup-sessions.ts
import { sessionManager } from './agent1-refactored';
import * as fs from 'fs';

function cleanupOldSessions(maxAgeDays: number = 30) {
  const sessionsFile = './sessions.json';
  if (!fs.existsSync(sessionsFile)) return;

  const sessions = JSON.parse(fs.readFileSync(sessionsFile, 'utf-8'));
  const now = new Date();
  const cutoff = new Date(now.getTime() - maxAgeDays * 24 * 60 * 60 * 1000);

  let cleaned = 0;
  for (const [sessionId, session] of Object.entries(sessions)) {
    const lastUsed = new Date((session as any).last_used);
    if (lastUsed < cutoff) {
      delete sessions[sessionId];
      cleaned++;
    }
  }

  fs.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2));
  console.log(`🧹 Cleaned ${cleaned} old sessions`);
}

// Run cleanup
cleanupOldSessions(30); // Delete sessions older than 30 days
```

**Schedule with cron:**
```typescript
// Using node-cron
import cron from 'node-cron';

// Run cleanup every day at 3 AM
cron.schedule('0 3 * * *', () => {
  cleanupOldSessions(30);
});
```

---

## Security Best Practices

### 1. Never Expose API Keys

```typescript
// ❌ WRONG - Don't do this!
const apiKey = 'sk-proj-xxxxx';

// ✅ CORRECT - Use environment variables
const apiKey = process.env.OPENAI_API_KEY;
```

### 2. Add Rate Limiting

```typescript
// Using express-rate-limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later'
});

app.use('/api/chat', limiter);
```

### 3. Validate User Input

```typescript
function sanitizeInput(message: string): string {
  // Remove excessive whitespace
  message = message.trim();

  // Limit message length
  if (message.length > 2000) {
    message = message.substring(0, 2000);
  }

  // Remove potentially harmful characters
  message = message.replace(/[<>]/g, '');

  return message;
}
```

### 4. Authenticate Users

```typescript
// Example with JWT
import jwt from 'jsonwebtoken';

app.post('/api/chat', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const sessionId = `user_${user.id}`;

    // Continue with agent...

  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});
```

### 5. Add Request Logging

```typescript
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();

  try {
    const result = await runWorkflow({...});

    // Log successful request
    console.log({
      timestamp: new Date().toISOString(),
      sessionId: req.body.sessionId,
      agentUsed: result.agent_used,
      duration: Date.now() - startTime,
      status: 'success'
    });

    res.json(result);

  } catch (error) {
    // Log error
    console.error({
      timestamp: new Date().toISOString(),
      sessionId: req.body.sessionId,
      error: error.message,
      duration: Date.now() - startTime,
      status: 'error'
    });

    res.status(500).json({ error: 'Failed' });
  }
});
```

---

## Deployment

### Environment Variables

Create `.env.production`:
```env
OPENAI_API_KEY=sk-proj-YOUR_PRODUCTION_KEY
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  agent-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
    restart: unless-stopped
```

### Vercel Deployment

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "env": {
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

**Add secret:**
```bash
vercel secrets add openai-api-key sk-proj-YOUR_KEY
```

---

## Troubleshooting

### Common Issues

#### 1. "Missing credentials" Error

**Problem:** API key not set

**Solution:**
```bash
# Check if key is set
echo $OPENAI_API_KEY

# Set it
export OPENAI_API_KEY="sk-proj-YOUR_KEY"
```

#### 2. "Rate limit exceeded" Error

**Problem:** Too many API requests

**Solutions:**
- Implement rate limiting on your backend
- Use caching for common questions
- Upgrade OpenAI plan

#### 3. "Invalid conversation ID" Error

**Problem:** Conversation ID doesn't start with `conv_`

**Solution:** Don't manually set conversation IDs - let OpenAI generate them

#### 4. Session Not Persisting

**Check:**
1. Is `sessions.json` being created?
2. Does it have write permissions?
3. Is session ID consistent across requests?

```bash
# Check sessions file
cat sessions.json

# Check permissions
ls -la sessions.json
chmod 644 sessions.json
```

#### 5. Agent Not Remembering Context

**Debug:**
```typescript
const result = await runWorkflow({...});
console.log('Conversation ID:', result.conversation_id);
// Should show: conv_xxxxx
```

### Debug Mode

Enable verbose logging:

```typescript
// Add to agent1-refactored.ts
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
  console.log('[DEBUG] Session:', session);
  console.log('[DEBUG] Conversation ID:', conversationId);
  console.log('[DEBUG] Result:', result);
}
```

Run with debug:
```bash
DEBUG=true npx ts-node server.ts
```

---

## Cost Management

### Monitoring Usage

Track API usage in your logs:

```typescript
let totalTokens = 0;
let totalCost = 0;

app.post('/api/chat', async (req, res) => {
  const result = await runWorkflow({...});

  // Track usage (if available in result)
  const tokensUsed = result.usage?.total_tokens || 0;
  totalTokens += tokensUsed;

  // GPT-5-mini pricing (example: $0.002 per 1K tokens)
  totalCost += (tokensUsed / 1000) * 0.002;

  console.log(`Total tokens: ${totalTokens}, Total cost: $${totalCost.toFixed(4)}`);
});
```

### Cost Optimization

1. **Use caching** for common questions
2. **Limit message history** length
3. **Use cheaper models** for simple tasks
4. **Implement request quotas** per user

---

## Next Steps

1. ✅ Set up your OpenAI API key
2. ✅ Choose your architecture (Express/Next.js/Vercel)
3. ✅ Implement the backend endpoint
4. ✅ Create your frontend interface
5. ✅ Add authentication and security
6. ✅ Deploy to production
7. ✅ Monitor usage and costs

## Support

- OpenAI API Docs: https://platform.openai.com/docs
- OpenAI Agents SDK: https://github.com/openai/openai-agents-sdk
- This project's README: See `README.md`

---

**Ready to integrate!** Start with the Express.js example above and customize to your needs.
