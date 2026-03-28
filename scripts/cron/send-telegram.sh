#!/bin/bash
# send-telegram.sh — Shared Telegram sender for cron jobs
# Usage: send-telegram.sh "📊 Title" "/path/to/content.md" [HTML|Markdown]
# parse_mode is optional. Omit for plain text (safest for Claude CLI output).

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

PARSE_ARG=""
if [ -n "$PARSE_MODE" ]; then
  PARSE_ARG="-d parse_mode=${PARSE_MODE}"
fi

CONTENT=$(head -c 4000 "$CONTENT_FILE")
curl -s "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
  -d "chat_id=${TG_CHAT}" \
  $PARSE_ARG \
  --data-urlencode "text=${TITLE}

${CONTENT}" > /dev/null 2>&1

# If content exceeds 4000 chars, send remainder
TOTAL=$(wc -c < "$CONTENT_FILE")
if [ "$TOTAL" -gt 4000 ]; then
  PART2=$(tail -c +4001 "$CONTENT_FILE" | head -c 4000)
  curl -s "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
    -d "chat_id=${TG_CHAT}" \
    $PARSE_ARG \
    --data-urlencode "text=${PART2}" > /dev/null 2>&1
fi
