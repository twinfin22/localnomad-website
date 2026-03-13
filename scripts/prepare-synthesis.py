"""
Prepare data for user-research-synthesis skill.
3-phase pipeline: A (top engagement) → D (uncategorized themes) → C (summary compilation)
"""

import json
import os
import sys
import re
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common.classify import PAIN_CATEGORIES

INPUT_DIR = "docs/agent/reference"
OUTPUT_DIR = "docs/agent/reports/synthesis-input"

NOISE_ONLY = {"app_ux", "language_localization", "language"}


def load_all():
    """Load all PainRecord files, drop noise-only records."""
    import glob
    records = []
    for fpath in sorted(glob.glob(f"{INPUT_DIR}/appstore-*.json") +
                        glob.glob(f"{INPUT_DIR}/reddit-*.json") +
                        glob.glob(f"{INPUT_DIR}/youtube-*.json") +
                        glob.glob(f"{INPUT_DIR}/naver_blog-*.json")):
        if fpath.endswith("-meta.json") or fpath.endswith("-progress.json"):
            continue
        with open(fpath) as f:
            data = json.load(f)
        for d in data:
            cats = set(d.get("categories", []))
            # Drop ONLY if every category is noise
            if cats and cats.issubset(NOISE_ONLY):
                continue
            records.append(d)
    return records


def phase_a(records, per_category=150):
    """Top engagement records per category."""
    print(f"\n{'='*60}")
    print(f"PHASE A: Top Engagement Sampling")
    print(f"{'='*60}")

    cat_records = defaultdict(list)
    uncategorized = []

    for r in records:
        cats = [c for c in r.get("categories", []) if c not in NOISE_ONLY]
        if not cats:
            uncategorized.append(r)
        for c in cats:
            cat_records[c].append(r)

    sampled = {}
    seen_texts = set()  # dedup across categories

    for cat in sorted(cat_records.keys()):
        recs = sorted(cat_records[cat], key=lambda x: x.get("engagement", 0), reverse=True)
        selected = []
        for r in recs:
            text_key = r["text"][:100]
            if text_key not in seen_texts:
                seen_texts.add(text_key)
                selected.append(r)
            if len(selected) >= per_category:
                break
        sampled[cat] = selected
        print(f"  {cat:<25s} {len(cat_records[cat]):>5d} → {len(selected):>3d} sampled")

    # Also sample top uncategorized
    uncategorized.sort(key=lambda x: x.get("engagement", 0), reverse=True)
    uncat_sample = []
    for r in uncategorized[:500]:
        text_key = r["text"][:100]
        if text_key not in seen_texts:
            seen_texts.add(text_key)
            uncat_sample.append(r)
    sampled["_uncategorized"] = uncat_sample
    print(f"  {'_uncategorized':<25s} {len(uncategorized):>5d} → {len(uncat_sample):>3d} sampled")

    total = sum(len(v) for v in sampled.values())
    print(f"\n  Total sampled: {total}")
    return sampled, uncategorized


