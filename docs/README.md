# Speedkit Documentation

Welcome to the Speedkit documentation. This guide covers architecture, API reference, features, and development guides.

## Quick Links

| Section | Description |
|---------|-------------|
| [Architecture](architecture/README.md) | System design, data flow, and technical decisions |
| [API Reference](api/README.md) | Endpoint documentation and usage examples |
| [Features](features/README.md) | Detailed feature guides and implementation notes |
| [Roadmap](roadmap.md) | Planned features and project timeline |

## Project Overview

Speedkit is a web performance toolkit built with Next.js 14. It analyzes websites using Puppeteer and provides actionable optimizations.

### Core Principles

1. **Actionable Output** — Generate code, not just reports
2. **Developer-First** — Built by developers, for developers
3. **Performance** — Fast analysis with real-time feedback
4. **Extensibility** — Modular architecture for new features

### Tech Stack

```
Frontend:       Next.js 14 (App Router), React 18
Styling:        CSS Modules, WordPress Components
Analysis:       Puppeteer, PostCSS, PurgeCSS, CSSnano
Deployment:     Vercel, Node.js 18+
```

## Documentation Structure

```
docs/
├── README.md              # This file
├── roadmap.md             # Feature roadmap
├── architecture/
│   ├── README.md          # System overview
│   ├── data-flow.md       # Request/response flow
│   └── decisions.md       # ADRs (Architecture Decision Records)
├── api/
│   ├── README.md          # API overview
│   └── fetch-css.md       # /api/fetch-css endpoint
├── features/
│   ├── README.md          # Features overview
│   ├── critical-css.md    # Critical CSS Generator
│   ├── preload-tags.md    # Preload Tag Generator
│   └── above-the-fold.md  # Viewport detection
└── marketing/
    ├── README.md          # Content strategy
    └── linkedin/          # LinkedIn posts by feature
```

## Contributing to Docs

When adding documentation:

1. Use clear, concise language
2. Include code examples where helpful
3. Link to related docs
4. Keep technical accuracy high
5. Update the relevant README index

## Version

Documentation version: 1.0.0  
Last updated: January 2026
