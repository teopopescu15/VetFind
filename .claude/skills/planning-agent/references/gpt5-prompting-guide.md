# GPT-5 Prompt Engineering Fundamentals

Based on the official GPT-5 practical guide and prompting documentation.

## Core Principles

### 1. Clarity Over Complexity
- Keep instructions shorter and clearer than with previous models
- Remove unnecessary scaffolding
- GPT-5 responds better to concise, direct instructions
- **Less is more**: GPT-5 requires less scaffolding than older models

### 2. Leverage Steerability
- GPT-5 is "eager to follow instructions"
- Be explicit about desired behavior
- The model will closely follow what you specify
- Most issues resolve through careful prompt tuning

### 3. Systematic Optimization Workflow

**Always follow this order:**
1. **Start with Evals** - Run existing prompts against evaluation sets to establish baseline
2. **Inspect Model Reasoning** - For failure cases, stream reasoning summaries
3. **Iterate Systematically** - Change ONE variable at a time (hill-climbing approach)
4. **Metaprompt and Simplify** - Use GPT-5 to improve its own prompts
5. **Template and Document** - Lock reliable prompts into reusable templates

### 4. Use Responses API (Critical for GPT-5)

**Why It Matters:**
- Only the Responses API allows GPT-5 to persist chains of thought across turns
- Provides access to complete internal context
- Improves caching to lower costs
- Required for future-proofing and accessing new reasoning capabilities

**Key Benefits:**
1. **Velocity**: Build and iterate faster with persistent reasoning chains
2. **Scale Without Drag**: Caching improvements reduce costs as you scale
3. **Future-Proofing**: Access new reasoning capabilities as they're released

