# Perplexity MCP - Complete Reference

## Official Links

- **GitHub:** https://github.com/perplexityai/modelcontextprotocol
- **Official Docs:** https://docs.perplexity.ai/
- **DeepWiki:** https://deepwiki.com/ppl-ai/modelcontextprotocol
- **Best Practices:** https://docs.perplexity.ai/guides/search-best-practices

## Tool & Model Reference

### perplexity_search

**Model:** None (raw search API)

```
Required:
- query: string

Optional:
- max_results: 1-20 (default: 10)
- country: ISO 3166-1 alpha-2 code (e.g., 'US', 'GB')
- max_tokens_per_page: 256-2048 (default: 1024)
```

**Returns:** Ranked search results with titles, URLs, snippets, metadata

### perplexity_ask

**Model:** `sonar-pro`

```
Required:
- messages: array of {role, content}
  - role: "user" | "assistant" | "system"
  - content: string
```

**Returns:** AI-generated response with numbered citations

### perplexity_research

**Model:** `sonar-deep-research`

```
Required:
- messages: array of {role, content}
  - role: "user" | "assistant" | "system"
  - content: string
```

**Returns:** Comprehensive research report with detailed analysis and citations

**Note:** Takes longer (up to 5 minutes) for thorough multi-source analysis

### perplexity_reason

**Model:** `sonar-reasoning-pro`

```
Required:
- messages: array of {role, content}
  - role: "user" | "assistant" | "system"
  - content: string
```

**Returns:** Detailed logical reasoning with step-by-step analysis and citations

## Response Format

All chat-based tools (ask, research, reason) return:

```
AI-generated response text with inline citations [1] and [2].

Citations:
[1] https://source1.com/article
[2] https://source2.com/article
```

## Rate Limits

- Rate limited by requests per minute (varies by API tier)
- No specific monthly limits published
- **Best practice:** Wait 3-5 seconds between requests
- Extend to 10 seconds if rate limiting suspected
- **Retry protocol:** On failure, wait 3-5 seconds and retry once

## Optimization Guidelines

### Query Construction

1. **Write Specific, Contextual Queries**
   - Include time frames ("2025", "latest", "recent")
   - Use detailed terminology
   - Example: ✅ "artificial intelligence medical diagnosis accuracy 2024"
   - Example: ❌ "AI medical"

2. **Break Down Complex Topics**
   - For comprehensive research, use multiple focused queries
   - Each query covers one specific aspect
   - Agent synthesizes all results

3. **Include Version Information**
   - ALWAYS specify version for technical searches
   - Default to latest if not specified
   - Example: "React 19 hooks documentation 2025"

### Tool Selection

**Decision Matrix:**

| Need | Tool | Processing Time |
|------|------|-----------------|
| Raw search results | perplexity_search | Fast |
| Quick AI answer | perplexity_ask | Moderate |
| Deep research | perplexity_research | Slow (minutes) |
| Logical analysis | perplexity_reason | Moderate |

### Conversation History

Use the `messages` array for context:

```json
{
  "messages": [
    {"role": "user", "content": "What is React 19?"},
    {"role": "assistant", "content": "React 19 is..."},
    {"role": "user", "content": "What are its new features?"}
  ]
}
```

Benefits:
- Maintains context across queries
- Enables follow-up questions
- Allows deeper exploration
- More targeted responses

### Output Formatting

Request specific formats in query:

- "Provide a summary with 3 main sections"
- "Compare X and Y in a table"
- "List pros and cons"
- "Analyze in bullet points"

## Common Patterns

### Pattern: Quick Technical Question

```
Tool: perplexity_ask

Query: "Explain [topic] [version] with practical examples and best practices as of 2025"

Processing: Moderate (1-2 minutes)
Output: Conversational answer with code examples and citations
```

### Pattern: Comprehensive Research

```
Tool: perplexity_research

Query: "Comprehensive analysis of [topic] 2024-2025: [aspect 1], [aspect 2], [aspect 3]"

Processing: Slow (3-5 minutes)
Output: Multi-section research report with detailed analysis
```

### Pattern: Architecture Decision

```
Tool: perplexity_reason

Query: "Analyze the trade-offs between [option A] and [option B] for [use case] considering [factors]"

Processing: Moderate (1-2 minutes)
Output: Structured logical analysis with pros/cons and recommendations
```

### Pattern: Multi-Aspect Research

```
Agent performs sequential queries:

1. perplexity_ask: "Quick overview of [topic]"
2. perplexity_research: "[Aspect 1] detailed analysis"
3. perplexity_research: "[Aspect 2] detailed analysis"
4. Synthesize all findings
```

## Citation Handling

### Extracting Citations

All AI responses include numbered citations:

```
Response: "React 19 introduces server components [1] and improved performance [2]."

[1] https://react.dev/blog/react-19
[2] https://vercel.com/blog/react-19-performance
```

### Best Practices

1. **Always Include Citations:** When returning to main session
2. **Verify Source Quality:** Check citation authority and recency
3. **Cross-Reference:** Use multiple citations for accuracy
4. **Format for User:** Present citations clearly with URLs

## Error Handling

### Common Errors

1. **Rate Limit Exceeded**
   - Wait 3-5 seconds
   - Retry once with same parameters
   - If fails again, fallback to native search

2. **Timeout (especially perplexity_research)**
   - Default timeout: 5 minutes
   - If timeout, use simpler query or perplexity_ask instead
   - Break complex query into smaller parts

3. **Empty/Poor Response**
   - Refine query with more specific terms
   - Try different tool (e.g., research → ask)
   - Add more context to query

### Fallback Strategy

```
1. First failure: Wait 3-5 seconds, retry
2. Second failure: Switch to native WebSearch
3. Always log failures clearly
```

## Performance Tips

### Speed Optimization

- Use `perplexity_ask` for quick questions
- Use `perplexity_search` for raw results only
- Avoid `perplexity_research` when quick answer suffices
- Set appropriate timeouts

### Quality Optimization

- Use `perplexity_research` for comprehensive analysis
- Use `perplexity_reason` for logical analysis
- Include specific requirements in query
- Request structured output format

### Token Efficiency

- Process results in agent before returning
- Return only synthesized insights to main session
- Extract and format citations separately
- Don't load full responses into main context

## Comparison with Other MCPs

**vs. Tavily:**
- Perplexity: AI analysis and synthesis
- Tavily: Raw search results, faster
- Use Perplexity when you need AI interpretation

**vs. Firecrawl:**
- Perplexity: Web search with AI analysis
- Firecrawl: Web scraping and structured extraction
- Use Perplexity for research, Firecrawl for content extraction
