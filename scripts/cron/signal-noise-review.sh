#!/bin/bash
# Signal/Noise Review — 격주 (1일, 15일) 오전 10시 KST
# Approve-tier: 결과만 생성, Gen 확인 후 적용
# Output: 터미널 알림 + 로그

set -euo pipefail

LOG_DIR="$HOME/localnomad/b2c-website/logs/cron"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/signal-noise-review-$(date +%Y-%m-%d).log"

cd "$HOME/localnomad/b2c-website"

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Starting signal-noise-review..." >> "$LOG_FILE"

SKILL_FILE="$HOME/Documents/Claude/Scheduled/signal-noise-review/SKILL.md"

if [ ! -f "$SKILL_FILE" ]; then
  echo "[ERROR] SKILL.md not found at $SKILL_FILE" >> "$LOG_FILE"
  exit 1
fi

OUTPUT_FILE="$HOME/localnomad/b2c-website/docs/human/signal-noise-review-$(date +%Y-%m-%d).md"
cat "$SKILL_FILE" | claude --dangerously-skip-permissions -p - > "$OUTPUT_FILE" 2>> "$LOG_FILE"
EXIT_CODE=$?

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Finished with exit code $EXIT_CODE" >> "$LOG_FILE"

# Send full review to Telegram for phone review
if [ $EXIT_CODE -eq 0 ] && [ -f "$OUTPUT_FILE" ]; then
  osascript -e 'display notification "Signal/Noise 리뷰가 생성되었습니다." with title "Memory Review" sound name "Glass"' 2>/dev/null || true

  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  "$SCRIPT_DIR/send-telegram.sh" "🧹 Signal/Noise Review" "$OUTPUT_FILE"
fi

exit $EXIT_CODE
