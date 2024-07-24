import puppeteer from "puppeteer";
import { optimizeCSS, removeCriticalFromCombined } from "../../../gulpfile";

export default async function handler(req, res) {
	const { url } = req.query;

	if (!url) {
		return res.status(400).json({ error: "URL is required" });
	}

	try {
		const browser = await puppeteer.launch({
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});
		const page = await browser.newPage();
		await page.goto(url);

		const cssLinks = await page.evaluate(() => {
			return Array.from(
				document.querySelectorAll('link[rel="stylesheet"]')
			).map((link) => link.href);
		});

		const htmlContent = await page.content();
		const criticalCss = await page.evaluate(() => {
			const maxHeight = 900;
			const criticalStyles = new Set();
			const addCriticalStyle = (element) => {
				if (element.nodeType !== Node.ELEMENT_NODE) return;
				const rect = element.getBoundingClientRect();
				if (rect.top >= maxHeight) return;

				const styles = window.getComputedStyle(element);
				for (let i = 0; i < styles.length; i++) {
					criticalStyles.add(
						`${styles[i]}: ${styles.getPropertyValue(styles[i])};`
					);
				}
				for (const child of element.children) {
					addCriticalStyle(child);
				}
			};
			addCriticalStyle(document.body);
			return Array.from(criticalStyles).join(" ");
		});

		await browser.close();

		let combinedCss = "";
		for (const cssUrl of cssLinks) {
			const response = await fetch(cssUrl);
			const cssContent = await response.text();
			combinedCss += cssContent;
		}

		// Optimize the combined CSS using Gulp with PurgeCSS
		const optimizedCombinedCss = await optimizeCSS(
			combinedCss,
			htmlContent
		);
		const finalCombinedCss = await removeCriticalFromCombined(
			criticalCss,
			optimizedCombinedCss
		);

		res.status(200).json({ combinedCss: finalCombinedCss, criticalCss });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}
