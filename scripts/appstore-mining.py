"""
App Store Review Mining for LocalNomad
======================================
Collects Google Play reviews for Korean life-essential apps.
Targets low-rating reviews + English-language reviews to find foreigner pain points.

Strategy:
  - For each app, collect:
    1. ALL 1-2 star reviews (any language) — these are pain points
    2. ALL English reviews (any rating) — these are likely foreigners
  - Auto-classify into pain categories using common/classify.py
  - Star rating = platform_sentiment (no NLP needed)

Dependencies:
  pip install google-play-scraper

Usage:
  python3 scripts/appstore-mining.py
  python3 scripts/appstore-mining.py --output docs/agent/reference --max-per-app 2000
  python3 scripts/appstore-mining.py --apps banking          # Only banking category
  python3 scripts/appstore-mining.py --apps banking,life     # Multiple categories
  python3 scripts/appstore-mining.py --dry-run               # Show config, don't fetch

Output:
  {output_dir}/appstore-{timestamp}.json   — Full PainRecord data
  {output_dir}/appstore-{timestamp}.csv    — Flat CSV for quick review
"""

from __future__ import annotations

import sys
import os
import re
import time
import argparse
from datetime import datetime
from collections import Counter

# Add scripts/ to path for common imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.schema import PainRecord, CollectionRun
from common.classify import classify_record
from common.io import save_records, save_progress, load_progress

try:
    from google_play_scraper import reviews, Sort
    from google_play_scraper.exceptions import NotFoundError
except ImportError:
    print("❌ Missing dependency: pip install google-play-scraper")
    sys.exit(1)


# ── App Configuration ─────────────────────────────────────────
# Organized by category so you can run subsets with --apps flag

APP_CONFIG = {
    "banking": {
        "com.kakaobank.channel": "카카오뱅크",
        "viva.republica.toss": "토스",
        "com.kebhana.hanapush": "하나원큐",
        "com.shinhan.sbanking": "신한SOL",
        "com.wooribank.smart.npib": "우리WON뱅킹",
        "com.kbstar.kbbank": "KB스타뱅킹",
    },
    "life": {
        "net.daum.android.map": "카카오맵",
        "com.nhn.android.nmap": "네이버맵",
        "com.sampleapp": "배달의민족",
        "com.coupang.mobile": "쿠팡",
        "com.towneers.www": "당근마켓",
    },
    "government": {
        "kr.go.minwon.m": "정부24",
        "kr.or.nhic": "The건강보험",
        "kr.go.nts.android": "손택스",
    },
    "telecom": {
        "com.ktshow.cs": "마이케이티(KT)",
        "com.sktelecom.minit": "T world(SKT)",
        "com.lguplus.mobile.cs": "U+one(LG)",
    },
}


# ── Core Functions ────────────────────────────────────────────

def fetch_reviews(
    app_id: str,
    app_name: str,
    max_reviews: int = 2000,
    lang: str = "en",
    country: str = "kr",
) -> list[dict]:
    """
    Fetch reviews for a single app.
    Uses continuation token for pagination.
    Returns raw review dicts from google-play-scraper.
    """
    all_reviews = []
    continuation_token = None

    while len(all_reviews) < max_reviews:
        batch_size = min(200, max_reviews - len(all_reviews))  # API max is 200 per call
        try:
            result, continuation_token = reviews(
                app_id,
                lang=lang,
                country=country,
                sort=Sort.NEWEST,
                count=batch_size,
                continuation_token=continuation_token,
            )
            if not result:
                break

            all_reviews.extend(result)
            print(f"    Fetched {len(all_reviews)} reviews so far...")

            if continuation_token is None:
                break

            time.sleep(1.0)  # Rate limit

        except NotFoundError:
            print(f"    ⚠ App not found: {app_id} ({app_name})")
            break
        except Exception as e:
            print(f"    ⚠ Error fetching {app_id}: {e}")
            break

    return all_reviews


def is_likely_english(text: str) -> bool:
    """Simple heuristic: if >60% of chars are ASCII letters, it's likely English."""
    if not text:
        return False
    ascii_letters = sum(1 for c in text if c.isascii() and c.isalpha())
    total_letters = sum(1 for c in text if c.isalpha())
    if total_letters == 0:
        return False
    return (ascii_letters / total_letters) > 0.6


def is_likely_korean(text: str) -> bool:
    """Check if text contains Korean characters."""
    return any('\uAC00' <= c <= '\uD7A3' for c in text)


def detect_lang(text: str) -> str:
    """Simple language detection without external deps."""
    if is_likely_korean(text):
        return "ko"
    if is_likely_english(text):
        return "en"
    # Check for Japanese
    if any('\u3040' <= c <= '\u309F' or '\u30A0' <= c <= '\u30FF' for c in text):
        return "ja"
    # Check for Chinese
    if any('\u4E00' <= c <= '\u9FFF' for c in text):
        return "zh"
    return "other"


