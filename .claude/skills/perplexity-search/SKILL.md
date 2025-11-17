---
name: perplexity-search
description: Use this skill when the user explicitly requests "Perplexity" search, mentions "use Perplexity", or asks to "research with Perplexity". Perplexity provides AI-powered web search with analysis, synthesis, and reasoning capabilities. Unlike raw search tools, Perplexity uses AI to analyze and interpret information from multiple sources with numbered citations. This skill ALWAYS runs in a separate general-purpose agent instance to preserve context in the main session.
---

# Perplexity Search - AI-Powered Research & Reasoning

## Overview

Perplexity is an AI-powered MCP server for web search, deep research, and complex reasoning using the Sonar API. Unlike direct search tools like Tavily, Perplexity uses AI to analyze, synthesize, and interpret information from multiple sources, making it ideal for:

- AI-analyzed answers with synthesis
- Comprehensive research reports
- Complex reasoning and problem-solving
- Multi-source information analysis
- Quick questions with context

**CRITICAL**: This skill MUST ALWAYS run in a separate general-purpose agent instance, never in the main chat session, to preserve context.

## Mandatory Agent-Based Execution Protocol

**REQUIRED WORKFLOW:**

```
Main Session:
├─ User requests: "Research X using Perplexity"
├─ Launch general-purpose agent with Task tool
│   Agent Context:
│   ├─ Execute Perplexity search/research operations
│   ├─ Let Perplexity AI analyze and synthesize
│   ├─ Extract relevant insights and citations
│   └─ Return: AI-analyzed summary with citations
├─ Receive processed analysis in main session
└─ Use insights for main task execution
```

**Why This Matters:**
- Perplexity responses are comprehensive and token-heavy
- AI analysis adds significant token cost
- Citations and sources add to context consumption
- Separate agents isolate research operations
- Only final insights return to main session

**Agent Prompt Template:**
```
Use Perplexity MCP to [search/research/analyze] [specific topic].
Tool selection: [perplexity_ask/research/reason/search]

Request:
- [Specific information or analysis needed]
- [Context or constraints]
- [Desired output format]

Return:
- AI-analyzed findings
- Key insights
- Numbered citations with URLs

Apply version-specific search protocol if researching technical documentation.
Follow error handling protocol (retry once on failure, fallback to native search).
```

## Core Perplexity Tools

### 1. perplexity_search - Direct Web Search (No AI Model)

**Purpose:** Direct web search using Perplexity Search API without AI analysis.

**Model:** None (raw search API)

**Best For:**
- Finding specific information quickly
- Getting raw search results with metadata
- When AI analysis is not needed

**Key Parameters:**
- `query` (required): Search query string
- `max_results`: Number of results (1-20, default: 10)
- `country`: ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB')
- `max_tokens_per_page`: Max tokens per webpage (default: 1024, max: 2048)

**Returns:** Ranked search results with titles, URLs, snippets, and metadata (no AI analysis).

**Example Usage:**
```json
{
  "query": "latest machine learning frameworks 2025",
  "max_results": 15,
  "country": "US",
  "max_tokens_per_page": 2048
}
```

### 2. perplexity_ask - General AI Conversation (sonar-pro)

**Purpose:** General-purpose conversational AI with real-time web search and analysis.

**Model:** `sonar-pro`

**Best For:**
- Quick queries with AI-analyzed answers
- Current events and general questions
- When you need synthesis, not just raw results
- Follow-up questions with conversation history

**Key Parameters:**
- `messages` (required): Array of conversation messages
  - Each message: `{"role": "user|assistant|system", "content": "text"}`

**Returns:** AI-generated response with numbered citations linking to sources.

**Optimization Tips:**
- Use specific, contextual queries
- Include time frames for recency ("2025", "latest", "recent")
- Provide conversation history for follow-ups
- Request specific output format in query

**Example Usage:**
```json
{
  "messages": [
    {"role": "user", "content": "What are the latest developments in quantum computing as of 2025?"}
  ]
}
```

**With Conversation History:**
```json
{
  "messages": [
    {"role": "user", "content": "What is React 19?"},
    {"role": "assistant", "content": "React 19 is..."},
    {"role": "user", "content": "What are its key features?"}
  ]
}
```

### 3. perplexity_research - Deep Comprehensive Research (sonar-deep-research)

**Purpose:** Deep, comprehensive research with detailed analysis and synthesis.

**Model:** `sonar-deep-research`

**Best For:**
- In-depth analysis and investigation
- Multi-source research reports
- Comprehensive topic exploration
- Detailed investigations requiring thoroughness

**Key Parameters:**
- `messages` (required): Array of conversation messages
  - Each message: `{"role": "user|assistant|system", "content": "text"}`

**Returns:** Detailed research report with comprehensive analysis and citations.

