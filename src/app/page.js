"use client";
import { TextControl } from "@wordpress/components";
import "@wordpress/components/build-style/style.css";
import { useState } from "react";

/**
 * MyTextControl Component
 *
 * A reusable text input component for adding additional CSS classes.
 * Currently unused but available for future enhancements.
 *
 * @component
 * @returns {JSX.Element} WordPress TextControl component
 */
const MyTextControl = () => {
	const [className, setClassName] = useState("");

	return (
		<TextControl
			label="Additional CSS Class"
			value={className}
			onChange={(value) => setClassName(value)}
		/>
	);
};

/**
 * Downloads CSS content from a textarea element as a .css file.
 *
 * Creates a Blob from the textarea content, generates a temporary download link,
 * triggers the download, and cleans up the temporary resources.
 *
 * @param {string} id - The DOM id of the textarea element containing CSS content
 * @returns {null} Returns null if id is not provided
 *
 * @example
 * // Download content from textarea with id "minified_css"
 * downloadCSS("minified_css"); // Downloads as "minified_css.css"
 */
function downloadCSS(id) {
	if (!id) {
		return null;
	}
	const textarea = document.getElementById(id);
	const cssContent = textarea.value;
	const blob = new Blob([cssContent], { type: "text/css" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = id + ".css";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * Home Page Component
 *
 * Main page for the Critical CSS Generator application.
 * Allows users to enter a URL and extract/generate critical CSS from that webpage.
 *
 * @component
 * @returns {JSX.Element} The main application UI
 *
 * @description
 * Features:
 * - URL input form to specify target webpage
 * - Displays extracted stylesheets in a table (FileView component)
 * - Shows three CSS output variants: unminified, minified, and critical
 * - Download buttons for each CSS variant
 *
 * State:
 * - url: Target webpage URL
 * - minified: Combined and minified CSS from all stylesheets
 * - unminified: Raw combined CSS without minification
 * - criticalCss: CSS purged to only include rules used on the page
 * - stylesheets: Array of individual stylesheet metadata
 * - loading: API request loading state
 */
export default function Home() {
	const [url, setUrl] = useState("");
	const [minified, setMinified] = useState("");
	const [unminified, setUnMinified] = useState("");
	const [criticalCss, setCriticalCss] = useState("");
	const [stylesheets, setStylesheets] = useState([]);
	const [sizes, setSizes] = useState(null);
	const [loading, setLoading] = useState(false);
	const [copied, setCopied] = useState({ minified: false, critical: false });

	/**
	 * Copies CSS content from a textarea to the clipboard.
	 *
	 * @param {string} id - The DOM id of the textarea element
	 * @param {string} type - The type of CSS ('minified' or 'critical')
	 * @async
	 */
	const copyToClipboard = async (id, type) => {
		const textarea = document.getElementById(id);
		try {
			await navigator.clipboard.writeText(textarea.value);
			setCopied((prev) => ({ ...prev, [type]: true }));
			setTimeout(() => {
				setCopied((prev) => ({ ...prev, [type]: false }));
			}, 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	/**
	 * Handles form submission to fetch and process CSS from the target URL.
	 *
	 * Calls the /api/fetch-css endpoint with the user-provided URL,
	 * then updates state with the returned CSS variants and stylesheet metadata.
	 *
	 * @param {Event} e - Form submit event
	 * @async
	 */
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMinified("");

		try {
			const response = await fetch(
				`/api/fetch-css?url=${encodeURIComponent(url)}`
			);
			const data = await response.json();

			if (response.ok) {
				setMinified(data.minified);
				setUnMinified(data.unminified);
				setCriticalCss(data.critical);
				setStylesheets(data.stylesheets || []);
				setSizes(data.sizes || null);
			} else {
				setMinified(`Error: ${data.error}`);
			}
		} catch (error) {
			setMinified(`Error: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<header>
				<div className="container">
					<h1>Critical Path CSS Generator</h1>
				</div>
			</header>

			<main>
				<div className="container">
					<section className="hero">
						<h2>Optimize Your Page&apos;s CSS Performance</h2>
						<p className="hero-description">
							Reduce render-blocking CSS and speed up your page
							load. Enter any URL to extract and optimize its
							stylesheets.
						</p>
						<form
							className={"form"}
							onSubmit={handleSubmit}
						>
							<div className={"form-control"}>
								<input
									type="url"
									label="Enter URL"
									value={url}
									onChange={(value) => {
										console.log(value);
										setUrl(value.target.value);
									}}
									placeholder="https://example.com"
									required
								/>
								<button
									type="submit"
									variant="primary"
								>
									{loading
										? "Fetching CSS..."
										: "Generate CSS"}
								</button>
							</div>
						</form>
					</section>

					{/* AI Orb Loader */}
					{loading && (
						<div className="loader-container">
							<div className="loader-orb">
								<div className="loader-orb-inner"></div>
							</div>
							<p className="loader-text">
								Analyzing stylesheets...
							</p>
						</div>
					)}

					{/* <FileView stylesheets={stylesheets} /> */}
					{minified && !loading && (
						<section
							id="results"
							className="critical-css-results"
						>
							<div className="critical-css-result critical-css-minified">
								<div className="result-header">
									<h3>Combined & Minified CSS</h3>
									<p className="result-description">
										All stylesheets from the page merged
										into one optimized file.
										<strong>Why it matters:</strong> Fewer
										HTTP requests means faster page loads.
										<strong>How to use:</strong> Replace all
										your CSS &lt;link&gt; tags with a single
										reference to this file.
									</p>
								</div>

								<div className="result-code-container">
									<div className="result-code-header">
										<span className="result-filename">
											combined.min.css
										</span>
										{sizes && (
											<span className="result-size-badge">
												{sizes.originalFormatted} →{" "}
												{sizes.minifiedFormatted}
												<span className="size-reduction">
													({sizes.minifiedReduction}%
													smaller)
												</span>
											</span>
										)}
									</div>
									<textarea
										id="minified_css"
										name="minified_css"
										rows={10}
										defaultValue={minified}
									/>
								</div>

								<div className="result-actions">
									<button
										className="critical-css-result-action"
										type="button"
										disabled={loading}
										onClick={() =>
											downloadCSS("minified_css")
										}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
											<polyline points="7 10 12 15 17 10" />
											<line
												x1="12"
												y1="15"
												x2="12"
												y2="3"
											/>
										</svg>
										Download CSS
									</button>
									<button
										className="critical-css-result-action secondary"
										type="button"
										onClick={() =>
											copyToClipboard(
												"minified_css",
												"minified"
											)
										}
									>
										{copied.minified ? (
											<>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<polyline points="20 6 9 17 4 12" />
												</svg>
												Copied!
											</>
										) : (
											<>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<rect
														x="9"
														y="9"
														width="13"
														height="13"
														rx="2"
														ry="2"
													/>
													<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
												</svg>
												Copy CSS
											</>
										)}
									</button>
								</div>
							</div>
						</section>
					)}
					{criticalCss && !loading && (
						<section
							id="results-critical"
							className="critical-css-results"
						>
							<div className="critical-css-result critical-css-critical">
								<div className="result-header">
									<h3>Critical CSS (Above-the-Fold)</h3>
									<p className="result-description">
										Only the CSS needed to render visible
										content before scrolling.
										<strong>Why it matters:</strong>{" "}
										Eliminates render-blocking CSS for
										instant first paint.
										<strong>How to use:</strong> Inline this
										in a &lt;style&gt; tag in your
										&lt;head&gt;, then load the full CSS
										asynchronously.
									</p>
								</div>

								<div className="result-code-container">
									<div className="result-code-header">
										<span className="result-filename">
											critical.css
										</span>
										{sizes && (
											<span className="result-size-badge">
												{sizes.originalFormatted} →{" "}
												{sizes.criticalFormatted}
												<span className="size-reduction">
													({sizes.criticalReduction}%
													smaller)
												</span>
											</span>
										)}
									</div>
									<textarea
										id="minified_critical_css"
										name="minified_critical_css"
										rows={10}
										defaultValue={criticalCss}
									/>
								</div>

								<div className="result-actions">
									<button
										className="critical-css-result-action"
										type="button"
										disabled={loading}
										onClick={() =>
											downloadCSS("minified_critical_css")
										}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
											<polyline points="7 10 12 15 17 10" />
											<line
												x1="12"
												y1="15"
												x2="12"
												y2="3"
											/>
										</svg>
										Download CSS
									</button>
									<button
										className="critical-css-result-action secondary"
										type="button"
										onClick={() =>
											copyToClipboard(
												"minified_critical_css",
												"critical"
											)
										}
									>
										{copied.critical ? (
											<>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<polyline points="20 6 9 17 4 12" />
												</svg>
												Copied!
											</>
										) : (
											<>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<rect
														x="9"
														y="9"
														width="13"
														height="13"
														rx="2"
														ry="2"
													/>
													<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
												</svg>
												Copy CSS
											</>
										)}
									</button>
								</div>
							</div>
						</section>
					)}
				</div>
			</main>

			<footer>
				<div className="container">
					<p>&copy; 2024 Your Company</p>
				</div>
			</footer>
		</div>
	);
}
