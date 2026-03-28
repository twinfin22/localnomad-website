---
visa_type: dnv
country: taiwan
source_urls:
  - https://talent.nat.gov.tw/en/visa/digital-nomad?c=BN (returned chatbot-only content, no policy data extracted)
  - https://foreigntalentact.ndc.gov.tw/en/Content_List.aspx?n=6501F7D3D7CCA8A0 (returned 403 Forbidden)
  - https://digitalnomad.ndc.gov.tw/en (returned 403 Forbidden)
  - https://www.boca.gov.tw/np-137-2.html (navigation hub only, no DNV-specific content)
last_extracted: 2026-03-25
extraction_method: webfetch (PARTIAL — primary gov sources blocked/empty; fields below populated from existing verified JSON where gov source was previously confirmed)
next_review: 2026-04-25
freshness_tier: stable
gov_source_status: BLOCKED — all 3 primary DNV gov URLs returned 403 or empty content on 2026-03-25. Manual browser verification recommended.
---

NOTE: The primary government sources for Taiwan's DNV (talent.nat.gov.tw, digitalnomad.ndc.gov.tw, foreigntalentact.ndc.gov.tw) were all inaccessible via automated fetch on 2026-03-25. The data below is carried forward from the existing verified visa JSON (last fact-checked 2026-03-20 against primarySourceUrl: https://www.boca.gov.tw/cp-220-5691-aa1c3-2.html). Fields that could not be independently re-verified from this extraction session are marked with [carried-forward].

## Income Requirement
- amount: "20,000–40,000 (age-tiered)" [carried-forward]
- currency: USD
- period: annual
- notes: |
    Age 20-29: >= USD $20,000/year.
    Age 30+: >= USD $40,000/year.
    Must meet threshold for at least 1 of previous 2 years.
    Previous DNV holders from other countries: income requirement waived.
    Separate bank balance requirement: 6-month average >= USD $10,000.

## Duration
- initial: "6 months" [carried-forward]
- extension: "6-month increments at NIA service center" [carried-forward]
- max_total: "2 years (updated January 8, 2026)" [carried-forward]

## Fees
- application: "NT$1,600 (single entry) or NT$3,200 (multiple entry) domestic; USD $50 or $100 overseas" [carried-forward]
- extension: "Varies by NIA schedule" [carried-forward]
- notes: "US citizens: NT$7,090 (domestic) or USD $185 (overseas) due to reciprocity surcharge. Non-refundable."

## Eligibility
- employer_sponsorship: not_required (must work for overseas employer/clients only)
- education: "not specified in source"
- experience: "not specified in source (remote work capability implied by employment/contract requirement)"
- special_conditions: |
    - Must hold passport from a visa-exempt country (~60+ countries).
    - Must NOT work for any Taiwan-based employer or company.
    - Must maintain comprehensive international health and hospitalization insurance (excluded from NHI).
    - Bank balance: 6-month average monthly balance >= USD $10,000.

### Eligible Countries [carried-forward]
Nationals from approximately 60+ visa-exempt countries and territories:
- 90-day visa-exempt countries (can convert to DNV while in Taiwan)
- 30-day visa-exempt countries
- 14-day trial countries: Thailand, Brunei, Philippines (extended to July 31, 2026)
Full list same as Taiwan visa-exempt entry list (see visitor.md).

## Processing Time
- total: "5-15 working days (NDC review + BOCA visa issuance)" [carried-forward]
- ndc_review: "~10 working days" [carried-forward]
- boca_issuance: "~5 working days" [carried-forward]

## Key Policy Details
- work_permission: restricted (overseas employer/clients ONLY — absolutely no Taiwan-based work)
- family_allowed: true (family permitted — family members enter on their own visa status; ref: FTA Art.14)
- dependent_visa: family members enter independently under their own visa status (not as dependents on DNV)
- tax_benefits: |
    No special tax benefits.
    Tax exposure by residency days:
    - <=90 days: minimal (overseas-sourced income largely exempt)
    - 91-183 days: remote work income performed in Taiwan becomes reportable
    - >=183 days: full tax resident with progressive rates
- nhi_access: "Excluded — DNV holders cannot join NHI. Private international health insurance mandatory."
- insurance_requirement: "Comprehensive international health and hospitalization insurance covering entire stay. SafetyWing, World Nomads, Cigna Global commonly used." [carried-forward]
- domestic_application: "Must apply at BOCA at least 10 business days before current visa-exempt stay expires" [carried-forward]
