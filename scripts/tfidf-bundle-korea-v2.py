"""
정착번들 TF-IDF 분석
- Reddit 628건 (English, foreigner demand)
- Naver 1350건 (Korean, 행정사 supply)
- 각각 별도 클러스터링 후 수요-공급 갭 분석
"""

import json
import os
import re
import numpy as np
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_PATH = os.path.join(BASE, "docs/agent/reports/synthesis-input/filtered-bundle-korea-v2.json")
OUTPUT_PATH = os.path.join(BASE, "docs/agent/reports/synthesis-input/bundle-korea-tfidf-v2.json")

BUNDLE_CATS = ["visa", "banking", "phone_connectivity", "bureaucracy"]


def preprocess_en(text):
    """Clean English text for TF-IDF."""
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text


def preprocess_ko(text):
    """Clean Korean text for TF-IDF (keep Korean + basic Latin)."""
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'[^\uAC00-\uD7A3a-zA-Z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def find_optimal_k(X, k_range):
    """Find optimal k using silhouette score."""
    if X.shape[0] < 5:
        return 2, -1
    scores = {}
    for k in k_range:
        if k >= X.shape[0]:
            continue
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km.fit_predict(X)
        if len(set(labels)) < 2:
            continue
        scores[k] = silhouette_score(X, labels, sample_size=min(2000, X.shape[0]))
    if not scores:
        return 2, -1
    best_k = max(scores, key=scores.get)
    return best_k, scores[best_k]


