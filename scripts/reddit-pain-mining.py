"""
Reddit Pain Point Mining Script for LocalNomad
================================================
Searches Reddit for digital nomad / expat pain points in Korea, Japan, Taiwan.
No API key needed — uses Reddit's public JSON endpoints.

Usage:
  python scripts/reddit-pain-mining.py
  python scripts/reddit-pain-mining.py --limit 200 --output results.json

Output: JSON + summary CSV of categorized pain points
"""

import json
import csv
import time
import re
import sys
import os
from urllib.request import Request, urlopen
from urllib.parse import quote_plus
from datetime import datetime
from collections import Counter

# ── Configuration ──────────────────────────────────────────────

SEARCHES = [
    # Korea — r/korea
    {"subreddit": "korea", "query": "digital nomad visa difficult", "label": "korea"},
    {"subreddit": "korea", "query": "moving to korea frustrating", "label": "korea"},
    {"subreddit": "korea", "query": "bank account foreigner", "label": "korea"},
    {"subreddit": "korea", "query": "apartment lease foreigner deposit", "label": "korea"},
    {"subreddit": "korea", "query": "tax foreigner korea confusing", "label": "korea"},
    {"subreddit": "korea", "query": "health insurance foreigner", "label": "korea"},
    {"subreddit": "korea", "query": "visa extension renewal problem", "label": "korea"},
    {"subreddit": "korea", "query": "phone number SIM card foreigner", "label": "korea"},
    {"subreddit": "korea", "query": "would pay for service help", "label": "korea"},
    # Korea — r/Living_in_Korea
    {"subreddit": "Living_in_Korea", "query": "hardest part living korea", "label": "korea"},
    {"subreddit": "Living_in_Korea", "query": "wish I knew before moving", "label": "korea"},
    {"subreddit": "Living_in_Korea", "query": "biggest frustration daily life", "label": "korea"},
    # Korea — r/digitalnomad
    {"subreddit": "digitalnomad", "query": "Korea difficult problem", "label": "korea"},
    {"subreddit": "digitalnomad", "query": "Seoul coworking visa tax", "label": "korea"},

    # Japan — r/japanlife
    {"subreddit": "japanlife", "query": "frustrating bureaucracy foreigner", "label": "japan"},
    {"subreddit": "japanlife", "query": "bank account foreigner difficult", "label": "japan"},
    {"subreddit": "japanlife", "query": "apartment rejected foreigner guarantor", "label": "japan"},
    {"subreddit": "japanlife", "query": "tax filing confusing", "label": "japan"},
    {"subreddit": "japanlife", "query": "visa renewal stress", "label": "japan"},
    {"subreddit": "japanlife", "query": "phone contract foreigner rejected", "label": "japan"},
    {"subreddit": "japanlife", "query": "discrimination foreigner housing", "label": "japan"},
    # Japan — r/japanfinance (tax & banking specialist sub)
    {"subreddit": "japanfinance", "query": "tax confusing foreigner difficult", "label": "japan"},
    {"subreddit": "japanfinance", "query": "bank account open rejected", "label": "japan"},
    {"subreddit": "japanfinance", "query": "freelance self employed tax", "label": "japan"},
    # Japan — r/movingtojapan
    {"subreddit": "movingtojapan", "query": "biggest challenge moving", "label": "japan"},
    {"subreddit": "movingtojapan", "query": "wish I knew before", "label": "japan"},
    # Japan — r/digitalnomad
    {"subreddit": "digitalnomad", "query": "Japan digital nomad problem", "label": "japan"},
    {"subreddit": "digitalnomad", "query": "Tokyo visa tax nomad", "label": "japan"},

    # Taiwan — r/taiwan
    {"subreddit": "taiwan", "query": "gold card digital nomad experience", "label": "taiwan"},
    {"subreddit": "taiwan", "query": "moving to taiwan difficult foreigner", "label": "taiwan"},
    {"subreddit": "taiwan", "query": "bank account foreigner taiwan", "label": "taiwan"},
    {"subreddit": "taiwan", "query": "apartment rent foreigner taipei", "label": "taiwan"},
    {"subreddit": "taiwan", "query": "tax resident foreigner confusing", "label": "taiwan"},
    {"subreddit": "taiwan", "query": "phone number SIM foreigner taiwan", "label": "taiwan"},
    {"subreddit": "taiwan", "query": "business registration foreigner", "label": "taiwan"},
    # Taiwan — r/digitalnomad
    {"subreddit": "digitalnomad", "query": "Taiwan nomad visa problem", "label": "taiwan"},
    {"subreddit": "digitalnomad", "query": "Taiwan gold card experience worth it", "label": "taiwan"},

    # General Asia DN
    {"subreddit": "digitalnomad", "query": "Asia visa tax nightmare", "label": "general"},
    {"subreddit": "digitalnomad", "query": "east asia difficult compared southeast", "label": "general"},
    {"subreddit": "digitalnomad", "query": "Korea Japan Taiwan which better nomad", "label": "general"},
    {"subreddit": "digitalnomad", "query": "would pay someone help visa relocation", "label": "general"},
    {"subreddit": "expats", "query": "Korea Japan Taiwan hardest part", "label": "general"},
    {"subreddit": "expats", "query": "wish someone would just handle", "label": "general"},
]

