---
source: https://www.mdec.my/derantau
source_type: gov agency portal (MDEC — Malaysia Digital Economy Corporation)
last_extracted: 2026-03-27
extraction_method: WebFetch (direct HTML scrape, successful)
---

# Malaysia — DE Rantau Nomad Pass

## Source Document

**MDEC DE Rantau landing page** — mdec.my/derantau (official program page)

This was the cleanest extraction of all 4 countries. The MDEC page rendered well and provided structured program information.

## Key Data Extracted

### Visa Category
- **DE Rantau Nomad Pass**
- Type: Professional Visit Pass (Pas Lawatan Ikhtisas)

### Eligibility — Two Tracks

**Tech Talent/Profession:**
- Software engineers, cloud specialists, cybersecurity experts, AI/ML professionals, digital marketers
- Minimum income: **USD 24,000 annually**

**Non-Tech Talent/Profession:**
- C-suite executives, business development managers, finance professionals, HR managers, consultants, legal counsel
- Minimum income: **USD 60,000 annually**

**Nationality:** All nationalities may apply **except Israel**

### Duration & Stay
- **3 to 12 months** initial pass
- **Renewable for up to additional 12 months**
- Maximum total: **24 months**

### Application Fee
- **Main applicant: MYR 1,000**
- **Dependents: MYR 500 per person**

### Work Requirements
- Active freelance contract exceeding 3 months, OR
- Remote employment with foreign-based companies exceeding 3 months

### Dependents
- **Spouse and child/children** can accompany
- **Parent/parents** eligible for main pass holder only
- Note: JSON says "Parents are not eligible" — contradicts MDEC page which says "bring parent/parents for main pass holder only"

### Health Insurance
- **Not mentioned** on the MDEC page

### Processing Time
- **Not specified** on the MDEC page
- JSON states 6-8 weeks per MDEC guidance, real-world 4-12 weeks

## Verification Against JSON Claims

| Claim | Status | Notes |
|-------|--------|-------|
| USD 24K tech / USD 60K non-tech | CONFIRMED | Explicit on page |
| 3-12 month duration | CONFIRMED | "Stay from 3 up to 12 months" |
| Renewable 12 months | CONFIRMED | "Pass renewable for up to additional 12 months" |
| MYR 1K fee (main) | CONFIRMED | Explicit on page |
| MYR 500 per dependent | CONFIRMED | Explicit on page |
| Spouse + children only | NEEDS CORRECTION | MDEC page says "bring parent/parents for main pass holder only" — parents ARE eligible |
| All nationalities | CONFIRMED with exception | "except Israel" nationality restriction |
| 3-month minimum contract | CONFIRMED | "exceeding 3 months duration" |

## IMPORTANT: Data Correction Needed

The comparison JSON states for dependents: "Parents are not eligible as DE Rantau dependents."

The official MDEC page states: applicants may "bring parent/parents for main pass holder only."

This is a direct contradiction. The JSON should be updated to reflect that **parents are eligible** for the main pass holder.
