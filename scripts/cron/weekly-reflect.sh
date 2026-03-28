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

OUTPUT_FILE="$HOME/localnomad/b2c-website/docs/human/[WEEKLY] 워크플로-리뷰-초안.md"
cat "$SKILL_FILE" | claude --dangerously-skip-permissions -p - > "$OUTPUT_FILE" 2>> "$LOG_FILE"
EXIT_CODE=$?

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Finished with exit code $EXIT_CODE" >> "$LOG_FILE"

if [ $EXIT_CODE -eq 0 ] && [ -f "$OUTPUT_FILE" ]; then
  osascript -e 'display notification "주간 워크플로 리뷰 초안이 준비되었습니다." with title "Weekly Reflect" sound name "Glass"' 2>/dev/null || true

  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  "$SCRIPT_DIR/send-telegram.sh" "🔍 Weekly Reflect" "$OUTPUT_FILE"
fi

# On 1st and 15th, also run memory filter review (Lens 6)
DAY_OF_MONTH=$(date +%d)
if [ "$DAY_OF_MONTH" -eq 1 ] || [ "$DAY_OF_MONTH" -eq 15 ]; then
  LENS6_SKILL="$HOME/Documents/Claude/Scheduled/signal-noise-review/SKILL.md"
  if [ -f "$LENS6_SKILL" ]; then
    LENS6_OUTPUT="$HOME/localnomad/b2c-website/docs/human/signal-noise-review-$(date +%Y-%m-%d).md"
    cat "$LENS6_SKILL" | env -u CLAUDECODE claude --dangerously-skip-permissions -p - > "$LENS6_OUTPUT" 2>> "$LOG_FILE"
    LENS6_EXIT=$?
    if [ $LENS6_EXIT -eq 0 ] && [ -f "$LENS6_OUTPUT" ]; then
      SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
      "$SCRIPT_DIR/send-telegram.sh" "🧹 Signal/Noise Review (Lens 6)" "$LENS6_OUTPUT"
    fi
  fi
fi

exit $EXIT_CODE
