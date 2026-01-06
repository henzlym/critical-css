# Critical CSS - Viewport Detection Deep Dive

**Status:** Draft  
**Feature:** Critical CSS / Above-the-fold  
**Post Type:** Technical deep dive  
**Builds on:** 001-introduction.md  

---

## Post

"Above the fold" is a lie.

I've been building a critical CSS tool, and the hardest part isn't the CSS extraction — it's defining what "above the fold" actually means.

Here's what I learned:

**Problem 1: Viewport varies wildly**
- Mobile: 375×667
- Tablet: 768×1024  
- Desktop: 1920×1080
- Ultra-wide: 2560×1080

Which one is "the fold"? All of them.

**Problem 2: Content shifts**
Lazy images, web fonts loading, JavaScript hydration — the layout you see at 0ms is different from 500ms is different from 2000ms.

**Problem 3: Dynamic elements**
Modals, sticky headers, cookie banners. Are they "above the fold" if they appear on scroll?

**My current approach:**

```javascript
// Capture at multiple breakpoints
const breakpoints = [
  { width: 375, height: 812, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1440, height: 900, name: 'desktop' }
];
```

Then I union the CSS from all three. Not perfect, but catches most cases.

Still experimenting with:
- Wait strategies (networkidle vs domcontentloaded)
- Intersection Observer to detect "visible" elements
- Excluding fixed/sticky positioned elements

Anyone else gone down this rabbit hole? What edge cases bit you?

#WebPerformance #CSS #JavaScript #FrontendDevelopment

---

## Notes

- Shows technical depth without being inaccessible
- Code snippet adds credibility
- Positions as learning journey, invites collaboration
- Natural follow-up to intro post

## Follow-up Post Ideas

- [ ] Handling web fonts in critical CSS
- [ ] The networkidle vs domcontentloaded tradeoff
- [ ] Multi-breakpoint CSS generation results
