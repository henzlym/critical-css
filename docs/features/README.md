# Features Overview

Speedkit includes the following optimization tools:

| Feature | Status | Description |
|---------|--------|-------------|
| [Critical CSS Generator](critical-css.md) | ✅ Live | Extract above-the-fold CSS |
| [Preload Tag Generator](preload-tags.md) | ✅ Live | Generate resource hints |
| [Above-the-fold Mode](above-the-fold.md) | ✅ Live | Viewport-aware extraction |

---

## Critical CSS Generator

**Route:** `/`  
**API:** `GET /api/fetch-css`

Extracts and optimizes CSS from any webpage. Identifies only the styles needed for initial render, reducing CSS payload by 70-90%.

[Full documentation →](critical-css.md)

### Key Capabilities

- Discovers all linked stylesheets
- Combines multiple files into one
- Purges unused selectors based on HTML
- Minifies with CSSnano
- Provides before/after size comparison

---

## Preload Tag Generator

**Route:** `/preload`  
**API:** `GET /api/fetch-css` (returns `preloadTags` field)

Analyzes page resources and generates optimized `<link rel="preload">` tags for faster loading.

[Full documentation →](preload-tags.md)

### Key Capabilities

- Identifies critical fonts, images, and scripts
- Generates preload tags with correct attributes
- Includes preconnect for third-party origins
- Prioritizes LCP-relevant resources

---

## Above-the-fold Mode

**Route:** `/` (checkbox toggle)  
**API:** `GET /api/fetch-css?mode=above-fold`

Restricts CSS extraction to only elements visible in the initial viewport.

[Full documentation →](above-the-fold.md)

### Key Capabilities

- Viewport-height detection (900px default)
- Clones only visible DOM elements
- Produces smaller critical CSS
- Optimizes for LCP/FCP metrics
