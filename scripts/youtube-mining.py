"""
YouTube Comment Mining for LocalNomad
=====================================
Keyword-based video search → high-engagement filter → comment collection.
No pre-selected channels. Finds pain points from any creator's content.

Strategy:
  1. Search YouTube for videos matching pain-relevant keywords
  2. Filter: views >= 10K, comments >= 100, duration >= 5min
  3. Collect comments + replies (depth 2)
  4. High-like comments = high-agreement pain points

Quota budget (10,000 units/day free):
  - search.list = 100 units/call (50 results max)
  - commentThreads.list = 1 unit/call (100 results max)
  - videos.list = 1 unit/call (50 results max)
  → ~90 searches + ~5000 comment pages per day

Dependencies:
  pip3 install google-api-python-client

Usage:
  export YOUTUBE_API_KEY="AIzaSy..."
  python3 scripts/youtube-mining.py
  python3 scripts/youtube-mining.py --output docs/agent/reference --max-videos 200
  python3 scripts/youtube-mining.py --keywords negative    # Only negative/departure keywords
  python3 scripts/youtube-mining.py --keywords practical   # Only practical pain keywords
  python3 scripts/youtube-mining.py --dry-run              # Show config, don't fetch

Output:
  {output_dir}/youtube-{timestamp}.json
  {output_dir}/youtube-{timestamp}.csv
"""

from __future__ import annotations

import sys
import os
import re
import time
import argparse
from datetime import datetime, timedelta
from collections import Counter
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.schema import PainRecord, CollectionRun
from common.classify import classify_record
from common.io import save_records, save_progress, load_progress

try:
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    print("❌ Missing dependency: pip3 install google-api-python-client")
    sys.exit(1)


# ── Keyword Configuration ─────────────────────────────────────
# Three categories of search keywords, as discussed with Gen.
# No pre-selected channels — pure keyword search.

KEYWORD_GROUPS = {
    "negative": [
        "why I left Korea",
        "leaving Korea",
        "worst things about living in Korea",
        "things I hate about Korea",
        "regret moving to Korea",
        "Korea culture shock",
        "struggling in Korea",
        "Korea is not what I expected",
        "dark side of living in Korea",
    ],
    "practical": [
        "foreigner problems Korea",
        "opening bank account Korea foreigner",
        "finding apartment Korea foreigner",
        "Korea visa problems",
        "Korean healthcare foreigner",
        "working in Korea as foreigner",
        "discrimination in Korea foreigner",
        "lonely in Korea foreigner",
    ],
    "honest": [
        "honest review living Korea",
        "things nobody tells you Korea",
        "reality of living in Korea",
        "Korea vs Japan living foreigner",
        "what I wish I knew before moving Korea",
    ],
}

# ── Video Filter Thresholds ──────────────────────────────────

MIN_VIEW_COUNT = 10_000
MIN_COMMENT_COUNT = 50       # Lowered from 100 — many good videos have 50-100 comments
MIN_DURATION_SECONDS = 300   # 5 minutes (skip shorts)
MAX_VIDEO_AGE_DAYS = 365 * 3  # Last 3 years


# ── Core Functions ────────────────────────────────────────────

def get_youtube_client(api_key: str):
    """Build YouTube API client."""
    return build("youtube", "v3", developerKey=api_key)


def search_videos(
    youtube,
    query: str,
    max_results: int = 50,
    published_after: Optional[str] = None,
) -> list[dict]:
    """
    Search for videos. Returns list of video IDs + basic info.
    Cost: 100 units per call.
    """
    try:
        params = {
            "q": query,
            "part": "snippet",
            "type": "video",
            "maxResults": min(max_results, 50),
            "order": "relevance",
            "relevanceLanguage": "en",
            "regionCode": "KR",
        }
        if published_after:
            params["publishedAfter"] = published_after

        response = youtube.search().list(**params).execute()
        return response.get("items", [])

    except HttpError as e:
        if e.resp.status == 403:
            print(f"    ⚠ Quota exceeded or API key invalid: {e}")
            return []
        raise


