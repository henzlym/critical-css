# Preload Tag Generator

Generate optimized resource hints for faster page loading.

## Overview

The Preload Tag Generator analyzes a webpage's resources and produces ready-to-use HTML tags:

- `<link rel="preload">` — Prioritize critical resources
- `<link rel="preconnect">` — Early connection to origins
- `<link rel="dns-prefetch">` — DNS lookup ahead of time

## How It Works

```
URL Input
    │
    ▼
Puppeteer loads page
    │
    ▼
Monitor network requests
    │
    ▼
Categorize resources:
├── Fonts (woff2, woff, ttf)
├── Images (hero, LCP candidates)
├── Stylesheets (critical CSS)
├── Scripts (essential JS)
└── Third-party origins
    │
    ▼
Generate appropriate tags
```

## Generated Tags

### Fonts

```html
<link 
  rel="preload" 
  href="/fonts/inter-var.woff2" 
  as="font" 
  type="font/woff2" 
  crossorigin
>
```

**Important:** Fonts always require `crossorigin` attribute, even for same-origin fonts.

### Images

```html
<link 
  rel="preload" 
  href="/images/hero.webp" 
  as="image"
>
```

For responsive images:

```html
<link 
  rel="preload" 
  href="/images/hero-mobile.webp" 
  as="image"
  media="(max-width: 768px)"
>
```

### Stylesheets

```html
<link 
  rel="preload" 
  href="/css/critical.css" 
  as="style"
>
```

### Scripts

```html
<link 
  rel="preload" 
  href="/js/app.js" 
  as="script"
>
```

### Preconnect

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

### DNS Prefetch

```html
<link rel="dns-prefetch" href="https://analytics.example.com">
```

## Usage

### Web Interface

1. Navigate to `/preload`
2. Enter a URL to analyze
3. Click "Analyze"
4. Copy individual tags or all tags
5. Paste into your HTML `<head>`

### API

```bash
GET /api/fetch-css?url=https://example.com
```

Response includes `preloadTags` object:

```json
{
  "preloadTags": {
    "fonts": ["..."],
    "images": ["..."],
    "stylesheets": ["..."],
    "scripts": ["..."],
    "preconnect": ["..."]
  }
}
```

## Best Practices

### Do Preload

✅ LCP image (hero, banner)  
✅ Critical web fonts (1-2 max)  
✅ Critical CSS (above-the-fold)  
✅ Essential JavaScript  

### Don't Preload

❌ Everything (defeats the purpose)  
❌ Below-fold images  
❌ Non-critical fonts  
❌ Third-party scripts you don't control  

### Priority Order

1. Critical CSS
2. LCP image
3. Primary font
4. Essential JS

## Implementation Details

### Resource Detection

```javascript
// Capture network requests during page load
page.on('request', (request) => {
  resources.push({
    url: request.url(),
    type: request.resourceType(),
    priority: request.priority,
  });
});
```

### Filtering Heuristics

Resources are scored based on:
- Request timing (earlier = more critical)
- Resource type
- File size
- Position in DOM (above-fold)

### Origin Analysis

Third-party origins are categorized:
- **preconnect** — Used for critical resources
- **dns-prefetch** — Used for analytics, ads, etc.

## Gotchas

### Double Fetch Warning

If you preload a resource but don't use it, browsers warn:

```
The resource was preloaded but not used within a few seconds.
```

Only preload what you actually use immediately.

### `crossorigin` Attribute

Must match how the resource is fetched:

| Resource | Fetch Mode | Preload Attribute |
|----------|------------|-------------------|
| Font | Anonymous CORS | `crossorigin` (no value) |
| Image (same-origin) | No CORS | None |
| Script (module) | CORS | `crossorigin` |

### Cache Implications

Preloaded resources follow normal caching. If already cached, preload has no effect.

## Performance Impact

### Metrics Improved

- **LCP** — Faster largest contentful paint
- **FCP** — Earlier first paint (critical CSS)
- **TTI** — Faster time to interactive (JS)

### Metrics to Watch

- **Total Bytes** — Don't preload too much
- **Connection Count** — Preconnect reduces

## Related

- [Critical CSS Generator](critical-css.md) — CSS to inline/preload
- [API Reference](../api/README.md) — Full endpoint documentation
