/**
 * Features Index
 *
 * Central export point for all CSS optimization features.
 *
 * @module features
 */

export {
	captureAboveTheFoldHTML,
	getAboveTheFoldSelectors,
	VIEWPORT_CONFIG,
} from "./above-the-fold/index.js";

export {
	extractPreloadableResources,
	generateFontPreloads,
	generateImagePreloads,
	generateDnsPrefetch,
	generatePreconnect,
	generateAllPreloadTags,
	PRELOAD_TYPES,
} from "./preload-generator/index.js";
