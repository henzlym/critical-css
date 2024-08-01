import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import postcss from "postcss";
import puppeteer from "puppeteer";
import { PurgeCSS } from "purgecss";

async function captureAboveTheFoldHTML(page) {
	// Set viewport to capture above-the-fold content
	await page.setViewport({ width: 1280, height: 900 });

	// Get the above-the-fold HTML content
	const aboveTheFoldHTML = await page.evaluate(() => {
		function cloneAboveTheFold(element, maxHeight) {
			if (element.nodeType !== Node.ELEMENT_NODE) {
				return element.cloneNode(true);
			}

			const rect = element.getBoundingClientRect();
			if (rect.top >= maxHeight) {
				return null;
			}

			const clone = element.cloneNode(false);
			for (const child of element.childNodes) {
				const clonedChild = cloneAboveTheFold(child, maxHeight);
				if (clonedChild) {
					clone.appendChild(clonedChild);
				}
			}
			return clone;
		}

		const maxHeight = 900;
		const bodyClone = document.createElement("body");

		for (const child of document.body.childNodes) {
			const clonedChild = cloneAboveTheFold(child, maxHeight);
			if (clonedChild) {
				bodyClone.appendChild(clonedChild);
			}
		}

		const doctype = new XMLSerializer().serializeToString(document.doctype);
		const htmlClone = document.documentElement.cloneNode(false);
		const headClone = document.head.cloneNode(true);
		htmlClone.appendChild(headClone);
		htmlClone.appendChild(bodyClone);

		return `${doctype}\n${htmlClone.outerHTML}`;
	});

	return aboveTheFoldHTML;
}

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

		await page.setViewport({ width: 1280, height: 900 });

		const htmlContent = await page.content();

		// const aboveTheFoldHTML = await captureAboveTheFoldHTML(htmlContent);

		const cssLinks = await page.evaluate(() => {
			return Array.from(
				document.querySelectorAll('link[rel="stylesheet"]')
			).map((link) => link.href);
		});

		await browser.close();

		let combinedCss = "";
		for (const cssUrl of cssLinks) {
			const response = await fetch(cssUrl);
			const cssContent = await response.text();
			combinedCss += cssContent;
		}

		const combined = await postcss([autoprefixer(), cssnano()]).process(
			combinedCss,
			{
				from: undefined,
			}
		);

		console.log("Hellow");

		const purgecss = await new PurgeCSS().purge({
			content: [
				{
					raw: htmlContent,
					extension: "html",
				},
			],
			css: [
				{
					raw: combinedCss,
				},
			],
		});

		const critical = await postcss([autoprefixer(), cssnano()]).process(
			purgecss[0].css,
			{
				from: undefined,
			}
		);

		// const critical = "";

		res.status(200).json({
			minified: combined.css,
			unminified: combinedCss,
			critical: critical.css,
			message: "Hello",
		});
	} catch (error) {
		res.status(500).json({ error: "Failed to minify CSS" });
	}
}
