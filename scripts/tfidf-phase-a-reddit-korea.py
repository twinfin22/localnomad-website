#!/usr/bin/env python3
"""
Phase A Reddit Korea TF-IDF Pipeline
- Load reddit-20260311_191730.json, filter to country=korea (2,406 records)
- Volume-based analysis (NOT engagement-weighted) per Phase A conclusion
- Per-category TF-IDF clustering to find sub-themes within each pain category
- Overall TF-IDF for cross-category pattern discovery
- Output intermediate JSON for skill synthesis
"""

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.metrics.pairwise import cosine_similarity

INPUT = Path("docs/agent/reference/reddit-20260311_191730.json")
OUTPUT = Path("docs/agent/reports/synthesis-input/phase-a-reddit-korea-tfidf.json")

# Actual 18 categories from scripts/common/classify.py
PAIN_CATEGORIES = [
    "housing", "language_barrier", "visa", "community",
    "banking", "healthcare", "work_culture", "discrimination",
    "cost_of_living", "phone_connectivity", "mental_health",
    "family", "tax", "work_legal", "driving",
    "bureaucracy", "language_localization", "app_ux"
]

def load_reddit_korea():
    """Load and filter to Reddit Korea records"""
    with open(INPUT) as f:
        all_records = json.load(f)

    korea = [r for r in all_records if r.get("country") == "korea" and r.get("source") == "reddit"]
    print(f"Total records: {len(all_records)}, Reddit Korea: {len(korea)}")
    return korea

def preprocess(text):
    """Clean text for TF-IDF"""
    text = text.lower()
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'[^\w\s가-힣]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def get_record_categories(record):
    """Extract pain categories from a record"""
    cats = record.get("categories", [])
    if isinstance(cats, str):
        cats = [cats]
    return [c for c in cats if c in PAIN_CATEGORIES]

