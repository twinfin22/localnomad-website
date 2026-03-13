"""
세금 TF-IDF 분석
- Reddit 82건 (English, foreigner demand)
- Naver 438건 (Korean, 세무사/행정사 supply)
"""

import json
import os
import re
import numpy as np
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.metrics.pairwise import cosine_similarity

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_PATH = os.path.join(BASE, "docs/agent/reports/synthesis-input/filtered-tax-korea.json")
OUTPUT_PATH = os.path.join(BASE, "docs/agent/reports/synthesis-input/tax-korea-tfidf.json")


def preprocess_en(text):
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text


def preprocess_ko(text):
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'[^\uAC00-\uD7A3a-zA-Z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def find_optimal_k(X, k_range):
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


def cluster_and_analyze(records, preprocess_fn, lang_label, max_features=1500):
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

    k_range = range(2, min(10, len(texts) // 3 + 1))
    optimal_k, sil_score = find_optimal_k(X, k_range)

    km = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
    labels = km.fit_predict(X)

    clusters = []
    for cid in range(optimal_k):
        mask = labels == cid
        cluster_indices = np.where(mask)[0]
        centroid = km.cluster_centers_[cid]
        top_term_indices = centroid.argsort()[-12:][::-1]
        top_terms = [(terms[i], round(float(centroid[i]), 4)) for i in top_term_indices]

        cluster_X = X[mask]
        sims = cosine_similarity(cluster_X, centroid.reshape(1, -1)).flatten()
        top_qi = sims.argsort()[-5:][::-1]

        quotes = []
        for qi in top_qi:
            orig_idx = cluster_indices[qi]
            if orig_idx < len(records):
                quotes.append({
                    "text": records[orig_idx]["text"][:400],
                    "engagement": records[orig_idx].get("engagement", 0),
                    "similarity": round(float(sims[qi]), 3),
                    "url": records[orig_idx].get("url", ""),
                })

        clusters.append({
            "cluster_id": cid,
            "size": int(mask.sum()),
            "pct": round(float(mask.sum()) / len(texts) * 100, 1),
            "top_terms": top_terms,
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


def main():
    print("Loading filtered tax data...")
    with open(INPUT_PATH, "r") as f:
        data = json.load(f)

    records = data["records"]
    reddit = [r for r in records if r["source"] == "reddit"]
    naver = [r for r in records if r["source"] == "naver_blog"]
    print(f"  Reddit: {len(reddit)}, Naver: {len(naver)}")

    print("\n1. Reddit tax clustering (demand)...")
    reddit_clusters = cluster_and_analyze(reddit, preprocess_en, "en")
    if "clusters" in reddit_clusters:
        print(f"   k={reddit_clusters['optimal_k']}, sil={reddit_clusters['silhouette_score']}")
        for c in reddit_clusters["clusters"]:
            terms = ", ".join(t[0] for t in c["top_terms"][:5])
            print(f"   C{c['cluster_id']}: {c['size']}건 ({c['pct']}%) — {terms}")

    print("\n2. Naver tax clustering (supply)...")
    naver_clusters = cluster_and_analyze(naver, preprocess_ko, "ko")
    if "clusters" in naver_clusters:
        print(f"   k={naver_clusters['optimal_k']}, sil={naver_clusters['silhouette_score']}")
        for c in naver_clusters["clusters"]:
            terms = ", ".join(t[0] for t in c["top_terms"][:5])
            print(f"   C{c['cluster_id']}: {c['size']}건 ({c['pct']}%) — {terms}")

    # WTP
    wtp_reddit = [r for r in reddit if r.get("wtp_signals")]
    wtp_naver = [r for r in naver if r.get("wtp_signals")]
    print(f"\n3. WTP: Reddit={len(wtp_reddit)}, Naver={len(wtp_naver)}")

    # Expert types (Naver)
    import ast
    expert_types = Counter()
    for r in naver:
        meta = r.get("metadata", {})
        if isinstance(meta, str):
            try: meta = ast.literal_eval(meta)
            except: meta = {}
        expert_types[meta.get("expert_type", "unknown")] += 1
    print(f"4. Naver expert types: {dict(expert_types.most_common())}")

    # Save
    output = {
        "generated": __import__("datetime").datetime.now().isoformat(),
        "description": "세금 TF-IDF analysis: Reddit demand vs Naver supply",
        "stats": data["stats"],
        "demand_analysis": {
            "source": "Reddit Korea (English)",
            "total": len(reddit),
            "clusters": reddit_clusters,
            "wtp_records": [{
                "text": r["text"][:400],
                "wtp_signals": r["wtp_signals"],
                "url": r.get("url", ""),
            } for r in wtp_reddit],
        },
        "supply_analysis": {
            "source": "Naver Blog Korea (Korean)",
            "total": len(naver),
            "clusters": naver_clusters,
            "expert_types": dict(expert_types.most_common()),
            "wtp_records": [{
                "text": r["text"][:400],
                "wtp_signals": r["wtp_signals"],
                "url": r.get("url", ""),
            } for r in wtp_naver],
        },
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"\nSaved: {OUTPUT_PATH} ({os.path.getsize(OUTPUT_PATH) / 1024:.0f}KB)")


if __name__ == "__main__":
    main()
