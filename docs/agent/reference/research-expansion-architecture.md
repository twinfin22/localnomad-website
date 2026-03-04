# Expansion Architecture Research — Japan, China, SEA

> Generated: 2026-03-03
> Purpose: Reference for Phase 3+ country expansion

## Visa Demand by Language (per Country)

### Japan — Foreign Residents (2025)
| Rank | Nationality | Population | Language |
|------|-------------|-----------|----------|
| 1 | China | 844,187 | zh-cn |
| 2 | Vietnam | 600,348 | vi |
| 3 | Korea | 411,043 | ko |
| 4 | Philippines | ~47,000 | en/tl |
| 5 | Indonesia | ~47,000 | en/id |

**Priority locales**: zh-cn → vi → en → ko
**Note**: Japanese not needed (nationals don't apply for own visa)

### China — Foreign Workers
| Rank | Nationality | Notes |
|------|-------------|-------|
| 1 | South Korea | ~15-20% of skilled workers |
| 2 | Japan | ~10-15% of skilled workers |
| 3 | USA/English-speaking | Tech, education, finance |
| 4 | Southeast Asia (Myanmar, Vietnam, Laos) | Growing, ~13%+ |
| 5 | India | Emerging in tech/manufacturing |

**Priority locales**: en → ja → ko
**Note**: zh-cn not needed. vi low demand.
**Data caveat**: China doesn't publicly release detailed immigration statistics.

### Southeast Asia — Digital Nomad Visa Applicants
| Rank | Nationality Group | Notes |
|------|-------------------|-------|
| 1 | USA/English-speaking | Largest DN pool globally |
| 2 | European (DE, UK, FR, ES) | Secondary pool |
| 3 | Australia/New Zealand | Concentrated in TH, ID |
| 4 | Japan | Growing, esp. Bangkok/Chiang Mai |
| 5 | South Korea | Emerging |

**Priority locales**: en only (DN market is English-dominant)
**Note**: No official nationality statistics exist for DN visa applicants in SEA.

## Legal Disclaimer Requirements (per Country)

### Japan
- **Law**: 行政書士法 (Administrative Scrivener Act) §19, §23
- **Penalty**: Up to 1 year imprisonment + ¥1,000,000 fine (strengthened Jan 2026)
- **Scope**: "相談 (consultation)" interpreted broadly — personalized recommendations included
- **CAN**: Display published requirements, checklists, comparison tables
- **NEVER**: "You qualify", visa recommendations, eligibility determination, application filing

### China
- **Law**: No single governing statute; administrative violations under various regulations
- **Penalty**: Administrative sanctions, business license revocation
- **Scope**: "咨询 (consulting)" usage restricted (same pattern as Taiwan)
- **CAN**: Display published requirements, checklists
- **NEVER**: Personalized matching, AI chatbot visa Q&A, eligibility determination

### Thailand
- **Law**: Immigration Act B.E. 2522 (1979)
- **Penalty**: Fines + potential imprisonment for unlicensed immigration services
- **CAN**: Display published information
- **NEVER**: Paid visa guidance, application filing

### Indonesia
- **Law**: Law No. 6/2011 on Immigration
- **Penalty**: IDR 500M+ fine (~USD 31K)
- **CAN**: Display published requirements
- **NEVER**: Eligibility determination, application filing

### Malaysia
- **Law**: Immigration Act 1959/63
- **Penalty**: Similar pattern to Thailand/Indonesia
- **CAN**: Display published information
- **NEVER**: Unlicensed consultation, application filing

### Common Principle (All Countries)
- ✅ Display published requirements with source links
- ✅ Factual comparison tables (no ranking by "fit")
- ✅ Document checklists (client-side only)
- ✅ Day counters (arithmetic only)
- ❌ NEVER: "you qualify", "eligible", "recommended", match scores
- ❌ NEVER: File applications, store credentials, broker agents

## Architecture Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Directory structure | `data/visas/{country}/{locale}/{type}.json` | Unified pattern for all countries |
| Type loader | if/else (no generic) | 4-6 countries doesn't justify abstraction |
| SEA treatment | Country type `'southeast-asia'` | Country page = comparison page |
| SEA data | `data/comparisons/sea-digital-nomad.json` | Comparison-only, no individual visa pages |
| Initial language | English only for all new countries | Expand per demand data above |
| Disclaimers | Config-based VisaDisclaimer | Same principle, different laws per country |
