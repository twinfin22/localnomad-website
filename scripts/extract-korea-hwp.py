#!/usr/bin/env python3
"""Extract Korea visa data from LibreOffice-converted HTML files into SoT snapshots.

Usage:
  1. Convert HWP → HTML via LibreOffice:
     soffice --headless --convert-to html --outdir /tmp/hwp-html/ "docs/SoT/Korea/260310 사증민원..."
  2. Run this script:
     python3 scripts/extract-korea-hwp.py /tmp/hwp-html/

Output: docs/SoT/Korea/extracted/{visa-type}.md (9 files)
"""

import sys
import os
import re
from pathlib import Path
from html.parser import HTMLParser

# Project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = PROJECT_ROOT / "docs" / "SoT" / "Korea" / "extracted"

# Visa types and their Korean search terms
VISA_TYPES = {
    "b-2":   {"search": ["B-2", "관광통과", "사증면제"], "tier": "stable"},
    "d-8":   {"search": ["D-8", "기업투자"], "tier": "stable"},
    "d-10":  {"search": ["D-10", "구직"], "tier": "volatile"},
    "e-7":   {"search": ["E-7", "특정활동"], "tier": "stable"},
    "f-1-d": {"search": ["F-1-D", "워케이션", "F-1(D)"], "tier": "volatile"},
    "f-2":   {"search": ["F-2", "거주"], "tier": "stable"},
    "f-5":   {"search": ["F-5", "영주"], "tier": "stable"},
    "f-6":   {"search": ["F-6", "결혼이민"], "tier": "stable"},
    "h-1":   {"search": ["H-1", "관광취업", "워킹홀리데이"], "tier": "stable"},
}

# Field extraction patterns (Korean terms → snapshot fields)
FIELD_PATTERNS = {
    "income": [r"소득요건", r"연간소득", r"GNI", r"국민총소득", r"소득금액"],
    "duration_initial": [r"체류기간", r"1회.*부여"],
    "duration_max": [r"체류상한", r"최장.*체류"],
    "fees": [r"수수료", r"신청비"],
    "eligibility": [r"자격요건", r"신청자격", r"대상자"],
    "documents": [r"첨부서류", r"구비서류", r"제출서류"],
    "processing": [r"처리기간", r"심사기간"],
    "work_permission": [r"취업활동", r"활동범위", r"취업.*가능", r"근로.*허용"],
    "family": [r"동반", r"가족", r"피부양", r"배우자"],
}


class HTMLTextExtractor(HTMLParser):
    """Extract text from HTML preserving some structure."""

    def __init__(self):
        super().__init__()
        self.result = []
        self.current_tag = None
        self.in_table = False
        self.table_row = []
        self.tables = []
        self.current_table = []

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        if tag == "table":
            self.in_table = True
            self.current_table = []
        elif tag == "tr":
            self.table_row = []
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self.result.append(f"\n### ")
        elif tag == "br":
            self.result.append("\n")
        elif tag == "p":
            self.result.append("\n")

    def handle_endtag(self, tag):
        if tag == "table":
            self.in_table = False
            self.tables.append(self.current_table)
            self.current_table = []
        elif tag == "tr" and self.in_table:
            self.current_table.append(self.table_row)
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self.result.append("\n")

    def handle_data(self, data):
        text = data.strip()
        if not text:
            return
        if self.in_table:
            self.table_row.append(text)
        else:
            self.result.append(text)

    def get_text(self):
        return " ".join(self.result)

    def get_full_text(self):
        """Get all text including table content."""
        parts = list(self.result)
        for table in self.tables:
            for row in table:
                parts.append(" | ".join(row))
        return "\n".join(parts)


