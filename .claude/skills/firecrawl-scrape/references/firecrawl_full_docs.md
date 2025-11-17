# Firecrawl MCP - Complete Reference

## Official Links

- **GitHub:** https://github.com/mendableai/firecrawl-mcp-server
- **Official Docs:** https://docs.firecrawl.dev/mcp-server

## Tool Parameter Reference

### firecrawl_scrape

```
Required:
- url: string

Optional:
- formats: array ["markdown", "html", "rawHtml", "screenshot", "links"]
- onlyMainContent: boolean (default: true)
- waitFor: number (milliseconds)
- timeout: number (default: 30000ms)
- includeTags: array of strings
- excludeTags: array of strings (e.g., ["nav", "footer", "aside"])
- actions: array of action objects
- maxAge: number (milliseconds, for caching)
- mobile: boolean
```

**Action Objects:**
```json
{
  "type": "wait|screenshot|scroll|scrape|click|write|press|executeJavascript|generatePDF",
  "milliseconds": number,  // for wait
  "selector": string,      // for click/write
  "text": string,          // for write
  "key": string,           // for press
  "direction": "up|down",  // for scroll
  "fullPage": boolean,     // for screenshot
  "script": string         // for executeJavascript
}
```

### firecrawl_map

```
Required:
- url: string

Optional:
- search: string (filter URLs)
- sitemap: "include"|"skip"|"only"
- includeSubdomains: boolean
- limit: number (default: 100)
- ignoreQueryParameters: boolean
```

### firecrawl_search

```
Required:
- query: string

Optional:
- limit: number (default: 5)
- lang: string (e.g., "en")
- country: string (e.g., "us")
- scrapeOptions: object (see firecrawl_scrape parameters)
```

### firecrawl_crawl

```
Required:
- url: string

Optional:
- maxDepth: number (default: 2, recommended: 2-3 max)
- limit: number (default: 100)
- allowExternalLinks: boolean
- deduplicateSimilarURLs: boolean
- includePaths: array of strings (path patterns)
- excludePaths: array of strings (path patterns)
- scrapeOptions: object (see firecrawl_scrape parameters)
- ignoreQueryParameters: boolean
- delay: number (milliseconds between requests)
- maxConcurrency: number
- crawlEntireDomain: boolean
- allowSubdomains: boolean
- sitemap: "skip"|"include"|"only"
- prompt: string (natural language crawl instructions)
- webhook: string | object {url, headers}
```

### firecrawl_extract

```
Required:
- urls: array of strings

Optional:
- prompt: string (custom extraction prompt)
- schema: object (JSON schema)
  - type: "object"
  - properties: object
  - required: array of strings
- systemPrompt: string
- allowExternalLinks: boolean
- enableWebSearch: boolean
- includeSubdomains: boolean
```

**Schema Example:**
```json
{
  "type": "object",
  "properties": {
    "name": {"type": "string"},
    "price": {"type": "number"},
    "description": {"type": "string"},
    "tags": {"type": "array", "items": {"type": "string"}}
  },
  "required": ["name", "price"]
}
```

### firecrawl_check_crawl_status

```
Required:
- id: string (operation ID from firecrawl_crawl)
```

## Response Formats

### firecrawl_scrape Response

```json
{
  "markdown": "...",
  "html": "...",
  "rawHtml": "...",
  "screenshot": "...",
  "links": ["url1", "url2"],
  "metadata": {
    "title": "...",
    "description": "...",
    "sourceURL": "...",
    "statusCode": 200
  }
}
```

### firecrawl_map Response

```json
{
  "links": [
    "https://example.com/page1",
    "https://example.com/page2"
  ]
}
```

### firecrawl_extract Response

```json
{
  "success": true,
  "data": {
    // Your schema structure with extracted data
  }
}
```

## Rate Limits & Configuration

**Rate Limits:**
- Varies by API tier
- Built-in rate limiting with exponential backoff
- Automatic retries for transient errors

**Configuration (Environment Variables):**
```
FIRECRAWL_RETRY_MAX_ATTEMPTS: 3 (increase to 5-10 for reliability)
FIRECRAWL_RETRY_INITIAL_DELAY: 1000ms
FIRECRAWL_RETRY_MAX_DELAY: 10000ms
FIRECRAWL_RETRY_BACKOFF_FACTOR: 2 (use 3 for aggressive backoff)
FIRECRAWL_CREDIT_WARNING_THRESHOLD: Set to warn before running out
FIRECRAWL_CREDIT_CRITICAL_THRESHOLD: Set to prevent interruption
```

## Optimization Guidelines

### Format Selection

| Format | Use Case | Token Cost |
|--------|----------|------------|
| `markdown` | LLM consumption (recommended) | Medium |
| `html` | Structure preservation | High |
| `rawHtml` | Full unprocessed HTML | Very High |
| `links` | URL extraction only | Low |
| `screenshot` | Visual capture | N/A |

### Content Filtering

**Always Use:**
- `onlyMainContent: true` - Reduces tokens by 50-70%
- `excludeTags: ["nav", "footer", "aside", "header"]` - Removes clutter

