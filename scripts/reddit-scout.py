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
  python3 scripts/reddit-scout.py hot digitalnomad --listing rising --limit 5
  python3 scripts/reddit-scout.py index

All output is JSON to stdout. Errors are JSON {"error": "message"} to stdout.
Warnings go to stderr.
"""

import argparse
import glob
import json
import os
import re
import sys

# Add project root to path so we can import from scripts/common/
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.fetch import (
    RateLimiter,
    reddit_search,
    reddit_subreddit_search,
    reddit_thread,
    reddit_listing,
)

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
        results.append({
            "id": p.get("id", ""),
            "title": p.get("title", ""),
            "score": p.get("score", 0),
            "num_comments": p.get("num_comments", 0),
            "created_utc": p.get("created_utc", 0),
            "url": f"https://reddit.com{p.get('permalink', '')}",
            "permalink": p.get("permalink", ""),
            "selftext_preview": p.get("selftext", "")[:300],
            "author": p.get("author", ""),
        })
    print(json.dumps(results, ensure_ascii=False, indent=2))


def cmd_thread(args):
    """Fetch a thread's post body and top comments in a single API call."""
    result = reddit_thread(
        args.permalink,
        comment_limit=50,
        comment_sort="top",
        comment_depth=2,
        rate_limiter=rate_limiter,
    )
    if not result["post"]:
        print(json.dumps({"error": f"Could not fetch thread: {args.permalink}"}, ensure_ascii=False))
        return
    print(json.dumps(result, ensure_ascii=False, indent=2))


def cmd_hot(args):
    """Fetch hot/new/rising posts from a subreddit."""
    posts = reddit_listing(
        args.subreddit,
        args.listing,
        limit=args.limit,
        rate_limiter=rate_limiter,
    )

    results = []
    for pd in posts:
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


def cmd_index(_args):
    """Build a topic index from blog frontmatter for scout query generation."""
    project_root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
    blog_dir = os.path.join(project_root, 'content', 'blog')

    mdx_files = glob.glob(os.path.join(blog_dir, '**', '*.mdx'), recursive=True)
    posts = []

    for fpath in sorted(mdx_files):
        with open(fpath) as f:
            content = f.read()

        # Parse YAML frontmatter between --- markers
        fm_match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
        if not fm_match:
            continue

        fm_text = fm_match.group(1)
        entry = {
            "slug": os.path.splitext(os.path.basename(fpath))[0],
            "category": os.path.basename(os.path.dirname(fpath)),
            "path": os.path.relpath(fpath, project_root),
        }

        for line in fm_text.split('\n'):
            line = line.strip()
            if line.startswith('title:'):
                entry["title"] = line[6:].strip().strip('"').strip("'")
            elif line.startswith('country:'):
                entry["country"] = line[8:].strip().strip('"').strip("'")
            elif line.startswith('tags:'):
                # Handle inline [tag1, tag2] or start of list
                tag_match = re.search(r'\[(.+)\]', line)
                if tag_match:
                    entry["tags"] = [t.strip().strip('"').strip("'") for t in tag_match.group(1).split(',')]
            elif line.startswith('draft:'):
                val = line[6:].strip()
                if val == 'true':
                    entry["draft"] = True

        if entry.get("draft"):
            continue

        posts.append(entry)

    print(json.dumps(posts, ensure_ascii=False, indent=2))


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

    # index
    subparsers.add_parser("index", help="Build topic index from blog frontmatter")

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
        elif args.command == "index":
            cmd_index(args)
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(1)


if __name__ == "__main__":
    main()
