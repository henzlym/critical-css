export const issueExplanations = {
	synchronous_scripts_in_head: {
		// Level 1: Brief one-liner
		brief: 'Scripts without async/defer in <head> block HTML parsing and delay rendering.',

		// Level 2: Layman's detailed explanation (shown by default)
		laymanDetailed: `When your browser loads a page and hits one of these scripts, it has to completely stop building the page, download the script file, run it, and only then continue. It's like hitting a red light - everything stops and waits. This makes your page feel slower because visitors see a blank screen longer.`,

		// Level 3: Technical detailed explanation (in "show more" toggle)
		technicalDetailed: `
<strong>Why This Matters:</strong><br/>
When the browser hits a synchronous script in &lt;head&gt;, it must:<br/>
1. Stop parsing HTML<br/>
2. Download the script (network delay)<br/>
3. Execute the script (CPU time)<br/>
4. Resume HTML parsing<br/>
<br/>
This creates a render-blocking bottleneck.<br/>
<br/>
<strong>Impact:</strong><br/>
- Delays First Contentful Paint by 100-500ms+ per script<br/>
- Poor Largest Contentful Paint scores<br/>
- Users see blank screen longer<br/>
- Higher bounce rates<br/>
<br/>
<strong>Solution:</strong><br/>
- Add 'defer' for scripts needing DOM<br/>
- Add 'async' for independent scripts<br/>
- Move non-critical scripts to end of body
		`
	},

	// SEO-Critical Script Explanations
	seo_critical_schema_org: {
		brief: 'Schema.org structured data must stay in <head> for proper search engine indexing.',

		laymanDetailed: `This script contains structured data that tells Google and other search engines what your page is about - things like FAQs, products, recipes, or business info. Search engines read this data to show rich results (those fancy snippets with stars, prices, or expandable FAQs). Moving or deferring this script could make your rich results disappear from search.`,

		technicalDetailed: `
<strong>Why Keep Schema.org Scripts in &lt;head&gt;:</strong><br/>
Search engine crawlers parse structured data during page crawling. Unlike user browsers, crawlers may not execute all JavaScript.<br/>
<br/>
<strong>SEO Impact if Moved/Deferred:</strong><br/>
- Rich snippets (FAQ, Product, Review stars) may disappear<br/>
- Knowledge panel information could be lost<br/>
- Reduced click-through rates from search results<br/>
- Google may not see updated structured data<br/>
<br/>
<strong>Best Practice:</strong><br/>
- Keep JSON-LD scripts in &lt;head&gt; or early in &lt;body&gt;<br/>
- Ensure content is static, not dynamically injected<br/>
- Validate with Google's Rich Results Test
		`
	},

	seo_critical_gtm: {
		brief: 'Google Tag Manager should use async but remain in <head> for accurate tracking.',

		laymanDetailed: `Google Tag Manager is the "control center" for all your tracking and marketing tools. It needs to load early so it can track every visitor from the moment they land on your page. If it loads too late, you'll miss data from visitors who leave quickly - and those quick visits are often the majority!`,

		technicalDetailed: `
<strong>Why GTM Needs to Stay in &lt;head&gt;:</strong><br/>
GTM manages all marketing tags (analytics, ads, pixels). Late loading causes data loss.<br/>
<br/>
<strong>Impact of Moving GTM:</strong><br/>
- 10-30% of pageviews missed (bounce visitors)<br/>
- Inaccurate attribution data for ad campaigns<br/>
- Delayed firing of conversion pixels<br/>
- Skewed A/B testing results<br/>
<br/>
<strong>Best Practice:</strong><br/>
- Use GTM's recommended async implementation<br/>
- Keep snippet immediately after &lt;head&gt; tag<br/>
- Don't defer or lazy-load the container script<br/>
- Use dataLayer.push() for events after DOM ready
		`
	},

	seo_critical_analytics: {
		brief: 'Analytics scripts should use async to balance performance and data accuracy.',

		laymanDetailed: `Analytics tools like Google Analytics track who visits your site and what they do. If these scripts load too late, you'll miss counting visitors who leave quickly. This can make your traffic look lower than it really is and mess up your marketing decisions. Use async loading to get the best of both worlds.`,

		technicalDetailed: `
<strong>Why Analytics Should Stay in &lt;head&gt; (with async):</strong><br/>
Analytics must fire before users leave to capture all visits accurately.<br/>
<br/>
<strong>Impact of Delayed Loading:</strong><br/>
- Underreported traffic (especially mobile users)<br/>
- Missing bounce visitor data<br/>
- Inaccurate session duration metrics<br/>
- Incomplete user journey tracking<br/>
<br/>
<strong>Best Practice:</strong><br/>
- Use async attribute (not defer)<br/>
- Place in &lt;head&gt; with async<br/>
- Initialize tracking as early as possible<br/>
- Consider Core Web Vitals impact
		`
	},

	seo_critical_consent: {
		brief: 'Cookie consent must load first for GDPR/CCPA compliance - this is legally required.',

		laymanDetailed: `Cookie consent tools MUST load before any tracking or analytics scripts - this is a legal requirement in the EU (GDPR) and California (CCPA). If your consent banner loads after tracking scripts start, you could be collecting data without permission, which can result in massive fines. This script cannot be moved or deferred.`,

		technicalDetailed: `
<strong>Legal Requirement - Cannot Be Deferred:</strong><br/>
Privacy regulations require explicit consent BEFORE tracking begins.<br/>
<br/>
<strong>Compliance Risk if Deferred:</strong><br/>
- GDPR fines up to €20 million or 4% of revenue<br/>
- CCPA penalties up to $7,500 per violation<br/>
- Legal liability for data processing without consent<br/>
- Audit failure for privacy certifications<br/>
<br/>
<strong>Required Implementation:</strong><br/>
- Must be first script in &lt;head&gt;<br/>
- Cannot use async or defer<br/>
- Must block other scripts until consent given<br/>
- Keep script synchronous and lightweight
		`
	},

	seo_critical_facebook_pixel: {
		brief: 'Facebook Pixel should use async but stay in <head> for ad attribution accuracy.',

		laymanDetailed: `The Facebook Pixel tracks when visitors come from Facebook ads and what they do on your site. If it loads too late, Facebook won't know which ad brought the visitor, and you'll see "unknown" conversions in your ad reports. This makes it harder to know which ads are actually working.`,

		technicalDetailed: `
<strong>Why Facebook Pixel Needs Early Loading:</strong><br/>
Pixel must fire before user leaves to attribute conversions to the correct ad.<br/>
<br/>
<strong>Impact of Delayed Loading:</strong><br/>
- Lost conversion attribution<br/>
- Incomplete audience building<br/>
- Reduced retargeting pool<br/>
- Higher cost per acquisition (bad optimization data)<br/>
<br/>
<strong>Best Practice:</strong><br/>
- Use async but keep in &lt;head&gt;<br/>
- Fire PageView immediately<br/>
- Use event deduplication for server-side events<br/>
- Consider Conversions API for redundancy
		`
	},

	analytics_scripts_no_async: {
		brief: 'Analytics should use async to avoid blocking rendering.',

		laymanDetailed: `Analytics scripts track visitor behavior but don't actually affect how your page looks or works. Loading them the normal way is like making everyone wait in line just to count them - unnecessary and wasteful. These scripts should load in the background while your page continues rendering.`,

		technicalDetailed: `
<strong>Why This Matters:</strong><br/>
Analytics track behavior but don't affect functionality. Loading them synchronously delays content.<br/>
<br/>
<strong>Impact:</strong><br/>
- 150-300ms delay per analytics script<br/>
- Multiple scripts compound the problem<br/>
- No benefit to synchronous loading<br/>
<br/>
<strong>Solution:</strong><br/>
- Add 'async' attribute<br/>
- Use dynamic script injection on interaction<br/>
- Use Google Tag Manager for unified async loading
		`
	},

	chat_widgets_not_lazy: {
		brief: 'Chat widgets can wait until user interaction.',

		laymanDetailed: `Chat widgets are heavy (often 100-300KB) and most visitors never use them. Loading them immediately is like opening all your apps at computer startup - it slows everything down. These widgets can wait and load only when a visitor scrolls down or after a few seconds.`,

		technicalDetailed: `
<strong>Why This Matters:</strong><br/>
Chat widgets (100-300KB) are heavy and rarely used immediately.<br/>
<br/>
<strong>Impact:</strong><br/>
- 200-500ms initial page delay<br/>
- Wasted bandwidth<br/>
- Delays interactive elements<br/>
<br/>
<strong>Solution:</strong><br/>
- Load on scroll, click, or after 3-5 seconds<br/>
- Use intersection observer<br/>
- Degrade gracefully if fails
		`
	},

	blocking_scripts_in_head: {
		brief: 'Render-blocking scripts prevent the page from displaying content quickly.',

		laymanDetailed: `When scripts in the <head> section block rendering, your visitors stare at a white screen waiting for all the code to download and run. It's like waiting for a slow computer to boot up - frustrating and makes them more likely to leave your site.`,

		technicalDetailed: `
<strong>Why This Matters:</strong><br/>
Render-blocking scripts in &lt;head&gt; delay the browser's ability to display any content until they complete.<br/>
<br/>
<strong>Impact:</strong><br/>
- Poor First Contentful Paint (FCP)<br/>
- Slow Time to Interactive (TTI)<br/>
- Reduced page speed scores<br/>
- Increased bounce rate<br/>
<br/>
<strong>Solution:</strong><br/>
- Move scripts to end of &lt;body&gt;<br/>
- Add async/defer attributes<br/>
- Inline critical scripts<br/>
- Use resource hints (preload, prefetch)
		`
	}
};

