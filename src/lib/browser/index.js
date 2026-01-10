/**
 * Shared Puppeteer Browser Module
 *
 * Provides consistent browser initialization across API endpoints.
 * Handles environment-specific configuration for development vs production.
 *
 * @module lib/browser
 */

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
 * Default viewport configuration for consistent rendering
 */
export const VIEWPORT_CONFIG = {
	width: 1280,
	height: 800,
};

/**
 * Gets browser launch options based on environment
 * @returns {Promise<Object>} Puppeteer launch options
 */
export async function getBrowserOptions() {
	const baseArgs = [
		"--no-sandbox",
		"--disable-setuid-sandbox",
		"--disable-dev-shm-usage",
		"--disable-gpu",
	];

	if (isDev) {
		return { args: baseArgs, headless: true };
	}

	if (!chromium) {
		throw new Error("Chromium module not loaded in production environment");
	}

	return {
		args: [...baseArgs, ...chromium.args],
		headless: chromium.headless,
		executablePath: await chromium.executablePath(),
		ignoreHTTPSErrors: true,
	};
}

/**
 * Creates a configured browser instance
 * @returns {Promise<import('puppeteer').Browser>} Puppeteer browser instance
 */
export async function createBrowser() {
	const options = await getBrowserOptions();
	return puppeteer.launch(options);
}

/**
 * Creates a browser and navigates to a URL with standard configuration
 * @param {string} url - URL to navigate to
 * @param {Object} options - Navigation options
 * @param {number} [options.timeout=30000] - Navigation timeout in ms
 * @returns {Promise<{browser: import('puppeteer').Browser, page: import('puppeteer').Page}>}
 */
export async function createBrowserWithPage(url, options = {}) {
	const { timeout = 30000 } = options;

	const browser = await createBrowser();
	const page = await browser.newPage();

	await page.goto(url, {
		waitUntil: "networkidle2",
		timeout,
	});

	await page.setViewport({
		width: VIEWPORT_CONFIG.width,
		height: VIEWPORT_CONFIG.height,
	});

	return { browser, page };
}
