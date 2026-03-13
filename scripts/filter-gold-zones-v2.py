"""
Gold Zone 필터링 v2 — 4-Layer Methodology
==========================================

정착번들 (Settlement Bundle):
  Layer 1: category IN (visa, banking, phone_connectivity, bureaucracy, work_legal) → 전체 포함
  Layer 2: category = housing → education(C3) + settlement-practical(C6) 키워드 필터
  Layer 3: category = cost_of_living → health insurance(C6) 키워드 필터
  Layer 4: Rescue pass — 카테고리 밖 레코드에서 settlement 키워드로 추가 포획

세금 (Tax):
  Same as v1 (tax category, taxi noise removal)

Methodology Notes:
- Category-based filtering misses cross-cutting themes (Teresa Torres Opportunity Space)
- Simultaneous coding research: multi-label records need keyword rescue
- Korean keywords: substring matching on compound nouns (2+ syllables), no morphological analyzer needed
- Naver Blog: separate Korean keyword set (agglutinative language = stem doesn't change)
- Inclusion/exclusion criteria documented per systematic review best practice

Input: Reddit Korea + Naver Blog raw data
Output: Filtered JSON files with layer tracking for transparency
"""

import json
import re
import os
from collections import Counter
from datetime import datetime

# ── Paths ──
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REDDIT_PATH = os.path.join(BASE, "docs/agent/reference/reddit-20260311_191730.json")
NAVER_PATH = os.path.join(BASE, "docs/agent/reference/naver_blog-20260311_195708.json")
OUTPUT_DIR = os.path.join(BASE, "docs/agent/reports/synthesis-input")

# ══════════════════════════════════════════════════════════════════
# FILTER DEFINITIONS
# ══════════════════════════════════════════════════════════════════

# ── Layer 1: Full-include categories ──
BUNDLE_FULL_INCLUDE = {"visa", "banking", "phone_connectivity", "bureaucracy", "work_legal"}

# ── Layer 2: Housing sub-theme keywords ──
# Target: C3 (education/school, 98건) + C6 (settlement practical, 205건)
# Exclude: C1 (culture comparison), C5 (family conflict), C0 (history), C2 (COVID)
HOUSING_INCLUDE_EN = re.compile(
    r'\b(?:'
    # Education sub-theme (C3)
    r'school|kindergarten|hagwon|academy|enrollment|tuition|education|'
    r'international\s+school|daycare|preschool|student|elementary|'
    # Settlement practical sub-theme (C6)
    r'bank\s*account|visa\s+(?:type|status|change|extension)|'
    r'alien\s*(?:registration|card)|ARC|immigration\s+office|'
    r'move\s+to\s+korea|relocat|settling|set\s+up|'
    r'sim\s*card|phone\s*(?:number|plan|contract)|'
    r'deposit|lease|jeonse|wolse|rent(?:al|ing)?'
    r')\b',
    re.IGNORECASE
)

HOUSING_INCLUDE_KO = re.compile(
    r'(?:'
    # Education (교육)
    r'학교|교육|입학|학비|유치원|어린이집|학원|국제학교|자녀교육|자녀\s*학교|'
    r'초등학교|중학교|고등학교|'
    # Settlement practical (정착 실무)
    r'외국인등록|체류지\s*변경|전입신고|계좌\s*개설|은행\s*계좌|'
    r'임대차|보증금|월세|전세|부동산\s*계약|'
    r'통신|휴대폰|유심|알뜰폰|선불폰'
    r')'
)

# ── Layer 3: Cost of Living → Health Insurance only ──
COL_HEALTH_EN = re.compile(
    r'\b(?:'
    r'health\s*insurance|medical\s*insurance|NHI|national\s*health|'
    r'insurance\s*(?:card|premium|coverage|enrollment)|'
    r'healthcare\s*(?:cost|system|plan)|'
    r'hospital\s*(?:bill|cost|fee)|'
    r'4대보험|pension|national\s*pension'
    r')\b',
    re.IGNORECASE
)

COL_HEALTH_KO = re.compile(
    r'(?:'
    r'건강보험|국민건강|의료보험|보험료|4대보험|국민연금|'
    r'건강보험료|건강보험증|의료비|병원비|진료비'
    r')'
)