/**
 * Get explanation for a general issue text
 */
export function getIssueExplanation(issueText) {
	if (issueText.includes('synchronous script') && issueText.includes('<head>')) {
		return issueExplanations.synchronous_scripts_in_head;
	}
	if (issueText.includes('analytics')) {
		return issueExplanations.analytics_scripts_no_async;
	}
	if (issueText.includes('chat widget')) {
		return issueExplanations.chat_widgets_not_lazy;
	}
	if (issueText.includes('blocking') && issueText.includes('<head>')) {
		return issueExplanations.blocking_scripts_in_head;
	}
	return null;
}

/**
 * Get explanation for SEO-critical script types
 * @param {string} seoCriticalType - Type from detectSeoCriticalScript (e.g., 'gtm', 'schemaOrg')
 * @returns {Object|null} Explanation object with brief, laymanDetailed, technicalDetailed
 */
export function getSeoCriticalExplanation(seoCriticalType) {
	const typeMap = {
		schemaOrg: issueExplanations.seo_critical_schema_org,
		jsonLd: issueExplanations.seo_critical_schema_org,
		gtm: issueExplanations.seo_critical_gtm,
		googleAnalytics: issueExplanations.seo_critical_analytics,
		facebookPixel: issueExplanations.seo_critical_facebook_pixel,
		consentManagement: issueExplanations.seo_critical_consent
	};

	return typeMap[seoCriticalType] || null;
}
