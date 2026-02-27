# Phase 2 — Taiwan Visa JSON Creation Prompt

## Context

You are creating JSON data files for 2 Taiwan visa types: **Gold Card (TGC)** and **Digital Nomad Visa (DNV)**.

### Files to create:
```
data/visas/en/gold-card.json     (English — Gold Card)
data/visas/en/dnv.json           (English — DNV)
```

### References (READ ALL BEFORE STARTING):
1. **Template**: `data/visas/en/f-1-d.json` — Follow this structure exactly for field format
2. **Types**: `lib/types/visa.ts` — Must conform to `TaiwanVisa` interface
3. **Research data**: `docs/agent/reference/research-taiwan-visas-tgc-dnv.md` — Primary data source
4. **Glossary**: `i18n/Visa i18n Glossary.txt` — Use consistent terminology

---

## TaiwanVisa Interface (key differences from KoreaVisa)

```typescript
interface TaiwanVisa extends VisaBase {
  country: 'tw';                              // Always 'tw'
  agencySteps?: AgencyStep[];                 // Multi-agency process steps
  tecoInfo?: TECOAuthenticationInfo;          // TECO auth info (for overseas applicants)
  goldCardFields?: {                          // TGC ONLY
    categories: string[];                     // 12 industry fields
    openWorkPermit: boolean;
    taxBenefit?: string;
  };
  goldCardComparison?: {                      // TGC ONLY — comparison with DNV
    disclaimer: string;
    comparisonTable: { criterion: string; dnv: string; goldCard: string }[];
  };
  tecoRouting?: {                             // TECO office routing info
    description: string;
    notes: string;
    officialLink: { label: string; url: string };
    exampleRegions: { region: string; office: string }[];
  };
}
```

---

## IMPORTANT: Taiwan Legal Compliance (from CLAUDE.md)

Every page/data must follow these rules:
- ❌ NO match scores, percentages, probability, or match levels
- ❌ NO "you qualify", "you are eligible", "recommended visa"
- ❌ NO personalized eligibility assessment
- ✅ Display published requirements with source links
- ✅ Side-by-side "Published Requirement" vs "Your Answer" format only
- ✅ Disclaimers in both English AND Traditional Chinese (繁體中文)

### Required Disclaimers (include in `warnings` array):
```
"This information is based on publicly available requirements from official Taiwan government sources. LocalNomad is not a licensed immigration services agency (移民業務機構). This is not an eligibility assessment or legal advice. 本資訊僅依據台灣政府公開資料整理，LocalNomad並非合法移民業務機構。本內容不構成資格評估或法律建議。"
```

---

## File 1: gold-card.json (Taiwan Employment Gold Card)

### Key Fields:

```json
{
  "type": "gold-card",
  "country": "tw",
  "name": "Taiwan Employment Gold Card — Complete 2026 Guide",
  "shortName": "Gold Card",
  "category": "gold-card",
  "tagline": "4-in-1 work, reside, and thrive in Taiwan",
  "keyRequirement": "Qualifying expertise in one of 12 professional fields OR monthly salary ≥ NT$160,000"
}
```

### targetAudience (4 items):
- Senior professionals in tech, finance, education, biotech, and other qualifying fields
- Entrepreneurs and startup founders seeking open work permission
- High-income professionals (monthly salary ≥ NT$160,000 / ~USD $5,000)
- International talent seeking long-term Taiwan residency with tax benefits

### eligibility (6 items):
1. **professional-field** — Expertise in one of 12 designated professional fields (Science & Technology, Digital, Finance, Education, Architecture, Culture & Arts, Sports, Biotechnology, Economy, National Defense, Law, Ancestor Rites). Required: true
2. **field-qualification** — Meet specific qualification criteria for chosen field (e.g., salary ≥ NT$160,000/month, 8+ years experience, PhD from top-500 university, international awards, etc.). Required: true
3. **valid-passport** — Valid passport with at least 6 months remaining. Required: true
4. **no-criminal-record** — Clean criminal background (NIA background check during processing). Required: true
5. **no-ineligible-status** — NOT currently holding blue-collar work visa, APEC Business Travel Card, Chinese language study visa, or Working Holiday visa in Taiwan (cannot convert from these statuses). Required: true
6. **document-attestation** — Documents from designated countries (Afghanistan, Philippines, Vietnam, Indonesia, China, etc.) must have ROC diplomatic post attestation. Required: true (conditional)

