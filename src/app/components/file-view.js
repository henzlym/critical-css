import { DataViews } from "@wordpress/dataviews";
import "@wordpress/dataviews/build-style/style.css";
import { useState } from "react";

/**
 * @typedef {Object} Stylesheet
 * @property {number} id - Unique identifier for the stylesheet
 * @property {string} url - Full URL of the stylesheet
 * @property {string} filename - Extracted filename from the URL
 * @property {number} size - File size in bytes
 * @property {string} sizeFormatted - Human-readable file size (e.g., "12.5 KB")
 */

/**
 * FileView Component
 *
 * Displays a table of extracted stylesheets from a webpage using WordPress DataViews.
 * Shows filename, size, and URL for each stylesheet with sorting and pagination support.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Stylesheet[]} [props.stylesheets=[]] - Array of stylesheet objects to display
 * @returns {JSX.Element|null} DataViews table or null if no stylesheets
 *
 * @example
 * const stylesheets = [
 *   { id: 1, url: "https://example.com/style.css", filename: "style.css", size: 1024, sizeFormatted: "1.0 KB" }
 * ];
 * <FileView stylesheets={stylesheets} />
 */
export default function FileView({ stylesheets = [] }) {
	const [view, setView] = useState({
		type: "table",
		perPage: 10,
		page: 1,
		sort: {
			field: "size",
			direction: "desc",
		},
		search: "",
		filters: [],
		fields: ["filename", "sizeFormatted", "url"],
		layout: {},
	});

	/**
	 * DataViews field configuration for the stylesheet table.
	 * Defines columns: filename, size (sortable by bytes), and URL (truncated with link).
	 * @type {Array<Object>}
	 */
	const fields = [
		{
			id: "filename",
			header: "Filename",
			enableHiding: false,
			enableSorting: true,
		},
		{
			id: "sizeFormatted",
			header: "Size",
			enableHiding: false,
			enableSorting: true,
			getValue: ({ item }) => item.size,
		},
		{
			id: "url",
			header: "URL",
			enableHiding: true,
			render: ({ item }) => (
				<a
					href={item.url}
					target="_blank"
					rel="noopener noreferrer"
					title={item.url}
				>
					{item.url.length > 50
						? item.url.substring(0, 50) + "..."
						: item.url}
				</a>
			),
		},
	];

	const totalPages = Math.ceil(stylesheets.length / view.perPage);

	if (stylesheets.length === 0) {
		return null;
	}

	return (
		<div className="file-view">
			<h3>Extracted Stylesheets ({stylesheets.length})</h3>
			<DataViews
				data={stylesheets}
				fields={fields}
				view={view}
				onChangeView={setView}
				paginationInfo={{
					totalItems: stylesheets.length,
					totalPages,
				}}
			/>
		</div>
	);
}