def cluster_texts(records, label, n_clusters_range=(3, 10), min_records=15):
    """TF-IDF + KMeans on a set of records"""
    if len(records) < min_records:
        return None

    texts = [preprocess(r.get("text", "")) for r in records]
    valid = [(i, t) for i, t in enumerate(texts) if len(t) > 20]
    if len(valid) < min_records:
        return None

    indices, clean_texts = zip(*valid)
    valid_records = [records[i] for i in indices]

    # TF-IDF
    min_df = max(2, len(valid) // 50)  # scale min_df with corpus size
    vectorizer = TfidfVectorizer(
        max_features=500,
        stop_words="english",
        min_df=min_df,
        max_df=0.8,
        ngram_range=(1, 2)
    )

    try:
        tfidf_matrix = vectorizer.fit_transform(clean_texts)
    except ValueError:
        return None

    feature_names = vectorizer.get_feature_names_out()
    if len(feature_names) < 5:
        return None

    # Optimal k via silhouette
    max_k = min(n_clusters_range[1], len(valid) // 8)
    min_k = max(n_clusters_range[0], 2)
    if max_k < min_k:
        max_k = min_k

    best_k, best_score = min_k, -1
    for k in range(min_k, max_k + 1):
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km.fit_predict(tfidf_matrix)
        if len(set(labels)) > 1:
            score = silhouette_score(tfidf_matrix, labels)
            if score > best_score:
                best_k, best_score = k, score

    # Final clustering
    km = KMeans(n_clusters=best_k, random_state=42, n_init=10)
    labels = km.fit_predict(tfidf_matrix)

    clusters = []
    for c_id in range(best_k):
        mask = labels == c_id
        cluster_records = [valid_records[i] for i, m in enumerate(mask) if m]

        if not cluster_records:
            continue

        # Top terms
        center = km.cluster_centers_[c_id]
        top_term_indices = center.argsort()[-10:][::-1]
        top_terms = [(feature_names[i], float(center[i])) for i in top_term_indices if center[i] > 0]

        # WTP signals in cluster
        wtp_count = sum(1 for r in cluster_records if r.get("wtp_signals"))

        # Engagement stats (for reference, not weighting)
        engagements = [r.get("engagement", 0) for r in cluster_records]

        # Representative quotes by VOLUME proximity (centroid similarity only, no engagement weight)
        cluster_tfidf = tfidf_matrix[mask]
        centroid = km.cluster_centers_[c_id].reshape(1, -1)
        sims = cosine_similarity(cluster_tfidf, centroid).flatten()

        # Top 5 by centroid similarity (volume-based, not engagement-weighted)
        top_idx = sims.argsort()[-5:][::-1]

        rep_quotes = []
        for idx in top_idx:
            r = cluster_records[idx]
            rep_quotes.append({
                "text": r.get("text", "")[:400],
                "engagement": r.get("engagement", 0),
                "similarity": float(sims[idx]),
                "url": r.get("url", ""),
                "wtp": bool(r.get("wtp_signals"))
            })

        clusters.append({
            "cluster_id": c_id,
            "size": int(mask.sum()),
            "pct": round(int(mask.sum()) / len(valid_records) * 100, 1),
            "top_terms": top_terms,
            "wtp_count": wtp_count,
            "engagement_stats": {
                "mean": round(float(np.mean(engagements)), 1),
                "median": float(np.median(engagements)),
                "max": int(max(engagements)) if engagements else 0
            },
            "representative_quotes": rep_quotes
        })

    clusters.sort(key=lambda c: c["size"], reverse=True)

    return {
        "subset": label,
        "total_records": len(valid_records),
        "optimal_k": best_k,
        "silhouette_score": round(best_score, 4),
        "clusters": clusters,
        "vocabulary_size": len(feature_names)
    }


def analyze_overall(records):
    """Overall TF-IDF for cross-category patterns"""
    print("\n=== Overall TF-IDF (all 2,406 records) ===")
    result = cluster_texts(records, "all_reddit_korea", (5, 15))
    if result:
        print(f"  k={result['optimal_k']}, silhouette={result['silhouette_score']}")
        for c in result["clusters"]:
            terms = ", ".join(t[0] for t in c["top_terms"][:5])
            print(f"  Cluster {c['cluster_id']}: {c['size']} ({c['pct']}%) — {terms}")
    return result


def analyze_per_category(records):
    """Per-category sub-theme clustering"""
    # Build category -> records mapping
    cat_records = defaultdict(list)
    uncategorized = []

    for r in records:
        cats = get_record_categories(r)
        if cats:
            for c in cats:
                cat_records[c].append(r)
        else:
            uncategorized.append(r)

    print("\n=== Category Distribution (Volume-Based) ===")
    cat_counts = {k: len(v) for k, v in sorted(cat_records.items(), key=lambda x: -len(x[1]))}
    for cat, count in cat_counts.items():
        pct = count / len(records) * 100
        print(f"  {cat}: {count} ({pct:.1f}%)")
    print(f"  uncategorized: {len(uncategorized)} ({len(uncategorized)/len(records)*100:.1f}%)")

    # Cluster within each category
    per_cat_results = {}
    for cat in PAIN_CATEGORIES:
        recs = cat_records.get(cat, [])
        if len(recs) < 15:
            per_cat_results[cat] = {"count": len(recs), "clustering": None, "note": "too few records"}
            continue

        print(f"\n--- Clustering: {cat} ({len(recs)} records) ---")
        result = cluster_texts(recs, cat, (2, 8), min_records=15)
        if result:
            print(f"  k={result['optimal_k']}, silhouette={result['silhouette_score']}")
            for c in result["clusters"]:
                terms = ", ".join(t[0] for t in c["top_terms"][:5])
                print(f"  Sub-theme {c['cluster_id']}: {c['size']} ({c['pct']}%) — {terms}")
        per_cat_results[cat] = {
            "count": len(recs),
            "clustering": result
        }

    return per_cat_results, cat_counts, uncategorized


def wtp_analysis(records):
    """WTP signal analysis within Reddit Korea"""
    wtp_records = [r for r in records if r.get("wtp_signals")]
    print(f"\n=== WTP Signals in Reddit Korea ===")
    print(f"  Total with WTP: {len(wtp_records)} / {len(records)} ({len(wtp_records)/len(records)*100:.2f}%)")

    # WTP by category
    wtp_by_cat = defaultdict(int)
    for r in wtp_records:
        cats = get_record_categories(r)
        for c in cats:
            wtp_by_cat[c] += 1
        if not cats:
            wtp_by_cat["uncategorized"] += 1

    # WTP density (wtp_count / category_count)
    cat_records = defaultdict(list)
    for r in records:
        for c in get_record_categories(r):
            cat_records[c].append(r)

    wtp_density = {}
    for cat, wtp_count in sorted(wtp_by_cat.items(), key=lambda x: -x[1]):
        total = len(cat_records.get(cat, []))
        density = wtp_count / total * 100 if total > 0 else 0
        wtp_density[cat] = {
            "wtp_count": wtp_count,
            "total_records": total,
            "density_pct": round(density, 2)
        }
        print(f"  {cat}: {wtp_count} WTP / {total} total = {density:.2f}%")

    # WTP quotes
    wtp_quotes = []
    for r in wtp_records[:30]:  # top 30
        wtp_quotes.append({
            "text": r.get("text", "")[:400],
            "categories": get_record_categories(r),
            "wtp_signals": r.get("wtp_signals", []),
            "engagement": r.get("engagement", 0),
            "url": r.get("url", "")
        })

    return {
        "total_wtp": len(wtp_records),
        "wtp_rate": round(len(wtp_records) / len(records) * 100, 2),
        "wtp_by_category": dict(wtp_density),
        "sample_quotes": wtp_quotes
    }


def co_occurrence_analysis(records):
    """Which categories co-occur most often?"""
    pairs = Counter()
    for r in records:
        cats = sorted(get_record_categories(r))
        for i in range(len(cats)):
            for j in range(i+1, len(cats)):
                pairs[(cats[i], cats[j])] += 1

    top_pairs = pairs.most_common(20)
    print("\n=== Top Category Co-occurrences ===")
    for (a, b), count in top_pairs[:10]:
        print(f"  {a} + {b}: {count}")

    return [{"pair": list(p), "count": c} for p, c in top_pairs]


def engagement_vs_volume(records):
    """Compare what engagement-weighted vs volume-based ranking would show"""
    cat_records = defaultdict(list)
    for r in records:
        for c in get_record_categories(r):
            cat_records[c].append(r)

    # Volume ranking
    volume_rank = sorted(cat_records.items(), key=lambda x: -len(x[1]))
    # Engagement ranking (total engagement)
    eng_rank = sorted(cat_records.items(), key=lambda x: -sum(r.get("engagement", 0) for r in x[1]))
    # Mean engagement ranking
    mean_eng_rank = sorted(
        [(k, v) for k, v in cat_records.items() if len(v) >= 10],
        key=lambda x: -np.mean([r.get("engagement", 0) for r in x[1]])
    )

    comparison = {}
    for rank_idx, (cat, recs) in enumerate(volume_rank):
        eng_idx = next(i for i, (c, _) in enumerate(eng_rank) if c == cat)
        engs = [r.get("engagement", 0) for r in recs]
        comparison[cat] = {
            "volume_rank": rank_idx + 1,
            "volume_count": len(recs),
            "engagement_rank": eng_idx + 1,
            "total_engagement": int(sum(engs)),
            "mean_engagement": round(float(np.mean(engs)), 1),
            "median_engagement": float(np.median(engs)),
            "rank_delta": eng_idx - rank_idx  # positive = engagement overweights this category
        }

    print("\n=== Volume vs Engagement Ranking Comparison ===")
    print(f"  {'Category':<25} {'Vol#':>5} {'VolRank':>8} {'EngRank':>8} {'Delta':>6}")
    for cat, stats in sorted(comparison.items(), key=lambda x: x[1]["volume_rank"]):
        print(f"  {cat:<25} {stats['volume_count']:>5} {stats['volume_rank']:>8} {stats['engagement_rank']:>8} {stats['rank_delta']:>+6}")

    return comparison


def subreddit_analysis(records):
    """Which subreddits dominate each category?"""
    # Extract subreddit from URL
    cat_subs = defaultdict(lambda: Counter())
    sub_counter = Counter()

    for r in records:
        url = r.get("url", "")
        match = re.search(r'reddit\.com/r/(\w+)', url)
        sub = match.group(1) if match else "unknown"
        sub_counter[sub] += 1
        for c in get_record_categories(r):
            cat_subs[c][sub] += 1

    print("\n=== Top Subreddits ===")
    for sub, count in sub_counter.most_common(10):
        print(f"  r/{sub}: {count}")

    return {
        "overall": dict(sub_counter.most_common(20)),
        "per_category": {cat: dict(subs.most_common(5)) for cat, subs in cat_subs.items()}
    }


def main():
    print("=" * 60)
    print("Phase A Reddit Korea TF-IDF Pipeline (Volume-Based)")
    print("=" * 60)

    records = load_reddit_korea()

    # 1. Per-category sub-theme analysis
    per_cat, cat_counts, uncategorized = analyze_per_category(records)

    # 2. Overall cross-category clustering
    overall = analyze_overall(records)

    # 3. WTP analysis
    wtp = wtp_analysis(records)

    # 4. Co-occurrence
    cooccur = co_occurrence_analysis(records)

    # 5. Engagement vs volume comparison (to prove Phase A conclusion)
    eng_vs_vol = engagement_vs_volume(records)

    # 6. Subreddit analysis
    subs = subreddit_analysis(records)

    # Build output
    output = {
        "phase": "A-reddit-korea",
        "description": "Reddit Korea only (2,406 records). Volume-based analysis per Phase A conclusion that engagement-weighted sampling distorts Korea data.",
        "methodology": {
            "data_source": "reddit-20260311_191730.json filtered to country=korea, source=reddit",
            "weighting": "VOLUME-BASED (not engagement). Representative quotes selected by centroid similarity only.",
            "vectorizer": "TF-IDF (max_features=500, ngram_range=(1,2), dynamic min_df, max_df=0.8)",
            "clustering": "KMeans with silhouette-score-based k selection",
            "rationale": "Phase A v1 found engagement-based analysis inappropriate for Korea due to YouTube commentary contamination. Reddit-only removes this bias."
        },
        "summary": {
            "total_records": len(records),
            "categorized": len(records) - len(uncategorized),
            "uncategorized": len(uncategorized),
            "category_distribution": cat_counts,
            "unique_categories_per_record": {
                "1_cat": sum(1 for r in records if len(get_record_categories(r)) == 1),
                "2_cat": sum(1 for r in records if len(get_record_categories(r)) == 2),
                "3plus_cat": sum(1 for r in records if len(get_record_categories(r)) >= 3),
                "0_cat": sum(1 for r in records if len(get_record_categories(r)) == 0)
            }
        },
        "per_category_clusters": per_cat,
        "overall_clusters": overall,
        "wtp_analysis": wtp,
        "category_cooccurrence": cooccur,
        "engagement_vs_volume": eng_vs_vol,
        "subreddit_analysis": subs
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    size_kb = OUTPUT.stat().st_size // 1024
    print(f"\n{'=' * 60}")
    print(f"Output: {OUTPUT} ({size_kb}KB)")
    print("Done.")

if __name__ == "__main__":
    main()
