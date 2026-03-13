"""
Reddit Discovery Mining Script for LocalNomad
==============================================
UNBIASED discovery mode: uses open-ended queries with NO pain keywords.
Collects raw comments from megathread-style posts so Gen can read them
and find patterns we didn't anticipate.

This is intentionally different from reddit-pain-mining.py (hypothesis verification).
- pain-mining.py: "Is banking a problem?" → counts how often it appears
- discover.py: "What do people actually talk about?" → raw comments, no filtering

Usage:
  python3 scripts/reddit-discover.py
  python3 scripts/reddit-discover.py --limit 15 --output ./docs/agent/reference

Output:
  - discover-raw-{timestamp}.json    → All comments, unfiltered, grouped by post
  - discover-comments-{timestamp}.csv → One row per comment for quick scanning
"""

import json
import csv
import time
import sys
import os
from urllib.request import Request, urlopen
from urllib.parse import quote_plus
from datetime import datetime
from collections import Counter

# ── Discovery Searches ────────────────────────────────────────
# Each search is (subreddit, query, country) — manually curated
# to avoid wasting rate limit on irrelevant combinations.
#
# Rules:
#   1. NO pain/problem/difficult/frustrating keywords
#   2. Queries should match how real Reddit titles are phrased
#   3. Each query is paired with subreddits where it makes sense
#   4. Mix of negative AND positive/neutral to avoid negativity bias

SEARCHES = [
    # ════════════════════════════════════════════════
    # KOREA
    # ════════════════════════════════════════════════

    # r/korea — general Korea life
    ("korea", "things I wish I knew before moving to Korea", "korea"),
    ("korea", "what surprised me about living in Korea", "korea"),
    ("korea", "advice for someone moving to Korea", "korea"),
    ("korea", "one year in Korea what I learned", "korea"),
    ("korea", "reality of living in Korea as foreigner", "korea"),
    ("korea", "best and worst things about living in Korea", "korea"),
    ("korea", "what I love about Korea", "korea"),
    ("korea", "daily life as foreigner in Korea", "korea"),
    ("korea", "Korea vs Japan for living", "korea"),
    ("korea", "why I stayed in Korea", "korea"),
    ("korea", "why I left Korea", "korea"),

    # r/Living_in_Korea — more settled expats
    ("Living_in_Korea", "things nobody tells you about Korea", "korea"),
    ("Living_in_Korea", "advice for newcomers", "korea"),
    ("Living_in_Korea", "what would you do differently", "korea"),
    ("Living_in_Korea", "pros and cons of living in Korea", "korea"),
    ("Living_in_Korea", "how has your experience been", "korea"),
    ("Living_in_Korea", "first month in Korea", "korea"),

    # ════════════════════════════════════════════════
    # JAPAN
    # ════════════════════════════════════════════════

    # r/japanlife — daily life experiences
    ("japanlife", "things I wish I knew before moving to Japan", "japan"),
    ("japanlife", "what surprised me about living in Japan", "japan"),
    ("japanlife", "advice for someone just arrived", "japan"),
    ("japanlife", "years living in Japan what I learned", "japan"),
    ("japanlife", "reality of living in Japan", "japan"),
    ("japanlife", "best and worst things about Japan", "japan"),
    ("japanlife", "what I love about living in Japan", "japan"),
    ("japanlife", "daily life as foreigner in Japan", "japan"),
    ("japanlife", "unpopular opinion about living in Japan", "japan"),
    ("japanlife", "why I stayed in Japan", "japan"),
    ("japanlife", "why I left Japan", "japan"),
    ("japanlife", "Japan vs other countries for living", "japan"),

    # r/movingtojapan — planning stage (different perspective)
    ("movingtojapan", "what to prepare before moving to Japan", "japan"),
    ("movingtojapan", "biggest mistake people make", "japan"),
    ("movingtojapan", "advice from people already living there", "japan"),
    ("movingtojapan", "reality vs expectation Japan", "japan"),

    # r/japanfinance — only finance-relevant discovery
    ("japanfinance", "things I wish I knew about taxes in Japan", "japan"),
    ("japanfinance", "advice for freelancers in Japan", "japan"),
    ("japanfinance", "first year tax tips", "japan"),

    # ════════════════════════════════════════════════
    # TAIWAN
    # ════════════════════════════════════════════════

    # r/taiwan
    ("taiwan", "things I wish I knew before moving to Taiwan", "taiwan"),
    ("taiwan", "what surprised me about living in Taiwan", "taiwan"),
    ("taiwan", "advice for someone moving to Taiwan", "taiwan"),
    ("taiwan", "reality of living in Taiwan as foreigner", "taiwan"),
    ("taiwan", "best and worst things about Taiwan", "taiwan"),
    ("taiwan", "what I love about Taiwan", "taiwan"),
    ("taiwan", "daily life as foreigner in Taiwan", "taiwan"),
    ("taiwan", "gold card experience living in Taiwan", "taiwan"),
    ("taiwan", "why I chose Taiwan over other countries", "taiwan"),
    ("taiwan", "why I left Taiwan", "taiwan"),
    ("taiwan", "Taiwan vs Japan vs Korea for living", "taiwan"),

    # ════════════════════════════════════════════════
    # GENERAL / CROSS-COUNTRY
    # ════════════════════════════════════════════════

    # r/digitalnomad — nomad-specific perspective
    ("digitalnomad", "Korea Japan Taiwan experience living", "general"),
    ("digitalnomad", "east asia as digital nomad what is it like", "general"),
    ("digitalnomad", "underrated countries in Asia for nomads", "general"),
    ("digitalnomad", "overrated countries for digital nomads", "general"),
    ("digitalnomad", "what I learned after years as nomad in Asia", "general"),
    ("digitalnomad", "settling down after being nomad in Asia", "general"),

    # r/expats — long-term residents
    ("expats", "living in east asia experience", "general"),
    ("expats", "Korea Japan Taiwan pros cons", "general"),
    ("expats", "what I wish I knew before moving to Asia", "general"),
    ("expats", "hardest adjustment living abroad Asia", "general"),

    # r/IWantOut — planning/deciding stage
    ("IWantOut", "Korea Japan Taiwan which to move to", "general"),
    ("IWantOut", "moving to Korea experience", "general"),
    ("IWantOut", "moving to Japan experience", "general"),
    ("IWantOut", "moving to Taiwan experience", "general"),
]

