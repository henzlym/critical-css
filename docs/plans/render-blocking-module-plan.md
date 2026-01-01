# Plan: Core Web Vitals - Actionable Recommendations System

## Status: In Progress - Phase 1: Initial Understanding

## User Request Summary
Build a Core Web Vitals improvement system that prioritizes actionable recommendations over scores. Starting with render-blocking resources as the first module.

### Key Requirements
- Focus on actionable steps, not just scores
- Identify render-blocking resources with specific details
- Provide placement recommendations (head/body/footer)
- Script optimization suggestions (defer/async/lazy-load)
- Code examples with copy-to-clipboard functionality
- Downloadable implementation files
- Handle different script types: tracking, widgets, chatbots, popups, cookie banners
- Modular approach: each performance issue gets its own page
- Start with render-blocking resources module

### Research Targets
1. NitroPack - Learn their performance optimization approach
2. WebPageTest.org - Understand their detailed analysis methods (reference only, not using their API)

## Phase 1: Exploration - COMPLETED

### Current Codebase Structure

**API Route:** [src/pages/api/fetch-css.js](src/pages/api/fetch-css.js)
- Uses Puppeteer (serverless-ready with @sparticuz/chromium)
- Current viewport: 1280x900
- Navigation timeout: 30 seconds
- Wait condition: networkidle2
- Currently ONLY extracts and processes CSS (no CWV metrics collected yet)

**Main Page Component:** [src/app/page.js](src/app/page.js)
- Client component with collapsible result sections
- Copy-to-clipboard and download functionality
- Instructions drawer integration
- Glassmorphic design with radial gradients

**Key Dependencies:**
- puppeteer v22.13.1 + puppeteer-core v24.34.0
- @sparticuz/chromium v143.0.0
- postcss, autoprefixer, cssnano for CSS processing

### Research Findings

#### NitroPack Methodology
**Key Learnings:**
1. **Script Differentiation**: Distinguishes between tracking pixels, Google Tag Manager, and standard scripts
2. **Deferred Loading**: Sequential loading after critical rendering, using marker-based system with data attributes
3. **Resource Discovery**: Automatic categorization with mutation observers
4. **Timing Controls**: Configurable delays and throttling
5. **Worker-Based Processing**: Non-blocking operations for optimization

**Notable Approach**: Service-layer injection (automatic) rather than user-facing code examples

#### WebPageTest Analysis Methods
**Detection Technology:**
- Uses Chrome's native `renderBlocking` flag (Chrome 91+) for accuracy
- Categories: "blocking", "in_body_parser_blocking", "dynamically_injected_non_blocking", "potentially_blocking"

**Visualization:**
- Color-coded waterfall with purple highlighting for blocking resources
- Small "X" marker for render-blocking items
- Domain breakdown for third-party analysis
- JavaScript waterfall charts showing execution impact

**Third-Party Analysis:**
- Categories: Advertising, Analytics, A/B Testing
- Block-testing capability (blockDomains command)
- Detailed execution time tracking
- Origin-based content breakdown

**Key Insight**: Focus on resources loaded before "Start Render" line

### Script Types to Consider

Based on research, we should handle:

1. **Analytics & Tracking**: Google Analytics, Facebook Pixel, Segment, Mixpanel, Hotjar
2. **Advertising**: Google Ads, Media.net, AdSense, programmatic ad networks
3. **A/B Testing**: Optimizely, VWO, Google Optimize
4. **Chat Widgets**: Intercom, Drift, Zendesk, LiveChat, Tawk.to
5. **Popup/Modal Scripts**: OptinMonster, Sumo, cookie consent banners (OneTrust, CookieBot)
6. **Social Media Widgets**: Facebook SDK, Twitter widgets, Instagram embeds
7. **CDN Libraries**: jQuery, Bootstrap, Font Awesome from CDNs
8. **Tag Managers**: Google Tag Manager, Adobe Tag Manager
9. **CRM & Marketing**: HubSpot, Marketo, Salesforce tracking
10. **Performance/Monitoring**: New Relic, Sentry, DataDog RUM
11. **Fonts**: Google Fonts, Adobe Fonts, custom web fonts
12. **Maps**: Google Maps, Mapbox
13. **Video Players**: YouTube embeds, Vimeo, Wistia
14. **Payment Gateways**: Stripe.js, PayPal SDK
15. **Customer Support**: Help Scout, Freshdesk