def cluster_records(records, preprocess_fn, lang_label, max_features=2000):
    """Run TF-IDF + KMeans on records."""
    if len(records) < 5:
        return {"error": f"Too few records ({len(records)})", "count": len(records)}

    texts = [preprocess_fn(r["text"]) for r in records]
    texts = [t for t in texts if len(t) > 20]

    stop_words = "english" if lang_label == "en" else None
    vectorizer = TfidfVectorizer(
        max_features=max_features,
        stop_words=stop_words,
        min_df=2,
        max_df=0.9,
        ngram_range=(1, 2),
    )
    X = vectorizer.fit_transform(texts)
    terms = vectorizer.get_feature_names_out()

    k_range = range(3, min(12, len(texts) // 5 + 1))
    optimal_k, sil_score = find_optimal_k(X, k_range)

    km = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
    labels = km.fit_predict(X)

    clusters = []
    for cid in range(optimal_k):
        mask = labels == cid
        cluster_indices = np.where(mask)[0]
        centroid = km.cluster_centers_[cid]
        top_term_indices = centroid.argsort()[-15:][::-1]
        top_terms = [(terms[i], round(float(centroid[i]), 4)) for i in top_term_indices]

        # Representative quotes (closest to centroid)
        from sklearn.metrics.pairwise import cosine_similarity
        cluster_X = X[mask]
        sims = cosine_similarity(cluster_X, centroid.reshape(1, -1)).flatten()
        top_quote_indices = sims.argsort()[-5:][::-1]

        quotes = []
        for qi in top_quote_indices:
            orig_idx = cluster_indices[qi]
            if orig_idx < len(records):
                quotes.append({
                    "text": records[orig_idx]["text"][:300],
                    "engagement": records[orig_idx].get("engagement", 0),
                    "similarity": round(float(sims[qi]), 3),
                    "url": records[orig_idx].get("url", ""),
                    "categories": records[orig_idx].get("bundle_categories", records[orig_idx].get("categories", [])),
                })

        # Category distribution within cluster
        cat_dist = Counter()
        for idx in cluster_indices:
            if idx < len(records):
                for c in records[idx].get("bundle_categories", records[idx].get("categories", [])):
                    if c in BUNDLE_CATS:
                        cat_dist[c] += 1

        # WTP signals in cluster
        wtp_in_cluster = sum(
            1 for idx in cluster_indices
            if idx < len(records) and records[idx].get("wtp_signals")
        )

        clusters.append({
            "cluster_id": cid,
            "size": int(mask.sum()),
            "pct": round(float(mask.sum()) / len(texts) * 100, 1),
            "top_terms": top_terms,
            "category_mix": dict(cat_dist.most_common()),
            "wtp_count": wtp_in_cluster,
            "representative_quotes": quotes,
        })

    clusters.sort(key=lambda c: -c["size"])

    return {
        "lang": lang_label,
        "total_records": len(records),
        "vectorized_records": len(texts),
        "optimal_k": optimal_k,
        "silhouette_score": round(sil_score, 4),
        "vocabulary_size": len(terms),
        "clusters": clusters,
    }


def per_bundle_category_analysis(records, preprocess_fn, lang_label):
    """Analyze each bundle category separately."""
    results = {}
    for cat in BUNDLE_CATS:
        cat_records = [r for r in records if cat in r.get("bundle_categories", r.get("categories", []))]
        if len(cat_records) < 5:
            results[cat] = {"count": len(cat_records), "error": "too few records"}
            continue

        texts = [preprocess_fn(r["text"]) for r in cat_records]
        texts_clean = [t for t in texts if len(t) > 20]

        stop_words = "english" if lang_label == "en" else None
        vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words=stop_words,
            min_df=2,
            max_df=0.9,
            ngram_range=(1, 2),
        )
        try:
            X = vectorizer.fit_transform(texts_clean)
        except ValueError:
            results[cat] = {"count": len(cat_records), "error": "vectorization failed"}
            continue

        terms = vectorizer.get_feature_names_out()

        k_range = range(2, min(8, len(texts_clean) // 3 + 1))
        optimal_k, sil_score = find_optimal_k(X, k_range)

        km = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
        labels = km.fit_predict(X)

        clusters = []
        for cid in range(optimal_k):
            mask = labels == cid
            centroid = km.cluster_centers_[cid]
            top_term_indices = centroid.argsort()[-10:][::-1]
            top_terms = [(terms[i], round(float(centroid[i]), 4)) for i in top_term_indices]

            cluster_indices = np.where(mask)[0]
            from sklearn.metrics.pairwise import cosine_similarity
            cluster_X = X[mask]
            sims = cosine_similarity(cluster_X, centroid.reshape(1, -1)).flatten()
            top_qi = sims.argsort()[-3:][::-1]

            quotes = []
            for qi in top_qi:
                orig_idx = cluster_indices[qi]
                if orig_idx < len(cat_records):
                    quotes.append({
                        "text": cat_records[orig_idx]["text"][:250],
                        "url": cat_records[orig_idx].get("url", ""),
                    })

            clusters.append({
                "cluster_id": cid,
                "size": int(mask.sum()),
                "pct": round(float(mask.sum()) / len(texts_clean) * 100, 1),
                "top_terms": top_terms,
                "representative_quotes": quotes,
            })

        clusters.sort(key=lambda c: -c["size"])
        results[cat] = {
            "count": len(cat_records),
            "optimal_k": optimal_k,
            "silhouette_score": round(sil_score, 4),
            "clusters": clusters,
        }

    return results


def supply_demand_gap(reddit_clusters, naver_clusters):
    """Compare demand (Reddit) vs supply (Naver) themes."""
    # Extract top terms from each source
    reddit_terms = set()
    for c in reddit_clusters.get("clusters", []):
        for term, _ in c["top_terms"][:8]:
            reddit_terms.add(term)

    naver_terms = set()
    for c in naver_clusters.get("clusters", []):
        for term, _ in c["top_terms"][:8]:
            naver_terms.add(term)

    return {
        "demand_only_terms": sorted(reddit_terms - naver_terms),
        "supply_only_terms": sorted(naver_terms - reddit_terms),
        "overlap_terms": sorted(reddit_terms & naver_terms),
        "demand_term_count": len(reddit_terms),
        "supply_term_count": len(naver_terms),
        "overlap_count": len(reddit_terms & naver_terms),
    }


def main():
    print("Loading filtered bundle data...")
    with open(INPUT_PATH, "r") as f:
        data = json.load(f)

    records = data["records"]
    reddit = [r for r in records if r["source"] == "reddit"]
    naver = [r for r in records if r["source"] == "naver_blog"]
    print(f"  Reddit: {len(reddit)}, Naver: {len(naver)}")

    # ── Overall clustering ──
    print("\n1. Overall clustering (Reddit - demand)...")
    reddit_overall = cluster_records(reddit, preprocess_en, "en")
    print(f"   k={reddit_overall.get('optimal_k')}, sil={reddit_overall.get('silhouette_score')}")
    for c in reddit_overall.get("clusters", []):
        terms = ", ".join(t[0] for t in c["top_terms"][:5])
        print(f"   C{c['cluster_id']}: {c['size']}건 ({c['pct']}%) — {terms}")

    print("\n2. Overall clustering (Naver - supply)...")
    naver_overall = cluster_records(naver, preprocess_ko, "ko")
    print(f"   k={naver_overall.get('optimal_k')}, sil={naver_overall.get('silhouette_score')}")
    for c in naver_overall.get("clusters", []):
        terms = ", ".join(t[0] for t in c["top_terms"][:5])
        print(f"   C{c['cluster_id']}: {c['size']}건 ({c['pct']}%) — {terms}")

    # ── Per-category analysis ──
    print("\n3. Per-category analysis (Reddit)...")
    reddit_per_cat = per_bundle_category_analysis(reddit, preprocess_en, "en")
    for cat, info in reddit_per_cat.items():
        print(f"   {cat}: {info.get('count', 0)}건, k={info.get('optimal_k', '-')}")

    print("\n4. Per-category analysis (Naver)...")
    naver_per_cat = per_bundle_category_analysis(naver, preprocess_ko, "ko")
    for cat, info in naver_per_cat.items():
        print(f"   {cat}: {info.get('count', 0)}건, k={info.get('optimal_k', '-')}")

    # ── Supply-Demand Gap ──
    print("\n5. Supply-demand gap analysis...")
    gap = supply_demand_gap(reddit_overall, naver_overall)
    print(f"   Demand-only terms: {len(gap['demand_only_terms'])}")
    print(f"   Supply-only terms: {len(gap['supply_only_terms'])}")
    print(f"   Overlap: {len(gap['overlap_terms'])}")

    # ── WTP Deep Dive ──
    wtp_records = [r for r in reddit if r.get("wtp_signals")]
    wtp_naver = [r for r in naver if r.get("wtp_signals")]
    print(f"\n6. WTP records: Reddit={len(wtp_records)}, Naver={len(wtp_naver)}")

    # ── Expert type analysis (Naver only) ──
    expert_types = Counter()
    for r in naver:
        meta = r.get("metadata", {})
        if isinstance(meta, str):
            import ast
            try:
                meta = ast.literal_eval(meta)
            except:
                meta = {}
        et = meta.get("expert_type", "unknown")
        expert_types[et] += 1
    print(f"\n7. Naver expert types: {dict(expert_types.most_common())}")

    # ── Save ──
    output = {
        "generated": __import__("datetime").datetime.now().isoformat(),
        "description": "정착번들 TF-IDF analysis: Reddit demand vs Naver supply",
        "stats": data["stats"],
        "demand_analysis": {
            "source": "Reddit Korea (English, foreigner-written)",
            "total": len(reddit),
            "overall_clusters": reddit_overall,
            "per_category": reddit_per_cat,
            "wtp_records": [{
                "text": r["text"][:300],
                "wtp_signals": r["wtp_signals"],
                "categories": r.get("bundle_categories", []),
                "url": r.get("url", ""),
            } for r in wtp_records],
        },
        "supply_analysis": {
            "source": "Naver Blog Korea (Korean, 행정사/대행 ads)",
            "total": len(naver),
            "overall_clusters": naver_overall,
            "per_category": naver_per_cat,
            "expert_types": dict(expert_types.most_common()),
            "wtp_records": [{
                "text": r["text"][:300],
                "wtp_signals": r["wtp_signals"],
                "categories": r.get("categories", []),
                "url": r.get("url", ""),
            } for r in wtp_naver],
        },
        "gap_analysis": gap,
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"\nSaved: {OUTPUT_PATH} ({os.path.getsize(OUTPUT_PATH) / 1024:.0f}KB)")


if __name__ == "__main__":
    main()
