# Speedkit Roadmap

## Vision

Grow Speedkit from a Critical CSS Generator into a comprehensive web performance toolkit — a collection of tools that don't just audit performance, but provide the actual fixes.

---

## Current Status

### ✅ Released

| Feature | Status | Description |
|---------|--------|-------------|
| Critical CSS Generator | Live | Extract above-the-fold CSS from any URL |
| Preload Tag Generator | Live | Generate optimized resource hints |
| Above-the-fold Mode | Live | Viewport-aware CSS extraction |

---

## Planned Features

### Phase 1: Core Performance Tools (Q1 2026)

#### 🔄 Core Web Vitals Report
**Priority:** High  
**Effort:** 4-6 hours  

Measure and visualize Core Web Vitals metrics:
- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)
- INP (Interaction to Next Paint)
- Visual score gauges
- Pass/fail indicators
- Actionable recommendations

**Value:** Complements existing tools — "Check scores → See problems → Fix with critical CSS"

#### 📋 Image Optimization Analysis
**Priority:** Medium  
**Effort:** 6-8 hours  

Detect image optimization opportunities:
- Identify unoptimized images
- Recommend WebP/AVIF conversion
- Detect missing lazy loading
- Suggest responsive srcset
- Calculate potential savings

### Phase 2: Advanced Analysis (Q2 2026)

#### 📋 Unused CSS Detector
Analyze full stylesheet usage across multiple pages:
- Identify completely unused selectors
- Calculate waste percentage
- Generate cleaned stylesheet

#### 📋 JavaScript Bundle Analyzer
Visualize and optimize JavaScript bundles:
- Bundle size breakdown
- Identify heavy dependencies
- Suggest code splitting opportunities

#### 📋 Font Optimization Guide
Font loading performance analysis:
- Detect render-blocking fonts
- Generate font-display strategies
- Subset recommendations

### Phase 3: Developer Experience (Q3 2026)

#### 📋 API Access
Programmatic access to all tools:
- REST API endpoints
- Rate limiting
- API key authentication

#### 📋 CLI Tool
Command-line interface for CI/CD integration:
- `speedkit analyze <url>`
- JSON output for automation
- GitHub Actions integration

#### 📋 Browser Extension
Quick analysis from any page:
- One-click audit
- Inline recommendations
- Export to Speedkit web app

---

## Feature Request Process

1. Open a GitHub issue with the `feature-request` label
2. Describe the problem it solves
3. Include example use cases
4. Community votes via reactions

---

## Changelog

### v1.0.0 (January 2026)
- Initial release
- Critical CSS Generator
- Preload Tag Generator
- Above-the-fold mode
