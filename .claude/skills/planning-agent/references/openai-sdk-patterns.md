# OpenAI Agents SDK (TypeScript) - Patterns and Best Practices

Based on analysis of the openai-sdk-agent template and OpenAI Agents SDK documentation.

## Core Imports

```typescript
import { Agent, Runner, webSearchTool, withTrace, RunContext } from "@openai/agents";
import * as fs from 'fs';
import * as path from 'path';
```

## Agent Creation Pattern

### Basic Agent Structure

```typescript
const agentName = new Agent<ContextType>({
  name: "Agent-Name",           // Identifier for handoffs and logging
  instructions: string | fn,     // System prompt (static or dynamic)
  model: "gpt-5-mini",          // Model to use ("gpt-5-mini" or "gpt-5")
  tools: [webSearchTool, ...],  // Array of tools available to agent
  handoffs: [otherAgent, ...],  // Agents this can transfer to (creates transfer tools)
  modelSettings: {
    store: true,                // Enable conversation persistence (recommended)
    toolChoice: undefined,      // undefined | "required" | "auto"
    reasoning: {
      effort: "medium",         // "minimal" | "low" | "medium" | "high"
      summary: "auto"           // Reasoning summary mode
    }
  }
});
```

### Dynamic Instructions (Recommended)

Use a function to inject context into system prompts:

```typescript
function agentInstructions(
  runContext: RunContext<WorkflowContext>,
  agent: Agent<WorkflowContext>
): string {
  const context = runContext.context;

  return `You are [agent role].

**[Current Context]**
\`\`\`json
${JSON.stringify(context.getData(), null, 2)}
\`\`\`

**[Instructions]**
1. Analyze the user's request
2. Use the context above to inform your response
3. ...
`;
}

const agent = new Agent<WorkflowContext>({
  name: "Agent",
  instructions: agentInstructions,  // Function reference, NOT function call
  model: "gpt-5-mini",
  tools: []
});
```

### Static Instructions

For agents that don't need dynamic context:

```typescript
const agent = new Agent({
  name: "Router",
  instructions: `You are a routing agent. Your ONLY job is to call the appropriate transfer tool.

**Decision rules:**
- Workout questions → Call transfer_to_gym_builder
- Habit questions → Call transfer_to_mentor

You must use a transfer tool on your FIRST turn.`,
  model: "gpt-5-mini",
  handoffs: [gymBuilder, mentor],
  modelSettings: {
    toolChoice: "required"  // Force tool usage (important for routers!)
  }
});
```

## Context Pattern

### Define Context Class

```typescript
export interface DataItem {
  name: string;
  value: any;
}

export class WorkflowContext {
  user_id: string;
  data: DataItem[];

  constructor(user_id: string, data: DataItem[] = []) {
    this.user_id = user_id;
    this.data = data;
  }

  getData(): any {
    return {
      user_id: this.user_id,
      data: this.data
    };
  }
}
```

### Use Generic Type in Agent

```typescript
const agent = new Agent<WorkflowContext>({
  name: "Agent",
  instructions: (runContext: RunContext<WorkflowContext>, agent: Agent<WorkflowContext>) => {
    // TypeScript knows runContext.context is WorkflowContext
    const userData = runContext.context.getData();
    return `System prompt with ${JSON.stringify(userData)}`;
  },
  model: "gpt-5-mini"
});
```

## Tool Configuration

### Built-in Web Search Tool

```typescript
const web_search = webSearchTool({
  userLocation: {
    type: "approximate",
    country: undefined,
    region: undefined,
    city: undefined,
    timezone: "Europe/Bucharest"
  },
  searchContextSize: "low"  // "low" | "medium" | "high"
});

const agent = new Agent({
  tools: [web_search]
});
```

### MCP Tools

MCP tools are typically configured externally and made available to the SDK. Reference them by name in the system prompt:

```typescript
const agent = new Agent({
  instructions: `You have access to these tools:
  - mcp__postgres__query: Query the database
  - mcp__firecrawl__scrape: Scrape web content

Use them when needed.`,
  tools: [/* MCP tools are auto-injected */]
});
```

## Multi-Agent Patterns

### Pattern 1: Triage Router with Handoffs (Recommended)

```typescript
// Define specialist agents first
const specialist1 = new Agent({
  name: "Specialist1",
  instructions: "...",
  model: "gpt-5-mini"
});

const specialist2 = new Agent({
  name: "Specialist2",
  instructions: "...",
  model: "gpt-5-mini"
});

// Create router with handoffs
const router = new Agent({
  name: "Router",
  instructions: `Route requests immediately using transfer tools.
  - Type A requests → transfer_to_Specialist1
  - Type B requests → transfer_to_Specialist2`,
  model: "gpt-5-mini",
  handoffs: [specialist1, specialist2],  // Automatically creates transfer tools
  modelSettings: {
    toolChoice: "required"  // MUST call a transfer tool
  }
});
```

**How handoffs work:**
- Router agent gets auto-generated tools: `transfer_to_Specialist1`, `transfer_to_Specialist2`
- When router calls a transfer tool, that specialist takes over
- Conversation continues with the specialist

### Pattern 2: Sequential Agents

```typescript
const agent1 = new Agent({
  name: "Agent1",
  handoffs: [agent2]  // Can only transfer to agent2
});

const agent2 = new Agent({
  name: "Agent2",
  handoffs: [agent3]  // Can only transfer to agent3
});

const agent3 = new Agent({
  name: "Agent3",
  handoffs: []  // Terminal agent, no transfers
});
```

## Running Agents

### Basic Runner Pattern

```typescript
const runner = new Runner({
  traceMetadata: {
    __trace_source__: "app-name",
    session_id: sessionId,
    custom_field: "value"
  }
});