def phase_d(uncategorized, all_records):
    """Theme extraction from uncategorized records using n-gram analysis."""
    print(f"\n{'='*60}")
    print(f"PHASE D: Uncategorized Theme Analysis")
    print(f"{'='*60}")

    # n-gram frequency on uncategorized texts
    bigrams = Counter()
    trigrams = Counter()
    stopwords = {"the","a","an","is","are","was","were","be","been","being",
                 "have","has","had","do","does","did","will","would","could",
                 "should","may","might","can","shall","to","of","in","for",
                 "on","with","at","by","from","as","into","through","during",
                 "before","after","above","below","between","out","off","over",
                 "under","again","further","then","once","it","its","this",
                 "that","these","those","i","me","my","we","our","you","your",
                 "he","she","they","them","their","and","but","or","nor","not",
                 "so","if","when","than","too","very","just","about","up","all",
                 "no","each","which","how","what","where","who","whom","why",
                 "some","any","such","only","own","same","both","few","more",
                 "most","other","don't","doesn't","didn't","won't","can't",
                 "it's","i'm","i've","there","here","also","like","really",
                 "even","much","still","get","got","one","two","make","go",
                 "going","went","been","come","see","know","think","want",
                 "use","used","good","bad","new","first","last","long","great",
                 "little","right","big","old","thing","things","lot","way",
                 "back","well","because","many","app","every","sure","never"}

    for r in uncategorized:
        text = r["text"].lower()
        text = re.sub(r"[^a-z\s]", " ", text)
        words = [w for w in text.split() if w not in stopwords and len(w) > 2]

        for i in range(len(words) - 1):
            bigrams[(words[i], words[i+1])] += 1
        for i in range(len(words) - 2):
            trigrams[(words[i], words[i+1], words[i+2])] += 1

    print(f"\n  Top 30 bigrams (uncategorized {len(uncategorized)} records):")
    for gram, count in bigrams.most_common(30):
        print(f"    {' '.join(gram):<35s} {count:>4d}")

    print(f"\n  Top 30 trigrams:")
    for gram, count in trigrams.most_common(30):
        print(f"    {' '.join(gram):<40s} {count:>4d}")

    # Source breakdown of uncategorized
    src_counts = Counter(r.get("source", "?") for r in uncategorized)
    print(f"\n  Uncategorized by source: {dict(src_counts)}")

    # App breakdown (for appstore)
    app_counts = Counter()
    for r in uncategorized:
        if r.get("source") == "appstore":
            app_counts[r.get("metadata", {}).get("app_name", "?")] += 1
    if app_counts:
        print(f"  Uncategorized appstore by app: {dict(app_counts.most_common(10))}")

    # Cluster uncategorized into rough themes by keyword presence
    themes = {
        "delivery_food": re.compile(r"(?i)deliver|food|order|restaurant|rider|driver|menu|meal"),
        "navigation_maps": re.compile(r"(?i)map|gps|navigation|direction|route|traffic|location|address"),
        "marketplace_commerce": re.compile(r"(?i)sell|buy|product|item|seller|buyer|market|shop|purchase|listing"),
        "payment_transaction": re.compile(r"(?i)pay|payment|refund|charge|transaction|receipt|wallet|coupon"),
        "customer_service": re.compile(r"(?i)customer\s*service|support|help|response|complaint|contact|call\s*center"),
        "verification_identity": re.compile(r"(?i)verif|identity|phone\s*number|certif|authenti|인증"),
        "privacy_tracking": re.compile(r"(?i)privacy|tracking|permission|data|personal\s*info|consent"),
    }

    theme_counts = Counter()
    theme_examples = defaultdict(list)
    no_theme = 0
    for r in uncategorized:
        matched = False
        for theme, pattern in themes.items():
            if pattern.search(r["text"]):
                theme_counts[theme] += 1
                if len(theme_examples[theme]) < 5:
                    theme_examples[theme].append(r["text"][:150])
                matched = True
        if not matched:
            no_theme += 1

    print(f"\n  Theme distribution in uncategorized:")
    for theme, count in theme_counts.most_common():
        pct = count / len(uncategorized) * 100
        print(f"    {theme:<30s} {count:>4d} ({pct:.1f}%)")
    print(f"    {'(no theme)':<30s} {no_theme:>4d} ({no_theme/len(uncategorized)*100:.1f}%)")

    return {
        "bigrams_top30": [{"gram": " ".join(g), "count": c} for g, c in bigrams.most_common(30)],
        "trigrams_top30": [{"gram": " ".join(g), "count": c} for g, c in trigrams.most_common(30)],
        "themes": {t: {"count": c, "examples": theme_examples[t]} for t, c in theme_counts.most_common()},
        "no_theme_count": no_theme,
        "total_uncategorized": len(uncategorized),
        "source_breakdown": dict(src_counts),
    }


