#!/bin/bash
# Weekly Gen Report — 매주 일요일 오후 3시 KST
# TLDR + Wins + Metrics + Blockers + Next Week
# Output: docs/human/[WEEKLY] 주간-자동-보고.md

set -euo pipefail

LOG_DIR="$HOME/localnomad/b2c-website/logs/cron"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/weekly-gen-report-$(date +%Y-%m-%d).log"

cd "$HOME/localnomad/b2c-website"

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Starting weekly-gen-report..." >> "$LOG_FILE"

SKILL_FILE="$HOME/Documents/Claude/Scheduled/weekly-gen-report/SKILL.md"

if [ ! -f "$SKILL_FILE" ]; then
  echo "[ERROR] SKILL.md not found at $SKILL_FILE" >> "$LOG_FILE"
  exit 1
fi

cat "$SKILL_FILE" | claude --dangerously-skip-permissions -p - >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Finished with exit code $EXIT_CODE" >> "$LOG_FILE"
exit $EXIT_CODE
