# Visa Transition Paths Research - Complete Index

**Date**: March 3, 2026
**Scope**: 10 visa types across Japan (6) and China (4)
**Status**: Research complete, JSON data files created, ready for implementation

---

## What's Included

This research package maps **official and commonly-practiced visa transition pathways** for work, residency, and permanent residence visas in Japan and China.

Each visa includes:
- **pathsTo**: What visas you can transition TO from this visa
- **pathsFrom**: What visas can transition TO this visa (reverse navigation)
- Description of requirements and timeline
- Links to official sources

---

## Files Overview

### Data Files (JSON)

**Japan Visas** (8 files):
- `engineer-specialist.json` — 技術・人文知識・国際業務 (most common work visa)
- `hsw.json` — 高度専門職 (Highly Skilled Professional, fast-track PR)
- `ssw1.json` — 特定技能1号 (Skilled Worker 1, max 5 years)
- `ssw2.json` — 特定技能2号 (Skilled Worker 2, unlimited stay)
- `business-manager.json` — 経営・管理 (Entrepreneur, increased requirements Oct 2025)
- `digital-nomad-jp.json` — デジタルノマド (6-month remote work, closed system)
- `permanent-jp.json` — Permanent Residence (terminal status)
- `student-visa.json` — D-2 Student (entry point for graduates)

**China Visas** (4 files):
- `z-visa.json` — Work Visa (standard employment)
- `r-visa.json` — Talent Visa (high-level specialists)
- `x1-visa.json` — Student Visa (180+ days study)
- `permanent-cn.json` — Permanent Residence (terminal status)

**Location**: `/data/visas/{japan|china}/en/`

### Research Documentation

1. **visa-transition-paths.md** (13 pages)
   - Detailed research for each visa
   - Official sources and links
   - Policy changes (Oct 2025, April 2027)
   - Research limitations and gaps
   - Next steps for implementation
   - Summary transition tables

2. **visa-transition-diagrams.txt** (12 pages)
   - Visual flowcharts of common pathways
   - Pathway timelines (1-10 years)
   - Transition grids (all possible moves)
   - Cross-country comparison
   - Implementation notes

3. **README-visa-transitions.md** (this file)
   - Quick index and navigation guide

---

## Quick Answer Guide

### "How do I find visa transitions?"

**Approach 1: Forward Navigation**
```json
{
  "type": "engineer-specialist",
  "pathsFrom": ["hsw", "business-manager", "permanent-jp"]
}
```
**Answer**: From Engineer/Specialist, you can transition TO:
- HSW (Highly Skilled Professional)
- Business Manager (starting own company)
- Permanent Residence

**Approach 2: Reverse Navigation**
```json
{
  "type": "engineer-specialist",
  "pathsTo": ["student-visa"]
}
```
**Answer**: To reach Engineer/Specialist, you can come FROM:
- Student Visa (graduate hire)

### "What's the fastest way to permanent residence?"

**Japan**:
- Engineer/Specialist → HSP points calculation (1-3 years) → Permanent Residence
- Requires: 80+ points (1 year), or 70+ points (3 years)

**China**:
- X1 Student → Z Work → R Talent (if qualified) → Permanent Residence
- Estimated: 5-8 years total

### "Can I change visas while in the country?"

**Japan**: ✅ Yes (in-country status change)
**China**: ❌ No (must exit and reapply)

---

## Key Findings Summary

### Japan Highlights
1. **Fast-track PR via HSP**: Engineer visa holders can reach PR in 1-3 years if they accumulate 70+ HSP points
2. **Business Manager Changes**: Oct 2025 reforms significantly increased capital requirements (¥5M → ¥30M)
3. **Upcoming PR Restriction**: April 2027 — 3-year engineer visas lose PR eligibility; must hold 5-year visa
4. **Digital Nomad Isolated**: 6-month visa with no published transitions
5. **SSW Pathway Developing**: SSW1 → SSW2 is clear, but SSW → PR still under development

