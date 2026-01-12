"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CheckIcon, ChevronIcon, CopyIcon, ErrorIcon } from "./icons";
import PlatformTabs from "./platform-tabs";
import { generateImplementationCode } from "../../lib/css-implementation-templates";

const PLATFORMS = [
	{ id: 'html', label: 'HTML' },
	{ id: 'wordpress', label: 'WordPress' },
	{ id: 'nextjs', label: 'Next.js' },
];

/**
 * ImplementationCodeGenerator Component
 *
 * Displays ready-to-paste implementation code with the user's
 * actual critical CSS embedded. Supports multiple platforms.
 *
 * @param {Object} props
 * @param {string} props.criticalCss - The generated critical CSS
 * @param {string} props.fullCssPath - Path to full CSS file for async loading
 * @param {boolean} props.isExpanded - Whether section is expanded
 * @param {Function} props.onToggle - Toggle expand/collapse callback
 */
export default function ImplementationCodeGenerator({
	criticalCss,
	fullCssPath = '/css/combined.min.css',
	isExpanded,
	onToggle,
}) {
	const [activePlatform, setActivePlatform] = useState('html');
	const [copied, setCopied] = useState(false);
	const [copyError, setCopyError] = useState(false);
	const copyTimeoutRef = useRef(null);

	// Generate code based on active platform
	const { code, language } = generateImplementationCode(
		activePlatform,
		criticalCss,
		fullCssPath
	);

	// Clear timeout helper
	const clearCopyTimeout = useCallback(() => {
		if (copyTimeoutRef.current) {
			clearTimeout(copyTimeoutRef.current);
		}
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => clearCopyTimeout();
	}, [clearCopyTimeout]);

	// Copy handler
	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopyError(false);
			setCopied(true);
			clearCopyTimeout();
			copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
			setCopyError(true);
			clearCopyTimeout();
			copyTimeoutRef.current = setTimeout(() => setCopyError(false), 2000);
		}
	};

	return (
		<section className="implementation-generator">
			<div
				className={`implementation-card ${isExpanded ? 'expanded' : 'collapsed'}`}
			>
				{/* Collapsible Header */}
				<div
					className="implementation-header collapsible-header"
					onClick={onToggle}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => e.key === 'Enter' && onToggle()}
					aria-expanded={isExpanded}
				>
					<div className="implementation-header-top">
						<div className="result-title-row">
							<span className={`collapse-icon ${isExpanded ? 'expanded' : ''}`}>
								<ChevronIcon />
							</span>
							<h3>Implementation Code</h3>
							<span className="implementation-badge">Ready to paste</span>
						</div>
					</div>
					<p className="result-description">
						Complete implementation code with your critical CSS embedded.
						Choose your platform and copy the entire snippet.
					</p>
				</div>

				{/* Collapsible Content */}
				<div className={`collapsible-content ${isExpanded ? 'expanded' : ''}`}>
					<div className="implementation-content">
						{/* Platform Tabs */}
						<PlatformTabs
							tabs={PLATFORMS}
							activeTab={activePlatform}
							onTabChange={setActivePlatform}
						/>

						{/* Code Display */}
						<div className="implementation-code-container">
							<div className="implementation-code-header">
								<span className="code-language">{language.toUpperCase()}</span>
								<button
									className={`implementation-copy-btn ${copyError ? 'error' : ''}`}
									onClick={handleCopy}
									type="button"
								>
									{copyError ? (
										<>
											<ErrorIcon size={14} />
											Copy Failed
										</>
									) : copied ? (
										<>
											<CheckIcon size={14} />
											Copied!
										</>
									) : (
										<>
											<CopyIcon size={14} />
											Copy Code
										</>
									)}
								</button>
							</div>
							<pre className="implementation-code">
								<code>{code}</code>
							</pre>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
