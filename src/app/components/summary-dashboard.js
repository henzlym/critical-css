"use client";
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
	if (!summary || !insights) return null;

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

				<div className={`summary-card ${summary.renderBlockingScripts > 0 ? 'warning' : 'success'}`}>
					<div className="summary-card-header">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<circle cx="12" cy="12" r="10"></circle>
							<line x1="12" y1="8" x2="12" y2="12"></line>
							<line x1="12" y1="16" x2="12.01" y2="16"></line>
						</svg>
						<h3>Render-Blocking</h3>
					</div>
					<div className="summary-card-value">{summary.renderBlockingScripts}</div>
					<div className="summary-card-subtitle">
						{summary.renderBlockingStylesheets} stylesheets
					</div>
				</div>

				<div className={`summary-card ${insights.potentialSavings > 0 ? 'success' : ''}`}>
					<div className="summary-card-header">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline>
						</svg>
						<h3>Potential Savings</h3>
					</div>
					<div className="summary-card-value">{insights.potentialSavings}ms</div>
					<div className="summary-card-subtitle">
						Currently {insights.totalBlockingTime}ms blocking time
					</div>
				</div>
			</div>

			{insights.mainIssues && insights.mainIssues.length > 0 && (
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
