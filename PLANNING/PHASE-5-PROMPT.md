# Phase 5: Polish & Deploy — OrganizedAI.VIP

## Context
Read all previous phase prompts. Site is built, content is in. Now we polish and ship.

## Tasks

### 1. SEO & Meta Tags
For every page, ensure:
- Unique `<title>` and `<meta name="description">`
- Open Graph: og:title, og:description, og:image, og:url
- Twitter card: summary_large_image
- Canonical URLs

### 2. Schema.org Structured Data
Add to BaseLayout:
```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Organized AI",
  "description": "Managed AI agent infrastructure consultancy",
  "url": "https://organizedai.vip",
  "serviceType": "AI Infrastructure Consulting",
  "areaServed": "US",
  "founder": {
    "@type": "Person",
    "name": "Jordaaan Hill"
  }
}
```

Add Article schema to each white paper page.

### 3. A2A Agent Discovery
Create `public/.well-known/agent.json`:
```json
{
  "name": "Organized AI",
  "description": "Managed AI agent infrastructure — OpenClaw deployment, FrawdBot security, edge compute management",
  "url": "https://organizedai.vip",
  "capabilities": ["consultation", "infrastructure-setup", "managed-services"],
  "contact": "contact@organizedai.vip"
}
```

### 4. Performance Optimization
- Ensure all images use Astro's `<Image>` component
- Verify CSS is minimal (no unused styles)
- Check Lighthouse score — target 95+ on all metrics
- Add proper caching headers in wrangler.toml

### 5. Favicon & OG Image
- Create minimal favicon.svg (monospace "OA" mark, green on dark)
- Create OG image template (dark background, title text, Organized AI branding)

### 6. Cloudflare Pages Deployment
```bash
npm run build
npx wrangler pages deploy dist --project-name=organized-ai-vip
```
- Set custom domain: organizedai.vip
- Configure DNS in Cloudflare dashboard
- Verify deployment at production URL

### 7. Final QA
- Test all pages on mobile and desktop
- Verify all internal links work
- Check white paper rendering (TOC, MDX components)
- Validate Schema.org with Google's Rich Results Test
- Test contact form submission
- Verify Calendly embed loads

## Success Criteria
- [ ] Site live at organizedai.vip
- [ ] Lighthouse 95+ on all metrics
- [ ] Schema.org validates
- [ ] A2A agent.json accessible
- [ ] All pages render correctly on mobile
- [ ] White papers have proper OG images for social sharing
- [ ] Contact form functional

## Completion
```bash
git add . && git commit -m "Phase 5 complete: OrganizedAI.VIP launched"
git tag v1.0.0
git push --tags
```
