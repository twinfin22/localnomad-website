# Taiwan Visa Dashboard — Legal Compliance Guide

> **Document purpose**: Definitive legal compliance reference for all Taiwan visa features on LocalNomad.
> **Jurisdiction**: Republic of China (Taiwan) — Immigration Act, Attorney Regulation Act, PDPA.
> **Last updated**: 2026-02-13
> **Status**: ACTIVE — all developers MUST read before building Taiwan features.

---

## 1. Taiwan Regulatory Framework Summary

### 1.1 Immigration Act §56 — What Is "Immigration Business"?

Taiwan's Immigration Act (入出國及移民法) §56 defines **immigration business** (移民業務) as any of the following acts performed for compensation:

1. **Agency services** (代理申請): Filing visa, ARC, APRC, or naturalization applications on behalf of Taiwan residents.
2. **Overseas immigration services**: Handling emigration, overseas visas, or investment immigration for Taiwan nationals.
3. **Consulting AND document drafting** (諮詢及文件製作): Research, consulting, or drafting of documents related to the above.

**Critical detail**: Both "consulting" and "drafting" are explicitly enumerated as regulated activities. This means:
- An algorithm that recommends a specific visa type based on personal circumstances = **consulting** = regulated.
- A tool that auto-fills government application forms = **drafting** = regulated.
- Providing a score like "85% match" or "high probability of approval" = **consulting** = regulated.

**Penalties** (§76): NT$200,000 to NT$1,000,000 per violation, with escalation for repeat offenses.

**Licensing requirements for Immigration Service Organizations** (移民業務機構):
- Must be a company (個人事業者 excluded)
- Minimum paid-in capital: NT$4,000,000 (Type 1) to NT$6,000,000 (comprehensive)
- Minimum 3 full-time licensed immigration specialists
- Security bond: NT$1,500,000 to NT$2,500,000
- Physical office space required

### 1.2 Attorney Regulation Act §127 — "Legal Information" vs. "Legal Advice"

Taiwan's Attorney Act (律師法) §127 prohibits non-attorneys from performing legal consulting or drafting legal documents for profit.

**Penalty**: Up to **1 year imprisonment** for unlicensed legal consulting.

The line between legal information and legal advice in Taiwan:

| Legal Information (SAFE) | Legal Advice (PROHIBITED) |
|---|---|
| Publishing the text of regulations | Applying regulations to an individual's specific facts |
| Stating "Gold Card requires NT$160K/month income" | Stating "Based on your income, you qualify for Gold Card" |
| Listing document requirements from official sources | Recommending which documents to prioritize for a specific case |
| Explaining what APRC residency requirements are | Telling someone whether their travel history satisfies APRC requirements |

**Key difference from Korea**: In Korea, a single licensed 행정사 (individual) can be hired or partnered with to enable platform services. In Taiwan, the entire organization must be a licensed Immigration Service Organization with NT$4M+ capital and 3+ specialists. There is no lightweight partnership model.

### 1.3 PDPA (Personal Data Protection Act, 個人資料保護法)

Taiwan's PDPA governs the collection, processing, and use of personal data.

**Key constraints for LocalNomad**:
- **Passport numbers, visa application numbers, ARC numbers** = personal identifiable information (PII). Storing these requires explicit written consent, stated purpose limitation, and adequate security measures.
- **Cross-border data transfer**: Data can be transferred abroad but the transferor remains liable. Hosting in Singapore/Tokyo does not exempt compliance obligations.
- **Sensitive data**: Health records, criminal records, financial data have heightened protections.
- **Breach notification**: Mandatory notification to affected individuals and authorities.
- **Penalty**: Civil liability + administrative fines. Criminal penalties for intentional violations.

**Practical rule for LocalNomad**: Do NOT store passport numbers, ARC numbers, government application IDs, or financial documents (bank statements, tax returns) on our servers. All user-entered data for calculators/checklists should be client-side only (localStorage), never transmitted to backend.

### 1.4 How Taiwan Differs from Korea

