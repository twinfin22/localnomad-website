#!/bin/bash
# SEO Pulse — 매주 월요일 09:00 KST
# GSC 데이터 수집 → Claude 분석 → docs/human/[SEO] weekly-pulse.md
# Cron: 0 0 * * 1 ~/localnomad/b2c-website/scripts/seo/seo-pulse.sh

set -euo pipefail

PROJECT_DIR="$HOME/localnomad/b2c-website"
LOG_DIR="$PROJECT_DIR/logs/cron"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/seo-pulse-$(date +%Y-%m-%d).log"

SKILL_FILE="$PROJECT_DIR/scripts/seo/SEO-PULSE-SKILL.md"
PULL_SCRIPT="$PROJECT_DIR/scripts/seo/pull-gsc.mjs"
OUTPUT_FILE="$PROJECT_DIR/docs/human/[SEO] weekly-pulse.md"

cd "$PROJECT_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Starting seo-pulse..." >> "$LOG_FILE"

# Validate dependencies
if [ ! -f "$SKILL_FILE" ]; then
  echo "[ERROR] SKILL.md not found at $SKILL_FILE" >> "$LOG_FILE"
  exit 1
fi

if [ ! -f "$PULL_SCRIPT" ]; then
  echo "[ERROR] pull-gsc.mjs not found at $PULL_SCRIPT" >> "$LOG_FILE"
  exit 1
fi

# Pull GSC data (30s AbortController timeout built into pull-gsc.mjs)
GSC_DATA=$(node "$PULL_SCRIPT" 2>> "$LOG_FILE")
PULL_EXIT=$?

if [ $PULL_EXIT -ne 0 ]; then
  echo "[ERROR] pull-gsc.mjs failed with exit code $PULL_EXIT" >> "$LOG_FILE"
  exit $PULL_EXIT
fi

# Validate non-empty data
ROW_COUNT=$(echo "$GSC_DATA" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{try{console.log(JSON.parse(d).meta.rowCount)}catch{console.log(0)}});
")

if [ "$ROW_COUNT" -lt 1 ] 2>/dev/null; then
  echo "[ERROR] GSC returned 0 rows — skipping analysis" >> "$LOG_FILE"
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Pulled $ROW_COUNT rows from GSC" >> "$LOG_FILE"

# Compose prompt: GSC data + SKILL template
PROMPT=$(cat <<HEREDOC
## Google Search Console Data (last 28 days)

\`\`\`json
$GSC_DATA
\`\`\`

---

$(cat "$SKILL_FILE")
HEREDOC
)

# Run Claude analysis
echo "$PROMPT" | env -u CLAUDECODE claude --dangerously-skip-permissions -p - > "$OUTPUT_FILE" 2>> "$LOG_FILE"
EXIT_CODE=$?

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Finished with exit code $EXIT_CODE → $OUTPUT_FILE" >> "$LOG_FILE"

# Send to Telegram
if [ $EXIT_CODE -eq 0 ] && [ -f "$OUTPUT_FILE" ]; then
  TG_CONFIG="$HOME/.claude/.omc-config.json"
  if [ -f "$TG_CONFIG" ]; then
    TG_TOKEN=$(jq -r '.notifications.telegram.botToken // empty' "$TG_CONFIG")
    TG_CHAT=$(jq -r '.notifications.telegram.chatId // empty' "$TG_CONFIG")
    if [ -n "$TG_TOKEN" ] && [ -n "$TG_CHAT" ]; then
      CONTENT=$(head -c 4000 "$OUTPUT_FILE")
      curl -s "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
        -d "chat_id=${TG_CHAT}" \
        --data-urlencode "text=📊 *SEO Weekly Pulse*
${CONTENT}" > /dev/null 2>&1
      echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Sent to Telegram" >> "$LOG_FILE"
    fi
  fi
fi

exit $EXIT_CODE
