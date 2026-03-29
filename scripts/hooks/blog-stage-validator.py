#!/usr/bin/env python3
"""
PostToolUse:Write hook — Blog pipeline stage output validator.

Validates stage2/3/4 output JSONs against their schemas (basic Python check).
PostToolUse hooks cannot block — warnings go to stderr, always exits 0.
"""

import json
import os
import re
import sys
from pathlib import Path

SCHEMA_BASE = Path("~/.claude/plugins/localnomad-blog-plugin/contracts").expanduser()

STAGE_SCHEMAS = {
    2: SCHEMA_BASE / "stage2-output.schema.json",
    3: SCHEMA_BASE / "stage3-output.schema.json",
    4: SCHEMA_BASE / "stage4-output.schema.json",
}

# Required fields per stage (top-level)
STAGE_REQUIRED = {
    2: [
        "primaryKeyword",
        "secondaryKeywords",
        "selectedHeadline",
        "outline",
        "unsplashKeywords",
        "internalLinkTargets",
        "wordCountEstimate",
        "category",
        "country",
        "targetAudience",
        "keyMessages",
    ],
    3: [
        "draftFilePath",
        "slug",
        "frontmatter",
        "actualWordCount",
        "sectionsWritten",
    ],
    4: [
        "layerReports",
        "overallResult",
        "fixesApplied",
        "timestamp",
    ],
}

# Frontmatter required fields (stage 3 nested check)
FRONTMATTER_REQUIRED = [
    "title",
    "description",
    "category",
    "country",
    "date",
    "author",
    "tags",
    "draft",
    "coverImage",
    "readingTime",
]

VALID_CATEGORIES = {"guides", "updates", "tips", "comparisons", "news", "stories"}
VALID_COUNTRIES = {"korea", "japan", "china", "taiwan", "sea", "global"}
VALID_OVERALL_RESULT = {"PASS", "FAIL"}


def warn(msg: str) -> None:
    print(msg, file=sys.stderr)


def validate_stage2(data: dict) -> list[str]:
    errors = []
    # category enum
    cat = data.get("category")
    if cat and cat not in VALID_CATEGORIES:
        errors.append(f"category '{cat}' not in {sorted(VALID_CATEGORIES)}")
    # country enum
    country = data.get("country")
    if country and country not in VALID_COUNTRIES:
        errors.append(f"country '{country}' not in {sorted(VALID_COUNTRIES)}")
    # wordCountEstimate shape
    wce = data.get("wordCountEstimate")
    if wce is not None:
        if not isinstance(wce, dict):
            errors.append("wordCountEstimate must be an object")
        else:
            for k in ("min", "max"):
                if k not in wce:
                    errors.append(f"wordCountEstimate missing '{k}'")
    return errors


def validate_stage3(data: dict) -> list[str]:
    errors = []
    fm = data.get("frontmatter")
    if fm is None:
        errors.append("frontmatter field is missing")
        return errors
    if not isinstance(fm, dict):
        errors.append("frontmatter must be an object")
        return errors
    # nested required fields
    for field in FRONTMATTER_REQUIRED:
        if field not in fm:
            errors.append(f"frontmatter missing required field '{field}'")
    # enum checks inside frontmatter
    cat = fm.get("category")
    if cat and cat not in VALID_CATEGORIES:
        errors.append(f"frontmatter.category '{cat}' not in {sorted(VALID_CATEGORIES)}")
    country = fm.get("country")
    if country and country not in VALID_COUNTRIES:
        errors.append(f"frontmatter.country '{country}' not in {sorted(VALID_COUNTRIES)}")
    return errors


def validate_stage4(data: dict) -> list[str]:
    errors = []
    result = data.get("overallResult")
    if result and result not in VALID_OVERALL_RESULT:
        errors.append(f"overallResult '{result}' must be PASS or FAIL")
    layer_reports = data.get("layerReports")
    if layer_reports is not None:
        if not isinstance(layer_reports, list):
            errors.append("layerReports must be an array")
        elif len(layer_reports) != 5:
            errors.append(f"layerReports must have exactly 5 items, got {len(layer_reports)}")
    return errors


STAGE_VALIDATORS = {
    2: validate_stage2,
    3: validate_stage3,
    4: validate_stage4,
}


def check_required_fields(data: dict, required: list[str]) -> list[str]:
    return [f"missing required field '{f}'" for f in required if f not in data]


def main() -> None:
    raw = sys.stdin.read()
    hook_data = json.loads(raw)

    if hook_data.get("tool_name") != "Write":
        sys.exit(0)

    file_path = hook_data.get("tool_input", {}).get("file_path", "")
    if not file_path:
        sys.exit(0)

    # Only process files inside a blog-pipeline/ directory
    if "/blog-pipeline/" not in file_path:
        sys.exit(0)

    basename = Path(file_path).name

    # Only process stage[234]-output*.json files
    match = re.match(r"^stage([234])-output.*\.json$", basename)
    if not match:
        sys.exit(0)

    stage = int(match.group(1))

    # Read the written file content from tool_input
    content = hook_data.get("tool_input", {}).get("content", "")
    if not content:
        sys.exit(0)

    # Parse stage output JSON
    try:
        data = json.loads(content)
    except json.JSONDecodeError as e:
        warn(f"⚠ Stage {stage} output validation failed: invalid JSON — {e}")
        sys.exit(0)

    if not isinstance(data, dict):
        warn(f"⚠ Stage {stage} output validation failed: root must be a JSON object")
        sys.exit(0)

    all_errors = []

    # Check required top-level fields
    required = STAGE_REQUIRED.get(stage, [])
    all_errors.extend(check_required_fields(data, required))

    # Stage-specific deeper checks
    validator = STAGE_VALIDATORS.get(stage)
    if validator:
        all_errors.extend(validator(data))

    if all_errors:
        details = "; ".join(all_errors)
        warn(f"⚠ Stage {stage} output validation failed: {details}")

    sys.exit(0)


try:
    main()
except Exception:
    sys.exit(0)
