/**
 * CSS Implementation Templates
 *
 * Generates platform-specific implementation code with the user's
 * actual critical CSS embedded and ready to paste.
 */

/**
 * Generates HTML implementation with inline critical CSS and async full CSS loading
 * @param {string} criticalCss - The critical CSS content
 * @param {string} fullCssPath - Path to full stylesheet
 * @returns {string} Complete HTML head implementation code
 */
export function generateHtmlTemplate(criticalCss, fullCssPath = '/css/combined.min.css') {
	return `<!-- Critical CSS (inlined for instant render) -->
<style id="critical-css">
${criticalCss}
</style>

<!-- Full CSS (loaded async, non-blocking) -->
<link rel="stylesheet"
      href="${fullCssPath}"
      media="print"
      onload="this.media='all'">
<noscript>
  <link rel="stylesheet" href="${fullCssPath}">
</noscript>`;
}

/**
 * Generates WordPress implementation via functions.php
 * @param {string} criticalCss - The critical CSS content
 * @param {string} fullCssPath - Path to full stylesheet (relative to theme)
 * @returns {string} PHP code for WordPress theme
 */
export function generateWordPressTemplate(criticalCss, fullCssPath = '/css/combined.min.css') {
	// Escape backticks and $ for PHP heredoc safety
	const escapedCss = criticalCss.replace(/\\/g, '\\\\');

	return `<?php
/**
 * Critical CSS Implementation
 * Add this code to your theme's functions.php file
 */

// 1. Inline critical CSS early in <head>
add_action('wp_head', function() {
?>
<style id="critical-css">
${escapedCss}
</style>
<?php
}, 1); // Priority 1 = very early in head

// 2. Load full stylesheet asynchronously (non-blocking)
add_action('wp_head', function() {
?>
<link rel="stylesheet"
      href="<?php echo get_template_directory_uri(); ?>${fullCssPath}"
      media="print"
      onload="this.media='all'">
<noscript>
  <link rel="stylesheet" href="<?php echo get_template_directory_uri(); ?>${fullCssPath}">
</noscript>
<?php
}, 99); // Priority 99 = late in head

// 3. Optional: Remove default theme stylesheet if replaced
// add_action('wp_enqueue_scripts', function() {
//   wp_dequeue_style('theme-style');
// }, 100);`;
}

/**
 * Generates Next.js implementation for App Router
 * @param {string} criticalCss - The critical CSS content
 * @returns {string} Next.js layout implementation code
 */
export function generateNextJsTemplate(criticalCss) {
	// Escape backticks for template literal safety
	const escapedCss = criticalCss.replace(/`/g, '\\`').replace(/\$/g, '\\$');

	return `// app/layout.js (App Router)
// Add the critical CSS to your root layout

const criticalCss = \`
${escapedCss}
\`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Inline Critical CSS for instant render */}
        <style
          id="critical-css"
          dangerouslySetInnerHTML={{ __html: criticalCss }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

// Note: Next.js automatically optimizes CSS imports
// Your global.css or other stylesheets will be code-split
// and loaded efficiently by the framework`;
}

/**
 * Selects and generates template for specified platform
 * @param {string} platform - 'html' | 'wordpress' | 'nextjs'
 * @param {string} criticalCss - The critical CSS
 * @param {string} fullCssPath - Path to full CSS
 * @returns {Object} { code: string, language: string }
 */
export function generateImplementationCode(platform, criticalCss, fullCssPath = '/css/combined.min.css') {
	switch (platform) {
		case 'wordpress':
			return {
				code: generateWordPressTemplate(criticalCss, fullCssPath),
				language: 'php'
			};
		case 'nextjs':
			return {
				code: generateNextJsTemplate(criticalCss),
				language: 'jsx'
			};
		case 'html':
		default:
			return {
				code: generateHtmlTemplate(criticalCss, fullCssPath),
				language: 'html'
			};
	}
}
