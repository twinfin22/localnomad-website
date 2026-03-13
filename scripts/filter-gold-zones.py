"""
Gold Zone 필터링 스크립트
- 정착번들: visa + banking + phone_connectivity + bureaucracy
- 세금: tax (taxi 노이즈 제거)

Input: Reddit Korea + Naver Blog
Output: 2 filtered JSON files for report synthesis
"""

import json
import re
import os
from collections import Counter
from datetime import datetime

# Paths
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REDDIT_PATH = os.path.join(BASE, "docs/agent/reference/reddit-20260311_191730.json")
NAVER_PATH = os.path.join(BASE, "docs/agent/reference/naver_blog-20260311_195708.json")
OUTPUT_DIR = os.path.join(BASE, "docs/agent/reports/synthesis-input")

# ── Filter Definitions ──

BUNDLE_CATEGORIES = {"visa", "banking", "phone_connectivity", "bureaucracy"}

TAX_CATEGORY = "tax"
# Taxi noise patterns (Korean + English)
TAXI_NOISE = re.compile(
    r'\btaxi\b|\btaxicab\b|\bcab\s+ride\b|\b택시\b|\b카카오택시\b|\b배달\b|\bdelivery\b'
    r'|\buber\b|\bgrab\b|\b콜택시\b',
    re.IGNORECASE
)
# Tax signal patterns to confirm genuine tax content
TAX_SIGNAL = re.compile(
    r'\btax\s*(return|filing|refund|rate|bracket|deduction|report|obligation|resident)\b'
    r'|\b세금\b|\b소득세\b|\b연말정산\b|\b종합소득\b|\b국세청\b|\b세무\b|\b원천징수\b'
    r'|\b부가세\b|\bVAT\b|\b세액\b|\b납세\b|\btax-free\b|\btax\s+office\b',
    re.IGNORECASE
)


def parse_cats(c):
    """Parse categories field (list or string repr of list)."""
    if isinstance(c, list):
        return c
    if isinstance(c, str):
        import ast
        try:
            return ast.literal_eval(c)
        except (ValueError, SyntaxError):
            return []
    return []


def parse_wtp(w):
    """Parse wtp_signals field."""
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
    """Load Reddit Korea + Naver Blog."""
    with open(REDDIT_PATH, "r") as f:
        reddit_all = json.load(f)
    reddit = [r for r in reddit_all if r.get("country") == "korea"]

    with open(NAVER_PATH, "r") as f:
        naver = json.load(f)

    return reddit, naver


def filter_bundle(records, source_name):
    """Filter records matching any bundle category."""
    filtered = []
    for r in records:
        cats = set(parse_cats(r["categories"]))
        if cats & BUNDLE_CATEGORIES:
            filtered.append({
                "source": r.get("source", source_name),
                "text": r["text"],
                "date": r.get("date", ""),
                "categories": list(cats),
                "bundle_categories": list(cats & BUNDLE_CATEGORIES),
                "wtp_signals": parse_wtp(r.get("wtp_signals", [])),
                "engagement": int(r.get("engagement", 0)),
                "lang": r.get("lang", ""),
                "url": r.get("url", ""),
                "metadata": r.get("metadata", {}),
            })
    return filtered


def filter_tax(records, source_name):
    """Filter tax records, removing taxi noise."""
    filtered = []
    taxi_removed = 0
    for r in records:
        cats = set(parse_cats(r["categories"]))
        if TAX_CATEGORY not in cats:
            continue

        text = r.get("text", "")

        # If text has taxi noise but no genuine tax signal → skip
        has_taxi = bool(TAXI_NOISE.search(text))
        has_tax = bool(TAX_SIGNAL.search(text))

        if has_taxi and not has_tax:
            taxi_removed += 1
            continue

        filtered.append({
            "source": r.get("source", source_name),
            "text": text,
            "date": r.get("date", ""),
            "categories": list(cats),
            "wtp_signals": parse_wtp(r.get("wtp_signals", [])),
            "engagement": int(r.get("engagement", 0)),
            "lang": r.get("lang", ""),
            "url": r.get("url", ""),
            "metadata": r.get("metadata", {}),
            "taxi_noise_flag": has_taxi,  # True if had taxi mention but also genuine tax
        })

    return filtered, taxi_removed


