"use client";

import { usePathname } from "next/navigation";

/**
 * Navigation items configuration
 *
 * Centralized array of all navigation links displayed in the header.
 * Each item defines a route and its display label.
 *
 * @type {Array<{href: string, label: string}>}
 *
 * @example Adding a new tool page
 * // 1. Add entry to NAV_ITEMS:
 * { href: "/new-tool", label: "New Tool" }
 *
 * // 2. Add corresponding title to PAGE_TITLES:
 * "/new-tool": "New Tool Name"
 *
 * // 3. Create the page at src/app/new-tool/page.js
 * // 4. Import and use <Header /> in the new page
 */
const NAV_ITEMS = [
	{ href: "/", label: "Critical CSS" },
	{ href: "/preload", label: "Preload Tags" },
	{ href: "/render-blocking", label: "Render-Blocking" },
];

/**
 * Page titles mapped by pathname
 *
 * Defines the <h1> title displayed in the header for each route.
 * Falls back to "Speedkit" if pathname is not found.
 *
 * @type {Object.<string, string>}
 */
const PAGE_TITLES = {
	"/": "Critical Path CSS Generator",
	"/preload": "Preload Tag Generator",
	"/render-blocking": "Render-Blocking Analyzer",
};

/**
 * Header Component
 *
 * Shared header with navigation for all Speedkit tool pages.
 * Provides consistent branding and navigation across the application.
 *
 * Features:
 * - Centralized navigation configuration (NAV_ITEMS)
 * - Automatic active state highlighting based on current route
 * - Dynamic page titles based on pathname (PAGE_TITLES)
 * - Responsive container layout
 *
 * @component
 * @example
 * // Usage in a page component:
 * import Header from "../components/header";
 *
 * export default function MyPage() {
 *   return (
 *     <div>
 *       <Header />
 *       <main>
 *         {// Page content}
 *       </main>
 *     </div>
 *   );
 * }
 *
 * @returns {JSX.Element} Header element with title and navigation
 */
export default function Header() {
	const pathname = usePathname();
	const title = PAGE_TITLES[pathname] || "Speedkit";

	return (
		<header>
			<div className="container">
				<h1>{title}</h1>
				<nav>
					{NAV_ITEMS.map(({ href, label }) => (
						<a
							key={href}
							href={href}
							className={pathname === href ? "active" : ""}
						>
							{label}
						</a>
					))}
				</nav>
			</div>
		</header>
	);
}
