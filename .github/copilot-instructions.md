# Copilot Instructions for Critical CSS Generator

## Project Overview

A Next.js 14 web tool that extracts and generates critical CSS from any URL. It uses Puppeteer to fetch page content, PurgeCSS to identify used styles, and PostCSS pipeline for optimization.

## Architecture

### Data Flow
1. User enters URL → `src/app/page.js` (React client component)
2. API call → `src/pages/api/fetch-css.js` (Next.js API route)
3. Puppeteer fetches the target page and extracts all linked stylesheets
4. PurgeCSS removes unused CSS based on actual HTML content
5. PostCSS pipeline (autoprefixer + cssnano) optimizes output
6. Returns: `{ minified, unminified, critical }` CSS variants

### Key Files
- [src/pages/api/fetch-css.js](src/pages/api/fetch-css.js) - Core CSS extraction logic with Puppeteer + PurgeCSS
- [src/app/page.js](src/app/page.js) - Main UI with WordPress components
- [src/app/components/file-view.js](src/app/components/file-view.js) - DataViews component for listing extracted CSS files (in development)

## Tech Stack & Conventions

### UI Components
Uses **WordPress components** (`@wordpress/components`, `@wordpress/dataviews`) instead of typical React UI libraries:
```javascript
import { Button, TextControl } from "@wordpress/components";
import "@wordpress/components/build-style/style.css";
```

### CSS Processing Pipeline
PostCSS plugins in use:
- `@fullhuman/postcss-purgecss` - Tree-shake unused CSS
- `autoprefixer` - Vendor prefixes
- `cssnano` - Minification
- `postcss-discard-duplicates` - Remove duplicate rules

### Next.js Structure
- Uses App Router (`src/app/`) for pages/layouts
- Uses Pages Router (`src/pages/api/`) for API routes (hybrid approach)
- Client components marked with `"use client"` directive

## Development Commands

```bash
npm run dev    # Start dev server at localhost:3000
npm run build  # Production build
npm run lint   # ESLint check
```

## Important Patterns

### API Route Pattern
API routes receive URL as query param and return JSON with multiple CSS variants:
```javascript
// Request: /api/fetch-css?url=https://example.com
// Response: { minified, unminified, critical, message }
```

### Puppeteer Configuration
Launched with sandbox disabled for compatibility:
```javascript
await puppeteer.launch({
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
```

### Above-the-fold Detection
The `captureAboveTheFoldHTML` function in fetch-css.js clones only DOM elements visible within 900px viewport height - useful for critical CSS extraction (currently commented out but available).

## Planned Features

### File View - Extracted Stylesheets List
The `FileView` component will display a table of all CSS files extracted from a page URL, showing:
- Stylesheet URL/filename
- File size
- Whether it was included in critical CSS output

## Gotchas

- WordPress component styles must be explicitly imported: `@wordpress/components/build-style/style.css`
- API route uses `from: undefined` in PostCSS to suppress source map warnings