# Pain point categories to auto-detect
PAIN_CATEGORIES = {
    "visa": r"visa|immigration|permit|status\s+of\s+residence|residency|overstay|extension|renewal|sponsor|gold\s*card",
    "tax": r"tax|taxes|taxation|filing|double.?tax|tax.?resident|withholding|capital.?gains|tax\s+return|kakutei\s*shinkoku",
    "banking": r"bank\s+account|banking|transfer|remittance|wire|ATM|credit\s+card|debit|financial|shinhan|yucho|post\s+office\s+bank",
    "housing": r"apartment|housing|rent|lease|deposit|guarantor|key\s+money|landlord|real\s+estate|jeonse|wolse|reikin|shikikin",
    "healthcare": r"health\s+insurance|medical|hospital|doctor|national\s+health|clinic|prescription|NHI|NHIS",
    "language": r"language\s+barrier|can't\s+speak|japanese|korean|chinese|mandarin|translation|interpreter|english\s+not",
    "bureaucracy": r"bureaucra|paperwork|government\s+office|city\s+hall|ward\s+office|immigration\s+office|document|hikorea|mynumber",
    "community": r"lonel|isolat|friend|social|community|meetup|network|connect\s+with\s+people|expat\s+group",
    "cost_of_living": r"expensive|cost\s+of\s+living|afford|budget|price|costly|overpriced",
    "work_legal": r"freelanc|self.?employ|work\s+permit|illegal.*work|grey\s+area|legally\s+work|remote\s+work.*legal|business\s+register",
    "phone_connectivity": r"phone\s+number|SIM\s+card|mobile|cell\s+phone|contract\s+phone|prepaid|data\s+plan|internet|wifi",
    "discrimination": r"discriminat|racist|racism|refused\s+because\s+foreign|foreigner\s+not\s+allowed|gaijin|waegukin|hate\s+speech",
}

# Sentiment signals — phrases that indicate real pain
PAIN_SIGNALS = [
    r"i\s+wish",
    r"i\s+couldn'?t\s+find",
    r"the\s+hardest\s+part",
    r"biggest\s+challenge",
    r"frustrat",
    r"nightmare",
    r"impossible",
    r"nobody\s+tells\s+you",
    r"i\s+had\s+no\s+idea",
    r"took\s+me\s+forever",
    r"still\s+don'?t\s+understand",
    r"waste\s+of\s+time",
    r"scam",
    r"rip.?off",
    r"gave\s+up",
    r"so\s+confusing",
    r"no\s+one\s+speaks\s+english",
    r"rejected",
    r"denied",
    r"overpay",
    r"stress",
    r"anxious|anxiety",
    r"afraid",
    r"complicated",
    r"pain\s+in\s+the",
    r"headache",
    r"would\s+pay",
    r"willing\s+to\s+pay",
    r"shut\s+up\s+and\s+take\s+my\s+money",
    r"need\s+help\s+with",
    r"anyone\s+know\s+how\s+to",
    r"is\s+there\s+a\s+service",
    r"took\s+me\s+\d+\s+(month|week|day|hour)",
    r"finally\s+figured\s+out",
    r"don'?t\s+make\s+the\s+same\s+mistake",
    r"learn(ed)?\s+the\s+hard\s+way",
]

# ── Functions ──────────────────────────────────────────────────

def fetch_reddit(subreddit: str, query: str, limit: int = 25, sort: str = "relevance") -> list:
    """Fetch posts from Reddit's public JSON API."""
    url = (
        f"https://www.reddit.com/r/{subreddit}/search.json"
        f"?q={quote_plus(query)}&restrict_sr=on&sort={sort}&t=all&limit={limit}"
    )
    headers = {"User-Agent": "LocalNomad-PainMining/1.0"}
    req = Request(url, headers=headers)

    try:
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            posts = data.get("data", {}).get("children", [])
            return [p["data"] for p in posts if p["kind"] == "t3"]
    except Exception as e:
        print(f"  ⚠ Error fetching r/{subreddit} '{query}': {e}")
        return []


