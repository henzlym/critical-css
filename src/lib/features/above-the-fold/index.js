/**
 * Above-the-Fold CSS Extraction Module
 *
 * Captures only the HTML content visible in the initial viewport (above the fold)
 * and extracts CSS that applies specifically to that content.
 *
 * @module features/above-the-fold
 */

/**
 * Default viewport dimensions for above-the-fold detection
 */
export const VIEWPORT_CONFIG = {
	width: 1280,
	height: 900,
};

/**
 * Captures only the above-the-fold HTML content from a Puppeteer page.
 *
 * Recursively clones DOM elements that are visible within the viewport height.
 * Useful for generating truly critical CSS that only includes styles needed for
 * initial page render without scrolling.
 *
 * @param {import('puppeteer').Page} page - Puppeteer page instance
 * @param {Object} options - Configuration options
 * @param {number} [options.viewportHeight=900] - Height threshold for above-the-fold
 * @param {number} [options.viewportWidth=1280] - Viewport width to use
 * @param {boolean} [options.skipViewportSet=false] - Skip setting viewport if already configured
 * @returns {Promise<string>} HTML string containing only above-the-fold content
 *
 * @example
 * const page = await browser.newPage();
 * await page.goto('https://example.com');
 * const aboveFoldHTML = await captureAboveTheFoldHTML(page);
 */
export async function captureAboveTheFoldHTML(page, options = {}) {
	const {
		viewportHeight = VIEWPORT_CONFIG.height,
		viewportWidth = VIEWPORT_CONFIG.width,
		skipViewportSet = false,
	} = options;

	// Set viewport to capture above-the-fold content (skip if already configured by caller)
	if (!skipViewportSet) {
		await page.setViewport({
			width: viewportWidth,
			height: viewportHeight,
		});
	}

	// Get the above-the-fold HTML content
	const aboveTheFoldHTML = await page.evaluate((maxHeight) => {
		/**
		 * Recursively clones elements that are within the viewport
		 * @param {Node} element - DOM element to check
		 * @param {number} maxHeight - Maximum Y position to include
		 * @returns {Node|null} Cloned element or null if below fold
		 */
		function cloneAboveTheFold(element, maxHeight) {
			// Clone text nodes and other non-element nodes directly
			if (element.nodeType !== Node.ELEMENT_NODE) {
				return element.cloneNode(true);
			}

			const rect = element.getBoundingClientRect();

			// Skip elements entirely below the fold
			if (rect.top >= maxHeight) {
				return null;
			}

			// Clone the element without children
			const clone = element.cloneNode(false);

			// Recursively process children
			for (const child of element.childNodes) {
				const clonedChild = cloneAboveTheFold(child, maxHeight);
				if (clonedChild) {
					clone.appendChild(clonedChild);
				}
			}

			return clone;
		}

		// Create a new body with only above-the-fold content
		const bodyClone = document.createElement("body");

		for (const child of document.body.childNodes) {
			const clonedChild = cloneAboveTheFold(child, maxHeight);
			if (clonedChild) {
				bodyClone.appendChild(clonedChild);
			}
		}

		// Reconstruct complete HTML document
		const doctype = document.doctype
			? new XMLSerializer().serializeToString(document.doctype)
			: "<!DOCTYPE html>";
		const htmlClone = document.documentElement.cloneNode(false);
		const headClone = document.head.cloneNode(true);
		htmlClone.appendChild(headClone);
		htmlClone.appendChild(bodyClone);

		return `${doctype}\n${htmlClone.outerHTML}`;
	}, viewportHeight);

	return aboveTheFoldHTML;
}

/**
 * Extracts visible element selectors from above-the-fold content.
 *
 * Useful for understanding what CSS selectors are actually needed
 * for the initial viewport render.
 *
 * @param {import('puppeteer').Page} page - Puppeteer page instance
 * @param {Object} options - Configuration options
 * @param {number} [options.viewportHeight=900] - Height threshold
 * @returns {Promise<string[]>} Array of CSS selectors for visible elements
 */
export async function getAboveTheFoldSelectors(page, options = {}) {
	const { viewportHeight = VIEWPORT_CONFIG.height } = options;

	const selectors = await page.evaluate((maxHeight) => {
		const visibleSelectors = new Set();

		function getSelector(element) {
			if (element.id) {
				return `#${element.id}`;
			}
			if (element.className && typeof element.className === "string") {
				const classes = element.className
					.trim()
					.split(/\s+/)
					.filter(Boolean);
				if (classes.length > 0) {
					return `.${classes.join(".")}`;
				}
			}
			return element.tagName.toLowerCase();
		}

		function collectSelectors(element, maxHeight) {
			if (element.nodeType !== Node.ELEMENT_NODE) return;

			const rect = element.getBoundingClientRect();
			if (rect.top >= maxHeight) return;

			visibleSelectors.add(getSelector(element));

			for (const child of element.children) {
				collectSelectors(child, maxHeight);
			}
		}

		collectSelectors(document.body, maxHeight);
		return Array.from(visibleSelectors);
	}, viewportHeight);

	return selectors;
}
