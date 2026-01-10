"use client";
import { useState } from 'react';
import { getIssueExplanation } from '../../lib/issue-explanations';
import IssueExplanation from './issue-explanation';

/**
 * SummaryDashboard Component
 *
 * Displays summary cards and main issues for render-blocking analysis
 *
 * @param {Object} props
 * @param {Object} props.summary - Summary statistics
 * @param {Object} props.insights - Analysis insights
 */
export default function SummaryDashboard({ summary, insights }) {
	const [seoListExpanded, setSeoListExpanded] = useState(false);

	if (!summary || !insights) return null;

	const hasNoIssues = insights.hasNoIssues || insights.issueCount === 0;
	const hasSeoCriticalScripts = insights.seoCriticalCount > 0;

	return (
		<div className="summary-dashboard">
			<div className="summary-grid">
				<div className="summary-card">
					<div className="summary-card-header">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<polyline points="16 18 22 12 16 6"></polyline>
							<polyline points="8 6 2 12 8 18"></polyline>
						</svg>
						<h3>Total Scripts</h3>
					</div>
					<div className="summary-card-value">{summary.totalScripts}</div>
					<div className="summary-card-subtitle">
						{summary.thirdPartyScripts} third-party
					</div>
				</div>

				<div className={`summary-card ${insights.issueCount > 0 ? 'warning' : 'success'}`}>
					<div className="summary-card-header">
						{insights.issueCount > 0 ? (
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<circle cx="12" cy="12" r="10"></circle>
								<line x1="12" y1="8" x2="12" y2="12"></line>
								<line x1="12" y1="16" x2="12.01" y2="16"></line>
							</svg>
						) : (
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
								<polyline points="22 4 12 14.01 9 11.01"></polyline>
							</svg>
						)}
						<h3>{insights.issueCount > 0 ? 'Issues Found' : 'All Clear'}</h3>
					</div>
					<div className="summary-card-value">{insights.issueCount}</div>
					<div className="summary-card-subtitle">
						{insights.issueCount > 0
							? `${summary.renderBlockingScripts} render-blocking`
							: 'No blocking issues'}
					</div>
				</div>

				<div className={`summary-card ${insights.potentialSavings > 0 ? '' : 'success'}`}>
					<div className="summary-card-header">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline>
						</svg>
						<h3>{insights.potentialSavings > 0 ? 'Potential Savings' : 'Performance'}</h3>
					</div>
					<div className="summary-card-value">
						{insights.potentialSavings > 0 ? `${insights.potentialSavings}ms` : 'Optimized'}
					</div>
					<div className="summary-card-subtitle">
						{insights.potentialSavings > 0
							? `Currently ${insights.totalBlockingTime}ms blocking time`
							: 'No optimization needed'}
					</div>
				</div>
			</div>

			{/* Success State - No Issues Found */}
			{hasNoIssues && (
				<div className="main-issues success-state">
					<div className="success-header">
						<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
							<polyline points="22 4 12 14.01 9 11.01"></polyline>
						</svg>
						<h3>No Major Issues Found</h3>
					</div>
					<p className="success-message">
						{insights.successMessage || 'Your scripts are well-optimized for performance.'}
					</p>

					{/* SEO-Critical Scripts Info */}
					{hasSeoCriticalScripts && (
						<div className="seo-critical-info">
							<button
								type="button"
								className="seo-critical-toggle"
								onClick={() => setSeoListExpanded(!seoListExpanded)}
								aria-expanded={seoListExpanded}
							>
								<div className="seo-critical-header">
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="12" y1="16" x2="12" y2="12"></line>
										<line x1="12" y1="8" x2="12.01" y2="8"></line>
									</svg>
									<h4>SEO & Analytics Scripts Detected ({insights.seoCriticalCount})</h4>
								</div>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									className={`seo-critical-chevron ${seoListExpanded ? 'expanded' : ''}`}
								>
									<polyline points="6 9 12 15 18 9"></polyline>
								</svg>
							</button>
							{seoListExpanded && (
								<div className="seo-critical-content">
									<p className="seo-critical-note">
										We detected {insights.seoCriticalCount} script{insights.seoCriticalCount > 1 ? 's' : ''} that
										should remain in the {'<head>'} for proper SEO indexing and analytics tracking.
										Moving these scripts could negatively impact your search rankings or analytics accuracy.
									</p>
									<ul className="seo-critical-list">
										{insights.seoCriticalScripts?.map((script, index) => (
											<li key={index}>
												<strong>{script.name}</strong>
												<span className="seo-caveat">{script.caveat}</span>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					)}
				</div>
			)}

			{/* Issues Found State */}
			{!hasNoIssues && insights.mainIssues && insights.mainIssues.length > 0 && (
				<div className="main-issues">
					<h3>Main Issues</h3>
					<ul>
						{insights.mainIssues.map((issue, index) => {
							const explanation = getIssueExplanation(issue);
							return (
								<IssueExplanation
									key={index}
									issue={issue}
									explanation={explanation}
								/>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
}