| Dimension | Korea (행정사법/변호사법) | Taiwan (Immigration Act §56 / Attorney Act §127) |
|---|---|---|
| **License type** | Individual (행정사 license) | Corporate (Immigration Service Organization) |
| **Capital requirement** | None for individual 행정사 | NT$4M-6M minimum |
| **Staffing** | 1 licensed individual sufficient | 3+ full-time licensed specialists |
| **"Consulting" regulated?** | Yes, but narrower scope — info platforms have wider latitude | Yes, and EXPLICITLY enumerated in §56 |
| **"Drafting" regulated?** | Implicitly (행정사법) | EXPLICITLY enumerated in §56 |
| **Scoring/probability** | Permitted if framed as "alignment with published requirements" | PROHIBITED — constitutes consulting |
| **Penalty severity** | Administrative fines | Fines (NT$200K-1M) + up to 1 year imprisonment (Attorney Act) |
| **Platform partnership** | Hire 1 행정사 to cover operations | Must become a fully licensed organization |

**Bottom line**: Taiwan is structurally more restrictive than Korea. Features that are YELLOW (cautiously safe) in Korea may be RED (prohibited) in Taiwan.

---

## 2. Feature-by-Feature Legal Classification

### Classification Key
- **GREEN**: Safe to build. No licensing required. Standard disclaimers sufficient.
- **YELLOW**: Conditionally safe. Requires specific safeguards, language constraints, and enhanced disclaimers.
- **RED**: Prohibited without Immigration Service Organization license. Do NOT build.

---

### a) Situation-Based Landing Page (SituationGrid style)

**Classification: GREEN**

Presenting visa options organized by user situation ("I want to work remotely from Taiwan", "I'm a skilled professional") is information curation, not consulting. The page displays published visa categories without applying them to individual circumstances.

**Safeguards**:
- Use situation descriptions, not user-specific recommendations
- Frame as "Explore visa types" not "Find your visa"
- Include disclaimer on every landing page

---

### b) Visa Information Pages (Gold Card, DNV, ARC, etc.)

**Classification: GREEN**

Static or semi-static pages displaying published requirements, fees, processing times, and documents from official government sources. This is publishing/journalism, not consulting.

**Safeguards**:
- Cite official sources (NIA, BOCA, MOL) with links
- Include "last verified" dates
- Never use language suggesting the information is "official" — frame as "based on published requirements"

---

### c) Document Checklist (User Self-Checks Items)

**Classification: GREEN**

A checklist where the user manually checks off items they have prepared is a personal organization tool, not document drafting or consulting. The platform does not evaluate whether the user's documents are sufficient.

**Safeguards**:
- Checklist state stored client-side only (localStorage), never on server
- No server-side assessment of "readiness" or "completeness percentage" shown as advice
- Include disclaimer: "This checklist is for personal tracking. Document sufficiency is determined by immigration authorities."

---

### d) TECO Authentication Routing Guide

**Classification: GREEN**

Mapping which TECO office handles documents from which jurisdiction is publicly available factual information. This is a reference database, not consulting.

**Safeguards**:
- Source all routing data from official TECO/MOFA publications
- Include "verify with your local TECO before sending documents"
- Do NOT offer to prepare or pre-fill TECO authentication forms

---

### e) Visa Comparison Tool (Side-by-Side Published Requirements)

**Classification: GREEN**

Displaying published requirements for multiple visa types in a comparison table is information organization. The user draws their own conclusions.

**Safeguards**:
- No "best for you" or "recommended" labels
- No sorting by "fit" or "relevance" to user profile
- Pure factual comparison only (duration, fees, requirements, documents)
- Disclaimer: "Compare published requirements. This is not a recommendation."

---

### f) Visa Path Simulator (Transition Routes Between Visa Types)

**Classification: YELLOW**

Showing possible transition paths (e.g., DNV -> Gold Card -> APRC) based on published regulations is borderline. If it only shows what transitions are legally possible according to published rules, it is information. If it evaluates whether a specific user can make the transition, it becomes consulting.

**Safeguards**:
- Show ALL possible paths generically, not filtered to user profile
- Frame as "Published visa transition routes" not "Your visa pathway"
- No personalization based on user data
- Include: "Transition eligibility depends on individual circumstances. Consult a licensed immigration professional."
- Do NOT show probability or likelihood of successful transition

---

### g) Eligibility Quiz with SCORING (Korea-style: "strong match 85%")

**Classification: RED — PROHIBITED for Taiwan**

Providing numerical scores, match percentages, or probability assessments based on a user's personal data constitutes **consulting** under Immigration Act §56 and potentially **legal advice** under Attorney Act §127. This is the single most dangerous feature.