**Tag Exclusion Examples:**
```json
{
  "excludeTags": [
    "nav",      // Navigation menus
    "footer",   // Page footers
    "aside",    // Sidebars
    "header",   // Page headers
    "script",   // JavaScript
    "style",    // Inline styles
    "form"      // Forms (unless needed)
  ]
}
```

### Caching Strategy

**maxAge Values:**
- `3600000` = 1 hour (frequently changing content)
- `86400000` = 24 hours (daily updates)
- `172800000` = 48 hours (documentation)
- `604800000` = 7 days (static content)

**Benefits:**
- 500% speed boost for cached content
- Reduced API costs
- Lower rate limit usage

### Crawl Optimization

**Best Practices:**
1. **Use map → scrape instead of crawl**
   - Better control
   - Avoids token overflow
   - Can prioritize pages

2. **If using crawl:**
   - Set `maxDepth: 2-3` maximum
   - Use `limit` to cap pages
   - Set `deduplicateSimilarURLs: true`
   - Use `excludePaths` for unwanted sections
   - Set `delay` between requests

3. **Path Filtering:**
   ```json
   {
     "includePaths": ["/docs/*", "/api/*"],
     "excludePaths": ["/archive/*", "/tags/*", "/search/*"]
   }
   ```

## Common Patterns

### Pattern: Single Page Scraping

```
Tool: firecrawl_scrape
Parameters:
- url: target URL
- formats: ["markdown"]
- onlyMainContent: true
- excludeTags: ["nav", "footer", "aside"]
- maxAge: 172800000 (cache 48 hours)
```

### Pattern: Site Documentation Extraction

```
Step 1: firecrawl_map
- url: base documentation URL
- limit: 200
- sitemap: "include"

Step 2: Filter URLs
- Select relevant documentation pages
- Remove changelog, archive, etc.

Step 3: firecrawl_scrape (parallel)
- For each documentation URL
- Use maxAge for caching
- Extract markdown format
```

### Pattern: Structured Data Extraction

```
Step 1: Find URLs
- Use firecrawl_map or firecrawl_search

Step 2: firecrawl_extract
- urls: [discovered URLs]
- prompt: "Extract specific information"
- schema: {define structure}
```

### Pattern: Dynamic Content

```
Tool: firecrawl_scrape
Actions:
[
  {"type": "wait", "milliseconds": 2000},
  {"type": "click", "selector": "#load-more"},
  {"type": "wait", "milliseconds": 1000},
  {"type": "scroll", "direction": "down"}
]
```

## Error Handling

### Common Errors

1. **Timeout (30000ms default)**
   - Solution: Reduce `limit` or `maxDepth`
   - Solution: Increase `timeout` parameter
   - Solution: Use simpler scraping parameters

2. **Rate Limit Exceeded**
   - Solution: Wait 3-5 seconds, retry once
   - Solution: Reduce request frequency
   - Solution: Increase `delay` for crawls

3. **Empty/No Content**
   - Solution: Set `onlyMainContent: false`
   - Solution: Remove or adjust `excludeTags`
   - Solution: Check if JavaScript rendering needed (use `actions`)

4. **Invalid URL / 404**
   - Solution: Verify URL format
   - Solution: Check URL accessibility
   - Solution: Try alternative URLs

### Fallback Strategy

```
1. First failure:
   - Wait 3-5 seconds
   - Retry with same parameters

2. Second failure:
   - Try alternative approach:
     * Simpler parameters
     * map → scrape instead of crawl
     * Reduced limit/depth

3. Third failure:
   - Report error to user
   - Suggest manual intervention
```

## Performance Tips

### Speed Optimization

1. **Use caching aggressively**
   - Set `maxAge` for frequently accessed URLs
   - 500% speed improvement

2. **Minimize content extraction**
   - Use `onlyMainContent: true`
   - Exclude unnecessary tags
   - Choose appropriate format

3. **Parallel processing**
   - Use map → multiple scrape calls
   - Process multiple URLs concurrently (in agent)

### Quality Optimization

1. **Content filtering**
   - Use `excludeTags` to remove noise
   - Set `includeTags` for specific elements (if needed)

2. **Format selection**
   - `markdown` for LLM consumption
   - `html` for structure preservation

3. **Dynamic content handling**
   - Use `waitFor` for page load
   - Use `actions` for JavaScript interactions

### Token Efficiency

1. **Process in agent**
   - Extract only relevant sections
   - Summarize long content
   - Return only what's needed to main session

2. **Avoid crawl for large sites**
   - Use map → scrape workflow
   - Better control = fewer wasted tokens

3. **Smart caching**
   - Cache stable content (docs, blogs)
   - Avoid caching dynamic content (news, prices)

## Comparison with Other MCPs

**vs. Tavily:**
- Firecrawl: Complete content extraction
- Tavily: Fast search with snippets
- Use Firecrawl when you need full page content

**vs. Perplexity:**
- Firecrawl: Raw content scraping
- Perplexity: AI-analyzed research
- Use Firecrawl for content, Perplexity for analysis
