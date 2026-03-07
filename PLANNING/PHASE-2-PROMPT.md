# Phase 2: Core Pages — OrganizedAI.VIP

## Context
Read PLANNING/PHASE-1-PROMPT.md for design system context. Now we build the actual pages. Every page follows the selfimprovingcode.ai pattern: vertical sections with generous spacing, minimal copy, monospace headers.

## Tasks

### 1. Homepage (src/pages/index.astro)

**Hero Section:**
```
ORGANIZED AI
We deploy and manage AI agent infrastructure.
[Schedule a Consultation →]
```

**Challenge-Opportunity-Risk Framework** (3 columns, like selfimprovingcode.ai):
```
THE CHALLENGE              THE OPPORTUNITY           THE RISK
Enterprises want AI        OpenClaw + 40,000+        Without proper
agents but lack the        agent platforms are        infrastructure,
infrastructure to          production-ready.         agents become
run them securely          Edge compute makes        security liabilities
at scale.                  it affordable.            and compliance gaps.
```

**Service Overview Section** (2 service tiers):
```
SETUP & DEPLOY                    MANAGED INFRASTRUCTURE
Complete OpenClaw installation     Ongoing SRE, monitoring,
on your hardware. FrawdBot         ClickHouse caching,
security included. 6-12 hour       API gateway management,
turnaround from unbox to live.     SOC 2 compliance support.
```

**Social Proof / Stats:**
```
9+ DEPLOYMENTS | MAC MINI + MACBOOK PRO | SOC 2 ARCHITECTURE | FRAWDBOT BUNDLED
```

**CTA Footer:**
```
Ready to deploy?
[Schedule a Consultation →]     [Read Our Papers →]
```

### 2. Services Page (src/pages/services.astro)

Three ServiceCard tiers:

**Tier 1: Agent Setup**
- Complete OpenClaw installation on customer hardware
- Mac Mini / MacBook Pro configuration
- FrawdBot insider threat detection included
- N8N integration layer (200+ one-click integrations)
- SSH remote management — you never touch terminal
- Secure credential handling with disappearing API keys
- 6-12 hour turnaround

**Tier 2: Managed Infrastructure**
- Everything in Setup, plus:
- SRE dashboard (system state, utilization, fault management)
- ClickHouse caching layer for real-time dashboards
- LangFuse routing and API management
- PostHog observability integration
- API gateway with content switching and policy enforcement
- Prompt injection protection
- Monthly retainer model

**Tier 3: Enterprise**
- Everything in Managed, plus:
- SOC 2 compliance architecture
- Multi-agent orchestration (master + specialist agents)
- Permission system (department-level access control)
- Edge computing deployment across locations
- Tailscale tunnel management
- Hardware leasing facilitation
- Dedicated Slack channel support
- Custom agent packages per business outcome

### 3. About Page (src/pages/about.astro)

Structure:
- **Who We Are** — Organized AI is an infrastructure consultancy specializing in AI agent deployment. Partnership with Self-Improving Code (Colin McNamara) for enterprise-grade architecture.
- **Our Approach** — On-premise first. We deploy on your hardware, not ours. Edge compute > cloud. Your data stays yours.
- **The Stack** — Visual showing: OpenClaw → FrawdBot → ClickHouse → LangFuse → PostHog (use a simple text/ASCII diagram, not an image)
- **Events** — ClawCon at SXSW, Claw School training at Antler Austin, Weekly office hours

### 4. Contact Page (src/pages/contact.astro)

- Calendly embed for scheduling (use placeholder URL, configurable)
- Email: contact@organizedai.vip
- Simple contact form (name, email, company, message)
- Form submits to Cloudflare Pages function or external endpoint (placeholder)

### 5. Papers Index (src/pages/papers/index.astro)

- List all published white papers using content collection
- Each paper shows as PaperCard component
- Sort by date, newest first
- Header: "PAPERS" with subtitle "Engineering documentation from real deployments"

## Success Criteria
- [ ] All 5 pages render without errors
- [ ] Homepage follows the selfimprovingcode.ai vertical flow pattern
- [ ] Services page has 3 distinct tiers with clear feature lists
- [ ] About page shows the technology stack and partnership context
- [ ] Contact page has Calendly placeholder and form
- [ ] Papers index queries content collection correctly
- [ ] All pages are responsive
- [ ] Navigation works between all pages

## Completion
```bash
git add . && git commit -m "Phase 2 complete: All core pages built"
```
