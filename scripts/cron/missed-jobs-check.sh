#!/bin/bash
# Missed Jobs Check — 터미널 열 때 실행 (.zprofile에서 호출)
# 일요일 크론잡이 놓쳤는지 확인, 놓쳤으면 보상 실행

LOG_DIR="$HOME/localnomad/b2c-website/logs/cron"
SCRIPT_DIR="$HOME/localnomad/b2c-website/scripts/cron"

# 가장 최근 일요일 날짜 계산
if [ "$(date +%u)" -eq 7 ]; then
  LAST_SUNDAY=$(date +%Y-%m-%d)
else
  LAST_SUNDAY=$(date -v-sunday +%Y-%m-%d)
fi

# 오늘이 일요일이면 아직 실행 전일 수 있으므로 스킵
if [ "$LAST_SUNDAY" = "$(date +%Y-%m-%d)" ]; then
  exit 0
fi

# 이미 오늘 보상 실행했으면 스킵 (중복 방지)
COMPENSATED_FLAG="$LOG_DIR/.compensated-$LAST_SUNDAY"
if [ -f "$COMPENSATED_FLAG" ]; then
  exit 0
fi

# 놓친 작업 확인
MISSED=()

# 매일 작업: reddit-karma-daily
TODAY=$(date +%Y-%m-%d)
if [ ! -f "$LOG_DIR/reddit-karma-$TODAY.log" ]; then
  MISSED+=("reddit-karma-daily")
fi

if [ ! -f "$LOG_DIR/weekly-blog-update-$LAST_SUNDAY.log" ]; then
  MISSED+=("weekly-blog-update")
fi

if [ ! -f "$LOG_DIR/weekly-gen-report-$LAST_SUNDAY.log" ]; then
  MISSED+=("weekly-gen-report")
fi

if [ ! -f "$LOG_DIR/weekly-reflect-$LAST_SUNDAY.log" ]; then
  MISSED+=("weekly-reflect")
fi

# 주간 월요일 작업 (seo-pulse) 체크
if [ "$(date +%u)" -gt 1 ]; then
  LAST_MONDAY=$(date -v-monday +%Y-%m-%d)
  SEO_SCRIPT="$HOME/localnomad/b2c-website/scripts/seo/seo-pulse.sh"
  if [ ! -f "$LOG_DIR/seo-pulse-$LAST_MONDAY.log" ] && [ -f "$SEO_SCRIPT" ]; then
    MISSED+=("seo-pulse")
  fi
fi

# 놓친 게 없으면 종료
if [ ${#MISSED[@]} -eq 0 ]; then
  exit 0
fi

# 알림
MISSED_LIST=$(printf ", %s" "${MISSED[@]}")
MISSED_LIST=${MISSED_LIST:2}
osascript -e "display notification \"놓친 작업: $MISSED_LIST — 보상 실행합니다\" with title \"Cron Missed Jobs\" sound name \"Submarine\"" 2>/dev/null || true

echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Compensating missed jobs from $LAST_SUNDAY: ${MISSED[*]}" >> "$LOG_DIR/missed-jobs.log"

# 순서대로 보상 실행
for JOB in "${MISSED[@]}"; do
  echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Running compensated: $JOB" >> "$LOG_DIR/missed-jobs.log"
  if [ "$JOB" = "seo-pulse" ]; then
    "$HOME/localnomad/b2c-website/scripts/seo/seo-pulse.sh" &
  else
    "$SCRIPT_DIR/$JOB.sh" &
  fi
done

# 중복 방지 플래그
touch "$COMPENSATED_FLAG"
