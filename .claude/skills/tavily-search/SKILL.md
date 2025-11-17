---
name: tavily-search
description: Use this skill when the user explicitly requests "Tavily" web search, mentions "use Tavily", or asks to "search with Tavily". Tavily provides fast, direct web search with ranked results and content extraction without AI interpretation. Ideal for finding current information, documentation lookups, and real-time web content. This skill ALWAYS runs in a separate general-purpose agent instance to preserve context in the main session.
---

# Tavily Search - Fast Web Search & Content Extraction

## Overview

Tavily is a production-ready MCP server for real-time web search, content extraction, website mapping, and crawling. Unlike AI-powered search tools, Tavily provides fast, direct access to search results and web content without an AI interpretation layer, making it ideal for:

- Finding current information quickly
- Documentation lookups with direct URLs
- Real-time web content extraction
- Website structure discovery
- Comprehensive site crawling

**CRITICAL**: This skill MUST ALWAYS run in a separate general-purpose agent instance, never in the main chat session, to preserve context.

## Mandatory Agent-Based Execution Protocol

**REQUIRED WORKFLOW:**

```
Main Session:
├─ User requests: "Search for X using Tavily"
├─ Launch general-purpose agent with Task tool
│   Agent Context:
│   ├─ Execute Tavily search operations
│   ├─ Process and filter results
│   ├─ Extract relevant information
│   └─ Return: Clean, synthesized results (not raw data)
├─ Receive processed results in main session
└─ Use results for main task execution
```

**Why This Matters:**
- Web searches consume 5000+ tokens with full results
- Keeping searches in main session exhausts context window rapidly
- Separate agents isolate search operations and preserve main session focus
- Only processed, relevant information returns to main session

**Agent Prompt Template:**
```
Use Tavily MCP to search for [specific topic].
Search parameters: [query details, max_results, search_depth, etc.]

Extract and return:
- [Specific information needed]
- [Key findings]
- [Relevant URLs]

Format the response as [summary/bullet points/detailed analysis].
Apply version-specific search protocol if searching for technical documentation.
Follow error handling protocol (retry once on failure, fallback to native search).
```

## Core Tavily Tools

### 1. tavily_search - Web Search with Ranked Results

**Purpose:** Search the web for real-time information with ranked, direct results.

**Best For:**
- Finding current information
- Getting search results quickly
- Time-sensitive queries
- News and updates

**Key Parameters:**
- `query` (required): Search query string (keep under 400 characters)
- `max_results`: Number of results (1-20, default: 5)
- `search_depth`: "basic" (fast) or "advanced" (more relevant)
- `topic`: "general", "news", or "finance"
- `time_range`: "day", "week", "month", "year"
- `include_raw_content`: Boolean - include full page content
- `include_images`: Boolean - include related images

**Optimization Tips:**
- Keep queries concise (<400 chars)
- Use `search_depth: "advanced"` for better relevance
- Set `time_range` for time-sensitive searches
- Use `topic: "news"` for recent news with publish dates
- Request only needed results - more results = longer response times

**Example Usage:**
```json
{
  "query": "React 19 hooks documentation official 2025",
  "max_results": 10,
  "search_depth": "advanced",
  "time_range": "month"
}
```

### 2. tavily_extract - Extract Content from URLs

**Purpose:** Extract and process content from specific web pages.

**Best For:**
- Reading articles or documentation from known URLs
- Getting full content from search results
- Processing multiple URLs in parallel

**Key Parameters:**
- `urls` (required): Array of URLs to extract
- `extract_depth`: "basic" or "advanced" (advanced includes tables, embedded content)
- `format`: "markdown" or "text"
- `include_images`: Boolean

**Workflow Pattern:**
1. Use `tavily_search` to find URLs
2. Use `tavily_extract` to get full content from specific URLs

**Example Usage:**
```json
{
  "urls": ["https://react.dev/reference/react/hooks"],
  "extract_depth": "advanced",
  "format": "markdown"
}
```

### 3. tavily_map - Discover Website Structure

**Purpose:** Map and discover all URLs on a website.

**Best For:**
- Site structure exploration
- Finding specific pages before scraping
- Discovering documentation sections

**Key Parameters:**
- `url` (required): Root URL to map
- `max_depth`: How far from base URL to explore (default: 1)
- `max_breadth`: Max links per page (default: 20)
- `limit`: Total links to process (default: 50)
- `instructions`: Natural language instructions for crawler
- `allow_external`: Include external links

**Example Usage:**
```json
{
  "url": "https://docs.example.com",
  "max_depth": 3,
  "limit": 100,
  "instructions": "Focus on API documentation pages"
}
```

### 4. tavily_crawl - Crawl Website Pages

**Purpose:** Systematically crawl website pages and extract content.

**Best For:**
- Comprehensive site content gathering
- Bulk content extraction

**Key Parameters:**
- `url` (required): Root URL
- `max_depth`: Crawl depth (default: 1)
- `limit`: Total pages to crawl (default: 50)
- `format`: "markdown" or "text"
- `instructions`: Natural language crawl guidance

**Important Note:** Content is truncated to 500 chars per page. For full content, use `tavily_map` to discover URLs, then `tavily_extract` for complete content.

## Version-Specific Technical Searches

**CRITICAL for technical documentation searches:**

When searching for library/framework documentation, ALWAYS include version information:

**If User Specifies Version:**
- Use EXACT version in query
- Example: `"React 18.2 hooks documentation"`

