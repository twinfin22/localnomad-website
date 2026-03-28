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

  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  "$SCRIPT_DIR/send-telegram.sh" "📝 Weekly Blog Candidates" "$OUTPUT_FILE"
fi

exit $EXIT_CODE
