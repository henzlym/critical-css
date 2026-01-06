import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: {
		template: "Speedkit - %s",
		default: "Speedkit - Critical CSS Generator",
	},
	description:
		"Analyze and extract critical CSS from any webpage. Optimize your website's performance by identifying and isolating above-the-fold styles for faster initial page loads.",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={inter.className}>{children}</body>
		</html>
	);
}
