---
name: firecrawl-scrape
description: Use this skill when the user explicitly requests "Firecrawl" scraping, mentions "use Firecrawl", or asks to "scrape with Firecrawl". Firecrawl provides powerful web scraping and content extraction that converts web content into LLM-ready formats (markdown, HTML, JSON). Ideal for extracting content from specific URLs, crawling entire websites, and extracting structured data with schemas. This skill ALWAYS runs in a separate general-purpose agent instance to preserve context in the main session.
---

# Firecrawl - Web Scraping & Structured Data Extraction

## Overview

Firecrawl is a powerful MCP server for web scraping and content extraction that converts web content into LLM-ready formats. Unlike search tools, Firecrawl specializes in comprehensive content extraction and structured data parsing, making it ideal for:

- Scraping specific pages for complete content
- Crawling entire websites systematically
- Extracting structured data with JSON schemas
- Converting web content to markdown/HTML
- Advanced browser automation (click, scroll, wait, etc.)
- Fast caching for repeated requests

**CRITICAL**: This skill MUST ALWAYS run in a separate general-purpose agent instance, never in the main chat session, to preserve context.

## Mandatory Agent-Based Execution Protocol

**REQUIRED WORKFLOW:**

```
Main Session:
├─ User requests: "Scrape X using Firecrawl"
├─ Launch general-purpose agent with Task tool
│   Agent Context:
│   ├─ Execute Firecrawl scraping operations
│   ├─ Extract and process content
│   ├─ Format data appropriately
│   └─ Return: Clean, processed content (not raw HTML)
├─ Receive processed content in main session
└─ Use content for main task execution
```

**Why This Matters:**
- Scraped content can be very large (thousands of tokens)
- Full page HTML/markdown consumes massive context
- Multiple pages compound context usage exponentially
- Separate agents isolate scraping operations
- Only relevant, processed content returns to main session

**Agent Prompt Template:**
```
Use Firecrawl MCP to scrape [specific URL or site].
Tool selection: [firecrawl_scrape/map/crawl/extract/search]

Parameters:
- [URL or query]
- [Format: markdown/html/etc.]
- [Additional parameters]

Extract and return:
- [Specific content sections needed]
- [Structured data if applicable]
- [Relevant URLs if mapping/crawling]

Format the response as [summary/structured data/content sections].
Apply version-specific search protocol if scraping technical documentation.
Follow error handling protocol (retry once on failure).
```

## Core Firecrawl Tools

### 1. firecrawl_scrape - Single URL Content Extraction

**Purpose:** Scrape content from a single URL with advanced options.

**Best For:**
- Reading specific pages
- Extracting complete documentation
- Converting web pages to markdown
- Processing single URLs with precision

**Key Parameters:**
- `url` (required): URL to scrape
- `formats`: Array - `["markdown", "html", "rawHtml", "screenshot", "links"]`
- `onlyMainContent`: Boolean - extract only main content (default: true)
- `waitFor`: Milliseconds to wait before scraping
- `timeout`: Request timeout (default: 30000ms)
- `includeTags`: Array of HTML tags to include
- `excludeTags`: Array - e.g., `["nav", "footer", "aside"]`
- `actions`: Array of browser actions (click, scroll, etc.)
- `maxAge`: Cache duration in milliseconds (e.g., 172800000 = 48 hours)

**Performance Tip:** Use `maxAge` parameter for 500% faster cached results:

```json
{
  "url": "https://example.com",
  "formats": ["markdown"],
  "maxAge": 172800000,
  "onlyMainContent": true,
  "excludeTags": ["nav", "footer", "aside"]
}
```

**Optimization Tips:**
- Set `onlyMainContent: true` to avoid navigation/footer clutter
- Use `excludeTags` to remove unwanted elements
- Set `maxAge` for frequently accessed URLs
- Choose `format: "markdown"` for LLM consumption
- Use `actions` for dynamic content (JavaScript-rendered)

### 2. firecrawl_map - Discover Website URLs

**Purpose:** Map a website to discover all indexed URLs.

**Best For:**
- Site structure exploration
- URL discovery before scraping
- Finding specific documentation sections