Even the Korea-style "strong match / moderate match / possible match" linguistic framing carries unacceptable risk in Taiwan because:
1. It applies regulatory criteria to individual facts (= consulting)
2. It implies an assessment of eligibility (= legal judgment)
3. Taiwan law explicitly covers "consulting" as a regulated activity

**DO NOT BUILD** any form of scoring, matching, probability, or eligibility assessment for Taiwan visa types.

---

### h) Eligibility Quiz with FACT MATCHING ONLY (No Scores)

**Classification: YELLOW**

A quiz that ONLY reflects the user's own answers back to them — showing which published requirements they self-report meeting and which they do not — may be defensible as a "self-assessment tool" rather than consulting, IF implemented with extreme care.

**Required safeguards**:
- **No score, no percentage, no match level** — not even "strong/moderate/possible"
- **No ranking** of visa types by suitability
- Output format: A checklist showing "You indicated: [X]. Published requirement: [Y]. Match: Yes/No" for each criterion
- The user fills in their own data; the system merely mirrors it against published text
- **No recommendation language** — never say "this visa may be suitable" or "consider applying for"
- Frame as: "Self-Assessment Against Published Requirements"
- Prominent disclaimer on results page (see Section 3)
- **No data stored server-side** — all processing client-side

**Implementation note**: This is the maximum allowable quiz feature for Taiwan. Even this carries residual risk. If in doubt, omit the quiz entirely for Taiwan and offer only the comparison tool (feature e).

---

### i) 183-Day Residency Counter (Tax Residency Tracker)

**Classification: YELLOW**

A day counter is a calendar calculation tool, not immigration consulting. However, because it relates to tax residency determination, care is needed.

**Safeguards**:
- Frame as "Day Counter" not "Tax Residency Determiner"
- Never state "you are/are not a tax resident" — say "you have been present in Taiwan for X days this calendar year"
- Include: "Tax residency depends on multiple factors beyond physical presence. Consult a licensed tax professional (會計師)."
- Client-side calculation only; do not store travel history on server

---

### j) Visa Run Calculator (Days Remaining + Re-entry Checklist)

**Classification: YELLOW**

Counting days remaining on a visa-free stay is arithmetic, not consulting. Providing a re-entry checklist of commonly required documents is information.

**Safeguards**:
- Never say "you must leave by [date]" — say "your visa-free entry period is [X] days from entry date per published regulations"
- Re-entry checklist framed as "commonly reported requirements" with source links
- Include warning: "Immigration officers have discretion at the border. This calculator does not guarantee entry."
- Do NOT suggest optimal timing for visa runs

---

### k) Document Auto-Fill / Form Generation

**Classification: RED — PROHIBITED**

Immigration Act §56 explicitly regulates "document drafting" (文件製作). Auto-filling government application forms constitutes drafting. This is prohibited without an Immigration Service Organization license.

**DO NOT BUILD** any form of:
- Auto-fill of NIA, BOCA, or MOL application forms
- PDF generation of government documents
- Pre-populated application templates with user data
- "Smart form" assistants that guide field-by-field entry

---

### l) Status Tracking via Government Site Scraping

**Classification: RED — PROHIBITED**

This carries triple legal exposure:
1. **Criminal Code §358-360**: Unauthorized access to computer systems. NIA/BOCA terms of service prohibit automated access; bypassing CAPTCHA = potential "hacking" charge.
2. **PDPA violation**: Storing passport numbers and application IDs for scraping purposes.
3. **Immigration Act**: If scraping is done as part of a "service" related to immigration applications, it may be classified as immigration business.

**DO NOT BUILD** any scraping of government immigration systems.

---

### m) Community Forum / User-Submitted Tips

**Classification: GREEN** (with safeguards)

User-to-user information exchange is not regulated. Users sharing their own experiences is protected speech.

**Safeguards**:
- Platform staff must NEVER provide direct visa advice in forums
- Auto-append disclaimer to every thread: "User-generated content. Not legal advice."
- Moderation policy: remove posts that could be construed as professional immigration advice
- Do NOT have staff pose as regular users to provide guidance
- Consider labeling all posts as "community experience, not verified"

---

### n) AI Chatbot Answering Visa Questions

**Classification: RED — PROHIBITED** (in consulting mode)
**Classification: YELLOW** (in FAQ/information-only mode)

An AI chatbot that answers personalized visa questions ("Can I get a Gold Card?", "Which visa should I apply for?") constitutes consulting under §56 and potentially legal advice under §127.

