"use client";
import { useState } from "react";
import FormInput from "../components/form-input";
import LoaderOrb from "../components/loader-orb";
import SummaryDashboard from "../components/summary-dashboard";
import CategoryGroup from "../components/category-group";

/**
 * RenderBlockingPage Component
 *
 * Main page for render-blocking resources analysis
 * Analyzes scripts and provides optimization recommendations
 */
export default function RenderBlockingPage() {
	const [url, setUrl] = useState("");
	const [results, setResults] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	/**
	 * Handle form submission
	 */
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setResults(null);

		try {
			const response = await fetch(`/api/analyze-render-blocking?url=${encodeURIComponent(url)}`);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.details || errorData.error || 'Failed to analyze page');
			}

			const data = await response.json();
			setResults(data);
		} catch (err) {
			console.error('Analysis error:', err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Handle URL input change
	 */
	const handleUrlChange = (e) => {
		setUrl(e.target.value);
	};

	// Priority order for categories
	const categoryOrder = [
		'analytics',
		'consent',
		'ab_testing',
		'advertising',
		'chat',
		'social',
		'cdn',
		'fonts',
		'maps',
		'video',
		'payments',
		'monitoring',
		'crm',
		'popups',
		'email',
		'support',
		'internal',
		'third_party',
		'other'  // Replaces 'unknown' - for uncategorized scripts
	];

	// Group scripts by blocking status, then by category
	const groupedScripts = results?.scriptsByCategory
		? (() => {
				const blocking = {};
				const nonBlocking = {};

				Object.keys(results.scriptsByCategory).forEach(category => {
					const scripts = results.scriptsByCategory[category];

					// Separate by blocking status
					const blockingScripts = scripts.filter(s => s.recommendation?.hasIssue || s.loading?.isBlocking);
					const nonBlockingScripts = scripts.filter(s => !s.recommendation?.hasIssue && !s.loading?.isBlocking);

					if (blockingScripts.length > 0) {
						blocking[category] = blockingScripts;
					}
					if (nonBlockingScripts.length > 0) {
						nonBlocking[category] = nonBlockingScripts;
					}
				});

				return { blocking, nonBlocking };
			})()
		: { blocking: {}, nonBlocking: {} };

	// Sort categories within each group
	const sortCategories = (categoriesObj) => {
		return Object.keys(categoriesObj).sort((a, b) => {
			const indexA = categoryOrder.indexOf(a);
			const indexB = categoryOrder.indexOf(b);
			if (indexA === -1) return 1;
			if (indexB === -1) return -1;
			return indexA - indexB;
		});
	};

	const blockingCategories = sortCategories(groupedScripts.blocking);
	const nonBlockingCategories = sortCategories(groupedScripts.nonBlocking);

	return (
		<div className="page-container">
			<main>
				<section className="hero">
				<h1>
					<span className="gradient-text">Render-Blocking</span> Resources Analysis
				</h1>
				<p className="subtitle">
					Identify and optimize render-blocking scripts for better Core Web Vitals.
					Get actionable recommendations with copy-ready code examples.
				</p>

				<FormInput
					url={url}
					onSubmit={handleSubmit}
					onChange={handleUrlChange}
					loading={loading}
					placeholder="https://example.com"
					buttonText="Analyze Page"
					loadingText="Analyzing..."
				/>
			</section>

			{loading && <LoaderOrb text="Analyzing render-blocking resources..." />}

			{error && (
				<section className="error-container">
					<div className="error-message">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<circle cx="12" cy="12" r="10"></circle>
							<line x1="12" y1="8" x2="12" y2="12"></line>
							<line x1="12" y1="16" x2="12.01" y2="16"></line>
						</svg>
						<h3>Analysis Failed</h3>
						<p>{error}</p>
						<button onClick={() => setError(null)} className="retry-button">
							Try Again
						</button>
					</div>
				</section>
			)}

			{results && !loading && (
				<section id="results" className="results-section">
					<SummaryDashboard
						summary={results.summary}
						insights={results.insights}
					/>

					<div className="scripts-section">
						{/* Blocking Scripts Section */}
						{blockingCategories.length > 0 && (
							<div className="blocking-scripts-group">
								<div className="section-header priority-header">
									<div className="header-with-badge">
										<h2>Blocking Scripts</h2>
										<span className="priority-badge warning">
											{Object.values(groupedScripts.blocking).flat().length} issues
										</span>
									</div>
									<p>These scripts are blocking page rendering and should be optimized first.</p>
								</div>

								{blockingCategories.map((category) => (
									<CategoryGroup
										key={category}
										category={category}
										scripts={groupedScripts.blocking[category]}
										defaultExpanded={true}
									/>
								))}
							</div>
						)}

						{/* Non-Blocking Scripts Section */}
						{nonBlockingCategories.length > 0 && (
							<div className="non-blocking-scripts-group">
								<div className="section-header">
									<div className="header-with-badge">
										<h2>Non-Blocking Scripts</h2>
										<span className="priority-badge success">
											{Object.values(groupedScripts.nonBlocking).flat().length} optimized
										</span>
									</div>
									<p>These scripts are already optimized or have minimal impact.</p>
								</div>

								{nonBlockingCategories.map((category) => (
									<CategoryGroup
										key={category}
										category={category}
										scripts={groupedScripts.nonBlocking[category]}
										defaultExpanded={false}
									/>
								))}
							</div>
						)}

						{blockingCategories.length === 0 && nonBlockingCategories.length === 0 && (
							<div className="no-scripts">
								<p>No scripts found on this page.</p>
							</div>
						)}
					</div>

					{results.stylesheets && results.stylesheets.length > 0 && (
						<div className="stylesheets-section">
							<div className="section-header">
								<h2>Stylesheets</h2>
								<p>{results.summary.renderBlockingStylesheets} render-blocking stylesheet{results.summary.renderBlockingStylesheets !== 1 ? 's' : ''} detected.</p>
							</div>

							<div className="stylesheets-note">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<circle cx="12" cy="12" r="10"></circle>
									<line x1="12" y1="16" x2="12" y2="12"></line>
									<line x1="12" y1="8" x2="12.01" y2="8"></line>
								</svg>
								<p>
									For stylesheet optimization, use our{" "}
									<a href="/">Critical CSS Generator</a> to extract and inline
									above-the-fold CSS.
								</p>
							</div>
						</div>
					)}

					<div className="next-steps">
						<h3>Next Steps</h3>
						<ol>
							<li>Copy the recommended code examples for scripts with issues</li>
							<li>Update your HTML to implement the suggestions</li>
							<li>Test your changes in a staging environment</li>
							<li>Run the analysis again to verify improvements</li>
							<li>Monitor your Core Web Vitals in Google Search Console</li>
						</ol>
					</div>
				</section>
			)}
			</main>
		</div>
	);
}
