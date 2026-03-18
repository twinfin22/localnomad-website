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

cat "$SKILL_FILE" | claude --dangerously-skip-permissions -p - >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Finished with exit code $EXIT_CODE" >> "$LOG_FILE"
exit $EXIT_CODE
