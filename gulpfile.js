const gulp = require("gulp");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const purgecss = require("@fullhuman/postcss-purgecss");
const discardDuplicates = require("postcss-discard-duplicates");
const through = require("through2");
const fs = require("fs");
const path = require("path");

const optimizeCSS = (inputCss, htmlContent) => {
	return new Promise((resolve, reject) => {
		const tempCssFilePath = path.join(__dirname, "temp.css");
		const tempHtmlFilePath = path.join(__dirname, "temp.html");

		fs.writeFileSync(tempCssFilePath, inputCss);
		fs.writeFileSync(tempHtmlFilePath, htmlContent);

		gulp.src(tempCssFilePath)
			.pipe(
				postcss([
					purgecss({
						content: [tempHtmlFilePath],
						defaultExtractor: (content) =>
							content.match(/[\w-/:]+(?<!:)/g) || [],
					}),
					autoprefixer(),
					cssnano(),
				])
			)
			.pipe(
				through.obj((file, enc, cb) => {
					resolve(file.contents.toString());
					cb(null, file);
				})
			)
			.on("error", (err) => {
				reject(err);
			})
			.on("end", () => {
				fs.unlinkSync(tempCssFilePath);
				fs.unlinkSync(tempHtmlFilePath);
			})
			.pipe(gulp.dest("dist"));
	});
};

const removeCriticalFromCombined = (criticalCss, combinedCss) => {
	return new Promise((resolve, reject) => {
		const tempCriticalPath = path.join(__dirname, "temp-critical.css");
		const tempCombinedPath = path.join(__dirname, "temp-combined.css");

		fs.writeFileSync(tempCriticalPath, criticalCss);
		fs.writeFileSync(tempCombinedPath, combinedCss);

		gulp.src(tempCombinedPath)
			.pipe(
				postcss([
					discardDuplicates({
						from: tempCriticalPath,
					}),
					autoprefixer(),
					cssnano(),
				])
			)
			.pipe(
				through.obj((file, enc, cb) => {
					resolve(file.contents.toString());
					cb(null, file);
				})
			)
			.on("error", (err) => {
				reject(err);
			})
			.on("end", () => {
				fs.unlinkSync(tempCriticalPath);
				fs.unlinkSync(tempCombinedPath);
			})
			.pipe(gulp.dest("dist"));
	});
};

module.exports = { optimizeCSS, removeCriticalFromCombined };
