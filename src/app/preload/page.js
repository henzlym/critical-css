"use client";

import { useState } from "react";

/**
 * Downloads content as a file
 */
function downloadFile(content, filename) {
	const blob = new Blob([content], { type: "text/html" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * Preload Tags Generator Page
 *
 * Analyzes a webpage and generates optimized preload, preconnect,
 * and dns-prefetch tags for improved loading performance.
 */
export default function PreloadPage() {
	const [url, setUrl] = useState("");
	const [loading, setLoading] = useState(false);
	const [preloadTags, setPreloadTags] = useState(null);
	const [error, setError] = useState(null);
	const [copied, setCopied] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setPreloadTags(null);

		try {
			const response = await fetch(
				`/api/fetch-css?url=${encodeURIComponent(url)}`
			);
			const data = await response.json();

			if (response.ok && data.preloadTags) {
				setPreloadTags(data.preloadTags);
			} else {
				setError(data.error || "Failed to analyze page");
			}
		} catch (err) {
			setError(`Failed to connect to API: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	const copyToClipboard = async (text) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	const {
		stats,
		html,
		fontPreloads,
		imagePreloads,
		dnsPrefetch,
		preconnect,
	} = preloadTags || {};

	const totalTags =
		(stats?.fontsPreloaded || 0) +
		(stats?.imagesPreloaded || 0) +
		(stats?.domainsPreconnected || 0) +
		(stats?.domainsPrefetched || 0);

	return (
		<div>
			<header>
				<div className="container">
					<h1>Preload Tag Generator</h1>
					<nav>
						<a href="/">Critical CSS</a>
						<a
							href="/preload"
							className="active"
						>
							Preload Tags
						</a>
					</nav>
				</div>
			</header>

			<main>
				<div className="container">
					<section className="hero">
						<h2>Generate Preload & Prefetch Tags</h2>
						<p className="hero-description">
							Analyze any webpage to generate optimized
							preconnect, dns-prefetch, and preload hints. Speed
							up resource loading by telling browsers what to
							fetch ahead of time.
						</p>
						<form
							className="form"
							onSubmit={handleSubmit}
						>
							<div className="form-control">
								<input
									type="url"
									value={url}
									onChange={(e) => setUrl(e.target.value)}
									placeholder="https://example.com"
									required
								/>
								<button
									type="submit"
									disabled={loading}
								>
									{loading ? "Analyzing..." : "Generate Tags"}
								</button>
							</div>
						</form>
					</section>

					{/* Loader */}
					{loading && (
						<div className="loader-container">
							<div className="loader-orb">
								<div className="loader-orb-inner"></div>
							</div>
							<p className="loader-text">
								Analyzing page resources...
							</p>
						</div>
					)}

					{/* Error */}
					{error && !loading && (
						<section className="critical-css-results">
							<div className="critical-css-result error-result">
								<div className="result-header">
									<h3>Error</h3>
									<p className="result-description">
										{error}
									</p>
								</div>
							</div>
						</section>
					)}

					{/* Results */}
					{preloadTags && !loading && totalTags > 0 && (
						<>
							{/* Stats Overview */}
							<section className="preload-overview">
								<h3>Resources Detected</h3>
								<div className="preload-stats-grid large">
									{stats?.domainsPreconnected > 0 && (
										<div className="preload-stat">
											<span className="preload-stat-value">
												{stats.domainsPreconnected}
											</span>
											<span className="preload-stat-label">
												Preconnect
											</span>
											<span className="preload-stat-desc">
												Critical external domains
											</span>
										</div>
									)}
									{stats?.domainsPrefetched > 0 && (
										<div className="preload-stat">
											<span className="preload-stat-value">
												{stats.domainsPrefetched}
											</span>
											<span className="preload-stat-label">
												DNS Prefetch
											</span>
											<span className="preload-stat-desc">
												Domain name lookups
											</span>
										</div>
									)}
									{stats?.fontsPreloaded > 0 && (
										<div className="preload-stat">
											<span className="preload-stat-value">
												{stats.fontsPreloaded}
											</span>
											<span className="preload-stat-label">
												Fonts
											</span>
											<span className="preload-stat-desc">
												Web fonts to preload
											</span>
										</div>
									)}
									{stats?.imagesPreloaded > 0 && (
										<div className="preload-stat">
											<span className="preload-stat-value">
												{stats.imagesPreloaded}
											</span>
											<span className="preload-stat-label">
												Images
											</span>
											<span className="preload-stat-desc">
												Above-the-fold images
											</span>
										</div>
									)}
								</div>
							</section>

							{/* All Tags Combined */}
							<section className="critical-css-results">
								<div className="critical-css-result preload-tags-result expanded">
									<div className="result-header">
										<div className="result-header-top">
											<div className="result-title-row">
												<h3>All Preload Tags</h3>
												<span className="result-size-badge header-badge">
													{totalTags} tags
												</span>
											</div>
										</div>
										<p className="result-description">
											Copy and paste these tags into your
											HTML {"<head>"} section for optimal
											loading performance.
										</p>
									</div>

									<div className="result-code-container">
										<div className="result-code-header">
											<span className="result-filename">
												preload-tags.html
											</span>
										</div>
										<textarea
											id="all_preload_tags"
											rows={Math.min(15, totalTags + 2)}
											value={html}
											readOnly
										/>
									</div>

									<div className="result-actions">
										<button
											className="critical-css-result-action"
											type="button"
											onClick={() =>
												downloadFile(
													html,
													"preload-tags.html"
												)
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
											Download
										</button>
										<button
											className="critical-css-result-action secondary"
											type="button"
											onClick={() =>
												copyToClipboard(html)
											}
										>
											{copied ? (
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
													Copy All
												</>
											)}
										</button>
									</div>
								</div>
							</section>

							{/* Individual Tag Sections */}
							{preconnect?.length > 0 && (
								<section className="critical-css-results">
									<div className="critical-css-result">
										<div className="result-header">
											<h3>Preconnect Tags</h3>
											<p className="result-description">
												Establishes early connections to
												important third-party origins.
												This includes DNS lookup, TCP
												handshake, and TLS negotiation.
											</p>
										</div>
										<div className="result-code-container">
											<div className="result-code-header">
												<span className="result-filename">
													preconnect.html
												</span>
												<span className="result-size-badge">
													{preconnect.length} domains
												</span>
											</div>
											<textarea
												rows={Math.min(
													8,
													preconnect.length + 1
												)}
												value={preconnect.join("\n")}
												readOnly
											/>
										</div>
									</div>
								</section>
							)}

							{dnsPrefetch?.length > 0 && (
								<section className="critical-css-results">
									<div className="critical-css-result">
										<div className="result-header">
											<h3>DNS Prefetch Tags</h3>
											<p className="result-description">
												Resolves domain names ahead of
												time. Lighter than preconnect,
												useful for domains you might
												need later.
											</p>
										</div>
										<div className="result-code-container">
											<div className="result-code-header">
												<span className="result-filename">
													dns-prefetch.html
												</span>
												<span className="result-size-badge">
													{dnsPrefetch.length} domains
												</span>
											</div>
											<textarea
												rows={Math.min(
													8,
													dnsPrefetch.length + 1
												)}
												value={dnsPrefetch.join("\n")}
												readOnly
											/>
										</div>
									</div>
								</section>
							)}

							{fontPreloads?.length > 0 && (
								<section className="critical-css-results">
									<div className="critical-css-result">
										<div className="result-header">
											<h3>Font Preloads</h3>
											<p className="result-description">
												Preload web fonts to prevent
												Flash of Unstyled Text (FOUT).
												Browsers will fetch these with
												high priority.
											</p>
										</div>
										<div className="result-code-container">
											<div className="result-code-header">
												<span className="result-filename">
													font-preloads.html
												</span>
												<span className="result-size-badge">
													{fontPreloads.length} fonts
												</span>
											</div>
											<textarea
												rows={Math.min(
													8,
													fontPreloads.length + 1
												)}
												value={fontPreloads.join("\n")}
												readOnly
											/>
										</div>
									</div>
								</section>
							)}

							{imagePreloads?.length > 0 && (
								<section className="critical-css-results">
									<div className="critical-css-result">
										<div className="result-header">
											<h3>Image Preloads</h3>
											<p className="result-description">
												Above-the-fold images that
												should be loaded with high
												priority for faster Largest
												Contentful Paint (LCP).
											</p>
										</div>
										<div className="result-code-container">
											<div className="result-code-header">
												<span className="result-filename">
													image-preloads.html
												</span>
												<span className="result-size-badge">
													{imagePreloads.length}{" "}
													images
												</span>
											</div>
											<textarea
												rows={Math.min(
													8,
													imagePreloads.length + 1
												)}
												value={imagePreloads.join("\n")}
												readOnly
											/>
										</div>
									</div>
								</section>
							)}

							{/* Usage Instructions */}
							<section className="preload-instructions">
								<h3>How to Use These Tags</h3>
								<div className="instruction-cards">
									<div className="instruction-card">
										<div className="instruction-card-number">
											1
										</div>
										<h4>Copy the tags</h4>
										<p>
											Use the &quot;Copy All&quot; button
											above to copy all generated tags to
											your clipboard.
										</p>
									</div>
									<div className="instruction-card">
										<div className="instruction-card-number">
											2
										</div>
										<h4>Paste in {"<head>"}</h4>
										<p>
											Add the tags to your HTML {"<head>"}{" "}
											section, ideally near the top before
											other resources.
										</p>
									</div>
									<div className="instruction-card">
										<div className="instruction-card-number">
											3
										</div>
										<h4>Test performance</h4>
										<p>
											Use Chrome DevTools or PageSpeed
											Insights to verify improved loading
											times.
										</p>
									</div>
								</div>
							</section>
						</>
					)}

					{/* No tags found */}
					{preloadTags && !loading && totalTags === 0 && (
						<section className="critical-css-results">
							<div className="critical-css-result">
								<div className="result-header">
									<h3>No Preloadable Resources Found</h3>
									<p className="result-description">
										The page doesn&apos;t have any external
										resources that would benefit from
										preloading. This could mean the page is
										already well-optimized or uses inline
										resources.
									</p>
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