**Key Parameters:**
- `url` (required): Base URL to map
- `search`: Optional search term to filter URLs
- `sitemap`: `"include"`, `"skip"`, or `"only"`
- `includeSubdomains`: Boolean
- `limit`: Maximum URLs to return (default: 100)
- `ignoreQueryParameters`: Boolean

**Workflow Pattern:**
1. Use `firecrawl_map` to discover URLs
2. Use `firecrawl_scrape` to extract content from specific URLs

**Example Usage:**
```json
{
  "url": "https://docs.example.com",
  "search": "api",
  "limit": 200,
  "sitemap": "include"
}
```

**Returns:** Array of discovered URLs

### 3. firecrawl_search - Web Search + Content Scraping

**Purpose:** Search the web and optionally extract content from results.

**Best For:**
- Finding and scraping search results
- When you don't know specific URLs
- Quick content extraction from search

**Key Parameters:**
- `query` (required): Search query
- `limit`: Number of results (default: 5)
- `lang`: Language code (e.g., "en")
- `country`: Country code (e.g., "us")
- `scrapeOptions`: Optional scraping configuration

**Optimal Workflow:**
- Search first WITHOUT formats to get results quickly
- Then use `firecrawl_scrape` on specific URLs for full content

**Example Usage:**
```json
{
  "query": "React 19 hooks documentation",
  "limit": 10,
  "lang": "en"
}
```

### 4. firecrawl_crawl - Asynchronous Website Crawling

**Purpose:** Start an asynchronous crawl of an entire website.

**Best For:**
- Comprehensive site scraping
- Bulk content extraction
- When you need many pages from one site

**Key Parameters:**
- `url` (required): Starting URL
- `maxDepth`: Maximum crawl depth (default: 2)
- `limit`: Maximum pages to crawl (default: 100)
- `allowExternalLinks`: Boolean
- `deduplicateSimilarURLs`: Boolean
- `includePaths`: Array of path patterns to include
- `excludePaths`: Array of path patterns to exclude
- `scrapeOptions`: Scraping configuration for each page

**⚠️ WARNING:**
- Large crawls can exceed token limits easily
- Set `maxDepth` carefully (2-3 max recommended)
- Use `limit` to cap total pages
- **Better approach:** Use `firecrawl_map` + `firecrawl_scrape` for control

**Returns:** Operation ID - use `firecrawl_check_crawl_status` to check progress

**Example Usage:**
```json
{
  "url": "https://blog.example.com",
  "maxDepth": 2,
  "limit": 50,
  "deduplicateSimilarURLs": true,
  "excludePaths": ["/archive/*", "/tags/*"]
}
```

### 5. firecrawl_extract - Structured Data Extraction

**Purpose:** Extract structured data using LLM capabilities with JSON schemas.

**Best For:**
- Extracting specific data fields
- Converting web content to structured JSON
- Parsing consistent data across multiple pages

**Key Parameters:**
- `urls` (required): Array of URLs to extract from
- `prompt`: Custom extraction prompt
- `schema`: JSON schema for structured output
  - Define `type`, `properties`, `required` fields
- `systemPrompt`: System prompt to guide extraction
- `allowExternalLinks`: Boolean
- `enableWebSearch`: Boolean

**Example Usage:**
```json
{
  "urls": ["https://shop.example.com/product"],
  "prompt": "Extract product information including name, price, and description",
  "schema": {
    "type": "object",
    "properties": {
      "name": {"type": "string"},
      "price": {"type": "number"},
      "description": {"type": "string"},
      "features": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["name", "price"]
  }
}
```

**Use Cases:**
- E-commerce: Extract product details
- Documentation: Extract API endpoints and parameters
- News: Extract article metadata (title, author, date)
- Research: Extract paper information (title, authors, abstract)

## Tool Selection Guide

| Tool | When to Use | Returns |
|------|-------------|---------|
| **firecrawl_scrape** | Know specific URL, want complete content | Full page content |
| **firecrawl_map** | Need to discover URLs on a site | Array of URLs |
| **firecrawl_search** | Don't know URL, search for content | Search results ± content |
| **firecrawl_crawl** | Need many pages from one site | Operation ID (async) |
| **firecrawl_extract** | Need structured data with schema | JSON with structured data |