## Phase 2: Clarifying Questions - COMPLETED

### User Decisions
1. **Page Structure**: Separate dedicated page (/render-blocking route)
2. **Script Detection**: Domain-based detection with maintained domain list
3. **Download Format**: Copy-to-clipboard code examples only (no file downloads for now)
4. **Detail Level**: Simple recommendations with best practices (Critical/Interactive/Non-essential)

## Phase 3: Design Planning - COMPLETED

The Plan agent has created a comprehensive implementation design. Key insights:

- Reuse existing Puppeteer infrastructure from fetch-css.js
- Extend with Chrome DevTools Protocol for render-blocking detection
- Domain-based third-party script detection with JSON vendor database
- Simple 3-tier recommendation system: Critical/Interactive/Non-essential
- Modular architecture for future CWV features
- Copy-to-clipboard code examples (no downloads)

## Phase 4: Final Implementation Plan

### Overview
Build a Render-Blocking Resources Analysis module as the first step in a comprehensive Core Web Vitals improvement system. Focus on actionable recommendations over scores, starting with a standalone page at `/render-blocking`.

---

### 1. NEW FILES TO CREATE

#### 1.1 API Route: `/src/pages/api/analyze-render-blocking.js`
**Purpose**: Analyze render-blocking resources using Puppeteer + CDP

**Key Functions**:
- Reuse Puppeteer setup from `fetch-css.js` (same browser config, viewport, timeout)
- Navigate to URL and collect all scripts/stylesheets
- Extract resource data via `page.evaluate()`:
  - All `<script>` tags: src, async/defer attributes, position (head/body), inline content
  - All `<link rel="stylesheet">`: href, media attribute, position
  - Performance Resource Timing data
- Use Chrome DevTools Protocol for render-blocking detection (with heuristic fallback)
- Match third-party scripts against vendor database
- Generate recommendations using rules engine
- Return structured JSON with scripts, stylesheets, insights

**Data Collection Strategy**:
```javascript
// In page.evaluate()
- Map all scripts: { src, isInline, async, defer, type, position, textContent }
- Map all stylesheets: { href, media, position }
- Get performance.getEntriesByType('resource') for timing data
```

**Response Format**:
```json
{
  "url": "...",
  "summary": { totalScripts, renderBlockingScripts, thirdPartyScripts, ... },
  "scripts": [
    {
      "id": "...",
      "src": "...",
      "category": "analytics",
      "vendor": "Google Analytics",
      "position": { location: "head", index: 2 },
      "loading": { strategy: "none", isBlocking: true },
      "recommendation": {
        "criticality": "non-essential",
        "suggestedStrategy": "lazy-load",
        "suggestedPosition": "body-end",
        "reason": "...",
        "codeExample": "<script>...</script>"
      }
    }
  ],
  "insights": {
    "totalBlockingTime": 450,
    "potentialSavings": 320,
    "mainIssues": ["..."]
  }
}
```

---

#### 1.2 Vendor Database: `/src/lib/third-party-vendors.json`
**Purpose**: Domain-to-category mappings for third-party script detection

**Structure**:
```json
{
  "analytics": {
    "google-analytics.com": {
      "name": "Google Analytics",
      "criticality": "non-essential",
      "loadStrategy": "lazy-load",
      "description": "Web analytics tracking"
    },
    "googletagmanager.com": { ... },
    "segment.com": { ... },
    "mixpanel.com": { ... },
    "hotjar.com": { ... }
  },
  "chat": {
    "intercom.io": { ... },
    "drift.com": { ... },
    "zendesk.com": { ... },
    "tawk.to": { ... }
  },
  "consent": {
    "onetrust.com": { "criticality": "critical", ... },
    "cookiebot.com": { ... }
  },
  "ab_testing": {
    "optimizely.com": { "criticality": "critical", ... },
    "vwo.com": { ... }
  },
  ... (advertising, social, cdn, fonts, maps, video, payments, monitoring, crm)
}
```

