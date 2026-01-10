import { selectTemplate, generateCurrentCode } from './code-templates.js';

/**
 * Recommendation Engine
 * Generates actionable recommendations for script optimization
 */

/**
 * Helper: Check if script is in head
 */
function isInHead(position) {
  return position?.location === 'head';
}

/**
 * Helper: Check if script is in body
 */
function isInBody(position) {
  return position?.location === 'body';
}

/**
 * Helper: Check if script has no loading strategy
 */
function hasNoLoadingStrategy(loading) {
  return loading?.strategy === 'none' || !loading?.strategy;
}

/**
 * Helper: Check if script is a non-critical script that should be optimized
 */
function isNonCriticalScript(position, loading, criticality) {
  // Non-critical scripts in head without async/defer
  if (isInHead(position) && hasNoLoadingStrategy(loading) && criticality !== 'critical') {
    return true;
  }

  // Interactive scripts in head without defer/async
  if (isInHead(position) && hasNoLoadingStrategy(loading) && criticality === 'interactive') {
    return true;
  }

  return false;
}

/**
 * Helper: Check if analytics script needs optimization
 */
function needsAnalyticsOptimization(category, loading) {
  return category === 'analytics' && hasNoLoadingStrategy(loading);
}

/**
 * Helper: Check if chat widget needs lazy loading
 */
function needsChatOptimization(category, loading) {
  return category === 'chat' && loading?.strategy !== 'lazy';
}

/**
 * Helper: Check if non-essential script is blocking
 */
function isNonEssentialBlocking(criticality, position, loading) {
  return criticality === 'non-essential' &&
         isInHead(position) &&
         hasNoLoadingStrategy(loading);
}

