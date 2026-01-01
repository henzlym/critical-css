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