def review_to_pain_record(
    review: dict,
    app_id: str,
    app_name: str,
    app_category: str,
) -> PainRecord:
    """Convert a raw google-play-scraper review to PainRecord."""
    text = review.get("content", "") or ""
    score = review.get("score", 3)  # 1-5 star rating

    # Classify
    cl = classify_record(text)

    # Star rating → sentiment (1 star = 0.0, 5 stars = 1.0)
    sentiment = (score - 1) / 4.0

    # Engagement: thumbsUp count
    engagement = review.get("thumbsUpCount", 0)

    # Date
    at = review.get("at")
    date_str = at.strftime("%Y-%m-%d") if at else "unknown"

    return PainRecord(
        source="appstore",
        text=text,
        date=date_str,
        categories=cl["categories"],
        wtp_signals=cl["wtp_signals"],
        segment_hints=cl["segment_hints"],
        platform_sentiment=sentiment,
        engagement=engagement,
        lang=detect_lang(text),
        country="korea",
        url=f"https://play.google.com/store/apps/details?id={app_id}",
        metadata={
            "app_id": app_id,
            "app_name": app_name,
            "app_category": app_category,
            "rating": score,
            "review_id": review.get("reviewId", ""),
            "reviewer": review.get("userName", ""),
        },
    )


# Keywords that indicate a Korean-language review was written by/about foreigners
FOREIGNER_KEYWORDS_KO = re.compile(
    r"외국인|외국\s*사람|외국\s*분|foreigner|expat|"
    r"체류|비자|visa|영어\s*지원|english|"
    r"외국\s*면허|외국\s*번호|해외\s*번호|"
    r"인증서.*외국|외국.*인증|"
    r"한국어\s*(?:못|안|어려)|"
    r"외국\s*카드|해외\s*카드|international\s*card",
    re.IGNORECASE
)


def should_include(review: dict) -> bool:
    """
    Filter for foreigner-relevant reviews only:
    - Non-Korean reviews (English, Japanese, Chinese, etc.) → include
    - Korean reviews → only if they contain foreigner-related keywords
    """
    text = review.get("content", "") or ""
    if len(text) < 10:
        return False

    # Non-Korean text → likely foreigner, include
    if not is_likely_korean(text):
        return True

    # Korean text → only include if foreigner keywords present
    if FOREIGNER_KEYWORDS_KO.search(text):
        return True

    return False


# ── Main Mining Function ──────────────────────────────────────

def mine_apps(
    categories: list[str] | None = None,
    max_per_app: int = 2000,
    output_dir: str = ".",
) -> list[PainRecord]:
    """
    Mine reviews from configured apps.

    For each app:
    1. Fetch English reviews (foreigners writing in English)
    2. Fetch Korean reviews (catch low-star from anyone)
    3. Deduplicate by review ID
    4. Filter for pain-relevant reviews
    5. Convert to PainRecord
    """
    run = CollectionRun(
        source="appstore",
        config={
            "categories": categories or list(APP_CONFIG.keys()),
            "max_per_app": max_per_app,
        },
    )

    # Resume from progress if available
    all_records = load_progress(output_dir, "appstore")
    processed_apps = set()
    if all_records:
        processed_apps = {r.metadata.get("app_id") for r in all_records}
        print(f"  Resuming: {len(processed_apps)} apps already done\n")

    # Build app list
    apps_to_mine = []
    for cat, apps in APP_CONFIG.items():
        if categories and cat not in categories:
            continue
        for app_id, app_name in apps.items():
            if app_id not in processed_apps:
                apps_to_mine.append((cat, app_id, app_name))

    total = len(apps_to_mine)
    print(f"📱 Mining {total} apps across {len(set(c for c, _, _ in apps_to_mine))} categories\n")

    for i, (cat, app_id, app_name) in enumerate(apps_to_mine):
        print(f"[{i+1}/{total}] {app_name} ({cat}) — {app_id}")

        seen_ids = set()
        raw_reviews = []

        # Fetch English reviews
        print(f"  📥 Fetching English reviews...")
        en_reviews = fetch_reviews(app_id, app_name, max_reviews=max_per_app, lang="en")
        for r in en_reviews:
            rid = r.get("reviewId", id(r))
            if rid not in seen_ids:
                seen_ids.add(rid)
                raw_reviews.append(r)

        # Fetch Korean reviews (only foreigner-keyword ones will pass filter)
        print(f"  📥 Fetching Korean reviews (filtering for foreigner keywords)...")
        ko_reviews = fetch_reviews(app_id, app_name, max_reviews=max_per_app, lang="ko")
        for r in ko_reviews:
            rid = r.get("reviewId", id(r))
            if rid not in seen_ids:
                seen_ids.add(rid)
                raw_reviews.append(r)

        # Filter
        relevant = [r for r in raw_reviews if should_include(r)]
        print(f"  🔍 {len(raw_reviews)} total → {len(relevant)} relevant")

        # Convert to PainRecord
        app_records = []
        for r in relevant:
            record = review_to_pain_record(r, app_id, app_name, cat)
            if record.text.strip():  # Skip empty reviews
                app_records.append(record)

        all_records.extend(app_records)
        print(f"  ✅ {len(app_records)} pain records")

        # Category summary for this app
        cats = Counter()
        for rec in app_records:
            for c in rec.categories:
                cats[c] += 1
        if cats:
            top3 = cats.most_common(3)
            print(f"  📊 Top categories: {', '.join(f'{c}({n})' for c, n in top3)}")

        # Incremental save every 3 apps
        if (i + 1) % 3 == 0:
            save_progress(all_records, output_dir, "appstore")
            print(f"  💾 Progress saved ({len(all_records)} total records)\n")
        else:
            print()

        time.sleep(2.0)  # Be polite between apps

    # Final save
    paths = save_records(all_records, output_dir, "appstore", run)

    # Print summary
    print_summary(all_records)

    return all_records


