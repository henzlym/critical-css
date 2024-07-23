import puppeteer from "puppeteer";

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

		await browser.close();

		let combinedCss = "";
		for (const cssUrl of cssLinks) {
			const response = await fetch(cssUrl);
			const cssContent = await response.text();
			combinedCss += cssContent;
		}

		res.status(200).json({ combinedCss });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}