# ── Layer 4: Rescue pass keywords ──
# For records NOT in any of the above categories, catch settlement-related content
RESCUE_EN = re.compile(
    r'\b(?:'
    # Banking/finance settlement
    r'open(?:ing)?\s+(?:a\s+)?bank\s*account|wire\s*transfer|remittance|'
    r'credit\s*card\s*(?:for\s+)?foreigner|debit\s*card|'
    # Phone/connectivity
    r'(?:get(?:ting)?|buy(?:ing)?)\s+(?:a\s+)?(?:sim|phone|number)|'
    r'KT|SKT|LG\s*U\+?|phone\s*plan|'
    # Bureaucracy
    r'immigration\s*office|출입국|hikorea|hi\s*korea|'
    r'alien\s*registration|foreign(?:er)?\s*registration|ARC|'
    r'apostille|notariz|document\s*(?:authenticat|legaliz)|'
    # Education (foreign families)
    r'international\s*school|hagwon|cram\s*school|after[\s-]*school|'
    r'(?:kids?|child(?:ren)?)\s+(?:school|education)|'
    # Health insurance
    r'health\s*insurance\s*(?:for\s+)?foreigner|NHI\s*enrollment|'
    # Work legal
    r'labor\s*(?:board|law|rights|dispute)|severance|pension\s*(?:refund|withdrawal)|'
    r'(?:un)?paid\s*(?:overtime|leave)|wrongful\s*(?:termination|dismissal)'
    r')\b',
    re.IGNORECASE
)

RESCUE_KO = re.compile(
    r'(?:'
    # Banking
    r'계좌\s*개설|외국인\s*계좌|송금|신용카드\s*발급|공동인증서|'
    # Phone
    r'유심|선불폰|알뜰폰|외국인\s*통신|휴대폰\s*개통|'
    # Bureaucracy
    r'외국인등록증|체류지\s*변경|전입신고|출입국|아포스티유|'
    # Education
    r'국제학교|외국인\s*학교|자녀\s*교육|학교\s*입학|'
    # Health insurance
    r'건강보험\s*가입|4대보험|외국인\s*건강보험|'
    # Work legal
    r'퇴직금|임금체불|산재|노동청|부당해고|근로계약'
    r')'
)

# ── Naver spam filter (exclusion) ──
NAVER_SPAM = re.compile(
    r'(?:'
    r'체험단|원고료|광고\s*아닙|광고\s*포함|제공\s*받아|'
    r'이벤트\s*당첨|경품|무료\s*체험'
    r')'
)

# ── Tax filter (same as v1) ──
TAX_CATEGORY = "tax"
TAXI_NOISE = re.compile(
    r'\btaxi\b|\btaxicab\b|\bcab\s+ride\b|\b택시\b|\b카카오택시\b|\b배달\b'
    r'|\buber\b|\bgrab\b|\b콜택시\b',
    re.IGNORECASE
)
TAX_SIGNAL = re.compile(
    r'\btax\s*(return|filing|refund|rate|bracket|deduction|report|obligation|resident)\b'
    r'|\b세금\b|\b소득세\b|\b연말정산\b|\b종합소득\b|\b국세청\b|\b세무\b|\b원천징수\b'
    r'|\b부가세\b|\bVAT\b|\b세액\b|\b납세\b|\btax-free\b|\btax\s+office\b',
    re.IGNORECASE
)


# ══════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ══════════════════════════════════════════════════════════════════

def parse_cats(c):
    if isinstance(c, list):
        return set(c)
    if isinstance(c, str):
        import ast
        try:
            return set(ast.literal_eval(c))
        except (ValueError, SyntaxError):
            return set()
    return set()


def parse_wtp(w):
    if isinstance(w, list):
        return w
    if isinstance(w, str):
        import ast
        try:
            return ast.literal_eval(w)
        except (ValueError, SyntaxError):
            return []
    return []


def load_data():
    with open(REDDIT_PATH, "r") as f:
        reddit_all = json.load(f)
    reddit = [r for r in reddit_all if r.get("country") == "korea"]
    with open(NAVER_PATH, "r") as f:
        naver = json.load(f)
    return reddit, naver


def make_record(r, layer, matched_keywords=None):
    """Standardize a record with layer tracking."""
    return {
        "source": r.get("source", "unknown"),
        "text": r["text"],
        "date": r.get("date", ""),
        "categories": list(parse_cats(r["categories"])),
        "wtp_signals": parse_wtp(r.get("wtp_signals", [])),
        "engagement": int(r.get("engagement", 0)),
        "lang": r.get("lang", ""),
        "url": r.get("url", ""),
        "metadata": r.get("metadata", {}),
        # v2: layer tracking
        "inclusion_layer": layer,
        "matched_keywords": matched_keywords or [],
    }


