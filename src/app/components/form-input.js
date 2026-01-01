"use client";

/**
 * FormInput Component
 *
 * Reusable URL input form for analysis pages
 *
 * @param {Object} props
 * @param {string} props.url - Current URL value
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.onChange - URL change handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.buttonText - Submit button text
 * @param {string} props.loadingText - Button text while loading
 */
export default function FormInput({
	url,
	onSubmit,
	onChange,
	loading = false,
	placeholder = "https://example.com",
	buttonText = "Analyze",
	loadingText = "Analyzing..."
}) {
	return (
		<form className="form" onSubmit={onSubmit}>
			<div className="form-control">
				<input
					type="url"
					label="Enter URL"
					value={url}
					onChange={onChange}
					placeholder={placeholder}
					required
					disabled={loading}
				/>
				<button
					type="submit"
					variant="primary"
					disabled={loading}
				>
					{loading ? loadingText : buttonText}
				</button>
			</div>
		</form>
	);
}
