/**
 * Preload Tag Generator Module
 *
 * Analyzes a webpage and generates optimal <link rel="preload"> and
 * <link rel="dns-prefetch"> tags for fonts, images, and external resources.
 *
 * Based on performance techniques from fast websites like McMaster-Carr.
 *
 * @module features/preload-generator
 */

/**
 * Resource types that can be preloaded
 */
export const PRELOAD_TYPES = {
	font: "font",
	image: "image",
	style: "style",
	script: "script",
};

/**
 * Common web font file extensions
 */
const FONT_EXTENSIONS = [".woff2", ".woff", ".ttf", ".otf", ".eot"];

/**
 * Common image file extensions
 */
const IMAGE_EXTENSIONS = [
	".png",
	".jpg",
	".jpeg",
	".gif",
	".webp",
	".avif",
	".svg",
];

/**
 * Extracts all preloadable resources from a Puppeteer page.
 *
 * @param {import('puppeteer').Page} page - Puppeteer page instance
 * @returns {Promise<Object>} Object containing categorized resources
 */
export async function extractPreloadableResources(page) {
	const resources = await page.evaluate(() => {
		const fonts = [];
		const images = [];
		const styles = [];
		const scripts = [];
		const preconnect = [];
		const externalDomains = new Set();

		// Extract fonts from @font-face rules in stylesheets
		for (const sheet of document.styleSheets) {
			try {
				for (const rule of sheet.cssRules || []) {
					if (rule instanceof CSSFontFaceRule) {
						const src = rule.style.getPropertyValue("src");
						const urlMatch = src.match(
							/url\(['"]?([^'")\s]+)['"]?\)/
						);
						if (urlMatch) {
							fonts.push({
								url: urlMatch[1],
								format:
									urlMatch[1].match(
										/\.(woff2?|ttf|otf|eot)/i
									)?.[1] || "woff2",
							});
						}
					}
				}
			} catch (e) {
				// CORS restrictions may prevent reading some stylesheets
			}
		}

		// Extract images from the page (above-the-fold prioritized)
		const viewportHeight = window.innerHeight;
		const imgElements = document.querySelectorAll("img[src]");
		imgElements.forEach((img) => {
			const rect = img.getBoundingClientRect();
			if (rect.top < viewportHeight && img.src) {
				images.push({
					url: img.src,
					isAboveFold: true,
					width: img.naturalWidth || img.width,
					height: img.naturalHeight || img.height,
				});
			}
		});

		// Extract background images from inline styles and computed styles
		const elementsWithBg = document.querySelectorAll(
			"[style*='background']"
		);
		elementsWithBg.forEach((el) => {
			const rect = el.getBoundingClientRect();
			if (rect.top < viewportHeight) {
				const bgImage = getComputedStyle(el).backgroundImage;
				const urlMatch = bgImage.match(/url\(['"]?([^'")\s]+)['"]?\)/);
				if (urlMatch && !urlMatch[1].startsWith("data:")) {
					images.push({
						url: urlMatch[1],
						isAboveFold: true,
						isBackground: true,
					});
				}
			}
		});

		// Extract preconnect links
		document.querySelectorAll('link[rel="preconnect"]').forEach((link) => {
			if (link.href) {
				preconnect.push({ url: link.href });
				try {
					const url = new URL(link.href);
					if (url.origin !== window.location.origin) {
						externalDomains.add(url.origin);
					}
				} catch (e) {}
			}
		});

		// Extract external stylesheets
		document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
			if (link.href) {
				styles.push({ url: link.href });
				try {
					const url = new URL(link.href);
					if (url.origin !== window.location.origin) {
						externalDomains.add(url.origin);
					}
				} catch (e) {}
			}
		});

		// Extract scripts
		document.querySelectorAll("script[src]").forEach((script) => {
			if (script.src) {
				scripts.push({
					url: script.src,
					async: script.async,
					defer: script.defer,
				});
				try {
					const url = new URL(script.src);
					if (url.origin !== window.location.origin) {
						externalDomains.add(url.origin);
					}
				} catch (e) {}
			}
		});

		// Collect all external domains for DNS prefetch
		[...images, ...fonts].forEach((resource) => {
			try {
				const url = new URL(resource.url, window.location.origin);
				if (url.origin !== window.location.origin) {
					externalDomains.add(url.origin);
				}
			} catch (e) {}
		});

		return {
			fonts,
			images,
			styles,
			scripts,
			preconnect,
			externalDomains: Array.from(externalDomains),
		};
	});

	return resources;
}