def phase_c(records, sampled, uncategorized_analysis):
    """Compile everything into a single synthesis-ready file."""
    print(f"\n{'='*60}")
    print(f"PHASE C: Compile Synthesis Input")
    print(f"{'='*60}")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 1. WTP records — ALL of them, full text
    wtp_records = [r for r in records if r.get("wtp_signals")]
    print(f"  WTP records: {len(wtp_records)}")

    # 2. Compile sampled records into compact format
    compact_sampled = {}
    for cat, recs in sampled.items():
        compact_sampled[cat] = [{
            "text": r["text"][:300],
            "source": r.get("source", ""),
            "country": r.get("country", ""),
            "engagement": r.get("engagement", 0),
            "wtp": r.get("wtp_signals", []),
            "segment": r.get("segment_hints", {}),
            "sentiment": r.get("platform_sentiment", 0),
        } for r in recs]

    # 3. WTP compact
    compact_wtp = [{
        "text": r["text"][:400],
        "categories": r.get("categories", []),
        "source": r.get("source", ""),
        "country": r.get("country", ""),
        "engagement": r.get("engagement", 0),
        "wtp": r.get("wtp_signals", []),
        "segment": r.get("segment_hints", {}),
    } for r in wtp_records]

    # 4. Aggregate stats
    cat_counts = Counter()
    src_counts = Counter()
    country_counts = Counter()
    for r in records:
        for c in r.get("categories", []):
            cat_counts[c] += 1
        src_counts[r.get("source", "?")] += 1
        country_counts[r.get("country", "?")] += 1

    stats = {
        "total_records": len(records),
        "by_category": dict(cat_counts.most_common()),
        "by_source": dict(src_counts.most_common()),
        "by_country": dict(country_counts.most_common()),
    }

    # 5. Build final output
    synthesis_input = {
        "metadata": {
            "description": "Pain point data from 18K+ records across 4 sources (Reddit, YouTube, AppStore, Naver Blog) about foreigner struggles in Korea/Japan/Taiwan",
            "data_period": "2020-2026",
            "sources": ["reddit (posts/comments)", "youtube (comments)", "appstore (Google Play reviews)", "naver_blog (Korean expert blogs)"],
            "noise_filtered": "Dropped records with ONLY app_ux/language_localization categories",
        },
        "aggregate_stats": stats,
        "uncategorized_analysis": uncategorized_analysis,
        "wtp_records": compact_wtp,
        "sampled_by_category": compact_sampled,
    }

    # Save
    out_path = os.path.join(OUTPUT_DIR, "synthesis-input.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(synthesis_input, f, ensure_ascii=False, indent=2)

    size = os.path.getsize(out_path)
    token_est = size / 3.5
    print(f"\n  Output: {out_path}")
    print(f"  Size: {size/1024/1024:.1f}M (~{token_est/1000:.0f}K tokens)")
    print(f"  Context fit: {'✅ YES' if token_est < 150000 else '❌ NO — need to reduce'}")

    return out_path, size


if __name__ == "__main__":
    print("🔧 Preparing synthesis input (A → D → C)")

    records = load_all()
    print(f"\nLoaded {len(records)} records (noise-only filtered)")

    # A: Sample top engagement per category
    sampled, uncategorized = phase_a(records, per_category=150)

    # D: Analyze uncategorized themes
    uncat_analysis = phase_d(uncategorized, records)

    # C: Compile everything
    out_path, size = phase_c(records, sampled, uncat_analysis)

    token_est = size / 3.5
    if token_est > 150000:
        print(f"\n⚠️ Still too large. Reducing per_category to 80...")
        sampled, uncategorized = phase_a(records, per_category=80)
        uncat_analysis = phase_d(uncategorized, records)
        out_path, size = phase_c(records, sampled, uncat_analysis)

    print(f"\n✅ Done! File ready for user-research-synthesis skill.")
