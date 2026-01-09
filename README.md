# Speedkit

<p align="center">
  <strong>Your Complete Web Performance Toolkit</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#roadmap">Roadmap</a>
</p>

---

## Overview

Speedkit is a suite of web performance optimization tools that help developers identify and fix performance bottlenecks. Enter any URL and get actionable optimizations — not just audits, but the actual code you need.

**Live Demo:** [speedkit.henzlymeghie.com](https://speedkit.henzlymeghie.com)

## Features

### 🎯 Critical CSS Generator
Extract only the CSS needed for above-the-fold content. Typical results: **70-90% reduction** in initial CSS payload.

- Automatic stylesheet discovery and extraction
- Above-the-fold viewport analysis
- Three output variants: combined, critical, and debug
- File size comparison with reduction percentages

### ⚡ Preload Tag Generator
Generate optimized resource hints for faster loading.

- Analyzes page resources and network requests
- Generates `<link rel="preload">`, `preconnect`, and `dns-prefetch` tags
- Prioritizes LCP-critical assets
- Copy-ready HTML output

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with API routes |
| **Puppeteer** | Headless browser for page analysis |
| **PostCSS** | CSS transformation pipeline |
| **PurgeCSS** | Unused CSS removal |
| **CSSnano** | CSS minification |

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/henzlym/speedkit.git
cd speedkit

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Usage

1. Navigate to the tool you want to use
2. Enter a URL to analyze
3. Click "Generate" and wait for analysis
4. Copy or download the optimized output

## Project Structure

```
speedkit/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.js             # Critical CSS Generator
│   │   ├── preload/            # Preload Tag Generator
│   │   └── components/         # Shared UI components
│   ├── lib/
│   │   └── features/           # Core optimization logic
│   │       ├── above-the-fold/ # Viewport detection
│   │       └── preload-generator/
│   └── pages/
│       └── api/                # API endpoints
├── docs/                       # Documentation
└── public/                     # Static assets
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture/README.md) | System design and technical decisions |
| [API Reference](docs/api/README.md) | API endpoint documentation |
| [Features](docs/features/README.md) | Detailed feature documentation |
| [Roadmap](docs/roadmap.md) | Planned features and improvements |

## Roadmap

### Current
- ✅ Critical CSS Generator
- ✅ Preload Tag Generator
- ✅ Above-the-fold mode

### Planned
- 🔄 Core Web Vitals Report
- 📋 Image Optimization Analysis
- 📋 Unused CSS Detector

See [full roadmap](docs/roadmap.md) for details.

## Performance Results

| Metric | Typical Improvement |
|--------|---------------------|
| Critical CSS Size | 70-90% reduction |
| Stylesheet Requests | 5-10 → 1 file |
| LCP Impact | 200-500ms faster |

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/henzlym/speedkit)

### Other Platforms

Supports any Node.js hosting: Netlify, Railway, Render, AWS, self-hosted.

## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

MIT License — see [LICENSE](LICENSE) for details.

## Author

**Henzly Meghie**  
- Website: [henzlymeghie.com](https://henzlymeghie.com)
- GitHub: [@henzlym](https://github.com/henzlym)
- LinkedIn: [/in/henzlymeghie](https://linkedin.com/in/henzlymeghie)

---

<p align="center">
  Built with ☕ and curiosity
</p>
