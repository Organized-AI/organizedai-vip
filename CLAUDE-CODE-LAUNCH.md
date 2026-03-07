# OrganizedAI.VIP — Claude Code Launch Prompt

## Quick Start

```bash
cd /Users/supabowl/Library/Mobile\ Documents/com\~apple\~CloudDocs/BHT\ Promo\ iCloud/Organized\ AI/Windsurf
claude --dangerously-skip-permissions
```

Then paste:

```
Read the file at PLANNING/PHASE-0-PROMPT.md and execute all tasks. After completing Phase 0, continue to Phase 1 by reading PLANNING/PHASE-1-PROMPT.md. Continue sequentially through all phases (0 → 1 → 2 → 3 → 4 → 4B → 5). Each phase prompt is in PLANNING/. Git commit after each phase completion.
```

## Claude Code Web (Environment Variables)

```
ASTRO_SITE=https://organizedai.vip
CLOUDFLARE_ACCOUNT_ID=<your-cf-account-id>
NODE_ENV=development
```

## Phase Execution Order

| Phase | Prompt File | What It Does |
|-------|------------|--------------|
| 0 | PHASE-0-PROMPT.md | Astro project setup, Cloudflare config, GitHub repo |
| 1 | PHASE-1-PROMPT.md | Design system, dark theme, components |
| 2 | PHASE-2-PROMPT.md | Homepage, services, about, contact, papers index |
| 3 | PHASE-3-PROMPT.md | White paper MDX engine, TOC, custom components |
| 4 | PHASE-4-PROMPT.md | Two flagship white papers from Colin Granola sessions |
| 4B | PHASE-4B-PROMPT.md | Third white paper — Agent Infrastructure Stack (Stripe/Alibaba/Coinbase/Qwen) |
| 5 | PHASE-5-PROMPT.md | SEO, Schema.org, A2A, Cloudflare deploy |

## GitHub
Push to: https://github.com/organized-ai/organized-ai-vip