### duration:
```json
{
  "initial": "1, 2, or 3 years (applicant chooses at application)",
  "extension": "Renewable before expiration (apply within 4 months)",
  "maxTotal": "Renewable indefinitely; APRC eligible after 1-3 years"
}
```

### fees:
```json
{
  "application": "NT$3,700 – NT$9,790 (varies by nationality, location, and duration)",
  "extension": "NT$1,500 – NT$3,500 (ARC renewal)",
  "notes": "US passport holders applying overseas pay higher fees (NT$7,790-9,790). Non-US and domestic applicants: NT$3,700-5,700. HK/Macau: flat NT$3,100. Payment via JCB/VISA/MasterCard only (no AMEX/UnionPay). Non-refundable."
}
```

### incomeRequirement:
```json
{
  "amount": "160,000",
  "currency": "NTD",
  "period": "monthly",
  "notes": "NT$160,000/month (~USD $5,000) is the salary-track threshold across most fields. Other qualification tracks (experience, PhD, awards) may not require income proof. Applicants may choose any 1 year within the past 3 years for tax return evidence."
}
```

### documents (10+ items):
Include all required documents from research:
1. **passport** — Valid passport, 6+ months validity, color copy
2. **photo** — 2-inch passport photo, white background, within 6 months
3. **field-qualification-docs** — Field-specific qualification evidence (employment certificates with full name/company/title/period/seal, NOT offer letters)
4. **tax-certificate** — Tax documents: W-2 (US), P60 (UK), T4 (Canada), PAYG (Australia), PIT-11 (Poland), etc. OR employer salary certificate if tax docs unavailable
5. **degree-certificate** — Academic degree certificates (if applicable for chosen track)
6. **employment-certificates** — Employment certificates with: full name, company name, title, employment period, official seal/signature
7. **patents-publications** — Patents, publications, awards (for research/tech tracks)
8. **certified-translations** — Certified translations for non-Chinese/non-English documents
9. **attestation-docs** — ROC diplomatic post attestation for documents from designated countries
10. **professional-certifications** — CFA, CFP, FRM, etc. (for finance track)

Add tips for each: especially the strict employment certificate requirements (no offer letters).

### applicationSteps (6 steps):
1. Choose Industry Field — Select 1 of 12 fields and 1 sub-track. Research which field best matches your qualifications.
2. Create Online Account — Register at Foreign Professionals Online Application Platform. Name must match passport exactly. No Mainland China email services.
3. Prepare & Upload Documents — Gather all field-specific docs, translations, attestations. Upload via platform.
4. Multi-Agency Review — 3-stage review: (1) Relevant ministry qualification review (1-2 weeks), (2) MOFA passport inspection for overseas applicants (1 week), (3) NIA final background check (1-2 weeks).
5. Pay Fees & Receive Approval — Pay via credit card (JCB/VISA/MasterCard). Overseas: print Resident Authorization Certificate in color.
6. Collect Physical Card — Overseas: enter Taiwan with certificate, visit NIA service center within 30 days. Domestic: card mailed or pickup at NIA.

### processingTime:
```json
{
  "typical": "30-60 business days",
  "notes": "Assumes complete documentation. Document supplement: 3 days (domestic), up to 6 months (overseas). Failure to supplement = rejection without refund."
}
```

### workPermission:
```json
{
  "allowed": true,
  "restrictions": [],
  "notes": "Open Work Permit included. No employer tie — free to freelance, multi-employer, change jobs, start businesses. Covers all legal employment in Taiwan."
}
```

### goldCardFields:
```json
{
  "categories": [
    "Science & Technology",
    "Digital",
    "Finance",
    "Education",
    "Architecture",
    "Culture and Arts",
    "Sports",
    "Biotechnology",
    "Economy",
    "National Defense",
    "Law",
    "Practitioners of Ancestor Rites"
  ],
  "openWorkPermit": true,
  "taxBenefit": "50% income tax exemption on annual salary exceeding NT$3,000,000 for first 5 years (conditions apply: first-time employment in Taiwan, 183+ days/year residency, no Taiwan household registration in prior 5 years)"
}
```

