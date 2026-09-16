#!/bin/bash
# ChurchHub PostgreSQL 야간 백업 — 매일 새벽 4시 30분
# pg_dump 커스텀 포맷(-Fc, 압축됨), 7일치 보관
# 복원: pg_restore -U churchhub -d churchhub --clean 파일명

# launchd 환경용 PATH (필수!)
export PATH=/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH

CONTAINER=churchhub-db
DB_USER=churchhub
DB_NAME=churchhub
BACKUP_DIR=~/churchhub-backups
LOG=~/churchhub-backups/backup.log
KEEP_DAYS=7

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

ts() { date "+%Y-%m-%d %H:%M:%S"; }
STAMP=$(date "+%Y%m%d_%H%M%S")
FILE="$BACKUP_DIR/churchhub_db_$STAMP.dump"

echo "[$(ts)] 🗄️ ChurchHub DB 백업 시작" >> "$LOG"

# 사전 체크: 컨테이너 살아있는지
if ! docker ps --filter name=$CONTAINER -q | grep -q .; then
  echo "[$(ts)] ❌ 컨테이너 $CONTAINER 가 실행 중이 아님 — 백업 실패" >> "$LOG"
  osascript -e 'display notification "ChurchHub DB 백업 실패: 컨테이너 다운" with title "ChurchHub 백업"'
  exit 1
fi

# pg_dump (custom 포맷 = 압축 + 선택적 복원 가능, 라이브 DB에 안전)
docker exec $CONTAINER pg_dump -U $DB_USER -d $DB_NAME -Fc > "$FILE" 2>>"$LOG"
RESULT=$?

if [ $RESULT -eq 0 ] && [ -s "$FILE" ]; then
  chmod 600 "$FILE"
  SIZE=$(du -h "$FILE" | cut -f1)
  # 무결성 확인: 아카이브 목록이 읽히는지
  if docker exec -i $CONTAINER pg_restore --list < "$FILE" >/dev/null 2>&1; then
    echo "[$(ts)] ✅ 백업 완료: churchhub_db_$STAMP.dump ($SIZE, 무결성 확인됨)" >> "$LOG"
  else
    echo "[$(ts)] ⚠️ 백업 생성됨($SIZE) 그러나 무결성 검증 실패: churchhub_db_$STAMP.dump" >> "$LOG"
    osascript -e 'display notification "ChurchHub DB 백업 무결성 검증 실패" with title "ChurchHub 백업"'
  fi
  # 7일 넘은 백업 삭제
  find "$BACKUP_DIR" -name "churchhub_db_*.dump" -mtime +$KEEP_DAYS -delete
  OLD_COUNT=$(ls "$BACKUP_DIR"/churchhub_db_*.dump 2>/dev/null | wc -l | tr -d ' ')
  echo "[$(ts)] 🗂️ 현재 백업 수: $OLD_COUNT개 (7일 보관)" >> "$LOG"
else
  echo "[$(ts)] ❌ 백업 실패 (exit=$RESULT)" >> "$LOG"
  rm -f "$FILE"
  osascript -e 'display notification "ChurchHub DB 백업 실패 — 로그 확인 필요" with title "ChurchHub 백업"'
  exit 1
fi
