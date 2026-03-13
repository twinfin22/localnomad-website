"""
Reddit Megathread Collector for LocalNomad
==========================================
Finds the MOST discussed threads about living in Korea/Japan/Taiwan.
No keyword bias — sorts purely by engagement (comments + upvotes).

Strategy:
  1. Search each country subreddit with broad, neutral terms
  2. Sort by "top" (all time) to find highest-engagement posts
  3. Collect full comment threads from the top megathreads
  4. Output: a reading list of threads worth manually reviewing

Usage:
  python3 scripts/reddit-megathreads.py
  python3 scripts/reddit-megathreads.py --top 30 --output ./docs/agent/reference

Output:
  - megathreads-{timestamp}.json → Full thread data with comments
  - megathreads-{timestamp}.csv  → One row per thread for quick scanning
"""

import json
import csv
import time
import re
import os
from urllib.request import Request, urlopen
from urllib.parse import quote_plus
from datetime import datetime
from collections import Counter

# ── Configuration ─────────────────────────────────────────────
# Broad search terms that capture "foreigner living here" threads
# without biasing toward any specific pain category.
# We also pull subreddit top posts directly (no query) for truly
# unbiased discovery.

COUNTRY_CONFIG = {
    "korea": {
        "subreddits": ["korea", "Living_in_Korea"],
        "queries": [
            "foreigner living in Korea",
            "expat Korea experience",
            "moving to Korea",
            "life in Korea as foreigner",
            "Korea AMA",
            "years in Korea",
        ],
        # Also fetch top posts from these subs with no query (pure top)
        # Note: top posts are filtered by RELEVANCE_KEYWORDS below
        "top_subs": ["korea", "Living_in_Korea"],
    },
    "japan": {
        "subreddits": ["japanlife", "movingtojapan", "japanfinance"],
        "queries": [
            "foreigner living in Japan",
            "expat Japan experience",
            "moving to Japan",
            "life in Japan as foreigner",
            "Japan AMA",
            "years in Japan",
        ],
        # japanlife is already foreigner-focused so top posts are mostly relevant
        "top_subs": ["japanlife", "movingtojapan", "japanfinance"],
    },
    "taiwan": {
        "subreddits": ["taiwan", "TaiwanExpats"],
        "queries": [
            "foreigner living in Taiwan",
            "expat Taiwan experience",
            "moving to Taiwan",
            "life in Taiwan as foreigner",
            "gold card Taiwan",
            "Taiwan AMA",
            "years in Taiwan",
        ],
        "top_subs": ["taiwan", "TaiwanExpats"],
    },
}

# Keywords that indicate a post is about foreigner/expat life
# Used to filter top posts that would otherwise be about politics/news/memes
RELEVANCE_KEYWORDS = re.compile(
    r"foreigner|expat|gaijin|waegukin|moving\s+to|moved\s+here|living\s+in|"
    r"immigrant|visa|residence|relocat|as\s+a\s+foreign|non.?native|"
    r"from\s+abroad|settle|first\s+year|newcomer|AMA.*live|live.*AMA|"
    r"bank\s+account|apartment|tax|insurance|language\s+barrier",
    re.IGNORECASE
)

# Minimum thresholds — different for large vs small subreddits
# r/korea, r/japanlife, r/taiwan are big; the rest are small
LARGE_SUBS = {"korea", "japanlife", "taiwan"}
MIN_COMMENTS_LARGE = 30
MIN_SCORE_LARGE = 20
MIN_COMMENTS_SMALL = 10
MIN_SCORE_SMALL = 5

# ── Functions ──────────────────────────────────────────────────

def fetch_search(subreddit: str, query: str, limit: int = 25, sort: str = "top") -> list:
    """Search a subreddit sorted by top."""
    url = (
        f"https://www.reddit.com/r/{subreddit}/search.json"
        f"?q={quote_plus(query)}&restrict_sr=on&sort={sort}&t=all&limit={limit}"
    )
    headers = {"User-Agent": "LocalNomad-Megathreads/1.0"}
    req = Request(url, headers=headers)

    try:
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            posts = data.get("data", {}).get("children", [])
            return [p["data"] for p in posts if p["kind"] == "t3"]
    except Exception as e:
        print(f"  ⚠ Error searching r/{subreddit}: {e}")
        return []


