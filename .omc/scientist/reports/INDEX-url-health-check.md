# URL Health Check — Report Index

**Research Stage:** 4 — URL Health Check & Validation
**Date:** March 14, 2026
**Duration:** ~82 seconds of active testing + analysis
**Sample:** 45 government URLs across 4 regions

---

## Reports Generated

### 1. **FINDINGS.md** (Evidence-Based Research Report)
**File:** `/Users/leegen/localnomad/b2c-website/.omc/scientist/reports/FINDINGS.md`

**Purpose:** Formal research findings with statistical confidence intervals

**Contains:**
- Primary research question and study design
- 4 key findings with evidence and limitations:
  1. Korea: 62% accessible (mixed reliability)
  2. Japan: 20% accessible (DNS geofencing issues)
  3. Taiwan: 9% accessible (CRITICAL infrastructure failure)
  4. SEA: 73% accessible (best performer)
- Root cause analysis for each error type
- Comparative analysis across regions
- Statistical summary with 95% confidence intervals
- Limitations and follow-up research recommendations
- Evidence-based conclusion for follow-up action

**Audience:** Data stakeholders, product/legal teams deciding on source replacement

**Key Stats:**
- Overall success rate: 42.2% (n=45)
- Taiwan critical finding: 91% failure rate
- DNS issues: 22.2% of failures
- SSL issues: 20% of failures

---

### 2. **url-health-check-2026-03-14.md** (Detailed Technical Report)
**File:** `/Users/leegen/localnomad/b2c-website/.omc/scientist/reports/url-health-check-2026-03-14.md`

**Purpose:** Comprehensive technical documentation for engineering/ops teams

**Contains:**
- Executive summary with pass/fail counts
- Region-by-region breakdown:
  - Korea: 13 URLs tested (8 OK, 5 failed)
  - Japan: 10 URLs tested (2 OK, 8 failed)
  - Taiwan: 11 URLs tested (1 OK, 10 failed)
  - SEA: 11 URLs tested (8 OK, 3 failed)
- Detailed error analysis:
  - 10 DNS failures (22%)
  - 9 SSL certificate errors (20%)
  - 3 connection resets (7%)
  - 2 × 403 Forbidden (4%)
  - 2 × 404 Not Found (4%)
- Root cause explanations and workarounds for each error type
- Impact assessment for documentation
- Testing methodology and limitations
- Future testing recommendations (regional VPN, browser testing, cert audits)

**Audience:** Technical teams, system admins, infrastructure teams

**Key Insights:**
- Taiwan has systemic SSL infrastructure issues
- Japan URLs appear region-gated at DNS level
- Korea MOFA completely unavailable (active connection blocking)
- SEA has best regional infrastructure

---

### 3. **url-health-check-SUMMARY.txt** (Quick Reference)
**File:** `/Users/leegen/localnomad/b2c-website/.omc/scientist/reports/url-health-check-SUMMARY.txt`

**Purpose:** One-page executive summary for quick consumption

**Contains:**
- Overall results (45 tested, 19 OK, 26 failed)
- Regional breakdown at a glance
- Critical issues highlighted:
  - Taiwan 91% failure (PRIMARY CONCERN)
  - Japan 80% failure (DNS issues)
  - Korea MOFA 100% failure
- Working sources by country (recommended)
- Broken sources by country (need replacement)
- Error breakdown with percentages
- Immediate actions (specific, actionable)
- Link to detailed report

**Audience:** Decision makers, product managers, legal/compliance

**Use Case:** Present findings to stakeholders in <5 minutes

---

### 4. **url-health-check-2026-03-14.csv** (Raw Data)
**File:** `/Users/leegen/localnomad/b2c-website/.omc/scientist/reports/url-health-check-2026-03-14.csv`

**Purpose:** Machine-readable data for analysis and tracking

**Contains:**
- 45 rows (one per URL)
- Columns: Region, URL, Status, Details, Error Type
- Status values: OK, Error, Redirect
- Error Type classification:
  - Accessible
  - DNS Failure
  - SSL Certificate Error
  - Connection Reset
  - 403 Forbidden
  - 404 Not Found

**Use Cases:**
- Import into spreadsheet for tracking over time
- Automated comparison for future health checks
- Generate alerts when error types change
- Track which sources need replacement

---

## How to Use These Reports

### For Documentation Team
1. Start with **url-health-check-SUMMARY.txt** (5 min read)
2. Review "IMMEDIATE ACTIONS" section
3. Consult full technical report for specific URLs

