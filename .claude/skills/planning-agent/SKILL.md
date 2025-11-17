---
name: planning-agent
description: This skill should be used when the user wants to design, build, and validate AI agents using OpenAI Agents SDK (TypeScript). The skill guides through interactive brainstorming of agent architecture, input/output design, validation dataset creation, GPT-5-optimized prompt engineering with MCP support, and generates production-ready TypeScript agent code with LLM-as-judge testing. Use this skill for creating single agents, multi-agent systems with routing patterns, or agents with Model Context Protocol (MCP) integrations.
---

# Planning Agent Builder

## Overview

Guide users through a comprehensive, interactive workflow to design, build, and validate AI agents using the OpenAI Agents SDK for TypeScript. This skill follows GPT-5 prompt engineering best practices and supports MCP integration, producing production-ready agent code with automated LLM-as-judge validation.

## When to Use This Skill

Trigger this skill when users request:
- "Create an agent that [does X]"
- "Build a multi-agent system for [purpose]"
- "Design an AI agent with [specific capabilities]"
- "Help me plan an agent architecture"
- "I want to create an agent that uses [MCP/database/tool]"

## Core Workflow: 7 Interactive Steps

This skill follows a structured, interactive workflow. Each step builds on the previous, and the user must approve before proceeding to code generation.

### Step 1: Idea Capture & Input/Output Design

**Objective:** Define what the agent does, what it receives, and what it produces.

**Process:**
1. Ask user to describe their idea in 2-3 sentences
2. Brainstorm input format:
   - Text-based (simple user queries)?
   - Structured JSON (complex data objects)?
   - Both formats?
3. Brainstorm output format:
   - Text responses?
   - Structured JSON objects?
   - Both formats?
4. Identify context sources:
   - User-specific data (preferences, history)?
   - Database queries (what tables/schema)?
   - External APIs?
   - Static knowledge?
5. **MCP Requirements Discussion:**
   - Does agent need web search? (built-in webSearchTool)
   - Does agent need external data sources? (MCPs)
   - If yes, list required MCPs and their purposes

**Deliverables:**
- TypeScript interface definitions for input, output, and context
- List of required MCPs (if any)
- High-level capability statement

**Example Questions:**
- "Will users ask questions in natural language, or provide structured data?"
- "Should the output be conversational text or structured data (JSON)?"
- "What information does the agent need to know about the user to respond correctly?"
- "Does this agent need to query a database or external API? Which one(s)?"

### Step 2: MCP Documentation Collection (If MCPs Needed)

**Objective:** Gather MCP documentation to understand tool capabilities and usage patterns.

**Process:**
1. For each required MCP, prompt user:
   - "Please provide documentation URL or file path for [MCP name]"
   - "What tools does this MCP provide? (e.g., mcp__postgres__query)"
   - "When should the agent use this MCP?"
2. Guide user to save MCP docs to: `agents/<agent-name>/mcp-docs/`
3. Read and analyze MCP tool definitions
4. Extract:
   - Tool names (e.g., `mcp__firecrawl__scrape`)
   - Tool input/output formats
   - Usage examples
   - Error handling patterns

**Deliverables:**
- MCP tool inventory with usage guidelines
- `mcp-config.json` structure (based on `assets/mcp-config-template.json`)

**Note:** If no MCPs needed, skip this step.

### Step 3: Agent Architecture Decision

**Objective:** Determine single vs. multi-agent architecture and routing patterns.

**Process:**
1. Analyze the idea and auto-suggest architecture:
   - **Single agent**: For focused, single-purpose tasks
   - **Multi-agent with triage**: For multiple distinct capabilities
   - **Sequential agents**: For pipeline processing
   - **Parallel agents**: For independent concurrent tasks

2. **For multi-agent systems**, auto-suggest routing pattern:
   - **Triage router** (like openai-sdk-agent template): User query → Router → Specialist
   - **Sequential handoffs**: Agent1 → Agent2 → Agent3
   - **Parallel execution**: Multiple agents process independently, results aggregated

3. Present suggested architecture with ASCII diagram
4. Get user confirmation or modifications
5. For each agent in the system:
   - Define agent name and specific role
   - Assign tools/MCPs to specific agents
   - Define handoff conditions (when to transfer)

**Deliverables:**
- Agent architecture diagram (ASCII art)
- Agent responsibility matrix (who does what)
- Tool/MCP assignment matrix (which agent uses which tools)

