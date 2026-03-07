# Phase 1: Design System — OrganizedAI.VIP

## Context
Read PLANNING/PHASE-0-PROMPT.md for project context. We need a design system that matches the selfimprovingcode.ai aesthetic: minimalist, dark, engineering-firm feel with monospace typography and lots of whitespace.

## Design Reference
- selfimprovingcode.ai: sparse vertical flow, dark background, monospace headers, short punchy copy
- frawdbot.ai: terminal aesthetic, interactive elements, security-focused branding
- The vibe is "engineering firm that builds infrastructure" not "SaaS landing page"

## Tasks

### 1. Global CSS Design Tokens
Create `src/styles/global.css` with:
```css
:root {
  /* Palette — dark engineering firm */
  --bg-primary: #0a0a0a;
  --bg-secondary: #111111;
  --bg-card: #161616;
  --border: #222222;
  --text-primary: #e5e5e5;
  --text-secondary: #888888;
  --text-muted: #555555;
  --accent: #4ade80;        /* green accent — signals "active/operational" */
  --accent-dim: #166534;
  --danger: #ef4444;

  /* Typography */
  --font-mono: 'JetBrains Mono', monospace;
  --font-body: 'Inter', -apple-system, sans-serif;

  /* Spacing scale */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 2rem;
  --space-lg: 4rem;
  --space-xl: 8rem;
  --space-2xl: 12rem;

  /* Layout */
  --max-width: 1100px;
  --content-width: 720px;
}
```

Key design rules:
- Background: near-black (#0a0a0a)
- Headers: monospace (JetBrains Mono), light text
- Body: Inter, secondary gray text
- Green accent for CTAs and status indicators
- Generous vertical spacing between sections (--space-xl minimum)
- No rounded corners (sharp edges = engineering aesthetic)
- Subtle 1px borders, never box shadows
- Links: green accent, no underline, monospace

### 2. BaseLayout Component
Create `src/layouts/BaseLayout.astro`:
- Full-width dark background
- Centered content container (max-width: 1100px)
- Import fonts from @fontsource
- Meta tags for SEO (title, description, og:image)
- Schema.org JSON-LD for ProfessionalService

### 3. Header Component
Create `src/components/Header.astro`:
- Logo: "ORGANIZED AI" in monospace, tracked-out uppercase
- Nav links: Services | Papers | About | Contact
- Minimal — single line, no hamburger needed (4 links max)
- Sticky with blur backdrop on scroll

### 4. Footer Component
Create `src/components/Footer.astro`:
- Copyright line
- Links to: GitHub (organized-ai), selfimprovingcode.ai, frawdbot.ai
- "A2A Enabled" badge linking to /.well-known/agent.json
- Email: contact@organizedai.vip

### 5. Hero Component
Create `src/components/Hero.astro`:
- Centered, large monospace heading
- Short tagline in body font, muted color
- Single CTA button (green accent)
- Massive top/bottom padding (--space-2xl)
- No images, no illustrations — text-only like selfimprovingcode.ai

### 6. ServiceCard Component
Create `src/components/ServiceCard.astro`:
- Props: title, description, features (string[]), highlighted (boolean)
- Dark card with 1px border
- Title in monospace
- Feature list with green bullet indicators
- Highlighted variant gets accent border

### 7. PaperCard Component
Create `src/components/PaperCard.astro`:
- Props: title, subtitle, date, abstract, slug
- Links to /papers/[slug]
- Shows abstract excerpt (2-3 lines)
- Date in monospace, muted
- Arrow indicator for "Read →"

## Success Criteria
- [ ] Dark theme renders correctly across all components
- [ ] JetBrains Mono loads for headers, Inter for body
- [ ] Components are responsive (mobile-first)
- [ ] No box shadows, no rounded corners, sharp engineering aesthetic
- [ ] Visual consistency with selfimprovingcode.ai reference
- [ ] All components accept appropriate props

## Completion
```bash
git add . && git commit -m "Phase 1 complete: Design system and core components"
```