def extract_text_from_html(html_path: str) -> str:
    """Read HTML file and extract text."""
    with open(html_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    parser = HTMLTextExtractor()
    parser.feed(content)
    return parser.get_full_text()


def find_visa_section(full_text: str, visa_type: str, search_terms: list[str]) -> str:
    """Find the section of text relevant to a specific visa type."""
    lines = full_text.split("\n")
    section_lines = []
    capturing = False
    capture_count = 0

    for i, line in enumerate(lines):
        # Check if this line starts a new visa section
        is_visa_header = any(term in line for term in search_terms)

        if is_visa_header and not capturing:
            capturing = True
            capture_count = 0
            section_lines.append(line)
            continue

        if capturing:
            # Stop capturing if we hit another visa type header (e.g., "B-1", "D-2")
            other_visa = re.search(r'\b[A-Z]-\d+[A-Z]?\b', line)
            if other_visa and capture_count > 5:
                matched = other_visa.group()
                # Don't stop if it's our own visa type
                if not any(matched.startswith(t.split("(")[0]) for t in search_terms):
                    break

            section_lines.append(line)
            capture_count += 1

            # Safety limit
            if capture_count > 500:
                break

    return "\n".join(section_lines)


def extract_field(section_text: str, patterns: list[str], context_lines: int = 5) -> str:
    """Extract field value by finding Korean pattern and grabbing surrounding context."""
    lines = section_text.split("\n")
    for pattern in patterns:
        for i, line in enumerate(lines):
            if re.search(pattern, line):
                # Grab this line and next few lines as context
                end = min(i + context_lines + 1, len(lines))
                context = "\n".join(lines[i:end]).strip()
                return context
    return ""


def generate_snapshot(visa_type: str, config: dict, sections: dict[str, str]) -> str:
    """Generate a markdown snapshot file from extracted sections."""
    # Combine all sections for this visa
    combined = "\n\n".join(s for s in sections.values() if s)

    if not combined.strip():
        return ""

    # Extract individual fields
    income_raw = extract_field(combined, FIELD_PATTERNS["income"])
    duration_raw = extract_field(combined, FIELD_PATTERNS["duration_initial"])
    duration_max_raw = extract_field(combined, FIELD_PATTERNS["duration_max"])
    fees_raw = extract_field(combined, FIELD_PATTERNS["fees"])
    eligibility_raw = extract_field(combined, FIELD_PATTERNS["eligibility"], context_lines=10)
    work_raw = extract_field(combined, FIELD_PATTERNS["work_permission"])
    family_raw = extract_field(combined, FIELD_PATTERNS["family"])

    # Parse income amount if found
    income_amount = "not specified in source"
    income_currency = "KRW"
    if income_raw:
        # Look for numbers like 88,102,000 or 31,120,000
        amount_match = re.search(r'[\d,]+,\d{3}', income_raw)
        if amount_match:
            income_amount = amount_match.group()

    # Parse duration
    duration_initial = "not specified in source"
    if duration_raw:
        # Look for patterns like "1년", "2년", "3년", "90일"
        dur_match = re.search(r'(\d+)\s*년', duration_raw)
        if dur_match:
            duration_initial = f"{dur_match.group(1)} year(s)"
        dur_match_days = re.search(r'(\d+)\s*일', duration_raw)
        if dur_match_days:
            duration_initial = f"{dur_match_days.group(1)} days"

    duration_max = "not specified in source"
    if duration_max_raw:
        dur_max_match = re.search(r'(\d+)\s*년', duration_max_raw)
        if dur_max_match:
            duration_max = f"{dur_max_match.group(1)} years maximum"

    snapshot = f"""---
visa_type: {visa_type}
country: korea
source_urls:
  - https://visa.go.kr
  - https://law.go.kr
last_extracted: 2026-03-25
extraction_method: libreoffice-html
next_review: 2026-04-25
freshness_tier: {config['tier']}
---

## Income Requirement
- amount: {income_amount}
- currency: {income_currency}
- period: annual

## Duration
- initial: {duration_initial}
- extension: not specified in source
- max_total: {duration_max}

## Fees
- application: not specified in source
- extension: not specified in source

## Eligibility
- employer_sponsorship: not specified in source
- education: not specified in source
- experience: not specified in source

## Processing Time
- total: not specified in source

## Key Policy Details
- work_permission: not specified in source
- family_allowed: not specified in source
- dependent_visa: not specified in source

## Raw Extracted Text (for manual review)

### Income/Financial
{income_raw if income_raw else "(no match found)"}

### Duration
{duration_raw if duration_raw else "(no match found)"}
{duration_max_raw if duration_max_raw else ""}

### Eligibility
{eligibility_raw if eligibility_raw else "(no match found)"}

### Work Permission
{work_raw if work_raw else "(no match found)"}

### Family/Dependents
{family_raw if family_raw else "(no match found)"}
"""
    return snapshot.strip() + "\n"


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/extract-korea-hwp.py <html-dir>")
        print("  html-dir: directory containing LibreOffice-converted HTML files")
        sys.exit(1)

    html_dir = Path(sys.argv[1])
    if not html_dir.exists():
        print(f"Error: {html_dir} does not exist")
        sys.exit(1)

    # Find HTML files
    html_files = list(html_dir.glob("*.html"))
    if not html_files:
        print(f"Error: No HTML files found in {html_dir}")
        sys.exit(1)

    print(f"Found {len(html_files)} HTML file(s):")
    for f in html_files:
        size = f.stat().st_size
        print(f"  {f.name} ({size:,} bytes)")

    # Extract text from all HTML files
    all_texts = {}
    for html_file in html_files:
        name = html_file.stem
        print(f"\nExtracting text from {html_file.name}...")
        text = extract_text_from_html(str(html_file))
        all_texts[name] = text
        print(f"  → {len(text):,} characters extracted")

    # Process each visa type
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    created = 0
    skipped = 0

    for visa_type, config in VISA_TYPES.items():
        print(f"\nProcessing {visa_type}...")
        sections = {}

        for name, text in all_texts.items():
            section = find_visa_section(text, visa_type, config["search"])
            if section.strip():
                sections[name] = section
                print(f"  Found in {name}: {len(section):,} chars")

        if not sections:
            print(f"  ⚠️  No content found for {visa_type}")
            skipped += 1
            continue

        snapshot = generate_snapshot(visa_type, config, sections)
        if not snapshot:
            print(f"  ⚠️  Empty snapshot for {visa_type}")
            skipped += 1
            continue

        output_path = OUTPUT_DIR / f"{visa_type}.md"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(snapshot)
        print(f"  ✅ Written to {output_path.relative_to(PROJECT_ROOT)}")
        created += 1

    print(f"\n{'='*50}")
    print(f"Summary: {created} created, {skipped} skipped")
    print(f"Output: {OUTPUT_DIR.relative_to(PROJECT_ROOT)}/")
    print(f"\nNext: Review 'Raw Extracted Text' sections and fill in structured fields manually.")
    print(f"Then run: node --experimental-strip-types scripts/visa-fact-check.ts --country korea")


if __name__ == "__main__":
    main()
