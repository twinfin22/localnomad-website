#!/bin/bash
# Pre-commit advisor: warns when visa JSON numbers differ from blog MDX references.
# Advisory only — always exits 0. Triggers only when visa JSONs are staged.
#
# Called by lefthook pre-commit on staged *.json files under data/visas/.

REPO_ROOT="$(git rev-parse --show-toplevel)"
BLOG_DIR="$REPO_ROOT/content/blog"
WARNINGS=0

# ── helpers ──────────────────────────────────────────────────────────────────

# Extract key numeric patterns from a file's text content.
# Scope: currency amounts + durations ≥2 months/years + point thresholds.
# Deliberately excludes generic small counts (1-9 days) to reduce noise.
extract_numbers() {
  local file="$1"
  grep -oE \
    '(₩|¥|NT\$|\$)[0-9,]+|[0-9,]+(₩|¥|NT\$)|[1-9][0-9]+ (months?|years?)|[0-9]+ points?' \
    "$file" 2>/dev/null | sort -u
}

# Normalise a number string for comparison (strip commas, lowercase)
normalise() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | tr -d ','
}

# ── main ─────────────────────────────────────────────────────────────────────

CHANGED_JSONS=()
for f in "$@"; do
  # Only care about visa JSON files
  [[ "$f" == data/visas/*/en/*.json ]] || continue
  [ -f "$REPO_ROOT/$f" ] || continue
  CHANGED_JSONS+=("$f")
done

# Nothing to do if no visa JSONs are staged
[ "${#CHANGED_JSONS[@]}" -eq 0 ] && exit 0

echo "blog-visa-sync: checking ${#CHANGED_JSONS[@]} changed visa JSON(s) against blog posts..."

for json_rel in "${CHANGED_JSONS[@]}"; do
  json_file="$REPO_ROOT/$json_rel"

  # Derive slug from filename (e.g. data/visas/korea/en/f-1-d.json → f-1-d)
  slug="$(basename "$json_rel" .json)"

  # Extract numbers from the JSON (values only, skip keys)
  json_numbers="$(extract_numbers "$json_file")"
  [ -z "$json_numbers" ] && continue

  # Find blog files whose filename contains the visa slug
  # (e.g. korea-f1d-workation-visa-2026.mdx matches slug "f-1-d" via normalized form)
  slug_norm="$(echo "$slug" | tr -d '-')"
  matching_blogs=()
  while IFS= read -r -d '' mdx; do
    fname="$(basename "$mdx" .mdx)"
    fname_norm="$(echo "$fname" | tr -d '-')"
    if [[ "$fname_norm" == *"$slug_norm"* ]]; then
      matching_blogs+=("$mdx")
    fi
  done < <(find "$BLOG_DIR" -name "*.mdx" -print0 2>/dev/null)

  [ "${#matching_blogs[@]}" -eq 0 ] && continue

  for blog in "${matching_blogs[@]}"; do
    blog_rel="${blog#$REPO_ROOT/}"

    # Skip draft posts
    grep -q '^draft: true' "$blog" 2>/dev/null && continue

    blog_numbers="$(extract_numbers "$blog")"
    [ -z "$blog_numbers" ] && continue

    # Check each JSON number against what the blog contains
    while IFS= read -r num; do
      norm_num="$(normalise "$num")"
      [ -z "$norm_num" ] && continue

      # See if this normalised number exists in the blog numbers
      found=false
      while IFS= read -r bnum; do
        if [ "$(normalise "$bnum")" = "$norm_num" ]; then
          found=true
          break
        fi
      done <<< "$blog_numbers"

      if [ "$found" = false ]; then
        echo "  WARN [$slug] $blog_rel"
        echo "       JSON has: $num"
        echo "       Not found in blog — may be outdated or covered differently"
        WARNINGS=$((WARNINGS + 1))
      fi
    done <<< "$json_numbers"
  done
done

if [ "$WARNINGS" -gt 0 ]; then
  echo ""
  echo "blog-visa-sync: $WARNINGS advisory warning(s). Review blog posts manually if visa numbers changed."
  echo "  (This check is advisory — commit is not blocked)"
fi

exit 0