**Example Architecture Diagram:**
```
┌─────────────┐
│   Triage    │ (no tools, handoffs only)
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌──────┐ ┌──────┐
│Agent1│ │Agent2│
│Tools:│ │Tools:│
│-web  │ │-db   │
└──────┘ └──────┘
```

### Step 4: Validation Dataset Creation

**Objective:** Create 5-10 test examples with expected outputs for each agent.

**Process:**
1. For each agent, guide user to create examples covering:
   - **Happy paths**: Standard, expected usage
   - **Edge cases**: Unusual but valid inputs
   - **Scope violations**: Out-of-scope requests (agent should refuse)
   - **Context usage**: Examples requiring context data
   - **MCP tool usage**: Examples requiring tool calls (if applicable)
   - **Error handling**: What happens when tools fail?

2. Each example must include:
   ```json
   {
     "id": "unique_id",
     "description": "What this tests",
     "input": "text or JSON",
     "context": {"user_data": "..."},
     "expected_output": "text or JSON",
     "success_criteria": "Specific, measurable criteria",
     "tags": ["happy_path", "scope_test", etc.],
     "mcp_calls_expected": ["mcp__tool__name"]  // if tools needed
   }
   ```

3. Use `assets/validation-dataset-template.json` as starting point
4. Ensure coverage:
   - At least 2 happy path examples
   - At least 1 edge case
   - At least 1 scope violation test
   - At least 1 MCP tool usage test (if MCPs used)

**Deliverables:**
- `validation-dataset.json` for each agent
- Coverage analysis (what scenarios are tested)

**Important:** Examples use **mocked data** - no real database or API calls needed yet. These validate prompt behavior, not integrations.

### Step 5: System & User Prompt Engineering

**Objective:** Design GPT-5-optimized system prompts and user prompt templates for each agent.

**Reference:** Load `references/gpt5-prompting-guide.md` for best practices.

**Process:**
1. For each agent, brainstorm with user:
   - **Persona**: What role/personality should agent have?
     - Example: "Kai, a wise mentor" vs. "Alex, an enthusiastic coach"
   - **Scope boundaries**: What should agent refuse to do?
     - Example: "Only answer questions about habits, not general trivia"
   - **Processing steps**: How to transform input → output?
     - Number the steps clearly
   - **Reasoning effort**: minimal/low/medium/high?
     - Based on task complexity (routing = minimal, complex analysis = high)
   - **Verbosity**: low/medium/high?
     - Based on desired output length

2. **Suggest system prompt structure** following GPT-5 patterns:
   ```
   [Persona/Role Definition]
   → [Scope Definition with Examples]
   → [Processing Guidelines (numbered steps)]
   → [Tool Usage Instructions (if applicable)]
   → [Output Format Requirements]
   → [Constraints and Limitations]
   ```

3. **For agents with MCPs**, include tool usage section:
   ```
   **[Available Tools]**
   1. Tool Name (mcp__id__tool): Purpose
      - When to use: Conditions
      - Input format: Expected parameters
      - Output format: What it returns

   **[Decision Process]**
   1. Analyze request
   2. Determine if tool needed
   3. Select correct tool
   4. Process tool output
   5. Formulate response

   **[Error Handling]**
   - If tool fails: Acknowledge gracefully, provide best-effort response
   ```

4. **Draft prompts** using validation examples to inform guidelines
   - Prompts must be **general**, not specific to test examples
   - Use examples to identify patterns, not as literal instructions

5. Present draft prompts to user for review and refinement

**Deliverables:**
- Complete system prompt for each agent
- User prompt template showing context injection points
- Tool usage decision tree (if MCPs used)

**Key Principles (from GPT-5 guide):**
- Clarity over complexity (shorter, clearer prompts)
- Leverage steerability (explicit instructions)
- Number processing steps
- Define scope with examples of what to reject

### Step 6: Plan Review & Approval

**Objective:** Present comprehensive plan for user approval before code generation.

**Process:**
1. Compile complete plan document including:
   - **Architecture summary** with diagram
   - **For each agent:**
     - Full system prompt
     - User prompt template
     - Context interface (TypeScript)
     - Input/output schemas (TypeScript interfaces)
     - Validation dataset (5-10 examples)
     - Assigned tools/MCPs
     - Reasoning effort and verbosity settings
   - **MCP configuration** (if applicable)
   - **Testing approach:**
     - LLM-as-judge criteria
     - Success threshold (e.g., 80% pass rate, 3.5/5 avg score)
     - Judge model (GPT-5-mini or GPT-5)
   - **File structure:**
     - `agents/<agent-name>/<agent-name>.ts`
     - `agents/<agent-name>/test-<agent-name>.ts`
     - `agents/<agent-name>/validation-dataset.json`
     - `agents/<agent-name>/plan.md`
     - `agents/<agent-name>/README.md`
     - `agents/<agent-name>/mcp-config.json` (if MCPs)
     - `agents/<agent-name>/SETUP.md` (if MCPs)

