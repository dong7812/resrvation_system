# 예약 관리 시스템

케이터링/음식점 예약 관리자 대쉬보드

## 기술 스택

- **Frontend**: Next.js 14 (App Router) + React + TanStack Query + Zustand
- **Backend**: NestJS + TypeORM + PostgreSQL
- **AI 파싱**: Anthropic Claude SDK
- **이메일**: node-imap (IMAP 폴링)
- **인증**: JWT

## 시작하기

### 1. 환경변수 설정

```bash
cp apps/backend/.env.example apps/backend/.env
# .env 파일에 실제 값 입력
```

### 2. 의존성 설치 & 실행

```bash
# 루트에서
npm install

# Backend
cd apps/backend && npm install && npm run start:dev

# Frontend (새 터미널)
cd apps/frontend && npm install && npm run dev
```

### 3. 접속

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Swagger: http://localhost:4000/api

## 프로젝트 구조

```
reservation-system/
├── apps/
│   ├── frontend/          # Next.js App Router
│   │   ├── app/dashboard/ # 대쉬보드 페이지들
│   │   ├── components/    # React 컴포넌트
│   │   ├── hooks/         # TanStack Query 훅
│   │   ├── stores/        # Zustand 스토어
│   │   └── lib/           # API 클라이언트
│   └── backend/           # NestJS API 서버
│       └── src/
│           ├── reservations/  # 예약 CRUD
│           ├── email/         # IMAP 이메일 폴링
│           ├── ai/            # Claude AI 파싱
│           └── auth/          # JWT 인증
└── README.md
```

## 향후 계획

- [ ] Android 앱 연동 (Kotlin + Retrofit)
- [ ] 고객용 예약 대쉬보드
- [ ] 카카오톡 알림 연동
- [ ] 예약 확인 자동 이메일 발송
