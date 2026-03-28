#!/bin/bash
# Pre-commit validator: ensures published blog MDX files have inline source links
# and do not use the banned *Sources:* bottom-section pattern.
#
# Called by lefthook pre-commit on staged .mdx files in content/blog/.

set -euo pipefail

MIN_LINKS_DEFAULT=3
MIN_LINKS_TIPS=1
ERRORS=0

for file in "$@"; do
  # Only check files in content/blog/
  [[ "$file" != content/blog/* ]] && continue

  # Only check files that exist (not deleted)
  [ -f "$file" ] || continue

  # Only check published posts (draft: false)
  if grep -q '^draft: true' "$file"; then
    continue
  fi

  # Determine minimum based on category
  # tips category = lifestyle content, fewer gov claims expected
  MIN_EXTERNAL_LINKS=$MIN_LINKS_DEFAULT
  if grep -q '^category:.*tips' "$file"; then
    MIN_EXTERNAL_LINKS=$MIN_LINKS_TIPS
  fi

  # --- Check 1: Banned *Sources:* bottom-section pattern ---
  if grep -q '^\*Sources:' "$file"; then
    echo "ERROR: $file has banned *Sources:* section. Convert to inline links."
    ERRORS=$((ERRORS + 1))
  fi

  # --- Check 2: Minimum external inline links ---
  # Count markdown links to external URLs: [text](https://...)
  LINK_COUNT=$(grep -oE '\[[^]]+\]\(https?://[^)]+\)' "$file" | wc -l | tr -d ' ')

  if [ "$LINK_COUNT" -lt "$MIN_EXTERNAL_LINKS" ]; then
    echo "ERROR: $file has only $LINK_COUNT external inline links (minimum: $MIN_EXTERNAL_LINKS)."
    ERRORS=$((ERRORS + 1))
  fi
done

if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "Blog link validation failed with $ERRORS error(s)."
  echo "Run the source-link-injector or add inline links manually."
  exit 1
fi