def fetch_top_posts(subreddit: str, limit: int = 50) -> list:
    """Fetch top posts of all time from a subreddit (no search query)."""
    url = f"https://www.reddit.com/r/{subreddit}/top.json?t=all&limit={limit}"
    headers = {"User-Agent": "LocalNomad-Megathreads/1.0"}
    req = Request(url, headers=headers)

    try:
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            posts = data.get("data", {}).get("children", [])
            return [p["data"] for p in posts if p["kind"] == "t3"]
    except Exception as e:
        print(f"  ⚠ Error fetching top from r/{subreddit}: {e}")
        return []


def fetch_comments(permalink: str, limit: int = 200) -> list[dict]:
    """Fetch top-level comments from a post."""
    safe_permalink = quote_plus(permalink, safe="/")
    url = f"https://www.reddit.com{safe_permalink}.json?limit={limit}&sort=top&depth=1"
    headers = {"User-Agent": "LocalNomad-Megathreads/1.0"}
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
                if body and author != "AutoModerator":
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
    """Size threshold depends on subreddit size."""
    sub = post.get("subreddit", "")
    if sub in LARGE_SUBS:
        return (post.get("num_comments", 0) >= MIN_COMMENTS_LARGE
                and post.get("score", 0) >= MIN_SCORE_LARGE)
    else:
        return (post.get("num_comments", 0) >= MIN_COMMENTS_SMALL
                and post.get("score", 0) >= MIN_SCORE_SMALL)


def is_relevant(post: dict) -> bool:
    """Filter out memes, news, photos — keep discussion/text posts about foreigner life."""
    # Must be a text post (or a link post with huge discussion)
    is_self = post.get("is_self", False)
    has_huge_discussion = post.get("num_comments", 0) >= 100
    if not (is_self or has_huge_discussion):
        return False

    # For subs that are already foreigner-focused, skip keyword check
    sub = post.get("subreddit", "")
    foreigner_focused_subs = {"japanlife", "Living_in_Korea", "movingtojapan",
                               "japanfinance", "TaiwanExpats", "JapanExpats"}
    if sub in foreigner_focused_subs:
        return True

    # For general subs (r/korea, r/taiwan), check if the post is about foreigner life
    title = post.get("title", "")
    body = post.get("selftext", "")[:500]
    text = f"{title} {body}"
    return bool(RELEVANCE_KEYWORDS.search(text))


def collect_candidates(country: str, config: dict, limit: int) -> list[dict]:
    """Collect megathread candidates for one country."""
    candidates = {}  # post_id → post_data, dedup

    # Method 1: Search with broad queries
    for sub in config["subreddits"]:
        for query in config["queries"]:
            print(f"  🔍 r/{sub}: '{query}'")
            posts = fetch_search(sub, query, limit=limit, sort="top")
            for p in posts:
                if p["id"] not in candidates and is_megathread(p) and is_relevant(p):
                    candidates[p["id"]] = p
            time.sleep(2.0)

    # Method 2: Top posts of all time (truly unbiased by query)
    for sub in config.get("top_subs", []):
        print(f"  📊 r/{sub}: top posts (all time)")
        posts = fetch_top_posts(sub, limit=50)
        for p in posts:
            if p["id"] not in candidates and is_megathread(p) and is_relevant(p):
                candidates[p["id"]] = p
        time.sleep(2.0)

    return list(candidates.values())


def run_collection(top_n_per_country: int = 20, search_limit: int = 25) -> dict:
    """
    For each country:
      1. Find megathread candidates via search + top posts
      2. Rank by engagement (score + 2×comments)
      3. Take top N per country
      4. Fetch all comments from those threads
    """
    results = {}

    for country, config in COUNTRY_CONFIG.items():
        print(f"\n{'='*50}")
        print(f"🌏 {country.upper()}")
        print(f"{'='*50}")

        candidates = collect_candidates(country, config, limit=search_limit)

        # Rank by engagement
        for p in candidates:
            p["_engagement"] = p.get("score", 0) + p.get("num_comments", 0) * 2

        ranked = sorted(candidates, key=lambda x: x["_engagement"], reverse=True)
        top_posts = ranked[:top_n_per_country]

        print(f"\n  Found {len(candidates)} megathreads, taking top {len(top_posts)}")

        threads = []
        for i, post in enumerate(top_posts):
            permalink = post.get("permalink", "")
            title = post.get("title", "")
            print(f"  [{i+1}/{len(top_posts)}] {title[:65]}")
            print(f"     ↳ score {post.get('score',0)} | {post.get('num_comments',0)} comments")

            comments = fetch_comments(permalink, limit=200)
            time.sleep(2.0)

            # Incremental save
            if len(threads) % 5 == 0 and threads:
                progress_path = os.path.join(".", "megathreads-progress.json")
                with open(progress_path, "w", encoding="utf-8") as f:
                    json.dump({"country": country, "threads": threads}, f, ensure_ascii=False)

            threads.append({
                "post_id": post["id"],
                "subreddit": post.get("subreddit"),
                "country": country,
                "title": title,
                "post_body": post.get("selftext", "")[:1500],
                "post_score": post.get("score", 0),
                "num_comments": post.get("num_comments", 0),
                "engagement": post["_engagement"],
                "url": f"https://reddit.com{permalink}",
                "date": datetime.fromtimestamp(post.get("created_utc", 0)).strftime("%Y-%m-%d"),
                "comments": comments,
                "comment_count_fetched": len(comments),
            })

        results[country] = threads

    return results