2. Walk through plan with user
3. Request approval or changes
4. Iterate until user approves

**Deliverables:**
- Complete `plan.md` document (saved upon approval)

### Step 7: Implementation Plan Generation

**Objective:** Create a comprehensive, detailed implementation plan that the user can follow to build the agent.

**References:**
- `references/openai-sdk-patterns.md` - SDK usage patterns and implementation examples
- `references/web-integration-patterns.md` - Web deployment and API integration patterns (if building web app)
- `references/session-management-patterns.md` - Session persistence strategies (for conversational agents)

**Process:**

1. **Compile comprehensive implementation plan** including:

   **A. Directory Structure**
   ```bash
   agents/<agent-name>/
   ├── <agent-name>.ts          # Agent implementation
   ├── test-<agent-name>.ts     # Test script with LLM-as-judge
   ├── validation-dataset.json  # Validation examples
   ├── plan.md                  # This plan document
   ├── README.md                # Usage documentation
   ├── mcp-config.json          # MCP configuration (if applicable)
   ├── SETUP.md                 # Setup instructions
   └── mcp-docs/                # MCP documentation (if applicable)
   ```

   **B. Agent Implementation Guide**
   - Reference `assets/agent-template.ts` as the base structure
   - Document all placeholder replacements needed:
     - `{{CONTEXT_INTERFACE_NAME}}`: Specific interface name
     - `{{CONTEXT_CLASS_NAME}}`: Specific class name
     - `{{SYSTEM_PROMPT}}`: Full approved system prompt
     - `{{MODEL}}`: "gpt-5-mini" or "gpt-5"
     - `{{REASONING_EFFORT}}`: minimal/low/medium/high
     - `{{TOOLS_LIST}}`: Specific tools array
     - For multi-agent: All agent definitions and router configuration
   - Include complete system prompt text (approved in Step 5)
   - Include user prompt template with context injection points
   - List all required imports from `@openai/agents`
   - Document session management requirements

   **C. Test Script Implementation Guide**
   - Reference `assets/test-template.ts` as the base structure
   - Document placeholder replacements:
     - `{{AGENT_FILENAME}}`: Agent file name without extension
     - `{{JUDGE_MODEL}}`: GPT-5-mini or GPT-5
     - `{{PASS_THRESHOLD}}`: Success threshold (e.g., 3.5)
   - Reference `references/llm-as-judge-template.md` for evaluation logic
   - Include complete judge prompt template
   - Document test report structure

   **D. Validation Dataset**
   - Include all approved validation examples from Step 4
   - Document format based on `assets/validation-dataset-template.json`
   - Ensure examples cover all test scenarios

   **E. MCP Configuration (if applicable)**
   - Based on `assets/mcp-config-template.json`
   - Document all MCP servers needed
   - Include tool names and usage guidelines
   - Document environment variables required

   **F. Implementation Steps Checklist**
   ```markdown
   1. [ ] Create directory: `mkdir -p agents/<agent-name>/mcp-docs`
   2. [ ] Copy `assets/agent-template.ts` to `agents/<agent-name>/<agent-name>.ts`
   3. [ ] Replace all placeholders in agent file with approved values
   4. [ ] Copy `assets/test-template.ts` to `agents/<agent-name>/test-<agent-name>.ts`
   5. [ ] Replace all placeholders in test file with approved values
   6. [ ] Create `validation-dataset.json` with approved examples
   7. [ ] Create `README.md` with usage instructions
   8. [ ] Create `mcp-config.json` (if MCPs used)
   9. [ ] Create `SETUP.md` with installation instructions
   10. [ ] Install dependencies: `npm install @openai/agents openai`
   11. [ ] Set environment variables (OPENAI_API_KEY, etc.)
   12. [ ] Test agent: `npx ts-node agents/<agent-name>/test-<agent-name>.ts`
   13. [ ] Review test report and iterate on prompts if needed
   ```

2. **Document SDK patterns to follow:**
   - Use typed context with `Agent<ContextType>`
   - Dynamic instructions functions for context injection
   - Handoffs pattern for multi-agent systems
   - `toolChoice: "required"` for router agents
   - `store: true` for conversation persistence
   - Session manager maps session IDs to OpenAI conversation IDs
   - `withTrace` for observability
   - Reference specific sections in `references/openai-sdk-patterns.md`

