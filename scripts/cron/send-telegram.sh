#!/bin/bash
# send-telegram.sh — Shared Telegram sender for cron jobs
# Usage: send-telegram.sh "📊 Title" "/path/to/content.md" [PLAIN]
# Default: Markdown → TG HTML via format-tg.py with HTML-safe splitting.
# Pass PLAIN as 3rd arg to skip formatting and send as plain text.

TITLE="$1"
CONTENT_FILE="$2"
PARSE_MODE="$3"

if [ -z "$TITLE" ] || [ -z "$CONTENT_FILE" ] || [ ! -f "$CONTENT_FILE" ]; then
  exit 0
fi

TG_CONFIG="$HOME/.claude/.omc-config.json"
if [ ! -f "$TG_CONFIG" ]; then
  exit 0
fi

TG_TOKEN=$(jq -r '.notifications.telegram.botToken // empty' "$TG_CONFIG")
TG_CHAT=$(jq -r '.notifications.telegram.chatId // empty' "$TG_CONFIG")

if [ -z "$TG_TOKEN" ] || [ -z "$TG_CHAT" ]; then
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FORMATTER="$SCRIPT_DIR/format-tg.py"

if [ "$PARSE_MODE" = "PLAIN" ] || [ ! -f "$FORMATTER" ]; then
  # Plain text — simple split
  CONTENT=$(head -c 4000 "$CONTENT_FILE")
  curl -s "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
    -d "chat_id=${TG_CHAT}" \
    --data-urlencode "text=${TITLE}

${CONTENT}" > /dev/null 2>&1
else
  # HTML — Python handles format, split, and send
  python3 "$FORMATTER" --send "$TITLE" "$TG_TOKEN" "$TG_CHAT" < "$CONTENT_FILE"
fi