def categorize(text: str) -> list[str]:
    """Auto-categorize text into pain point categories."""
    text_lower = text.lower()
    return [cat for cat, pattern in PAIN_CATEGORIES.items() if re.search(pattern, text_lower)]


def count_pain_signals(text: str) -> int:
    """Count how many pain signal phrases appear in text."""
    text_lower = text.lower()
    return sum(1 for pattern in PAIN_SIGNALS if re.search(pattern, text_lower))


def extract_post_data(post: dict, label: str) -> dict:
    """Extract relevant fields from a Reddit post."""
    title = post.get("title", "")
    body = post.get("selftext", "")
    full_text = f"{title} {body}"
    categories = categorize(full_text)
    pain_score = count_pain_signals(full_text)

    return {
        "id": post.get("id"),
        "subreddit": post.get("subreddit"),
        "title": title,
        "body_preview": body[:500] if body else "",
        "score": post.get("score", 0),
        "num_comments": post.get("num_comments", 0),
        "url": f"https://reddit.com{post.get('permalink', '')}",
        "created_utc": post.get("created_utc"),
        "date": datetime.fromtimestamp(post.get("created_utc", 0)).strftime("%Y-%m-%d"),
        "country_label": label,
        "pain_categories": categories,
        "pain_score": pain_score,
        "engagement": post.get("score", 0) + post.get("num_comments", 0) * 2,
    }


def fetch_comments(permalink: str, limit: int = 50) -> list[dict]:
    """Fetch top comments from a Reddit post. Comments often contain richer pain data."""
    # Encode non-ASCII characters in permalink to avoid ascii codec errors
    safe_permalink = quote_plus(permalink, safe="/")
    url = f"https://www.reddit.com{safe_permalink}.json?limit={limit}&sort=top"
    headers = {"User-Agent": "LocalNomad-PainMining/1.0"}
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
                if body and score >= 3:  # Only comments with some upvotes
                    results.append({"body": body, "score": score})
            return results
    except Exception as e:
        print(f"  ⚠ Error fetching comments: {e}")
        return []


def mine_comments_from_top_posts(posts: list[dict], top_n: int = 30) -> list[dict]:
    """Fetch comments from the highest-engagement posts and extract pain signals."""
    top_posts = sorted(posts, key=lambda x: x["engagement"], reverse=True)[:top_n]
    comment_insights = []

    print(f"\n🔍 Mining comments from top {len(top_posts)} posts...")
    for i, post in enumerate(top_posts):
        permalink = post["url"].replace("https://reddit.com", "")
        print(f"  [{i+1}/{len(top_posts)}] {post['title'][:60]}...")
        comments = fetch_comments(permalink)

        for c in comments:
            body = c["body"]
            pain_score = count_pain_signals(body)
            categories = categorize(body)
            if pain_score > 0 or categories:
                comment_insights.append({
                    "source_post_title": post["title"],
                    "source_post_url": post["url"],
                    "country_label": post["country_label"],
                    "comment_preview": body[:400],
                    "comment_score": c["score"],
                    "pain_score": pain_score,
                    "pain_categories": categories,
                })

        time.sleep(2.0)

    print(f"  ✅ Found {len(comment_insights)} pain-signal comments")
    return comment_insights


def run_mining(limit_per_search: int = 25) -> list[dict]:
    """Run all searches and collect results."""
    all_posts = []
    seen_ids = set()

    for i, search in enumerate(SEARCHES):
        sub = search["subreddit"]
        query = search["query"]
        label = search["label"]
        print(f"[{i+1}/{len(SEARCHES)}] r/{sub}: '{query}'")

        posts = fetch_reddit(sub, query, limit=limit_per_search)
        for post in posts:
            pid = post.get("id")
            if pid and pid not in seen_ids:
                seen_ids.add(pid)
                extracted = extract_post_data(post, label)
                if extracted["pain_score"] > 0 or extracted["pain_categories"]:
                    all_posts.append(extracted)

        # Rate limit: Reddit throttles unauthenticated requests aggressively
        time.sleep(2.0)

    return all_posts


