"use client";
import { useState, useEffect } from "react";

/**
 * Code block component with copy functionality
 */
function CodeBlock({ code, language = "html" }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	return (
		<div className="code-block">
			<div className="code-block-header">
				<span className="code-language">{language}</span>
				<button className="code-copy-btn" onClick={handleCopy}>
					{copied ? (
						<>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
							Copied!
						</>
					) : (
						<>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
								<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
							</svg>
							Copy
						</>
					)}
				</button>
			</div>
			<pre>
				<code>{code}</code>
			</pre>
		</div>
	);
}

/**
 * Instructions content for Combined & Minified CSS
 */
function MinifiedInstructions() {
	return (
		<div className="instructions-content">
			<div className="instruction-intro">
				<h3>Using Combined & Minified CSS</h3>
				<p>
					This CSS file contains all stylesheets from your page merged and
					optimized. Follow these steps to implement it on your site.
				</p>
			</div>

			<div className="instruction-step">
				<div className="step-number">1</div>
				<div className="step-content">
					<h4>Download or Copy the CSS</h4>
					<p>
						Use the download button to save the file, or copy the CSS
						directly to your clipboard.
					</p>
				</div>
			</div>

			<div className="instruction-step">
				<div className="step-number">2</div>
				<div className="step-content">
					<h4>Upload to Your Server</h4>
					<p>
						Save the file as <code>combined.min.css</code> in your website's
						CSS directory (e.g., <code>/css/</code> or <code>/assets/css/</code>).
					</p>
				</div>
			</div>

			<div className="instruction-step">
				<div className="step-number">3</div>
				<div className="step-content">
					<h4>Replace Existing CSS Links</h4>
					<p>
						Remove all your existing CSS <code>&lt;link&gt;</code> tags and
						replace them with a single reference:
					</p>
					<CodeBlock
						language="html"
						code={`<!-- Remove all existing CSS links -->
<!-- <link rel="stylesheet" href="style.css"> -->
<!-- <link rel="stylesheet" href="components.css"> -->
<!-- <link rel="stylesheet" href="theme.css"> -->

<!-- Add single optimized CSS file -->
<link rel="stylesheet" href="/css/combined.min.css">`}
					/>
				</div>
			</div>

			<div className="instruction-step">
				<div className="step-number">4</div>
				<div className="step-content">
					<h4>Verify Your Changes</h4>
					<p>
						Clear your browser cache and test your site. All styles should
						render exactly as before, but with improved load time.
					</p>
				</div>
			</div>

			<div className="instruction-tip">
				<div className="tip-icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="16" x2="12" y2="12" />
						<line x1="12" y1="8" x2="12.01" y2="8" />
					</svg>
				</div>
				<div className="tip-content">
					<strong>Pro Tip:</strong> Fewer HTTP requests = faster page loads.
					By combining all your CSS into one file, you eliminate multiple
					round-trips to the server.
				</div>
			</div>
		</div>
	);
}

/**
 * Instructions content for Critical CSS
 */
