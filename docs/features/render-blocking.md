# Render-Blocking Resources Analyzer

**Route:** `/render-blocking`
**API:** `GET /api/analyze-render-blocking`

Analyzes scripts on any webpage to identify render-blocking resources and provides actionable optimization recommendations with copy-ready code examples.

---

## Overview

The Render-Blocking Analyzer scans a webpage's scripts and evaluates:

1. **Position** - Where the script is located (head, body-start, body-end)
2. **Loading Strategy** - How it loads (sync, async, defer, module)
3. **Category** - What type of script it is (analytics, chat, fonts, etc.)
4. **SEO Impact** - Whether moving the script would harm SEO or analytics

Based on this analysis, it generates specific recommendations for each script.

---

## Key Capabilities

- Detects all `<script>` tags (inline and external)
- Categorizes scripts by vendor and purpose
- Calculates render-blocking scores (1-10)
- Identifies SEO-critical scripts that should NOT be moved
- Generates copy-ready code examples for optimization
- Groups scripts by category for easier review

---

## How It Works

### 1. Script Discovery

Puppeteer loads the page and extracts all script elements:

```javascript
const scripts = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('script')).map(script => ({
    src: script.src,
    isInline: !script.src,
    textContent: script.textContent,
    type: script.type,
    async: script.async,
    defer: script.defer,
    // ... position data
  }));
});
```

### 2. Script Categorization

Each script is categorized based on URL patterns and content:

| Category | Examples |
|----------|----------|
| `analytics` | Google Analytics, Hotjar, Mixpanel |
| `chat` | Intercom, Drift, Zendesk |
| `advertising` | Google Ads, Facebook Ads |
| `consent` | OneTrust, Cookiebot |
| `social` | Facebook SDK, Twitter widgets |
| `fonts` | Google Fonts, Typekit |
| `cdn` | jQuery, React, lodash |
| `maps` | Google Maps, Mapbox |
| `video` | YouTube, Vimeo embeds |
| `payments` | Stripe, PayPal |
| `monitoring` | Sentry, New Relic |
| `crm` | HubSpot, Salesforce |

### 3. Blocking Score Calculation

Each script receives a score from 1-10 based on:

- **Position weight** (head = +5, body-start = +3, body-end = +1)
- **Loading strategy** (sync = +3, defer = +1, async = +0)
- **File size** (>100KB = +2, >50KB = +1)

Higher scores indicate more severe blocking impact.

### 4. Recommendation Generation

Based on category and current implementation, the engine suggests:

- Whether to add `async` or `defer`
- Whether to move to end of `<body>`
- Whether to lazy-load on interaction
- Whether to keep as-is (for SEO-critical scripts)

---

## SEO-Critical Script Detection

A key feature of the analyzer is detecting scripts that **must remain in `<head>`** for proper SEO, analytics, or legal compliance. Moving these scripts can have serious consequences.

### Categories Detected

#### 1. Structured Data (Schema.org / JSON-LD)

**Impact Level:** HIGH

**Detection Patterns:**
- `@context.*schema.org` - Schema.org context declarations
- `"@type": "FAQPage|Article|Product|..."` - Schema type definitions
- `type="application/ld+json"` - JSON-LD script type attribute

**Why It Matters:**
Search engines (Google, Bing) parse structured data to generate rich snippets in search results - star ratings, FAQ accordions, product prices, recipe cards, etc. If this data is deferred or moved, crawlers may not execute the JavaScript needed to see it, causing rich results to disappear.

**Supported Schema Types:**
- FAQPage
- Article
- Product
- Organization
- WebSite
- BreadcrumbList
- LocalBusiness
- Review
- Event
- Recipe
- HowTo
- VideoObject

**User-Facing Caveat:**
> SEO Impact: Rich snippets and enhanced search results depend on this script being present and parseable by search engine crawlers.

---

#### 2. Google Tag Manager (GTM)

**Impact Level:** MEDIUM

**Detection Patterns:**
- `gtm.start` - GTM initialization code
- `googletagmanager.com/gtm` - GTM script URL
- `GTM-[A-Z0-9]+` - GTM container ID format

**Why It Matters:**
GTM is the central hub for marketing tags, analytics, and conversion tracking. If GTM loads late, it misses tracking users who bounce quickly (often 10-30% of visitors). This leads to underreported traffic and skewed conversion data.

**Recommendation:** Use `async` attribute but keep in `<head>`

**User-Facing Caveat:**
> Analytics Impact: Moving GTM to the end of the body may cause missed pageviews for users who leave quickly (bounce visitors), leading to inaccurate analytics data.

---

#### 3. Google Analytics (GA4 / Universal Analytics)

**Impact Level:** MEDIUM

**Detection Patterns:**
- `gtag('config', ...)` - GA4 configuration
- `google-analytics.com/analytics` - Universal Analytics script
- `googletagmanager.com/gtag` - GA4 via gtag.js
- `ga('create', ...)` - Universal Analytics legacy syntax
- `GoogleAnalyticsObject` - UA global object

**Why It Matters:**
Analytics must fire before users leave to capture pageviews accurately. Delayed loading can miss 10-30% of sessions, particularly from mobile users and those with slow connections who bounce quickly.

**Recommendation:** Use `async` attribute, keep in `<head>`

**User-Facing Caveat:**
> Analytics Impact: Delayed analytics loading may miss 10-30% of pageviews from users who leave within the first few seconds.

---

#### 4. Facebook Pixel (Meta Pixel)

