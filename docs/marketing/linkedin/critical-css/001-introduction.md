# Critical CSS Generator - Introduction Post

**Status:** Draft
**Feature:** Critical CSS
**Post Type:** Introduction / Launch
**Target Audience:** Frontend developers, performance engineers

---

## Post

I've been working on a side project lately.

**Speedkit** is my attempt at creating a web performance toolkit. The first feature I'm shipping: a Critical CSS Generator.

The idea is simple:
→ Enter any URL
→ The tool renders the page in a headless browser
→ Extracts only the CSS needed for above-the-fold content
→ Gives you optimized files ready to use

I've been learning a ton building this — Puppeteer quirks, how PurgeCSS decides what to keep, the surprising complexity of defining "above the fold" when you account for different viewports and dynamic content.

It's still early, and I'm sure there are edge cases I haven't hit yet. That's part of the fun.

If you're curious, the link's in the comments. I'd love to hear:
- What breaks it
- How you currently handle critical CSS
- What other performance tools you wish existed

#WebPerformance #CSS #WebDev #NextJS #JavaScript #OpenSource

---

## Comment (post immediately after)

🔗 Try Speedkit: https://speedkit.henzlymeghie.com

Built with Next.js 14, Puppeteer, PostCSS, and PurgeCSS.

Would love your feedback — what works, what doesn't, what would make it more useful?

---

## Notes

- Removed specific metrics (847KB → 12KB) since not fully tested
- Shifted tone to "having fun" and "learning"
- Frames as first feature of a toolkit (not a finished product)
- Explicitly asks for feedback and edge cases
- Acknowledges it's early/experimental
- "Building in public = learning in public" reinforces the journey

## Follow-up Post Ideas

- [ ] Deep dive on viewport detection challenges
- [ ] "Here's what broke" — sharing edge cases people found
- [ ] Lessons learned from building with Puppeteer
- [ ] What's next for Speedkit (roadmap teaser)
