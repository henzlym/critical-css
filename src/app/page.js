"use client";

import "@wordpress/components/build-style/style.css";
import { useState, useEffect, useRef } from "react";
import CssResultSection from "./components/css-result-section";
import InstructionsDrawer from "./components/instructions-drawer";

/**
 * Home Page Component
 *
 * Main page for the Critical CSS Generator application.
 * Allows users to enter a URL and extract/generate critical CSS from that webpage.
 *
 * @component
 * @returns {JSX.Element} The main application UI
 */
export default function Home() {
	const [url, setUrl] = useState("");
	const [loading, setLoading] = useState(false);

	// API response data grouped together
	const [cssData, setCssData] = useState({
		minified: "",
		unminified: "",
		critical: "",
		stylesheets: [],
		sizes: undefined,
	});

	// UI state
	const [copied, setCopied] = useState({ minified: false, critical: false });
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [drawerType, setDrawerType] = useState("minified");
	const [aboveFoldMode, setAboveFoldMode] = useState(true);
	const [sectionsExpanded, setSectionsExpanded] = useState({
		minified: false,
		critical: true,
	});

	// Ref to track copy timeout for cleanup
	const copyTimeoutRef = useRef(undefined);

	// Helper function to clear copy timeout
	const clearCopyTimeout = () => {
		if (copyTimeoutRef.current) {
			clearTimeout(copyTimeoutRef.current);
		}
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => clearCopyTimeout();
	}, []);

	const toggleSection = (section) => {
		setSectionsExpanded((prev) => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	const openInstructions = (type) => {
		setDrawerType(type);
		setDrawerOpen(true);
	};

	const handleCopy = (type) => {
		setCopied((prev) => ({ ...prev, [type]: true }));
		clearCopyTimeout();
		copyTimeoutRef.current = setTimeout(() => {
			setCopied((prev) => ({ ...prev, [type]: false }));
		}, 2000);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setCssData({
			minified: "",
			unminified: "",
			critical: "",
			stylesheets: [],
			sizes: undefined,
		});

		try {
			const mode = aboveFoldMode ? "above-fold" : "full";
			const response = await fetch(
				`/api/fetch-css?url=${encodeURIComponent(url)}&mode=${mode}`
			);
			const data = await response.json();

			if (response.ok) {
				setCssData({
					minified: data.minified,
					unminified: data.unminified,
					critical: data.critical,
					stylesheets: data.stylesheets || [],
					sizes: data.sizes || undefined,
				});
			} else {
				const errorMessage = `Error: ${data.error}\n\nDetails: ${
					data.details || "No additional details available"
				}`;
				setCssData((prev) => ({
					...prev,
					minified: errorMessage,
					critical: errorMessage,
				}));
			}
		} catch (error) {
			const errorMessage = `Error: Failed to connect to API\n\nDetails: ${error.message}`;
			setCssData((prev) => ({
				...prev,
				minified: errorMessage,
				critical: errorMessage,
			}));
		} finally {
			setLoading(false);
		}
	};

	const { minified, critical, sizes } = cssData;

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
							className="form"
							onSubmit={handleSubmit}
						>
							<div className="form-control">
								<label
									htmlFor="url-input"
									className="visually-hidden"
								>
									Website URL
								</label>
								<input
									id="url-input"
									type="url"
									value={url}
									onChange={(e) => setUrl(e.target.value)}
									placeholder="https://example.com"
									required
									aria-label="Enter the URL of the website to analyze"
								/>
								<button
									type="submit"
									disabled={loading}
								>
									{loading
										? "Fetching CSS..."
										: "Generate CSS"}
								</button>
							</div>
							<div className="form-options">
								<label
									htmlFor="above-fold-mode"
									className="toggle-option"
								>
									<input
										id="above-fold-mode"
										name="above-fold-mode"
										type="checkbox"
										checked={aboveFoldMode}
										onChange={(e) =>
											setAboveFoldMode(e.target.checked)
										}
										aria-describedby="above-fold-hint"
									/>
									<span className="toggle-slider"></span>
									<span className="toggle-label">
										Above-the-Fold Mode
										<span
											id="above-fold-hint"
											className="toggle-hint"
										>
											Extract CSS only for visible
											viewport content
										</span>
									</span>
								</label>
							</div>
						</form>
					</section>

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

					{minified && !loading && (
						<CssResultSection
							title="Combined & Minified CSS"
							description="All stylesheets merged into one optimized file. Fewer HTTP requests = faster page loads."
							cssContent={minified}
							filename="combined.min.css"
							sizes={
								sizes
									? {
											originalFormatted:
												sizes.originalFormatted,
											currentFormatted:
												sizes.minifiedFormatted,
											reduction: sizes.minifiedReduction,
									  }
									: undefined
							}
							isExpanded={sectionsExpanded.minified}
							onToggle={() => toggleSection("minified")}
							onOpenInstructions={() =>
								openInstructions("minified")
							}
							copied={copied.minified}
							onCopy={() => handleCopy("minified")}
							loading={loading}
							variant="minified"
						/>
					)}

					{critical && !loading && (
						<CssResultSection
							title="Critical CSS (Above-the-Fold)"
							description="Only the CSS needed for above-the-fold content. Eliminates render-blocking for instant first paint."
							cssContent={critical}
							filename="critical.css"
							sizes={
								sizes
									? {
											originalFormatted:
												sizes.originalFormatted,
											currentFormatted:
												sizes.criticalFormatted,
											reduction: sizes.criticalReduction,
									  }
									: undefined
							}
							isExpanded={sectionsExpanded.critical}
							onToggle={() => toggleSection("critical")}
							onOpenInstructions={() =>
								openInstructions("critical")
							}
							copied={copied.critical}
							onCopy={() => handleCopy("critical")}
							loading={loading}
							variant="critical"
						/>
					)}
				</div>
			</main>

			<footer>
				<div className="container">
					<p>&copy; 2025 Henzly Meghie</p>
				</div>
			</footer>

			<InstructionsDrawer
				isOpen={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				type={drawerType}
			/>
		</div>
	);
}
