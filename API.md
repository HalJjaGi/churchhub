# ChurchHub API 명세서

## 기본 정보

- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`
- **인증**: NextAuth.js 세션 (향후 구현)

---

## 교회 API

### 1. 교회 목록 조회

**GET** `/api/churches`

모든 교회의 목록을 조회합니다.

#### 응답 예시
```json
[
  {
    "id": "clxxxx",
    "slug": "traditional-church",
    "name": "전통교회",
    "description": "따뜻한 공동체, 전통적인 예배",
    "plan": "basic",
    "createdAt": "2026-04-03T08:00:00.000Z"
  }
]
```

#### 상태 코드
- `200 OK`: 성공
- `500 Internal Server Error`: 서버 오류

---

### 2. 교회 생성

**POST** `/api/churches`

새로운 교회를 생성합니다.

#### 요청 바디
```json
{
  "slug": "my-church",
  "name": "나의교회",
  "description": "교회 설명",
  "theme": {
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#6b7280",
      "accent": "#f59e0b",
      "background": "#ffffff"
    },
    "font": "sans-serif",
    "layout": "modern"
  },
  "modules": {
    "sermon": true,
    "notice": true,
    "community": false,
    "gallery": false,
    "donation": false
  },
  "plan": "starter"
}
```

#### 응답 예시
```json
{
  "id": "clxxxx",
  "slug": "my-church",
  "name": "나의교회",
  "description": "교회 설명",
  "theme": "{\"colors\":{...},\"font\":\"sans-serif\",\"layout\":\"modern\"}",
  "modules": "{\"sermon\":true,\"notice\":true,...}",
  "plan": "starter",
  "createdAt": "2026-04-03T08:00:00.000Z",
  "updatedAt": "2026-04-03T08:00:00.000Z"
}
```

#### 상태 코드
- `201 Created`: 생성 성공
- `400 Bad Request`: 필수 필드 누락
- `409 Conflict`: 중복된 slug
- `500 Internal Server Error`: 서버 오류

---

### 3. 특정 교회 조회

**GET** `/api/churches/:slug`

특정 교회의 상세 정보를 조회합니다.

#### 응답 예시
```json
{
  "id": "clxxxx",
  "slug": "traditional-church",
  "name": "전통교회",
  "description": "따뜻한 공동체, 전통적인 예배",
  "theme": {
    "colors": {
      "primary": "#1e3a5f",
      "secondary": "#8b7355",
      "accent": "#d4af37",
      "background": "#faf8f5"
    },
    "font": "serif",
    "layout": "traditional"
  },
  "modules": {
    "sermon": true,
    "notice": true,
    "community": true,
    "gallery": false,
    "donation": false
  },
  "plan": "basic",
  "sermons": [...],
  "notices": [...],
  "createdAt": "2026-04-03T08:00:00.000Z",
  "updatedAt": "2026-04-03T08:00:00.000Z"
}
```

#### 상태 코드
- `200 OK`: 성공
- `404 Not Found`: 교회를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

### 4. 교회 수정

**PUT** `/api/churches/:slug`

특정 교회의 정보를 수정합니다.

#### 요청 바디
```json
{
  "name": "수정된 교회 이름",
  "description": "수정된 설명",
  "theme": {
    "colors": {
      "primary": "#000000"
    }
  },
  "modules": {
    "gallery": true
  }
}
```

#### 응답 예시
```json
{
  "id": "clxxxx",
  "slug": "traditional-church",
  "name": "수정된 교회 이름",
  ...
}
```

#### 상태 코드
- `200 OK`: 수정 성공
- `500 Internal Server Error`: 서버 오류

---

### 5. 교회 삭제

**DELETE** `/api/churches/:slug`

특정 교회를 삭제합니다.

#### 응답 예시
```json
{
  "success": true
}
```

#### 상태 코드
- `200 OK`: 삭제 성공
- `500 Internal Server Error`: 서버 오류

---

## 에러 응답 형식

모든 에러는 다음 형식으로 반환됩니다:

```json
{
  "error": "에러 메시지"
}
```

---

## 데이터 타입

### Theme
```typescript
interface Theme {
  colors: {
    primary: string    // 주요 색상 (hex)
    secondary: string  // 보조 색상 (hex)
    accent: string     // 강조 색상 (hex)
    background: string // 배경색 (hex)
  }
  font: 'serif' | 'sans-serif'
  layout: 'traditional' | 'modern' | 'minimal'
}
```

### Modules
```typescript
interface Modules {
  sermon: boolean    // 설교 모듈
  notice: boolean    // 공지사항 모듈
  community: boolean // 커뮤니티 모듈
  gallery: boolean   // 갤러리 모듈
  donation: boolean  // 헌금 모듈
}
```

### Plan
```typescript
type Plan = 'starter' | 'basic' | 'pro' | 'enterprise'
```

---

## 요청 예시

### cURL

#### 교회 목록 조회
```bash
curl http://localhost:3000/api/churches
```

#### 교회 생성
```bash
curl -X POST http://localhost:3000/api/churches \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "test-church",
    "name": "테스트교회",
    "description": "테스트용 교회입니다"
  }'
```

#### 교회 조회
```bash
curl http://localhost:3000/api/churches/traditional-church
```

#### 교회 수정
```bash
curl -X PUT http://localhost:3000/api/churches/traditional-church \
  -H "Content-Type: application/json" \
  -d '{
    "name": "수정된 전통교회"
  }'
```

#### 교회 삭제
```bash
curl -X DELETE http://localhost:3000/api/churches/test-church
```

### JavaScript (Fetch)

```javascript
// 교회 목록 조회
const churches = await fetch('/api/churches').then(res => res.json())

// 교회 생성
const newChurch = await fetch('/api/churches', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    slug: 'my-church',
    name: '나의교회',
    description: '설명'
  })
}).then(res => res.json())

// 교회 조회
const church = await fetch('/api/churches/my-church').then(res => res.json())

// 교회 수정
const updated = await fetch('/api/churches/my-church', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '수정된 이름' })
}).then(res => res.json())

// 교회 삭제
await fetch('/api/churches/my-church', { method: 'DELETE' })
```
