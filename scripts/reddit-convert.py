"""
Reddit Data Converter for LocalNomad
=====================================
Converts existing Reddit script outputs (pain-mining, discover, megathreads)
into unified PainRecord format for cross-source analysis.

Does NOT re-fetch data. Reads existing JSON files and re-classifies
with the improved classify.py (expanded categories, WTP tiers, segment hints).

Also adds:
- Time-based filtering (recent 2 years vs all)
- Segment hint extraction from post/comment text
- Depth-aware comment handling

Usage:
  python3 scripts/reddit-convert.py --input docs/agent/reference
  python3 scripts/reddit-convert.py --input docs/agent/reference --output docs/agent/reference --recent-only
  python3 scripts/reddit-convert.py --input . --files pain-mining-20260307.json discover-raw-20260307.json

Output:
  {output_dir}/reddit-{timestamp}.json   — Unified PainRecord data
  {output_dir}/reddit-{timestamp}.csv    — Flat CSV
"""

from __future__ import annotations

import sys
import os
import json
import glob
import argparse
from datetime import datetime, timedelta
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.schema import PainRecord, CollectionRun
from common.classify import classify_record
from common.io import save_records


# ── Detect file type by structure ─────────────────────────────

def detect_format(data) -> str:
    """Detect which Reddit script produced this JSON."""
    if isinstance(data, dict):
        if "summary" in data and "posts" in data:
            return "pain-mining"
    if isinstance(data, list) and len(data) > 0:
        sample = data[0]
        if "comments" in sample and "query_used" in sample:
            return "discover"
        if "comments" in sample and "engagement" in sample:
            return "megathreads"
    return "unknown"


# ── Converters ────────────────────────────────────────────────

def convert_pain_mining(data: dict, recent_cutoff: str | None = None) -> list[PainRecord]:
    """Convert pain-mining.py output → PainRecord[]."""
    records = []
    posts = data.get("posts", [])

    for p in posts:
        date = p.get("date", "unknown")
        if recent_cutoff and date < recent_cutoff:
            continue

        text = f"{p.get('title', '')} {p.get('body_preview', '')}"
        cl = classify_record(text)

        # Normalize engagement: score + 2*comments (same as original)
        engagement = p.get("engagement", p.get("score", 0) + p.get("num_comments", 0) * 2)

        records.append(PainRecord(
            source="reddit",
            text=text[:3000],
            date=date,
            categories=cl["categories"],
            wtp_signals=cl["wtp_signals"],
            segment_hints=cl["segment_hints"],
            platform_sentiment=0.5,  # Reddit has no star rating
            engagement=engagement,
            lang="en",
            country=p.get("country_label", "korea"),
            url=p.get("url", ""),
            metadata={
                "subreddit": p.get("subreddit", ""),
                "post_id": p.get("id", ""),
                "is_comment": False,
                "original_pain_score": p.get("pain_score", 0),
                "reddit_script": "pain-mining",
            },
        ))

    return records


def convert_discover(data: list[dict], recent_cutoff: str | None = None) -> list[PainRecord]:
    """Convert discover.py output → PainRecord[]."""
    records = []

    for thread in data:
        date = thread.get("date", "unknown")
        if recent_cutoff and date < recent_cutoff:
            continue

        country = thread.get("country", "korea")
        subreddit = thread.get("subreddit", "")
        post_url = thread.get("url", "")

        # Post itself
        post_text = f"{thread.get('title', '')} {thread.get('post_body', '')}"
        cl = classify_record(post_text)
        if cl["categories"] or cl["wtp_signals"]:
            records.append(PainRecord(
                source="reddit",
                text=post_text[:3000],
                date=date,
                categories=cl["categories"],
                wtp_signals=cl["wtp_signals"],
                segment_hints=cl["segment_hints"],
                platform_sentiment=0.5,
                engagement=thread.get("post_score", 0) + thread.get("num_comments", 0) * 2,
                lang="en",
                country=country,
                url=post_url,
                metadata={
                    "subreddit": subreddit,
                    "post_id": thread.get("post_id", ""),
                    "is_comment": False,
                    "reddit_script": "discover",
                },
            ))

        # Comments
        for c in thread.get("comments", []):
            body = c.get("body", "")
            if len(body) < 15:
                continue
            cl = classify_record(body)
            if cl["categories"] or cl["wtp_signals"]:
                records.append(PainRecord(
                    source="reddit",
                    text=body[:3000],
                    date=date,
                    categories=cl["categories"],
                    wtp_signals=cl["wtp_signals"],
                    segment_hints=cl["segment_hints"],
                    platform_sentiment=0.5,
                    engagement=c.get("score", 0),
                    lang="en",
                    country=country,
                    url=post_url,
                    metadata={
                        "subreddit": subreddit,
                        "post_id": thread.get("post_id", ""),
                        "is_comment": True,
                        "comment_score": c.get("score", 0),
                        "reddit_script": "discover",
                    },
                ))

    return records


def convert_megathreads(data: list[dict], recent_cutoff: str | None = None) -> list[PainRecord]:
    """Convert megathreads.py output → PainRecord[]."""
    # Same structure as discover — threads with comments
    return convert_discover(data, recent_cutoff)


# ── Main ──────────────────────────────────────────────────────