**Optimization Tips:**
- Frame queries as research questions
- Be specific about what depth of analysis is needed
- Request structured output (sections, bullet points, etc.)
- Include context about purpose and use case

**Example Usage:**
```json
{
  "messages": [
    {"role": "user", "content": "Provide a comprehensive analysis of sustainable energy adoption trends in 2024-2025, including policy impacts, technology developments, and market dynamics."}
  ]
}
```

**Performance Note:** Deep research takes longer (up to 5 minutes default timeout) but provides thorough, multi-source analysis.

### 4. perplexity_reason - Advanced Reasoning (sonar-reasoning-pro)

**Purpose:** Advanced reasoning and problem-solving with step-by-step logical analysis.

**Model:** `sonar-reasoning-pro`

**Best For:**
- Complex reasoning tasks
- Logical analysis and problem-solving
- Trade-off analysis and comparisons
- Decision support with multiple factors

**Key Parameters:**
- `messages` (required): Array of conversation messages
  - Each message: `{"role": "user|assistant|system", "content": "text"}`

**Returns:** Detailed reasoning with step-by-step logical analysis and citations.

**Optimization Tips:**
- Frame as reasoning problems or comparisons
- Include constraints and requirements
- Request structured reasoning (pros/cons, trade-offs, etc.)
- Provide context for decision-making

**Example Usage:**
```json
{
  "messages": [
    {"role": "user", "content": "Analyze the trade-offs between microservices and monolithic architecture for a growing startup with 10 engineers, considering scalability, maintenance, and deployment complexity."}
  ]
}
```

## Tool Selection Guide

**Choose the right tool for your task:**

| Tool | When to Use | Processing Time | Output Style |
|------|-------------|-----------------|--------------|
| **perplexity_search** | Need raw results without AI analysis | Fast | Raw search results |
| **perplexity_ask** | Quick question, need AI synthesis | Moderate | Conversational answer |
| **perplexity_research** | Deep analysis, comprehensive research | Slow (minutes) | Research report |
| **perplexity_reason** | Complex reasoning, trade-off analysis | Moderate | Logical analysis |

**Decision Tree:**
1. Need raw search results only? → Use `perplexity_search`
2. Quick question with AI answer? → Use `perplexity_ask`
3. Need comprehensive research? → Use `perplexity_research`
4. Need logical reasoning/analysis? → Use `perplexity_reason`

## Version-Specific Technical Searches

**CRITICAL for technical documentation searches:**

When researching library/framework documentation, ALWAYS include version information:

**If User Specifies Version:**
- Use EXACT version in query
- Example: `"How does React 18.2 handle server-side rendering?"`

**If User Does NOT Specify Version:**
- DEFAULT to LATEST version
- Include year or "latest" in query
- Example: `"What are the latest features in React 19 as of 2025?"`

**Good Version-Specific Queries:**
- ✅ `"Explain Next.js 14 app router data fetching patterns"`
- ✅ `"What's new in Python 3.12 asyncio compared to 3.11?"`
- ✅ `"Analyze TypeScript 5.3 type inference improvements"`

**Bad Non-Specific Queries:**
- ❌ `"Explain React hooks"` (which version?)
- ❌ `"How does Python asyncio work?"` (which version?)

**Verification:**
- Check that Perplexity's response mentions the correct version
- Verify citations link to version-specific documentation
- Flag any version ambiguity in the response

## Query Optimization Best Practices

### 1. Write Specific, Contextual Queries
- Use detailed queries with time frames and context
- Include relevant terminology
- Example:
  - ✅ Good: `"artificial intelligence medical diagnosis accuracy 2024"`
  - ❌ Bad: `"AI medical"`

### 2. Break Down Complex Topics
- For comprehensive research, break into focused sub-queries
- Make separate MCP calls for different aspects
- Example multi-aspect research:
  - Query 1: `"artificial intelligence medical diagnosis accuracy 2024"`
  - Query 2: `"machine learning healthcare applications FDA approval"`
  - Query 3: `"AI medical imaging radiology deployment hospitals"`

### 3. Leverage Conversation History
- Use `messages` array for follow-up queries
- Provide context from previous exchanges
- Build on previous answers for deeper exploration

### 4. Request Structured Output
- Ask for specific formats: bullet points, sections, comparisons
- Example: `"Compare X and Y in a structured format with pros/cons"`
- Example: `"Provide a summary with 3 main sections: technology, market, and policy"`

### 5. Set Appropriate Timeouts
- Default timeout: 5 minutes
- Deep research may take longer
- Plan agent execution time accordingly

## Working with Citations

**All chat-based Perplexity tools return numbered citations:**

**Citation Format:**
```
Response text with citation [1] and another citation [2].

Citations:
[1] https://example.com/source1
[2] https://example.com/source2
```

