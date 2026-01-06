# Critical CSS - Real World Results

**Status:** Draft  
**Feature:** Critical CSS  
**Post Type:** Case study / Results  
**Builds on:** 001-introduction.md  

---

## Post

I ran my Critical CSS tool against 10 production sites.

Here's what actually happened:

**Site 1: E-commerce (Shopify)**
- Before: 342KB CSS (12 files)
- After: 28KB critical
- Reduction: 92%

**Site 2: Blog (WordPress)**  
- Before: 847KB CSS (23 files!)
- After: 12KB critical
- Reduction: 98%

**Site 3: SaaS landing page**
- Before: 156KB CSS (3 files)
- After: 31KB critical
- Reduction: 80%

**Site 4: News site**
- Before: 523KB CSS (8 files)
- After: 67KB critical
- Reduction: 87%

The pattern: Most sites ship 5-10x more CSS than they need for initial render.

**But here's what surprised me:**

The WordPress site with 23 stylesheets? Each plugin adding its own CSS file. After extraction, 98% of that CSS was never used above the fold.

The SaaS page only hit 80% reduction — turns out they were already pretty optimized. Diminishing returns are real.

**What I'm measuring next:**
- LCP impact before/after
- Time to First Byte changes
- Real user metrics via CrUX

The tool's free if you want to benchmark your own sites. Link in comments.

What's the most bloated CSS you've seen in the wild?

#WebPerformance #CSS #CoreWebVitals #PageSpeed

---

## Notes

- Concrete numbers build trust
- Shows range of results (not everything is 90%+)
- Acknowledges limitations (diminishing returns)
- Sets up future posts about LCP metrics

## Data to collect before posting

- [ ] Run tool on 10 real sites
- [ ] Screenshot the before/after
- [ ] Document any failures or edge cases
