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

cat "$SKILL_FILE" | claude --dangerously-skip-permissions -p - >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Finished with exit code $EXIT_CODE" >> "$LOG_FILE"

# Approve-tier: macOS 알림으로 리뷰 필요 알림
if [ $EXIT_CODE -eq 0 ]; then
  osascript -e 'display notification "Signal/Noise 리뷰가 생성되었습니다. 확인 후 적용해주세요." with title "Memory Review" sound name "Glass"' 2>/dev/null || true

  # Send to Telegram
  TG_CONFIG="$HOME/.claude/.omc-config.json"
  if [ -f "$TG_CONFIG" ]; then
    TG_TOKEN=$(jq -r '.notifications.telegram.botToken // empty' "$TG_CONFIG")
    TG_CHAT=$(jq -r '.notifications.telegram.chatId // empty' "$TG_CONFIG")
    if [ -n "$TG_TOKEN" ] && [ -n "$TG_CHAT" ]; then
      curl -s "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
        -d "chat_id=${TG_CHAT}" \
        --data-urlencode "text=🧹 *Signal/Noise Review 완료*
Approve-tier: docs/human/ 에서 확인 후 적용해주세요." > /dev/null 2>&1
    fi
  fi
fi

exit $EXIT_CODE
