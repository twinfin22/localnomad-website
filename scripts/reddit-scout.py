#!/usr/bin/env python3
"""
Reddit Scout — CLI tool for karma opportunity discovery
=========================================================
Thin wrapper over scripts/common/fetch.py Reddit utilities.
Used by the /reddit-karma skill to find and fetch Reddit threads.

Usage:
  python3 scripts/reddit-scout.py discover "digital nomad korea"
  python3 scripts/reddit-scout.py search digitalnomad "korea visa" --time week --limit 10
  python3 scripts/reddit-scout.py thread "/r/digitalnomad/comments/abc123/some_post/"

All output is JSON to stdout. Errors are JSON {"error": "message"} to stdout.
Warnings go to stderr.
"""

import argparse
import json
import sys
import os

# Add project root to path so we can import from scripts/common/
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.fetch import (
    RateLimiter,
    reddit_search,
    reddit_comments,
    reddit_subreddit_search,
    reddit_top_posts,
    FetchError,
    fetch_json,
)
from urllib.parse import quote_plus

rate_limiter = RateLimiter(min_delay=2.0)


def cmd_discover(args):
    """Find subreddits matching a topic query."""
    results = reddit_subreddit_search(
        args.query,
        limit=args.limit,
        rate_limiter=rate_limiter,
    )
    print(json.dumps(results, ensure_ascii=False, indent=2))


def cmd_search(args):
    """Search a subreddit for threads matching a query."""
    posts = reddit_search(
        args.subreddit,
        args.query,
        limit=args.limit,
        sort=args.sort,
        time_filter=args.time,
        rate_limiter=rate_limiter,
    )

    results = []
    for p in posts:
        created = p.get("created_utc", 0)
        results.append({
            "id": p.get("id", ""),
            "title": p.get("title", ""),
            "score": p.get("score", 0),
            "num_comments": p.get("num_comments", 0),
            "created_utc": created,
            "url": f"https://reddit.com{p.get('permalink', '')}",
            "permalink": p.get("permalink", ""),
            "selftext_preview": p.get("selftext", "")[:300],
            "author": p.get("author", ""),
        })
    print(json.dumps(results, ensure_ascii=False, indent=2))


def cmd_thread(args):
    """Fetch a thread's post body and top comments."""
    permalink = args.permalink

    # Fetch the post itself
    safe_permalink = quote_plus(permalink, safe="/")
    url = f"https://www.reddit.com{safe_permalink}.json?limit=50&sort=top&depth=2"

    try:
        data = fetch_json(url, rate_limiter=rate_limiter)
    except FetchError as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        return

    if not isinstance(data, list) or len(data) < 1:
        print(json.dumps({"error": "Unexpected response format"}, ensure_ascii=False))
        return

    # Extract post
    post_children = data[0].get("data", {}).get("children", [])
    post = {}
    if post_children and post_children[0].get("kind") == "t3":
        pd = post_children[0]["data"]
        post = {
            "title": pd.get("title", ""),
            "selftext": pd.get("selftext", "")[:3000],
            "score": pd.get("score", 0),
            "author": pd.get("author", ""),
            "num_comments": pd.get("num_comments", 0),
            "created_utc": pd.get("created_utc", 0),
            "subreddit": pd.get("subreddit", ""),
            "url": f"https://reddit.com{pd.get('permalink', '')}",
        }

    # Extract comments
    comments = reddit_comments(permalink, limit=50, sort="top", depth=2, rate_limiter=rate_limiter)

    result = {"post": post, "comments": comments}
    print(json.dumps(result, ensure_ascii=False, indent=2))


def cmd_hot(args):
    """Fetch hot/rising posts from a subreddit."""
    listing = args.listing  # hot, new, rising
    url = f"https://www.reddit.com/r/{args.subreddit}/{listing}.json?limit={args.limit}"

    try:
        data = fetch_json(url, rate_limiter=rate_limiter)
    except FetchError as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        return

    posts = data.get("data", {}).get("children", [])
    results = []
    for p in posts:
        if p.get("kind") != "t3":
            continue
        pd = p["data"]
        results.append({
            "id": pd.get("id", ""),
            "title": pd.get("title", ""),
            "score": pd.get("score", 0),
            "num_comments": pd.get("num_comments", 0),
            "created_utc": pd.get("created_utc", 0),
            "url": f"https://reddit.com{pd.get('permalink', '')}",
            "permalink": pd.get("permalink", ""),
            "selftext_preview": pd.get("selftext", "")[:300],
        })
    print(json.dumps(results, ensure_ascii=False, indent=2))


def main():
    parser = argparse.ArgumentParser(
        description="Reddit Scout — find karma opportunities for LocalNomad"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # discover
    p_discover = subparsers.add_parser("discover", help="Find subreddits matching a topic")
    p_discover.add_argument("query", help="Topic to search for")
    p_discover.add_argument("--limit", type=int, default=10, help="Max results (default: 10)")

    # search
    p_search = subparsers.add_parser("search", help="Search a subreddit for threads")
    p_search.add_argument("subreddit", help="Subreddit name (without r/)")
    p_search.add_argument("query", help="Search query")
    p_search.add_argument("--sort", default="relevance", choices=["relevance", "new", "top", "comments"])
    p_search.add_argument("--time", default="week", choices=["hour", "day", "week", "month", "year", "all"])
    p_search.add_argument("--limit", type=int, default=10, help="Max results (default: 10)")

    # thread
    p_thread = subparsers.add_parser("thread", help="Fetch a thread's post and comments")
    p_thread.add_argument("permalink", help="Reddit permalink (e.g., /r/sub/comments/id/slug/)")

    # hot/new/rising
    p_hot = subparsers.add_parser("hot", help="Fetch hot/new/rising posts from a subreddit")
    p_hot.add_argument("subreddit", help="Subreddit name (without r/)")
    p_hot.add_argument("--listing", default="hot", choices=["hot", "new", "rising"])
    p_hot.add_argument("--limit", type=int, default=10, help="Max results (default: 10)")

    args = parser.parse_args()

    try:
        if args.command == "discover":
            cmd_discover(args)
        elif args.command == "search":
            cmd_search(args)
        elif args.command == "thread":
            cmd_thread(args)
        elif args.command == "hot":
            cmd_hot(args)
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(1)


if __name__ == "__main__":
    main()
