# measure-summit-offer

Cloudflare Worker (Workers Assets, no script) serving the Measure Summit offer
at `https://offer.organizedai.vip/measure-summit`.

## Layout

```
measure-summit-offer/
├── wrangler.toml
└── public/
    ├── index.html                  # root → /measure-summit redirect
    └── measure-summit/
        └── index.html              # the offer page (~125 KB, embedded logo)
```

## Cloudflare context

- Account ID: `691fe25d377abac03627d6a88d3eeac9`
- Zone ID (organizedai.vip): `446a0461f84d37aba20abc5834480783`
- Worker name: `offer-organizedai`
- Custom domain: `offer.organizedai.vip`

## Deploy

```sh
cd measure-summit-offer
export CLOUDFLARE_API_TOKEN=...         # Edit Cloudflare Workers token
export CLOUDFLARE_ACCOUNT_ID=691fe25d377abac03627d6a88d3eeac9
npx wrangler deploy
```

Use a real API token (Cloudflare dashboard → My Profile → API Tokens → "Edit
Cloudflare Workers" template). OAuth tokens issued by `wrangler login` (`cufut_…`
prefix) expire in CI / headless environments.

## Verify

```sh
curl -I https://offer.organizedai.vip/measure-summit   # expect 200
curl -I https://offer.organizedai.vip/                 # expect redirect → /measure-summit
```

Browser checks:
- Logo banner renders
- Headline: "Stop researching. Recursively self-improve."
- Six-phase pipeline ASCII with L0/L1/L2 callouts
- Paper card → `organizedai.vip/papers/gtm-autoresearch.html`
- GitHub card → `github.com/Organized-AI/gtm-autoresearch`
- "Schedule Consultation" → `organizedai.vip/#`
- "Join the Community" → `chat.whatsapp.com/EyxwvBBSNUYKDlzZdEvynE?mode=gi_t`

## Local dev

```sh
npx wrangler dev
# in another terminal:
curl -s http://localhost:8787/measure-summit | head
```

## DNS-conflict fallback

If `wrangler deploy` errors on the custom domain, remove any stale
`offer.organizedai.vip` record from the zone and retry. If the custom domain
doesn't provision within ~2 minutes, deploy without the route block first and
add the custom domain via dashboard.

## Source HTML integrity

The offer HTML was copied byte-for-byte (`cp`, not heredoc) from the upload.
Expected invariants:

```sh
wc -c public/measure-summit/index.html    # 125257
grep -c '\$0\.30' public/measure-summit/index.html   # 2 (hero + comparison)
grep -c '/bin/sh' public/measure-summit/index.html   # 0
```
