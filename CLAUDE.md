# LocalNomad Website

## Branding
- **"LocalNomad"** — Always one word. Never "Local Nomad" or "Local Nomad Club"
- Plural: "LocalNomads". Domain: `localnomad.club`

## Commands
```bash
npm run dev      # localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```
Deploy: `git push origin main` → Vercel auto-deploys.

## Tech Stack
Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui (New York) + Supabase (auth) + next-intl (i18n: en, ja, zh-tw) + Mapbox GL

## Project Structure
```
app/                    # Routes — compose sections here
components/
  ui/                   # shadcn/ui primitives (DO NOT MODIFY)
  business/             # B2B sections (barrel export via index.ts)
  sections/             # Home page sections
  visa/                 # Visa feature components
hooks/                  # Custom hooks
lib/                    # Utilities, Supabase client, visa data loaders
data/visas/{lang}/      # Visa JSON data per locale
messages/{lang}.json    # i18n translation files
docs/                   # All .md files go here (audits, prompts, reports)
```

## Critical Rules
1. **Server Components by default** — Only add `"use client"` for hooks/browser APIs/interactivity
2. **Never modify `components/ui/`** — shadcn/ui managed
3. **Use `cn()` for conditional classes** — `import { cn } from "@/lib/utils"`
4. **Barrel exports** — Feature folders need `index.ts`
5. **Path alias** — Use `@/` for all imports
6. **Files**: `kebab-case.tsx` / **Components**: PascalCase / **Hooks**: `use-[name].ts`
7. **Docs** — All `.md` files go in `docs/`. Only `CLAUDE.md` stays in root

## Legal Bright Lines (IMPORTANT)
This is a visa **information** platform. Korean law (행정사법, 변호사법, 표시광고법) prohibits:
- ✅ CAN: Display published requirements, requirement-matching quizzes, date calculators, checklists, info products
- ❌ NEVER say: "you qualify", "you are eligible", "recommended visa", "official requirements", "guaranteed"
- ❌ NEVER: File applications for users, store HiKorea credentials, broker 행정사 for fee, auto-fill government forms
- Every quiz/tool must have a disclaimer: "Based on published requirements. Not legal advice."

## Taiwan Legal Bright Lines (IMPORTANT)

Taiwan's Immigration Act §56 explicitly regulates "consulting" AND "document drafting" as
licensed immigration business. Attorney Act §127: up to 1 year imprisonment for unlicensed
legal consulting. Penalties: NT$200K-1M per violation.

### What LocalNomad CAN do for Taiwan:
- Display published requirements from official sources (NIA, BOCA, MOL) with source links
- Offer visa comparison tables (factual, no ranking by "fit")
- Provide document checklists (user self-checks, client-side storage only)
- Show TECO authentication routing (which office handles which jurisdiction)
- Display generic visa transition paths (not personalized)
- Offer day counters (arithmetic only, no status determination)
- Host community forums (with disclaimers, no staff advice)

### What LocalNomad MUST NEVER do for Taiwan:
- Show match scores, percentages, probability, or match levels (strong/moderate/possible)
- Rank or sort visa types by "fit" or "suitability" for a user
- Say "you qualify", "you are eligible", "recommended visa", "you should apply"
- Auto-fill, generate, or pre-populate government application forms
- Scrape government websites (NIA, BOCA) for status tracking
- Store passport numbers, ARC numbers, or application IDs on server
- Offer AI chatbot that answers personalized visa eligibility questions
- Use the word "consulting" (諮詢) to describe any LocalNomad feature

### Taiwan Quiz Rules:
- NO scores, NO percentages, NO match levels
- Output format: side-by-side table of "Published Requirement" vs "Your Answer"
- Every quiz page must show the Taiwan quiz disclaimer
- All quiz data processed client-side only (no server transmission)
- Results page must include: "This is not an eligibility assessment"

### Taiwan Disclaimer Rules:
- Every Taiwan page must show the Taiwan-specific disclaimer (not the Korea one)
- Disclaimers must appear in both English AND Traditional Chinese (繁體中文)
- Taiwan disclaimer must explicitly state LocalNomad is not a licensed 移民業務機構
- Quiz results must show disclaimer ABOVE and BELOW results

### Taiwan Data Rules:
- All user-entered data for calculators/checklists: client-side only (localStorage)
- Never transmit personal immigration data to backend for Taiwan features
- No server-side storage of Taiwan user visa status, documents, or application data

## Agent Team (Agentic Development)
See `docs/AGENT-TEAM.md` for detailed role definitions, prompts, and workflow.

| Role | Focus | Agent Type |
|------|-------|------------|
| **CTO** | Architecture, code quality, security, tech debt | `general-purpose` (code read/write) |
| **CPO** | Product strategy, feature prioritization, user needs → product alignment | `general-purpose` (code read + audit) |
| **UXR** | Real user testing via browser, visual QA, interaction bugs | Puppeteer (headless) or mcp__Claude_in_Chrome (Cowork) |
| **Legal** | Korean law compliance (행정사법, 변호사법, 표시광고법) | `general-purpose` (code read + audit) |
| **Research** | Market research, competitor analysis, regulatory updates | Pre-step: web search outside Claude Code |

### Constraints
- Max **3-4 agents** per parallel batch (prevents SIGKILL from memory)
- UXR agent uses **Puppeteer** (headless, `npm install puppeteer`) in Claude Code CLI, or **mcp__Claude_in_Chrome** in Cowork mode
- Market research is a **separate pre-step** — save results to `docs/research-*.md` before running agent cycles
- All audit outputs go in `docs/`