# ══════════════════════════════════════════════════════════════════
# BUNDLE FILTERING (4-Layer)
# ══════════════════════════════════════════════════════════════════

def filter_bundle(records):
    """4-layer bundle filtering with full tracking."""
    included = {}  # url → record (dedup)
    layer_stats = {1: 0, 2: 0, 3: 0, 4: 0}
    layer_details = {
        1: Counter(),  # category → count
        2: {"education": 0, "settlement_practical": 0},
        3: {"health_insurance": 0},
        4: Counter(),  # keyword pattern → count
    }

    for r in records:
        url = r.get("url", "") or id(r)
        if url in included:
            continue

        cats = parse_cats(r["categories"])
        text = r.get("text", "")
        lang = r.get("lang", "")

        # ── Layer 1: Full-include categories ──
        matched_cats = cats & BUNDLE_FULL_INCLUDE
        if matched_cats:
            included[url] = make_record(r, layer=1, matched_keywords=list(matched_cats))
            layer_stats[1] += 1
            for c in matched_cats:
                layer_details[1][c] += 1
            continue

        # ── Layer 2: Housing sub-theme filter ──
        if "housing" in cats:
            kw_matches = []
            if lang == "ko" or re.search(r'[\uAC00-\uD7A3]', text):
                m = HOUSING_INCLUDE_KO.findall(text)
                kw_matches.extend(m[:3])
            if lang == "en" or re.search(r'[a-zA-Z]{3,}', text):
                m = HOUSING_INCLUDE_EN.findall(text)
                kw_matches.extend(m[:3])

            if kw_matches:
                included[url] = make_record(r, layer=2, matched_keywords=kw_matches)
                layer_stats[2] += 1
                # Classify sub-theme
                edu_en = re.search(r'school|education|kindergarten|hagwon|tuition', text, re.I)
                edu_ko = re.search(r'학교|교육|유치원|학원|학비', text)
                if edu_en or edu_ko:
                    layer_details[2]["education"] += 1
                else:
                    layer_details[2]["settlement_practical"] += 1
                continue

        # ── Layer 3: Cost of Living → Health Insurance ──
        if "cost_of_living" in cats:
            kw_matches = []
            if lang == "ko" or re.search(r'[\uAC00-\uD7A3]', text):
                m = COL_HEALTH_KO.findall(text)
                kw_matches.extend(m[:3])
            if lang == "en" or re.search(r'[a-zA-Z]{3,}', text):
                m = COL_HEALTH_EN.findall(text)
                kw_matches.extend(m[:3])

            if kw_matches:
                included[url] = make_record(r, layer=3, matched_keywords=kw_matches)
                layer_stats[3] += 1
                layer_details[3]["health_insurance"] += 1
                continue

        # ── Layer 4: Rescue pass ──
        # Only for records not already included and not in any bundle category
        kw_matches = []
        if lang == "ko" or re.search(r'[\uAC00-\uD7A3]', text):
            m = RESCUE_KO.findall(text)
            kw_matches.extend(m[:3])
        if lang == "en" or re.search(r'[a-zA-Z]{3,}', text):
            m = RESCUE_EN.findall(text)
            kw_matches.extend(m[:3])

        if kw_matches:
            included[url] = make_record(r, layer=4, matched_keywords=kw_matches)
            layer_stats[4] += 1
            for kw in kw_matches:
                layer_details[4][kw] += 1

    return list(included.values()), layer_stats, layer_details


# ══════════════════════════════════════════════════════════════════
# TAX FILTERING (same as v1)
# ══════════════════════════════════════════════════════════════════

def filter_tax(records):
    filtered = []
    taxi_removed = 0
    for r in records:
        cats = parse_cats(r["categories"])
        if TAX_CATEGORY not in cats:
            continue
        text = r.get("text", "")
        has_taxi = bool(TAXI_NOISE.search(text))
        has_tax = bool(TAX_SIGNAL.search(text))
        if has_taxi and not has_tax:
            taxi_removed += 1
            continue
        rec = make_record(r, layer=1, matched_keywords=["tax"])
        rec["taxi_noise_flag"] = has_taxi
        filtered.append(rec)
    return filtered, taxi_removed


