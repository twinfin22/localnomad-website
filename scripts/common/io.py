"""
I/O Utilities
=============
Standardized save/load for all mining scripts.
Every script outputs the same file structure:

  {output_dir}/
    {source}-{timestamp}.json       # Full PainRecord[] data
    {source}-{timestamp}.csv        # Flat CSV for quick review
    {source}-{timestamp}-meta.json  # CollectionRun metadata
    {source}-progress.json          # Incremental save (deleted on completion)
"""

from __future__ import annotations

import csv
import json
import os
from datetime import datetime
from typing import Optional

from .schema import PainRecord, CollectionRun


def make_output_dir(path: str) -> str:
    """Create output directory if it doesn't exist. Returns the path."""
    os.makedirs(path, exist_ok=True)
    return path


def timestamp() -> str:
    """Current timestamp for filenames."""
    return datetime.now().strftime("%Y%m%d_%H%M%S")


# ── Save ──────────────────────────────────────────────────────

def save_records(
    records: list[PainRecord],
    output_dir: str,
    source: str,
    run: Optional[CollectionRun] = None,
) -> dict[str, str]:
    """
    Save PainRecords to JSON + CSV. Returns dict of file paths.
    """
    make_output_dir(output_dir)
    ts = timestamp()
    paths = {}

    # JSON — full data
    json_path = os.path.join(output_dir, f"{source}-{ts}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump([r.to_dict() for r in records], f, ensure_ascii=False, indent=2)
    paths["json"] = json_path
    print(f"  ✅ JSON saved: {json_path} ({len(records)} records)")

    # CSV — flat for quick review
    csv_path = os.path.join(output_dir, f"{source}-{ts}.csv")
    _save_csv(records, csv_path)
    paths["csv"] = csv_path
    print(f"  ✅ CSV saved: {csv_path}")

    # Meta — collection run info
    if run:
        run.finish(len(records))
        meta_path = os.path.join(output_dir, f"{source}-{ts}-meta.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(run.to_dict(), f, ensure_ascii=False, indent=2)
        paths["meta"] = meta_path

    # Clean up progress file
    progress_path = os.path.join(output_dir, f"{source}-progress.json")
    if os.path.exists(progress_path):
        os.remove(progress_path)
        print(f"  🧹 Cleaned up progress file")

    return paths


def _save_csv(records: list[PainRecord], path: str):
    """Save records as flat CSV."""
    fieldnames = [
        "source", "country", "lang", "date", "categories", "wtp_signals",
        "platform_sentiment", "engagement", "segment_hints",
        "text_preview", "url",
    ]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in records:
            writer.writerow({
                "source": r.source,
                "country": r.country,
                "lang": r.lang,
                "date": r.date,
                "categories": "|".join(r.categories),
                "wtp_signals": "|".join(r.wtp_signals),
                "platform_sentiment": f"{r.platform_sentiment:.2f}",
                "engagement": r.engagement,
                "segment_hints": json.dumps(r.segment_hints, ensure_ascii=False) if r.segment_hints else "",
                "text_preview": r.text[:300].replace("\n", " "),
                "url": r.url,
            })


# ── Incremental Save ─────────────────────────────────────────

def save_progress(
    records: list[PainRecord],
    output_dir: str,
    source: str,
):
    """Save progress incrementally. Called periodically during long runs."""
    make_output_dir(output_dir)
    path = os.path.join(output_dir, f"{source}-progress.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump([r.to_dict() for r in records], f, ensure_ascii=False)


def load_progress(output_dir: str, source: str) -> list[PainRecord]:
    """Load progress from a previous interrupted run."""
    path = os.path.join(output_dir, f"{source}-progress.json")
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"  📂 Resuming from progress file: {len(data)} records")
    return [PainRecord.from_dict(d) for d in data]


# ── Load ──────────────────────────────────────────────────────

def load_records(path: str) -> list[PainRecord]:
    """Load PainRecords from a JSON file (any source)."""
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [PainRecord.from_dict(d) for d in data]


def load_all_records(output_dir: str, sources: Optional[list[str]] = None) -> list[PainRecord]:
    """
    Load all PainRecord JSON files from output_dir.
    Optionally filter by source prefix.
    Used by Phase 4 unified analysis.

    Only loads files matching known PainRecord sources:
      appstore-*.json, youtube-*.json, reddit-*.json, naver_blog-*.json
    Skips legacy Reddit raw files (discover-*, megathreads-*, pain-*).
    """
    # Known PainRecord file prefixes (from our pipeline)
    KNOWN_SOURCES = ["appstore-", "youtube-", "reddit-", "naver_blog-"]

    records = []
    skipped = []
    for fname in sorted(os.listdir(output_dir)):
        if not fname.endswith(".json"):
            continue
        if fname.endswith("-meta.json") or fname.endswith("-progress.json"):
            continue

        # Only load files from known sources
        if not any(fname.startswith(prefix) for prefix in KNOWN_SOURCES):
            skipped.append(fname)
            continue

        if sources:
            if not any(fname.startswith(s) for s in sources):
                continue

        path = os.path.join(output_dir, fname)
        try:
            loaded = load_records(path)
            records.extend(loaded)
            print(f"  ✅ {fname}: {len(loaded)} records")
        except (json.JSONDecodeError, KeyError, TypeError, ValueError) as e:
            print(f"  ⚠ Skipping {fname}: {e}")

    if skipped:
        print(f"  ℹ Skipped {len(skipped)} non-PainRecord files: {', '.join(skipped[:5])}")
    print(f"  📊 Loaded {len(records)} total records from {output_dir}")
    return records
