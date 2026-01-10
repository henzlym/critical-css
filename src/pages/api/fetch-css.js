import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import postcss from "postcss";
import { PurgeCSS } from "purgecss";

// Import shared browser module
import { createBrowserWithPage } from "../../lib/browser/index.js";

// Import feature modules
import { captureAboveTheFoldHTML } from "../../lib/features/above-the-fold/index.js";

// Valid mode values for CSS extraction
const VALID_MODES = ["full", "above-fold"];

/**
 * Formats byte size to human-readable string
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "122.3 KB")
 */
function formatSize(bytes) {
	if (bytes >= 1024 * 1024) {
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}
	if (bytes >= 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}
	return `${bytes} B`;
}

/**
 * Extracts a valid filename from a URL
 * @param {string} cssUrl - URL of the stylesheet
 * @returns {string} Valid filename or default
 */
function extractFilename(cssUrl) {
	try {
		const pathname = new URL(cssUrl).pathname;
		const filename = pathname.split("/").pop()?.split("?")[0];
		// Validate filename has content and proper extension
		if (filename && filename.length > 0 && !filename.startsWith(".")) {
			return filename;
		}
	} catch {
		// URL parsing failed, fall through to default
	}
	return "stylesheet.css";
}

/**
 * Fetches a single stylesheet and returns its metadata
 * @param {string} cssUrl - URL of the stylesheet
 * @param {number} index - Index for ID assignment
 * @returns {Promise<{content: string, metadata: Object}>}
 */
async function fetchStylesheet(cssUrl, index) {
	const response = await fetch(cssUrl);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch stylesheet: ${response.status} ${response.statusText}`
		);
	}
	const content = await response.text();
	const size = new TextEncoder().encode(content).length;

	return {
		content,
		metadata: {
			id: index + 1,
			url: cssUrl,
			filename: extractFilename(cssUrl),
			size,
			sizeFormatted: formatSize(size),
		},
	};
}

/**
 * Processes CSS through PostCSS pipeline (autoprefixer + cssnano)
 * @param {string} css - Raw CSS string
 * @returns {Promise<string>} Processed CSS
 */
async function processCss(css) {
	const result = await postcss([autoprefixer(), cssnano()]).process(css, {
		from: undefined,
	});
	return result.css;
}

/**
 * Generates critical CSS by purging unused selectors
 * @param {string} css - Combined CSS
 * @param {string} html - HTML content to match against
 * @returns {Promise<string>} Purged and minified CSS
 */
async function generateCriticalCss(css, html) {
	const purgecss = await new PurgeCSS().purge({
		content: [{ raw: html, extension: "html" }],
		css: [{ raw: css }],
	});
	return processCss(purgecss[0].css);
}

/**
 * Creates an empty CSS response when no stylesheets are found
 * @param {string} mode - The mode used ('full' or 'above-fold')
 * @param {string} [message] - Optional message to include
 * @returns {Object} Empty CSS response object
 */
function createEmptyResponse(
	mode,
	message = "No stylesheets found on the page"
) {
	return {
		minified: "",
		unminified: "",
		critical: "",
		stylesheets: [],
		mode,
		message,
		sizes: {
			original: 0,
			originalFormatted: formatSize(0),
			minified: 0,
			minifiedFormatted: formatSize(0),
			critical: 0,
			criticalFormatted: formatSize(0),
			minifiedReduction: 0,
			criticalReduction: 0,
		},
	};
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

	// Validate mode parameter
	if (!VALID_MODES.includes(mode)) {
		return res.status(400).json({
			error: "Invalid mode parameter",
			details: `Mode must be one of: ${VALID_MODES.join(", ")}`,
		});
	}

	let browser;
	try {
		const result = await createBrowserWithPage(url);
		browser = result.browser;
		const page = result.page;

		const fullHtmlContent = await page.content();
		const htmlForPurge =
			mode === "above-fold"
				? await captureAboveTheFoldHTML(page, { skipViewportSet: true })
				: fullHtmlContent;

		const cssLinks = await page.evaluate(() => {
			return Array.from(
				document.querySelectorAll('link[rel="stylesheet"]')
			).map((link) => link.href);
		});

		await browser.close();
		browser = undefined;

		// Handle case where no stylesheets were found
		if (cssLinks.length === 0) {
			return res.status(200).json(createEmptyResponse(mode));
		}

		// Fetch all stylesheets in parallel, handling individual failures gracefully
		const settledResults = await Promise.allSettled(
			cssLinks.map((cssUrl, index) => fetchStylesheet(cssUrl, index))
		);

		// Filter successful results and log failures
		const results = [];
		for (const result of settledResults) {
			if (result.status === "fulfilled") {
				results.push(result.value);
			} else {
				console.warn(
					"Failed to fetch stylesheet:",
					result.reason?.message
				);
			}
		}

		const stylesheets = results.map((r) => r.metadata);
		const combinedCss = results.map((r) => r.content).join("");

		// Process CSS variants in parallel
		const [minifiedCss, criticalCss] = await Promise.all([
			processCss(combinedCss),
			generateCriticalCss(combinedCss, htmlForPurge),
		]);

		const originalSize = new TextEncoder().encode(combinedCss).length;
		const minifiedSize = new TextEncoder().encode(minifiedCss).length;
		const criticalSize = new TextEncoder().encode(criticalCss).length;

		// Calculate reductions, avoiding division by zero
		const minifiedReduction =
			originalSize > 0
				? Math.round((1 - minifiedSize / originalSize) * 100)
				: 0;
		const criticalReduction =
			originalSize > 0
				? Math.round((1 - criticalSize / originalSize) * 100)
				: 0;

		res.status(200).json({
			minified: minifiedCss,
			unminified: combinedCss,
			critical: criticalCss,
			stylesheets,
			mode,
			sizes: {
				original: originalSize,
				originalFormatted: formatSize(originalSize),
				minified: minifiedSize,
				minifiedFormatted: formatSize(minifiedSize),
				critical: criticalSize,
				criticalFormatted: formatSize(criticalSize),
				minifiedReduction,
				criticalReduction,
			},
		});
	} catch (error) {
		console.error("API Error:", error);
		res.status(500).json({
			error: "Failed to process CSS",
			details: error.message,
			stack:
				process.env.NODE_ENV === "development"
					? error.stack
					: undefined,
		});
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}
