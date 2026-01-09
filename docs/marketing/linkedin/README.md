# LinkedIn Content Strategy

## Folder Structure

```
docs/linkedin/
├── README.md                    # This file
├── speedkit/                    # Overall product posts
│   └── 001-launch.md
├── critical-css/                # Critical CSS feature posts
│   ├── 001-introduction.md
│   ├── 002-viewport-detection.md
│   └── 003-real-world-results.md
├── preload-tags/                # Preload feature posts
│   └── 001-introduction.md
└── [future-feature]/            # Add folders as features grow
```

## Naming Convention

`[NNN]-[topic].md`

- `NNN` = Sequential number (001, 002, 003...)
- Lower numbers = foundational/intro content
- Higher numbers = deeper dives, improvements, updates

## Post Template

```markdown
# [Feature] - [Topic]

**Status:** Draft | Ready | Posted  
**Feature:** [Feature name]  
**Post Type:** Introduction | Deep dive | Case study | Update  
**Builds on:** [Previous post if applicable]  
**Posted:** [Date if posted]  
**URL:** [LinkedIn URL if posted]

---

## Post

[Content here]

---

## Comment

[Follow-up comment with links]

---

## Notes

[Internal notes, learnings, engagement stats]

## Follow-up Post Ideas

- [ ] Idea 1
- [ ] Idea 2
```

## Content Pillars

### 1. **Tinkering & Experimentation**
- Share the process, not just results
- "Here's what I tried and what broke"
- Ask for alternative approaches

### 2. **Real Numbers**
- Before/after file sizes
- Performance metrics
- Concrete examples

### 3. **Technical Depth**
- Code snippets
- Architecture decisions
- Edge cases and gotchas

### 4. **Building in Public**
- Roadmap transparency
- Invite feedback
- Acknowledge limitations

## Posting Cadence

Suggested rhythm:
- **Week 1:** Feature introduction
- **Week 2:** Technical deep dive
- **Week 3:** Results/case study
- **Week 4:** Improvements or new feature intro

## Hashtags by Topic

**Performance:** #WebPerformance #CoreWebVitals #PageSpeed #LCP  
**Technical:** #JavaScript #CSS #WebDev #FrontendDevelopment  
**Community:** #OpenSource #BuildInPublic #DevTools  

## Engagement Tracking

| Post | Date | Impressions | Reactions | Comments | Reposts |
|------|------|-------------|-----------|----------|---------|
| | | | | | |

---

## Ideas Backlog

### Critical CSS
- [ ] Handling CSS-in-JS frameworks
- [ ] Web fonts and critical CSS
- [ ] The networkidle timing problem
- [ ] WordPress-specific optimizations

### Preload Tags
- [ ] When preloading backfires
- [ ] preload vs prefetch vs preconnect
- [ ] Font loading strategies
- [ ] Priority hints

### General Performance
- [ ] Why your Lighthouse score lies
- [ ] Real user metrics vs lab data
- [ ] The cascade of render-blocking
- [ ] Image optimization quick wins
