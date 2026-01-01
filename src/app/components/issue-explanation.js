"use client";
import { useState } from "react";

export default function IssueExplanation({ issue, explanation }) {
	const [showTechnical, setShowTechnical] = useState(false);

	// If no explanation data, show simple issue
	if (!explanation) {
		return (
			<li>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="8" x2="12" y2="12"></line>
					<line x1="12" y1="16" x2="12.01" y2="16"></line>
				</svg>
				{issue}
			</li>
		);
	}

	return (
		<li className="issue-with-explanation">
			<div className="issue-header">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="8" x2="12" y2="12"></line>
					<line x1="12" y1="16" x2="12.01" y2="16"></line>
				</svg>
				<span>{issue}</span>
			</div>

			{/* Level 1 & 2: Brief + Layman's Detailed (always shown) */}
			<div className="issue-explanation-default">
				<p className="issue-brief">{explanation.brief}</p>
				<p className="issue-layman">{explanation.laymanDetailed}</p>
			</div>

			{/* Toggle for Level 3: Technical Details */}
			<button
				className="learn-more-btn"
				onClick={() => setShowTechnical(!showTechnical)}
			>
				{showTechnical ? '− Show less technical detail' : '+ Show technical detail'}
			</button>

			{/* Level 3: Technical Detailed (toggle) */}
			{showTechnical && (
				<div className="issue-technical">
					<div dangerouslySetInnerHTML={{ __html: explanation.technicalDetailed }} />
				</div>
			)}
		</li>
	);
}