3. **Include web integration guide (if building web app):**
   - Reference `references/web-integration-patterns.md` for:
     - RESTful API endpoint structure (Express.js examples)
     - React frontend integration patterns
     - Authentication and user context handling
     - Database integration with agent context
     - Error handling and edge cases
   - Reference `references/session-management-patterns.md` for:
     - Production session persistence strategies
     - Database storage options (SQLite, PostgreSQL, Redis)
     - Session mapping between web sessions and OpenAI conversation IDs
     - Deployment considerations

4. **Create the plan document** (`agents/<agent-name>/plan.md`) with:
   - Architecture diagram
   - Complete system prompts for all agents
   - User prompt templates
   - Context interfaces (TypeScript)
   - Input/output schemas (TypeScript)
   - Full validation dataset
   - MCP configuration details
   - Implementation checklist
   - Code templates with all placeholders filled in
   - Expected file structure
   - Testing procedures

**Deliverables:**
- **Comprehensive `plan.md`** saved to `agents/<agent-name>/plan.md`
- Plan includes everything needed to implement the agent
- No code is generated - only the detailed plan
- User can follow the plan step-by-step to build the agent themselves

## Resources

This skill includes comprehensive resources for building agents:

### references/

Reference documentation loaded as needed to inform the agent-building process:

- **`gpt5-prompting-guide.md`**: Comprehensive GPT-5 prompt engineering guide (575 lines)
  - Clarity over complexity principles
  - Systematic optimization workflow (evals → inspect → iterate → template)
  - Reasoning effort and verbosity control
  - Detailed troubleshooting patterns (7 common issues with solutions)
  - Latency and cost optimization strategies
  - Migration from GPT-4 checklist
  - Responses API benefits and migration resources
  - External resources (OpenAI cookbook, troubleshooting guides)

- **`openai-sdk-patterns.md`**: TypeScript SDK usage patterns from openai-sdk-agent template
  - Agent creation patterns
  - Context injection
  - Tool configuration
  - Multi-agent handoffs
  - Session persistence
  - Complete workflow examples

- **`web-integration-patterns.md`**: Production deployment and web integration guide (1,010 lines)
  - RESTful API integration patterns
  - Express.js backend setup
  - React frontend implementation
  - Session management in web apps
  - Authentication and user context
  - Database integration patterns
  - Error handling and edge cases
  - Complete deployment examples

- **`session-management-patterns.md`**: Persistent conversation memory strategies (360 lines)
  - JSON file storage (current implementation)
  - Database storage options (SQLite, PostgreSQL, MySQL)
  - Redis for high-traffic applications
  - Manual history management
  - Session mapping patterns
  - Comparison table and recommendations
  - Production-ready examples

- **`llm-as-judge-template.md`**: LLM-as-judge evaluation implementation guide
  - Judge prompt template
  - Evaluation criteria (accuracy, completeness, format, scope, context usage)
  - Test runner pattern
  - Scoring interpretation
  - Validation dataset format

### assets/

Templates used to generate agent code and configuration:

- **`agent-template.ts`**: Base TypeScript agent implementation template
  - Context class structure
  - Tool configuration
  - Agent definitions (single and multi-agent patterns)
  - Session management
  - Workflow execution

- **`test-template.ts`**: Test script with LLM-as-judge implementation
  - Validation dataset loader
  - Judge evaluation logic
  - Test runner with detailed reporting
  - Pass/fail determination

- **`validation-dataset-template.json`**: Example validation dataset structure
  - Shows format for happy paths, edge cases, scope tests
  - Includes text and JSON examples
  - MCP tool usage examples

- **`mcp-config-template.json`**: MCP server configuration template
  - MCP server definitions
  - Tool listings
  - Usage guidelines
  - Tool priority order

## Important Guidelines

### Always Create `agents/` Directory

**Mandatory:** All implementation plans MUST specify the `agents/<agent-name>/` directory structure.

The plan document should instruct the user to create:
```bash
# Create agents directory if it doesn't exist
mkdir -p agents

# Create specific agent directory
mkdir -p agents/<agent-name>/mcp-docs
```

This ensures consistent organization across all agent implementations.

### Follow GPT-5 Best Practices

From `references/gpt5-prompting-guide.md`:
- **Shorter is better**: Remove unnecessary scaffolding
- **Be explicit**: GPT-5 follows instructions closely
- **Number steps**: Clear, sequential processing guidelines
- **Define scope**: Explicit boundaries with examples
- **Match effort**: reasoning_effort to task complexity