**Decision Tree:**
1. Know the exact URL? → Use `firecrawl_scrape`
2. Need to find URLs on a site? → Use `firecrawl_map`
3. Need structured data? → Use `firecrawl_extract`
4. Need many pages? → Use `firecrawl_map` + multiple `firecrawl_scrape` (NOT crawl)
5. Don't know the URL? → Use `firecrawl_search` to find, then `firecrawl_scrape`

## Version-Specific Technical Searches

**CRITICAL for technical documentation scraping:**

When scraping library/framework documentation, ALWAYS target version-specific URLs:

**If User Specifies Version:**
- Scrape exact version documentation URL
- Example: `https://react.dev/reference/react/hooks` (latest)
- Example: `https://legacy.reactjs.org/docs/hooks-intro.html` (old)

**If User Does NOT Specify Version:**
- DEFAULT to LATEST version documentation
- Verify URL points to latest docs
- Check "Last Updated" dates in content

**URL Verification:**
- ✅ `https://react.dev/` (latest React)
- ❌ `https://legacy.reactjs.org/` (old React)
- ✅ `https://docs.python.org/3/` (Python 3 latest)
- ❌ `https://docs.python.org/2.7/` (Python 2.7)

**Scraping Version-Specific Docs:**
```json
{
  "url": "https://react.dev/reference/react/hooks",
  "formats": ["markdown"],
  "onlyMainContent": true,
  "excludeTags": ["nav", "footer"]
}
```

## Optimization Best Practices

### 1. Format Selection

**Choose the right format:**
- `"markdown"`: Best for LLM consumption (recommended)
- `"html"`: Preserves structure (use for specific needs)
- `"rawHtml"`: Full unprocessed HTML (rarely needed)
- `"links"`: Extract all links from page
- `"screenshot"`: Visual capture (for debugging/archiving)

### 2. Main Content Only

**Always set `onlyMainContent: true`:**
- Removes navigation, footers, sidebars
- Reduces token usage by 50-70%
- Focuses on actual content

### 3. Exclude Noise

**Use `excludeTags` to remove unwanted elements:**
```json
{
  "excludeTags": ["nav", "footer", "aside", "header", "script", "style"]
}
```

### 4. Use Caching

**Set `maxAge` for frequently accessed content:**
- `172800000` = 48 hours
- `604800000` = 7 days
- Results in 500% speed boost for cached content

### 5. Control Crawl Scope

**For crawling:**
- Set `maxDepth: 2-3` (max recommended)
- Use `limit` to cap total pages
- Set `deduplicateSimilarURLs: true`
- Use `excludePaths` to skip unwanted sections

### 6. Browser Actions

**For dynamic content:**
```json
{
  "actions": [
    {"type": "wait", "milliseconds": 2000},
    {"type": "click", "selector": "#load-more"},
    {"type": "wait", "milliseconds": 1000},
    {"type": "scroll", "direction": "down"}
  ]
}
```

## Error Handling Protocol

**MANDATORY: Follow this protocol for all Firecrawl requests**

**On First Failure:**
1. Request fails (rate limit, timeout, error)
2. Wait 3-5 seconds (rate limit cooldown)
3. Retry SAME tool with SAME parameters ONCE

**On Second Failure:**
1. Log failure clearly
2. Try alternative approach:
   - If scrape fails: Try with simpler parameters
   - If crawl fails: Use map + scrape instead
   - If timeout: Reduce limit or depth
3. Report error to user if unable to complete

**Rate Limits:**
- Firecrawl: Rate limited by API tier
- Built-in rate limiting and exponential backoff
- Automatic retries for transient errors
- Wait 3-5 seconds between manual retry attempts

**Common Errors:**
1. **Timeout:** Reduce `limit`, `maxDepth`, or page count
2. **Rate Limit:** Wait longer, reduce request frequency
3. **Invalid URL:** Verify URL format and accessibility
4. **Empty Content:** Try `onlyMainContent: false` or remove `excludeTags`

