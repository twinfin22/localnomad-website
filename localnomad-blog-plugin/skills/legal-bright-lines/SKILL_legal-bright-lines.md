---
name: legal-bright-lines
description: Legal compliance checks and disclaimer management for LocalNomad blog — Korea (행정사법/변호사법), Taiwan (Immigration Act §56), Japan, and tax content.
---

# Legal Bright Lines

## Priority

Legal compliance is non-negotiable. Any violation = auto-fail in Quality Gate Layer 4.

## Country-Specific Rules

### Korea (행정사법, 변호사법, 표시광고법)

**CAN do**:
- Display published requirements (with source links)
- Requirement-matching quizzes (with disclaimer)
- Date calculators and checklists
- Information products
- Community discussion

**NEVER say**:
- "you qualify"
- "you are eligible"
- "recommended visa"
- "official requirements" (say "published requirements" instead)
- "guaranteed"

**NEVER do**:
- File applications on behalf of users
- Store HiKorea credentials
- Broker 행정사 (administrative agents)
- Auto-fill government forms

**Required disclaimer** (every quiz/tool):
> "Based on published requirements. Not legal advice."

### Taiwan (Immigration Act §56, Attorney Act §127)

**Penalties**: NT$200K-1M per violation. Up to 1 year imprisonment for unlicensed consulting.

**CAN do**:
- Published requirements with source links
- Comparison tables (factual, NO ranking by "fit")
- Document checklists (client-side only)
- TECO routing information
- Generic transition paths
- Day counters (arithmetic only)
- Community forums with disclaimers

**NEVER**:
- Match scores / percentages / probability
- Rank by "fit" or "suitability"
- Say "you qualify" / "eligible" / "recommended"
- Auto-fill government forms
- Scrape NIA/BOCA
- Store passport/ARC numbers server-side
- AI chatbot for eligibility questions
- Use "consulting" (諮詢) for any feature

**Taiwan Quiz Rules**:
- NO scores. Output = side-by-side "Published Requirement" vs "Your Answer"
- Client-side only (localStorage)
- Include: "This is not an eligibility assessment."

**Taiwan Disclaimers** (EVERY page with Taiwan content):
- Must be in BOTH English AND 繁體中文
- Must state LocalNomad is not a licensed 移民業務機構
- Quiz results: disclaimer ABOVE and BELOW results

**Taiwan Data** (app architecture — not enforced by this blog plugin, but noted for context):
- All user data client-side only (localStorage)
- Never transmit personal immigration data to backend
- *Note: These constraints apply to interactive tools on the website, not blog text generation.*

### Japan

**CAN do**:
- Published visa requirements with source links
- General comparison information
- Process timelines and document checklists

**NEVER**:
- Provide specific legal advice about individual cases
- Claim to be an immigration consultant (行政書士)

### Tax Content (All Countries)

세무사법 제2조: tax consultation = regulated.
대법원 2003다63968: disclaimers don't protect against gross negligence.

**3-layer disclaimer structure** (required for any tax-adjacent content):
1. **Top of content**: "This is general information, not tax advice."
2. **Inline** (where specific tax info appears): "Consult a licensed tax professional for your situation."
3. **Bottom of content**: "LocalNomad is not a tax advisory service. Laws change frequently."

## Disclaimer Templates

Read `references/disclaimer-templates.md` for copy-paste ready disclaimer blocks.

## Blog Content Scanning Rules

During Quality Gate Layer 4, scan for:

1. **Prohibited phrases** (all countries): "you qualify," "you are eligible," "recommended visa," "guaranteed," "official requirements"
2. **Taiwan-specific**: any scoring language, probability, ranking by fit, "consulting" (諮詢)
3. **Missing disclaimers**: Taiwan content without EN + 繁中 disclaimers
4. **Tax content**: missing 3-layer disclaimer
5. **Visa requirement claims**: must have Tier 1 source link

Any finding = FAIL → fix before publication.