### goldCardComparison:
```json
{
  "disclaimer": "This comparison shows published requirements only. It is not a recommendation or eligibility assessment. 本比較表僅列出公開要件，非推薦或資格評估。",
  "comparisonTable": [
    { "criterion": "Work in Taiwan", "dnv": "Not allowed — overseas clients only", "goldCard": "Open work permit — any employer" },
    { "criterion": "Duration", "dnv": "6 months, extendable to 2 years", "goldCard": "1-3 years, renewable" },
    { "criterion": "Health Insurance", "dnv": "Private insurance required (no NHI)", "goldCard": "NHI access from Day 1" },
    { "criterion": "Family", "dnv": "No dependents", "goldCard": "Spouse, children, parents/grandparents" },
    { "criterion": "Tax Benefit", "dnv": "None", "goldCard": "50% exemption on income >NT$3M (5 years)" },
    { "criterion": "Permanent Residency", "dnv": "No path", "goldCard": "APRC after 1-3 years" },
    { "criterion": "Income Requirement", "dnv": "USD $20K-40K/year", "goldCard": "NT$160K/month (salary track)" },
    { "criterion": "Processing Time", "dnv": "5-15 working days", "goldCard": "30-60 business days" }
  ]
}
```

### agencySteps (3 steps):
```json
[
  {
    "order": 1,
    "agency": "other",
    "agencyFullName": "Relevant Ministry (e.g., MOST, MOE, MOEA)",
    "action": "Qualification Review",
    "description": "The ministry governing your chosen industry field reviews your professional qualifications and supporting documents.",
    "processingDays": 14,
    "tips": ["Different ministries handle different fields — Science goes to MOST, Education to MOE, etc."]
  },
  {
    "order": 2,
    "agency": "MOFA",
    "agencyFullName": "Ministry of Foreign Affairs (Overseas Representative Office)",
    "action": "Passport Inspection",
    "description": "For overseas applicants only: the ROC representative office inspects your original passport.",
    "processingDays": 7,
    "tips": ["Only for overseas applicants. Domestic applicants skip this step."],
    "dependsOn": 1
  },
  {
    "order": 3,
    "agency": "NIA",
    "agencyFullName": "National Immigration Agency (內政部移民署)",
    "action": "Final Review & Card Issuance",
    "description": "NIA conducts background check, finalizes approval, and prints the physical Gold Card.",
    "url": "https://www.immigration.gov.tw",
    "processingDays": 14,
    "tips": ["Overseas: enter Taiwan with printed Resident Authorization Certificate, collect card at NIA within 30 days"],
    "dependsOn": 2
  }
]
```

### tecoRouting:
```json
{
  "description": "Overseas applicants submit documents through their jurisdictional TECO (Taipei Economic and Cultural Office) or ROC representative office.",
  "notes": "TECO handles passport inspection for overseas applicants. Documents from designated countries require TECO attestation before upload.",
  "officialLink": { "label": "TECO Office Locator", "url": "https://www.mofa.gov.tw/en/OverseasOfficeLink.aspx" },
  "exampleRegions": [
    { "region": "US East Coast", "office": "TECO Washington D.C. / New York / Boston / Atlanta" },
    { "region": "US West Coast", "office": "TECO Los Angeles / San Francisco / Seattle" },
    { "region": "Japan", "office": "Taipei Economic and Cultural Representative Office in Japan (Tokyo)" },
    { "region": "Southeast Asia", "office": "Various — Manila, Hanoi, Bangkok, Singapore, Jakarta" },
    { "region": "Europe", "office": "TECO London / Berlin / Paris / Amsterdam" }
  ]
}
```

### faqs (12 items):
Write 12 FAQs covering:
1. What is the 4-in-1 mechanism?
2. Do I need an employer to sponsor my Gold Card?
3. What are the 12 industry fields?
4. How does the salary track work (NT$160,000)?
5. Can I switch fields after getting the Gold Card?
6. How does the 50% tax exemption work?
7. Can my family join me? (spouse, children, parents)
8. How long does the APRC fast-track take?
9. What happens if my application is rejected?
10. Can I renew my Gold Card?
11. What documents are strictly required for employment certificates? (no offer letters)
12. Can I convert from a Working Holiday or language study visa?