However, an FAQ-style chatbot that only retrieves and displays published information without personalized analysis may be defensible.

**If implemented (information-only mode)**:
- Chatbot may ONLY retrieve and quote published regulations
- Must cite specific article numbers for every response
- Must NEVER say "you should", "you can", "you qualify", "I recommend"
- Must include "This is automated information retrieval, not legal advice" in every response
- Must refuse to answer personalized eligibility questions
- Must redirect to licensed professionals for any individual assessment

**Recommendation**: Do NOT build an AI chatbot for Taiwan visa content at this stage. The risk-reward ratio is unfavorable.

---

### Summary Table

| Feature | Korea | Taiwan | Key Difference |
|---|---|---|---|
| a) Situation landing page | GREEN | GREEN | Same |
| b) Visa info pages | GREEN | GREEN | Same |
| c) Document checklist | GREEN | GREEN | Same |
| d) TECO routing guide | N/A | GREEN | Taiwan-specific |
| e) Visa comparison | GREEN | GREEN | Same |
| f) Visa path simulator | GREEN | YELLOW | Taiwan needs generic-only, no personalization |
| g) Quiz with SCORING | YELLOW (with framing) | **RED** | Korea allows linguistic framing; Taiwan prohibits |
| h) Quiz fact-matching only | GREEN | YELLOW | No scores, no ranking, extreme disclaimers |
| i) 183-day counter | YELLOW | YELLOW | Similar, different tax authority references |
| j) Visa run calculator | YELLOW | YELLOW | Similar |
| k) Document auto-fill | RED | **RED** | Prohibited in both jurisdictions |
| l) Government scraping | RED | **RED** | Prohibited in both jurisdictions |
| m) Community forum | GREEN | GREEN | Same safeguards |
| n) AI chatbot | YELLOW | **RED** | Taiwan explicitly regulates consulting |

---

## 3. Required Disclaimers

### 3.1 Taiwan-Specific Disclaimer Text

#### Primary Disclaimer (English)

> **Important Notice**
>
> This information is provided for general reference purposes only and does not constitute immigration consulting (移民諮詢), legal advice, or document preparation services. LocalNomad is not a licensed Immigration Service Organization (移民業務機構) under Taiwan's Immigration Act.
>
> All visa requirements, fees, and procedures shown are based on publicly available information from Taiwan government sources (NIA, BOCA, MOL). Requirements change frequently. Always verify current requirements directly with the relevant Taiwan government agency before taking any action.
>
> For personalized immigration guidance, consult a licensed Immigration Service Organization (移民業務機構) or attorney (律師) in Taiwan.

#### Primary Disclaimer (Traditional Chinese)

> **重要聲明**
>
> 本資訊僅供一般參考用途，不構成移民諮詢、法律建議或文件代辦服務。LocalNomad 並非依據中華民國《入出國及移民法》設立之合法移民業務機構。
>
> 本站所列之所有簽證要求、費用及程序，均依據台灣政府機關（移民署、外交部領事事務局、勞動部）公開發布之資訊彙整。相關規定可能隨時變更，採取任何行動前請務必直接向相關政府機關確認最新規定。
>
> 如需個人化的移民指導，請諮詢合法之移民業務機構或律師。

#### Quiz/Self-Assessment Disclaimer (English)

> **Self-Assessment Tool Disclaimer**
>
> This tool reflects your own answers against publicly available Taiwan visa requirements. It does NOT assess your eligibility, recommend visa types, or predict application outcomes. No score or probability is provided.
>
> This is not immigration consulting. For an eligibility assessment, consult a licensed Immigration Service Organization (移民業務機構) or attorney (律師) in Taiwan.

#### Quiz/Self-Assessment Disclaimer (Traditional Chinese)

> **自我評估工具聲明**
>
> 本工具僅將您自行輸入的資訊與台灣公開發布之簽證要求進行對照。本工具不評估您的資格、不推薦簽證類型、也不預測申請結果。不提供任何評分或機率。
>
> 本工具不構成移民諮詢服務。如需資格評估，請諮詢合法之移民業務機構或律師。

#### Day Counter / Calculator Disclaimer (English)

> This calculator performs date arithmetic for informational purposes only. It does not determine your legal status, tax residency, or visa validity. Immigration officers and tax authorities make these determinations based on your complete circumstances. This is not legal or tax advice. Consult a qualified professional (律師 or 會計師).

