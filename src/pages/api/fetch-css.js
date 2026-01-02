import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import postcss from "postcss";
import { PurgeCSS } from "purgecss";

// Import feature modules
import {
	captureAboveTheFoldHTML,
	VIEWPORT_CONFIG,
} from "../../lib/features/above-the-fold/index.js";

// Conditionally import puppeteer based on environment
// Use puppeteer-core with chromium for serverless (Vercel, AWS Lambda, etc.)
// Use regular puppeteer for local development
const isDev = process.env.NODE_ENV === "development";
let puppeteer;
let chromium;

if (isDev) {
	// Local development - use full puppeteer
	puppeteer = (await import("puppeteer")).default;
} else {
	// Production (Vercel) - use puppeteer-core with serverless chromium
	puppeteer = (await import("puppeteer-core")).default;
	chromium = (await import("@sparticuz/chromium")).default;
}

/**
 * API Route Handler - Extract and process CSS from a URL
 *
 * Fetches a webpage using Puppeteer, extracts all linked stylesheets,
 * and processes them through PostCSS pipeline (autoprefixer + cssnano + purgecss).
 *
 * @param {import('next').NextApiRequest} req - Next.js API request
 * @param {import('next').NextApiResponse} res - Next.js API response
 *
 * @query {string} url - Target webpage URL to extract CSS from
 * @query {string} [mode=full] - Extraction mode: 'full' or 'above-fold'
 *
 * @returns {Object} JSON response with CSS variants:
 * @returns {string} minified - All stylesheets combined and minified
 * @returns {string} unminified - All stylesheets combined without minification
 * @returns {string} critical - CSS purged to only include rules used in the HTML
 * @returns {Array<Object>} stylesheets - Metadata for each extracted stylesheet:
 *   - id: Unique identifier
 *   - url: Full stylesheet URL
 *   - filename: Extracted filename
 *   - size: Size in bytes
 *   - sizeFormatted: Human-readable size
 *
 * @example
 * // GET /api/fetch-css?url=https://example.com
 * // Response: { minified: "...", unminified: "...", critical: "...", stylesheets: [...] }
 *
 * @example
 * // GET /api/fetch-css?url=https://example.com&mode=above-fold
 * // Response: Same as above, but critical CSS only includes above-the-fold styles
 */
export default async function handler(req, res) {
	const { url, mode = "full" } = req.query;

	if (!url) {
		return res.status(400).json({ error: "URL is required" });
	}

	let browser;
	try {
		// Configure browser options based on environment
		const launchOptions = {
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage",
				"--disable-gpu",
				...(isDev ? [] : chromium.args),
			],
			headless: chromium?.headless ?? true,
			...(isDev ? {} : {
				executablePath: await chromium.executablePath(),
				ignoreHTTPSErrors: true,
			}),
		};

		browser = await puppeteer.launch(launchOptions);
		const page = await browser.newPage();

		// Set a reasonable timeout for navigation
		await page.goto(url, {
			waitUntil: "networkidle2",
			timeout: 30000, // 30 seconds
		});

		await page.setViewport({
			width: VIEWPORT_CONFIG.width,
			height: VIEWPORT_CONFIG.height,
		});

		// Get full page HTML
		const fullHtmlContent = await page.content();

		// Get above-the-fold HTML if mode is 'above-fold'
		let htmlForPurge = fullHtmlContent;

		if (mode === "above-fold") {
			htmlForPurge = await captureAboveTheFoldHTML(page);
		}

		const cssLinks = await page.evaluate(() => {
			return Array.from(
				document.querySelectorAll('link[rel="stylesheet"]')
			).map((link) => link.href);
		});

		// Close browser early to free up memory
		await browser.close();
		browser = null; // Mark as closed

		let combinedCss = "";
		const stylesheets = [];

		for (const cssUrl of cssLinks) {
			const response = await fetch(cssUrl);
			const cssContent = await response.text();
			const size = new TextEncoder().encode(cssContent).length;

			stylesheets.push({
				id: stylesheets.length + 1,
				url: cssUrl,
				filename:
					cssUrl.split("/").pop().split("?")[0] || "stylesheet.css",
				size,
				sizeFormatted:
					size > 1024
						? `${(size / 1024).toFixed(1)} KB`
						: `${size} B`,
			});

			combinedCss += cssContent;
		}

		const combined = await postcss([autoprefixer(), cssnano()]).process(
			combinedCss,
			{
				from: undefined,
			}
		);

		const purgecss = await new PurgeCSS().purge({
			content: [
				{
					raw: htmlForPurge,
					extension: "html",
				},
			],
			css: [
				{
					raw: combinedCss,
				},
			],
		});

		const critical = await postcss([autoprefixer(), cssnano()]).process(
			purgecss[0].css,
			{
				from: undefined,
			}
		);

		// Calculate sizes for comparison
		const originalSize = new TextEncoder().encode(combinedCss).length;
		const minifiedSize = new TextEncoder().encode(combined.css).length;
		const criticalSize = new TextEncoder().encode(critical.css).length;

		/**
		 * Formats byte size to human-readable string
		 * @param {number} bytes - Size in bytes
		 * @returns {string} Formatted size (e.g., "122.3 KB")
		 */
		const formatSize = (bytes) => {
			if (bytes >= 1024 * 1024) {
				return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
			} else if (bytes >= 1024) {
				return `${(bytes / 1024).toFixed(1)} KB`;
			}
			return `${bytes} B`;
		};

		res.status(200).json({
			minified: combined.css,
			unminified: combinedCss,
			critical: critical.css,
			stylesheets,
			mode,
			sizes: {
				original: originalSize,
				originalFormatted: formatSize(originalSize),
				minified: minifiedSize,
				minifiedFormatted: formatSize(minifiedSize),
				critical: criticalSize,
				criticalFormatted: formatSize(criticalSize),
				minifiedReduction: Math.round(
					(1 - minifiedSize / originalSize) * 100
				),
				criticalReduction: Math.round(
					(1 - criticalSize / originalSize) * 100
				),
			},
		});
	} catch (error) {
		console.error("API Error:", error);
		res.status(500).json({
			error: "Failed to process CSS",
			details: error.message,
			stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
		});
	} finally {
		// Ensure browser is closed even if there's an error
		if (browser) {
			await browser.close();
		}
	}
}