def print_summary(records: list[PainRecord]):
    """Print a human-readable summary of mining results."""
    print(f"\n{'='*60}")
    print(f"📊 APP STORE MINING SUMMARY")
    print(f"{'='*60}")
    print(f"Total pain records: {len(records)}")

    # By app
    app_counts = Counter(r.metadata.get("app_name", "?") for r in records)
    print(f"\nBy app:")
    for app, count in app_counts.most_common():
        print(f"  {app}: {count}")

    # By category
    cat_counts = Counter()
    for r in records:
        for c in r.categories:
            cat_counts[c] += 1
    print(f"\nBy pain category:")
    for cat, count in cat_counts.most_common():
        print(f"  {cat}: {count}")

    # By language
    lang_counts = Counter(r.lang for r in records)
    print(f"\nBy language:")
    for lang, count in lang_counts.most_common():
        print(f"  {lang}: {count}")

    # By rating
    rating_counts = Counter(r.metadata.get("rating", "?") for r in records)
    print(f"\nBy rating:")
    for rating in sorted(rating_counts.keys()):
        print(f"  {'⭐' * int(rating)} ({rating}): {rating_counts[rating]}")

    # WTP signals
    wtp_records = [r for r in records if r.wtp_signals]
    if wtp_records:
        print(f"\n💰 WTP signals found: {len(wtp_records)} records")
        for r in wtp_records[:5]:
            print(f"  [{r.metadata.get('app_name')}] {r.wtp_signals} — \"{r.text[:80]}...\"")

    # Segment hints
    seg_records = [r for r in records if r.segment_hints]
    if seg_records:
        print(f"\n👤 Segment hints found: {len(seg_records)} records")
        visa_counts = Counter(r.segment_hints.get("visa_type") for r in seg_records if r.segment_hints.get("visa_type"))
        if visa_counts:
            print(f"  Visa types mentioned: {dict(visa_counts)}")

    # Top high-engagement pain reviews
    top_eng = sorted(records, key=lambda r: r.engagement, reverse=True)[:10]
    print(f"\n🔥 Top 10 most-upvoted pain reviews:")
    for r in top_eng:
        rating = r.metadata.get("rating", "?")
        app = r.metadata.get("app_name", "?")
        print(f"  [{'⭐' * int(rating)}] {app} (👍{r.engagement}) — \"{r.text[:80]}...\"")
        if r.categories:
            print(f"       Categories: {', '.join(r.categories)}")


# ── CLI ───────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="App Store Pain Point Mining for LocalNomad")
    parser.add_argument("--output", type=str, default=".", help="Output directory (default: current)")
    parser.add_argument("--max-per-app", type=int, default=2000, help="Max reviews per app per language (default: 2000)")
    parser.add_argument("--apps", type=str, default=None,
                        help="App categories to mine (comma-separated: banking,life,government,telecom). Default: all")
    parser.add_argument("--dry-run", action="store_true", help="Show config without fetching")
    args = parser.parse_args()

    categories = args.apps.split(",") if args.apps else None

    if args.dry_run:
        print("🔍 DRY RUN — Config:\n")
        for cat, apps in APP_CONFIG.items():
            if categories and cat not in categories:
                continue
            print(f"  [{cat}]")
            for app_id, name in apps.items():
                print(f"    {name}: {app_id}")
        total_apps = sum(
            len(apps) for cat, apps in APP_CONFIG.items()
            if not categories or cat in categories
        )
        print(f"\n  Total: {total_apps} apps × {args.max_per_app} reviews/app × 2 languages")
        print(f"  Estimated time: ~{total_apps * 30}s ({total_apps * 30 / 60:.0f} min)")
        sys.exit(0)

    print("📱 App Store Pain Point Mining for LocalNomad")
    print(f"   Max {args.max_per_app} reviews per app per language")
    print(f"   Output: {args.output}\n")

    records = mine_apps(
        categories=categories,
        max_per_app=args.max_per_app,
        output_dir=args.output,
    )

    print(f"\n✅ Done! {len(records)} pain records collected.")
    print(f"💡 Next: Open the CSV, sort by engagement, and READ.")
