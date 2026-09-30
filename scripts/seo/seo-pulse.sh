#!/bin/bash
# SEO Pulse — GSC + GA4 data -> local weekly analysis. Keeps the previous report on failure.
# Usage: scripts/seo/seo-pulse.sh [--days N] [--end-date YYYY-MM-DD] [--compare-prior] [--dry-run]

set -euo pipefail

PROJECT_DIR="$HOME/localnomad/b2c-website"
LOG_DIR="$PROJECT_DIR/logs/cron"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/seo-pulse-$(date +%Y-%m-%d).log"
SKILL_FILE="$PROJECT_DIR/scripts/seo/SEO-PULSE-SKILL.md"
GSC_SCRIPT="$PROJECT_DIR/scripts/seo/pull-gsc.mjs"
GA4_SCRIPT="$PROJECT_DIR/scripts/seo/pull-ga4.mjs"
OUTPUT_FILE="$PROJECT_DIR/docs/human/[SEO] weekly-pulse.md"
DRY_RUN=false
ANALYTICS_ARGS=(--days 28 --compare-prior)

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true ;;
    --days|--end-date) ANALYTICS_ARGS+=("$1" "$2"); shift ;;
    --compare-prior) ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done

cd "$PROJECT_DIR"
for file in "$SKILL_FILE" "$GSC_SCRIPT" "$GA4_SCRIPT"; do
  if [[ ! -f "$file" ]]; then
    echo "[ERROR] required file not found: $file" >> "$LOG_FILE"
    exit 1
  fi
done

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Starting seo-pulse (dry-run=$DRY_RUN)" >> "$LOG_FILE"
GSC_STATUS="failed"
GA4_STATUS="failed"
if GSC_DATA=$(node "$GSC_SCRIPT" "${ANALYTICS_ARGS[@]}" 2>> "$LOG_FILE"); then GSC_STATUS="complete"; fi
if GA4_DATA=$(node "$GA4_SCRIPT" "${ANALYTICS_ARGS[@]}" 2>> "$LOG_FILE"); then GA4_STATUS="complete"; fi

if [[ "$GSC_STATUS" == "failed" && "$GA4_STATUS" == "failed" ]]; then
  echo "[ERROR] Both data pulls failed; leaving existing report unchanged" >> "$LOG_FILE"
  exit 1
fi

PROMPT=$(cat <<EOF
## Collection status
- GSC: $GSC_STATUS
- GA4: $GA4_STATUS

## GSC data
\`\`\`json
${GSC_DATA:-null}
\`\`\`

## GA4 data
\`\`\`json
${GA4_DATA:-null}
\`\`\`

---
$(cat "$SKILL_FILE")
EOF
)

TEMP_OUTPUT=$(mktemp "$PROJECT_DIR/docs/human/.weekly-pulse.XXXXXX")
if ! printf '%s\n' "$PROMPT" | env -u CLAUDECODE claude --dangerously-skip-permissions -p - > "$TEMP_OUTPUT" 2>> "$LOG_FILE"; then
  rm -f "$TEMP_OUTPUT"
  echo "[ERROR] analysis failed; leaving existing report unchanged" >> "$LOG_FILE"
  exit 1
fi
if [[ ! -s "$TEMP_OUTPUT" ]]; then
  rm -f "$TEMP_OUTPUT"
  echo "[ERROR] analysis returned an empty report; leaving existing report unchanged" >> "$LOG_FILE"
  exit 1
fi

if [[ "$DRY_RUN" == true ]]; then
  rm -f "$TEMP_OUTPUT"
  echo "[INFO] dry-run completed; no report write or notification" >> "$LOG_FILE"
  exit 0
fi

mv "$TEMP_OUTPUT" "$OUTPUT_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Report updated: $OUTPUT_FILE" >> "$LOG_FILE"

# Existing Telegram recipient/config are preserved; dry-run is the no-send mode.
TG_CONFIG="$HOME/.claude/.omc-config.json"
if [[ -f "$TG_CONFIG" ]]; then
  TG_TOKEN=$(jq -r '.notifications.telegram.botToken // empty' "$TG_CONFIG")
  TG_CHAT=$(jq -r '.notifications.telegram.chatId // empty' "$TG_CONFIG")
  if [[ -n "$TG_TOKEN" && -n "$TG_CHAT" ]]; then
    CONTENT=$(head -c 4000 "$OUTPUT_FILE")
    curl -s "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" -d "chat_id=${TG_CHAT}" --data-urlencode "text=📊 *SEO Weekly Pulse*
${CONTENT}" > /dev/null 2>&1
  fi
fi