def save_results(results: dict, output_dir: str = "."):
    """Save megathread data."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    os.makedirs(output_dir, exist_ok=True)

    # ── Full JSON ──
    all_threads = []
    for country, threads in results.items():
        all_threads.extend(threads)

    json_path = os.path.join(output_dir, f"megathreads-{timestamp}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_threads, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Full data saved: {json_path}")

    # ── Thread list CSV (one row per thread, for quick scanning) ──
    csv_path = os.path.join(output_dir, f"megathreads-{timestamp}.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "country", "subreddit", "title", "post_score", "num_comments",
            "engagement", "date", "comments_fetched", "url"
        ])
        for t in sorted(all_threads, key=lambda x: x["engagement"], reverse=True):
            writer.writerow([
                t["country"], t["subreddit"], t["title"],
                t["post_score"], t["num_comments"], t["engagement"],
                t["date"], t["comment_count_fetched"], t["url"],
            ])
    print(f"✅ Thread list CSV saved: {csv_path}")

    # ── Per-country comment dumps (for reading) ──
    for country, threads in results.items():
        txt_path = os.path.join(output_dir, f"megathreads-{country}-comments-{timestamp}.txt")
        with open(txt_path, "w", encoding="utf-8") as f:
            for t in threads:
                f.write(f"\n{'='*70}\n")
                f.write(f"[{t['country'].upper()}] r/{t['subreddit']}\n")
                f.write(f"{t['title']}\n")
                f.write(f"Score: {t['post_score']} | Comments: {t['num_comments']} | {t['date']}\n")
                f.write(f"{t['url']}\n")
                f.write(f"{'='*70}\n\n")

                if t.get("post_body"):
                    f.write(f"[POST]\n{t['post_body']}\n\n")

                f.write(f"--- TOP COMMENTS ({t['comment_count_fetched']}) ---\n\n")
                for j, c in enumerate(t["comments"], 1):
                    f.write(f"  [{j}] (score: {c['score']})\n")
                    f.write(f"  {c['body'][:2000]}\n\n")

        print(f"✅ {country} reading file saved: {txt_path}")

    # ── Summary ──
    print(f"\n{'='*60}")
    print(f"🔥 MEGATHREAD COLLECTION SUMMARY")
    print(f"{'='*60}")
    for country, threads in results.items():
        total_comments = sum(t["comment_count_fetched"] for t in threads)
        print(f"\n{country.upper()}: {len(threads)} megathreads, {total_comments} comments")
        for t in threads[:5]:
            print(f"  🔥 {t['title'][:65]}")
            print(f"     score {t['post_score']} | {t['num_comments']} comments | {t['date']}")


# ── Main ───────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Reddit Megathread Collector for LocalNomad")
    parser.add_argument("--top", type=int, default=20,
                        help="Top N megathreads per country (default: 20)")
    parser.add_argument("--search-limit", type=int, default=25,
                        help="Posts per search query (default: 25)")
    parser.add_argument("--output", type=str, default=".",
                        help="Output directory")
    args = parser.parse_args()

    total_queries = sum(
        len(c["subreddits"]) * len(c["queries"]) + len(c.get("top_subs", []))
        for c in COUNTRY_CONFIG.values()
    )
    est_minutes = (total_queries * 2 + args.top * 3 * 2) / 60

    print("🔥 Reddit Megathread Collector")
    print(f"   Finding top {args.top} most-discussed threads per country")
    print(f"   {total_queries} searches + top post fetches")
    print(f"   Estimated ~{est_minutes:.0f} minutes\n")

    results = run_collection(
        top_n_per_country=args.top,
        search_limit=args.search_limit,
    )
    save_results(results, output_dir=args.output)

    print(f"\n✅ Done!")
    print(f"💡 Read the .txt files per country — they're formatted for easy reading.")
    print(f"   Focus on threads where score > 100. Those represent consensus pain.")