**If User Does NOT Specify Version:**
- DEFAULT to LATEST version
- Include year or "latest" in query
- Example: `"React 19 hooks documentation official 2025"`

**Good Version-Specific Queries:**
- ✅ `"Next.js 14 app router documentation"`
- ✅ `"Python 3.12 asyncio latest features"`
- ✅ `"TypeScript 5.3 handbook generics"`

**Bad Non-Specific Queries:**
- ❌ `"React hooks"` (which version?)
- ❌ `"Python asyncio"` (2.7? 3.6? 3.12?)

**Verification Checklist:**
- [ ] Version number in query
- [ ] Results match requested/latest version
- [ ] URLs point to correct version docs
- [ ] Examples use correct syntax

## Query Optimization Best Practices

### 1. Keep Queries Under 400 Characters
- Write concise queries optimized for search
- Break complex queries into smaller sub-queries
- Example:
  - ✅ Good: `"Competitors of company ABC"`, `"Financial performance of company ABC"`
  - ❌ Bad: `"Tell me everything about company ABC including..."`

### 2. Break Complex Queries into Sub-Queries
- Send separate requests for different aspects
- Each sub-query focuses on one specific topic
- Use multiple parallel searches in the agent

### 3. Use Domain Control Wisely
- `include_domains`: Restrict to specific domains (e.g., `["react.dev"]`)
- `exclude_domains`: Filter out irrelevant sources
- Minimize to 3-5 domains for best performance

### 4. Choose Appropriate Search Depth
- `basic`: Fast, general results
- `advanced`: More relevant, query-aligned content
- Use `advanced` with `include_raw_content: true` for best results

### 5. Set Time Ranges for Recency
- Use `time_range` for time-sensitive queries
- Options: `day`, `week`, `month`, `year`

## Error Handling Protocol

**MANDATORY: Follow this protocol for all Tavily requests**

**On First Failure:**
1. Request fails (rate limit, timeout, error)
2. Wait 3-5 seconds (rate limit cooldown)
3. Retry SAME tool with SAME parameters ONCE

**On Second Failure:**
1. Log failure clearly
2. Fall back to native Claude Code WebSearch tool
3. Complete the search request

**Rate Limits:**
- Tavily: Varies by API plan (typically 1000 requests/month on free tier)
- Always wait 3-5 seconds between retry attempts
- Do NOT make multiple rapid requests

## Multi-Tool Workflows

### Workflow 1: Search → Extract
**Use Case:** Find and read full content

```
1. tavily_search: Find relevant URLs
2. tavily_extract: Get full content from specific URLs
```

### Workflow 2: Map → Extract
**Use Case:** Comprehensive site documentation

```
1. tavily_map: Discover all documentation URLs
2. tavily_extract: Extract content from discovered URLs
```

### Workflow 3: Parallel Searches
**Use Case:** Complex research with multiple aspects

```
Agent performs multiple tavily_search calls:
- Search 1: "aspect A"
- Search 2: "aspect B"
- Search 3: "aspect C"
Then synthesizes all results
```

## Post-Processing Techniques

### 1. Use Metadata Effectively
- `score`: Relevance score (higher = more relevant)
- `title`: Filter by title keywords
- `content`: Quick relevance gauge
- `raw_content`: Full page content for deep analysis

### 2. Filter and Prioritize
- Remove unwanted terms before processing
- Prioritize high-value keywords
- Filter by relevance scores

### 3. Extract Specific Data
- Use regex patterns for structured data
- Extract emails, dates, locations, etc.

## Common Use Cases

### Use Case 1: Documentation Lookup
```
User: "Search for Next.js 14 app router documentation using Tavily"

Agent Approach:
1. Query: "Next.js 14 app router official documentation 2025"
2. search_depth: "advanced"
3. max_results: 10
4. Extract URLs from results
5. Use tavily_extract on most relevant URLs
6. Return: Clean summary with examples and URLs
```

### Use Case 2: Current News
```
User: "Find latest news about quantum computing with Tavily"

Agent Approach:
1. Query: "quantum computing latest developments"
2. topic: "news"
3. time_range: "week"
4. search_depth: "advanced"
5. Return: News summary with publication dates and URLs
```

### Use Case 3: Site Structure Discovery
```
User: "Map out the documentation structure at docs.python.org"

Agent Approach:
1. tavily_map with url: "https://docs.python.org"
2. max_depth: 3
3. limit: 200
4. Return: Organized list of documentation sections with URLs
```

## References

For comprehensive documentation on Tavily MCP, refer to:
- `references/tavily_full_docs.md` - Complete tool documentation and optimization guide
- Official Docs: https://docs.tavily.com/
- GitHub: https://github.com/tavily-ai/tavily-mcp

## Quick Reference Card

**When to Use Tavily:**
- ✅ Need fast, direct search results
- ✅ Looking for current information
- ✅ Documentation lookups
- ✅ Real-time web content
- ✅ Want raw results without AI interpretation

**When NOT to Use Tavily:**
- ❌ Need AI-analyzed synthesis (use Perplexity)
- ❌ Need structured data extraction (use Firecrawl)
- ❌ Want AI reasoning and analysis (use Perplexity)

**Performance Tips:**
- Keep queries under 400 characters
- Use search_depth: "advanced" for better results
- Set appropriate max_results (more = slower)
- Use time_range for recency
- Break complex queries into sub-queries

**ALWAYS REMEMBER:**
- Run in separate general-purpose agent instance
- Include version in technical searches
- Follow error handling protocol (retry + fallback)
- Return only processed, relevant results to main session