### communityTips (5 items):
Source from research file community tips section. Use source: "community" and verified: true.

### renewal:
```json
{
  "eligible": true,
  "maxExtensions": null,
  "maxTotalStay": "Renewable indefinitely; APRC eligible after 1-3 years",
  "requirements": [
    "Still meet original field qualification criteria",
    "No criminal record during current Gold Card period",
    "Apply within 4 months before expiration"
  ],
  "documents": [
    "Current passport (6+ months validity)",
    "Recent passport photo (within 6 months)",
    "Current Gold Card",
    "Updated qualification documents (if field/category changed)"
  ],
  "applyBeforeDays": 120,
  "processingTime": "2-4 weeks",
  "fees": "NT$1,500-3,500 depending on duration"
}
```

### pathsTo (3 items):
- dnv → gold-card: For DNV holders who want Taiwan work permission
- work-arc → gold-card: For existing ARC holders upgrading
- visa-exempt entry → gold-card: Apply while in Taiwan visa-exempt

### pathsFrom (2 items):
- gold-card → aprc: Permanent residency (1-3 years)
- gold-card → seeking-employment: Job-seeking ARC (if unable to work, 3 months before expiry)

### warnings (5 items):
Include Taiwan legal disclaimer + key restrictions:
1. Full Taiwan bilingual disclaimer (EN + 繁體中文)
2. Cannot convert from: blue-collar, APEC, Working Holiday, language study visas
3. Architecture field uses AND logic (all conditions must be met simultaneously)
4. Application fees are non-refundable
5. Employment certificates must have: full name, company, title, period, seal — offer letters are NOT accepted

### officialLinks (4 items):
- Gold Card Official Portal: https://goldcard.nat.gov.tw/
- Application Platform: https://coa.immigration.gov.tw/coa-frontend/four-in-one/entry/golden-card
- NIA: https://www.immigration.gov.tw
- Gold Card Community (unofficial): https://taiwangoldcard.com/

---

## File 2: dnv.json (Taiwan Digital Nomad Visa)

### Key Fields:

```json
{
  "type": "dnv",
  "country": "tw",
  "name": "Taiwan Digital Nomad Visa (DNV) — Complete 2026 Guide",
  "shortName": "DNV",
  "category": "digital-nomad",
  "tagline": "Work remotely, live in Taiwan",
  "keyRequirement": "Remote work for overseas employer/clients + income ≥ USD $20K-40K/year (age-dependent)"
}
```

### targetAudience (4 items):
- Remote employees of companies headquartered outside Taiwan
- Freelancers and independent contractors with global clients
- Young digital professionals (20-29) seeking affordable Asia base
- Experienced remote workers (30+) wanting Taiwan's infrastructure and safety

### eligibility (6 items):
1. **visa-exempt-nationality** — Passport from a visa-exempt country. 90-day visa-free (64 countries): Andorra, Australia, Austria, Belgium, Bulgaria, Canada, Chile, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Eswatini, Finland, France, Germany, Greece, Guatemala, Haiti, Honduras, Hungary, Iceland, Ireland, Israel, Italy, Japan, Korea, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Marshall Islands, Monaco, Netherlands, New Zealand, Nicaragua, North Macedonia, Norway, Palau, Paraguay, Poland, Portugal, Romania, San Marino, Slovakia, Slovenia, Spain, Sweden, Switzerland, Tuvalu, UK, US, Vatican City. Plus 14-day trial: Thailand, Brunei, Philippines. Required: true
2. **remote-work-overseas** — Currently employed by overseas employer OR operating independent freelance business with global clients. Required: true
3. **no-taiwan-work** — ⚠️ MUST NOT work for any Taiwan-based employer or company under any circumstances. Required: true
4. **income-requirement** — Age 20-29: ≥ USD $20,000/year. Age 30+: ≥ USD $40,000/year. Previous DNV holders from other countries: income waived. Required: true
5. **bank-balance** — Past 6 months average monthly balance ≥ USD $10,000. Required: true
6. **health-insurance** — Comprehensive international health + hospitalization insurance covering entire planned stay. DNV holders are EXCLUDED from Taiwan NHI. Required: true