**Impact Level:** MEDIUM

**Detection Patterns:**
- `fbq('init', ...)` - Pixel initialization
- `connect.facebook.net.*fbevents` - Pixel script URL

**Why It Matters:**
Facebook Pixel tracks ad conversions and builds retargeting audiences. Late loading means missed attribution - Facebook won't know which ad brought the visitor, leading to "unknown" conversions and poor ad optimization.

**Recommendation:** Use `async` attribute, keep in `<head>`

**User-Facing Caveat:**
> Marketing Impact: Delayed pixel loading may miss attribution for quick visitors, affecting ad campaign optimization and retargeting.

---

#### 5. Cookie Consent / Privacy Management

**Impact Level:** CRITICAL (Legal Requirement)

**Detection Patterns:**
- `cookieconsent` - Generic consent libraries
- `onetrust` - OneTrust CMP
- `cookiebot` - Cookiebot CMP
- `trustarc` - TrustArc CMP
- `privacymanager` - Various privacy managers

**Why It Matters:**
GDPR (EU) and CCPA (California) **REQUIRE** user consent **BEFORE** tracking begins. If consent loads after analytics/pixels fire, you're collecting data illegally. Fines can reach:
- **GDPR:** Up to €20 million or 4% of global revenue
- **CCPA:** Up to $7,500 per violation

**Recommendation:** MUST be synchronous, MUST be first script in `<head>`. Cannot use `async` or `defer` - this is a legal compliance requirement.

**User-Facing Caveat:**
> Legal Requirement: This script MUST load before other tracking scripts. Moving it could result in compliance violations and potential fines.

---

#### 6. JSON-LD (Detected by Type Attribute)

**Impact Level:** HIGH

**Detection Method:** `type="application/ld+json"` attribute on script tag

**Why It Matters:**
JSON-LD structured data is used by search engines to understand page content and generate rich results. This is the Google-recommended format for structured data.

**User-Facing Caveat:**
> SEO Impact: This structured data powers rich snippets in search results (FAQs, reviews, products, etc.). Removing or breaking it will cause these enhanced listings to disappear.

---

## Detection Logic

The detection process works as follows:

```javascript
function detectSeoCriticalScript(script) {
  // 1. Check type attribute for JSON-LD
  if (script.type === 'application/ld+json') {
    return { type: 'jsonLd', ...SEO_CRITICAL_PATTERNS.jsonLd };
  }

  // 2. Determine what to check
  const contentToCheck = script.isInline
    ? script.textContent  // Check inline content
    : script.src;         // Check external URL

  // 3. Test against each pattern category
  for (const [key, config] of Object.entries(SEO_CRITICAL_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(contentToCheck)) {
        return { type: key, ...config };
      }
    }
  }

  return null; // Not SEO-critical
}
```

---

## UI Behavior

### When Issues Are Found

The dashboard displays:
- Warning-colored summary cards
- List of main issues with explanations
- Grouped scripts with optimization recommendations
- Copy-ready code examples

### When No Issues Are Found (Success State)

The dashboard displays:
- Success-colored summary cards (green theme)
- "No Major Issues Found" message
- Collapsible list of SEO-critical scripts detected
- Explanation of why these scripts should remain in `<head>`

The SEO-critical scripts list is collapsed by default to avoid overwhelming users. They can click to expand and see details about each script and why it's important.

---

## API Response Structure

```json
{
  "scripts": [
    {
      "src": "https://www.googletagmanager.com/gtm.js?id=GTM-XXXXX",
      "category": "analytics",
      "vendor": "Google Tag Manager",
      "position": { "location": "head" },
      "loading": { "strategy": "async" },
      "recommendation": {
        "criticality": "seo-critical",
        "suggestedStrategy": "async",
        "suggestedPosition": "head",
        "hasIssue": false,
        "isSeoCritical": true,
        "seoCriticalType": "gtm",
        "seoCriticalName": "Google Tag Manager",
        "seoImpact": "medium",
        "caveat": "Analytics Impact: Moving GTM to...",
        "reason": "Google Tag Manager initializes...",
        "codeExample": "<script async src=\"...\"></script>"
      }
    }
  ],
  "summary": {
    "totalScripts": 12,
    "thirdPartyScripts": 8,
    "renderBlockingScripts": 2
  },
  "insights": {
    "issueCount": 0,
    "hasNoIssues": true,
    "seoCriticalCount": 3,
    "seoCriticalScripts": [
      { "name": "Google Tag Manager", "caveat": "..." },
      { "name": "Structured Data (Schema.org)", "caveat": "..." }
    ],
    "successMessage": "No render-blocking issues found..."
  }
}
```

---

## Related Files

| File | Purpose |
|------|---------|
| `src/pages/api/analyze-render-blocking.js` | API endpoint |
| `src/lib/recommendation-engine.js` | Core analysis logic |
| `src/lib/issue-explanations.js` | User-facing explanations |
| `src/app/render-blocking/page.js` | React page component |
| `src/app/components/summary-dashboard.js` | Results display |
| `src/app/styles/_render-blocking.scss` | Page-specific styles |

---

## References

- [Google: Structured Data Documentation](https://developers.google.com/search/docs/appearance/structured-data)
- [Google Tag Manager: Implementation Guide](https://support.google.com/tagmanager/answer/6102821)
- [GDPR Cookie Compliance](https://gdpr.eu/cookies/)
- [Web.dev: Render-Blocking Resources](https://web.dev/render-blocking-resources/)