#### Day Counter / Calculator Disclaimer (Traditional Chinese)

> 本計算器僅進行日期計算，供參考用途。本工具不判定您的法律身分、稅務居民資格或簽證效力。上述事項由移民官員及稅務機關依據您的完整情況判定。本工具不構成法律或稅務建議。如需專業建議，請諮詢律師或會計師。

### 3.2 Disclaimer Placement Requirements

| Page Type | Disclaimer Required | Placement |
|---|---|---|
| Every Taiwan visa info page | Primary disclaimer (box variant) | Bottom of page, above footer |
| Taiwan visa comparison tool | Primary disclaimer (inline variant) | Below comparison table |
| Taiwan quiz/self-assessment | Quiz disclaimer | Above results AND below results |
| Taiwan quiz entry point | Quiz disclaimer (banner variant) | Top of quiz page, before first question |
| Taiwan day counter | Calculator disclaimer | Below calculator output |
| Taiwan visa run calculator | Calculator disclaimer | Below calculator output |
| Taiwan TECO routing guide | Primary disclaimer (inline variant) | Below routing results |
| Taiwan visa path display | Primary disclaimer (inline variant) | Below path visualization |
| Taiwan community forum | "User-generated content. Not legal advice." | Auto-appended to every thread |
| Taiwan landing/situation page | Primary disclaimer (inline variant) | Bottom of section |

### 3.3 Quiz Result Wording Guidelines

For Taiwan, quiz results must NEVER use:
- Score numbers or percentages
- Match levels ("strong match", "moderate match", etc.)
- Recommendation language ("recommended", "best fit", "suggested")
- Eligibility language ("eligible", "qualify", "meets requirements")

**Permitted output format**:

```
Published Requirement                  | Your Answer
---------------------------------------|------------------
Monthly income ≥ NT$160,000            | You indicated: Yes
Specialty in 1 of 11 fields            | You indicated: Digital
5+ years industry experience           | You indicated: Yes
No criminal record                     | You indicated: Yes
```

With footer text: "This reflects your self-reported information against published requirements. It is not an eligibility assessment. Consult a licensed professional for guidance."

### 3.4 Comparison with Current Korea Disclaimers

| Aspect | Korea (Current) | Taiwan (Required) |
|---|---|---|
| Mentions licensed professional | "행정사 or 변호사" | "移民業務機構 or 律師" |
| References government authority | "Korean Ministry of Justice" | "NIA, BOCA, MOL" |
| Explicitly denies being consulting | Implied | **Must be explicit**: "does not constitute immigration consulting (移民諮詢)" |
| Denies document preparation | Not stated | **Must state**: "does not constitute document preparation services" |
| States platform is not licensed | Not stated | **Must state**: "LocalNomad is not a licensed Immigration Service Organization" |
| Bilingual requirement | English + localized | English + **Traditional Chinese (mandatory)** |
| Quiz-specific disclaimer | Yes, light touch | Yes, **must deny scoring and eligibility assessment explicitly** |
| Frequency | Bottom of pages | **Every page, every tool output, every quiz step** |

**Key takeaway**: Taiwan disclaimers must be significantly stronger than Korea disclaimers. They must explicitly deny consulting, deny document preparation, state that LocalNomad is not licensed, and appear more frequently.

---

## 4. Safe Language Patterns

### 4.1 Language Table

| NEVER Say (Taiwan) | Say Instead |
|---|---|
| "You qualify for Gold Card" | "Your self-reported profile aligns with these published Gold Card requirements: ..." |
| "You are eligible" | "Based on your input, the following published requirements appear to be met" |
| "We recommend Gold Card" | "Gold Card is one of several visa types. Compare published requirements below." |
| "Recommended visa" | "Visa types to explore" |
| "Best visa for you" | "Published visa options for [situation]" |
| "Your match score is 85%" | (DO NOT SHOW ANY SCORE) |
| "Strong match" / "High probability" | (DO NOT USE MATCH LEVELS FOR TAIWAN) |
| "You should apply for..." | "Published application steps for [visa type] are..." |
| "Official requirements" | "Published requirements (as of [date], source: [link])" |
| "Guaranteed" / "100% success" | (NEVER USE) |
| "Our assessment is..." | "Published regulations state..." |
| "Based on your profile, you need..." | "Common documents for [visa type] include..." |
| "You can transition from DNV to Gold Card" | "Published regulations describe the following transition paths between visa types" |
| "Your 183 days are complete" | "Your counter shows [X] days present in Taiwan this year" |
| "You must leave by [date]" | "Published visa-free stay duration is [X] days from date of entry" |
| "We will prepare your documents" | (DO NOT OFFER — this is document drafting) |
| "Let us check your application status" | (DO NOT OFFER — this is government system access) |
| "Apply now" (linking to gov form with pre-filled data) | "Visit the official [agency] website to apply" (clean link, no pre-fill) |
| "Eligible" / "Not eligible" | "Meets published requirement" / "Does not appear to meet published requirement based on your input" |

