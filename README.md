# Critical CSS Generator

A modern web application for analyzing and extracting critical CSS from any webpage. Optimize your website's performance by identifying and isolating above-the-fold styles for faster initial page loads.

## What is Critical CSS?

Critical CSS is the minimal set of styles required to render the above-the-fold content of a webpage. By inlining critical CSS and deferring the rest, you can significantly improve page load performance and Core Web Vitals scores.

## Features

- **URL Analysis** - Analyze any webpage by simply entering its URL
- **Automatic CSS Extraction** - Automatically discovers and extracts all linked stylesheets
- **Three CSS Variants**:
  - **Combined & Minified CSS** - All stylesheets merged and optimized
  - **Critical CSS** - Purged CSS containing only above-the-fold styles
  - **Unminified CSS** - Raw combined output for debugging
- **File Size Analysis** - See original vs. optimized file sizes with reduction percentages
- **Download & Copy** - One-click download or copy to clipboard
- **Modern UI** - Beautiful glassmorphic design with real-time feedback

## Tech Stack

- **Next.js 14** - React framework with API routes
- **Puppeteer** - Headless browser automation for webpage analysis
- **PostCSS** - CSS transformation pipeline
- **PurgeCSS** - Removes unused CSS based on HTML content analysis
- **CSSnano** - CSS minification and optimization
- **WordPress Components** - Pre-built UI components

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/henzlym/critical-css.git
cd critical-css
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. Enter the URL of the webpage you want to analyze
2. Click "Generate Critical CSS"
3. Wait for the analysis to complete (the app will scrape the page and process all stylesheets)
4. View the results:
   - **Combined & Minified CSS** - All styles optimized for production
   - **Critical CSS** - Only the essential above-the-fold styles
5. Download or copy the CSS for use in your project

## How It Works

1. **Scraping** - Puppeteer loads the target webpage in a headless browser
2. **Extraction** - All linked stylesheets are discovered and downloaded
3. **Processing** - PostCSS pipeline processes the CSS:
   - Autoprefixer adds vendor prefixes
   - CSSnano minifies the output
   - PurgeCSS analyzes the HTML to identify used styles
4. **Generation** - Three variants are generated and displayed with file size comparisons

## Project Structure

```
src/
├── app/
│   ├── page.js              # Main UI component
│   ├── layout.js            # Root layout
│   ├── globals.css          # Global styles and design system
│   └── components/
│       └── file-view.js     # Stylesheet metadata display
└── pages/
    └── api/
        └── fetch-css.js     # CSS extraction API endpoint
```

## Use Cases

- **Performance Optimization** - Reduce initial page load time
- **Core Web Vitals** - Improve LCP and FCP metrics
- **CSS Auditing** - Analyze stylesheet size and usage
- **Development** - Identify unused CSS in your projects
- **Learning** - Understand CSS optimization techniques

## Deployment

### Deploy on Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/critical-css)

### Other Platforms

This Next.js app can be deployed to any platform that supports Node.js:
- Netlify
- AWS Amplify
- Railway
- Render
- Self-hosted with Node.js

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

Built with [Next.js](https://nextjs.org/) and powered by [Puppeteer](https://pptr.dev/) and [PurgeCSS](https://purgecss.com/).

---

**Note:** This tool analyzes publicly accessible webpages. Ensure you have permission to analyze any website you don't own.
