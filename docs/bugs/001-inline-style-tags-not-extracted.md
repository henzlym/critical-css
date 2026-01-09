# Bug: Inline Style Tags Not Extracted

**Status:** Open
**Severity:** Medium
**Reported:** January 2026
**Affected URLs:** Sites using CSS-in-JS, inline Tailwind, or `<style>` tags

## Summary

When extracting CSS from a URL, sites that use inline `<style>` tags instead of external `<link rel="stylesheet">` files return empty results with no user feedback.

## Reproduction

1. Go to the Critical CSS Generator
2. Enter URL: `https://seojuice.io/tools/`
3. Click "Generate CSS"
4. Observe: Loading spinner appears, then disappears with no output

## Expected Behavior

Either:
- Extract CSS from inline `<style>` tags
- Display a clear message explaining why no CSS was found

## Actual Behavior

- API returns 200 with empty CSS and message "No stylesheets found on the page"
- UI shows nothing — no error, no results, no explanation
- User left confused about what happened

## Root Cause Analysis

### 1. CSS Discovery Limitation

**File:** `src/pages/api/fetch-css.js:238-242`

The stylesheet discovery only looks for external stylesheet links:

```javascript
const cssLinks = await page.evaluate(() => {
  return Array.from(
    document.querySelectorAll('link[rel="stylesheet"]')
  ).map((link) => link.href);
});
```

This misses:
- `<style>` tags (inline CSS)
- CSS-in-JS (styled-components, Emotion, etc.)
- Inlined Tailwind CSS builds
- Critical CSS already inlined by other tools

### 2. UI Conditional Rendering

**File:** `src/app/page.js:212-239`

The result sections only render when `minified` or `critical` have content:

```javascript
{minified && !loading && (
  <CssResultSection ... />
)}
```

When the API returns empty strings, these conditions are `false`, so nothing renders.

### 3. Message Not Surfaced

The API response includes a `message` field:
```json
{
  "message": "No stylesheets found on the page",
  "minified": "",
  "critical": ""
}
```

But the UI never displays this message to the user.

## Affected Site Types

| Site Type | Example | Issue |
|-----------|---------|-------|
| Tailwind CSS (inlined) | seojuice.io | All CSS in `<style>` tags |
| Next.js with CSS-in-JS | Many React apps | Styled-components, Emotion |
| WordPress with caching | Sites using WP Rocket | CSS often inlined for performance |
| Static site generators | Hugo, 11ty | May inline critical CSS |
| Single-page apps | Vue, Angular | Often use scoped styles |

## Solution Plan

### Fix 1: UI Message Display (Quick Win)

Show a user-friendly message when no external stylesheets are found.

**Implementation:**
1. Track the `message` field from API response
2. Display message when no CSS results but request succeeded
3. Explain what the tool looks for and why it may have failed

### Fix 2: Inline Style Tag Support (Feature)

Extract CSS from `<style>` tags in addition to external stylesheets.

**Implementation Steps:**

1. **Extend CSS Discovery**
   ```javascript
   // In page.evaluate(), also capture <style> tag contents
   const inlineStyles = await page.evaluate(() => {
     return Array.from(document.querySelectorAll('style'))
       .map(style => style.textContent)
       .filter(Boolean);
   });
   ```

2. **Combine Sources**
   - Fetch external stylesheets (existing logic)
   - Extract inline `<style>` contents
   - Merge into single combined CSS

3. **Update Metadata**
   - Track which CSS came from inline vs external
   - Provide visibility into CSS sources

4. **Handle Edge Cases**
   - Skip empty `<style>` tags
   - Handle scoped styles appropriately
   - Consider deduplication

## Technical Considerations

### Pros of Adding Inline Support
- Covers modern CSS-in-JS frameworks
- Handles performance-optimized sites
- More accurate critical CSS extraction
- Better user experience

### Cons / Challenges
- CSS-in-JS may generate styles dynamically after page load
- Some inline styles are already critical CSS (circular optimization)
- Scoped styles may not work well when extracted
- Potential for duplicate CSS if same rules in both inline and external

### Recommendation

Implement both fixes:
1. **Immediate:** Add UI feedback for "no stylesheets" case
2. **Short-term:** Add inline `<style>` tag extraction as opt-in feature

## Related Files

- `src/pages/api/fetch-css.js` — API route with CSS discovery
- `src/app/page.js` — Main UI component
- `docs/architecture/css-extraction-flow.md` — Technical flow documentation
