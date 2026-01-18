# SVG Description: Main Parser vs Preload Scanner

## Overall Composition
A side-by-side comparison diagram showing two parallel timelines. Dark background with two equal-width columns separated by a circular "VS" badge. Clean, minimal design with clear visual hierarchy.

## Dimensions & Layout
- **Canvas:** 700 × 450 pixels, landscape orientation
- **Background:** Deep charcoal (#16171d)
- **Two columns:** Each 290px wide with 40px margins
- **Vertical flow:** Title → Column headers → 3 timeline steps → Result summary

---

## Left Column: Main HTML Parser (Problem State)

**Header:**
- Rounded rectangle with blue tint (rgba 94, 124, 226, 0.15)
- Glowing blue dot indicator
- Label: "Main HTML Parser"

**Timeline (3 steps stacked vertically):**

1. **Step 1 - Active parsing:**
   - Small card with blue-tinted progress bar
   - Text: "Parsing `<head>`..."

2. **Step 2 - BLOCKED (largest section):**
   - Tall card with diagonal stripe pattern (warning/hazard aesthetic)
   - Orange/red color scheme (#ff6b35)
   - **Stop sign icon** in center: circle with horizontal bar
   - Bold text: "BLOCKED"
   - Subtext: "Waiting for render-blocking script..."

3. **Step 3 - Resume:**
   - Small card with teal-tinted progress bar
   - Text: "Resume parsing `<body>`"

**Result Box:**
- Orange-tinted rounded rectangle
- Bold text: "Resources discovered LATE"
- Subtext: "Fonts & images wait for parser to reach them"

---

## Right Column: Preload Scanner (Solution State)

**Header:**
- Rounded rectangle with teal tint (rgba 45, 212, 191, 0.15)
- Glowing teal dot indicator
- Label: "Preload Scanner"

**Timeline (3 steps stacked vertically):**

1. **Step 1 - Idle:**
   - Small card with gray/muted styling
   - Text: "Idle (parser not blocked yet)"

2. **Step 2 - SCANNING AHEAD (largest section):**
   - Tall card with teal border glow
   - Teal color scheme (#2dd4bf)
   - **Magnifying glass icon** in center: circle with diagonal handle line
   - Bold text: "SCANNING AHEAD"
   - Two discovery items with colored dots:
     - Purple dot: "hero.jpg discovered"
     - Blue dot: "font.woff2 discovered"

3. **Step 3 - Success:**
   - Small card with teal-tinted styling
   - Text: "Resources already fetching!"

**Result Box:**
- Teal-tinted rounded rectangle
- Bold text: "Resources discovered EARLY"
- Subtext: "Downloads start while parser is blocked"

---

## Center Divider
- Circular badge positioned between columns
- Dark fill with subtle border
- Text: "VS" in muted gray

---

## Bottom Pro Tip
- Full-width rounded rectangle spanning both columns
- Blue-tinted background
- Text: "Pro tip: Use `<link rel="preload">` to hint critical resources even earlier"

---

## Color Palette (SpeedKit Theme)

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Charcoal | #16171d | Background |
| Ethereal Blue | #5e7ce2 | Main parser, accents |
| Chrome Purple | #a855f7 | Discovered image indicator |
| Cyber Teal | #2dd4bf | Preload scanner, success |
| Neon Orange | #ff6b35 | Blocked state, warning |
| Text Primary | #f0f2f8 | Headlines |
| Text Secondary | #9ca8c4 | Body text, muted labels |

---

## Visual Effects
- **Glow filters** on indicator dots (blue and teal)
- **Diagonal stripe pattern** on blocked section (hazard feel)
- **Glass morphism** on cards (semi-transparent dark fills)
- **Subtle borders** with low-opacity strokes

---

## Key Visual Contrast

| Element | Left (Problem) | Right (Solution) |
|---------|----------------|------------------|
| Color | Orange/Red | Teal/Green |
| Icon | Stop sign | Magnifying glass |
| State | BLOCKED | SCANNING AHEAD |
| Result | Late | Early |

---

## AI Image Generation Prompt

> A professional technical diagram comparing two browser processes side by side. Dark charcoal background (#16171d). Left column labeled "Main HTML Parser" shows a timeline with a prominent red/orange "BLOCKED" section featuring a stop sign icon and diagonal warning stripes. Right column labeled "Preload Scanner" shows a parallel timeline with a teal "SCANNING AHEAD" section featuring a magnifying glass icon and discovered resources listed. A circular "VS" badge separates the columns. Bottom shows a pro tip about preload hints. Color scheme: teal (#2dd4bf) for success states, orange (#ff6b35) for blocked states, blue (#5e7ce2) for accents. Modern, minimal, glass morphism aesthetic. 16:9 aspect ratio.

**Filename:** `preload-scanner-comparison.jpg`
