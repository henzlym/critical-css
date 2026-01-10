/**
 * API Route Handler - Extract Preload Tags from a URL
 *
 * Fetches a webpage using Puppeteer and analyzes it to generate
 * optimal preload, preconnect, and dns-prefetch tags.
 *
 * @module api/preload-tags
 */

import { createBrowserWithPage } from "../../lib/browser/index.js";
import {
	extractPreloadableResources,
	generateAllPreloadTags,
} from "../../lib/features/preload-generator/index.js";

/**
 * API Route Handler
 *
 * @param {import('next').NextApiRequest} req - Next.js API request
 * @param {import('next').NextApiResponse} res - Next.js API response
 *
 * @query {string} url - Target webpage URL to analyze
 * @query {number} [maxImages=5] - Maximum images to include in preloads
 * @query {number} [maxPreconnect=3] - Maximum domains for preconnect
 *
 * @returns {Object} JSON response with preload tags:
 * @returns {string} html - Combined HTML snippet of all tags
 * @returns {string[]} fontPreloads - Font preload link tags
 * @returns {string[]} imagePreloads - Image preload link tags
 * @returns {string[]} dnsPrefetch - DNS prefetch link tags
 * @returns {string[]} preconnect - Preconnect link tags
 * @returns {Object} stats - Statistics about detected resources
 *
 * @example
 * // GET /api/preload-tags?url=https://example.com
 * // Response: { html: "...", fontPreloads: [...], stats: {...} }
 */
export default async function handler(req, res) {
	const { url, maxImages = "5", maxPreconnect = "3" } = req.query;

	if (!url) {
		return res.status(400).json({ error: "URL is required" });
	}

	let browser;
	try {
		const result = await createBrowserWithPage(url);
		browser = result.browser;
		const page = result.page;

		const preloadResources = await extractPreloadableResources(page);
		const preloadTags = generateAllPreloadTags(preloadResources, {
			maxImages: parseInt(maxImages, 10),
			maxPreconnect: parseInt(maxPreconnect, 10),
		});

		await browser.close();
		browser = undefined;

		res.status(200).json({
			html: preloadTags.html,
			fontPreloads: preloadTags.fontPreloads,
			imagePreloads: preloadTags.imagePreloads,
			dnsPrefetch: preloadTags.dnsPrefetch,
			preconnect: preloadTags.preconnect,
			allTags: preloadTags.allTags,
			stats: preloadTags.stats,
		});
	} catch (error) {
		console.error("Preload Tags API Error:", error);
		res.status(500).json({
			error: "Failed to analyze page",
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