function CriticalInstructions() {
	return (
		<div className="instructions-content">
			<div className="instruction-intro">
				<h3>Using Critical CSS</h3>
				<p>
					Critical CSS contains only the styles needed for above-the-fold
					content. Implementing it correctly can dramatically improve your
					page's perceived load time.
				</p>
			</div>

			<div className="instruction-step">
				<div className="step-number">1</div>
				<div className="step-content">
					<h4>Inline Critical CSS in Your HTML</h4>
					<p>
						Copy the critical CSS and paste it directly in a{" "}
						<code>&lt;style&gt;</code> tag within your{" "}
						<code>&lt;head&gt;</code>:
					</p>
					<CodeBlock
						language="html"
						code={`<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Page Title</title>

  <!-- Inline Critical CSS -->
  <style>
    /* Paste your critical CSS here */
    .header{display:flex;align-items:center}
    .hero{padding:2rem}
    /* ... rest of critical CSS */
  </style>
</head>`}
					/>
				</div>
			</div>

			<div className="instruction-step">
				<div className="step-number">2</div>
				<div className="step-content">
					<h4>Load Full CSS Asynchronously</h4>
					<p>
						Load your complete CSS file without blocking page render using
						the <code>media</code> trick or JavaScript:
					</p>
					<CodeBlock
						language="html"
						code={`<!-- Method 1: Media attribute trick (Recommended) -->
<link rel="stylesheet"
      href="/css/combined.min.css"
      media="print"
      onload="this.media='all'">
<noscript>
  <link rel="stylesheet" href="/css/combined.min.css">
</noscript>`}
					/>
					<p style={{ marginTop: "1rem" }}>Or use the preload approach:</p>
					<CodeBlock
						language="html"
						code={`<!-- Method 2: Preload approach -->
<link rel="preload"
      href="/css/combined.min.css"
      as="style"
      onload="this.onload=null;this.rel='stylesheet'">
<noscript>
  <link rel="stylesheet" href="/css/combined.min.css">
</noscript>`}
					/>
				</div>
			</div>

			<div className="instruction-step">
				<div className="step-number">3</div>
				<div className="step-content">
					<h4>Complete Example</h4>
					<p>Here's how your complete <code>&lt;head&gt;</code> should look:</p>
					<CodeBlock
						language="html"
						code={`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Page Title</title>

  <!-- Critical CSS (inlined for instant render) -->
  <style>
    /* Your critical CSS here */
  </style>

  <!-- Full CSS (loaded async, non-blocking) -->
  <link rel="stylesheet"
        href="/css/combined.min.css"
        media="print"
        onload="this.media='all'">
  <noscript>
    <link rel="stylesheet" href="/css/combined.min.css">
  </noscript>
</head>
<body>
  <!-- Your content -->
</body>
</html>`}
					/>
				</div>
			</div>

			<div className="instruction-step">
				<div className="step-number">4</div>
				<div className="step-content">
					<h4>WordPress Users</h4>
					<p>
						If you're using WordPress, you can add critical CSS to your theme's{" "}
						<code>header.php</code> or use the <code>wp_head</code> action:
					</p>
					<CodeBlock
						language="php"
						code={`// In your theme's functions.php
add_action('wp_head', function() {
  ?>
  <style id="critical-css">
    /* Your critical CSS here */
  </style>
  <?php
}, 1); // Priority 1 = very early`}
					/>
				</div>
			</div>

			<div className="instruction-tip success">
				<div className="tip-icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
						<polyline points="22 4 12 14.01 9 11.01" />
					</svg>
				</div>
				<div className="tip-content">
					<strong>Performance Impact:</strong> Inlining critical CSS eliminates
					render-blocking requests, allowing the browser to paint content
					immediately. This can improve LCP (Largest Contentful Paint) by 50%
					or more!
				</div>
			</div>

			<div className="instruction-tip warning">
				<div className="tip-icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
						<line x1="12" y1="9" x2="12" y2="13" />
						<line x1="12" y1="17" x2="12.01" y2="17" />
					</svg>
				</div>
				<div className="tip-content">
					<strong>Important:</strong> Critical CSS is page-specific. If your
					above-the-fold content differs between pages, you may need to
					generate critical CSS for each unique template.
				</div>
			</div>
		</div>
	);
}

/**
 * InstructionsDrawer Component
 *
 * A slide-out panel that displays usage instructions for CSS optimization.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the drawer is open
 * @param {function} props.onClose - Callback to close the drawer
 * @param {string} props.type - Type of instructions: 'minified' or 'critical'
 */
export default function InstructionsDrawer({ isOpen, onClose, type }) {
	// Handle escape key to close drawer
	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === "Escape" && isOpen) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen, onClose]);

	// Prevent body scroll when drawer is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	return (
		<>
			{/* Backdrop */}
			<div
				className={`drawer-backdrop ${isOpen ? "open" : ""}`}
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* Drawer */}
			<div
				className={`instructions-drawer ${isOpen ? "open" : ""}`}
				role="dialog"
				aria-modal="true"
				aria-label={`How to use ${type === "critical" ? "Critical" : "Combined"} CSS`}
			>
				<div className="drawer-header">
					<h2>
						{type === "critical"
							? "How to Use Critical CSS"
							: "How to Use Combined CSS"}
					</h2>
					<button
						className="drawer-close"
						onClick={onClose}
						aria-label="Close instructions"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>

				<div className="drawer-body">
					{type === "critical" ? (
						<CriticalInstructions />
					) : (
						<MinifiedInstructions />
					)}
				</div>
			</div>
		</>
	);
}
