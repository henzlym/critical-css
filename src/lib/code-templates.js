/**
 * Code templates for script optimization recommendations
 * Generates copy-ready code examples for different loading strategies
 */

/**
 * Template for lazy-loading scripts on user interaction
 *
 * @param {string} src - Script URL
 * @param {string} trigger - Event trigger (scroll, click, timeout)
 * @returns {string} HTML code example
 */
export const lazyLoadTemplate = (src, trigger = 'scroll') => {
  if (trigger === 'timeout') {
    return `<!-- Load after 3 seconds -->
<script>
  setTimeout(function() {
    const script = document.createElement('script');
    script.src = '${src}';
    document.body.appendChild(script);
  }, 3000);
</script>`;
  }

  return `<!-- Load on ${trigger} event -->
<script>
  function loadScript() {
    const script = document.createElement('script');
    script.src = '${src}';
    document.body.appendChild(script);
  }

  window.addEventListener('${trigger}', loadScript, { once: true });

  // Fallback: load after 5 seconds if no interaction
  setTimeout(loadScript, 5000);
</script>`;
};

/**
 * Template for defer attribute
 *
 * @param {string} src - Script URL
 * @returns {string} HTML code example
 */
export const deferTemplate = (src) => {
  return `<!-- Deferred loading (downloads in parallel, executes after HTML parsing) -->
<script defer src="${src}"></script>`;
};

/**
 * Template for async attribute
 *
 * @param {string} src - Script URL
 * @returns {string} HTML code example
 */
export const asyncTemplate = (src) => {
  return `<!-- Async loading (downloads and executes independently) -->
<script async src="${src}"></script>`;
};

/**
 * Template for preload + async
 *
 * @param {string} src - Script URL
 * @returns {string} HTML code example
 */
export const preloadAsyncTemplate = (src) => {
  return `<!-- Preload for faster loading (place in <head>) -->
<link rel="preload" href="${src}" as="script">

<!-- Async script (place before </body>) -->
<script async src="${src}"></script>`;
};

/**
 * Template for preload + defer
 *
 * @param {string} src - Script URL
 * @returns {string} HTML code example
 */
export const preloadDeferTemplate = (src) => {
  return `<!-- Preload for priority loading (place in <head>) -->
<link rel="preload" href="${src}" as="script">

<!-- Deferred script (place in <head> or before </body>) -->
<script defer src="${src}"></script>`;
};

/**
 * Optimized Google Tag Manager template
 *
 * @param {string} gtmId - GTM container ID
 * @returns {string} HTML code example
 */