def generate_summary(posts: list[dict]) -> dict:
    """Generate summary statistics."""
    country_counts = Counter(p["country_label"] for p in posts)
    category_counts = Counter()
    category_by_country = {}

    for p in posts:
        for cat in p["pain_categories"]:
            category_counts[cat] += 1
            key = f"{p['country_label']}_{cat}"
            category_by_country[key] = category_by_country.get(key, 0) + 1

    # Top pain posts by engagement
    top_posts = sorted(posts, key=lambda x: x["engagement"], reverse=True)[:20]

    # Posts with highest pain score
    most_painful = sorted(posts, key=lambda x: x["pain_score"], reverse=True)[:20]

    return {
        "total_posts": len(posts),
        "by_country": dict(country_counts),
        "by_category": dict(category_counts.most_common()),
        "by_country_category": category_by_country,
        "top_engaged_posts": [
            {"title": p["title"], "url": p["url"], "engagement": p["engagement"],
             "categories": p["pain_categories"], "country": p["country_label"]}
            for p in top_posts
        ],
        "most_painful_posts": [
            {"title": p["title"], "url": p["url"], "pain_score": p["pain_score"],
             "categories": p["pain_categories"], "country": p["country_label"]}
            for p in most_painful
        ],
    }


def save_results(posts: list[dict], summary: dict, output_dir: str = "."):
    """Save results to JSON and CSV."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Full data JSON
    json_path = os.path.join(output_dir, f"pain-mining-{timestamp}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({"summary": summary, "posts": posts}, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Full data saved: {json_path}")

    # CSV for quick review
    csv_path = os.path.join(output_dir, f"pain-mining-{timestamp}.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "country_label", "pain_score", "engagement", "pain_categories",
            "title", "subreddit", "date", "score", "num_comments", "url"
        ])
        writer.writeheader()
        for p in sorted(posts, key=lambda x: x["pain_score"], reverse=True):
            row = {**p, "pain_categories": "|".join(p["pain_categories"])}
            writer.writerow({k: row.get(k) for k in writer.fieldnames})
    print(f"✅ CSV saved: {csv_path}")

    # Print summary
    print(f"\n{'='*60}")
    print(f"📊 PAIN POINT MINING SUMMARY")
    print(f"{'='*60}")
    print(f"Total posts with pain signals: {summary['total_posts']}")
    print(f"\nBy country:")
    for country, count in summary["by_country"].items():
        print(f"  {country}: {count} posts")
    print(f"\nBy pain category (all countries):")
    for cat, count in summary["by_category"].items():
        print(f"  {cat}: {count} mentions")
    print(f"\n🔥 Top 10 most painful posts:")
    for i, p in enumerate(summary["most_painful_posts"][:10], 1):
        cats = ", ".join(p["categories"]) if p["categories"] else "uncategorized"
        print(f"  {i}. [{p['country']}] {p['title'][:80]}")
        print(f"     Pain score: {p['pain_score']} | Categories: {cats}")
        print(f"     {p['url']}")


# ── Main ───────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Reddit Pain Point Mining for LocalNomad")
    parser.add_argument("--limit", type=int, default=25, help="Posts per search (default: 25)")
    parser.add_argument("--output", type=str, default=".", help="Output directory")
    parser.add_argument("--comments", type=int, default=30, help="Mine comments from top N posts (0 to skip)")
    args = parser.parse_args()

    print("🔍 Starting Reddit Pain Point Mining...")
    print(f"   {len(SEARCHES)} searches × {args.limit} posts/search\n")

    posts = run_mining(limit_per_search=args.limit)

    # Comment mining pass
    comment_insights = []
    if args.comments > 0:
        comment_insights = mine_comments_from_top_posts(posts, top_n=args.comments)

    summary = generate_summary(posts)

    # Add comment insights to summary
    if comment_insights:
        comment_cats = Counter()
        for c in comment_insights:
            for cat in c["pain_categories"]:
                comment_cats[cat] += 1
        summary["comment_pain_categories"] = dict(comment_cats.most_common())
        summary["total_pain_comments"] = len(comment_insights)

    save_results(posts, summary, output_dir=args.output)

    # Save comments separately
    if comment_insights:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        comments_path = os.path.join(args.output, f"pain-comments-{timestamp}.json")
        with open(comments_path, "w", encoding="utf-8") as f:
            json.dump(comment_insights, f, ensure_ascii=False, indent=2)
        print(f"✅ Comment insights saved: {comments_path}")

    print(f"\n✅ Done! Review the CSV to identify patterns.")
    print(f"💡 Next step: Read the top 20 posts + comments manually and note recurring themes.")
