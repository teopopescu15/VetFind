import { Agent, Runner, webSearchTool, withTrace, RunContext } from "@openai/agents";
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONTEXT - Define your custom context interface
// ============================================================================
export interface {{CONTEXT_INTERFACE_NAME}} {
  user_id: string;
  // TODO: Add context fields based on your requirements
  // Example: preferences: any;
  // Example: history: any[];
}

export class {{CONTEXT_CLASS_NAME}} {
  user_id: string;
  // TODO: Add context properties

  constructor(user_id: string = "default_user", data?: any) {
    this.user_id = user_id;
    // TODO: Initialize context from data parameter
  }

  getContextSummary(): string {
    // TODO: Return formatted context for injection into prompts
    return JSON.stringify({
      user_id: this.user_id
      // Add other fields
    }, null, 2);
  }
}

// ============================================================================
// TOOLS - Configure built-in and MCP tools
// ============================================================================

{{#if USE_WEB_SEARCH}}
const web_search = webSearchTool({
  userLocation: {
    type: "approximate",
    country: undefined,
    region: undefined,
    city: undefined,
    timezone: "{{TIMEZONE}}"
  },
  searchContextSize: "{{SEARCH_CONTEXT_SIZE}}"  // "low" | "medium" | "high"
});
{{/if}}

// TODO: MCP tools are configured externally
// Reference them in agent instructions by name (e.g., mcp__postgres__query)

// ============================================================================
// AGENT(S) - Define your agent(s) with system prompts
// ============================================================================

{{#if SINGLE_AGENT}}
// Single Agent Implementation
function {{AGENT_NAME}}Instructions(
  runContext: RunContext<{{CONTEXT_CLASS_NAME}}>,
  agent: Agent<{{CONTEXT_CLASS_NAME}}>
): string {
  const context = runContext.context.getContextSummary();

  return `{{SYSTEM_PROMPT}}

**[Current Context]**
\`\`\`json
${context}
\`\`\`

{{USER_PROMPT_GUIDELINES}}
`;
}

const {{AGENT_NAME}} = new Agent<{{CONTEXT_CLASS_NAME}}>({
  name: "{{AGENT_NAME}}",
  instructions: {{AGENT_NAME}}Instructions,
  model: "{{MODEL}}",  // "gpt-5-mini" or "gpt-5"
  tools: [{{TOOLS_LIST}}],  // e.g., [web_search]
  modelSettings: {
    store: true,
    reasoning: {
      effort: "{{REASONING_EFFORT}}",  // "minimal" | "low" | "medium" | "high"
      summary: "auto"
    }
  }
});
{{/if}}

{{#if MULTI_AGENT}}
// Multi-Agent Implementation

// Specialist Agent 1
function {{AGENT_1_NAME}}Instructions(
  runContext: RunContext<{{CONTEXT_CLASS_NAME}}>,
  agent: Agent<{{CONTEXT_CLASS_NAME}}>
): string {
  const context = runContext.context.getContextSummary();
  return `{{AGENT_1_SYSTEM_PROMPT}}

**[Current Context]**
\`\`\`json
${context}
\`\`\`
`;
}

const {{AGENT_1_NAME}} = new Agent<{{CONTEXT_CLASS_NAME}}>({
  name: "{{AGENT_1_NAME}}",
  instructions: {{AGENT_1_NAME}}Instructions,
  model: "{{MODEL}}",
  tools: [{{AGENT_1_TOOLS}}],
  modelSettings: {
    store: true,
    reasoning: { effort: "{{AGENT_1_REASONING_EFFORT}}", summary: "auto" }
  }
});

// Specialist Agent 2
function {{AGENT_2_NAME}}Instructions(
  runContext: RunContext<{{CONTEXT_CLASS_NAME}}>,
  agent: Agent<{{CONTEXT_CLASS_NAME}}>
): string {
  const context = runContext.context.getContextSummary();
  return `{{AGENT_2_SYSTEM_PROMPT}}

**[Current Context]**
\`\`\`json
${context}
\`\`\`
`;
}

const {{AGENT_2_NAME}} = new Agent<{{CONTEXT_CLASS_NAME}}>({
  name: "{{AGENT_2_NAME}}",
  instructions: {{AGENT_2_NAME}}Instructions,
  model: "{{MODEL}}",
  tools: [{{AGENT_2_TOOLS}}],
  modelSettings: {
    store: true,
    reasoning: { effort: "{{AGENT_2_REASONING_EFFORT}}", summary: "auto" }
  }
});

// Triage/Router Agent
const {{ROUTER_NAME}} = new Agent<{{CONTEXT_CLASS_NAME}}>({
  name: "{{ROUTER_NAME}}",
  instructions: `{{ROUTER_SYSTEM_PROMPT}}

**Critical: Do NOT respond with text. IMMEDIATELY call a transfer tool.**

**Decision rules:**
{{ROUTER_DECISION_RULES}}

**You must use a transfer tool on your FIRST turn. Never respond with text.**
`,
  model: "{{MODEL}}",
  handoffs: [{{HANDOFF_AGENTS}}],  // e.g., [agent1, agent2]
  modelSettings: {
    store: true,
    toolChoice: "required",  // FORCE tool use
    reasoning: { effort: "minimal", summary: "auto" }
  }
});
{{/if}}

// ============================================================================
// SESSION PERSISTENCE - Simple Database Helper
// ============================================================================
interface SessionData {
  session_id: string;
  conversation_id?: string;
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
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf-8'));
        this.sessions = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load sessions:', error);
    }
  }

  private save() {
    try {
      const data = Object.fromEntries(this.sessions);
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save sessions:', error);
    }
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

export { SessionManager, sessionManager };

// ============================================================================
// INPUT SCHEMA
// ============================================================================
export interface WorkflowInput {
  input_as_text: string;
  context_data?: any;
  session_id?: string;
}

// ============================================================================
// MAIN WORKFLOW
// ============================================================================
export const runWorkflow = async (workflowInput: WorkflowInput) => {
  return await withTrace("{{WORKFLOW_NAME}}", async () => {
    const sessionId = workflowInput.session_id || "default_session";

    // Create context
    const context = new {{CONTEXT_CLASS_NAME}}(
      sessionId,
      workflowInput.context_data
    );
    console.log(`📋 [WORKFLOW] Created context for session: ${sessionId}`);

    // Check for existing session
    const session = sessionManager.getSession(sessionId);
    const conversationId = session?.conversation_id;

    if (conversationId) {
      console.log(`💾 [WORKFLOW] Resuming session: ${sessionId} (conversation: ${conversationId})`);
    } else {
      console.log(`💾 [WORKFLOW] Starting new session: ${sessionId}`);
    }

    // Run the agent
    console.log(`🚀 [WORKFLOW] Starting {{ENTRY_AGENT_NAME}}...`);
    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "{{WORKFLOW_NAME}}",
        session_id: sessionId
      }
    });

    const runOptions: any = {
      context: context
    };

    if (conversationId) {
      runOptions.conversationId = conversationId;
    }

    const result = await runner.run(
      {{ENTRY_AGENT_NAME}},
      workflowInput.input_as_text,
      runOptions
    );

    // Get final agent name
    const finalAgentName = result.lastAgent ? result.lastAgent.name : "{{ENTRY_AGENT_NAME}}";

    // Save conversation ID
    const newConversationId = (result as any).state?.conversationId || conversationId;
    if (newConversationId && newConversationId !== conversationId) {
      console.log(`💾 [WORKFLOW] Saving conversation ID: ${newConversationId}`);
      sessionManager.setConversationId(sessionId, newConversationId);
    }

    console.log(`✅ [WORKFLOW] Completed! Final agent: ${finalAgentName}`);

    return {
      output_text: String(result.finalOutput || ""),
      agent_used: finalAgentName,
      session_id: sessionId,
      conversation_id: newConversationId
    };
  });
};