## Multi-Tool Workflows

### Workflow 1: Map → Scrape (Recommended)

**Use Case:** Comprehensive site documentation extraction

```
1. firecrawl_map: Discover all URLs on site
   - Returns: Array of URLs

2. Filter URLs: Select relevant documentation pages

3. firecrawl_scrape: Extract content from each URL
   - Process multiple URLs in parallel
   - Use maxAge for caching
```

**Why Better Than Crawl:**
- Better control over which pages to scrape
- Avoids token overflow from crawl
- Can prioritize important pages
- Easier to manage and debug

### Workflow 2: Search → Scrape

**Use Case:** Find and extract content without knowing URL

```
1. firecrawl_search: Find relevant pages
   - query: "topic keywords"
   - limit: 10

2. firecrawl_scrape: Extract full content from top results
```

### Workflow 3: Extract Structured Data from Multiple Pages

**Use Case:** Extract consistent data across pages

```
1. firecrawl_map or firecrawl_search: Find target URLs

2. firecrawl_extract: Extract structured data
   - urls: [discovered URLs]
   - schema: {define structure}
```

## Common Use Cases

### Use Case 1: Documentation Scraping

```
User: "Scrape the React 19 hooks documentation using Firecrawl"

Agent Approach:
1. Tool: firecrawl_scrape
2. Parameters:
   - url: "https://react.dev/reference/react/hooks"
   - formats: ["markdown"]
   - onlyMainContent: true
   - excludeTags: ["nav", "footer", "aside"]
   - maxAge: 172800000 (cache for 48 hours)
3. Return: Clean markdown content with hooks documentation
```

### Use Case 2: Site Structure Discovery

```
User: "Map out all API documentation pages on example.com"

Agent Approach:
1. Tool: firecrawl_map
2. Parameters:
   - url: "https://docs.example.com/api"
   - search: "api"
   - limit: 200
   - sitemap: "include"
3. Return: Organized list of API doc URLs with titles
```

### Use Case 3: Structured Data Extraction

```
User: "Extract product information from these e-commerce pages"

Agent Approach:
1. Tool: firecrawl_extract
2. Parameters:
   - urls: [list of product URLs]
   - prompt: "Extract product details"
   - schema: {name, price, description, features, availability}
3. Return: Structured JSON with product data
```

### Use Case 4: Comprehensive Site Scraping

```
User: "Get all blog posts from blog.example.com"

Agent Approach:
1. Tool: firecrawl_map
   - url: "https://blog.example.com"
   - max_depth: 2
   - limit: 100

2. Filter URLs: Select blog post URLs

3. Tool: firecrawl_scrape (multiple calls)
   - For each blog post URL
   - formats: ["markdown"]
   - onlyMainContent: true

4. Return: Organized collection of blog post content
```

## References

For comprehensive documentation on Firecrawl MCP, refer to:
- `references/firecrawl_full_docs.md` - Complete tool documentation and optimization guide
- Official Docs: https://docs.firecrawl.dev/mcp-server
- GitHub: https://github.com/mendableai/firecrawl-mcp-server

## Quick Reference Card

**When to Use Firecrawl:**
- ✅ Need complete page content extraction
- ✅ Want to scrape specific URLs
- ✅ Need structured data with schemas
- ✅ Converting web content to markdown/HTML
- ✅ Comprehensive site scraping
- ✅ Advanced browser automation needed

**When NOT to Use Firecrawl:**
- ❌ Need web search with AI analysis (use Perplexity)
- ❌ Need fast search results (use Tavily)
- ❌ Just want current information (use Tavily)

**Performance Tips:**
- Use `onlyMainContent: true` always
- Set `excludeTags` to remove clutter
- Use `maxAge` for caching frequently accessed content
- Choose `format: "markdown"` for LLM use
- Use map → scrape workflow instead of crawl
- Set appropriate `limit` and `maxDepth` to avoid timeouts

**ALWAYS REMEMBER:**
- Run in separate general-purpose agent instance
- Verify version when scraping technical docs
- Follow error handling protocol (retry once)
- Return only processed, relevant content to main session
- Use map → scrape workflow for better control