def convert_all(
    input_dir: str,
    output_dir: str,
    recent_only: bool = False,
    specific_files: list[str] | None = None,
) -> list[PainRecord]:
    """
    Find all Reddit JSON outputs in input_dir, convert to PainRecord.
    """
    run = CollectionRun(
        source="reddit",
        config={
            "input_dir": input_dir,
            "recent_only": recent_only,
            "specific_files": specific_files,
        },
    )

    recent_cutoff = None
    if recent_only:
        cutoff_date = datetime.now() - timedelta(days=365 * 2)
        recent_cutoff = cutoff_date.strftime("%Y-%m-%d")
        print(f"  📅 Recent-only mode: filtering posts after {recent_cutoff}\n")

    # Find JSON files
    if specific_files:
        json_files = [os.path.join(input_dir, f) for f in specific_files]
    else:
        json_files = sorted(glob.glob(os.path.join(input_dir, "*.json")))
        # Filter for Reddit outputs only
        json_files = [
            f for f in json_files
            if any(prefix in os.path.basename(f) for prefix in
                   ["pain-mining", "discover-raw", "megathreads-", "pain-comments"])
            and "-meta" not in f
            and "-progress" not in f
        ]

    if not json_files:
        print(f"  ⚠ No Reddit JSON files found in {input_dir}")
        print(f"  Looking for: pain-mining-*.json, discover-raw-*.json, megathreads-*.json")
        return []

    print(f"📂 Found {len(json_files)} Reddit data files\n")

    all_records = []

    for fpath in json_files:
        fname = os.path.basename(fpath)
        print(f"  📄 {fname}")

        try:
            with open(fpath, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"    ⚠ Error reading {fname}: {e}")
            continue

        fmt = detect_format(data)
        print(f"    Format: {fmt}")

        if fmt == "pain-mining":
            records = convert_pain_mining(data, recent_cutoff)
        elif fmt == "discover":
            records = convert_discover(data, recent_cutoff)
        elif fmt == "megathreads":
            records = convert_megathreads(data, recent_cutoff)
        else:
            print(f"    ⚠ Unknown format, skipping")
            continue

        print(f"    → {len(records)} pain records")
        all_records.extend(records)

    # Deduplicate by URL + text hash
    seen = set()
    unique_records = []
    for r in all_records:
        key = (r.url, hash(r.text[:200]))
        if key not in seen:
            seen.add(key)
            unique_records.append(r)

    deduped = len(all_records) - len(unique_records)
    if deduped > 0:
        print(f"\n  🔄 Deduplicated: {len(all_records)} → {len(unique_records)} ({deduped} removed)")

    all_records = unique_records

    # Save
    if all_records:
        paths = save_records(all_records, output_dir, "reddit", run)
        print_summary(all_records)

    return all_records


def print_summary(records: list[PainRecord]):
    """Print summary."""
    print(f"\n{'='*60}")
    print(f"📊 REDDIT CONVERSION SUMMARY")
    print(f"{'='*60}")
    print(f"Total pain records: {len(records)}")

    # Posts vs comments
    posts = sum(1 for r in records if not r.metadata.get("is_comment"))
    comments = sum(1 for r in records if r.metadata.get("is_comment"))
    print(f"  Posts: {posts}, Comments: {comments}")

    # By country
    country_counts = Counter(r.country for r in records)
    print(f"\nBy country:")
    for country, count in country_counts.most_common():
        print(f"  {country}: {count}")

    # By category
    cat_counts = Counter()
    for r in records:
        for c in r.categories:
            cat_counts[c] += 1
    print(f"\nBy pain category:")
    for cat, count in cat_counts.most_common():
        print(f"  {cat}: {count}")

    # By source script
    script_counts = Counter(r.metadata.get("reddit_script", "?") for r in records)
    print(f"\nBy source script:")
    for script, count in script_counts.most_common():
        print(f"  {script}: {count}")

    # WTP
    wtp = [r for r in records if r.wtp_signals]
    print(f"\n💰 WTP signals: {len(wtp)} records")

    # Segments
    seg = [r for r in records if r.segment_hints]
    print(f"👤 Segment hints: {len(seg)} records")
    visa_counts = Counter(r.segment_hints.get("visa_type") for r in seg if r.segment_hints.get("visa_type"))
    if visa_counts:
        print(f"  Visa types: {dict(visa_counts)}")

    # Top engagement
    top = sorted(records, key=lambda r: r.engagement, reverse=True)[:5]
    print(f"\n🔥 Top 5 engagement:")
    for r in top:
        cats = ", ".join(r.categories[:3]) if r.categories else "none"
        print(f"  eng={r.engagement} [{r.country}] ({cats}) \"{r.text[:80]}...\"")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert Reddit data to unified PainRecord format")
    parser.add_argument("--input", type=str, required=True, help="Directory with Reddit JSON files")
    parser.add_argument("--output", type=str, default=None, help="Output directory (default: same as input)")
    parser.add_argument("--recent-only", action="store_true", help="Only include posts from last 2 years")
    parser.add_argument("--files", nargs="+", default=None, help="Specific files to convert")
    args = parser.parse_args()

    output_dir = args.output or args.input

    print("🔄 Reddit → PainRecord Converter")
    print(f"   Input: {args.input}")
    print(f"   Output: {output_dir}\n")

    records = convert_all(
        input_dir=args.input,
        output_dir=output_dir,
        recent_only=args.recent_only,
        specific_files=args.files,
    )

    if records:
        print(f"\n✅ Done! {len(records)} records converted.")
    else:
        print(f"\n⚠ No records converted. Check that Reddit JSON files exist in {args.input}")
