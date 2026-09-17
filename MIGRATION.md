# ChurchHub 서버 이관 매뉴얼

> 작성: 2026-09-17 (이관 지식이 생생한 시점)
> 대상: Mac mini(현 운영 서버) → Linux 서버(AWS/Lightsail/VPS) 또는 다른 Mac
> 목표: 거의 무중단 컷오버. 예상 다운타임 = 최종 DB 덤프~전환 사이 수 분

## 0. 현재 아키텍처 요약

| 자산 | 위치 | 이관 방식 |
|---|---|---|
| 애플리케이션 코드 | GitHub `HalJjaGi/churchhub` | git clone |
| DB (PostgreSQL 16) | Docker `churchhub-db` (컨테이너 내부 5432) | pg_dump → pg_restore |
| 업로드 이미지 | `public/uploads/` (**DB 아님!**) | rsync/tar |
| 시크릿 | `.env`, `.env.docker` (**Git에 없음**) | 수동 복사 |
| 터널 | cloudflared named tunnel `churchhub` (a6f3e0bd) | 커넥터 추가 방식 |
| 이메일 | Resend 계정 (도메인 인증 완료) | 이관 불필요 (서버 무관) |
| DNS | Cloudflare (churchhub.co.kr) | 변경 불필요 (터널 유지) |
| MinIO(Obsidian) | 별도 스택 `~/obsidian-sync/` | ChurchHub와 독립 — 별도 결정 |

## 1. 사전 준비 (새 서버)

```bash
# Docker + Compose 설치 (Ubuntu 기준)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker

# 코드
git clone https://github.com/HalJjaGi/churchhub.git ~/church-platform

# 시크릿 복사 (기존 서버에서) — 값은 기존 서버의 .env / .env.docker 참조
# 필수: DATABASE_URL, AUTH_SECRET/NEXTAUTH_SECRET, NEXTAUTH_URL, RESEND_API_KEY, POSTGRES_PASSWORD
scp old-server:~/workspace/church-platform/.env* ~/church-platform/
```

⚠️ `NEXTAUTH_URL`/`AUTH_URL`은 `https://churchhub.co.kr` 그대로 (도메인 안 바뀜)

## 2. 데이터 이관

### 2-1. DB (기존 서버에서 덤프 → 새 서버에서 복원)
```bash
# 기존 서버: 덤프
docker exec churchhub-db pg_dump -U churchhub -d churchhub -Fc > churchhub_final.dump

# 새 서버: DB 컨테이너만 먼저 기동
cd ~/church-platform && docker compose --env-file .env.docker up -d churchhub-db

# 복원
cat churchhub_final.dump | docker exec -i churchhub-db pg_restore -U churchhub -d churchhub --clean --if-exists
```

### 2-2. ⚠️ 부분 유니크 인덱스 재생성 (핵심 함정!)
Prisma 스키마에 없는 인덱스라 `db push`/복원 후 **조용히 사라질 수 있음**.
아래를 반드시 실행 (없으면 동시 신청 중복 버그 C-09 부활):
```bash
docker exec churchhub-db psql -U churchhub -d churchhub -c "
CREATE UNIQUE INDEX IF NOT EXISTS church_applications_email_active_uniq
  ON church_applications (email) WHERE status IN ('pending','under_review','approved');
CREATE UNIQUE INDEX IF NOT EXISTS church_applications_slug_active_uniq
  ON church_applications (slug) WHERE status IN ('pending','under_review','approved');"
```

### 2-3. 업로드 이미지
```bash
# 기존 → 새 (public/uploads 통째로)
rsync -avz old-server:~/workspace/church-platform/public/uploads/ ~/church-platform/public/uploads/
```

## 3. 애플리케이션 기동 + 사전 검증 (터널 전환 전)

```bash
cd ~/church-platform
docker compose --env-file .env.docker up -d --build

# 로컬 검증
curl -s -o /dev/null -w '%{http_code}' http://localhost:3002   # 200
docker exec churchhub-db psql -U churchhub -t -c "SELECT count(*) FROM \"Church\";"  # 기존 값과 일치
```

