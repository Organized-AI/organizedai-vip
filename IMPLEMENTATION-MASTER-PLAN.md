# OrganizedAI.VIP - Implementation Master Plan

**Created:** 2026-03-06
**Project Path:** `/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/organized-ai-vip`
**Runtime:** Astro + Cloudflare Pages
**Domain:** OrganizedAI.VIP
**Design Reference:** [selfimprovingcode.ai](https://selfimprovingcode.ai/) — minimalist, technical, enterprise engineering firm aesthetic

---

## Project Vision

OrganizedAI.VIP is a consulting-focused engineering firm website that positions Organized AI as a managed infrastructure partner for OpenClaw deployments. The site bundles FrawdBot (insider threat detection) as part of the standard offering and uses white papers derived from real engineering conversations to establish technical credibility.

### Ecosystem Context

| Brand | URL | Role |
|-------|-----|------|
| Self-Improving Code | selfimprovingcode.ai | Colin's parent engineering brand |
| FrawdBot | frawdbot.ai | Security product — bundled in OpenClaw setups |
| **Organized AI** | **organizedai.vip** | **Managed OpenClaw infrastructure consultancy** |

### Design Direction

- Minimalist, sparse layout (selfimprovingcode.ai aesthetic)
- Dark/neutral color palette with accent highlights
- Monospace/engineering typography
- Vertical flow sections with breathing room
- Schema.org structured data for professional services
- A2A agent.json for agent discovery (like Colin's site)

---

## Site Architecture

```
/                     → Hero + value proposition + CTA
/services             → Service tiers (Setup / Managed / Enterprise)
/papers               → White paper index
/papers/infrastructure-playbook  → White Paper #1
/papers/edge-compute-economics   → White Paper #2
/about                → Team, background, Colin partnership
/contact              → Calendly embed + form
/.well-known/agent.json → A2A agent discovery
```

---

## Implementation Phases Overview

| Phase | Name | Files | Dependencies |
|-------|------|-------|--------------|
| 0 | Project Setup | package.json, astro.config, wrangler | None |
| 1 | Design System | global.css, layouts, components | Phase 0 |
| 2 | Core Pages | index, services, about, contact | Phase 1 |
| 3 | White Paper Engine | content collections, MDX, paper layouts | Phase 1 |
| 4 | White Paper Content | 2 papers from Granola transcripts | Phase 3 |
| 4B | White Paper #3 | Agent Infrastructure Stack (Stripe/Alibaba/Coinbase/Qwen) | Phase 3 |
| 5 | Polish & Deploy | SEO, Schema.org, A2A, Cloudflare deploy | Phase 2-4B |

---

## Content Strategy

### White Paper #1: "The Infrastructure Playbook — Building Managed AI Agent Services"
**Source:** Colin meetings (Feb 27, Mar 3, Mar 5)
**Covers:** SRE dashboard architecture, ClickHouse caching layer, LangFuse routing, database-in-front-of-database pattern, SOC 2 compliance architecture, FrawdBot integration

### White Paper #2: "Edge Compute Economics — Why Customer Hardware Beats the Cloud"
**Source:** Colin meetings (Feb 27, Mar 3) + Abhinav enterprise discussion (Mar 3)
**Covers:** Distributed deployment on customer Macs, Tailscale tunnels, config management, cost comparison edge vs cloud, agent package pre-configuration, hardware leasing model

### White Paper #3: "The Agent Infrastructure Stack — How Four Open-Source Projects Define the Future of Managed AI Services"
**Source:** Stripe Minions blog, Alibaba OpenSandbox, QwenLM Qwen-Agent, Coinbase x402
**Covers:** The full agent infrastructure stack — runtime isolation (OpenSandbox), agent frameworks (Qwen-Agent), orchestration patterns (Stripe Minions), agent commerce (x402), security layer (FrawdBot), and why the managed infrastructure layer underneath (Organized AI) is the defensible business

### Open-Source Reference Projects

| Project | Source | Stack Layer |
|---------|--------|-------------|
| Stripe Minions | stripe.dev/blog | Orchestration — MCP Toolshed, one-shot agents, devbox sandboxing |
| OpenSandbox | github.com/alibaba/OpenSandbox | Runtime — Docker/K8s/gVisor/Kata/Firecracker isolation |
| Qwen-Agent | github.com/QwenLM/Qwen-Agent | Framework — MCP, function calling, RAG, code interpreter |
| x402 | github.com/coinbase/x402 | Commerce — HTTP 402 agent-to-agent payments |

---

## GitHub

**Repository:** https://github.com/organized-ai/organized-ai-vip
**Branch strategy:** main → deploy to Cloudflare Pages