**Best Practices:**
1. Always include citations when returning results to main session
2. Use citations to verify information accuracy
3. Provide citation URLs for user reference
4. Check citation quality and source authority

**Processing Citations:**
- Extract citation URLs from response
- Include in final output if user requests references
- Use for fact-checking and verification
- Cross-reference multiple citations for accuracy

## Error Handling Protocol

**MANDATORY: Follow this protocol for all Perplexity requests**

**On First Failure:**
1. Request fails (rate limit, timeout, error)
2. Wait 3-5 seconds (rate limit cooldown)
3. Retry SAME tool with SAME parameters ONCE

**On Second Failure:**
1. Log failure clearly
2. Fall back to native Claude Code WebSearch tool
3. Complete the search/research request

**Rate Limits:**
- Perplexity: Rate limited by requests per minute (varies by tier)
- Always wait 3-5 seconds between retry attempts
- Extend to 10 seconds if rate limiting suspected

**Timeout Handling:**
- Default timeout: 5 minutes (especially for perplexity_research)
- If timeout occurs, try with simpler query or use perplexity_ask instead

## Multi-Tool Workflows

### Workflow 1: Quick Question → Deep Research
**Use Case:** Start with quick overview, then deep dive

```
1. perplexity_ask: "Quick overview of topic X"
2. Review insights
3. perplexity_research: "Comprehensive analysis of specific aspect Y"
```

### Workflow 2: Search → Reasoning
**Use Case:** Find information, then analyze

```
1. perplexity_search: Get raw data/information
2. perplexity_reason: "Analyze the trade-offs between options A and B"
```

### Workflow 3: Parallel Research
**Use Case:** Multi-aspect comprehensive research

```
Agent performs multiple perplexity_research calls in sequence:
- Research 1: Technical aspects
- Research 2: Market dynamics
- Research 3: Future trends
Then synthesizes all findings
```

## Common Use Cases

### Use Case 1: Technical Documentation Analysis
```
User: "Research Next.js 14 server components using Perplexity"

Agent Approach:
1. Tool: perplexity_ask
2. Query: "Explain Next.js 14 server components with practical examples and best practices as of 2025"
3. Process: AI analyzes multiple sources
4. Return: Synthesized explanation with code examples and citations
```

### Use Case 2: Comprehensive Market Research
```
User: "Do comprehensive research on AI adoption in healthcare with Perplexity"

Agent Approach:
1. Tool: perplexity_research
2. Query: "Comprehensive analysis of AI adoption in healthcare 2024-2025: technology developments, regulatory landscape, market trends, and future outlook"
3. Process: Deep multi-source research (takes minutes)
4. Return: Detailed research report with sections and citations
```

### Use Case 3: Architecture Decision
```
User: "Help me decide between PostgreSQL and MongoDB using Perplexity"

Agent Approach:
1. Tool: perplexity_reason
2. Query: "Analyze the trade-offs between PostgreSQL and MongoDB for a social media application with 1M users, considering scalability, query flexibility, and operational complexity"
3. Process: Logical reasoning with pros/cons analysis
4. Return: Structured comparison with recommendations and citations
```

### Use Case 4: Current Events
```
User: "What's happening with quantum computing using Perplexity?"

Agent Approach:
1. Tool: perplexity_ask
2. Query: "What are the latest developments in quantum computing as of 2025?"
3. Process: AI synthesis of recent information
4. Return: Current status summary with citations from recent sources
```

## References

For comprehensive documentation on Perplexity MCP, refer to:
- `references/perplexity_full_docs.md` - Complete tool documentation and optimization guide
- Official Docs: https://docs.perplexity.ai/
- GitHub: https://github.com/perplexityai/modelcontextprotocol
- DeepWiki: https://deepwiki.com/ppl-ai/modelcontextprotocol

## Quick Reference Card

**When to Use Perplexity:**
- ✅ Need AI-analyzed answers and synthesis
- ✅ Want comprehensive research reports
- ✅ Require complex reasoning and analysis
- ✅ Need multi-source information synthesis
- ✅ Want numbered citations with sources

**When NOT to Use Perplexity:**
- ❌ Need fast, raw search results (use Tavily)
- ❌ Need structured data extraction (use Firecrawl)
- ❌ Want direct content without AI interpretation (use Tavily)
- ❌ Need website scraping (use Firecrawl)

**Performance Tips:**
- Use specific, contextual queries with time frames
- Break complex topics into focused sub-queries
- Choose appropriate tool (ask/research/reason) for task
- Leverage conversation history for follow-ups
- Always include version in technical queries

**ALWAYS REMEMBER:**
- Run in separate general-purpose agent instance
- Include version in technical searches
- Follow error handling protocol (retry + fallback)
- Extract and include citations in output
- Return only synthesized insights to main session