### duration:
```json
{
  "initial": "6 months",
  "extension": "6-month increments at NIA service center",
  "maxTotal": "2 years (updated January 8, 2026)"
}
```

### fees:
```json
{
  "application": "NT$1,600 (single entry) / NT$3,200 (multiple entry) — domestic. USD $50/$100 — overseas.",
  "extension": "Varies by NIA schedule",
  "notes": "US citizens: NT$7,090 (domestic) or USD $185 (overseas) due to reciprocity surcharge. Non-refundable regardless of outcome."
}
```

### incomeRequirement:
```json
{
  "amount": "20,000-40,000",
  "currency": "USD",
  "period": "annual",
  "notes": "Age-tiered: 20-29 years = USD $20,000/year minimum. 30+ years = USD $40,000/year minimum. Holders of DNV from another country = income requirement waived. Must meet for at least 1 of previous 2 years. Separate bank balance requirement: 6-month average ≥ USD $10,000."
}
```

### documents (8 items):
1. **application-form** — Online form from visawebapp.boca.gov.tw, printed and signed
2. **passport** — 6+ months validity, blank visa pages, color copy. NO temporary/emergency passports.
3. **photos** — 2 pieces, 45×35mm, white background, within 6 months
4. **resume-portfolio** — Detailed CV/resume or professional portfolio
5. **employment-contract** — Employment contract with overseas employer (employees) OR active project contracts (freelancers)
6. **activity-plan** — "Description of Intended Activities" form — detailed work plan during Taiwan stay
7. **income-proof** — Tax certificates (W-2/P60/T4/PAYG) OR employer salary certificate proving age-tier income
8. **bank-statement** — Bank statement showing 6-month average balance ≥ USD $10,000
9. **insurance-certificate** — International health + hospitalization insurance covering full planned stay period
10. **previous-dnv** — Previous country's DNV proof (if claiming income waiver)

### applicationSteps (6 steps):
1. Check Eligibility — Verify visa-exempt nationality, age-tier income, bank balance, overseas employment
2. Prepare Documents — Gather all required docs. Note: no temporary/emergency passports. Start bank balance maintenance 6 months in advance.
3. Complete Online Form — Fill application at visawebapp.boca.gov.tw, print and sign
4. Submit Application — Overseas: ROC diplomatic mission (TECO). Domestic: BOCA office (Taipei HQ or regional branches). Domestic must apply 10+ business days before current stay expires.
5. NDC + BOCA Review — NDC reviews eligibility, BOCA processes visa issuance
6. Receive Visa & Enter Taiwan — Collect visa, enter Taiwan within validity period

### processingTime:
```json
{
  "typical": "5-15 working days",
  "notes": "Faster than Gold Card. Domestic applicants: apply 10+ business days before current stay expires to avoid overstay risk."
}
```

### workPermission:
```json
{
  "allowed": true,
  "restrictions": [
    "ONLY for overseas employer/clients — absolutely NO Taiwan-based work",
    "Cannot work for any Taiwan-registered company or entity",
    "Cannot provide any form of labor or service to Taiwan-based businesses",
    "To work for Taiwan employer, must obtain separate Work Permit or Gold Card"
  ],
  "notes": "This is the most critical legal restriction. Violation may result in visa revocation and deportation."
}
```

### agencySteps (2 steps):
```json
[
  {
    "order": 1,
    "agency": "other",
    "agencyFullName": "National Development Council (NDC, 國家發展委員會)",
    "action": "Eligibility Review",
    "description": "NDC reviews your income, employment status, and remote work credentials.",
    "processingDays": 10,
    "tips": ["NDC focuses on verifying your remote work is genuinely overseas-based"]
  },
  {
    "order": 2,
    "agency": "BOCA",
    "agencyFullName": "Bureau of Consular Affairs (外交部領事事務局)",
    "action": "Visa Issuance",
    "description": "BOCA processes and issues the Digital Nomad Visa upon NDC approval.",
    "url": "https://www.boca.gov.tw",
    "processingDays": 5,
    "tips": ["Overseas: issued through local TECO/representative office", "Domestic: collect at BOCA Taipei or regional office"],
    "dependsOn": 1
  }
]
```