/**
 * Generates preload link tags for fonts.
 *
 * @param {Array<Object>} fonts - Array of font resources
 * @returns {string[]} Array of preload link tag strings
 */
export function generateFontPreloads(fonts) {
	// Deduplicate fonts by URL
	const uniqueFonts = [...new Map(fonts.map((f) => [f.url, f])).values()];

	return uniqueFonts.map((font) => {
		const format = font.format || "woff2";
		return `<link rel="preload" href="${font.url}" as="font" type="font/${format}" crossorigin="anonymous">`;
	});
}

/**
 * Generates preload link tags for above-the-fold images.
 *
 * @param {Array<Object>} images - Array of image resources
 * @param {Object} options - Configuration options
 * @param {number} [options.maxImages=5] - Maximum number of images to preload
 * @returns {string[]} Array of preload link tag strings
 */
export function generateImagePreloads(images, options = {}) {
	const { maxImages = 5 } = options;

	// Only preload above-the-fold images, limit to prevent too many preloads
	const aboveFoldImages = images
		.filter((img) => img.isAboveFold)
		.slice(0, maxImages);

	return aboveFoldImages.map((img) => {
		return `<link rel="preload" href="${img.url}" as="image">`;
	});
}

/**
 * Generates DNS prefetch tags for external domains.
 *
 * @param {string[]} domains - Array of external domain origins
 * @returns {string[]} Array of dns-prefetch link tag strings
 */
export function generateDnsPrefetch(domains) {
	return domains.map((domain) => {
		return `<link rel="dns-prefetch" href="${domain}">`;
	});
}

/**
 * Generates preconnect tags for critical external domains.
 *
 * @param {string[]} domains - Array of external domain origins
 * @param {Object} options - Configuration options
 * @param {number} [options.maxPreconnect=3] - Maximum domains to preconnect
 * @returns {string[]} Array of preconnect link tag strings
 */
export function generatePreconnect(domains, options = {}) {
	const { maxPreconnect = 3 } = options;

	// Limit preconnect to most critical domains (too many can hurt performance)
	return domains.slice(0, maxPreconnect).map((domain) => {
		return `<link rel="preconnect" href="${domain}" crossorigin>`;
	});
}

/**
 * Generates a complete set of preload tags for a page.
 *
 * @param {Object} resources - Resources extracted from the page
 * @param {Object} options - Configuration options
 * @returns {Object} Object containing all generated preload tags
 */
export function generateAllPreloadTags(resources, options = {}) {
	const fontPreloads = generateFontPreloads(resources.fonts || []);
	const imagePreloads = generateImagePreloads(
		resources.images || [],
		options
	);
	const dnsPrefetch = generateDnsPrefetch(resources.externalDomains || []);
	const preconnect = generatePreconnect(
		resources.externalDomains || [],
		options
	);

	// Combine all tags in recommended order
	const allTags = [
		...preconnect,
		...dnsPrefetch,
		...fontPreloads,
		...imagePreloads,
	];

	return {
		fontPreloads,
		imagePreloads,
		dnsPrefetch,
		preconnect,
		allTags,
		// Ready-to-use HTML snippet
		html: allTags.join("\n"),
		// Summary statistics
		stats: {
			fontsPreloaded: fontPreloads.length,
			imagesPreloaded: imagePreloads.length,
			domainsPreconnected: preconnect.length,
			domainsPrefetched: dnsPrefetch.length,
			preconnectsFound: resources.preconnect.length,
		},
	};
}