def get_video_details(youtube, video_ids: list[str]) -> dict[str, dict]:
    """
    Get video statistics (views, comments, duration).
    Cost: 1 unit per call (up to 50 videos).
    """
    if not video_ids:
        return {}

    try:
        response = youtube.videos().list(
            part="statistics,contentDetails,snippet",
            id=",".join(video_ids[:50]),
        ).execute()

        results = {}
        for item in response.get("items", []):
            vid = item["id"]
            stats = item.get("statistics", {})
            details = item.get("contentDetails", {})
            snippet = item.get("snippet", {})

            results[vid] = {
                "title": snippet.get("title", ""),
                "channel": snippet.get("channelTitle", ""),
                "published_at": snippet.get("publishedAt", ""),
                "view_count": int(stats.get("viewCount", 0)),
                "comment_count": int(stats.get("commentCount", 0)),
                "like_count": int(stats.get("likeCount", 0)),
                "duration": _parse_duration(details.get("duration", "PT0S")),
            }
        return results

    except HttpError as e:
        print(f"    ⚠ Error fetching video details: {e}")
        return {}


def _parse_duration(duration_str: str) -> int:
    """Parse ISO 8601 duration (PT1H2M3S) to seconds."""
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration_str)
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds


def passes_filter(video: dict) -> bool:
    """Check if a video meets our quality thresholds."""
    return (
        video["view_count"] >= MIN_VIEW_COUNT
        and video["comment_count"] >= MIN_COMMENT_COUNT
        and video["duration"] >= MIN_DURATION_SECONDS
    )


def fetch_comments(
    youtube,
    video_id: str,
    max_comments: int = 500,
) -> list[dict]:
    """
    Fetch top-level comments + replies for a video.
    Cost: 1 unit per page (100 comments per page).
    Returns list of {text, like_count, author, is_reply, parent_text}.
    """
    comments = []
    next_page = None

    while len(comments) < max_comments:
        try:
            response = youtube.commentThreads().list(
                part="snippet,replies",
                videoId=video_id,
                maxResults=100,
                order="relevance",  # Most relevant (liked) first
                pageToken=next_page,
                textFormat="plainText",
            ).execute()

            for item in response.get("items", []):
                # Top-level comment
                top = item["snippet"]["topLevelComment"]["snippet"]
                top_text = top.get("textDisplay", "")
                top_likes = top.get("likeCount", 0)

                comments.append({
                    "text": top_text,
                    "like_count": top_likes,
                    "author": top.get("authorDisplayName", ""),
                    "is_reply": False,
                    "parent_text": "",
                })

                # Replies (depth 2)
                if "replies" in item:
                    for reply in item["replies"]["comments"]:
                        r = reply["snippet"]
                        comments.append({
                            "text": r.get("textDisplay", ""),
                            "like_count": r.get("likeCount", 0),
                            "author": r.get("authorDisplayName", ""),
                            "is_reply": True,
                            "parent_text": top_text[:200],
                        })

            next_page = response.get("nextPageToken")
            if not next_page:
                break

            time.sleep(0.5)

        except HttpError as e:
            if e.resp.status == 403:
                if "commentsDisabled" in str(e):
                    print(f"    💬 Comments disabled for {video_id}")
                else:
                    print(f"    ⚠ Quota/access error: {e}")
                break
            raise

    return comments


def comment_to_pain_record(
    comment: dict,
    video: dict,
    video_id: str,
    search_query: str,
) -> PainRecord:
    """Convert a YouTube comment to PainRecord."""
    text = comment["text"]
    cl = classify_record(text)

    # Like count as engagement
    engagement = comment["like_count"]

    # No star rating on YouTube — use like ratio as weak sentiment proxy
    # High likes on a negative comment = strong agreement with pain
    # We set sentiment to 0.5 (neutral) since we can't determine polarity from likes alone
    sentiment = 0.5

    # Date from video publish (comment date not available without extra API call)
    pub = video.get("published_at", "")
    date_str = pub[:10] if pub else "unknown"

    return PainRecord(
        source="youtube",
        text=text[:3000],
        date=date_str,
        categories=cl["categories"],
        wtp_signals=cl["wtp_signals"],
        segment_hints=cl["segment_hints"],
        platform_sentiment=sentiment,
        engagement=engagement,
        lang="en",  # We search in English; non-English comments still captured
        country="korea",
        url=f"https://youtube.com/watch?v={video_id}",
        metadata={
            "video_id": video_id,
            "video_title": video["title"],
            "channel": video["channel"],
            "view_count": video["view_count"],
            "is_reply": comment["is_reply"],
            "parent_text": comment.get("parent_text", "")[:200],
            "search_query": search_query,
        },
    )


# ── Main Mining Function ──────────────────────────────────────