**Categories to Include**:
1. Analytics (GA, Segment, Mixpanel, Hotjar, Facebook Pixel)
2. Advertising (Google Ads, AdSense)
3. A/B Testing (Optimizely, VWO)
4. Chat (Intercom, Drift, Zendesk, LiveChat, Tawk.to)
5. Consent/Cookies (OneTrust, CookieBot)
6. Social (Facebook SDK, Twitter, Instagram)
7. CDN (Cloudflare, jQuery CDN, unpkg)
8. Fonts (Google Fonts, Adobe Fonts)
9. Maps (Google Maps, Mapbox)
10. Video (YouTube, Vimeo, Wistia)
11. Payments (Stripe, PayPal)
12. Monitoring (Sentry, New Relic, DataDog)
13. CRM (HubSpot, Marketo, Salesforce)

---

#### 1.3 Domain Matcher: `/src/lib/domain-matcher.js`
**Purpose**: Match script URLs to vendor database entries

**Key Function**:
```javascript
export function matchVendor(url) {
  // Parse URL hostname
  // Match against vendor database (exact match, wildcard, subdomain)
  // Return { category, name, criticality, loadStrategy }
  // Return "unknown" if no match
}
```

**Matching Logic**:
- Exact domain match: `google-analytics.com`
- Subdomain match: `*.facebook.com`
- Path pattern match: `facebook.net/*/fbevents.js`

---

#### 1.4 Recommendation Engine: `/src/lib/recommendation-engine.js`
**Purpose**: Generate actionable recommendations for each script

**Rules Engine**:
```javascript
function generateRecommendation(script) {
  // Rule 1: Inline script analysis (config/init = critical)
  // Rule 2: Category-based rules (analytics = lazy, consent = critical)
  // Rule 3: Position/strategy analysis (head + sync = issue)
  // Rule 4: Generate code example
  return { criticality, suggestedStrategy, reason, codeExample }
}
```

**3-Tier Criticality System**:
- **Critical**: Essential for initial render (core libs, A/B testing, consent banners)
  - Placement: `<head>` or early `<body>`
  - Strategy: Synchronous or defer
- **Interactive**: UI features, non-blocking functionality (ads, social widgets)
  - Placement: End of `<body>`
  - Strategy: `defer` attribute
- **Non-essential**: Tracking, analytics, chat widgets
  - Placement: End of `<body>`
  - Strategy: Lazy-load (on scroll/interaction/timeout)

**Scoring**: Render-blocking score 1-10 based on position, strategy, size

---

#### 1.5 Code Templates: `/src/lib/code-templates.js`
**Purpose**: Generate copy-ready code examples

**Templates**:
```javascript
export const codeTemplates = {
  lazyLoad: (src, trigger) => `<!-- Load on ${trigger} -->...`,
  defer: (src) => `<script defer src="${src}"></script>`,
  async: (src) => `<script async src="${src}"></script>`,
  preload: (src) => `<link rel="preload" href="${src}" as="script">...`,
  gtmOptimized: () => `<!-- Optimized GTM with delayed load -->...`,
  gaOptimized: () => `<!-- Optimized GA with lazy load -->...`
}
```

**Special Templates for Common Vendors**:
- Google Tag Manager: Load on interaction with fallback
- Google Analytics: Scroll-triggered or timeout-based
- Generic lazy-load: Multiple trigger options

---

#### 1.6 Page Component: `/src/app/render-blocking/page.js`
**Purpose**: Main UI for render-blocking analysis

**Component Structure**:
```
RenderBlockingPage
├── Hero section (reuse pattern from main page)
├── URL input form (reuse FormInput component)
├── LoaderOrb (reuse from main page)
└── Results section
    ├── SummaryDashboard
    │   ├── TotalScripts card
    │   ├── BlockingResources card
    │   └── PotentialSavings card
    ├── MainIssues list
    └── ScriptsList (grouped by category)
        └── CategoryGroup (collapsible)
            └── ScriptCard (expandable)
                ├── Header: vendor name, domain, badges
                ├── Current state: position, strategy, size
                ├── Recommendation: criticality, strategy, reason
                └── CodeExample with copy button
```

**State Management**:
```javascript
- url: string
- results: object (API response)
- loading: boolean
- error: string | null
- expandedCategories: object (which categories are open)
- expandedScripts: object (which script cards are expanded)
```

