const gulp = require("gulp");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const concat = require("gulp-concat");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

const targetUrl = "https://example.com"; // Replace with the target URL to crawl
const tempDir = path.resolve(__dirname, "../temp");
const combinedCssFile = "combined.css";

function ensureTempDirectory() {
	if (!fs.existsSync(tempDir)) {
		fs.mkdirSync(tempDir, { recursive: true });
	}
}

function getDomainFromUrl(url) {
	const { hostname } = new URL(url);
	return hostname;
}

async function crawlAndDownloadCSS() {
	ensureTempDirectory();

	const selectedDomain = getDomainFromUrl(targetUrl);
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(targetUrl);

	const cssLinks = await page.evaluate((selectedDomain) => {
		return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
			.filter((link) => link.href.includes(selectedDomain))
			.map((link) => link.href);
	}, selectedDomain);

	await browser.close();

	const downloadPromises = cssLinks.map(async (cssUrl, index) => {
		const response = await fetch(cssUrl);
		const cssContent = await response.text();
		const cssPath = path.join(tempDir, `style${index}.css`);
		fs.writeFileSync(cssPath, cssContent);
		return cssPath;
	});

	return Promise.all(downloadPromises);
}

gulp.task("combine-css", async () => {
	const cssFiles = await crawlAndDownloadCSS();

	return gulp
		.src(cssFiles)
		.pipe(concat(combinedCssFile))
		.pipe(postcss([autoprefixer(), cssnano()]))
		.pipe(gulp.dest("dist/styles")); // Adjust the output directory as needed
});
