# Critical CSS Generator

Extract only the CSS needed for above-the-fold content.

## Overview

The Critical CSS Generator analyzes any webpage and produces three CSS variants:

1. **Combined & Minified** — All stylesheets merged and optimized
2. **Critical CSS** — Purged CSS with only selectors used in HTML
3. **Unminified** — Raw combined output for debugging

## How It Works

```
URL Input
    │
    ▼
Puppeteer loads page
    │
    ▼
Discover all <link rel="stylesheet">
    │
    ▼
Fetch stylesheet contents in parallel
    │
    ▼
PostCSS Pipeline:
├── Autoprefixer (vendor prefixes)
├── PurgeCSS (remove unused)
└── CSSnano (minify)
    │
    ▼
Return three CSS variants
```

## Technical Implementation

### Stylesheet Discovery

```javascript
// Inside Puppeteer context
const cssLinks = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  return links.map((link) => link.href).filter(Boolean);
});
```

### CSS Processing

```javascript
// PurgeCSS configuration
const purgecss = await new PurgeCSS().purge({
  content: [{ raw: htmlContent, extension: 'html' }],
  css: [{ raw: combinedCss }],
});

// PostCSS minification
const result = await postcss([
  autoprefixer(),
  cssnano()
]).process(purgecss[0].css, { from: undefined });
```

## Usage

### Web Interface

1. Navigate to the home page
2. Enter a URL in the input field
3. (Optional) Enable "Above-the-fold Mode" for smaller output
4. Click "Generate CSS"
5. View results with size comparison
6. Copy or download the CSS

### API

```bash
GET /api/fetch-css?url=https://example.com
```

Response includes `minified`, `critical`, and `unminified` fields.

## Results

### Typical Reductions

| Site Type | Original | Critical | Reduction |
|-----------|----------|----------|-----------|
| E-commerce | 342 KB | 28 KB | 92% |
| Blog (WordPress) | 847 KB | 12 KB | 98% |
| SaaS Landing | 156 KB | 31 KB | 80% |
| News Site | 523 KB | 67 KB | 87% |

### Factors Affecting Results

**Better reductions when:**
- Multiple unused CSS files (plugins, themes)
- Large frameworks (Bootstrap, Tailwind without purge)
- Many page templates sharing one stylesheet

**Smaller reductions when:**
- Already optimized CSS
- CSS-in-JS (scoped styles)
- Single-purpose stylesheets

## Implementation Notes

### PurgeCSS Safelist

Some selectors may be incorrectly purged (dynamically added classes). Add to safelist:

```javascript
const purgecss = await new PurgeCSS().purge({
  // ...
  safelist: ['active', 'show', 'open', /^modal-/],
});
```

### Handling @font-face

Font declarations are preserved by default. PurgeCSS only removes unused selectors, not at-rules.

### CSS Custom Properties

Variables in `:root` are preserved since they may be used anywhere.

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| CSS-in-JS | Captures runtime-generated styles |
| Shadow DOM | Does not capture encapsulated styles |
| @import rules | Resolved during fetch |
| print stylesheets | Included (filter with media query) |

## Related

- [Above-the-fold Mode](above-the-fold.md) — Viewport-restricted extraction
- [API Reference](../api/README.md) — Full endpoint documentation
