# 🏠 peaceHub

> 룸메이트와 함께하는 평화로운 공동생활 - 공정한 집안일 분배 시스템

peaceHub는 룸메이트들이 각자의 시간표와 선호도를 기반으로 집안일을 **자동으로 공정하게 배분**받아, 갈등 없이 조화로운 생활을 만들어가는 플랫폼입니다.

## 🎯 핵심 기능

- 🔐 **Google OAuth 로그인** - 간편한 소셜 로그인
- 🏠 **방 생성/참여** - 6자리 초대 코드로 룸메이트 초대
- 📅 **주간 타임테이블** - 각자의 스케줄을 조용시간/외출/업무 시간으로 구분
- 🎲 **공정한 업무 배정** - 그리디 알고리즘 기반 자동 배정
- 📊 **대시보드** - 모든 룸메이트의 일정을 한눈에

## 🛠️ 기술 스택

### Backend
- Node.js + Express.js
- MySQL + Prisma ORM
- Passport.js (Google OAuth 2.0)
- Jest + Supertest (테스팅)

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- SWR (데이터 페칭)
- Zustand (상태 관리)

## 🚀 시작하기

자세한 개발 가이드는 [CLAUDE.md](./CLAUDE.md)를 참고하세요.

### 1. Backend 실행

```bash
cd backend

# 의존성 설치
npm install

# 환경 변수 설정 (.env 파일 생성 필요)
# DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET

# Prisma 마이그레이션
npx prisma migrate dev
npx prisma generate

# 개발 서버 시작 (포트 8000)
nodemon app.js
```

### 2. Frontend 실행

```bash
cd frontend

# 의존성 설치
npm install

# 환경 변수 설정 (.env.local 파일 생성)
# NEXT_PUBLIC_API_URL=http://localhost:8000

# 개발 서버 시작 (포트 3000)
npm run dev
```

## 📁 프로젝트 구조

```
peaceHub/
├── backend/          # Node.js API 서버
│   ├── config/       # Passport 설정
│   ├── controllers/  # 요청/응답 처리
│   ├── routes/       # API 엔드포인트
│   ├── services/     # 비즈니스 로직
│   ├── middlewares/  # 인증, 검증 미들웨어
│   └── prisma/       # 데이터베이스 스키마
│
├── frontend/         # Next.js 프론트엔드
│   ├── app/          # App Router 페이지
│   ├── components/   # 재사용 컴포넌트
│   ├── store/        # Zustand 스토어
│   ├── lib/          # API 클라이언트
│   └── types/        # TypeScript 타입
│
└── CLAUDE.md         # 개발 가이드
```

## 🎨 디자인 시스템

peaceHub는 **미니멀한 디자인 철학**을 따릅니다.

- **Primary (Lime Green)**: `#8DC63F` - 모든 버튼, 활성 상태
- **Accent (Coral Pink)**: `#FF9AA2` - 외출 시간, 긴급 알림
- **Brand (SKKU Blue)**: `#0B7BC1` - 로고 전용
- **Neutral**: Gray scale (50-900) - 텍스트, 배경

## 📝 개발 진행 상황

### ✅ 완료
- [x] Backend API (인증, 방, 스케줄)
- [x] Frontend 기반 설정 (Tailwind, shadcn/ui)
- [x] 로그인 페이지
- [x] 온보딩 플로우 (Step 1, 2)

### 🚧 진행 중
- [ ] 타임테이블 인터랙티브 그리드 (Step 3)

### 📋 계획
- [ ] 메인 대시보드
- [ ] 업무 선호도 제출
- [ ] 그리디 알고리즘 배정
- [ ] 배정 결과 표시

자세한 로드맵은 [CLAUDE.md](./CLAUDE.md#roadmap--next-steps)를 참고하세요.

## 📄 라이선스

MIT

## 👥 기여자

- [@juhwan0628](https://github.com/juhwan0628)

---

**🤖 Made with ❤️ and Claude Code**