/**
 * SEO-Critical Script Patterns
 *
 * This module detects scripts that MUST remain in the <head> section for proper
 * SEO indexing, analytics tracking, and legal compliance. Moving these scripts
 * can negatively impact search rankings, analytics accuracy, and legal standing.
 *
 * ## Categories Detected
 *
 * ### 1. Structured Data (Schema.org / JSON-LD)
 * **Impact Level:** HIGH
 * **Detection Patterns:**
 * - `@context.*schema.org` - Schema.org context declarations
 * - `"@type": "FAQPage|Article|Product|..."` - Schema type definitions
 * - `type="application/ld+json"` - JSON-LD script type attribute
 *
 * **Why It Matters:**
 * Search engines (Google, Bing) parse structured data to generate rich snippets
 * in search results - star ratings, FAQ accordions, product prices, recipe cards, etc.
 * If this data is deferred or moved, crawlers may not execute the JavaScript needed
 * to see it, causing rich results to disappear.
 *
 * **Supported Schema Types:**
 * FAQPage, Article, Product, Organization, WebSite, BreadcrumbList,
 * LocalBusiness, Review, Event, Recipe, HowTo, VideoObject
 *
 * ---
 *
 * ### 2. Google Tag Manager (GTM)
 * **Impact Level:** MEDIUM
 * **Detection Patterns:**
 * - `gtm.start` - GTM initialization
 * - `googletagmanager.com/gtm` - GTM script URL
 * - `GTM-[A-Z0-9]+` - GTM container ID format
 *
 * **Why It Matters:**
 * GTM is the central hub for marketing tags, analytics, and conversion tracking.
 * If GTM loads late, it misses tracking users who bounce quickly (often 10-30%
 * of visitors). This leads to underreported traffic and skewed conversion data.
 *
 * **Recommendation:** Use async attribute but keep in <head>
 *
 * ---
 *
 * ### 3. Google Analytics (GA4 / Universal Analytics)
 * **Impact Level:** MEDIUM
 * **Detection Patterns:**
 * - `gtag('config', ...)` - GA4 configuration
 * - `google-analytics.com/analytics` - Universal Analytics
 * - `googletagmanager.com/gtag` - GA4 via gtag.js
 * - `ga('create', ...)` - Universal Analytics legacy
 * - `GoogleAnalyticsObject` - UA global object
 *
 * **Why It Matters:**
 * Analytics must fire before users leave to capture pageviews accurately.
 * Delayed loading can miss 10-30% of sessions, particularly from mobile users
 * and those with slow connections who bounce quickly.
 *
 * **Recommendation:** Use async attribute, keep in <head>
 *
 * ---
 *
 * ### 4. Facebook Pixel (Meta Pixel)
 * **Impact Level:** MEDIUM
 * **Detection Patterns:**
 * - `fbq('init', ...)` - Pixel initialization
 * - `connect.facebook.net.*fbevents` - Pixel script URL
 *
 * **Why It Matters:**
 * Facebook Pixel tracks ad conversions and builds retargeting audiences.
 * Late loading means missed attribution - Facebook won't know which ad
 * brought the visitor, leading to "unknown" conversions and poor ad optimization.
 *
 * **Recommendation:** Use async attribute, keep in <head>
 *
 * ---
 *
 * ### 5. Cookie Consent / Privacy Management
 * **Impact Level:** CRITICAL (Legal Requirement)
 * **Detection Patterns:**
 * - `cookieconsent` - Generic consent libraries
 * - `onetrust` - OneTrust CMP
 * - `cookiebot` - Cookiebot CMP
 * - `trustarc` - TrustArc CMP
 * - `privacymanager` - Various privacy managers
 *
 * **Why It Matters:**
 * GDPR (EU) and CCPA (California) REQUIRE user consent BEFORE tracking begins.
 * If consent loads after analytics/pixels fire, you're collecting data illegally.
 * Fines can reach €20 million or 4% of global revenue under GDPR.
 *
 * **Recommendation:** MUST be synchronous, MUST be first script in <head>
 * Cannot use async or defer - this is a legal compliance requirement.
 *
 * ---
 *
 * ## How Detection Works
 *
 * 1. For inline scripts: Checks `textContent` against regex patterns
 * 2. For external scripts: Checks `src` URL against regex patterns
 * 3. For JSON-LD: Checks `type="application/ld+json"` attribute
 *
 * ## Usage
 *
 * ```javascript
 * import { detectSeoCriticalScript } from './recommendation-engine';
 *
 * const result = detectSeoCriticalScript(scriptObject);
 * if (result) {
 *   console.log(result.name);      // "Google Tag Manager"
 *   console.log(result.seoImpact); // "medium"
 *   console.log(result.caveat);    // User-friendly warning message
 * }
 * ```
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data
 * @see https://support.google.com/tagmanager/answer/6102821
 * @see https://gdpr.eu/cookies/
 */
