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

  // Rule 1: Inline script analysis
  if (isInline) {
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
  let totalBlockingTime = 0;
  let potentialSavings = 0;

  // Identify main issues
  const headScriptsSync = scripts.filter(s =>
    s.position.location === 'head' &&
    s.loading.strategy === 'none' &&
    !s.isInline
  );

  const analyticsNoDefer = scripts.filter(s =>
    s.category === 'analytics' &&
    s.loading.strategy === 'none'
  );

  const chatWidgetsSync = scripts.filter(s =>
    s.category === 'chat' &&
    s.loading.strategy !== 'lazy'
  );

  if (headScriptsSync.length > 0) {
    issues.push(`${headScriptsSync.length} synchronous script${headScriptsSync.length > 1 ? 's' : ''} in <head> blocking render`);
  }

  if (analyticsNoDefer.length > 0) {
    issues.push(`${analyticsNoDefer.length} analytics script${analyticsNoDefer.length > 1 ? 's' : ''} should use defer attribute`);
    potentialSavings += analyticsNoDefer.length * 150; // Estimate 150ms per script
  }

  if (chatWidgetsSync.length > 0) {
    issues.push(`${chatWidgetsSync.length} chat widget${chatWidgetsSync.length > 1 ? 's' : ''} should be lazy-loaded`);
    potentialSavings += chatWidgetsSync.length * 150; // Estimate 150ms per widget
  }

  // Calculate estimated blocking time
  scripts.forEach(script => {
    if (script.recommendation && script.recommendation.hasIssue) {
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

  return {
    totalBlockingTime,
    potentialSavings: Math.min(potentialSavings, totalBlockingTime),
    mainIssues: issues.length > 0 ? issues : ['No major issues detected'],
    issueCount: issues.length
  };
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
