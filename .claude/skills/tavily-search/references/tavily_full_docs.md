# Tavily MCP - Complete Reference

## Official Links
- **GitHub:** https://github.com/tavily-ai/tavily-mcp
- **Official Docs:** https://docs.tavily.com/
- **Best Practices:** https://docs.tavily.com/documentation/best-practices/best-practices-search

## Tool Parameter Reference

### tavily_search
```
Required:
- query: string (keep under 400 characters)

Optional:
- max_results: 1-20 (default: 5)
- search_depth: "basic" | "advanced"
- topic: "general" | "news" | "finance"
- time_range: "day" | "week" | "month" | "year"
- include_raw_content: boolean
- include_images: boolean
- include_image_descriptions: boolean
- country: ISO 3166-1 alpha-2 code
- include_domains: array of strings
- exclude_domains: array of strings
```

### tavily_extract
```
Required:
- urls: array of strings

Optional:
- extract_depth: "basic" | "advanced"
- format: "markdown" | "text"
- include_images: boolean
- include_favicon: boolean
```

### tavily_map
```
Required:
- url: string

Optional:
- max_depth: number (default: 1)
- max_breadth: number (default: 20)
- limit: number (default: 50)
- instructions: string
- allow_external: boolean
```

### tavily_crawl
```
Required:
- url: string

Optional:
- max_depth: number (default: 1)
- max_breadth: number (default: 20)
- limit: number (default: 50)
- format: "markdown" | "text"
- extract_depth: "basic" | "advanced"
- instructions: string
- include_images: boolean
```

## Response Metadata

All Tavily search results include:
- `url`: Source URL
- `title`: Page title
- `content`: Snippet/summary
- `raw_content`: Full page content (if requested)
- `score`: Relevance score (higher = more relevant)
- `published_date`: Publication date (news topic only)

## Rate Limits

- **Free tier:** Typically 1000 requests/month
- **Paid tiers:** Vary by plan
- **Best practice:** Wait 3-5 seconds between requests
- **Retry protocol:** On failure, wait 3-5 seconds and retry once

## Optimization Guidelines

### Query Construction
1. Keep queries under 400 characters
2. Use specific, targeted keywords
3. Include year/version for technical searches
4. Break complex queries into sub-queries

### Parameter Selection
1. Use `search_depth: "advanced"` for better relevance
2. Set `max_results` based on actual needs (lower = faster)
3. Use `time_range` for time-sensitive queries
4. Set `topic: "news"` for recent news articles
5. Use `include_domains` to restrict to authoritative sources

### Domain Filtering
1. Limit to 3-5 domains maximum
2. Use for official documentation sites
3. Combine with version-specific queries

### Content Extraction
1. Use `tavily_search` first to find URLs
2. Use `tavily_extract` for full content
3. Set `extract_depth: "advanced"` for tables/embedded content
4. Choose `format: "markdown"` for LLM consumption

## Common Patterns

### Pattern: Documentation Lookup
```
1. tavily_search
   - query: "[library] [version] [topic] official documentation"
   - search_depth: "advanced"
   - max_results: 10

2. tavily_extract
   - urls: [top 3 results]
   - extract_depth: "advanced"
   - format: "markdown"
```

### Pattern: Recent News
```
tavily_search
- query: "[topic] latest developments"
- topic: "news"
- time_range: "week"
- search_depth: "advanced"
```

### Pattern: Site Exploration
```
1. tavily_map
   - url: "[base_url]"
   - max_depth: 2-3
   - limit: 100
   - instructions: "Focus on [specific sections]"

2. tavily_extract
   - urls: [relevant discovered URLs]
   - format: "markdown"
```

## Error Handling

### Common Errors
1. **Rate Limit Exceeded:** Wait 3-5 seconds, retry once
2. **Timeout:** Reduce max_results or limit parameters
3. **Invalid URL:** Verify URL format and accessibility
4. **Empty Results:** Refine query or change search parameters

### Fallback Strategy
1. First failure: Wait 3-5 seconds, retry with same parameters
2. Second failure: Fall back to native WebSearch
3. Always log failures clearly

## Performance Tips

1. **Speed:**
   - Use `search_depth: "basic"` for faster results
   - Lower `max_results` value
   - Don't request `include_raw_content` unless needed

2. **Relevance:**
   - Use `search_depth: "advanced"`
   - Add year/version to queries
   - Use domain filtering
   - Set appropriate `topic`

3. **Token Efficiency:**
   - Don't load raw_content in main session
   - Process results in agent before returning
   - Return only synthesized, relevant information
