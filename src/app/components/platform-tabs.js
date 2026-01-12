"use client";

/**
 * PlatformTabs Component
 *
 * Reusable tab navigation for selecting between platforms
 *
 * @param {Object} props
 * @param {Array} props.tabs - Array of { id, label }
 * @param {string} props.activeTab - Currently active tab ID
 * @param {Function} props.onTabChange - Callback when tab changes
 */
export default function PlatformTabs({ tabs, activeTab, onTabChange }) {
	return (
		<div className="platform-tabs" role="tablist">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					role="tab"
					aria-selected={activeTab === tab.id}
					className={`platform-tab ${activeTab === tab.id ? 'active' : ''}`}
					onClick={() => onTabChange(tab.id)}
					type="button"
				>
					{tab.label}
				</button>
			))}
		</div>
	);
}