def compute_stats(records, label):
    """Compute basic stats for a filtered set."""
    total = len(records)
    by_source = Counter(r["source"] for r in records)
    by_lang = Counter(r["lang"] for r in records)
    by_cat = Counter()
    for r in records:
        for c in r.get("bundle_categories", r["categories"]):
            by_cat[c] += 1
    wtp_count = sum(1 for r in records if r["wtp_signals"])

    return {
        "label": label,
        "total_records": total,
        "by_source": dict(by_source),
        "by_lang": dict(by_lang),
        "category_distribution": dict(by_cat.most_common()),
        "wtp_records": wtp_count,
        "wtp_density": round(wtp_count / total * 100, 2) if total > 0 else 0,
    }


def main():
    print("Loading data...")
    reddit, naver = load_data()
    print(f"  Reddit Korea: {len(reddit)} records")
    print(f"  Naver Blog:   {len(naver)} records")

    # ── 정착번들 ──
    print("\n=== 정착번들 (Settlement Bundle) ===")
    bundle_reddit = filter_bundle(reddit, "reddit")
    bundle_naver = filter_bundle(naver, "naver_blog")
    bundle_all = bundle_reddit + bundle_naver

    stats_bundle = compute_stats(bundle_all, "settlement_bundle")
    stats_bundle["reddit_count"] = len(bundle_reddit)
    stats_bundle["naver_count"] = len(bundle_naver)
    stats_bundle["filter_categories"] = list(BUNDLE_CATEGORIES)

    print(f"  Reddit: {len(bundle_reddit)} records")
    print(f"  Naver:  {len(bundle_naver)} records")
    print(f"  Total:  {len(bundle_all)} records")
    print(f"  Categories: {stats_bundle['category_distribution']}")
    print(f"  WTP: {stats_bundle['wtp_records']} ({stats_bundle['wtp_density']}%)")

    # ── 세금 ──
    print("\n=== 세금 (Tax) ===")
    tax_reddit, taxi_removed_r = filter_tax(reddit, "reddit")
    tax_naver, taxi_removed_n = filter_tax(naver, "naver_blog")
    tax_all = tax_reddit + tax_naver

    stats_tax = compute_stats(tax_all, "tax")
    stats_tax["reddit_count"] = len(tax_reddit)
    stats_tax["naver_count"] = len(tax_naver)
    stats_tax["taxi_noise_removed"] = {"reddit": taxi_removed_r, "naver": taxi_removed_n}

    print(f"  Reddit: {len(tax_reddit)} records (taxi noise removed: {taxi_removed_r})")
    print(f"  Naver:  {len(tax_naver)} records (taxi noise removed: {taxi_removed_n})")
    print(f"  Total:  {len(tax_all)} records")
    print(f"  WTP: {stats_tax['wtp_records']} ({stats_tax['wtp_density']}%)")

    # ── Save ──
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    bundle_output = {
        "generated": datetime.now().isoformat(),
        "filter": "visa + banking + phone_connectivity + bureaucracy",
        "sources": ["reddit (Korea, en)", "naver_blog (Korea, ko)"],
        "stats": stats_bundle,
        "records": bundle_all,
    }
    bundle_path = os.path.join(OUTPUT_DIR, "filtered-bundle-korea.json")
    with open(bundle_path, "w") as f:
        json.dump(bundle_output, f, ensure_ascii=False, indent=2)
    print(f"\nSaved: {bundle_path} ({os.path.getsize(bundle_path) / 1024:.0f}KB)")

    tax_output = {
        "generated": datetime.now().isoformat(),
        "filter": "tax (taxi noise removed)",
        "sources": ["reddit (Korea, en)", "naver_blog (Korea, ko)"],
        "stats": stats_tax,
        "records": tax_all,
    }
    tax_path = os.path.join(OUTPUT_DIR, "filtered-tax-korea.json")
    with open(tax_path, "w") as f:
        json.dump(tax_output, f, ensure_ascii=False, indent=2)
    print(f"Saved: {tax_path} ({os.path.getsize(tax_path) / 1024:.0f}KB)")


if __name__ == "__main__":
    main()
