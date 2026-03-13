#!/usr/bin/env python3
"""
Phase D TF-IDF Pipeline: Uncategorized records clustering
- Load 710 uncategorized records
- TF-IDF vectorization (separate for non-appstore vs appstore)
- KMeans clustering
- Extract representative quotes, theme labels, cross-tabulations
- Output intermediate JSON for skill synthesis
"""

import json
import re
import sys
from collections import Counter
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

INPUT = Path("docs/agent/reports/synthesis-input/phase-d-uncategorized.json")
OUTPUT = Path("docs/agent/reports/synthesis-input/phase-d-tfidf-intermediate.json")

def load_data():
    with open(INPUT) as f:
        data = json.load(f)
    records = data["records"]
    ngram_analysis = data.get("ngram_analysis", {})
    return records, ngram_analysis, data

def preprocess(text):
    """Clean text for TF-IDF"""
    text = text.lower()
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'[^\w\s가-힣ぁ-んァ-ン一-龥]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def cluster_subset(records, label, n_clusters_range=(3, 12)):
    """Run TF-IDF + KMeans on a subset, auto-select best k"""
    if len(records) < 10:
        return None
    
    texts = [preprocess(r["t"]) for r in records]
    
    # Filter out very short texts
    valid = [(i, t) for i, t in enumerate(texts) if len(t) > 20]
    if len(valid) < 10:
        return None
    
    indices, clean_texts = zip(*valid)
    valid_records = [records[i] for i in indices]
    
    # TF-IDF
    vectorizer = TfidfVectorizer(
        max_features=500,
        stop_words="english",
        min_df=2,
        max_df=0.8,
        ngram_range=(1, 2)
    )
    tfidf_matrix = vectorizer.fit_transform(clean_texts)
    feature_names = vectorizer.get_feature_names_out()
    
    # Find optimal k
    max_k = min(n_clusters_range[1], len(valid) // 5)
    min_k = min(n_clusters_range[0], max_k)
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
    
    # Extract cluster details
    clusters = []
    for c_id in range(best_k):
        mask = labels == c_id
        cluster_records = [valid_records[i] for i, m in enumerate(mask) if m]
        cluster_texts = [clean_texts[i] for i, m in enumerate(mask) if m]
        
        if not cluster_records:
            continue
        
        # Top TF-IDF terms for cluster centroid
        center = km.cluster_centers_[c_id]
        top_term_indices = center.argsort()[-10:][::-1]
        top_terms = [(feature_names[i], float(center[i])) for i in top_term_indices if center[i] > 0]
        
        # Country distribution
        co_dist = Counter(r.get("co", "?") for r in cluster_records)
        # Source distribution
        src_dist = Counter(r.get("src", "?") for r in cluster_records)
        # Engagement stats
        engagements = [r.get("e", 0) for r in cluster_records]
        
        # Representative quotes (highest engagement + closest to centroid)
        cluster_tfidf = tfidf_matrix[mask]
        centroid = km.cluster_centers_[c_id].reshape(1, -1)
        from sklearn.metrics.pairwise import cosine_similarity
        sims = cosine_similarity(cluster_tfidf, centroid).flatten()
        
        # Top 5 by combined score (similarity * log(engagement+1))
        combined = sims * np.log1p([r.get("e", 0) for r in cluster_records])
        top_idx = combined.argsort()[-5:][::-1]
        
        rep_quotes = []
        for idx in top_idx:
            r = cluster_records[idx]
            rep_quotes.append({
                "text": r["t"][:300],
                "source": r.get("src", "?"),
                "country": r.get("co", "?"),
                "engagement": r.get("e", 0),
                "similarity": float(sims[idx])
            })
        
        clusters.append({
            "cluster_id": c_id,
            "size": int(mask.sum()),
            "pct": round(int(mask.sum()) / len(valid_records) * 100, 1),
            "top_terms": top_terms,
            "country_dist": dict(co_dist),
            "source_dist": dict(src_dist),
            "engagement_stats": {
                "mean": round(np.mean(engagements), 1),
                "median": float(np.median(engagements)),
                "max": int(max(engagements)),
                "total": int(sum(engagements))
            },
            "representative_quotes": rep_quotes
        })
    
    # Sort clusters by size desc
    clusters.sort(key=lambda c: c["size"], reverse=True)
    
    return {
        "subset": label,
        "total_records": len(valid_records),
        "optimal_k": best_k,
        "silhouette_score": round(best_score, 3),
        "clusters": clusters,
        "vocabulary_size": len(feature_names)
    }

def cross_tabulate(records):
    """Cross-tabulations for context"""
    co_src = {}
    for r in records:
        co = r.get("co", "?")
        src = r.get("src", "?")
        key = f"{co}_{src}"
        co_src[key] = co_src.get(key, 0) + 1
    
    # Engagement by country
    co_eng = {}
    for r in records:
        co = r.get("co", "?")
        if co not in co_eng:
            co_eng[co] = []
        co_eng[co].append(r.get("e", 0))
    
    co_eng_stats = {}
    for co, engs in co_eng.items():
        co_eng_stats[co] = {
            "count": len(engs),
            "mean_engagement": round(np.mean(engs), 1),
            "total_engagement": int(sum(engs))
        }
    
    return {
        "country_source_matrix": co_src,
        "country_engagement": co_eng_stats
    }

def main():
    print("Loading Phase D data...")
    records, ngram_analysis, raw_data = load_data()
    print(f"  Total records: {len(records)}")
    
    # Split non-appstore vs appstore
    non_app = [r for r in records if r.get("src") != "appstore"]
    app = [r for r in records if r.get("src") == "appstore"]
    print(f"  Non-appstore: {len(non_app)}, Appstore: {len(app)}")
    
    # Cluster non-appstore (high-value missed signals)
    print("\nClustering non-appstore records...")
    non_app_result = cluster_subset(non_app, "non_appstore", (4, 10))
    if non_app_result:
        print(f"  Optimal k={non_app_result['optimal_k']}, silhouette={non_app_result['silhouette_score']}")
        for c in non_app_result["clusters"]:
            terms = ", ".join(t[0] for t in c["top_terms"][:5])
            print(f"  Cluster {c['cluster_id']}: {c['size']} records ({c['pct']}%) — {terms}")
    
    # Cluster appstore separately
    print("\nClustering appstore records...")
    app_result = cluster_subset(app, "appstore", (3, 8))
    if app_result:
        print(f"  Optimal k={app_result['optimal_k']}, silhouette={app_result['silhouette_score']}")
        for c in app_result["clusters"]:
            terms = ", ".join(t[0] for t in c["top_terms"][:5])
            print(f"  Cluster {c['cluster_id']}: {c['size']} records ({c['pct']}%) — {terms}")
    
    # Cross-tabulations
    print("\nCross-tabulating...")
    cross_tab = cross_tabulate(records)
    
    # Build output
    output = {
        "phase": "D",
        "description": "TF-IDF clustering of uncategorized records — texts that matched NO foreigner pain category",
        "methodology": {
            "vectorizer": "TF-IDF (max_features=500, ngram_range=(1,2), min_df=2, max_df=0.8)",
            "clustering": "KMeans with silhouette-score-based k selection",
            "representative_selection": "cosine_similarity × log(engagement+1)"
        },
        "summary": {
            "total_records": len(records),
            "non_appstore": len(non_app),
            "appstore": len(app),
            "source_breakdown": dict(Counter(r.get("src","?") for r in records)),
            "country_breakdown": dict(Counter(r.get("co","?") for r in records))
        },
        "non_appstore_clusters": non_app_result,
        "appstore_clusters": app_result,
        "cross_tabulations": cross_tab,
        "ngram_context": ngram_analysis
    }
    
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\nOutput: {OUTPUT} ({OUTPUT.stat().st_size // 1024}KB)")
    print("Done.")

if __name__ == "__main__":
    main()
