import vendorDatabase from './third-party-vendors.json';

/**
 * Extract a readable name from a domain
 * @param {string} hostname - e.g., "cdn.example.com"
 * @returns {string} - e.g., "Example CDN"
 */
function extractReadableName(hostname) {
	if (!hostname) return 'External Script';

	// Remove common prefixes
	let cleaned = hostname
		.replace(/^(www\d?|cdn|static|assets|js|scripts?|img|images)\./i, '');

	// Extract main domain (remove TLD)
	const parts = cleaned.split('.');
	if (parts.length >= 2) {
		// Get second-to-last part (main domain name)
		const mainDomain = parts[parts.length - 2];

		// Capitalize and format
		const formatted = mainDomain
			.replace(/[-_]/g, ' ')  // Replace hyphens/underscores with spaces
			.split(' ')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');

		// Add descriptor based on subdomain
		if (hostname.includes('cdn.')) return `${formatted} CDN`;
		if (hostname.includes('api.')) return `${formatted} API`;
		if (hostname.includes('analytics.')) return `${formatted} Analytics`;

		return formatted;
	}

	return hostname;
}

/**
 * Infer criticality based on script characteristics
 * @param {string} url - Script URL
 * @param {Object} position - Script position
 * @param {Object} loading - Loading strategy
 * @returns {string} - Inferred criticality
 */
function inferCriticality(url, position, loading) {
	const urlLower = url.toLowerCase();

	// Critical indicators
	if (position?.location === 'head' && !loading?.async && !loading?.defer) {
		return 'critical';  // Blocking script in head likely critical
	}

	// Non-essential indicators
	if (urlLower.includes('analytics') || urlLower.includes('tracking')) {
		return 'non-essential';
	}
	if (urlLower.includes('chat') || urlLower.includes('widget')) {
		return 'non-essential';
	}

	// Interactive as safe default
	return 'interactive';
}

/**
 * Infer load strategy based on position and current loading
 * @param {Object} position - Script position
 * @param {Object} loading - Current loading strategy
 * @returns {string} - Suggested load strategy
 */
function inferLoadStrategy(position, loading) {
	// If in head without async/defer, suggest defer
	if (position?.location === 'head' && !loading?.async && !loading?.defer) {
		return 'defer';
	}

	// If in body without attributes, suggest async or lazy
	if (position?.location === 'body' && !loading?.async && !loading?.defer) {
		return 'async';
	}

	// Already optimized or no change needed
	return 'current';
}

/**
 * Matches a script URL to a known third-party vendor
 *
 * @param {string} url - The script URL to match
 * @param {Object} position - Script position information (optional, for better third-party script inference)
 * @param {Object} loading - Script loading information (optional, for better third-party script inference)
 * @returns {Object} Vendor information or fallback category
 * @returns {string} return.category - The vendor category (analytics, chat, etc.)
 * @returns {string} return.name - The vendor name
 * @returns {string} return.criticality - How critical the script is (critical/interactive/non-essential)
 * @returns {string} return.loadStrategy - Recommended loading strategy
 * @returns {string} [return.description] - Description of the vendor
 * @returns {string} [return.note] - Additional notes
 *
 * @example
 * matchVendor('https://www.google-analytics.com/analytics.js')
 * // Returns: { category: 'analytics', name: 'Google Analytics', criticality: 'non-essential', ... }
 */
export function matchVendor(url, position, loading) {
  try {
    // Handle relative URLs or invalid URLs
    if (!url || url.startsWith('/') || url.startsWith('.')) {
      return {
        category: 'internal',
        name: 'Internal Script',
        criticality: 'standard',
        loadStrategy: 'defer'
      };
    }

    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const fullPath = hostname + urlObj.pathname;

    // Search through all categories
    for (const [category, vendors] of Object.entries(vendorDatabase)) {
      for (const [domain, info] of Object.entries(vendors)) {
        // Handle wildcard patterns like "*.facebook.com"
        if (domain.includes('*')) {
          const regex = new RegExp(domain.replace(/\*/g, '.*').replace(/\./g, '\\.'));
          if (regex.test(hostname)) {
            return {
              category,
              ...info
            };
          }
        }
        // Handle path patterns like "facebook.net/*/fbevents.js"
        else if (domain.includes('/')) {
          const pathRegex = new RegExp(domain.replace(/\*/g, '.*').replace(/\./g, '\\.'));
          if (pathRegex.test(fullPath)) {
            return {
              category,
              ...info
            };
          }
        }
        // Handle subdomain matching (ends with domain)
        else if (hostname === domain || hostname.endsWith('.' + domain)) {
          return {
            category,
            ...info
          };
        }
      }
    }

    // Check if it's a same-origin script
    if (typeof window !== 'undefined' && hostname === window.location.hostname) {
      return {
        category: 'internal',
        name: 'Internal Script',
        criticality: 'standard',
        loadStrategy: 'defer'
      };
    }

    // Third-party script - extract readable name from domain
    const domainName = extractReadableName(hostname);

    return {
      category: 'third_party',
      name: domainName,         // Enhanced extraction
      criticality: inferCriticality(url, position, loading), // Smarter fallback
      loadStrategy: inferLoadStrategy(position, loading),    // Smarter fallback
      description: `Third-party script from ${hostname}`
    };
  } catch (error) {
    // Invalid URL or parsing error
    return {
      category: 'other',
      name: 'External Script',
      criticality: 'standard',
      loadStrategy: 'defer',
      error: error.message
    };
  }
}

/**
 * Get all vendor categories
 *
 * @returns {string[]} Array of category names
 */
export function getCategories() {
  return Object.keys(vendorDatabase);
}

/**
 * Get all vendors in a specific category
 *
 * @param {string} category - The category name
 * @returns {Object} Vendors in that category
 */
export function getVendorsByCategory(category) {
  return vendorDatabase[category] || {};
}

/**
 * Get the total number of known vendors
 *
 * @returns {number} Total vendor count
 */
export function getTotalVendorCount() {
  return Object.values(vendorDatabase).reduce(
    (total, category) => total + Object.keys(category).length,
    0
  );
}
