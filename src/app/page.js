"use client";
import { Button, TextControl } from "@wordpress/components";
import "@wordpress/components/build-style/style.css";
import { useState } from "react";
import FileView from "./components/file-view";
const MyTextControl = () => {
	const [className, setClassName] = useState("");

	return (
		<TextControl
			label="Additional CSS Class"
			value={className}
			onChange={(value) => setClassName(value)}
		/>
	);
};

function downloadCSS(id) {
	if (!id) {
		return null;
	}
	const textarea = document.getElementById(id);
	const cssContent = textarea.value;
	const blob = new Blob([cssContent], { type: "text/css" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = id + ".css";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
export default function Home() {
	const [url, setUrl] = useState("");
	const [minified, setMinified] = useState("");
	const [unminified, setUnMinified] = useState("");
	const [criticalCss, setCriticalCss] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMinified("");

		try {
			const response = await fetch(
				`/api/fetch-css?url=${encodeURIComponent(url)}`
			);
			const data = await response.json();

			if (response.ok) {
				setMinified(data.minified);
				setUnMinified(data.unminified);
				setCriticalCss(data.critical);
			} else {
				setMinified(`Error: ${data.error}`);
			}
		} catch (error) {
			setMinified(`Error: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<header>
				<div className="container">
					<h1>Critical Path CSS Generator</h1>
					<nav>
						<a href="#">Home</a>
						<a href="#">Articles</a>
						<a href="#">Blog</a>
						{/* Add more navigation links as needed */}
					</nav>
				</div>
			</header>

			<main>
				<div className="container">
					<section className="hero">
						<h2>Combine CSS Files from a Website</h2>
						<form
							className={"form"}
							onSubmit={handleSubmit}
						>
							<div className={"form-control"}>
								<TextControl
									type="url"
									label="Enter URL"
									value={url}
									onChange={(e) => setUrl(e.target.value)}
									placeholder="https://hello-world.com"
									required
								/>
								<Button
									type="submit"
									variant="primary"
								>
									{loading
										? "Fetching CSS..."
										: "Generate CSS"}
								</Button>
							</div>
						</form>
					</section>
					<FileView />
					<section
						id="results"
						className="critical-css-results"
					>
						<div className="critical-css-result critical-css-unminified">
							{unminified && (
								<textarea
									id="unminified_css"
									name="unminified_css"
									rows={10}
									defaultValue={unminified}
								/>
							)}
							<button
								type="submit"
								className="critical-css-result-action"
								disabled={loading}
								onClick={() => downloadCSS("unminified_css")}
							>
								Download unminified combined CSS
							</button>
						</div>
						<div className="critical-css-result critical-css-minified">
							{minified && (
								<textarea
									id="minified_css"
									name="minified_css"
									rows={10}
									defaultValue={minified}
								/>
							)}
							<button
								className="critical-css-result-action"
								type="submit"
								disabled={loading}
								onClick={() => downloadCSS("minified_css")}
							>
								Download minified combined CSS
							</button>
						</div>
					</section>
					<section
						id="results"
						className="critical-css-results"
					>
						<div className="critical-css-result critical-css-critical">
							{criticalCss && (
								<textarea
									id="minified_critical_css"
									name="minified_critical_css"
									rows={10}
									defaultValue={criticalCss}
								/>
							)}
							<button
								type="submit"
								className="critical-css-result-action"
								disabled={loading}
								onClick={() =>
									downloadCSS("minified_critical_css")
								}
							>
								Download unminified combined CSS
							</button>
						</div>
					</section>
				</div>
			</main>

			<footer>
				<div className="container">
					<p>&copy; 2024 Your Company</p>
				</div>
			</footer>
		</div>
	);
}
