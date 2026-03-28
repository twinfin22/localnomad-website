#!/bin/bash
# Reddit Karma Daily — 매일 오후 1시 KST (= 04:00 UTC)
# Reddit 스카우팅 + draft 작성 → Telegram 전송
# Output: Telegram message with draft

set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"

PROJECT_DIR="$HOME/localnomad/b2c-website"
LOG_DIR="$PROJECT_DIR/logs/cron"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/reddit-karma-$(date +%Y-%m-%d).log"

cd "$PROJECT_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Starting reddit-karma-daily..." >> "$LOG_FILE"

# Determine today's country (day-of-year mod 3)
DOY=$(date +%j)
MOD=$((DOY % 3))
case $MOD in
  0) COUNTRY="Korea" ;;
  1) COUNTRY="Japan" ;;
  2) COUNTRY="Taiwan" ;;
esac

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Today's country: $COUNTRY" >> "$LOG_FILE"

PROMPT=$(cat <<HEREDOC
Run /reddit-karma in Daily Auto Mode for $COUNTRY.

Scout Reddit (via WebSearch site:reddit.com) for the best single thread about $COUNTRY visa, neighborhood, or tax.
Draft an informative reply (never ad-like) after reading all existing replies.
Use blog/visa data from the repo for specific facts and numbers.

After drafting, send the result directly to Telegram:
- Bot token: \$(jq -r '.notifications.telegram.botToken' ~/.claude/.omc-config.json)
- Chat ID: \$(jq -r '.notifications.telegram.chatId' ~/.claude/.omc-config.json)

Format the Telegram message as:
📝 *Reddit Draft Ready*

📍 r/{subreddit} — {title}
🔗 {url}

*Why:* {1-line reason}

---
{draft text}
---
Self-eval: Specificity X/5 | Voice X/5 | Relevance X/5 | Differentiation X/5 | Purity X/5

Use curl to send: curl -s "https://api.telegram.org/bot\${TOKEN}/sendMessage" -d "chat_id=\${CHAT_ID}" --data-urlencode "text=\${MSG}"

If no good thread found, send: "No good Reddit opportunities today for $COUNTRY."
HEREDOC
)

echo "$PROMPT" | env -u CLAUDECODE claude --dangerously-skip-permissions -p - >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Finished with exit code $EXIT_CODE" >> "$LOG_FILE"

# Push heartbeat so GitHub Action watchdog knows we ran
if [ $EXIT_CODE -eq 0 ]; then
  cd "$PROJECT_DIR"
  git checkout -b drafts/auto 2>/dev/null || git checkout drafts/auto
  git pull origin drafts/auto --rebase 2>/dev/null || true
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > drafts/heartbeat-reddit-karma.txt
  git add drafts/heartbeat-reddit-karma.txt
  git commit -m "heartbeat: reddit-karma $(date +%Y-%m-%d)" 2>/dev/null || true
  git push -u origin drafts/auto 2>/dev/null || true
  git checkout main 2>/dev/null || true
fi

exit $EXIT_CODE
