# CSS Extraction Flow

This document describes how the Critical CSS Generator extracts and processes CSS from a target URL.

## Overview

The tool analyzes a webpage to extract its CSS, then processes it through a pipeline that produces three outputs:
1. **Combined & Minified CSS** — All stylesheets merged and optimized
2. **Critical CSS** — Only the CSS needed for visible content
3. **Stylesheet Metadata** — Size and source information for each stylesheet

## Step-by-Step Flow

### Step 1: User Input
**File:** `src/app/page.js`

User enters a URL and selects a mode:
- **Above-the-Fold Mode** (default) — Extract CSS only for viewport-visible content
- **Full Mode** — Extract CSS for the entire page

```
User → URL input → Form submit → API call
```

### Step 2: API Request
**File:** `src/app/page.js:86-120`

The client makes a GET request to the API endpoint:
```
GET /api/fetch-css?url=<encoded-url>&mode=<above-fold|full>
```

### Step 3: Browser Launch
**File:** `src/pages/api/fetch-css.js:217-219`

Puppeteer launches a headless browser:
- **Development:** Uses local Chrome installation via `puppeteer`
- **Production:** Uses `@sparticuz/chromium` for Vercel serverless

```javascript
const launchOptions = await getBrowserOptions();
browser = await puppeteer.launch(launchOptions);
```

### Step 4: Page Navigation
**File:** `src/pages/api/fetch-css.js:220-225`

The browser navigates to the target URL:
```javascript
await page.goto(url, {
  waitUntil: "networkidle2",  // Wait until network is idle
  timeout: 30000,             // 30 second timeout
});
```

### Step 5: Viewport Configuration
**File:** `src/pages/api/fetch-css.js:227-230`

Sets viewport to standard desktop dimensions (1280x800):
```javascript
await page.setViewport({
  width: VIEWPORT_CONFIG.width,
  height: VIEWPORT_CONFIG.height,
});
```

### Step 6: HTML Capture
**File:** `src/pages/api/fetch-css.js:232-236`

Captures HTML content based on mode:
- **Full mode:** Captures entire page HTML
- **Above-fold mode:** Captures only viewport-visible HTML via `captureAboveTheFoldHTML()`

```javascript
const fullHtmlContent = await page.content();
const htmlForPurge = mode === "above-fold"
  ? await captureAboveTheFoldHTML(page, { skipViewportSet: true })
  : fullHtmlContent;
```

### Step 7: Stylesheet Discovery
**File:** `src/pages/api/fetch-css.js:238-242`

Extracts URLs of all external stylesheets from the page:
```javascript
const cssLinks = await page.evaluate(() => {
  return Array.from(
    document.querySelectorAll('link[rel="stylesheet"]')
  ).map((link) => link.href);
});
```

**Current limitation:** Only discovers `<link rel="stylesheet">` tags. Does not extract inline `<style>` tags.

### Step 8: Browser Cleanup
**File:** `src/pages/api/fetch-css.js:244-245`

Browser is closed immediately after data collection to free resources:
```javascript
await browser.close();
browser = undefined;
```

### Step 9: Stylesheet Fetching
**File:** `src/pages/api/fetch-css.js:253-268`

Fetches all stylesheet contents in parallel:
```javascript
const settledResults = await Promise.allSettled(
  cssLinks.map((cssUrl, index) => fetchStylesheet(cssUrl, index))
);
```

Uses `Promise.allSettled` to handle individual failures gracefully — if one stylesheet fails to load, others still proceed.

### Step 10: CSS Processing Pipeline
**File:** `src/pages/api/fetch-css.js:274-277`

Processes CSS through PostCSS plugins:

```javascript
const [minifiedCss, criticalCss] = await Promise.all([
  processCss(combinedCss),           // Minification
  generateCriticalCss(combinedCss, htmlForPurge),  // Purging
]);
```

#### Minification Pipeline
**File:** `src/pages/api/fetch-css.js:94-99`
```
Combined CSS → Autoprefixer → CSSnano → Minified CSS
```

#### Critical CSS Pipeline
**File:** `src/pages/api/fetch-css.js:107-113`
```
Combined CSS + HTML → PurgeCSS → Autoprefixer → CSSnano → Critical CSS
```

PurgeCSS removes any CSS selectors not found in the HTML content.

### Step 11: Size Calculation
**File:** `src/pages/api/fetch-css.js:279-291`

Calculates byte sizes and reduction percentages:
```javascript
const originalSize = new TextEncoder().encode(combinedCss).length;
const minifiedSize = new TextEncoder().encode(minifiedCss).length;
const criticalSize = new TextEncoder().encode(criticalCss).length;

const minifiedReduction = Math.round((1 - minifiedSize / originalSize) * 100);
const criticalReduction = Math.round((1 - criticalSize / originalSize) * 100);
```

### Step 12: Response
**File:** `src/pages/api/fetch-css.js:293-309`

Returns JSON response:
```json
{
  "minified": "...",
  "unminified": "...",
  "critical": "...",
  "stylesheets": [
    { "id": 1, "url": "...", "filename": "...", "size": 1234, "sizeFormatted": "1.2 KB" }
  ],
  "mode": "above-fold",
  "sizes": {
    "original": 50000,
    "originalFormatted": "48.8 KB",
    "minified": 35000,
    "minifiedFormatted": "34.2 KB",
    "critical": 8000,
    "criticalFormatted": "7.8 KB",
    "minifiedReduction": 30,
    "criticalReduction": 84
  }
}
```

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INPUT                                │
│                     URL + Mode Selection                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER AUTOMATION                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Launch      │→ │ Navigate    │→ │ Set Viewport            │  │
│  │ Puppeteer   │  │ to URL      │  │ (1280x800)              │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                                              │                   │
│                                              ▼                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               CONTENT EXTRACTION                         │    │
│  │  • Capture HTML (full or above-fold)                    │    │
│  │  • Find all <link rel="stylesheet"> URLs                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STYLESHEET FETCHING                            │
│           Parallel HTTP requests to stylesheet URLs              │
│                  (Promise.allSettled)                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CSS PROCESSING                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐   │
│  │    MINIFICATION         │  │    CRITICAL CSS             │   │
│  │  Combined CSS           │  │  Combined CSS + HTML        │   │
│  │       ↓                 │  │       ↓                     │   │
│  │  Autoprefixer           │  │  PurgeCSS (remove unused)   │   │
│  │       ↓                 │  │       ↓                     │   │
│  │  CSSnano (minify)       │  │  Autoprefixer               │   │
│  │       ↓                 │  │       ↓                     │   │
│  │  Minified CSS           │  │  CSSnano (minify)           │   │
│  └─────────────────────────┘  │       ↓                     │   │
│                               │  Critical CSS               │   │
│                               └─────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      JSON RESPONSE                               │
│  { minified, critical, stylesheets[], sizes{} }                 │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling

| Scenario | Handling |
|----------|----------|
| Invalid URL | 400 response with error message |
| Navigation timeout | 500 response with timeout error |
| No stylesheets found | 200 response with empty CSS and message |
| Individual stylesheet fetch fails | Logged, other stylesheets still processed |
| PostCSS processing fails | 500 response with processing error |

## Performance Characteristics

| Metric | Typical Value |
|--------|---------------|
| Cold start (serverless) | 2-3 seconds |
| Page navigation | 5-15 seconds |
| CSS processing | 1-3 seconds |
| Total execution | 10-30 seconds |
| Max timeout | 30 seconds |