### 4.2 Tone Guidelines

- **Passive voice preferred**: "The published requirements include..." rather than "You need..."
- **Attribution to source**: Always name the source agency and link to it
- **Conditional language**: "may", "based on published information", "subject to change"
- **User agency**: "You may wish to verify..." rather than "We recommend..."
- **No imperatives directed at the user's immigration decision**: Never "apply for X", always "learn more about X"

---

## 5. Implementation Rules for Developers

The following rules must be followed by all developers (including CTO agents) building Taiwan features. These are intended to be added to `CLAUDE.md` under a new section.

### Proposed CLAUDE.md Addition: "Taiwan Legal Bright Lines"

```markdown
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
```

---

## 6. Overall Feasibility Assessment

### OVERALL SCORE: YELLOW — Feasible with Significant Constraints

**Rationale**:

LocalNomad CAN expand to Taiwan as an **information platform** covering visa types, requirements, comparisons, checklists, TECO routing, and day counters. These GREEN features provide substantial user value and differentiate from fragmented community sources.

However, the most commercially valuable features from the Korea product — the eligibility quiz with match levels, and any form of automated document preparation — are **RED (prohibited)** in Taiwan without a full Immigration Service Organization license (NT$4M+ capital, 3 specialists, security bond).

**What makes Taiwan expansion viable despite restrictions**:
1. The information gap is even larger than Korea — users desperately need organized, accurate visa information
2. GREEN features (comparison, checklists, TECO routing, day counters) are high-value and differentiated
3. Community forum can drive organic traffic and engagement
4. The YELLOW quiz (fact-matching only) still provides utility without legal exposure

**What would make it unviable**:
- Attempting to replicate Korea's scoring quiz for Taiwan
- Building auto-fill or document generation features
- Offering AI-powered personalized visa advice

**Recommended approach**: Launch Taiwan with GREEN features only (info pages, comparison, checklists, TECO guide, day counter). Add YELLOW features (fact-matching quiz, path simulator) in a second phase after legal review of the specific implementation. Never build RED features without obtaining an Immigration Service Organization license.

---

## Appendix A: Legal Citations

| Law | Article | Relevance |
|---|---|---|
| Immigration Act (入出國及移民法) | §56 | Defines regulated immigration business |
| Immigration Act | §76 | Penalties for unlicensed immigration business |
| Immigration Act | §79 | Prohibition on advertising unlicensed services |
| Attorney Regulation Act (律師法) | §127 | Prohibition on unlicensed legal consulting |
| Criminal Code (刑法) | §358-360 | Unauthorized computer system access |
| Personal Data Protection Act (個人資料保護法) | §5, §6, §8, §19, §20 | Data collection, processing, cross-border transfer |
| Regulations Governing Immigration Service Organizations (移民業務機構管理規則) | Various | Licensing requirements |

## Appendix B: Comparison with Korea Legal Framework

| Feature | Korea Legal Status | Taiwan Legal Status | Action Required |
|---|---|---|---|
| Quiz scoring | YELLOW — permitted with linguistic framing ("strong match" not "85%") | RED — prohibited entirely | Remove scoring engine for TW visa types |
| Quiz match levels | YELLOW — "strong/moderate/possible" permitted | RED — no match levels of any kind | Use fact-matching table format only |
| Visa recommendation | YELLOW — "aligns with published requirements" | RED — any recommendation = consulting | Show comparison table, no recommendation |
| Document checklist | GREEN | GREEN | Reuse pattern, change disclaimer text |
| Day counter | YELLOW | YELLOW | Reuse pattern, change authority references |
| Auto-fill forms | RED | RED | Consistent — do not build |
| Government scraping | RED | RED | Consistent — do not build |