**UI Patterns to Reuse**:
- Glassmorphic design from `globals.css`
- Collapsible sections from main page
- Copy-to-clipboard pattern from main page
- Loading orb animation

---

#### 1.7 UI Components

**Create: `/src/app/components/summary-dashboard.js`**
- Grid of 3 summary cards
- Total scripts, blocking resources, potential savings
- Color-coded badges (warning for issues, success for savings)
- Main issues list below cards

**Create: `/src/app/components/category-group.js`**
- Collapsible category section
- Category icon and name
- Script count badge
- Contains multiple ScriptCard components

**Create: `/src/app/components/script-card.js`**
- Expandable card for each script
- Header: vendor name, domain, category badge, blocking badge
- Details (when expanded):
  - Current implementation table
  - Recommended optimization
  - Reason/explanation
  - CodeExample component (reuse from instructions-drawer)
- Copy button with feedback

**Extract: `/src/app/components/form-input.js`**
- Extract URL input form from main page
- Props: url, onSubmit, loading, placeholder
- Reusable across all analysis pages

**Extract: `/src/app/components/loader-orb.js`**
- Extract animated loader from main page
- Props: text (loading message)

---

### 2. FILES TO MODIFY

#### 2.1 `/src/app/globals.css`
**Changes**: Add new styles for render-blocking analysis UI

**New CSS Sections**:
```css
/* Summary Dashboard */
.summary-dashboard { ... }
.summary-grid { ... }
.summary-card { ... }
.summary-card.warning { ... }
.summary-card.success { ... }

/* Category Groups */
.category-group { ... }
.category-header { ... }

/* Script Cards */
.script-card { ... }
.script-card.has-issue { ... }
.script-header { ... }
.script-badges { ... }

/* Badges */
.badge { ... }
.badge.category { ... }
.badge.warning { ... }
.badge.position { ... }

/* Code Examples */
.recommendation { ... }
.reason { ... }
```

**Design Consistency**:
- Use existing CSS variables (--glass-bg, --neon-accent, etc.)
- Match glassmorphic aesthetic
- Consistent border-radius, transitions, spacing

---

### 3. IMPLEMENTATION PHASES

#### Phase 1: Backend Foundation (Day 1)
1. Create vendor database JSON with ~50-70 popular vendors
2. Build domain matcher utility
3. Create API route with Puppeteer integration
4. Test data collection on sample sites (example.com, news sites, e-commerce)

**Success Criteria**:
- API returns structured script/stylesheet data
- Third-party detection works for major vendors
- Response time < 5 seconds for typical sites

---

#### Phase 2: Recommendation Intelligence (Day 2)
1. Build recommendation engine with rules
2. Implement code template system
3. Add scoring algorithm
4. Test recommendations accuracy

**Success Criteria**:
- Recommendations match manual audits
- Code examples are valid and copy-ready
- Category-based rules work correctly

---

#### Phase 3: UI Components (Days 3-4)
1. Create render-blocking page route
2. Extract reusable components (FormInput, LoaderOrb)
3. Build SummaryDashboard component
4. Build CategoryGroup component
5. Build ScriptCard component
6. Add CSS styles

**Success Criteria**:
- UI matches glassmorphic design
- Collapsible sections work smoothly
- Copy-to-clipboard functional
- Responsive on mobile

---

#### Phase 4: Polish & Testing (Day 5)
1. Error handling and loading states
2. Edge cases (no scripts, timeout, invalid URL)
3. Performance optimization
4. Cross-browser testing
5. Add helpful instructions/tooltips

**Success Criteria**:
- Graceful error messages
- Fast load times
- Works in Chrome, Firefox, Safari
- Clear user guidance

---

### 4. KEY TECHNICAL DECISIONS

**Puppeteer Integration**:
- Reuse existing serverless setup (puppeteer-core + @sparticuz/chromium)
- Same viewport (1280x900), timeout (30s), wait strategy (networkidle2)
- Close browser immediately after data collection to free memory

**Script Detection Approach**:
- Primary: Domain-based matching (fast, reliable)
- Fallback: Heuristics for unknown scripts (position + attributes)
- No content analysis (too slow for MVP)

**Recommendation Logic**:
- Simple category-based rules (not ML/AI)
- Special cases for common vendors (GTM, GA)
- Extensible for future enhancements