### Use SDK Patterns Correctly

From `references/openai-sdk-patterns.md`:
- Use `Agent<ContextType>` for type safety
- Dynamic instructions functions for context injection
- `handoffs` array for multi-agent systems
- `toolChoice: "required"` for router agents that must transfer
- `store: true` for conversation persistence
- Session manager for mapping session IDs to conversation IDs

### Validation Dataset Quality

Good validation examples are:
- **Specific**: Clear input and expected output
- **Measurable**: Success criteria are objective
- **Diverse**: Cover happy paths, edge cases, scope violations
- **Realistic**: Achievable by a well-designed agent
- **Context-aware**: Use injected context data

### MCP Integration

When agents use MCPs:
1. Request MCP documentation from user
2. Save to `agents/<agent-name>/mcp-docs/`
3. Include tool usage guidelines in system prompt
4. Create `mcp-config.json` with configuration details
5. Generate `SETUP.md` with installation instructions
6. Add MCP tool usage examples to validation dataset

### LLM-as-Judge Evaluation

From `references/llm-as-judge-template.md`:
- Use GPT-5-mini or GPT-5 as judge
- Evaluate on 5-6 dimensions (accuracy, completeness, format, scope, context, tool usage)
- Pass threshold: typically >= 3.5/5 overall score
- Provide detailed reasoning for each score
- Generate improvement suggestions

## Example Usage Flow

**User:** "I want to create an agent that suggests meals based on user dietary preferences"

**Skill Response:**

**[Step 1: Idea Capture]**
"Let's design this meal suggestion agent together.

Questions:
1. Input format: Will users ask 'suggest lunch' or provide structured requests like {meal_type: 'lunch', cuisine: 'italian'}?
2. Context: What do you need to know about users? (dietary restrictions, allergies, preferences, pantry inventory?)
3. Output: Should the response be text description, structured recipe JSON, or both?
4. Data sources: Do you need to query a database for user preferences or recipes? Any external APIs?"

*[User provides answers]*

**[Step 2: Architecture]**
"Based on your requirements, I suggest:
- **Single agent** (focused task)
- Input: Text query + user preferences context
- Output: Structured JSON with meal suggestion + nutritional info
- No MCPs needed (using agent's knowledge)

Confirm or modify?"

*[User confirms]*

**[Step 3: Validation Dataset]**
"Let's create 5-10 test examples. Starting with happy path:

Example 1:
- Input: 'Suggest a high-protein lunch'
- Context: {dietary_restrictions: ['vegetarian'], allergies: ['nuts']}
- Expected output: Vegetarian, high-protein, nut-free meal with recipe
- Success criteria: Must be vegetarian, high protein (>20g), no nuts, include recipe steps

..."

*[Continue through all 7 steps]*

**[Final: Implementation Plan]**
"✅ Plan approved! Creating comprehensive implementation plan in `agents/meal-suggester/plan.md`..."

*[Generates detailed plan document]*

"🎉 Implementation plan created at `agents/meal-suggester/plan.md`!

The plan includes:
- Complete architecture diagram
- Full system prompts and user prompt templates
- TypeScript interfaces for context, input, output
- All 7 validation examples
- Step-by-step implementation checklist
- Code template references with all placeholders filled in
- Testing procedures with LLM-as-judge

Next steps:
1. Review the plan in `agents/meal-suggester/plan.md`
2. Follow the implementation checklist to build the agent
3. Run tests and iterate based on LLM-as-judge feedback

The plan has everything you need to implement this agent!"

## Key Success Criteria

- Implementation plan is comprehensive and actionable
- Plan includes complete system prompts using GPT-5 best practices
- Validation datasets have good coverage (happy, edge, scope tests)
- Plan documents all SDK patterns needed from template
- Implementation checklist is step-by-step and clear
- MCP integration fully documented (if applicable)
- Plan captures all design decisions and rationale
- User can follow the plan to successfully implement the agent

## Workflow Summary

1. **Idea Capture** → Define input/output/context/MCPs
2. **MCP Docs** → Gather tool documentation (if needed)
3. **Architecture** → Single vs. multi-agent, routing pattern
4. **Validation** → Create 5-10 test examples per agent
5. **Prompts** → Engineer GPT-5-optimized system prompts
6. **Plan Review** → User approves complete plan
7. **Plan Generation** → Create comprehensive implementation plan document

**Output:** A detailed `plan.md` file that the user can follow to implement the agent themselves.

Each step builds on the previous, ensuring a well-designed, validated implementation plan for a production-ready agent.
