# Above-the-fold Mode

Restrict CSS extraction to only visible viewport content.

## Overview

Above-the-fold mode captures only the DOM elements visible within the initial viewport, producing smaller critical CSS optimized for first paint.

**Default viewport:** 1440 × 900px

## How It Works

```
Page Load
    │
    ▼
Wait for DOM ready
    │
    ▼
Calculate viewport boundary
    │
    ▼
Clone only visible elements
    │
    ▼
Extract CSS for cloned HTML
```

## Technical Implementation

### Viewport Configuration

```javascript
export const VIEWPORT_CONFIG = {
  desktop: { width: 1440, height: 900 },
  // Future: mobile, tablet variants
};
```

### DOM Cloning Logic

```javascript
export async function captureAboveTheFoldHTML(page, options = {}) {
  const viewportHeight = options.viewportHeight || 900;
  
  return page.evaluate((vh) => {
    const clone = document.documentElement.cloneNode(false);
    const body = document.body.cloneNode(false);
    
    function isAboveFold(el) {
      const rect = el.getBoundingClientRect();
      return rect.top < vh && rect.bottom > 0;
    }
    
    function cloneVisible(source, target) {
      for (const child of source.children) {
        if (isAboveFold(child)) {
          const cloned = child.cloneNode(true);
          target.appendChild(cloned);
        }
      }
    }
    
    cloneVisible(document.body, body);
    clone.appendChild(body);
    
    return clone.outerHTML;
  }, viewportHeight);
}
```

## Usage

### Web Interface

1. Navigate to home page (`/`)
2. Enter URL to analyze
3. Check "Above-the-fold Mode" checkbox
4. Click "Generate CSS"

### API

```bash
GET /api/fetch-css?url=https://example.com&mode=above-fold
```

## Results Comparison

| Mode | CSS Size | Use Case |
|------|----------|----------|
| `full` | Larger | Complete page styles |
| `above-fold` | Smaller | Inline critical CSS |

### Example

```
Site: example-blog.com
├── Full mode:        45 KB critical
└── Above-fold mode:  12 KB critical (73% smaller)
```

## Edge Cases

### Sticky/Fixed Elements

Fixed-position elements (headers, navs) are always considered "above fold" since they're visible on initial load.

### Lazy-loaded Content

Elements with `loading="lazy"` or hidden by JavaScript may be excluded since they're not in the initial DOM.

### Dynamic Height

Content that changes height after load (accordions, tabs) uses initial collapsed state.

### Infinite Scroll

Only captures initially loaded items.

## Limitations

1. **JavaScript-dependent content** — Elements added via JS after DOMContentLoaded may be missed
2. **CSS animations** — Animation keyframes may be incorrectly purged
3. **Hover states** — Styles for `:hover`, `:focus` on below-fold elements removed

## Configuration Options

```javascript
captureAboveTheFoldHTML(page, {
  viewportHeight: 900,      // Fold boundary
  skipViewportSet: false,   // Skip if already set
});
```

## When to Use

**Use above-fold mode when:**
- Generating CSS for inline `<style>` tag
- Optimizing LCP/FCP metrics
- Page has lots of below-fold content

**Use full mode when:**
- Need complete stylesheet backup
- Single-page apps with routing
- Uncertain about fold boundary

## Related

- [Critical CSS Generator](critical-css.md) — Full extraction flow
- [API Reference](../api/README.md) — Mode parameter details
