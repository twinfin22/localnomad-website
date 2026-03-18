#!/bin/bash
# Weekly Reflect — 매주 일요일 15:10 KST
# 5-Lens AI 워크플로 회고 + memory mutation 초안
# Output: docs/human/[WEEKLY] 워크플로-리뷰-초안.md

set -euo pipefail

LOG_DIR="$HOME/localnomad/b2c-website/logs/cron"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/weekly-reflect-$(date +%Y-%m-%d).log"

cd "$HOME/localnomad/b2c-website"

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Starting weekly-reflect..." >> "$LOG_FILE"

SKILL_FILE="$HOME/Documents/Claude/Scheduled/weekly-reflect/SKILL.md"

if [ ! -f "$SKILL_FILE" ]; then
  echo "[ERROR] SKILL.md not found at $SKILL_FILE" >> "$LOG_FILE"
  exit 1
fi

cat "$SKILL_FILE" | claude --dangerously-skip-permissions -p - >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Finished with exit code $EXIT_CODE" >> "$LOG_FILE"

if [ $EXIT_CODE -eq 0 ]; then
  osascript -e 'display notification "주간 워크플로 리뷰 초안이 준비되었습니다." with title "Weekly Reflect" sound name "Glass"' 2>/dev/null || true
fi

exit $EXIT_CODE
