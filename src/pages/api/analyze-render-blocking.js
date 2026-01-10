import { matchVendor } from '../../lib/domain-matcher.js';
import { generateRecommendation, generateInsights, calculateBlockingScore } from '../../lib/recommendation-engine.js';

// Conditionally import puppeteer based on environment
const isDev = process.env.NODE_ENV === "development";
let puppeteer;
let chromium;

if (isDev) {
	puppeteer = (await import("puppeteer")).default;
} else {
	puppeteer = (await import("puppeteer-core")).default;
	chromium = (await import("@sparticuz/chromium")).default;
}

/**
 * Helper function to determine element position in document
 *
 * @param {Element} element - DOM element
 * @returns {string} Position: 'head', 'body-start', or 'body-end'
 */
function getElementPosition(element) {
	const parent = element.parentElement?.tagName.toLowerCase();

	if (parent === 'head') {
		return 'head';
	}

	if (parent === 'body') {
		// Check if element is in first third, middle, or last third of body
		const bodyChildren = Array.from(document.body.children);
		const index = bodyChildren.indexOf(element);
		const totalChildren = bodyChildren.length;

		if (index < totalChildren / 3) {
			return 'body-start';
		} else if (index > (totalChildren * 2) / 3) {
			return 'body-end';
		} else {
			return 'body-middle';
		}
	}

	return 'body-middle';
}

/**
 * API Route Handler - Analyze Render-Blocking Resources
 *
 * Analyzes a webpage for render-blocking scripts and stylesheets,
 * categorizes them, and provides optimization recommendations.
 *
 * @param {import('next').NextApiRequest} req - Next.js API request
 * @param {import('next').NextApiResponse} res - Next.js API response
 */
