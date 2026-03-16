# Project Context

## Product
LocalNomad — B2C visa info + foreigner survival platform for NE Asia (Korea, Japan, Taiwan).
Phase: product-market fit exploration. Core question: "Visa dashboard or pivot to full foreigner survival?"

## Tools & Systems
| Tool | Used for | Internal name |
|------|----------|---------------|
| Vercel | Hosting, auto-deploy on push | - |
| Supabase | Auth, future DB | - |
| Mapbox GL | Neighborhood maps | - |
| next-intl | i18n (en, ja, zh-cn, zh-tw, vi) | - |
| shadcn/ui | UI primitives (New York style) | - |
| Claude Code | Agent development | - |
| Reddit scripts | Market research | "pain mining" |

## Deployment
`git push origin main` → Vercel auto-deploys. No staging environment yet.

## Content Pipeline
1. `weekly-blog-update` (auto, Sun midnight KST) → candidate list
2. Gen picks topics
3. `blog-write-and-publish` (manual) → 8-step: draft → fact-check → SEO → title hook → readability → AI de-detect → internal links → publish

## Key Competitors

Competitive landscape + positioning → see ~/.claude/memory/warm/knowledge/market-intel.md