## 4. 터널 전환 (거의 무중단)

cloudflared 터널은 커넥터 여러 개를 동시에 지원한다. **새 커넥터 먼저 붙이고 → 확인 후 → 기존 끄기.**

```bash
# 새 서버: 기존 터널에 커넥터 추가 (credentials는 기존 서버 ~/.cloudflared/ 에 있음)
scp old-server:~/.cloudflared/<터널ID>.json ~/.cloudflared/
scp old-server:~/.cloudflared/config.yml ~/.cloudflared/
cloudflared tunnel --config ~/.cloudflared/config.yml run churchhub
# 접속 로그에서 4개 연결 확인 → churchhub.co.kr 접속 테스트 (새 서버가 응답하는지 docker logs 로 확인)

# 안정 확인 후 기존 서버 커넥터 종료
# 기존 Mac: launchctl bootout gui/$(id -u)/com.user.cloudflare.churchhub-tunnel
```

DNS는 터널 UUID 기반이라 **건드릴 필요 없음.**

## 5. 자동화 재설정 (OS별)

### Linux (systemd)
```ini
# /etc/systemd/system/churchhub-tunnel.service
[Unit]
Description=Cloudflare Tunnel - churchhub
After=network-online.target docker.service
Wants=network-online.target

[Service]
ExecStart=/usr/bin/cloudflared tunnel --config /home/<USER>/.cloudflared/config.yml run churchhub
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

DB 백업 (기존: launchd 04:30) → cron:
```bash
# scripts/backup-db.sh 의 osascript 라인 제거 후
crontab -e
30 4 * * * /home/<USER>/church-platform/scripts/backup-db.sh >> /home/<USER>/churchhub-backups/cron.log 2>&1
```
+ Docker 자동 시작: `sudo systemctl enable docker`
+ (선택) 컨테이너 self-healing: docker-compose에 `restart: always` 확인

### 다른 Mac으로 이관 시
launchd plist들을 그대로 복사:
`~/Library/LaunchAgents/com.user.{churchhub-db-backup,cloudflare.churchhub-tunnel,cloudflare.minio-tunnel,obsidian-minio-*}.plist`

## 6. 이관 후 검증 체크리스트

- [ ] https://churchhub.co.kr 200
- [ ] /apply 신청 → 201 → 접수메일 발송 (Resend 대시보드 확인)
- [ ] 관리자 로그인 → 승인 테스트 → 사이트 생성 + 환영공지
- [ ] 기존 교회 사이트 이미지 표시 (uploads 이관 확인)
- [ ] 부분 인덱스 존재: `SELECT indexname FROM pg_indexes WHERE tablename='church_applications';`
- [ ] 백업 1회 수동 실행 + 복원 테스트
- [ ] (재부팅 테스트) 서버 재시작 후 컨테이너/터널 자동 기동

## 7. 롤백 (새 서버에 문제가 있을 때)

1. 새 서버 커넥터 중지
2. 기존 서버 터널 재기동: `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.user.cloudflare.churchhub-tunnel.plist`
3. DNS 변경이 없으므로 즉시 기존 서버로 복귀 (기존 DB는 전환 전 상태 — 전환 후 신규 데이터는 수동 조정 필요)

## 8. 함정 총정리 (체크리스트)

| # | 함정 | 대응 |
|---|---|---|
| 1 | uploads 폴더 (파일시스템) | §2-3 rsync |
| 2 | 부분 유니크 인덱스 (스키마 밖) | §2-2 재생성 |
| 3 | .env 시크릿 (Git 밖) | §1 수동 복사 |
| 4 | launchd → systemd/cron | §5 |
| 5 | backup 스크립트 osascript (Mac 전용) | §5 제거 |
| 6 | MinIO/Obsidian 스택 분리 여부 | 별도 결정 (ChurchHub 무관) |
| 7 | 기존 서버의 백업도 이관 or 폐기 | 최소 1회 신규 서버 백업 검증 전까지 기존 보관 |
