"""
Unified Pain Point Analysis for LocalNomad
==========================================
Reads all PainRecord JSON files from all sources and produces
cross-source analysis.

Outputs:
  1. Category × Source cross-tab (is Reddit's #1 also App Store's #1?)
  2. WTP signal heatmap (which categories have money behind them?)
  3. Segment breakdown (who's hurting most?)
  4. Time trends (what's getting worse?)
  5. Source-unique pain points (what only shows up in one source?)

Usage:
  python3 scripts/analyze.py --input docs/agent/reference
  python3 scripts/analyze.py --input docs/agent/reference --output docs/agent/reports
  python3 scripts/analyze.py --input docs/agent/reference --format md    # Markdown report
  python3 scripts/analyze.py --input docs/agent/reference --format csv   # CSV tables
"""

from __future__ import annotations

import sys
import os
import json
import csv
import argparse
from datetime import datetime
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.io import load_all_records
from common.schema import PainRecord


# ── Analysis Functions ────────────────────────────────────────

def category_source_crosstab(records: list[PainRecord]) -> dict:
    """Category × Source cross-tabulation."""
    sources = sorted(set(r.source for r in records))
    categories = Counter()
    crosstab = defaultdict(lambda: Counter())

    for r in records:
        for cat in r.categories:
            categories[cat] += 1
            crosstab[cat][r.source] += 1

    # Sort by total count
    ranked = categories.most_common()
    return {
        "sources": sources,
        "ranked": ranked,
        "crosstab": {cat: dict(crosstab[cat]) for cat, _ in ranked},
    }


def wtp_analysis(records: list[PainRecord]) -> dict:
    """WTP signal analysis by category and tier."""
    wtp_records = [r for r in records if r.wtp_signals]

    # WTP by category
    wtp_by_cat = Counter()
    for r in wtp_records:
        for cat in r.categories:
            wtp_by_cat[cat] += 1

    # WTP by source
    wtp_by_source = Counter(r.source for r in wtp_records)

    # WTP tier breakdown (from _wtp_tiers in metadata if available)
    tier_counts = Counter()
    for r in wtp_records:
        # Tiers aren't stored in PainRecord directly, re-extract
        from common.classify import extract_wtp_signals
        signals = extract_wtp_signals(r.text)
        for s in signals:
            tier_counts[s["tier"]] += 1

    # Top WTP quotes
    top_wtp = sorted(wtp_records, key=lambda r: r.engagement, reverse=True)[:20]

    return {
        "total_wtp": len(wtp_records),
        "wtp_rate": len(wtp_records) / len(records) * 100 if records else 0,
        "by_category": dict(wtp_by_cat.most_common()),
        "by_source": dict(wtp_by_source),
        "by_tier": dict(tier_counts),
        "top_quotes": [
            {
                "source": r.source,
                "text": r.text[:200],
                "categories": r.categories,
                "wtp_signals": r.wtp_signals,
                "engagement": r.engagement,
            }
            for r in top_wtp
        ],
    }


def segment_analysis(records: list[PainRecord]) -> dict:
    """Segment hint analysis."""
    seg_records = [r for r in records if r.segment_hints]

    dims = {
        "visa_type": Counter(),
        "nationality": Counter(),
        "tenure": Counter(),
        "role": Counter(),
    }
    for r in seg_records:
        for dim, counter in dims.items():
            val = r.segment_hints.get(dim)
            if val:
                counter[val] += 1

    # Pain by segment (visa_type × category)
    visa_pain = defaultdict(Counter)
    for r in seg_records:
        visa = r.segment_hints.get("visa_type")
        if visa:
            for cat in r.categories:
                visa_pain[visa][cat] += 1

    return {
        "total_with_hints": len(seg_records),
        "hint_rate": len(seg_records) / len(records) * 100 if records else 0,
        "dimensions": {dim: dict(counter.most_common(15)) for dim, counter in dims.items()},
        "visa_pain_matrix": {visa: dict(cats.most_common(5)) for visa, cats in visa_pain.items()},
    }


def time_analysis(records: list[PainRecord]) -> dict:
    """Time-based analysis — what's trending?"""
    # Group by year-month
    monthly = defaultdict(lambda: Counter())
    for r in records:
        if r.date and r.date != "unknown" and len(r.date) >= 7:
            ym = r.date[:7]  # "2025-01"
            for cat in r.categories:
                monthly[ym][cat] += 1

    # Recent vs old comparison
    cutoff = (datetime.now().replace(year=datetime.now().year - 1)).strftime("%Y-%m")
    recent_cats = Counter()
    old_cats = Counter()
    for ym, cats in monthly.items():
        if ym >= cutoff:
            recent_cats += cats
        else:
            old_cats += cats

    # Rising: categories with higher recent share
    rising = {}
    all_cats = set(list(recent_cats.keys()) + list(old_cats.keys()))
    recent_total = sum(recent_cats.values()) or 1
    old_total = sum(old_cats.values()) or 1

    for cat in all_cats:
        recent_pct = recent_cats.get(cat, 0) / recent_total * 100
        old_pct = old_cats.get(cat, 0) / old_total * 100
        change = recent_pct - old_pct
        if abs(change) > 1:  # Only significant changes
            rising[cat] = {
                "recent_pct": round(recent_pct, 1),
                "old_pct": round(old_pct, 1),
                "change": round(change, 1),
                "direction": "📈" if change > 0 else "📉",
            }

    return {
        "monthly": {ym: dict(cats) for ym, cats in sorted(monthly.items())},
        "rising": dict(sorted(rising.items(), key=lambda x: abs(x[1]["change"]), reverse=True)),
    }


