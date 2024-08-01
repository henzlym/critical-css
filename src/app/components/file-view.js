import { DataViews } from "@wordpress/dataviews";
import { __ } from "@wordpress/i18n";
import { useState } from "react";
export default function FileView() {
	const [view, setView] = useState({
		type: "table",
		perPage: 5,
		page: 1,
		sort: {
			field: "filename",
			direction: "desc",
		},
		search: "",
		filters: [],
		fields: ["filename", "author", "status"],
		layout: {},
	});

	const data = [
		{
			id: 1,
			filename: "Title",
			author: "Admin",
			date: "2012-04-23T18:25:43.511Z",
		},
		{
			id: 2,
			filename: "Title two",
			author: "Admin",
			date: "2012-04-23T18:25:43.511Z",
		},
		{
			id: 1,
			filename: "Title three",
			author: "Admin",
			date: "2012-04-23T18:25:43.511Z",
		},
		{
			id: 1,
			filename: "Title three",
			author: "Admin",
			date: "2012-04-23T18:25:43.511Z",
		},
		{
			id: 1,
			filename: "Title three",
			author: "Admin",
			date: "2012-04-23T18:25:43.511Z",
		},
	];
	const STATUSES = [
		{ value: "draft", label: __("Draft") },
		{ value: "future", label: __("Scheduled") },
		{ value: "pending", label: __("Pending Review") },
		{ value: "private", label: __("Private") },
		{ value: "publish", label: __("Published") },
		{ value: "trash", label: __("Trash") },
	];
	const fields = [
		{
			id: "filename",
			header: "Title",
			enableHiding: false,
		},
	];

	return (
		<DataViews
			data={data}
			fields={fields}
			view={view}
			onChangeView={setView}
			paginationInfo={{
				totalItems: 11,
				totalPages: 2,
			}}
		/>
	);
}
