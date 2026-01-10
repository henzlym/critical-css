# Architecture Overview

This document describes the system architecture of Speedkit.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Critical    │  │ Preload     │  │ Future Tools            │  │
│  │ CSS Page    │  │ Tags Page   │  │ (Core Web Vitals, etc.) │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
│         │                │                      │                │
│         └────────────────┼──────────────────────┘                │
│                          │                                       │
│                          ▼                                       │
│               ┌─────────────────────┐                           │
│               │   Shared Components  │                           │
│               │   (UI, utilities)    │                           │
│               └──────────┬──────────┘                           │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼ HTTP Request
┌──────────────────────────────────────────────────────────────────┐
│                         SERVER                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    API Routes                               │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │                /api/fetch-css                        │   │  │
│  │  │  • Validates URL                                     │   │  │
│  │  │  • Orchestrates analysis                             │   │  │
│  │  │  • Returns optimized CSS + metadata                  │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Feature Modules                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │  │
│  │  │ above-the-   │  │ preload-     │  │ [future         │  │  │
│  │  │ fold/        │  │ generator/   │  │  modules]       │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └─────────────────┘  │  │
│  └─────────┼─────────────────┼────────────────────────────────┘  │
│            │                 │                                    │
│            ▼                 ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    External Services                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │  │
│  │  │  Puppeteer   │  │   PostCSS    │  │    PurgeCSS      │  │  │
│  │  │  (Browser)   │  │  (Transform) │  │    (Purge)       │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app/                      # Next.js App Router (Client)
│   ├── layout.js             # Root layout with metadata
│   ├── globals.css           # Global styles
│   ├── page.js               # Critical CSS Generator page
│   ├── preload/
│   │   └── page.js           # Preload Tags page
│   └── components/
│       ├── css-result-section.js
│       ├── file-view.js
│       ├── icons.js
│       └── instructions-drawer.js
│
├── lib/                      # Shared libraries
│   └── features/             # Feature modules
│       ├── index.js          # Feature exports
│       ├── above-the-fold/
│       │   └── index.js      # Viewport capture logic
│       └── preload-generator/
│           └── index.js      # Preload tag generation
│
└── pages/                    # Next.js Pages Router (API)
    └── api/
        └── fetch-css.js      # Main API endpoint
```

## Request Flow

```
1. User enters URL
        │
        ▼
2. Client validates input
        │
        ▼
3. POST /api/fetch-css?url=<url>&mode=<mode>
        │
        ▼
4. Server launches Puppeteer
        │
        ▼
5. Navigate to URL, wait for load
        │
        ▼
6. Extract HTML + discover stylesheets
        │
        ▼
7. Fetch all stylesheet contents
        │
        ▼
8. Process through PostCSS pipeline
   ├── Autoprefixer
   ├── CSSnano (minify)
   └── PurgeCSS (critical only)
        │
        ▼
9. Generate preload tags (if requested)
        │
        ▼
10. Return JSON response
    {
      minified: "...",
      critical: "...",
      stylesheets: [...],
      sizes: {...},
      preloadTags: {...}
    }
```

## Key Design Decisions

See [Architecture Decision Records](decisions.md) for detailed rationale.

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 14 | API routes + React frontend in one project |
| Browser automation | Puppeteer | Industry standard, reliable, good API |
| CSS processing | PostCSS | Flexible plugin pipeline |
| Unused CSS removal | PurgeCSS | Best-in-class, actively maintained |
| Deployment | Vercel | Native Next.js support, edge functions |

## Environment Configuration

```bash
# Development
NODE_ENV=development
# Uses local Puppeteer

# Production (Vercel)
NODE_ENV=production
# Uses @sparticuz/chromium for serverless
```

## Performance Considerations

1. **Puppeteer cold starts** — Serverless environments have ~2-3s cold start
2. **Stylesheet fetching** — Parallel fetches with Promise.allSettled
3. **Memory** — Large stylesheets processed in streaming fashion
4. **Timeout** — 30s max execution (Vercel limit)