**Migration Resources:**
- [Responses API Guide](https://platform.openai.com/docs/guides/responses-api) - Complete migration documentation
- [Reasoning Models Guide](https://platform.openai.com/docs/guides/reasoning) - GPT-5 reasoning capabilities
- [Migration Guide](https://platform.openai.com/docs/guides/migration) - Step-by-step migration from Chat Completions
- [Codex CLI Toolkit](https://github.com/openai/codex-cli) - Automated migration assistance
- [Build Hour Demo](https://www.youtube.com/watch?v=BUILD_HOUR_DEMO) - Live walkthrough of building with GPT-5

## System Prompt Structure

### Recommended Pattern
```
[Persona/Role Definition]
→ [Scope Definition and Boundaries]
→ [Processing Guidelines (step-by-step)]
→ [Output Format Requirements]
→ [Constraints and Limitations]
→ [Tool Usage Guidelines (if applicable)]
```

### Key Elements

**1. Persona/Role**
- Define clear role and personality
- Set tone expectations
- Example: "You are Kai, a wise and empathetic mentor dedicated to self-improvement"

**2. Scope Definition**
- Explicitly state what the agent should and should NOT do
- Provide examples of out-of-scope requests
- Example: "If the user's question is unrelated to habits, respond with: 'My purpose is to help you build better habits. Can we refocus on your goals?'"

**3. Processing Guidelines**
- Break down the thinking process step-by-step
- Number the steps for clarity
- Example:
  ```
  1. Analyze the user's question
  2. Check the habit context for relevant data
  3. Formulate response based on successes and challenges
  4. Provide actionable next step
  ```

**4. Output Format**
- Specify exact format expected
- Use examples when helpful
- Example: "Always structure responses as: [Acknowledgment] → [Analysis] → [Action]"

**5. Constraints**
- Hard boundaries on behavior
- Example: "Never make up data. If context is missing, ask for clarification."

## Reasoning Effort Control

Use `reasoning_effort` parameter to match task complexity:
- **minimal**: For simple tasks (e.g., basic routing)
- **low**: For straightforward tasks
- **medium**: Default setting (most tasks)
- **high**: For complex, multi-step reasoning tasks

**Note**: Reasoning effort also affects how readily the model calls tools.

## Verbosity Control

Use `verbosity` parameter to control output length:
- **low**: Concise outputs
- **medium**: Balanced outputs
- **high**: Detailed outputs

Can be overridden with prompt instructions when needed.

## Tool Usage Guidelines

### When to Include Tool Instructions

Include clear tool usage guidelines in the system prompt when:
1. Agent has access to multiple tools
2. Tool choice requires domain knowledge
3. Tool usage has cost/latency implications

### Tool Instruction Pattern

```
**[Available Tools]**
1. Tool Name: Purpose
   - When to use: Specific conditions
   - Input format: What the tool expects
   - Output format: What the tool returns

**[Decision Process]**
1. Analyze request
2. Determine if tool is needed
3. Select appropriate tool based on conditions
4. Call tool with correct parameters
5. Process tool output
6. Formulate response

**[Error Handling]**
- If tool fails: [What to do]
- If tool returns empty: [What to do]
```

## Common Pitfalls and Resolutions

### Quick Reference Table

| Issue | Symptoms | Root Cause | Resolution |
|-------|----------|------------|------------|
| **Overthinking** | Model reasons too deeply for simple tasks, unnecessary complexity | reasoning_effort too high | Reduce reasoning_effort to "minimal" or "low" |
| **Underthinking** | Insufficient reasoning for complex tasks, misses nuances | reasoning_effort too low | Increase reasoning_effort to "medium" or "high" |
| **Over-deference** | Too cautious, hedges responses, asks unnecessary confirmations | Default model behavior | Add explicit instructions: "Be direct and decisive" |
| **Overly Verbose** | Too much detail, long-winded responses | verbosity too high or unclear prompt | Reduce verbosity to "low" or add: "Be concise" |
| **High Latency** | Slow responses | reasoning_effort too high, unnecessary tool calls | Lower reasoning_effort, optimize tool usage |
| **Tool Overuse** | Calls tools unnecessarily, slows down responses | reasoning_effort encourages tool exploration | Adjust reasoning_effort, add: "Only use tools when absolutely necessary" |
| **Malformed Tool Calls** | Incorrect parameters, missing required fields | Unclear tool descriptions | Add detailed tool examples in system prompt |

### Detailed Troubleshooting Patterns

#### 1. Overthinking (Model Overcomplicates Simple Tasks)

**Example Symptoms:**
- Triage agent takes too long to route simple requests
- Simple data lookups trigger extensive reasoning chains
- Model provides unnecessary explanations for straightforward tasks

**Solutions:**
```typescript
// Before
const agent = new Agent({
  modelSettings: { reasoning: { effort: "medium" } }
});

// After
const agent = new Agent({
  modelSettings: { reasoning: { effort: "minimal" } }  // For simple routing
});
```

**Prompt Adjustments:**
- Add: "Make quick decisions without extensive analysis"
- Add: "Route immediately based on keywords"

#### 2. Underthinking (Insufficient Reasoning for Complex Tasks)

**Example Symptoms:**
- Agent misses important context clues
- Superficial analysis of complex user requests
- Skips necessary validation steps

**Solutions:**
```typescript
// Increase reasoning effort for complex agents
const complexAgent = new Agent({
  modelSettings: { reasoning: { effort: "high" } }
});
```

**Prompt Adjustments:**
- Add numbered reasoning steps in system prompt
- Add: "Think through each step carefully before responding"

#### 3. Over-Deference (Too Cautious)

**Example Symptoms:**
- "I'm not sure...", "It might be...", "Perhaps..."
- Asks for confirmation on straightforward requests
- Hedges responses unnecessarily

**Solutions:**
- Add to system prompt: "Be direct and confident in your responses"
- Add: "Only ask for clarification when truly ambiguous"
- Remove phrases like "if that's okay" from prompt examples

#### 4. Overly Verbose Outputs

**Example Symptoms:**
- Long-winded explanations when user wants brief answers
- Excessive detail in tool call justifications
- Repeats instructions back to user

**Solutions:**
```typescript
// Reduce verbosity
const agent = new Agent({
  modelSettings: {
    reasoning: {
      effort: "medium",
      summary: "auto"  // Summarizes reasoning instead of full output
    },
    verbosity: "low"  // Concise outputs
  }
});
```

**Prompt Adjustments:**
- Add: "Be concise. Provide only essential information."
- Add: "Avoid repeating the user's question back to them"

#### 5. High Latency Issues

**Example Symptoms:**
- Responses take >5 seconds for simple tasks
- User experience feels sluggish
- Unnecessary delays in multi-agent workflows

**Root Causes & Solutions:**

**Cause 1: reasoning_effort too high**
```typescript
// Solution: Match effort to task complexity
const triageAgent = new Agent({
  modelSettings: { reasoning: { effort: "minimal" } }  // Fast routing
});

const complexAgent = new Agent({
  modelSettings: { reasoning: { effort: "high" } }  // Deep analysis when needed
});
```

**Cause 2: Unnecessary tool calls**
```typescript
// Add to system prompt
const instructions = `
Only use tools when absolutely necessary.
For general knowledge questions, use your training data.
Only call database tools when user asks for THEIR specific data.
`;
```

**Cause 3: Verbose reasoning outputs**
```typescript
modelSettings: {
  reasoning: {
    effort: "medium",
    summary: "auto"  // Returns summary instead of full reasoning
  }
}
```

#### 6. Tool Overuse

**Example Symptoms:**
- Agent calls web search for information it already knows
- Database queries for data already in context
- Multiple redundant tool calls

**Solutions:**
```typescript
// Reduce reasoning effort for tool-heavy agents
const agent = new Agent({
  modelSettings: { reasoning: { effort: "low" } }
});
```

**Prompt Adjustments:**
```
**Tool Usage Guidelines:**
1. ONLY use tools when user's request explicitly requires external data
2. Use your training data for general knowledge
3. Examples of when NOT to use tools:
   - User asks general fitness advice (use training data)
   - User asks about common exercises (use training data)
4. Examples of when TO use tools:
   - User asks "what's MY workout history" (database tool)
   - User provides a URL to analyze (web scraping tool)
```

#### 7. Malformed Tool Calls

**Example Symptoms:**
- Tool calls with missing required parameters
- Incorrect parameter types
- Tool errors due to malformed inputs

**Solutions:**
- Add detailed tool examples in system prompt
- Show exact parameter formats

**Example Tool Documentation:**
```
**Available Tool: database_query**

Purpose: Fetch user-specific data from database

When to use:
- User asks about THEIR workout history
- User asks about THEIR habit progress

Input format:
{
  "query": "SELECT * FROM workouts WHERE user_id = $1",
  "params": ["user_123"]
}

Output format:
{
  "rows": [...],
  "count": 10
}

Example usage:
- User: "Show me my last 5 workouts"
- Tool call: { "query": "SELECT * FROM workouts WHERE user_id = $1 ORDER BY date DESC LIMIT 5", "params": ["{user_id}"] }
```

### External Resources

For comprehensive troubleshooting guidance, see:
- **[GPT-5 Troubleshooting Cookbook](https://cookbook.openai.com/examples/gpt-5-troubleshooting)** - Common issues and solutions
- **[Optimize Prompts Guide](https://cookbook.openai.com/examples/optimize_prompts)** - Systematic optimization techniques
- **[Reasoning Models Guide](https://platform.openai.com/docs/guides/reasoning)** - Understanding reasoning effort and verbosity

## Metaprompting Pattern

GPT-5 excels at improving its own prompts. Use this pattern:

```
Given this task: [describe task]
And these failure cases: [examples]
Improve this system prompt: [current prompt]

Requirements:
- Make it shorter and clearer
- Remove unnecessary scaffolding
- Add specific guidelines to prevent failures
- Maintain all critical constraints
```

## Best Practices Summary

✅ **Do:**
- Start with evals to establish baseline
- Keep prompts short and clear
- Use numbered steps for complex processes
- Define scope boundaries explicitly
- Leverage steerability with direct instructions
- Use metaprompting to refine
- Match reasoning_effort to task complexity
- Template successful prompts

❌ **Don't:**
- Over-scaffold (less is more)
- Make multiple simultaneous changes when iterating
- Use vague instructions
- Skip evaluation before iterating
- Assume GPT-4 patterns will work the same way

## Optimization Techniques

### Latency Optimization

**Goal:** Reduce response time without sacrificing quality

**Strategies:**

1. **Match reasoning_effort to Task Complexity**
   ```typescript
   // Triage agents: Use minimal effort for fast routing
   const triageAgent = new Agent({
     modelSettings: { reasoning: { effort: "minimal" } }
   });

   // Complex agents: Use higher effort only when needed
   const analyticsAgent = new Agent({
     modelSettings: { reasoning: { effort: "high" } }
   });
   ```

2. **Use Reasoning Summaries**
   ```typescript
   // Instead of full reasoning output, get summaries
   modelSettings: {
     reasoning: {
       effort: "medium",
       summary: "auto"  // Faster than full reasoning output
     }
   }
   ```

3. **Optimize Tool Usage**
   - Add clear guidelines on when NOT to use tools
   - Reduce reasoning_effort for tool-heavy agents (prevents over-exploration)
   - Example prompt addition: "Only use tools when user explicitly requests external data"

4. **Reduce Verbosity**
   ```typescript
   modelSettings: {
     verbosity: "low"  // Faster generation of shorter outputs
   }
   ```

5. **Parallel Tool Calls**
   - If multiple tools can run independently, structure prompts to enable parallel execution
   - OpenAI SDK automatically parallelizes when possible

**Latency Benchmarks:**
- Minimal effort: ~1-2s for simple routing
- Low effort: ~2-4s for straightforward tasks
- Medium effort: ~3-6s for standard tasks
- High effort: ~5-10s+ for complex reasoning

### Cost Optimization

**Goal:** Reduce API costs while maintaining quality

**Strategies:**

1. **Use Responses API for Caching Benefits**
   - Responses API provides improved caching compared to Chat Completions
   - Persistent reasoning chains reduce redundant computation
   - Can reduce costs by 30-50% for conversational agents

2. **Right-Size reasoning_effort**
   ```typescript
   // Don't use "high" effort when "medium" suffices
   // Each reasoning level increase adds cost

   // Example: Triage routing
   const triageAgent = new Agent({
     modelSettings: { reasoning: { effort: "minimal" } }  // Lowest cost
   });
   ```

3. **Optimize Tool Calls**
   - Each tool call adds latency AND cost
   - Add prompt instructions to prevent unnecessary tool usage
   - Example: "Use your training data for general knowledge. Only call database tools for user-specific data."

4. **Use gpt-5-mini for Simpler Tasks**
   ```typescript
   // For triage, simple routing, basic Q&A
   const simpleAgent = new Agent({
     model: "gpt-5-mini",  // Lower cost than gpt-5
     modelSettings: { reasoning: { effort: "minimal" } }
   });

   // Reserve gpt-5 for complex reasoning
   const complexAgent = new Agent({
     model: "gpt-5",
     modelSettings: { reasoning: { effort: "high" } }
   });
   ```

5. **Reduce Output Length**
   ```typescript
   modelSettings: {
     verbosity: "low"  // Shorter outputs = lower cost
   }
   ```

6. **Batch Similar Requests**
   - If processing multiple similar requests, batch them when possible
   - Reduces per-request overhead

**Cost Comparison (Approximate):**
- gpt-5-mini (minimal effort): 1x baseline cost
- gpt-5-mini (medium effort): 2-3x baseline cost
- gpt-5 (minimal effort): 4-5x baseline cost
- gpt-5 (high effort): 8-12x baseline cost

**Cost Optimization Checklist:**
- ✅ Using Responses API for persistent conversations
- ✅ Right-sized reasoning_effort for each agent
- ✅ Using gpt-5-mini for simple tasks
- ✅ Minimized unnecessary tool calls
- ✅ Reduced verbosity for straightforward responses
- ✅ Implemented caching strategy

## Migration from GPT-4

### Migration Checklist

When migrating from GPT-4 to GPT-5:

**Step 1: Prepare**
- ✅ Read [Migration Guide](https://platform.openai.com/docs/guides/migration)
- ✅ Review [Responses API Guide](https://platform.openai.com/docs/guides/responses-api)
- ✅ Backup current prompts and evaluation results

**Step 2: Update API**
- ✅ Migrate from Chat Completions API to Responses API
- ✅ Update model parameter: `gpt-4-turbo` → `gpt-5` or `gpt-5-mini`
- ✅ Add reasoning and verbosity settings:
  ```typescript
  modelSettings: {
    reasoning: { effort: "medium", summary: "auto" },
    verbosity: "medium"
  }
  ```

**Step 3: Simplify Prompts**
- ✅ Remove excessive scaffolding (GPT-5 needs less structure than GPT-4)
- ✅ Shorten system prompts (keep only essential instructions)
- ✅ Remove redundant examples (GPT-5 requires fewer examples)
- ✅ Simplify step-by-step instructions (GPT-5 infers steps better)

**Step 4: Establish Baseline**
- ✅ Re-run all evaluation tests with GPT-5
- ✅ Document performance differences (accuracy, latency, cost)
- ✅ Identify regression cases (areas where GPT-5 underperforms GPT-4)

**Step 5: Optimize**
- ✅ Adjust reasoning_effort based on task complexity
- ✅ Test different verbosity settings
- ✅ Review tool usage patterns (may differ from GPT-4)
- ✅ Optimize for latency and cost using strategies above

**Step 6: Iterate**
- ✅ Use metaprompting to refine prompts
- ✅ Fix regression cases with targeted prompt improvements
- ✅ Document what changed and why
- ✅ Lock successful prompts into templates

**Step 7: Deploy**
- ✅ Gradual rollout (A/B test GPT-4 vs GPT-5)
- ✅ Monitor performance metrics
- ✅ Gather user feedback
- ✅ Iterate based on production data

### Common Migration Issues

**Issue:** Responses are too verbose compared to GPT-4
- **Solution:** Add `verbosity: "low"` to modelSettings or add "Be concise" to system prompt

**Issue:** Agent overthinks simple tasks
- **Solution:** Reduce reasoning_effort to "minimal" or "low"

**Issue:** Higher costs than GPT-4
- **Solution:** Right-size reasoning_effort, use gpt-5-mini for simple tasks, optimize tool usage

**Issue:** Different tool usage patterns
- **Solution:** Review tool descriptions, add clearer guidelines on when to use tools

**Issue:** Caching not working as expected
- **Solution:** Ensure using Responses API (not Chat Completions), verify conversationId is being reused
