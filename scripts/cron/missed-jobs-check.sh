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

if [ ! -f "$LOG_DIR/weekly-blog-update-$LAST_SUNDAY.log" ]; then
  MISSED+=("weekly-blog-update")
fi

if [ ! -f "$LOG_DIR/weekly-gen-report-$LAST_SUNDAY.log" ]; then
  MISSED+=("weekly-gen-report")
fi

if [ ! -f "$LOG_DIR/weekly-reflect-$LAST_SUNDAY.log" ]; then
  MISSED+=("weekly-reflect")
fi

# 격주 작업 (1일, 15일) 체크
DAY_OF_MONTH=$(date +%d)
LAST_BIWEEKLY=""
if [ "$DAY_OF_MONTH" -gt 1 ] && [ "$DAY_OF_MONTH" -le 15 ]; then
  LAST_BIWEEKLY=$(date -v1d +%Y-%m-%d)
elif [ "$DAY_OF_MONTH" -gt 15 ]; then
  LAST_BIWEEKLY=$(date -v15d +%Y-%m-%d)
fi

if [ -n "$LAST_BIWEEKLY" ] && [ ! -f "$LOG_DIR/signal-noise-review-$LAST_BIWEEKLY.log" ]; then
  MISSED+=("signal-noise-review")
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

# 순서대로 보상 실행 (blog → report → reflect)
for JOB in "${MISSED[@]}"; do
  echo "[$(date '+%Y-%m-%d %H:%M:%S KST')] Running compensated: $JOB" >> "$LOG_DIR/missed-jobs.log"
  "$SCRIPT_DIR/$JOB.sh" &
done

# 중복 방지 플래그
touch "$COMPENSATED_FLAG"
