# Phase 0: Project Setup — OrganizedAI.VIP

## Context
We're building an Astro static site deployed to Cloudflare Pages. The site is for an AI infrastructure consultancy called Organized AI. Design aesthetic: minimalist engineering firm (reference: selfimprovingcode.ai — sparse layout, dark theme, monospace typography, vertical flow).

## Prerequisites
- Node.js 20+
- Wrangler CLI installed

## Tasks

### 1. Initialize Astro Project
```bash
npm create astro@latest organized-ai-vip -- --template minimal --no-install
cd organized-ai-vip
```

### 2. Install Dependencies
```bash
npm install
npx astro add @astrojs/cloudflare @astrojs/mdx @astrojs/sitemap
npm install @fontsource/jetbrains-mono @fontsource/inter
```

### 3. Configure Astro for Cloudflare
Update `astro.config.mjs`:
```javascript
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://organizedai.vip',
  output: 'static',
  adapter: cloudflare(),
  integrations: [mdx(), sitemap()],
});
```

### 4. Create Project Structure
```
src/
├── layouts/
│   ├── BaseLayout.astro
│   └── PaperLayout.astro
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── Hero.astro
│   ├── ServiceCard.astro
│   └── PaperCard.astro
├── pages/
│   ├── index.astro
│   ├── services.astro
│   ├── about.astro
│   ├── contact.astro
│   └── papers/
│       └── index.astro
├── content/
│   └── papers/
│       ├── infrastructure-playbook.mdx
│       └── edge-compute-economics.mdx
├── styles/
│   └── global.css
public/
├── .well-known/
│   └── agent.json
├── favicon.svg
└── og-image.png
```

### 5. Configure Content Collections
Create `src/content/config.ts`:
```typescript
import { defineCollection, z } from 'astro:content';

const papers = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    date: z.date(),
    author: z.string(),
    abstract: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean().default(false),
  }),
});

export const collections = { papers };
```

### 6. Create Wrangler Config
Create `wrangler.toml`:
```toml
name = "organized-ai-vip"
compatibility_date = "2026-03-06"

[site]
bucket = "./dist"
```

### 7. Initialize Git + GitHub
```bash
git init
git add .
git commit -m "Phase 0: Astro project setup with Cloudflare + MDX"
gh repo create organized-ai/organized-ai-vip --public --source=. --push
```

## Success Criteria
- [ ] `npm run dev` starts Astro dev server without errors
- [ ] Project structure matches specification above
- [ ] Content collection config validates without errors
- [ ] Git repo initialized and pushed to organized-ai GitHub
- [ ] wrangler.toml configured for Cloudflare Pages

## Completion
When all criteria pass:
```bash
git add . && git commit -m "Phase 0 complete: Project scaffolding"
```
