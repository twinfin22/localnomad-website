#!/bin/bash
# Weekly Blog Update — 매주 일요일 자정 KST
# Phase A: 뉴스 리서치 → Phase B: SEO 키워드 → Phase C: 5-8개 후보 생성
# Output: docs/human/[WEEKLY] 블로그-후보.md

set -euo pipefail

LOG_DIR="$HOME/localnomad/b2c-website/logs/cron"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/weekly-blog-update-$(date +%Y-%m-%d).log"

cd "$HOME/localnomad/b2c-website"

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Starting weekly-blog-update..." >> "$LOG_FILE"

SKILL_FILE="$HOME/Documents/Claude/Scheduled/weekly-blog-update/SKILL.md"

if [ ! -f "$SKILL_FILE" ]; then
  echo "[ERROR] SKILL.md not found at $SKILL_FILE" >> "$LOG_FILE"
  exit 1
fi

OUTPUT_FILE="$HOME/localnomad/b2c-website/docs/human/[WEEKLY] 블로그-후보.md"
cat "$SKILL_FILE" | claude --dangerously-skip-permissions -p - > "$OUTPUT_FILE" 2>> "$LOG_FILE"
EXIT_CODE=$?

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Finished with exit code $EXIT_CODE" >> "$LOG_FILE"

if [ $EXIT_CODE -eq 0 ] && [ -f "$OUTPUT_FILE" ]; then
  osascript -e 'display notification "블로그 후보가 준비되었습니다." with title "Weekly Blog Update" sound name "Glass"' 2>/dev/null || true

  TG_CONFIG="$HOME/.claude/.omc-config.json"
  if [ -f "$TG_CONFIG" ]; then
    TG_TOKEN=$(jq -r '.notifications.telegram.botToken // empty' "$TG_CONFIG")
    TG_CHAT=$(jq -r '.notifications.telegram.chatId // empty' "$TG_CONFIG")
    if [ -n "$TG_TOKEN" ] && [ -n "$TG_CHAT" ]; then
      CONTENT=$(head -c 4000 "$OUTPUT_FILE")
      curl -s "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
        -d "chat_id=${TG_CHAT}" \
        --data-urlencode "text=📝 Weekly Blog Candidates

${CONTENT}" > /dev/null 2>&1

      TOTAL=$(wc -c < "$OUTPUT_FILE")
      if [ "$TOTAL" -gt 4000 ]; then
        PART2=$(tail -c +4001 "$OUTPUT_FILE" | head -c 4000)
        curl -s "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
          -d "chat_id=${TG_CHAT}" \
          --data-urlencode "text=${PART2}" > /dev/null 2>&1
      fi
    fi
  fi
fi

exit $EXIT_CODE