**Performance Optimization**:
- Cache vendor database in memory
- Limit concurrent analyses (queue if needed)
- Early browser close
- Efficient DOM queries

**Error Handling**:
- Timeout protection (30s max)
- Invalid URL validation
- Network error graceful degradation
- CDP fallback to heuristics if unavailable

---

### 5. FUTURE EXTENSIBILITY

**Modular Architecture**:
- Shared utilities in `/src/lib/` for reuse
- Vendor database easy to expand (just add entries)
- Recommendation engine rules-based (easy to tune)
- UI components reusable for other CWV modules

**Next Steps After Render-Blocking**:
1. **Image Optimization Analysis** (similar pattern)
2. **Font Loading Analysis** (quick win)
3. **LCP Analysis** (cross-reference with render-blocking)
4. **Full CWV Dashboard** (combine all modules)

**Data Model Considerations**:
- JSON structure ready for future database storage
- Historical tracking possible with minimal changes
- API versioning for backward compatibility

---

### 6. CRITICAL FILES SUMMARY

**New Files** (7):
1. `/src/pages/api/analyze-render-blocking.js` - API route
2. `/src/lib/third-party-vendors.json` - Vendor database
3. `/src/lib/domain-matcher.js` - Domain matching utility
4. `/src/lib/recommendation-engine.js` - Rules engine
5. `/src/lib/code-templates.js` - Code generation
6. `/src/app/render-blocking/page.js` - Main page component
7. `/src/app/components/script-card.js` - Script display component

**Modified Files** (1):
1. `/src/app/globals.css` - Add new styles

**Extracted Components** (3):
1. `/src/app/components/form-input.js` - From main page
2. `/src/app/components/loader-orb.js` - From main page
3. `/src/app/components/summary-dashboard.js` - New
4. `/src/app/components/category-group.js` - New

**Reused Components**:
- CodeBlock (from instructions-drawer.js)
- Collapsible section pattern
- Glassmorphic design system

---

### 7. TESTING STRATEGY

**Test Sites**:
1. Simple site (example.com) - baseline
2. News site (BBC, CNN) - ads + analytics
3. E-commerce (Amazon) - tracking + chat + payments
4. Marketing site - GTM + multiple trackers
5. Blog (WordPress) - common plugins

**Test Cases**:
- No scripts (minimal site)
- 50+ scripts (heavy site)
- Inline scripts with config
- Mixed internal/third-party
- Scripts with async/defer already
- Invalid URLs, timeouts, network errors

---

### 8. SUCCESS METRICS

**User Value**:
- Clear identification of render-blocking resources
- Actionable recommendations with code examples
- Easy copy-to-clipboard functionality
- Visual clarity (badges, categories, color coding)

**Technical Quality**:
- API response time < 5s for 90% of sites
- Vendor detection accuracy > 80% for common scripts
- Zero crashes on edge cases
- Mobile responsive

**Future Readiness**:
- Modular code reusable for other CWV features
- Easy to add new vendors to database
- Scalable architecture for additional analysis types

---

## Research Sources

### NitroPack Methodology
- Focus on automatic categorization and sequential loading
- Marker-based deferred loading system
- Service-layer approach (we're adapting for user-facing recommendations)

### WebPageTest Insights
- [New render blocking indicator in Chrome and WebPageTest](https://www.catchpoint.com/blog/new-render-blocking-indicator-in-chrome-and-webpagetest)
- [Render Blocking Resources Test | SEO Site Checkup](https://seositecheckup.com/tools/render-blocking-resources-test)
- [Using WebPageTest to measure third party apps](https://performance.shopify.com/blogs/blog/using-webpagetest-to-measure-3rd-party-impact)
- [Measuring the Impact of 3rd-Party Tags With WebPageTest](https://andydavies.me/blog/2018/02/19/using-webpagetest-to-measure-the-impact-of-3rd-party-tags/)

**Key Learnings**:
- Chrome's native `renderBlocking` flag for accuracy
- Color-coded waterfall visualization
- Domain breakdown for third-party analysis
- Block-testing capability for impact measurement

---

## End of Plan

This plan provides a complete, step-by-step approach to building the Render-Blocking Resources Analysis module. It focuses on actionable recommendations, reuses existing infrastructure, and sets up a modular foundation for future Core Web Vitals features.
