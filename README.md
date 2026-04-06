# ChurchHub - 교회 웹사이트 플랫폼

다중 테넌시 교회 웹사이트 플랫폼 MVP

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가하세요:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. 데이터베이스 설정
```bash
# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 스키마 적용
npm run db:push

# 시드 데이터 생성
npm run db:seed
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📋 기능

### ✅ 구현된 기능
- ✅ 다중 테넌시 (서브도메인 기반 라우팅)
- ✅ 교회별 테마 설정 (색상, 폰트)
- ✅ 모듈 활성화/비활성화
- ✅ 설교 관리
- ✅ 공지사항 관리
- ✅ 관리자 대시보드
- ✅ XSS 방지 (dangerouslySetInnerHTML 제거)
- ✅ TypeScript strict 모드
- ✅ **NextAuth.js 인증 시스템** (Credentials Provider)
- ✅ **미들웨어 기반 권한 체크** (관리자 페이지 보호)
- ✅ **API 라우트 보안** (GET 제외 인증 필요)

### 🔜 향후 계획
- 🔲 이미지 갤러리
- 🔲 온라인 헌금
- 🔲 커뮤니티 기능
- 🔲 Cloudflare D1 배포

## 🛠️ 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (Prisma ORM)
- **Auth**: NextAuth.js v5

## 📁 프로젝트 구조

```
church-platform/
├── app/
│   ├── api/
│   │   ├── churches/          # 교회 CRUD API
│   │   └── auth/              # NextAuth.js
│   ├── church/[slug]/         # 교회 공개 페이지
│   ├── admin/                 # 관리자 페이지
│   │   └── [slug]/            # 개별 교회 관리
│   ├── login/                 # 로그인 페이지
│   └── page.tsx               # 플랫폼 메인
├── lib/
│   └── prisma.ts              # Prisma 클라이언트
├── prisma/
│   ├── schema.prisma          # 데이터베이스 스키마
│   └── seed.ts                # 시드 데이터
└── middleware.ts              # 서브도메인 라우팅
```

## 🔐 보안

### XSS 방지
```tsx
// ❌ Before (위험)
<style dangerouslySetInnerHTML={{ __html: generateThemeCSS(theme) }} />

// ✅ After (안전)
<div style={{
  '--color-primary': theme.colors.primary,
  '--color-secondary': theme.colors.secondary,
} as React.CSSProperties}>
```

## 📚 API 명세

### 교회 목록 조회
```
GET /api/churches
```

### 교회 생성
```
POST /api/churches
Body: {
  "slug": "my-church",
  "name": "나의교회",
  "description": "교회 설명",
  "theme": { ... },
  "modules": { ... }
}
```

### 특정 교회 조회
```
GET /api/churches/:slug
```

### 교회 수정
```
PUT /api/churches/:slug
Body: { ... }
```

### 교회 삭제
```
DELETE /api/churches/:slug
```

## 🗄️ 데이터베이스 모델

### Church
- `id`: 고유 식별자
- `slug`: URL용 식별자 (unique)
- `name`: 교회 이름
- `description`: 교회 설명
- `theme`: 테마 설정 (JSON)
- `modules`: 활성 모듈 (JSON)
- `plan`: 요금제 (starter/basic/pro/enterprise)

### User
- `id`: 고유 식별자
- `email`: 이메일 (unique)
- `name`: 이름
- `role`: 역할 (admin/editor/member)
- `churchId`: 소속 교회 ID

### Sermon
- `id`: 고유 식별자
- `title`: 설교 제목
- `content`: 설교 내용
- `speaker`: 설교자
- `date`: 설교 날짜
- `churchId`: 소속 교회 ID

### Notice
- `id`: 고유 식별자
- `title`: 공지 제목
- `content`: 공지 내용
- `churchId`: 소속 교회 ID

## 🧪 테스트

### 데모 데이터
시드 데이터를 실행하면 다음 데모 교회가 생성됩니다:
- **전통교회** (traditional-church) - 전통적인 테마
- **모던교회** (modern-church) - 현대적인 테마
- **미니멀교회** (minimal-church) - 미니멀 테마

### 관리자 계정
- Email: `admin@churchhub.dev`
- Password: `admin123!`

### 인증 테스트 방법

#### 1. 로그인 테스트
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 접속
http://localhost:3000/login

# 관리자 계정으로 로그인
Email: admin@churchhub.dev
Password: admin123!
```

#### 2. 권한 테스트

**미인증 사용자 접근 제한:**
```bash
# 관리자 페이지 직접 접근 시도 → 로그인 페이지로 리다이렉트
http://localhost:3000/admin

# API POST 요청 → 401 Unauthorized
curl -X POST http://localhost:3000/api/churches \
  -H "Content-Type: application/json" \
  -d '{"slug":"test","name":"테스트교회"}'
# 응답: {"error":"Unauthorized"}
```

**인증된 관리자 접근:**
```bash
# 로그인 후 관리자 페이지 접근 가능
http://localhost:3000/admin

# API POST 요청 (세션 쿠키 필요)
# 브라우저에서 로그인 후 개발자 도구 → Application → Cookies 확인
# next-auth.session-token 쿠키가 있어야 함
```

#### 3. API 보안 테스트

**GET 요청 (인증 불필요):**
```bash
# 교회 목록 조회 - 누구나 가능
curl http://localhost:3000/api/churches

# 특정 교회 조회 - 누구나 가능
curl http://localhost:3000/api/churches/traditional-church
```

**POST/PUT/DELETE 요청 (관리자 인증 필요):**
```bash
# 교회 생성 - 로그인 필요
curl -X POST http://localhost:3000/api/churches \
  -H "Content-Type: application/json" \
  -d '{"slug":"test-church","name":"테스트교회"}'
# 응답: {"error":"Unauthorized"} (로그인하지 않은 경우)

# 교회 수정 - 관리자 권한 필요
curl -X PUT http://localhost:3000/api/churches/traditional-church \
  -H "Content-Type: application/json" \
  -d '{"name":"수정된 이름"}'
# 응답: {"error":"Unauthorized"} (관리자가 아닌 경우)

# 교회 삭제 - 관리자 권한 필요
curl -X DELETE http://localhost:3000/api/churches/traditional-church
# 응답: {"error":"Unauthorized"} (관리자가 아닌 경우)
```

#### 4. 세션 테스트

로그인 후 세션 정보 확인:
```javascript
// 브라우저 콘솔에서 실행
// 클라이언트 세션 확인
fetch('/api/auth/session')
  .then(res => res.json())
  .then(data => console.log('Session:', data))
```

#### 5. 로그아웃 테스트

```bash
# 브라우저에서
http://localhost:3000/api/auth/signout

# 또는 프로그래밍 방식
import { signOut } from 'next-auth/react'
signOut()
```

### 보안 체크리스트

- [x] 비밀번호 해시 저장 (bcrypt)
- [x] 세션 기반 인증 (JWT)
- [x] 관리자 페이지 접근 제어
- [x] API 라우트 권한 검사
- [x] 환경 변수로 민감 정보 관리
- [x] XSS 방지
- [x] TypeScript 타입 안전성
- [x] CSRF 보호 (NextAuth.js 자동 관리)

## 📝 라이선스

MIT License