def mine_youtube(
    api_key: str,
    keyword_groups: list[str] | None = None,
    max_videos: int = 300,
    max_comments_per_video: int = 500,
    output_dir: str = ".",
) -> list[PainRecord]:
    """
    Full pipeline:
    1. Search videos by keyword
    2. Get details + filter by engagement
    3. Collect comments from qualifying videos
    4. Classify and save
    """
    youtube = get_youtube_client(api_key)
    run = CollectionRun(
        source="youtube",
        config={
            "keyword_groups": keyword_groups or list(KEYWORD_GROUPS.keys()),
            "max_videos": max_videos,
            "max_comments_per_video": max_comments_per_video,
        },
    )

    # Resume support
    all_records = load_progress(output_dir, "youtube")
    processed_videos = set()
    if all_records:
        processed_videos = {r.metadata.get("video_id") for r in all_records}
        print(f"  Resuming: {len(processed_videos)} videos already done\n")

    # Date filter: last 3 years
    after_date = (datetime.now() - timedelta(days=MAX_VIDEO_AGE_DAYS)).strftime("%Y-%m-%dT00:00:00Z")

    # Build keyword list
    keywords = []
    for group, kws in KEYWORD_GROUPS.items():
        if keyword_groups and group not in keyword_groups:
            continue
        keywords.extend([(kw, group) for kw in kws])

    # Step 1: Search for videos
    print(f"🔍 Searching {len(keywords)} keywords...\n")
    candidate_videos: dict[str, str] = {}  # video_id → search_query
    quota_used = 0

    for i, (kw, group) in enumerate(keywords):
        print(f"  [{i+1}/{len(keywords)}] [{group}] \"{kw}\"")
        results = search_videos(youtube, kw, max_results=50, published_after=after_date)
        quota_used += 100

        new_count = 0
        for item in results:
            vid = item["id"]["videoId"]
            if vid not in candidate_videos and vid not in processed_videos:
                candidate_videos[vid] = kw
                new_count += 1

        print(f"    → {len(results)} results, {new_count} new")

        if len(candidate_videos) >= max_videos:
            print(f"\n  Reached max {max_videos} candidate videos, stopping search.")
            break

        time.sleep(1.0)  # Rate limit between searches

    print(f"\n📊 {len(candidate_videos)} unique candidate videos (quota used: ~{quota_used})")

    # Step 2: Get video details and filter
    print(f"\n📹 Fetching video details...")
    video_ids = list(candidate_videos.keys())
    video_details = {}

    for batch_start in range(0, len(video_ids), 50):
        batch = video_ids[batch_start:batch_start + 50]
        details = get_video_details(youtube, batch)
        video_details.update(details)
        quota_used += 1
        time.sleep(0.5)

    # Filter
    qualifying = {vid: details for vid, details in video_details.items() if passes_filter(details)}
    print(f"  {len(video_details)} checked → {len(qualifying)} pass filter")
    print(f"  Filter: views >= {MIN_VIEW_COUNT:,}, comments >= {MIN_COMMENT_COUNT}, duration >= {MIN_DURATION_SECONDS//60}min")

    # Sort by comment count (more comments = more pain data)
    sorted_videos = sorted(qualifying.items(), key=lambda x: x[1]["comment_count"], reverse=True)

    # Step 3: Collect comments
    print(f"\n💬 Collecting comments from {len(sorted_videos)} videos...\n")

    for i, (vid, video) in enumerate(sorted_videos):
        query = candidate_videos.get(vid, "")
        print(f"  [{i+1}/{len(sorted_videos)}] {video['title'][:60]}")
        print(f"    👁 {video['view_count']:,} views | 💬 {video['comment_count']:,} comments | 📺 {video['channel']}")

        comments = fetch_comments(youtube, vid, max_comments=max_comments_per_video)
        quota_used += (len(comments) // 100) + 1

        # Convert to PainRecords
        video_records = []
        for c in comments:
            text = c["text"]
            if len(text) < 15:
                continue
            record = comment_to_pain_record(c, video, vid, query)
            if record.categories or record.wtp_signals:  # Only keep classified comments
                video_records.append(record)

        all_records.extend(video_records)
        print(f"    ✅ {len(comments)} comments → {len(video_records)} pain records")

        # Progress save every 5 videos
        if (i + 1) % 5 == 0:
            save_progress(all_records, output_dir, "youtube")
            print(f"    💾 Progress saved ({len(all_records)} total)\n")

        # Quota check
        if quota_used > 9000:
            print(f"\n  ⚠ Approaching daily quota limit (~{quota_used} used). Stopping.")
            print(f"  Re-run tomorrow to continue. Progress is saved.")
            break

        time.sleep(1.0)

    # Final save
    paths = save_records(all_records, output_dir, "youtube", run)
    print(f"\n  Estimated quota used: ~{quota_used}")

    # Summary
    print_summary(all_records)

    return all_records


def print_summary(records: list[PainRecord]):
    """Print summary of YouTube mining results."""
    print(f"\n{'='*60}")
    print(f"📊 YOUTUBE MINING SUMMARY")
    print(f"{'='*60}")
    print(f"Total pain records: {len(records)}")

    # By category
    cat_counts = Counter()
    for r in records:
        for c in r.categories:
            cat_counts[c] += 1
    print(f"\nBy pain category:")
    for cat, count in cat_counts.most_common():
        print(f"  {cat}: {count}")

    # By video (top sources)
    video_counts = Counter(r.metadata.get("video_title", "?")[:50] for r in records)
    print(f"\nTop 10 videos by pain records:")
    for title, count in video_counts.most_common(10):
        print(f"  {count:4d} — {title}")

    # Top high-engagement comments
    top_eng = sorted(records, key=lambda r: r.engagement, reverse=True)[:10]
    print(f"\n🔥 Top 10 most-liked pain comments:")
    for r in top_eng:
        vid_title = r.metadata.get("video_title", "?")[:40]
        print(f"  👍{r.engagement:4d} [{vid_title}]")
        print(f"       \"{r.text[:100]}...\"")
        if r.categories:
            print(f"       Categories: {', '.join(r.categories)}")

    # WTP signals
    wtp_records = [r for r in records if r.wtp_signals]
    if wtp_records:
        print(f"\n💰 WTP signals: {len(wtp_records)} comments")
        for r in wtp_records[:5]:
            print(f"  {r.wtp_signals} — \"{r.text[:80]}...\"")

    # Reply analysis: "same here" pattern
    replies = [r for r in records if r.metadata.get("is_reply")]
    print(f"\nReplies collected: {len(replies)} (these often contain 'same here' validation)")


# ── CLI ───────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="YouTube Comment Mining for LocalNomad")
    parser.add_argument("--output", type=str, default=".", help="Output directory")
    parser.add_argument("--max-videos", type=int, default=300, help="Max videos to process (default: 300)")
    parser.add_argument("--max-comments", type=int, default=500, help="Max comments per video (default: 500)")
    parser.add_argument("--keywords", type=str, default=None,
                        help="Keyword groups: negative,practical,honest (default: all)")
    parser.add_argument("--dry-run", action="store_true", help="Show config without fetching")
    args = parser.parse_args()

    # API key
    api_key = os.environ.get("YOUTUBE_API_KEY")
    if not api_key and not args.dry_run:
        print("❌ Set YOUTUBE_API_KEY environment variable:")
        print("   export YOUTUBE_API_KEY=\"AIzaSy...\"")
        sys.exit(1)

    keyword_groups = args.keywords.split(",") if args.keywords else None

    if args.dry_run:
        print("🔍 DRY RUN — Config:\n")
        total_kw = 0
        for group, kws in KEYWORD_GROUPS.items():
            if keyword_groups and group not in keyword_groups:
                continue
            print(f"  [{group}] ({len(kws)} keywords)")
            for kw in kws:
                print(f"    \"{kw}\"")
            total_kw += len(kws)
        print(f"\n  Total: {total_kw} keywords")
        print(f"  Max videos: {args.max_videos}")
        print(f"  Max comments/video: {args.max_comments}")
        print(f"  Estimated quota: ~{total_kw * 100 + args.max_videos * 6} units")
        print(f"  Estimated time: ~{total_kw * 2 + args.max_videos * 3}s ({(total_kw * 2 + args.max_videos * 3) / 60:.0f} min)")
        sys.exit(0)

    print("📺 YouTube Comment Mining for LocalNomad")
    print(f"   Max {args.max_videos} videos, {args.max_comments} comments each")
    print(f"   Output: {args.output}\n")

    records = mine_youtube(
        api_key=api_key,
        keyword_groups=keyword_groups,
        max_videos=args.max_videos,
        max_comments_per_video=args.max_comments,
        output_dir=args.output,
    )

    print(f"\n✅ Done! {len(records)} pain records collected.")
    print(f"💡 Next: Open the CSV, sort by engagement, and READ.")
