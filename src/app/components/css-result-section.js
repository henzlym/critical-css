"use client";

import { useState, useEffect, useRef } from "react";
import {
	CheckIcon,
	ChevronIcon,
	CopyIcon,
	DownloadIcon,
	ErrorIcon,
	HelpIcon,
} from "./icons";

/**
 * Downloads CSS content as a .css file.
 *
 * @param {string} content - The CSS content to download
 * @param {string} filename - The filename for the download
 */
function downloadCSS(content, filename) {
	if (!content) return;
	const blob = new Blob([content], { type: "text/css" });
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
 * CssResultSection Component
 *
 * Reusable component for displaying CSS extraction results with
 * collapsible content, copy/download actions, and size information.
 *
 * @component
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.description - Section description
 * @param {string} props.cssContent - The CSS content to display
 * @param {string} props.filename - Filename for display and download
 * @param {Object} props.sizes - Size information object
 * @param {string} props.sizes.originalFormatted - Original size formatted
 * @param {string} props.sizes.currentFormatted - Current size formatted
 * @param {number} props.sizes.reduction - Percentage reduction
 * @param {boolean} props.isExpanded - Whether section is expanded
 * @param {Function} props.onToggle - Toggle expand/collapse callback
 * @param {Function} props.onOpenInstructions - Open instructions drawer callback
 * @param {boolean} props.copied - Whether content was recently copied
 * @param {Function} props.onCopy - Copy to clipboard callback
 * @param {boolean} props.loading - Loading state
 * @param {string} props.variant - 'minified' or 'critical' for styling
 */
export default function CssResultSection({
	title,
	description,
	cssContent,
	filename,
	sizes,
	isExpanded,
	onToggle,
	onOpenInstructions,
	copied,
	onCopy,
	loading,
	variant = "minified",
}) {
	const [copyError, setCopyError] = useState(false);
	const errorTimeoutRef = useRef(undefined);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (errorTimeoutRef.current) {
				clearTimeout(errorTimeoutRef.current);
			}
		};
	}, []);

	const handleDownload = () => {
		downloadCSS(cssContent, filename);
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(cssContent);
			setCopyError(false);
			onCopy();
		} catch (err) {
			console.error("Failed to copy:", err);
			setCopyError(true);
			// Clear any existing timeout
			if (errorTimeoutRef.current) {
				clearTimeout(errorTimeoutRef.current);
			}
			// Clear error state after 2 seconds
			errorTimeoutRef.current = setTimeout(
				() => setCopyError(false),
				2000
			);
		}
	};

	return (
		<section className="critical-css-results">
			<div
				className={`critical-css-result critical-css-${variant} ${
					isExpanded ? "expanded" : "collapsed"
				}`}
			>
				<div
					className="result-header collapsible-header"
					onClick={onToggle}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => e.key === "Enter" && onToggle()}
					aria-expanded={isExpanded}
				>
					<div className="result-header-top">
						<div className="result-title-row">
							<span
								className={`collapse-icon ${
									isExpanded ? "expanded" : ""
								}`}
							>
								<ChevronIcon />
							</span>
							<h3>{title}</h3>
							{sizes && (
								<span className="result-size-badge header-badge">
									{sizes.currentFormatted}
									<span className="size-reduction">
										({sizes.reduction}% smaller)
									</span>
								</span>
							)}
						</div>
						<button
							className="how-to-use-btn"
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onOpenInstructions();
							}}
						>
							<HelpIcon />
							How to Use
						</button>
					</div>
					<p className="result-description">{description}</p>
				</div>

				<div
					className={`collapsible-content ${
						isExpanded ? "expanded" : ""
					}`}
				>
					<div className="result-code-container">
						<div className="result-code-header">
							<span className="result-filename">{filename}</span>
							{sizes && (
								<span className="result-size-badge">
									{sizes.originalFormatted} →{" "}
									{sizes.currentFormatted}
									<span className="size-reduction">
										({sizes.reduction}% smaller)
									</span>
								</span>
							)}
						</div>
						<textarea
							id={`css_${variant}_textarea`}
							name={`css_${variant}`}
							rows={10}
							value={cssContent}
							readOnly
							aria-label={`${title} content`}
						/>
					</div>

					<div className="result-actions">
						<button
							className="critical-css-result-action"
							type="button"
							disabled={loading}
							onClick={handleDownload}
						>
							<DownloadIcon />
							Download CSS
						</button>
						<button
							className={`critical-css-result-action secondary${
								copyError ? " error" : ""
							}`}
							type="button"
							onClick={handleCopy}
						>
							{copyError ? (
								<>
									<ErrorIcon />
									Copy Failed
								</>
							) : copied ? (
								<>
									<CheckIcon />
									Copied!
								</>
							) : (
								<>
									<CopyIcon />
									Copy CSS
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
