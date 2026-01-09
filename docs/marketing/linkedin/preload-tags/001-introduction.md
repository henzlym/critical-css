# Preload Tag Generator - Introduction Post

**Status:** Draft  
**Feature:** Preload Tags  
**Post Type:** Introduction / Feature announcement  
**Target Audience:** Frontend developers, performance engineers  

---

## Post

New rabbit hole: preload tags.

I added a feature to Speedkit that analyzes any URL and generates optimized `<link rel="preload">` tags.

**Why this matters:**

The browser discovers resources in order. HTML → CSS → fonts → images. Each step waits for the previous one.

Preload hints let you say "hey browser, you're gonna need this font in 2 seconds, start downloading now."

**What the tool generates:**

```html
<!-- Critical fonts -->
<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin>

<!-- Hero image -->  
<link rel="preload" href="/hero.webp" as="image">

<!-- Above-fold CSS -->
<link rel="preload" href="/critical.css" as="style">

<!-- Early connections -->
<link rel="preconnect" href="https://fonts.gstatic.com">
<link rel="dns-prefetch" href="https://analytics.example.com">
```

**The logic:**
1. Puppeteer renders the page
2. Captures all network requests  
3. Filters for above-fold resources
4. Categorizes: fonts, images, styles, scripts
5. Generates appropriate preload/preconnect tags

**Gotchas I discovered:**
- Preload too much → you're just shifting the bottleneck
- `crossorigin` attribute matters for fonts (CORS)
- `as` attribute affects priority queue

Still tuning the heuristics for "what's worth preloading." Currently using file size + request timing as signals.

Link in comments if you want to try it.

#WebPerformance #HTML #PageSpeed #LCP #CoreWebVitals

---

## Notes

- Code example shows tangible output
- Lists specific gotchas (shows real experience)
- Admits it's still being tuned

## Follow-up Post Ideas

- [ ] Preload vs prefetch vs preconnect explained
- [ ] When preloading hurts performance
- [ ] Font loading strategies deep dive
