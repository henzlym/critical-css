# API Reference

Speedkit exposes a single API endpoint for all performance analysis.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fetch-css` | Analyze a URL and extract optimized CSS |

---

## GET /api/fetch-css

Analyzes a webpage and returns optimized CSS variants along with preload recommendations.

### Request

```
GET /api/fetch-css?url=<encoded_url>&mode=<mode>
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes | — | URL to analyze (must be URL-encoded) |
| `mode` | string | No | `full` | Analysis mode: `full` or `above-fold` |

#### Example Request

```bash
curl "https://speedkit.henzlymeghie.com/api/fetch-css?url=https%3A%2F%2Fexample.com&mode=above-fold"
```

### Response

#### Success (200)

```json
{
  "minified": "/* Combined & minified CSS */",
  "unminified": "/* Raw combined CSS */",
  "critical": "/* Purged critical CSS */",
  "stylesheets": [
    {
      "id": 1,
      "url": "https://example.com/styles/main.css",
      "filename": "main.css",
      "size": 45231,
      "sizeFormatted": "44.2 KB"
    }
  ],
  "sizes": {
    "original": 45231,
    "originalFormatted": "44.2 KB",
    "minified": 32156,
    "minifiedFormatted": "31.4 KB",
    "critical": 8234,
    "criticalFormatted": "8.0 KB",
    "reductionPercent": 82
  },
  "preloadTags": {
    "fonts": [
      "<link rel=\"preload\" href=\"/fonts/inter.woff2\" as=\"font\" type=\"font/woff2\" crossorigin>"
    ],
    "images": [
      "<link rel=\"preload\" href=\"/hero.webp\" as=\"image\">"
    ],
    "stylesheets": [
      "<link rel=\"preload\" href=\"/critical.css\" as=\"style\">"
    ],
    "scripts": [],
    "preconnect": [
      "<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>",
      "<link rel=\"dns-prefetch\" href=\"https://analytics.example.com\">"
    ]
  },
  "mode": "above-fold",
  "message": "CSS extracted successfully"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `minified` | string | All stylesheets combined and minified |
| `unminified` | string | Raw combined CSS (for debugging) |
| `critical` | string | Purged CSS containing only used selectors |
| `stylesheets` | array | Metadata for each discovered stylesheet |
| `sizes` | object | Size comparison metrics |
| `preloadTags` | object | Generated resource hint tags |
| `mode` | string | Analysis mode used |
| `message` | string | Status message |

#### Error Responses

**400 Bad Request** — Missing or invalid URL

```json
{
  "error": "URL parameter is required"
}
```

**500 Internal Server Error** — Analysis failed

```json
{
  "error": "Failed to analyze page: Navigation timeout"
}
```

### Modes

#### `full` (default)
Captures the full page HTML and extracts CSS for all elements.

#### `above-fold`
Captures only elements visible within the initial viewport (900px height). Results in smaller critical CSS optimized for initial render.

### Rate Limits

| Environment | Limit |
|-------------|-------|
| Development | Unlimited |
| Production | 10 requests/minute per IP |

### Timeout

Maximum execution time: **30 seconds**

Large pages with many stylesheets may approach this limit.

---

## Usage Examples

### JavaScript (fetch)

```javascript
const url = encodeURIComponent('https://example.com');
const response = await fetch(`/api/fetch-css?url=${url}&mode=above-fold`);
const data = await response.json();

console.log(`Critical CSS: ${data.sizes.criticalFormatted}`);
console.log(`Reduction: ${data.sizes.reductionPercent}%`);
```

### React Hook

```javascript
function useCssAnalysis(url, mode = 'full') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/fetch-css?url=${encodeURIComponent(url)}&mode=${mode}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, analyze };
}
```

### cURL

```bash
# Basic usage
curl "https://speedkit.henzlymeghie.com/api/fetch-css?url=https%3A%2F%2Fexample.com"

# Above-fold mode
curl "https://speedkit.henzlymeghie.com/api/fetch-css?url=https%3A%2F%2Fexample.com&mode=above-fold"

# Pretty print JSON
curl -s "https://speedkit.henzlymeghie.com/api/fetch-css?url=https%3A%2F%2Fexample.com" | jq
```
