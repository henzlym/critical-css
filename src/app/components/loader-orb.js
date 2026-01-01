"use client";

/**
 * LoaderOrb Component
 *
 * Animated loading indicator with orb animation and text
 *
 * @param {Object} props
 * @param {string} props.text - Loading message to display
 */
export default function LoaderOrb({ text = "Analyzing..." }) {
	return (
		<div className="loader-container">
			<div className="loader-orb">
				<div className="loader-orb-inner"></div>
			</div>
			<p className="loader-text">{text}</p>
		</div>
	);
}