const result = await runner.run(
  startingAgent,           // Entry point agent
  userMessage,             // string or AgentInputItem[]
  {
    context: contextObject,       // Custom context
    conversationId: "conv_..."   // Optional: resume conversation
  }
);
```

### Accessing Results

```typescript
result.finalOutput         // Agent's final response (string)
result.lastAgent          // The agent that produced final output
result.lastAgent.name     // Name of final agent
result.newItems          // New conversation items
result.state             // Internal state
result.state.conversationId  // OpenAI conversation ID for persistence
```

### With Tracing

```typescript
import { withTrace } from "@openai/agents";

export const runWorkflow = async (input: WorkflowInput) => {
  return await withTrace("Workflow name", async () => {
    // ... agent execution code
    const result = await runner.run(agent, message, { context });
    return result;
  });
};
```

## Session Persistence Pattern

### SessionManager Class

```typescript
interface SessionData {
  session_id: string;
  conversation_id?: string;  // OpenAI conversation ID
  created_at: string;
  last_used: string;
}

class SessionManager {
  private dbPath: string;
  private sessions: Map<string, SessionData>;

  constructor(dbPath: string = './sessions.json') {
    this.dbPath = dbPath;
    this.sessions = new Map();
    this.load();
  }

  private load() {
    if (fs.existsSync(this.dbPath)) {
      const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf-8'));
      this.sessions = new Map(Object.entries(data));
    }
  }

  private save() {
    const data = Object.fromEntries(this.sessions);
    fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
  }

  getSession(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  setConversationId(sessionId: string, conversationId: string) {
    const session = this.getSession(sessionId) || {
      session_id: sessionId,
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString()
    };
    session.conversation_id = conversationId;
    session.last_used = new Date().toISOString();
    this.sessions.set(sessionId, session);
    this.save();
  }
}

const sessionManager = new SessionManager();
```

### Using Session Manager

```typescript
export const runWorkflow = async (input: WorkflowInput) => {
  const sessionId = input.session_id || "default";

  // Get existing session
  const session = sessionManager.getSession(sessionId);
  const conversationId = session?.conversation_id;

  // Run agent with conversation ID (if exists)
  const result = await runner.run(agent, input.message, {
    context: context,
    conversationId: conversationId  // Resume conversation
  });

  // Save new conversation ID
  const newConvId = result.state?.conversationId;
  if (newConvId) {
    sessionManager.setConversationId(sessionId, newConvId);
  }

  return result;
};
```

## Model Settings

### Reasoning Effort

```typescript
modelSettings: {
  reasoning: {
    effort: "low",      // "minimal" | "low" | "medium" | "high"
    summary: "auto"     // "auto" | "verbose" | "off"
  }
}
```

**Guidelines:**
- **minimal**: Simple routing, basic decisions
- **low**: Straightforward tasks
- **medium**: Default, most tasks
- **high**: Complex multi-step reasoning

### Tool Choice

```typescript
modelSettings: {
  toolChoice: "required"  // undefined | "required" | "auto"
}
```

**Use "required"** for:
- Router agents that MUST transfer
- Agents that should always use a specific tool

**Use undefined (default)** for:
- Agents that should decide when to use tools

### Store (Conversation Persistence)

```typescript
modelSettings: {
  store: true  // Enable conversation history storage
}
```

**Always use `store: true`** for production agents.

## Complete Workflow Example

```typescript
import { Agent, Runner, webSearchTool, withTrace, RunContext } from "@openai/agents";

// 1. Define context
interface WorkflowContext {
  user_id: string;
  preferences: any;
}

// 2. Configure tools
const webSearch = webSearchTool({ searchContextSize: "low" });

// 3. Create agents
function mentorInstructions(runContext: RunContext<WorkflowContext>): string {
  return `You are a mentor. User: ${runContext.context.user_id}`;
}

const mentor = new Agent<WorkflowContext>({
  name: "Mentor",
  instructions: mentorInstructions,
  model: "gpt-5-mini",
  tools: [webSearch],
  modelSettings: { store: true, reasoning: { effort: "medium", summary: "auto" } }
});

const router = new Agent<WorkflowContext>({
  name: "Router",
  instructions: "Route to mentor immediately",
  model: "gpt-5-mini",
  handoffs: [mentor],
  modelSettings: { store: true, toolChoice: "required" }
});

// 4. Session management
const sessionManager = new SessionManager();

// 5. Workflow function
export const runWorkflow = async (input: {
  message: string;
  session_id?: string;
  context_data: any;
}) => {
  return await withTrace("Workflow", async () => {
    const session = sessionManager.getSession(input.session_id);
    const context = input.context_data;

    const runner = new Runner({
      traceMetadata: { session_id: input.session_id }
    });

    const result = await runner.run(router, input.message, {
      context,
      conversationId: session?.conversation_id
    });

    const newConvId = result.state?.conversationId;
    if (newConvId) {
      sessionManager.setConversationId(input.session_id, newConvId);
    }

    return {
      output: String(result.finalOutput),
      agent_used: result.lastAgent?.name,
      conversation_id: newConvId
    };
  });
};
```

## Key Takeaways

1. **Use typed context** with `Agent<ContextType>` for type safety
2. **Dynamic instructions** allow context injection into prompts
3. **Handoffs pattern** is cleanest for multi-agent systems
4. **toolChoice: "required"** forces router agents to transfer
5. **store: true** enables conversation persistence
6. **Session Manager** maps custom session IDs to OpenAI conversation IDs
7. **reasoning.effort** should match task complexity
8. **withTrace** provides observability
