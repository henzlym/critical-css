"use client";
import { useState } from "react";
import CodeBlock from "./instructions-drawer";

/**
 * ScriptCard Component
 *
 * Displays detailed information about a script with recommendations
 *
 * @param {Object} props
 * @param {Object} props.script - Script object with all analysis data
 */
export default function ScriptCard({ script }) {
	const [expanded, setExpanded] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(script.recommendation.codeExample);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	// Format file size
	const formatBytes = (bytes) => {
		if (!bytes) return 'N/A';
		if (bytes >= 1024 * 1024) {
			return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
		} else if (bytes >= 1024) {
			return `${(bytes / 1024).toFixed(1)} KB`;
		}
		return `${bytes} B`;
	};

	// Get criticality color
	const getCriticalityColor = (criticality) => {
		switch (criticality) {
			case 'critical': return 'badge-critical';
			case 'interactive': return 'badge-interactive';
			case 'non-essential': return 'badge-non-essential';
			case 'standard': return 'badge-standard';
			case 'custom': return 'badge-standard';
			default: return 'badge-standard';
		}
	};

	// Format criticality for display
	const formatCriticality = (criticality) => {
		switch (criticality) {
			case 'non-essential': return 'Non-Essential';
			case 'critical': return 'Critical';
			case 'interactive': return 'Interactive';
			case 'standard': return 'Standard';
			case 'custom': return 'Custom';
			default: return criticality.charAt(0).toUpperCase() + criticality.slice(1);
		}
	};

	return (
		<div className={`script-card ${script.recommendation.hasIssue ? 'has-issue' : ''}`}>
			<div className="script-header" onClick={() => setExpanded(!expanded)}>
				<div className="script-info">
					<h4>{script.vendor || (script.isInline ? 'Inline Script' : 'External Script')}</h4>
					{script.domain && <span className="script-domain">{script.domain}</span>}
					{script.isInline && <span className="script-domain">inline</span>}
				</div>

				<div className="script-badges">
					<span className={`badge ${getCriticalityColor(script.recommendation.criticality)}`}>
						{formatCriticality(script.recommendation.criticality)}
					</span>
					<span className="badge badge-category">
						{script.category}
					</span>
					{script.loading.isBlocking && (
						<span className="badge badge-warning">
							Blocking
						</span>
					)}
					<span className="badge badge-position">
						{script.position.location.charAt(0).toUpperCase() + script.position.location.slice(1)}
					</span>
				</div>

				<svg
					className={`chevron ${expanded ? 'expanded' : ''}`}
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<polyline points="6 9 12 15 18 9"></polyline>
				</svg>
			</div>

			{expanded && (
				<div className="script-details">
					<div className="implementation-comparison">
						<div className="current-state">
							<h5>Current Implementation</h5>
							<div className="info-table">
								<div className="info-row">
									<span className="info-label">Position</span>
									<span className="info-value">{script.position.location}</span>
								</div>
								<div className="info-row">
									<span className="info-label">Loading</span>
									<span className="info-value">{script.loading.strategy || 'synchronous'}</span>
								</div>
								{script.size && (
									<div className="info-row">
										<span className="info-label">Size</span>
										<span className="info-value">{formatBytes(script.size.transferSize)}</span>
									</div>
								)}
								{script.size && script.size.duration && (
									<div className="info-row">
										<span className="info-label">Load Time</span>
										<span className="info-value">{script.size.duration.toFixed(0)}ms</span>
									</div>
								)}
								{script.recommendation.blockingScore && (
									<div className="info-row">
										<span className="info-label">Blocking Score</span>
										<span className="info-value">{script.recommendation.blockingScore}/10</span>
									</div>
								)}
							</div>
						</div>

						<div className="recommendation">
							<h5>Recommended Optimization</h5>
							<div className="info-table">
								<div className="info-row">
									<span className="info-label">Criticality</span>
									<span className={`badge ${getCriticalityColor(script.recommendation.criticality)}`}>
										{formatCriticality(script.recommendation.criticality)}
									</span>
								</div>
								<div className="info-row">
									<span className="info-label">Strategy</span>
									<span className="info-value">{script.recommendation.suggestedStrategy}</span>
								</div>
								<div className="info-row">
									<span className="info-label">Position</span>
									<span className="info-value">{script.recommendation.suggestedPosition}</span>
								</div>
							</div>
							<p className="reason">{script.recommendation.reason}</p>
						</div>
					</div>

					<div className="code-comparison">
						<h5>Code Comparison</h5>
						<div className="code-comparison-grid">
							{/* Current Implementation */}
							<div className="code-block current-code">
								<div className="code-block-header">
									<span className="code-language">Current</span>
									<span className="code-badge">Before</span>
								</div>
								<pre className="code-content">
									<code>{script.recommendation.currentCode}</code>
								</pre>
							</div>

							{/* Recommended Implementation */}
							<div className="code-block recommended-code">
								<div className="code-block-header">
									<span className="code-language">Recommended</span>
									<button className="code-copy-btn" onClick={handleCopy}>
										{copied ? (
											<>
												<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
													<polyline points="20 6 9 17 4 12" />
												</svg>
												Copied!
											</>
										) : (
											<>
												<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
													<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
													<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
												</svg>
												Copy
											</>
										)}
									</button>
								</div>
								<pre className="code-content">
									<code>{script.recommendation.codeExample}</code>
								</pre>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