def source_unique_analysis(records: list[PainRecord]) -> dict:
    """Find pain points unique to each source."""
    source_cats = defaultdict(set)
    for r in records:
        for cat in r.categories:
            source_cats[r.source].add(cat)

    sources = list(source_cats.keys())
    unique = {}
    for src in sources:
        other_cats = set()
        for other_src in sources:
            if other_src != src:
                other_cats |= source_cats[other_src]
        unique_cats = source_cats[src] - other_cats
        if unique_cats:
            unique[src] = list(unique_cats)

    # Categories that appear in ALL sources (validated pain points)
    universal = set.intersection(*source_cats.values()) if source_cats else set()

    return {
        "source_categories": {src: sorted(cats) for src, cats in source_cats.items()},
        "unique_to_source": unique,
        "universal": sorted(universal),
    }


# ── Report Generation ─────────────────────────────────────────

def generate_report(records: list[PainRecord], output_dir: str, fmt: str = "md"):
    """Generate analysis report."""
    print(f"\n{'='*60}")
    print(f"📊 UNIFIED PAIN POINT ANALYSIS")
    print(f"{'='*60}")
    print(f"Total records: {len(records)}")
    print(f"Sources: {Counter(r.source for r in records)}")
    print()

    # Run analyses
    crosstab = category_source_crosstab(records)
    wtp = wtp_analysis(records)
    segments = segment_analysis(records)
    trends = time_analysis(records)
    unique = source_unique_analysis(records)

    # Print to console
    _print_crosstab(crosstab)
    _print_wtp(wtp)
    _print_segments(segments)
    _print_trends(trends)
    _print_unique(unique)

    # Save report
    os.makedirs(output_dir, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")

    if fmt == "md" or fmt == "all":
        md_path = os.path.join(output_dir, f"pain-analysis-{ts}.md")
        _save_markdown_report(md_path, records, crosstab, wtp, segments, trends, unique)
        print(f"\n✅ Markdown report: {md_path}")

    if fmt == "csv" or fmt == "all":
        csv_path = os.path.join(output_dir, f"pain-analysis-crosstab-{ts}.csv")
        _save_crosstab_csv(csv_path, crosstab)
        print(f"✅ Crosstab CSV: {csv_path}")

    # Always save raw analysis JSON
    json_path = os.path.join(output_dir, f"pain-analysis-{ts}.json")
    analysis = {
        "generated_at": datetime.now().isoformat(),
        "total_records": len(records),
        "source_counts": dict(Counter(r.source for r in records)),
        "crosstab": crosstab,
        "wtp": {k: v for k, v in wtp.items() if k != "top_quotes"},
        "wtp_top_quotes": wtp["top_quotes"],
        "segments": segments,
        "trends": trends,
        "source_unique": unique,
    }
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(analysis, f, ensure_ascii=False, indent=2)
    print(f"✅ Analysis JSON: {json_path}")


def _print_crosstab(data: dict):
    print(f"\n{'─'*60}")
    print(f"1. CATEGORY × SOURCE CROSS-TAB")
    print(f"{'─'*60}")
    sources = data["sources"]
    header = f"{'Category':<20}" + "".join(f"{s:>12}" for s in sources) + f"{'TOTAL':>10}"
    print(header)
    print("─" * len(header))
    for cat, total in data["ranked"]:
        row = f"{cat:<20}"
        for src in sources:
            count = data["crosstab"][cat].get(src, 0)
            row += f"{count:>12}"
        row += f"{total:>10}"
        print(row)


def _print_wtp(data: dict):
    print(f"\n{'─'*60}")
    print(f"2. WTP (WILLINGNESS TO PAY) SIGNALS")
    print(f"{'─'*60}")
    print(f"Total WTP records: {data['total_wtp']} ({data['wtp_rate']:.1f}% of all)")
    print(f"\nBy tier: {data['by_tier']}")
    print(f"By source: {data['by_source']}")
    print(f"\nWTP by category:")
    for cat, count in data["by_category"].items():
        print(f"  {cat}: {count}")
    print(f"\nTop WTP quotes:")
    for q in data["top_quotes"][:5]:
        print(f"  [{q['source']}] (eng={q['engagement']}) {q['wtp_signals']}")
        print(f"    \"{q['text'][:100]}...\"")


def _print_segments(data: dict):
    print(f"\n{'─'*60}")
    print(f"3. SEGMENT ANALYSIS")
    print(f"{'─'*60}")
    print(f"Records with segment hints: {data['total_with_hints']} ({data['hint_rate']:.1f}%)")
    for dim, counts in data["dimensions"].items():
        if counts:
            print(f"\n  {dim}: {counts}")
    if data["visa_pain_matrix"]:
        print(f"\nVisa type × Pain category:")
        for visa, cats in data["visa_pain_matrix"].items():
            print(f"  {visa}: {cats}")


def _print_trends(data: dict):
    print(f"\n{'─'*60}")
    print(f"4. TIME TRENDS")
    print(f"{'─'*60}")
    if data["rising"]:
        print("Rising/falling categories (recent vs older):")
        for cat, info in data["rising"].items():
            print(f"  {info['direction']} {cat}: {info['old_pct']}% → {info['recent_pct']}% ({info['change']:+.1f}pp)")
    else:
        print("  Not enough temporal data for trend analysis.")


def _print_unique(data: dict):
    print(f"\n{'─'*60}")
    print(f"5. SOURCE UNIQUENESS")
    print(f"{'─'*60}")
    print(f"Universal pain points (all sources): {data['universal']}")
    if data["unique_to_source"]:
        print(f"Unique to single source:")
        for src, cats in data["unique_to_source"].items():
            print(f"  {src}: {cats}")


def _save_markdown_report(
    path: str, records, crosstab, wtp, segments, trends, unique
):
    """Save analysis as markdown."""
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"# Pain Point Analysis Report\n\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
        f.write(f"Total records: **{len(records)}** across {len(set(r.source for r in records))} sources\n\n")

        # Source breakdown
        f.write(f"## Source Breakdown\n\n")
        for src, count in Counter(r.source for r in records).most_common():
            f.write(f"- **{src}**: {count} records\n")

        # Crosstab
        f.write(f"\n## Pain Categories by Source\n\n")
        sources = crosstab["sources"]
        f.write(f"| Category |" + "|".join(f" {s} " for s in sources) + "| Total |\n")
        f.write(f"|----------|" + "|".join("-----:" for _ in sources) + "|------:|\n")
        for cat, total in crosstab["ranked"]:
            row = f"| {cat} |"
            for src in sources:
                count = crosstab["crosstab"][cat].get(src, 0)
                row += f" {count} |"
            row += f" **{total}** |"
            f.write(row + "\n")

        # WTP
        f.write(f"\n## WTP Signals\n\n")
        f.write(f"- Total: **{wtp['total_wtp']}** ({wtp['wtp_rate']:.1f}%)\n")
        f.write(f"- By tier: {wtp['by_tier']}\n")
        f.write(f"- By category: {wtp['by_category']}\n")

        # Segments
        f.write(f"\n## Segment Hints\n\n")
        for dim, counts in segments["dimensions"].items():
            if counts:
                f.write(f"- **{dim}**: {counts}\n")

        # Trends
        f.write(f"\n## Time Trends\n\n")
        if trends["rising"]:
            for cat, info in trends["rising"].items():
                f.write(f"- {info['direction']} **{cat}**: {info['old_pct']}% → {info['recent_pct']}% ({info['change']:+.1f}pp)\n")

        # Universal
        f.write(f"\n## Cross-Source Validation\n\n")
        f.write(f"Pain points confirmed across ALL sources: **{', '.join(unique['universal'])}**\n")


def _save_crosstab_csv(path: str, crosstab: dict):
    """Save crosstab as CSV."""
    sources = crosstab["sources"]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["category"] + sources + ["total"])
        for cat, total in crosstab["ranked"]:
            row = [cat] + [crosstab["crosstab"][cat].get(src, 0) for src in sources] + [total]
            writer.writerow(row)


# ── CLI ───────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Unified Pain Point Analysis")
    parser.add_argument("--input", type=str, required=True, help="Directory with PainRecord JSON files")
    parser.add_argument("--output", type=str, default=None, help="Output directory for reports (default: same as input)")
    parser.add_argument("--format", type=str, default="all", choices=["md", "csv", "all"],
                        help="Report format (default: all)")
    parser.add_argument("--sources", type=str, default=None,
                        help="Filter by source: reddit,appstore,youtube,naver_blog (default: all)")
    args = parser.parse_args()

    output_dir = args.output or args.input
    sources = args.sources.split(",") if args.sources else None

    print("📊 Unified Pain Point Analysis")
    print(f"   Input: {args.input}")
    print(f"   Output: {output_dir}\n")

    records = load_all_records(args.input, sources=sources)

    if not records:
        print("⚠ No PainRecord files found. Run the mining scripts first.")
        sys.exit(1)

    generate_report(records, output_dir, fmt=args.format)
    print(f"\n✅ Analysis complete!")
