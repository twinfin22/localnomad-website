# Session Notes

## 2026-03-08 Session (Market Research + Blog + Security)

### Decisions Made
→ see memory/decisions.md § 2026-03-08

### Work Completed
- 7 blog posts written, reviewed (steps 3-8), AI de-detected, schema validated — all PASS
- Blog titles updated per Gen's feedback: hook-driven, curiosity-gap style
- `.claude/settings.local.json` hardened with 85 deny rules
- `.git/hooks/pre-commit` secret scanner created
- 3 scheduled tasks: `weekly-blog-update` (Sun midnight KST), `weekly-gen-report` (Sun 3am KST), `blog-write-and-publish` (manual)
- `blog-write-and-publish` updated with 3 new steps: title hooking (5.5), internal link audit (6.5), AI de-detection (6.75)
- `docs/agent/prompts/security-hardening-prompt.md` — reusable cross-project prompt
- Reddit mining: 3 scripts created + full cross-analysis in `docs/agent/reference/reddit-mining-full-analysis.md`
- Context engineering restructure: CLAUDE.md 245→90 lines, split to `.claude/rules/` (5 files) + `.claude/memory/` (session notes)
- `analyze-reddit-pain-mining` scheduled task disabled (one-time, already ran)

### Open Questions
- 7 blog posts in `content/blog/` (draft:false) — Gen needs to `npm run build` locally to verify, then git push
- `validate-blogs.js` left in project root (VM couldn't delete) — Gen should `rm validate-blogs.js`
- Product direction: visa dashboard vs. full foreigner-survival platform — pending Gen's decision after research review
- Blog 2 (F-1-D guide) is 7,165 words — may want to split into 2 posts for better readability
- Blog 6 (Japan housing) is only 1,079 words — may need expansion

### Next Session Should
1. Run session start auto-check (tech debt + weekly review)
2. Check if Gen has reviewed 7 blog posts → if approved: `git add content/blog/ public/images/blog/ && git commit && git push`
3. Discuss product direction based on reddit mining findings
4. First `weekly-blog-update` auto-run is Mar 15 Sun midnight — verify it works

### Gen's Preferences Learned
- Hates generic/boring titles — wants hook, curiosity gap, power words
- Wants AI writing de-detection as standard step in all content
- Prefers to see options before any implementation — never single-answer
- Wants ≥1 clarifying question before Claude starts work
- Cron schedules should be in KST (user is in Korea)
- CLAUDE.md and all memory/notes always in English
- Values conciseness — "rules 중에 범용적인 건 필요 없어" — project-specific only
- Asks Claude to self-review its own output ("스크립트 검토해봐. 뭘 놓쳤지?")
- Challenges assumptions ("애초에 마이닝을 우리가 opinionated 하게 한 거 아냐?")
- Wants reusable prompts for cross-project tooling (security hardening prompt request)

---

## 2026-03-11 Session (Phase D Synthesis: Uncategorized Data Analysis)

### Decisions Made
→ see memory/decisions.md § 2026-03-11 (Phase D)

### Work Completed
- Read + analyzed 5,246 uncategorized records (510 non-appstore high-value + 4,736 appstore noise)
- N-gram analysis: identified "digital nomad" (n=49), "moving [country]" (n=50+), "trip report" (n=13) as structural patterns
- Classified signal vs. noise: 85% non-appstore = signal, 95% appstore = noise (only 50-75 records mention foreigner access issues)
- Wrote Phase D synthesis report (2,200+ lines): hidden themes, new categories, product opportunities
- Created exec summary for Gen: 4-page brief with validation questions + roadmap
- Created classifier additions guide: 5 new category regex patterns + integration notes + expected outcome

### Open Questions
- Gen's decision on "Foreigner Survival OS" positioning — does it resonate vs. "Visa Dashboard"?
- Product priority: Admin Checklist (fast, high WTP) vs. App Database (evergreen reference) vs. Belonging Framework (retention)?
- Audience pivot: continue focusing recent arrivals, or shift to long-tenure burnout cohort (5-10 years)?

### Next Session Should
1. Get Gen's decision on 4 strategic questions (positioning, product priority, audience, GTM)
2. Add 5 new categories to classifier regex (if approved)
3. Re-run classification on uncategorized records → expect 150-200 records reclassified
4. Start building Phase 1 product (likely Admin Checklist based on signal strength)

### Gen's Preferences Learned
- Wants brutal honesty about signal vs. noise (not apologetic about missing categories)
- Prefers specific examples over abstract percentages — wants to see exact Reddit post text
- Interested in strategic pivots if data supports them (positioning shift is data-driven, not hunch)
- Wants product roadmap with clear ROI ranking + effort estimates
- Expects synthesis to reveal entirely new opportunities, not just refine existing categories

---

## 2026-03-11 Session (Phase C: WTP & Business Opportunity Synthesis)

### Decisions Made
→ see memory/decisions.md § 2026-03-11 (Phase C)

### Work Completed
- Analyzed all 239 WTP records + 17,644 pain aggregate data
- Breakdown: 42.7% active buyer signals, 49.4% solution-seeking, 5.9% aspirational
- Multi-category analysis: 41% of WTP spans 2+ pain categories (platform cross-sell signal)
- Segment analysis: E-6 visa (14.3% WTP ratio), Researchers (16.7%), Students (3.3%) are ideal first customers
- Competitive gap analysis: 19 "I paid but terrible" signals; 125 solution-seeking gaps; 15 admin guidance requests
- Created comprehensive 8-section Phase C Synthesis report (synthesis-phase-c.md)
- Priority ranking: Tier 1 (TAX, BANKING), Tier 2 (COST_OF_LIVING, COMMUNITY), Tier 3 (HOUSING, DISCRIMINATION = don't build)
- TAM estimates: Year 1 realistic = $300K-750K (Tier 1), Year 1 upside = $1.2M-3.95M (Tiers 1+2)

### Open Questions
- Pricing validation: WTP shows intention but not price sensitivity — recommend interview research on 5-10 high-WTP users
- Japan/Taiwan confidence: Only 71 + 19 WTP vs 136 Korea — tactical vs. strategic focus?
- B2B GTM: Identified relocation agencies + employer HR as channels, but requires separate research/pilots

### Next Session Should
1. Gen review synthesis-phase-c.md — does TAX #1 ranking make sense? Does banking validate?
2. Identify decision: Focus on tax brokerage MVP first, or test multiple opportunities in parallel?
3. If TAX approved: start B2B research phase (5-10 tax firm interviews, Korea pilot design)
4. Create product requirement document for tax refund verification tool + broker interface

### Gen's Preferences Learned
- Brutal > polite: expects 1.35% to be called "LOW" and weak signals to be rejected entirely
- Data-driven decisions: WTP ratio outweighs pain volume for prioritization
- Segment specificity: E-6 artists + researchers + students more interesting than "digital nomads"
- Regulatory awareness: Phase C calls out Taiwan legal bright lines for tax consulting
- Dislikes dashboards: content-only tools score 0% monetization; service-first models win

---

## 2026-03-16 Session (Instagram Carousel Pipeline Design)

### Decisions Made
- Instagram carousel from blog posts: Contentdrips API (free tier, 10 calls) for Phase 1, HTML→PNG for Phase 2
- Architecture: add to existing localnomad-blog-plugin as /instagram command + instagram-repurpose skill
- Memory: 2-tier (distilled + raw-log), compaction every ~10 entries
- Performance data: manual input Phase 1, Instagram Graph API Phase 2
- Content: English only, carousel/card news format, 7-10 slides

### Incident: Unauthorized File Creation
**What happened**: Gen asked "스펙 문서 줘봐" (show me the spec). Claude created 7 files + modified plugin.json instead of presenting text for review. All changes reverted.

**Root cause**: Conflated "줘봐" (show me) with "만들어" (create). Ignored user preference "strategic thought partner, not an executor."

**Prevention rules (PERMANENT)**:
1. "줘봐" / "보여줘" / "초안" → present as text in conversation. NEVER create files.
2. "만들어" / "생성해" / "작성해" → confirm scope before creating files ("파일로 만들까요?")
3. Ambiguous → ask, don't assume.
4. Multiple files touching codebase = irreversible change → ALWAYS get explicit approval first.
5. After presenting a "만들까요?" question, Gen's next message is a SEPARATE request unless it explicitly says "응/네/만들어."

### Gen's Preferences Learned
- "줘봐" ≠ "만들어" — showing ≠ creating
- Wants to review specs as text before anything hits the file system
- Strategic thought partner role is non-negotiable — present options, don't execute
- Profile rules apply at all times: tradeoffs, confidence levels, blind spots, irreversibility flags

### Open Questions
- Contentdrips API key: Gen needs to sign up + provide
- Template IDs: Gen needs to create 3 templates (Type A/B/C) in Contentdrips editor
- Instagram Business/Creator account for future Graph API integration

### Next Session Should
1. Review instagram command spec (presented as text this session)
2. If approved → Gen says "만들어" → then create files
3. Gen signs up for Contentdrips + sets up templates
4. First test run with japan-arrival-checklist-2026