# ══════════════════════════════════════════════════════════════════
# STATS & MAIN
# ══════════════════════════════════════════════════════════════════

def compute_stats(records, label):
    total = len(records)
    by_source = Counter(r["source"] for r in records)
    by_lang = Counter(r["lang"] for r in records)
    by_layer = Counter(r["inclusion_layer"] for r in records)
    by_cat = Counter()
    for r in records:
        for c in r["categories"]:
            by_cat[c] += 1
    wtp_count = sum(1 for r in records if r["wtp_signals"])

    return {
        "label": label,
        "total_records": total,
        "by_source": dict(by_source),
        "by_lang": dict(by_lang),
        "by_layer": {str(k): v for k, v in sorted(by_layer.items())},
        "category_distribution": dict(by_cat.most_common()),
        "wtp_records": wtp_count,
        "wtp_density": round(wtp_count / total * 100, 2) if total > 0 else 0,
    }


def main():
    print("=" * 60)
    print("Gold Zone Filter v2 — 4-Layer Methodology")
    print("=" * 60)

    reddit, naver = load_data()
    print(f"\nData loaded: Reddit Korea {len(reddit)} + Naver Blog {len(naver)}")
    all_records = reddit + naver

    # ══ BUNDLE ══
    print("\n" + "─" * 40)
    print("정착번들 (Settlement Bundle)")
    print("─" * 40)

    bundle, layer_stats, layer_details = filter_bundle(all_records)

    # Split by source
    bundle_reddit = [r for r in bundle if r["source"] == "reddit"]
    bundle_naver = [r for r in bundle if r["source"] == "naver_blog"]

    print(f"\n  Total: {len(bundle)} records")
    print(f"  Reddit: {len(bundle_reddit)} | Naver: {len(bundle_naver)}")
    print(f"\n  Layer breakdown:")
    print(f"    L1 (full-include categories): {layer_stats[1]}")
    for cat, count in layer_details[1].most_common():
        print(f"       {cat}: {count}")
    print(f"    L2 (housing sub-themes):      {layer_stats[2]}")
    print(f"       education: {layer_details[2]['education']}")
    print(f"       settlement_practical: {layer_details[2]['settlement_practical']}")
    print(f"    L3 (CoL health insurance):    {layer_stats[3]}")
    print(f"       health_insurance: {layer_details[3]['health_insurance']}")
    print(f"    L4 (rescue pass):             {layer_stats[4]}")
    if layer_details[4]:
        for kw, count in layer_details[4].most_common(10):
            print(f"       \"{kw}\": {count}")

    stats_bundle = compute_stats(bundle, "settlement_bundle_v2")
    stats_bundle["methodology"] = "4-layer: full-include + housing-subtheme + CoL-health + rescue"
    stats_bundle["layer_stats"] = {str(k): v for k, v in layer_stats.items()}
    stats_bundle["layer_details"] = {
        "1_full_include": dict(layer_details[1]),
        "2_housing_subtheme": layer_details[2],
        "3_col_health": layer_details[3],
        "4_rescue": dict(layer_details[4].most_common(20)),
    }
    stats_bundle["filter_categories"] = list(BUNDLE_FULL_INCLUDE)

    # v1 comparison
    v1_count = sum(1 for r in all_records if parse_cats(r["categories"]) & {"visa", "banking", "phone_connectivity", "bureaucracy"})
    print(f"\n  v1 count (4 cats only): {v1_count}")
    print(f"  v2 count (4-layer):     {len(bundle)}")
    print(f"  Net new records:        +{len(bundle) - v1_count} ({(len(bundle) - v1_count) / v1_count * 100:.1f}%)")

    # ══ TAX ══
    print("\n" + "─" * 40)
    print("세금 (Tax)")
    print("─" * 40)

    tax_reddit, taxi_r = filter_tax(reddit)
    tax_naver, taxi_n = filter_tax(naver)
    tax_all = tax_reddit + tax_naver

    print(f"\n  Reddit: {len(tax_reddit)} (taxi noise: {taxi_r})")
    print(f"  Naver:  {len(tax_naver)} (taxi noise: {taxi_n})")
    print(f"  Total:  {len(tax_all)}")

    stats_tax = compute_stats(tax_all, "tax")
    stats_tax["taxi_noise_removed"] = {"reddit": taxi_r, "naver": taxi_n}

    # ══ SAVE ══
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Inclusion/exclusion documentation (systematic review standard)
    inclusion_criteria = {
        "bundle": {
            "layer_1": {
                "rule": "category IN (visa, banking, phone_connectivity, bureaucracy, work_legal)",
                "rationale": "Core settlement infrastructure categories",
                "added_in_v2": "work_legal (28 Reddit, 309 Naver — labor rights relevant to settlement)",
            },
            "layer_2": {
                "rule": "category = housing AND keyword match (education OR settlement-practical)",
                "rationale": "Housing category is 73% noise (culture, family conflict, COVID, history). Only education sub-theme (C3, 98건) and settlement-practical (C6, 205건) are relevant.",
                "keywords_en": HOUSING_INCLUDE_EN.pattern[:200] + "...",
                "keywords_ko": HOUSING_INCLUDE_KO.pattern,
            },
            "layer_3": {
                "rule": "category = cost_of_living AND keyword match (health insurance)",
                "rationale": "CoL is 87% subjective complaints. Only health insurance sub-theme (C6, 24건) is actionable.",
                "keywords_en": COL_HEALTH_EN.pattern[:200] + "...",
                "keywords_ko": COL_HEALTH_KO.pattern,
            },
            "layer_4": {
                "rule": "ANY record matching settlement keywords not already included",
                "rationale": "Rescue pass catches cross-cutting themes missed by category labels (simultaneous coding principle)",
                "keywords_en": "bank account, SIM card, immigration office, ARC, international school, health insurance foreigner, labor law...",
                "keywords_ko": "계좌개설, 유심, 외국인등록증, 국제학교, 건강보험가입, 퇴직금, 임금체불...",
            },
            "exclusion": {
                "housing_noise": "C1 culture comparison (238건), C5 family conflict (234건), C0 history (26건), C2 COVID (21건)",
                "col_noise": "C1 general complaints (61건), C3 cheese expensive (9건), C2 cost-of-living generalities (22건)",
                "naver_spam": "체험단, 원고료, 광고 disclaimers (not applied in v2 — count first)",
            },
        },
        "tax": {
            "inclusion": "category = tax",
            "exclusion": "taxi/cab noise without genuine tax signal",
            "taxi_patterns": "taxi, taxicab, 택시, 카카오택시, uber, grab",
        },
    }

    bundle_output = {
        "generated": datetime.now().isoformat(),
        "version": "v2",
        "methodology": "4-layer filtering (systematic review standard)",
        "filter": "L1: visa+banking+phone+bureaucracy+work_legal | L2: housing(edu+settlement) | L3: CoL(health) | L4: rescue",
        "sources": ["reddit (Korea, en)", "naver_blog (Korea, ko)"],
        "inclusion_exclusion_criteria": inclusion_criteria["bundle"],
        "stats": stats_bundle,
        "records": bundle,
    }
    bundle_path = os.path.join(OUTPUT_DIR, "filtered-bundle-korea-v2.json")
    with open(bundle_path, "w") as f:
        json.dump(bundle_output, f, ensure_ascii=False, indent=2)
    print(f"\nSaved: {bundle_path} ({os.path.getsize(bundle_path) / 1024:.0f}KB)")

    tax_output = {
        "generated": datetime.now().isoformat(),
        "version": "v2",
        "filter": "tax (taxi noise removed)",
        "sources": ["reddit (Korea, en)", "naver_blog (Korea, ko)"],
        "inclusion_exclusion_criteria": inclusion_criteria["tax"],
        "stats": stats_tax,
        "records": tax_all,
    }
    tax_path = os.path.join(OUTPUT_DIR, "filtered-tax-korea-v2.json")
    with open(tax_path, "w") as f:
        json.dump(tax_output, f, ensure_ascii=False, indent=2)
    print(f"Saved: {tax_path} ({os.path.getsize(tax_path) / 1024:.0f}KB)")

    # ══ LAYER AUDIT SAMPLE ══
    print("\n" + "─" * 40)
    print("Layer Audit (sample records per layer)")
    print("─" * 40)
    for layer in [2, 3, 4]:
        layer_records = [r for r in bundle if r["inclusion_layer"] == layer]
        print(f"\n  Layer {layer}: {len(layer_records)} records")
        for r in layer_records[:3]:
            kw = r.get("matched_keywords", [])
            src = r["source"]
            print(f"    [{src}] kw={kw}")
            print(f"    {r['text'][:120]}...")
            print()


if __name__ == "__main__":
    main()