# ── Functions ──────────────────────────────────────────────────

def fetch_search(subreddit: str, query: str, limit: int = 10, sort: str = "relevance") -> list:
    """Search a subreddit. Returns list of post dicts."""
    url = (
        f"https://www.reddit.com/r/{subreddit}/search.json"
        f"?q={quote_plus(query)}&restrict_sr=on&sort={sort}&t=all&limit={limit}"
    )
    headers = {"User-Agent": "LocalNomad-Discover/1.0"}
    req = Request(url, headers=headers)

    try:
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            posts = data.get("data", {}).get("children", [])
            return [p["data"] for p in posts if p["kind"] == "t3"]
    except Exception as e:
        print(f"  ⚠ Error searching r/{subreddit} '{query}': {e}")
        return []


def fetch_comments(permalink: str, limit: int = 200) -> list[dict]:
    """Fetch ALL top-level comments from a post."""
    safe_permalink = quote_plus(permalink, safe="/")
    url = f"https://www.reddit.com{safe_permalink}.json?limit={limit}&sort=top&depth=1"
    headers = {"User-Agent": "LocalNomad-Discover/1.0"}
    req = Request(url, headers=headers)

    try:
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            if len(data) < 2:
                return []
            comments = data[1].get("data", {}).get("children", [])
            results = []
            for c in comments:
                if c["kind"] != "t1":
                    continue
                body = c["data"].get("body", "")
                score = c["data"].get("score", 0)
                author = c["data"].get("author", "")
                if body and score >= 2 and author != "AutoModerator":
                    results.append({
                        "body": body[:2000],
                        "score": score,
                        "author": author,
                    })
            return results
    except Exception as e:
        print(f"  ⚠ Error fetching comments: {e}")
        return []


def is_megathread(post: dict) -> bool:
    """Check if a post is likely a discussion thread with many responses."""
    return post.get("num_comments", 0) >= 8 and post.get("score", 0) >= 3


