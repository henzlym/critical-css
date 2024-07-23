import styles from "./page.module.css";

export default function Home() {
	return (
		<main className={styles.main}>
			<div className="container">
				<section className="hero">
					<h2>Combine CSS Files from a Website</h2>
					<form id="url-form">
						<input
							type="url"
							id="url-input"
							placeholder="Enter URL"
							required
						/>
						<button type="submit">
							Generate Critical Path CSS
						</button>
					</form>
				</section>
				<section id="results"></section>
			</div>
		</main>
	);
}