### China Highlights
1. **Cannot Change Status In-Country**: Must exit China and reapply for different visa type
2. **R Visa Preferred**: Talent visa holders have fastest path to PR
3. **Student → Work Clear**: X1 graduates can transition to Z visa with job offer
4. **PR Criteria Opaque**: Official timeline/requirements for Z/R → PR not fully published
5. **Provincial Variation**: PR eligibility varies significantly by province

---

## Implementation Roadmap

### Phase 1: Current (Complete)
- ✅ Researched 10 visa types across Japan & China
- ✅ Created JSON data files with pathsTo/pathsFrom
- ✅ Documented sources and findings
- ✅ Identified limitations and gaps

### Phase 2: Recommended (Not Included)
- [ ] Translate all files to Japanese (ja), Simplified Chinese (zh-cn), Traditional Chinese (zh-tw)
- [ ] Enhance descriptions with eligibility criteria, documents, fees, timelines
- [ ] Add FAQ arrays addressing transition-specific questions
- [ ] Add application steps and processing timelines

### Phase 3: Advanced (Optional)
- [ ] Cross-country research (Japan ↔ China transitions)
- [ ] Integration with visa comparison/selection tools
- [ ] Visual transition flowcharts in UI
- [ ] Timeline calculators

---

## How to Use These Files

### For Developers
1. Import JSON files from `/data/visas/{country}/en/`
2. Use `pathsTo` and `pathsFrom` arrays to build:
   - Transition flowcharts
   - "Next visa options" recommendations
   - Visa comparison matrices
3. Reference markdown files for context and disclaimers

### For Content/Product Teams
1. Read `visa-transition-paths.md` for comprehensive research
2. Review `visa-transition-diagrams.txt` for visual pathways
3. Use data to inform user education and onboarding flows
4. Add disclaimers: "Not legal advice. Consult immigration attorney."

### For Users
1. Find your current visa type
2. Check `pathsFrom` to see what brought you here
3. Check `pathsTo` to see what you can transition to
4. Review timeline and requirements in full description
5. Consult official government sources or immigration lawyer

---

## Important Disclaimers

⚠️ **This is information, not legal advice**
- All pathways are based on published government regulations
- Individual circumstances vary significantly
- Consult with licensed immigration attorney for specific case

⚠️ **Policy Changes**
- Japan Oct 16, 2025: Business Manager requirements increased
- Japan April 2027: 3-year engineer PR eligibility ends
- China 2025: New K Visa introduced (not included in scope)
- Quarterly review recommended for policy updates

⚠️ **Known Gaps**
- China: Official PR timeline/criteria not fully published in English
- Japan: SSW → PR pathway still under development (no finalized rules)
- Both countries: Third-country visa transfers not covered

---

## Sources & References

**Primary Official Sources**:
- Ministry of Foreign Affairs Japan (MOFA): https://mofa.go.jp
- Immigration Services Agency Japan (ISA): https://ssw.go.jp
- China National Immigration Administration: https://nia.gov.cn

**Licensed Immigration Providers**:
- Baker McKenzie, KPMG (firm publications)
- Japan Business Visa Center, Oak Admin, ACROSEED

**Research Communities**:
- JoBins Media, Japan Dev, TokyoDev
- VisaHQ, TravelChinaGuide, Visa Titans

All pathways verified across multiple independent sources.

---

## Contact & Next Steps

For questions about:
- **Implementation details** → Refer to visa-transition-paths.md "Next Steps" section
- **Visual UI development** → See visa-transition-diagrams.txt for flowchart examples
- **Translation work** → Check visa files; structure ready for localization
- **Enhanced documentation** → Use Korea F-2 visa as template (more comprehensive example)

---

**Last Updated**: March 3, 2026
**Next Review**: Quarterly (policy updates)
**Scope**: Japan (6 visas) + China (4 visas) + Permanent Residence options