### faqs (12 items):
Write 12 FAQs covering:
1. Can I work for a Taiwan company on DNV?
2. What happens if I'm caught working for a Taiwan employer?
3. How does the age-based income requirement work?
4. What if I held a DNV from another country?
5. Can I extend my DNV beyond 6 months?
6. What's the maximum stay? (2 years as of Jan 2026)
7. Am I eligible for Taiwan's NHI?
8. What are the tax implications for 90/183 day thresholds?
9. Can I bring my family?
10. What happens if I overstay while my application is processing?
11. Can I switch from DNV to Gold Card?
12. What's the bank balance requirement?

### communityTips (5 items):
Source from research file. Use source: "community" and verified: true.

### renewal:
```json
{
  "eligible": true,
  "maxExtensions": 3,
  "maxTotalStay": "2 years (updated January 8, 2026)",
  "requirements": [
    "Valid DNV status",
    "Proof of residential address in Taiwan",
    "Continued overseas employment/freelance activity"
  ],
  "documents": [
    "Current passport",
    "Proof of residential address in Taiwan",
    "Updated insurance certificate (if needed)"
  ],
  "applyBeforeDays": 30,
  "processingTime": "1-2 weeks",
  "fees": "Varies by NIA schedule"
}
```

### Tax section — add to faqs, NOT a separate field:
Include detailed FAQ about the 3-tier tax structure:
- ≤90 days: Minimal tax exposure (overseas-sourced income largely exempt)
- 91-183 days: Remote work income becomes reportable, must file before departure
- ≥183 days: Full tax resident — progressive rates apply. Consider Gold Card if high income.

### pathsTo (2 items):
- dnv → gold-card: Upgrade for Taiwan work permission + tax benefits
- dnv → work-arc: If found Taiwan employer (requires separate work permit)

### pathsFrom (2 items):
- Visa-exempt entry → dnv: Convert while in Taiwan (10+ business days before expiry)
- Other country's DNV → Taiwan DNV: Income requirement waived

### warnings (5 items):
1. Full Taiwan bilingual disclaimer (EN + 繁體中文)
2. ⚠️ ABSOLUTELY NO work for Taiwan-based employers — visa violation
3. No NHI access — must maintain private international insurance at all times
4. Domestic applicants: apply 10+ business days before current stay expires
5. Application fees non-refundable

### officialLinks (4 items):
- BOCA Visa Information: https://www.boca.gov.tw
- BOCA Visa Web Application: https://visawebapp.boca.gov.tw
- NDC Digital Nomad Portal: https://digitalnomad.ndc.gov.tw
- NIA: https://www.immigration.gov.tw

---

## After Creating JSON Files

### Update AVAILABLE_VISAS in lib/visa-data.ts:
```typescript
taiwan: ['gold-card', 'dnv']
```

### Quality Checklist:
- [ ] Both files conform to `TaiwanVisa` interface (country: 'tw')
- [ ] `goldCardFields` only on gold-card.json, NOT on dnv.json
- [ ] `goldCardComparison` only on gold-card.json
- [ ] All community tips have: id, tip, source, verified, upvotes, dateAdded
- [ ] Taiwan disclaimer appears in BOTH files' warnings array — EN + 繁體中文
- [ ] No "you qualify", "you are eligible", "recommended" language anywhere
- [ ] No match scores, percentages, or probability language
- [ ] All URLs are real and valid
- [ ] `lastUpdated` set to today's date
- [ ] Each file has 12+ FAQs
- [ ] Each file has 5+ community tips
- [ ] agencySteps properly ordered with dependsOn chain
- [ ] Fee structure includes nationality variations
- [ ] DNV age-tier income clearly documented
- [ ] Gold Card 12 industry fields listed in goldCardFields.categories
- [ ] pathsTo and pathsFrom reference valid TaiwanVisaType values from visa.ts