def save_incremental(threads: list[dict], output_dir: str, filename: str = "discover-progress.json"):
    """Save progress incrementally so data isn't lost on crash."""
    path = os.path.join(output_dir, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(threads, f, ensure_ascii=False, indent=2)


def run_discovery(limit_per_search: int = 10, output_dir: str = ".") -> list[dict]:
    """
    For each curated (subreddit, query, country) combination:
      1. Search for posts
      2. Filter for megathreads (8+ comments, 3+ score)
      3. Fetch ALL comments from those megathreads
      4. Store raw comment text — NO categorization, NO filtering
      5. Save incrementally every 10 threads
    """
    all_threads = []
    seen_post_ids = set()

    total = len(SEARCHES)
    print(f"📡 {total} curated searches\n")

    for i, (sub, query, country) in enumerate(SEARCHES):
        print(f"[{i+1}/{total}] r/{sub}: '{query[:55]}'")

        posts = fetch_search(sub, query, limit=limit_per_search, sort="top")
        megathreads = [p for p in posts if is_megathread(p) and p["id"] not in seen_post_ids]

        for post in megathreads:
            seen_post_ids.add(post["id"])
            permalink = post.get("permalink", "")
            comments = fetch_comments(permalink, limit=200)

            if not comments:
                continue

            thread_data = {
                "post_id": post["id"],
                "subreddit": post.get("subreddit"),
                "country": country,
                "title": post.get("title", ""),
                "post_body": post.get("selftext", "")[:1000],
                "post_score": post.get("score", 0),
                "num_comments": post.get("num_comments", 0),
                "url": f"https://reddit.com{permalink}",
                "date": datetime.fromtimestamp(post.get("created_utc", 0)).strftime("%Y-%m-%d"),
                "query_used": query,
                "comments": comments,
                "comment_count_fetched": len(comments),
            }
            all_threads.append(thread_data)
            print(f"  ✅ {post.get('title', '')[:60]} — {len(comments)} comments")

            time.sleep(2.0)

            # Incremental save every 10 threads
            if len(all_threads) % 10 == 0:
                save_incremental(all_threads, output_dir)
                print(f"  💾 Progress saved ({len(all_threads)} threads so far)")

        time.sleep(2.0)

    return all_threads


def save_results(threads: list[dict], output_dir: str = "."):
    """Save final discovery data."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    os.makedirs(output_dir, exist_ok=True)

    # ── Full JSON (grouped by thread) ──
    json_path = os.path.join(output_dir, f"discover-raw-{timestamp}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(threads, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Raw data saved: {json_path}")

    # ── Flat CSV (one row per comment, for quick scanning) ──
    csv_path = os.path.join(output_dir, f"discover-comments-{timestamp}.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "country", "subreddit", "post_title", "post_url", "post_date",
            "post_score", "comment_score", "comment_text"
        ])
        for thread in threads:
            for c in thread["comments"]:
                writer.writerow([
                    thread["country"],
                    thread["subreddit"],
                    thread["title"],
                    thread["url"],
                    thread["date"],
                    thread["post_score"],
                    c["score"],
                    c["body"].replace("\n", " "),
                ])
    print(f"✅ Flat CSV saved: {csv_path}")

    # Clean up progress file
    progress_path = os.path.join(output_dir, "discover-progress.json")
    if os.path.exists(progress_path):
        os.remove(progress_path)

    # ── Print summary ──
    total_comments = sum(len(t["comments"]) for t in threads)
    country_counts = Counter(t["country"] for t in threads)
    sub_counts = Counter(t["subreddit"] for t in threads)

    print(f"\n{'='*60}")
    print(f"🔍 DISCOVERY MINING SUMMARY")
    print(f"{'='*60}")
    print(f"Megathreads found: {len(threads)}")
    print(f"Total comments collected: {total_comments}")
    print(f"\nBy country:")
    for country, count in country_counts.most_common():
        comments_in_country = sum(len(t["comments"]) for t in threads if t["country"] == country)
        print(f"  {country}: {count} threads, {comments_in_country} comments")
    print(f"\nBy subreddit:")
    for sub, count in sub_counts.most_common(10):
        print(f"  r/{sub}: {count} threads")
    print(f"\nTop threads by comment count:")
    for t in sorted(threads, key=lambda x: x["comment_count_fetched"], reverse=True)[:15]:
        print(f"  [{t['country']}] r/{t['subreddit']}: {t['title'][:70]}")
        print(f"     {t['comment_count_fetched']} comments | score {t['post_score']} | {t['url']}")


# ── Main ───────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Reddit Discovery Mining for LocalNomad (unbiased)")
    parser.add_argument("--limit", type=int, default=10,
                        help="Posts per search to check for megathreads (default: 10)")
    parser.add_argument("--output", type=str, default=".",
                        help="Output directory")
    args = parser.parse_args()

    # More accurate time estimate
    search_time = len(SEARCHES) * 2  # 2s per search
    est_megathreads = len(SEARCHES) * 0.8  # ~80% of searches find at least 1
    comment_time = est_megathreads * 2  # 2s per megathread comment fetch
    est_total_seconds = search_time + comment_time
    est_minutes = est_total_seconds / 60

    print("🔍 Reddit DISCOVERY Mining (unbiased mode)")
    print(f"   No pain keywords — collecting raw comments from open-ended threads")
    print(f"   {len(SEARCHES)} searches, estimated ~{est_minutes:.0f} minutes")
    print(f"   Progress auto-saved every 10 threads\n")

    threads = run_discovery(limit_per_search=args.limit, output_dir=args.output)
    save_results(threads, output_dir=args.output)

    print(f"\n✅ Done!")
    print(f"💡 Next step: Open the CSV, sort by comment_score, and READ.")
    print(f"   Look for patterns YOU didn't expect. That's the whole point.")