export default async function handler(req, res) {
	const { url } = req.query;

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

		// Set viewport and navigate to page
		await page.setViewport({ width: 1280, height: 900 });

		await page.goto(url, {
			waitUntil: "networkidle2",
			timeout: 30000,
		});

		// Extract all script and stylesheet data from the page
		const resourceData = await page.evaluate(() => {
			// Helper function to get element position
			function getPosition(element) {
				const parent = element.parentElement?.tagName.toLowerCase();

				if (parent === 'head') {
					return 'head';
				}

				if (parent === 'body') {
					const bodyChildren = Array.from(document.body.children);
					const index = bodyChildren.indexOf(element);
					const totalChildren = bodyChildren.length;

					if (index < totalChildren / 3) {
						return 'body-start';
					} else if (index > (totalChildren * 2) / 3) {
						return 'body-end';
					} else {
						return 'body-middle';
					}
				}

				return 'body-middle';
			}

			// Collect all scripts
			const scripts = Array.from(document.querySelectorAll('script'));
			const scriptData = scripts.map((script, index) => {
				const isInline = !script.src;
				const src = script.src || null;

				return {
					id: `script-${index + 1}`,
					src: src,
					isInline: isInline,
					async: script.async,
					defer: script.defer,
					type: script.type || 'text/javascript',
					position: {
						location: getPosition(script),
						index: index
					},
					textContent: isInline ? script.textContent : null,
					attributes: Array.from(script.attributes).map(attr => ({
						name: attr.name,
						value: attr.value
					}))
				};
			});

			// Collect all stylesheets (external links)
			const externalStylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
			const externalStylesheetData = externalStylesheets.map((link, index) => ({
				id: `style-ext-${index + 1}`,
				href: link.href,
				media: link.media || 'all',
				isInline: false,
				position: {
					location: getPosition(link),
					index: index
				}
			}));

			// Collect all inline style tags
			const inlineStyles = Array.from(document.querySelectorAll('style'));
			const inlineStyleData = inlineStyles.map((style, index) => ({
				id: `style-inline-${index + 1}`,
				href: null,
				media: style.media || 'all',
				isInline: true,
				textContent: style.textContent || '',
				contentLength: (style.textContent || '').length,
				position: {
					location: getPosition(style),
					index: index
				}
			}));

			// Combine all stylesheets
			const stylesheetData = [...externalStylesheetData, ...inlineStyleData];

			// Get Performance Resource Timing
			const resourceTimings = performance.getEntriesByType('resource')
				.filter(entry => entry.initiatorType === 'script' || entry.initiatorType === 'link')
				.map(entry => ({
					name: entry.name,
					initiatorType: entry.initiatorType,
					duration: entry.duration,
					transferSize: entry.transferSize,
					encodedBodySize: entry.encodedBodySize,
					decodedBodySize: entry.decodedBodySize,
					startTime: entry.startTime
				}));

			return {
				scripts: scriptData,
				stylesheets: stylesheetData,
				timings: resourceTimings
			};
		});

		// Close browser early to free up memory
		await browser.close();
		browser = null;

		// Process scripts: match vendors and generate recommendations
		const processedScripts = resourceData.scripts.map(script => {
			// Determine loading strategy
			let loadingStrategy = 'none';
			if (script.async) loadingStrategy = 'async';
			else if (script.defer) loadingStrategy = 'defer';
			else if (script.type === 'module') loadingStrategy = 'module';

			// Match vendor for external scripts
			let vendorInfo = { category: 'internal', name: 'Internal Script' };
			if (script.src) {
				vendorInfo = matchVendor(script.src);
			}

			// Find matching resource timing
			const timing = resourceData.timings.find(t =>
				script.src && t.name === script.src
			);

			// Build complete script object
			const completeScript = {
				...script,
				category: vendorInfo.category,
				vendor: vendorInfo.name,
				domain: script.src ? new URL(script.src).hostname : null,
				loading: {
					strategy: loadingStrategy,
					isBlocking: (script.position.location === 'head' && loadingStrategy === 'none')
				},
				size: timing ? {
					transferSize: timing.transferSize,
					resourceSize: timing.decodedBodySize,
					duration: timing.duration
				} : null
			};

			// Generate recommendation
			const recommendation = generateRecommendation(completeScript);

			return {
				...completeScript,
				recommendation
			};
		});

		// Process stylesheets (both external and inline)
		const processedStylesheets = resourceData.stylesheets.map(stylesheet => {
			// For external stylesheets, find timing data
			const timing = stylesheet.href
				? resourceData.timings.find(t => t.name === stylesheet.href)
				: null;

			// Extract filename from URL for external stylesheets
			let filename = null;
			if (stylesheet.href) {
				try {
					const urlPath = new URL(stylesheet.href).pathname;
					filename = urlPath.split('/').pop() || urlPath;
				} catch {
					filename = stylesheet.href;
				}
			}

			// Calculate size for inline styles
			const inlineSize = stylesheet.isInline && stylesheet.contentLength
				? stylesheet.contentLength
				: null;

			return {
				...stylesheet,
				type: stylesheet.isInline ? 'inline' : 'external',
				filename: filename,
				domain: stylesheet.href ? new URL(stylesheet.href).hostname : null,
				loading: {
					isBlocking: (stylesheet.media === 'all' || !stylesheet.media) && stylesheet.position.location === 'head',
					isCritical: stylesheet.position.location === 'head'
				},
				size: stylesheet.isInline
					? {
						transferSize: inlineSize,
						resourceSize: inlineSize
					}
					: timing
						? {
							transferSize: timing.transferSize,
							resourceSize: timing.decodedBodySize
						}
						: null,
				recommendation: {
					action: stylesheet.position.location === 'head' && (stylesheet.media === 'all' || !stylesheet.media)
						? 'consider-critical-css'
						: 'ok',
					reason: stylesheet.isInline
						? stylesheet.position.location === 'head'
							? 'Inline styles in head are good for critical CSS'
							: 'Consider moving critical inline styles to head'
						: stylesheet.position.location === 'head'
							? 'Consider extracting critical CSS for above-the-fold content'
							: 'Stylesheet is properly placed'
				}
			};
		});

		// Calculate summary statistics
		const summary = {
			totalScripts: processedScripts.length,
			totalStylesheets: processedStylesheets.length,
			externalStylesheets: processedStylesheets.filter(s => s.type === 'external').length,
			inlineStylesheets: processedStylesheets.filter(s => s.type === 'inline').length,
			renderBlockingScripts: processedScripts.filter(s => s.loading.isBlocking).length,
			renderBlockingStylesheets: processedStylesheets.filter(s => s.loading.isBlocking).length,
			thirdPartyScripts: processedScripts.filter(s => s.category !== 'internal').length,
			inlineScripts: processedScripts.filter(s => s.isInline).length,
			criticalScripts: processedScripts.filter(s => s.recommendation.criticality === 'critical').length,
			interactiveScripts: processedScripts.filter(s => s.recommendation.criticality === 'interactive').length,
			nonEssentialScripts: processedScripts.filter(s => s.recommendation.criticality === 'non-essential').length
		};

		// Generate insights
		const insights = generateInsights(processedScripts);

		// Group scripts by category
		const scriptsByCategory = processedScripts.reduce((acc, script) => {
			const category = script.category || 'other';
			if (!acc[category]) {
				acc[category] = [];
			}
			acc[category].push(script);
			return acc;
		}, {});

		// Return complete analysis
		res.status(200).json({
			url,
			analyzedAt: new Date().toISOString(),
			summary,
			insights,
			scripts: processedScripts,
			scriptsByCategory,
			stylesheets: processedStylesheets
		});

	} catch (error) {
		console.error("API Error:", error);

		// Specific error messages
		let errorMessage = "Failed to analyze page";
		let errorDetails = error.message;

		if (error.message.includes('timeout')) {
			errorMessage = "Page load timeout";
			errorDetails = "The page took too long to load. Try again or check if the URL is accessible.";
		} else if (error.message.includes('net::ERR')) {
			errorMessage = "Network error";
			errorDetails = "Could not access the URL. Please check if it's valid and publicly accessible.";
		}

		res.status(500).json({
			error: errorMessage,
			details: errorDetails,
			stack: isDev ? error.stack : undefined,
		});
	} finally {
		// Ensure browser is closed even if there's an error
		if (browser) {
			await browser.close();
		}
	}
}