**Action Items:**
- Update Korea references: immigration.go.kr → immigration.go.kr/immigration_eng/
- Replace all MOFA references (mofa.go.kr unavailable)
- Remove deprecated URLs: law.go.kr/LSW/eng/, gov.kr/portal/foreigner/
- Flag Taiwan sources for replacement or TECO alternatives

### For Research Team
1. Read **FINDINGS.md** for statistical evidence
2. Review "Recommendations for Follow-Up Research"
3. Plan regional testing (Japan, Taiwan VPN verification)

**Next Steps:**
- Test from target-country IPs
- Diagnose specific SSL/DNS issues
- Identify alternative sources
- Set up periodic monitoring

### For Legal/Compliance
1. Review **FINDINGS.md** → "Legal & Compliance Impact" section
2. Check Taiwan-specific disclaimer requirements
3. Plan source accessibility disclaimers

**Compliance Actions:**
- Update disclaimers: "Source accessibility varies by region"
- Document that official sources may require local access
- Provide alternative contact info (TECO, embassies)

### For Product/Engineering
1. Start with **url-health-check-2026-03-14.csv** (raw data)
2. Review **url-health-check-2026-03-14.md** for technical details
3. Use error classifications to plan fallbacks

**Implementation:**
- Set up quarterly health checks (use CSV for tracking)
- Create fallback sources for high-priority countries
- Add regional access tests to CI/CD
- Monitor SSL/DNS infrastructure changes

---

## Key Numbers to Remember

| Metric | Value | Impact |
|--------|-------|--------|
| Overall Success Rate | 42.2% | Less than half of sources are reliably accessible |
| Taiwan Failure Rate | 91% | PRIMARY CONCERN: Primary source unavailable |
| Japan Failure Rate | 80% | DNS geofencing likely; test from Japan IP |
| Korea Success Rate | 62% | Mixed; replace MOFA, verify DNS resets |
| SEA Success Rate | 73% | Best performer; use as model |
| DNS Issues | 22.2% | Likely regional/geofenced |
| SSL Issues | 20% | Infrastructure problem, not security threat |

---

## Critical Action Items (Prioritized)

### URGENT (This Week)
1. **Taiwan:** Test immigration.gov.tw from Taiwan VPN
2. **Korea:** Find alternative MOFA source for government MFA references
3. **Japan:** Determine if DNS failures are intentional geofencing or misconfiguration

### HIGH (This Month)
1. Update documentation with confirmed working URLs
2. Add regional accessibility disclaimers
3. Identify fallback sources for each country

### MEDIUM (Next Quarter)
1. Set up automated health monitoring (quarterly)
2. Test from target-country IPs
3. Diagnose and report infrastructure issues to government agencies

---

## Data Quality & Limitations

**Strengths:**
- Deterministic testing method (repeatable)
- Clear error categorization
- Large sample (45 URLs across regions)
- Specific error messages for diagnostics

**Limitations:**
- US-based network only (DNS/IP filtering may differ elsewhere)
- Point-in-time snapshot (infrastructure changes frequently)
- HEAD requests only (doesn't test page content)
- No browser simulation (may bypass some errors)
- No certificate bypass testing (some SSL errors may be fixable)

**Confidence Level:** HIGH for identifying problematic URLs, MEDIUM for determining if they're inaccessible vs. region-gated

---

## Files Generated

```
.omc/scientist/reports/
├── FINDINGS.md                        (Research findings with stats)
├── url-health-check-2026-03-14.md     (Detailed technical report)
├── url-health-check-SUMMARY.txt       (Executive summary)
├── url-health-check-2026-03-14.csv    (Raw data for analysis)
└── INDEX-url-health-check.md          (This file)
```

**Total Size:** ~28 KB
**Total Analysis Time:** 82 seconds testing + 15 minutes analysis
**Report Generated:** 2026-03-14 04:48 UTC

---

## Next Steps

1. **Distribute to stakeholders:**
   - Documentation team → SUMMARY.txt
   - Technical team → detailed .md + .csv
   - Legal/Compliance → FINDINGS.md + Taiwan section
   - Decision makers → SUMMARY.txt + FINDINGS.md intro

2. **Plan follow-up research:**
   - Regional testing (Japan, Taiwan, Korea VPNs)
   - SSL certificate diagnostics
   - Alternative source identification

3. **Track over time:**
   - Re-run monthly/quarterly
   - Compare CSV results to detect changes
   - Update documentation as sources stabilize

4. **Implement mitigations:**
   - Add source fallbacks
   - Update disclaimers
   - Set up monitoring alerts

---

**Report Prepared By:** Claude (Data Scientist, Haiku 4.5)
**Stage:** RESEARCH_STAGE:4
**Status:** COMPLETE — Ready for stakeholder review