export const gtmOptimizedTemplate = (gtmId = 'GTM-XXXX') => {
  return `<!-- Optimized Google Tag Manager (lazy-loaded) -->
<script>
  // Load GTM after user interaction
  function loadGTM() {
    if (window.gtmLoaded) return; // Prevent duplicate loading
    window.gtmLoaded = true;

    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');
  }

  // Trigger on first user interaction
  ['scroll', 'click', 'mousemove', 'touchstart', 'keydown'].forEach(function(event) {
    window.addEventListener(event, loadGTM, { once: true });
  });

  // Fallback: load after 5 seconds
  setTimeout(loadGTM, 5000);
</script>

<!-- GTM noscript fallback -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;
};

/**
 * Optimized Google Analytics template
 *
 * @param {string} trackingId - GA tracking ID
 * @returns {string} HTML code example
 */
export const gaOptimizedTemplate = (trackingId = 'GA-TRACKING-ID') => {
  return `<!-- Optimized Google Analytics (lazy-loaded) -->
<script>
  // Load GA after interaction or timeout
  function loadGA() {
    if (window.gaLoaded) return; // Prevent duplicate loading
    window.gaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${trackingId}');

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=${trackingId}';
    document.head.appendChild(script);
  }

  // Trigger on scroll or after 3 seconds
  window.addEventListener('scroll', loadGA, { once: true });
  setTimeout(loadGA, 3000);
</script>`;
};

/**
 * Template for inline scripts optimization
 *
 * @param {string} content - Inline script content
 * @returns {string} HTML code example
 */
export const inlineOptimizedTemplate = (content) => {
  return `<!-- Keep inline script, but move to end of <body> if possible -->
<script>
${content}
</script>`;
};

/**
 * Template for conditional loading
 *
 * @param {string} src - Script URL
 * @param {string} condition - JavaScript condition
 * @returns {string} HTML code example
 */
export const conditionalLoadTemplate = (src, condition) => {
  return `<!-- Load only when needed -->
<script>
  if (${condition}) {
    const script = document.createElement('script');
    script.src = '${src}';
    document.body.appendChild(script);
  }
</script>`;
};

/**
 * Template for module script
 *
 * @param {string} src - Script URL
 * @returns {string} HTML code example
 */
export const moduleTemplate = (src) => {
  return `<!-- ES6 module with fallback -->
<script type="module" src="${src}"></script>
<script nomodule src="${src.replace('.js', '.legacy.js')}"></script>`;
};

/**
 * Template for Facebook Pixel optimization
 *
 * @param {string} pixelId - Facebook Pixel ID
 * @returns {string} HTML code example
 */
export const facebookPixelOptimizedTemplate = (pixelId = 'PIXEL-ID') => {
  return `<!-- Optimized Facebook Pixel (lazy-loaded) -->
<script>
  function loadFBPixel() {
    if (window.fbqLoaded) return;
    window.fbqLoaded = true;

    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  }

  // Load on interaction
  ['scroll', 'click', 'mousemove'].forEach(function(e) {
    window.addEventListener(e, loadFBPixel, { once: true });
  });
  setTimeout(loadFBPixel, 3000);
</script>`;
};

/**
 * Select the appropriate template based on script properties
 *
 * @param {Object} script - Script object with vendor and recommendation info
 * @returns {string} HTML code example
 */
export function selectTemplate(script) {
  const { vendor, recommendation, src, isInline, textContent } = script;

  // Handle inline scripts
  if (isInline) {
    const content = textContent || '';
    return inlineOptimizedTemplate(content);
  }

  // Special templates for common vendors
  if (vendor === 'Google Tag Manager') {
    return gtmOptimizedTemplate();
  }

  if (vendor === 'Google Analytics') {
    return gaOptimizedTemplate();
  }

  if (vendor === 'Facebook Pixel') {
    return facebookPixelOptimizedTemplate();
  }

  // Generic templates based on suggested strategy
  switch (recommendation.suggestedStrategy) {
    case 'lazy-load':
      return lazyLoadTemplate(src, 'scroll');
    case 'defer':
      return deferTemplate(src);
    case 'async':
      return asyncTemplate(src);
    case 'head-defer':
      return deferTemplate(src);
    case 'preload-or-async':
      return preloadAsyncTemplate(src);
    case 'preload':
      return preloadDeferTemplate(src);
    case 'head-sync':
      return `<!-- Keep in <head> for critical functionality -->\n<script src="${src}"></script>`;
    default:
      return `<script src="${src}"></script>`;
  }
}

/**
 * Generate a comparison showing current vs recommended implementation
 *
 * @param {Object} script - Script object
 * @returns {Object} Object with current and recommended code
 */
export function generateComparison(script) {
  const { src, loading, position } = script;

  // Current implementation
  let current = '';
  if (script.isInline) {
    current = '<!-- Inline script in ' + position.location + ' -->';
  } else {
    const attrs = [];
    if (loading.strategy === 'async') attrs.push('async');
    if (loading.strategy === 'defer') attrs.push('defer');
    if (loading.strategy === 'module') attrs.push('type="module"');

    current = `<!-- Current: in <${position.location}> -->\n<script ${attrs.join(' ')} src="${src}"></script>`;
  }

  // Recommended implementation
  const recommended = selectTemplate(script);

  return {
    current,
    recommended
  };
}

/**
 * Generate current implementation code
 *
 * @param {Object} script - Script object
 * @returns {string} Current code implementation
 */
export function generateCurrentCode(script) {
  const { src, isInline, position, loading, textContent } = script;

  if (isInline) {
    const content = textContent || '';
    return `<!-- Current: Inline in <${position.location}> -->\n<script>\n${content}\n</script>`;
  }

  const attrs = [];
  if (loading.strategy === 'async') attrs.push('async');
  if (loading.strategy === 'defer') attrs.push('defer');

  const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
  const strategy = loading.strategy || 'synchronous';

  return `<!-- Current: in <${position.location}>, ${strategy} -->\n<script${attrStr} src="${src}"></script>`;
}
