#!/bin/bash
# Reddit Karma Daily — 매일 오후 1시 KST (= 04:00 UTC)
# Stage 1: curl로 Reddit JSON 직접 스크래핑 (로컬 네트워크)
# Stage 2: Claude에 context 전달 → 분석/드래프트 → Telegram 전송
# Output: Telegram message with draft

set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"

PROJECT_DIR="$HOME/localnomad/b2c-website"
SCRIPT_DIR="$PROJECT_DIR/scripts/cron"
LOG_DIR="$PROJECT_DIR/logs/cron"
STAGING_DIR="/tmp/reddit-karma-staging"
mkdir -p "$LOG_DIR" "$STAGING_DIR"
LOG_FILE="$LOG_DIR/reddit-karma-$(date +%Y-%m-%d).log"

cd "$PROJECT_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Starting reddit-karma-daily..." >> "$LOG_FILE"

# Determine today's country (day-of-year mod 3)
DOY=$(date +%-j)
MOD=$((DOY % 3))
case $MOD in
  0) COUNTRY="Korea"
     SUBS=("korea" "Living_in_Korea" "koreaexpat")
     KEYWORDS='visa|tax|ARC|immigration|residency|F-2|F-6|E-7|D-8|neighborhood|housing|rent'
     ;;
  1) COUNTRY="Japan"
     SUBS=("japanlife" "movingtojapan" "JapanFinance")
     KEYWORDS='visa|tax|residence card|immigration|digital nomad|business manager|HSW|SSW|neighborhood|housing|rent'
     ;;
  2) COUNTRY="Taiwan"
     SUBS=("taiwan" "TaiwanExpats" "digitalnomad")
     KEYWORDS='visa|tax|ARC|gold card|DNV|immigration|residency|neighborhood|housing|rent|Taiwan'
     ;;
esac

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Country: $COUNTRY | Subs: ${SUBS[*]}" >> "$LOG_FILE"

# ─── Stage 1: Fetch Reddit threads via curl (local network) ───

THREADS_FILE="$STAGING_DIR/threads-$(date +%Y-%m-%d).json"
echo "[]" > "$THREADS_FILE"

FILTER_PY="$SCRIPT_DIR/reddit-filter.py"

for SUB in "${SUBS[@]}"; do
  echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Fetching r/$SUB..." >> "$LOG_FILE"

  # Pipe curl directly to python — avoids bash mangling JSON escapes
  SUB_FILE="$STAGING_DIR/sub-${SUB}.json"
  curl -s -H "User-Agent: LocalNomad/1.0 (cron job)" \
    "https://old.reddit.com/r/${SUB}/new.json?limit=25&sort=new" \
    -o "$SUB_FILE" 2>> "$LOG_FILE" || continue

  # Filter and merge
  python3 "$FILTER_PY" filter "$KEYWORDS" < "$SUB_FILE" \
    | python3 "$FILTER_PY" merge "$THREADS_FILE" 2>> "$LOG_FILE" || continue
done

# Count threads found
THREAD_COUNT=$(python3 "$FILTER_PY" count "$THREADS_FILE" 2>/dev/null || echo "0")
echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Stage 1 complete: $THREAD_COUNT relevant threads found" >> "$LOG_FILE"

if [ "$THREAD_COUNT" -eq 0 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] No relevant threads. Sending skip notification." >> "$LOG_FILE"
  echo "No relevant Reddit threads found today for $COUNTRY. Subs checked: ${SUBS[*]}" > "$STAGING_DIR/skip-msg.txt"
  "$SCRIPT_DIR/send-telegram.sh" "Reddit Karma — $COUNTRY" "$STAGING_DIR/skip-msg.txt" PLAIN
  SKIP_CLAUDE=true
else
  SKIP_CLAUDE=false
fi

# ─── Stage 2: Claude analyzes threads + drafts reply ───

if [ "$SKIP_CLAUDE" = false ]; then
  # Get best thread URL
  BEST_URL=$(python3 "$FILTER_PY" best "$THREADS_FILE" 2>/dev/null)

  if [ -n "$BEST_URL" ]; then
    curl -s -H "User-Agent: LocalNomad/1.0 (cron job)" \
      "${BEST_URL}.json?limit=10&sort=best" \
      -o "$STAGING_DIR/raw-comments.json" 2>> "$LOG_FILE" || true

    python3 "$FILTER_PY" comments < "$STAGING_DIR/raw-comments.json" \
      > "$STAGING_DIR/comments.json" 2>> "$LOG_FILE" || echo "[]" > "$STAGING_DIR/comments.json"
  fi

  THREADS_CONTENT=$(cat "$THREADS_FILE")
  COMMENTS_CONTENT=$(cat "$STAGING_DIR/comments.json" 2>/dev/null || echo "[]")

  # Write prompt to temp file to avoid quoting issues
  PROMPT_FILE="$STAGING_DIR/prompt-$(date +%Y-%m-%d).md"
  cat > "$PROMPT_FILE" <<'PROMPT_HEADER'
You have pre-fetched Reddit data. Analyze and draft a reply.

## Instructions
1. Pick the single best thread to reply to (highest value opportunity).
2. Read the existing comments -- do NOT repeat what has already been said.
3. Draft an informative reply using blog/visa data from this repo for specific facts and numbers.
4. Reply must be: purely informative, zero brand mentions, zero CTAs, zero URLs to our site.

After drafting, send the result directly to Telegram:
- Bot token: $(jq -r '.notifications.telegram.botToken' ~/.claude/.omc-config.json)
- Chat ID: $(jq -r '.notifications.telegram.chatId' ~/.claude/.omc-config.json)

Format the Telegram message as:
Reddit Draft Ready

r/{subreddit} -- {title}
{url}

Why: {1-line reason this thread is worth replying to}

---
{draft reply text}
---
Self-eval: Specificity X/5 | Voice X/5 | Relevance X/5 | Differentiation X/5 | Purity X/5

Use curl to send: curl -s "https://api.telegram.org/bot${TOKEN}/sendMessage" -d "chat_id=${CHAT_ID}" --data-urlencode "text=${MSG}"

If no good thread found, send: "No good Reddit opportunities today."
PROMPT_HEADER

  # Append data sections
  {
    echo ""
    echo "## Country: $COUNTRY"
    echo ""
    echo "## Threads Found (JSON)"
    echo "$THREADS_CONTENT"
    echo ""
    echo "## Top Comments on Best Thread (JSON)"
    echo "$COMMENTS_CONTENT"
  } >> "$PROMPT_FILE"

  cat "$PROMPT_FILE" | env -u CLAUDECODE claude --dangerously-skip-permissions -p - >> "$LOG_FILE" 2>&1
  EXIT_CODE=$?
  echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Stage 2 complete: exit code $EXIT_CODE" >> "$LOG_FILE"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Finished" >> "$LOG_FILE"

# Push heartbeat so GitHub Action watchdog knows we ran
cd "$PROJECT_DIR"
git checkout -b drafts/auto 2>/dev/null || git checkout drafts/auto
git pull origin drafts/auto --rebase 2>/dev/null || true
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > drafts/heartbeat-reddit-karma.txt
git add drafts/heartbeat-reddit-karma.txt
git commit -m "heartbeat: reddit-karma $(date +%Y-%m-%d)" 2>/dev/null || true
git push -u origin drafts/auto 2>/dev/null || true
git checkout main 2>/dev/null || true

exit ${EXIT_CODE:-0}
