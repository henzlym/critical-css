"use client";

import { useState } from "react";

export default function Home() {
	const [url, setUrl] = useState("");
	const [result, setResult] = useState("");
	const [criticalCss, setCriticalCSS] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setResult("");

		try {
			const response = await fetch(
				`/api/fetch-css?url=${encodeURIComponent(url)}`
			);
			const data = await response.json();

			if (response.ok) {
				setResult(data.combinedCss);
				setCriticalCSS(data.criticalCss);
			} else {
				setResult(`Error: ${data.error}`);
			}
		} catch (error) {
			setResult(`Error: ${error.message}`);
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
						<form onSubmit={handleSubmit}>
							<input
								type="url"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
								placeholder="Enter URL"
								required
							/>
							<button
								type="submit"
								disabled={loading}
							>
								{loading
									? "Fetching CSS..."
									: "Generate Critical Path CSS"}
							</button>
						</form>
					</section>
					<section id="results">
						{criticalCss && (
							<textarea
								name="criticalCss"
								rows={10}
								cols={100}
								defaultValue={criticalCss}
							/>
						)}
					</section>
					<section id="results">
						{result && (
							<textarea
								name="combinedCss"
								rows={10}
								cols={100}
								defaultValue={result}
							/>
						)}
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