const SEO_CRITICAL_PATTERNS = {
  // Structured Data / Schema.org
  schemaOrg: {
    patterns: [
      /@context.*schema\.org/i,
      /"@type"\s*:\s*"(FAQPage|Article|Product|Organization|WebSite|BreadcrumbList|LocalBusiness|Review|Event|Recipe|HowTo|VideoObject)"/i
    ],
    name: 'Structured Data (Schema.org)',
    reason: 'Structured data (Schema.org) must remain in the document for search engines to properly index rich snippets. Moving or deferring this script may cause your FAQ, product, or article rich results to disappear from Google search results.',
    seoImpact: 'high',
    keepInHead: true,
    caveat: 'SEO Impact: Rich snippets and enhanced search results depend on this script being present and parseable by search engine crawlers.'
  },
  // Google Tag Manager
  gtm: {
    patterns: [
      /gtm\.start/i,
      /googletagmanager\.com\/gtm/i,
      /GTM-[A-Z0-9]+/i
    ],
    name: 'Google Tag Manager',
    reason: 'Google Tag Manager initializes tracking and marketing pixels. It should use async but remain in the <head> to capture all pageviews accurately.',
    seoImpact: 'medium',
    keepInHead: true,
    caveat: 'Analytics Impact: Moving GTM to the end of the body may cause missed pageviews for users who leave quickly (bounce visitors), leading to inaccurate analytics data.'
  },
  // Google Analytics / gtag
  googleAnalytics: {
    patterns: [
      /gtag\s*\(\s*['"]config['"]/i,
      /google-analytics\.com\/analytics/i,
      /googletagmanager\.com\/gtag/i,
      /ga\s*\(\s*['"]create['"]/i,
      /GoogleAnalyticsObject/i
    ],
    name: 'Google Analytics',
    reason: 'Google Analytics tracking should remain in the <head> with async to capture all pageviews accurately without blocking render.',
    seoImpact: 'medium',
    keepInHead: true,
    caveat: 'Analytics Impact: Delayed analytics loading may miss 10-30% of pageviews from users who leave within the first few seconds.'
  },
  // Facebook Pixel
  facebookPixel: {
    patterns: [
      /fbq\s*\(\s*['"]init['"]/i,
      /connect\.facebook\.net.*fbevents/i
    ],
    name: 'Facebook Pixel',
    reason: 'Facebook Pixel should load early to track conversions accurately. Use async but keep in <head>.',
    seoImpact: 'medium',
    keepInHead: true,
    caveat: 'Marketing Impact: Delayed pixel loading may miss attribution for quick visitors, affecting ad campaign optimization and retargeting.'
  },
  // Consent Management
  consentManagement: {
    patterns: [
      /cookieconsent/i,
      /onetrust/i,
      /cookiebot/i,
      /trustarc/i,
      /privacymanager/i
    ],
    name: 'Cookie Consent',
    reason: 'Cookie consent must load before any tracking scripts for GDPR/CCPA compliance. This is a legal requirement.',
    seoImpact: 'critical',
    keepInHead: true,
    caveat: 'Legal Requirement: This script MUST load before other tracking scripts. Moving it could result in compliance violations and potential fines.'
  },
  // JSON-LD Scripts (by type attribute)
  jsonLd: {
    patterns: [],  // Detected by type="application/ld+json"
    name: 'JSON-LD Structured Data',
    reason: 'JSON-LD structured data is used by search engines to understand page content and generate rich results.',
    seoImpact: 'high',
    keepInHead: true,
    caveat: 'SEO Impact: This structured data powers rich snippets in search results (FAQs, reviews, products, etc.). Removing or breaking it will cause these enhanced listings to disappear.'
  }
};

/**
 * Detect if a script is SEO-critical based on its content or URL
 *
 * @param {Object} script - Script object
 * @returns {Object|null} SEO critical info or null
 */
export function detectSeoCriticalScript(script) {
  const contentToCheck = script.isInline
    ? (script.textContent || '')
    : (script.src || '');

  // Check for JSON-LD type attribute
  if (script.type === 'application/ld+json') {
    return { type: 'jsonLd', ...SEO_CRITICAL_PATTERNS.jsonLd };
  }

  // Check each pattern category
  for (const [key, config] of Object.entries(SEO_CRITICAL_PATTERNS)) {
    if (!config.patterns || config.patterns.length === 0) continue;

    for (const pattern of config.patterns) {
      if (pattern.test(contentToCheck)) {
        return { type: key, ...config };
      }
    }
  }

  return null;
}

/**
 * Category-based recommendation rules
 * Maps script categories to optimization strategies
 */
const categoryRules = {
  analytics: {
    criticality: 'critical',
    suggestedStrategy: 'async',
    suggestedPosition: 'head',
    reason: 'Analytics scripts are critical for business insights but should use async to avoid blocking page render. This ensures accurate tracking while maintaining performance.'
  },
  ab_testing: {
    criticality: 'critical',
    suggestedStrategy: 'head-sync',
    suggestedPosition: 'head',
    reason: 'A/B testing tools must load early to prevent content flicker. However, use an anti-flicker snippet and set a timeout to prevent blocking.'
  },
  consent: {
    criticality: 'critical',
    suggestedStrategy: 'head-sync',
    suggestedPosition: 'head',
    reason: 'GDPR and privacy compliance requires cookie consent to load before other tracking scripts. Must be in the head.'
  },
  chat: {
    criticality: 'non-essential',
    suggestedStrategy: 'lazy-load',
    suggestedPosition: 'body-end',
    reason: 'Chat widgets are not needed for initial page load. Load them on scroll, click, or after a few seconds to improve performance.'
  },
  fonts: {
    criticality: 'interactive',
    suggestedStrategy: 'preload-or-async',
    suggestedPosition: 'head',
    reason: 'Fonts should be preloaded for better performance. Use font-display: swap to prevent invisible text during loading.'
  },
  cdn: {
    criticality: 'critical',
    suggestedStrategy: 'head-defer',
    suggestedPosition: 'head',
    reason: 'Core libraries from CDNs should use defer attribute. This allows parallel downloads while ensuring proper execution order.'
  },
  advertising: {
    criticality: 'interactive',
    suggestedStrategy: 'defer',
    suggestedPosition: 'body-end',
    reason: 'Ad scripts should defer loading to prevent blocking the main content. Place them at the end of the body.'
  },
  social: {
    criticality: 'interactive',
    suggestedStrategy: 'defer',
    suggestedPosition: 'body-end',
    reason: 'Social media widgets can be deferred as they\'re not critical for initial page load. Consider lazy-loading if they\'re below the fold.'
  },
  maps: {
    criticality: 'interactive',
    suggestedStrategy: 'lazy-load',
    suggestedPosition: 'body-end',
    reason: 'Map scripts are heavy and often below the fold. Load them on scroll or when the map container becomes visible.'
  },
  video: {
    criticality: 'interactive',
    suggestedStrategy: 'lazy-load',
    suggestedPosition: 'body-end',
    reason: 'Video player scripts should load only when needed. Use lazy-loading with a thumbnail image as placeholder.'
  },
  payments: {
    criticality: 'critical',
    suggestedStrategy: 'context-dependent',
    suggestedPosition: 'body-end',
    reason: 'Payment scripts are critical on checkout pages but not needed elsewhere. Consider loading them only on payment pages.'
  },
  monitoring: {
    criticality: 'non-essential',
    suggestedStrategy: 'defer',
    suggestedPosition: 'body-end',
    reason: 'Error monitoring and analytics tools don\'t need to block rendering. Use defer or async attributes.'
  },
  crm: {
    criticality: 'non-essential',
    suggestedStrategy: 'lazy-load',
    suggestedPosition: 'body-end',
    reason: 'CRM and marketing automation scripts can be lazy-loaded after initial page interaction.'
  },
  popups: {
    criticality: 'non-essential',
    suggestedStrategy: 'lazy-load',
    suggestedPosition: 'body-end',
    reason: 'Popup scripts should load after the main content. Consider delaying them by a few seconds or trigger on scroll.'
  },
  email: {
    criticality: 'interactive',
    suggestedStrategy: 'defer',
    suggestedPosition: 'body-end',
    reason: 'Email marketing forms can be deferred. They don\'t need to block the initial page load.'
  },
  support: {
    criticality: 'non-essential',
    suggestedStrategy: 'lazy-load',
    suggestedPosition: 'body-end',
    reason: 'Support widgets can be lazy-loaded on interaction to improve initial page load time.'
  },
  internal: {
    criticality: 'standard',
    suggestedStrategy: 'defer',
    suggestedPosition: 'context-dependent',
    reason: 'Internal scripts should generally use defer unless they\'re critical for initial render. Review each script individually.'
  },
  other: {
    criticality: 'standard',
    suggestedStrategy: 'defer',
    suggestedPosition: 'body-end',
    reason: 'Third-party script. Move to end of body and add defer attribute unless you know it\'s critical.'
  }
};

/**
 * Calculate render-blocking score (1-10)
 * Higher score = more blocking
 *
 * @param {Object} script - Script object
 * @returns {number} Score from 1-10
 */
export function calculateBlockingScore(script) {
  let score = 0;

  // Position weight (most important factor)
  if (script.position.location === 'head') {
    score += 5;
  } else if (script.position.location === 'body-start') {
    score += 3;
  } else if (script.position.location === 'body-end') {
    score += 1;
  }

  // Loading strategy impact
  if (script.loading.strategy === 'none' || script.loading.strategy === 'sync') {
    score += 3;
  } else if (script.loading.strategy === 'defer') {
    score += 1;
  } else if (script.loading.strategy === 'async') {
    score += 0;
  }

  // Size impact
  if (script.size && script.size.transferSize) {
    if (script.size.transferSize > 100000) { // > 100KB
      score += 2;
    } else if (script.size.transferSize > 50000) { // > 50KB
      score += 1;
    }
  }

  return Math.min(Math.max(score, 1), 10);
}

/**
 * Analyze inline script to determine criticality
 *
 * @param {string} content - Inline script content
 * @returns {string} Criticality level
 */
function analyzeInlineScript(content) {
  if (!content) return 'custom';

  const lowerContent = content.toLowerCase();

  // Configuration or initialization code (critical)
  if (lowerContent.includes('config') ||
      lowerContent.includes('init') ||
      lowerContent.includes('setup') ||
      lowerContent.includes('window.') && lowerContent.includes('=')) {
    return 'critical';
  }

  // Event handlers or UI code (interactive)
  if (lowerContent.includes('addeventlistener') ||
      lowerContent.includes('onclick') ||
      lowerContent.includes('jquery') ||
      lowerContent.includes('$')) {
    return 'interactive';
  }

  // Analytics or tracking (critical per user request)
  if (lowerContent.includes('track') ||
      lowerContent.includes('analytics') ||
      lowerContent.includes('gtag') ||
      lowerContent.includes('fbq')) {
    return 'critical';
  }

  return 'custom';
}

/**
 * Generate recommendation for a script
 *
 * @param {Object} script - Script object with all properties
 * @returns {Object} Recommendation object
 */
export function generateRecommendation(script) {
  const { category, position, loading, isInline, textContent, vendor } = script;

  // First: Check for SEO-critical scripts
  const seoCritical = detectSeoCriticalScript(script);

  // Rule 1: Inline script analysis
  if (isInline) {
    // Special handling for SEO-critical inline scripts (JSON-LD, Schema.org, GTM init)
    if (seoCritical) {
      return {
        criticality: 'seo-critical',
        suggestedStrategy: 'keep-as-is',
        suggestedPosition: position.location,
        reason: seoCritical.reason,
        hasIssue: false,
        isSeoCritical: true,
        seoCriticalType: seoCritical.type,
        seoCriticalName: seoCritical.name,
        seoImpact: seoCritical.seoImpact,
        caveat: seoCritical.caveat,
        codeExample: `<!-- ${seoCritical.name} - Keep as-is for SEO/Analytics -->\n<script${script.type ? ` type="${script.type}"` : ''}>\n${textContent?.substring(0, 200)}${textContent?.length > 200 ? '...' : ''}\n</script>`,
        currentCode: generateCurrentCode(script)
      };
    }

    const inlineCriticality = analyzeInlineScript(textContent);

    if (inlineCriticality === 'critical') {
      return {
        criticality: 'critical',
        suggestedStrategy: 'keep-inline',
        suggestedPosition: 'head',
        reason: 'This inline script appears to contain configuration or initialization code. Keep it in the head but ensure it\'s minimal.',
        hasIssue: false,
        codeExample: `<!-- Keep this inline script in <head> -->\n<script>\n${textContent}\n</script>`,
        currentCode: generateCurrentCode(script)
      };
    }

    return {
      criticality: inlineCriticality,
      suggestedStrategy: 'move-to-end',
      suggestedPosition: 'body-end',
      reason: 'Move non-critical inline scripts to the end of the body to avoid blocking rendering.',
      hasIssue: position.location === 'head',
      codeExample: `<!-- Move to end of <body> -->\n<script>\n${textContent}\n</script>`,
      currentCode: generateCurrentCode(script)
    };
  }

  // Rule 1.5: SEO-critical external scripts
  if (seoCritical) {
    // For SEO-critical scripts, suggest async but warn about moving
    const currentlyOptimal = loading.strategy === 'async' ||
                             (seoCritical.type === 'consentManagement' && position.location === 'head');

    return {
      criticality: 'seo-critical',
      suggestedStrategy: seoCritical.type === 'consentManagement' ? 'keep-sync-in-head' : 'async',
      suggestedPosition: 'head',
      reason: seoCritical.reason,
      hasIssue: !currentlyOptimal && loading.strategy === 'none',
      isSeoCritical: true,
      seoCriticalType: seoCritical.type,
      seoCriticalName: seoCritical.name,
      seoImpact: seoCritical.seoImpact,
      caveat: seoCritical.caveat,
      currentStrategy: loading.strategy || 'none',
      currentPosition: position.location,
      blockingScore: calculateBlockingScore(script),
      codeExample: selectTemplate({ ...script, recommendation: { suggestedStrategy: 'async', suggestedPosition: 'head' } }),
      currentCode: generateCurrentCode(script)
    };
  }

  // Rule 2: Get category-based rules
  const rules = categoryRules[category] || categoryRules.other;

  // Rule 3: Check if current implementation has issues
  // A script has an issue if it's blocking when it shouldn't be
  const hasIssue =
    isNonCriticalScript(position, loading, rules.criticality) ||
    needsAnalyticsOptimization(category, loading) ||
    needsChatOptimization(category, loading) ||
    isNonEssentialBlocking(rules.criticality, position, loading) ||
    loading.isBlocking;

  // Rule 4: Generate code example
  const codeExample = selectTemplate({ ...script, recommendation: rules });

  // Rule 5: Add specific notes for certain vendors (Enhancement 5)
  let enhancedReason = rules.reason;

  // Enhanced vendor-specific recommendations
  if (vendor === 'Google Analytics' && loading.strategy !== 'async') {
    enhancedReason += ' Google Analytics officially recommends async loading for optimal performance without data loss.';
  }

  if (vendor === 'Google Tag Manager' && loading.strategy !== 'async') {
    enhancedReason += ' GTM works best with async loading or delayed injection on user interaction.';
  }

  if (vendor && vendor.includes('jQuery') && position.location === 'head' && loading.strategy === 'none') {
    enhancedReason += ' Consider moving jQuery to end of body with defer, or migrate to modern vanilla JavaScript.';
  }

  if (category === 'chat' && loading.strategy !== 'lazy') {
    enhancedReason += ' Most users never interact with chat widgets - lazy-loading saves bandwidth and improves performance.';
  }

  if (category === 'consent') {
    enhancedReason += ' Note: This must load before other tracking scripts for legal compliance.';
  }

  return {
    ...rules,
    reason: enhancedReason,
    hasIssue,
    currentStrategy: loading.strategy || 'none',
    currentPosition: position.location,
    blockingScore: calculateBlockingScore(script),
    codeExample,
    currentCode: generateCurrentCode(script)
  };
}

/**
 * Generate insights summary from all scripts
 *
 * @param {Array} scripts - Array of analyzed scripts
 * @returns {Object} Insights object
 */
export function generateInsights(scripts) {
  const issues = [];
  const seoCriticalScripts = [];
  let totalBlockingTime = 0;
  let potentialSavings = 0;

  // Identify SEO-critical scripts
  scripts.forEach(script => {
    if (script.recommendation?.isSeoCritical) {
      seoCriticalScripts.push({
        name: script.recommendation.seoCriticalName,
        type: script.recommendation.seoCriticalType,
        caveat: script.recommendation.caveat
      });
    }
  });

  // Identify main issues (excluding SEO-critical scripts from "problems")
  const headScriptsSync = scripts.filter(s =>
    s.position.location === 'head' &&
    s.loading.strategy === 'none' &&
    !s.isInline &&
    !s.recommendation?.isSeoCritical  // Don't flag SEO-critical scripts as issues
  );

  const analyticsNoDefer = scripts.filter(s =>
    s.category === 'analytics' &&
    s.loading.strategy === 'none' &&
    !s.recommendation?.isSeoCritical
  );

  const chatWidgetsSync = scripts.filter(s =>
    s.category === 'chat' &&
    s.loading.strategy !== 'lazy'
  );

  if (headScriptsSync.length > 0) {
    issues.push(`${headScriptsSync.length} synchronous script${headScriptsSync.length > 1 ? 's' : ''} in <head> blocking render`);
  }

  if (analyticsNoDefer.length > 0) {
    issues.push(`${analyticsNoDefer.length} analytics script${analyticsNoDefer.length > 1 ? 's' : ''} should use async attribute`);
    potentialSavings += analyticsNoDefer.length * 150; // Estimate 150ms per script
  }

  if (chatWidgetsSync.length > 0) {
    issues.push(`${chatWidgetsSync.length} chat widget${chatWidgetsSync.length > 1 ? 's' : ''} should be lazy-loaded`);
    potentialSavings += chatWidgetsSync.length * 150; // Estimate 150ms per widget
  }

  // Calculate estimated blocking time (excluding SEO-critical scripts)
  scripts.forEach(script => {
    if (script.recommendation && script.recommendation.hasIssue && !script.recommendation.isSeoCritical) {
      if (script.size && script.size.transferSize) {
        // Rough estimate: 1KB = 1ms on 3G
        totalBlockingTime += Math.floor(script.size.transferSize / 1000);
      } else {
        // Default estimate if size not available
        totalBlockingTime += 100;
      }
    }
  });

  // Calculate potential savings
  if (potentialSavings === 0 && headScriptsSync.length > 0) {
    potentialSavings = headScriptsSync.length * 150;
  }

  // Build result object
  const result = {
    totalBlockingTime,
    potentialSavings: Math.min(potentialSavings, totalBlockingTime),
    mainIssues: issues,
    issueCount: issues.length,
    hasNoIssues: issues.length === 0,
    seoCriticalScripts: seoCriticalScripts,
    seoCriticalCount: seoCriticalScripts.length
  };

  // Add success message or SEO context when no issues
  if (issues.length === 0) {
    if (seoCriticalScripts.length > 0) {
      result.successMessage = 'No render-blocking issues found. Your SEO and analytics scripts are correctly configured.';
      result.seoCriticalNote = `Found ${seoCriticalScripts.length} SEO-critical script${seoCriticalScripts.length > 1 ? 's' : ''} that should remain in <head> for proper indexing and analytics.`;
    } else {
      result.successMessage = 'Excellent! No render-blocking issues detected. Your scripts are well-optimized.';
    }
  }

  return result;
}

/**
 * Prioritize scripts by impact
 * Returns scripts sorted by optimization priority
 *
 * @param {Array} scripts - Array of analyzed scripts
 * @returns {Array} Sorted scripts (highest priority first)
 */
export function prioritizeScripts(scripts) {
  return [...scripts].sort((a, b) => {
    // Prioritize scripts with issues
    if (a.recommendation.hasIssue && !b.recommendation.hasIssue) return -1;
    if (!a.recommendation.hasIssue && b.recommendation.hasIssue) return 1;

    // Then by blocking score
    if (a.recommendation.blockingScore !== b.recommendation.blockingScore) {
      return b.recommendation.blockingScore - a.recommendation.blockingScore;
    }

    // Then by size (larger first)
    const aSize = a.size?.transferSize || 0;
    const bSize = b.size?.transferSize || 0;
    return bSize - aSize;
  });
}
