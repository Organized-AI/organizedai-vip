# Phase 3: White Paper Engine — OrganizedAI.VIP

## Context
Read PLANNING/PHASE-1-PROMPT.md for design system. We need a proper white paper reading experience using Astro content collections + MDX.

## Tasks

### 1. Paper Layout (src/layouts/PaperLayout.astro)

Create a dedicated reading layout for white papers:
- Max-width: 720px (--content-width) for comfortable reading
- Typography optimized for long-form:
  - Body: Inter, 18px, 1.7 line-height
  - Headers: JetBrains Mono
  - Code blocks: JetBrains Mono with dark card background
- Table of contents sidebar (fixed, left side on desktop, collapsed on mobile)
  - Auto-generated from h2/h3 headings
  - Highlights current section on scroll
- Paper metadata header:
  - Title (large, monospace)
  - Subtitle
  - Author + date
  - Tags as small monospace badges
  - Abstract in italics with left green border
- Reading time estimate
- Footer with "← Back to Papers" link and next paper suggestion

### 2. Dynamic Paper Routes (src/pages/papers/[...slug].astro)

- Use `getStaticPaths` to generate pages from content collection
- Render MDX content with PaperLayout
- Support for custom MDX components:
  - `<Callout>` — highlighted insight boxes (green left border)
  - `<Architecture>` — monospace ASCII diagram wrapper
  - `<Metric>` — stat/number highlight (large monospace number + label)

### 3. MDX Components

Create reusable components for white papers:

**Callout.astro:**
```
Props: type ('insight' | 'warning' | 'technical'), title
Renders: bordered box with icon, title, and slot content
```

**Architecture.astro:**
```
Props: title
Renders: monospace pre-formatted block with title header
Good for ASCII architecture diagrams
```

**Metric.astro:**
```
Props: value, label
Renders: large green monospace number with small label underneath
Use in rows for stats sections
```

### 4. Paper Sharing & SEO

For each paper page:
- Open Graph meta tags (title, description, image)
- Twitter card meta tags
- Schema.org Article structured data
- Canonical URL
- Generate OG image placeholder (title on dark background)

## Success Criteria
- [ ] PaperLayout renders with table of contents
- [ ] TOC highlights current section on scroll
- [ ] MDX components (Callout, Architecture, Metric) render correctly
- [ ] Dynamic routes generate from content collection
- [ ] Schema.org Article data validates
- [ ] Reading experience is comfortable on desktop and mobile
- [ ] Code blocks use JetBrains Mono with proper dark styling

## Completion
```bash
git add . && git commit -m "Phase 3 complete: White paper engine with MDX components"
```
