"use client";
import { useState } from "react";
import ScriptCard from "./script-card";

/**
 * CategoryGroup Component
 *
 * Groups scripts by category with collapsible sections
 *
 * @param {Object} props
 * @param {string} props.category - Category name
 * @param {Array} props.scripts - Scripts in this category
 * @param {boolean} props.defaultExpanded - Whether to start expanded
 */
export default function CategoryGroup({ category, scripts, defaultExpanded = false }) {
	const [expanded, setExpanded] = useState(defaultExpanded);

	// Format category name
	const formatCategoryName = (cat) => {
		const names = {
			'analytics': 'Analytics & Tracking',
			'advertising': 'Advertising',
			'ab_testing': 'A/B Testing',
			'chat': 'Chat Widgets',
			'consent': 'Cookie Consent',
			'social': 'Social Media',
			'cdn': 'CDN Libraries',
			'fonts': 'Web Fonts',
			'maps': 'Maps',
			'video': 'Video Players',
			'payments': 'Payment Gateways',
			'monitoring': 'Error Monitoring',
			'crm': 'CRM & Marketing',
			'popups': 'Popups & Modals',
			'email': 'Email Marketing',
			'support': 'Customer Support',
			'internal': 'Internal Scripts',
			'third_party': 'Third-Party Scripts',
			'other': 'Other Scripts'
		};
		return names[cat] || cat;
	};

	// Get category icon
	const getCategoryIcon = () => {
		const icons = {
			'analytics': (
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<line x1="18" y1="20" x2="18" y2="10"></line>
					<line x1="12" y1="20" x2="12" y2="4"></line>
					<line x1="6" y1="20" x2="6" y2="14"></line>
				</svg>
			),
			'chat': (
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
				</svg>
			),
			'advertising': (
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
					<polyline points="2 17 12 22 22 17"></polyline>
					<polyline points="2 12 12 17 22 12"></polyline>
				</svg>
			),
			'default': (
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<polyline points="16 18 22 12 16 6"></polyline>
					<polyline points="8 6 2 12 8 18"></polyline>
				</svg>
			)
		};
		return icons[category] || icons.default;
	};

	if (!scripts || scripts.length === 0) return null;

	return (
		<div className="category-group">
			<div className="category-header" onClick={() => setExpanded(!expanded)}>
				<div className="category-title">
					<div className="category-icon">{getCategoryIcon()}</div>
					<h3>{formatCategoryName(category)}</h3>
					<span className="count">{scripts.length}</span>
				</div>
				<svg
					className={`chevron ${expanded ? 'expanded' : ''}`}
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<polyline points="6 9 12 15 18 9"></polyline>
				</svg>
			</div>

			{expanded && (
				<div className="category-scripts">
					{scripts.map((script) => (
						<ScriptCard key={script.id} script={script} />
					))}
				</div>
			)}
		</div>
	);
}
