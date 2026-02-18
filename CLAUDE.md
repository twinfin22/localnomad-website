# LocalNomad Website

## Branding
- **"LocalNomad"** — Always one word. Never "Local Nomad" or "Local Nomad Club"
- Plural: "LocalNomads". Domain: `localnomad.club`
- **Brand Color**: Deep Teal Navy `#1B4965` — Primary brand color for logo, headings, CTAs
- **Logo**: Wordmark "LocalNomad" — "Local" in serif, "Nomad" in sans-serif, same weight
- **Favicon**: Half-circle compass / tilted diamond (brand color)
- See `docs/human/브랜드-가이드.md` for full design specs

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
docs/
  human/                # Gen님용 문서 (한글) — 리추얼, 거버넌스, 브랜드
  agent/                # 에이전트용 문서 (영어) — 프롬프트, 리포트, 레퍼런스
    prompts/            # AI 실행용 프롬프트
    reports/            # AI 생성 감사/분석 보고서
    reference/          # 참고 자료 (스펙, 리서치, 계획)
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

## Ownership Workflow (MANDATORY)

Claude MUST follow this workflow for every task. No exceptions.
Human docs: `docs/human/` | Agent docs: `docs/agent/`

### 1. Before ANY Code Change
- **Impact map first**: Show which files will be affected and how they connect, BEFORE writing code. Reference `docs/human/[WEEKLY] 아키텍처-지도.md` Section 8 (변경 영향도 맵) for risk levels
- **Options, not recommendations**: Present 2-3 approaches with trade-offs. Do NOT recommend. Let Gen decide
- **Explain WHY**: For each option, explain why this approach solves the problem. Gen will ask "왜?" — be ready
- **Success criteria from Gen**: Ask Gen to define what "done" looks like before starting. Do not self-define success criteria
- **Rollback criteria**: Agree on "if X happens, we revert everything" before starting
- **Tech debt gate**: Check `docs/human/[DAILY] 기술부채-현황.md` — if OPEN items ≥ 5, block new features. Resolve debt first

### 2. During Execution
- **Execution flow first**: Before implementing any feature, explain the runtime flow in ≤5 steps (server → browser → useEffect → user sees what)
- **Prompt review**: If creating an execution prompt, show Gen the file list + summary of changes per file. Wait for approval before executing
- **git diff check**: After changes, show `git diff --stat` so Gen can verify file count and change scope match expectations
- **No silent suppressions**: Never use suppressHydrationWarning, eslint-disable, or @ts-ignore without explicit Gen approval and logging to TECH-DEBT.md

### 3. After Execution
- **Gen verifies, not Claude**: Claude tells Gen WHERE to look and WHAT to check. Gen does the actual verification in browser
- **Tech debt log**: Append any temporary fixes, skipped tests, or known issues to `docs/human/[DAILY] 기술부채-현황.md`
- **Decision log**: Record what was decided and why in `docs/human/[WEEKLY] 의사결정-일지.md`. Include 📘 배경지식 footnotes for technical concepts
- **Architecture update**: If system structure changed, update `docs/human/[WEEKLY] 아키텍처-지도.md`

### 4. Session Start Auto-Check (MANDATORY)
Every new Cowork/Claude Code session, Claude MUST check BEFORE doing any work:
1. Read `docs/human/[DAILY] 기술부채-현황.md` → OPEN 항목 수 확인. 5개 이상이면 ⛔ 알림
2. Read `docs/human/[WEEKLY] 워크플로우-체크리스트.md` Phase 6 하단의 `last_review` 날짜 확인
3. 마지막 리뷰로부터 7일 이상 경과했으면 → "주간 리뷰가 밀려있습니다. 지금 진행할까요?" 알림
4. Gen이 승인하면 `.claude/shortcuts/weekly-review.md`의 프롬프트대로 실행

### 5. Weekly Review Rituals
매주 1회 (자동 트리거 또는 Gen이 `/weekly-review` 실행):
- **기술 부채 리뷰**: TECH-DEBT.md OPEN 항목 리뷰, 우선순위 재조정
- **Mental Model Check**: MENTAL-MODEL-CHECK.md에서 질문 1개 → Gen이 답변 → Claude 교정
- **Architecture Walkthrough**: 랜덤 페이지 경로 → Gen이 데이터 흐름 설명
- **Self-Demo**: `npm run build` + Gen이 주요 페이지 직접 확인
- **DECISION-LOG 패턴 리뷰**: 같은 실수 반복 패턴 확인
- Use `docs/human/[WEEKLY] 워크플로우-체크리스트.md` Phase 6 for review template

### 6. Learning Points
- When Gen asks a technical question, explain the concept clearly without jargon first
- When a decision requires technical context Gen hasn't encountered before, flag it: "이건 새로운 개념입니다: [concept]. 설명드릴까요?"
- Use footnotes (📘) in all documents for technical terms — Gen has PM experience but SQL-level coding background
- Use ASCII diagrams and visual flows whenever possible — prefer diagrams over paragraphs of explanation

## Agent Team (Agentic Development)
See `docs/agent/prompts/AGENT-TEAM.md` for detailed role definitions, prompts, and workflow.

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
- Market research is a **separate pre-step** — save results to `docs/agent/reference/research-*.md` before running agent cycles
- All audit outputs go in `docs/agent/reports/`
