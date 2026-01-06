# Critical CSS Generator - Introduction Post

**Status:** Draft  
**Feature:** Critical CSS  
**Post Type:** Introduction / Launch  
**Target Audience:** Frontend developers, performance engineers  

---

## Post

I've been obsessing over a PageSpeed warning for months.

"Eliminate render-blocking resources."

You know the one. It haunts every audit.

The fix sounds simple: extract critical CSS, inline it, defer the rest. In practice? You're hunting through 15,000 lines of CSS trying to figure out which 200 actually matter for above-the-fold.

I got tired of doing this manually. So I built a thing.

**Speedkit** — starting with a Critical CSS Generator.

How it works:
→ Puppeteer renders your page in a headless browser
→ Captures only what's visible in the viewport
→ PurgeCSS strips everything else
→ PostCSS handles the minification

The results have been wild. I'm seeing 70-90% reductions on most sites. One WordPress theme went from 847KB of CSS to 12KB critical.

Still tinkering with the viewport detection logic — turns out "above the fold" is surprisingly hard to define when you account for lazy-loaded images and dynamic content.

If you're fighting the same PageSpeed battles, link's in comments. Would love feedback from anyone who's tackled this problem differently.

What's your current approach to critical CSS?

#WebPerformance #CSS #JavaScript #WebDev #CoreWebVitals #OpenSource

---

## Comment (post immediately after)

🔗 Try Speedkit: [YOUR_URL]

Built with Next.js 14, Puppeteer, PostCSS, and PurgeCSS.

Source code: [GITHUB_URL]

---

## Notes

- Emphasizes the tinkering/experimentation angle
- Asks for feedback to encourage engagement
- Mentions specific tech for credibility
- Real numbers (847KB → 12KB) add weight
- Acknowledges it's a work in progress

## Follow-up Post Ideas

- [ ] Deep dive on viewport detection challenges
- [ ] Before/after case study with real metrics
- [ ] How PurgeCSS works under the hood
- [ ] Handling dynamic/JS-rendered content
