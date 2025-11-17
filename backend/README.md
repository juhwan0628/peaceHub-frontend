1. peaceHub 백엔드 서버

현재 구현 중
사용자 인증: Google OAuth 2.0을 이용하여 간편 회원가입 & 로그인 기능을 제공

기술 스택
Framework: Node.js, Express.js

Database: MySQL

ORM: Prisma

Authentication: Passport.js (Google OAuth 2.0 Strategy)

Environment Variables: dotenv

FILE DIRECTORY
.
├── config/              # 설정 파일
├── controllers/         # 요청, 응답 처리
├── routes/              # API 경로(엔드포인트) 정의
├── services/            # 비즈니스 로직
├── prisma/              # Prisma 스키마
├── .env                 # 환경 변수
├── app.js               # Express 진입점
├── prismaClient.js      # Prisma 클라이언트 싱글톤 인스턴스
└── package.json


Node.js

MySQL 데이터베이스

Google Cloud Console에서 발급받은 OAuth 2.0 클라이언트 ID 및 시크릿

2. 설치 및 설정
# 1. 프로젝트 클론
git clone <repository-url>
cd peaceHub

# 2. 의존성 패키지 설치
npm install

# 3. .env 파일 생성, 환경 변수 설정
# 프로젝트 루트에 .env 파일을 생성 및 내용 작성 필요
.env

# MYSQL
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

# Google OAuth(google cloud)
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

3. 데이터베이스 설정
# Prisma 스키마를 기반으로 데이터베이스에 테이블을 생성
npx prisma migrate dev

# Prisma 클라이언트를 생성
npx prisma generate

4. 서버 실행
# 개발 모드로 서버를 실행 (nodemon 사용)
nodemon app.js

개발 실행 포트: http://localhost:3000

API 명세
Auth (인증)
GET /api/auth/google
설명: Google OAuth 인증 프로세스를 시작. 사용자는 이 엔드포인트로 접근 시 구글 로그인 페이지로 리디렉션

성공 응답: 구글 로그인 페이지로 리디렉션.

GET /api/auth/google/callback
설명: 사용자가 구글 로그인한 후 리디렉션되는 콜백 URL. 서버에서 해당 사용자를 데이터베이스에 등록 or 조회

성공 응답:

코드: 200 OK

내용:

{
  "message": "Google login successful",
  "user": {
    "id": "clx...",
    "googleId": "109...",
    "email": "user@example.com",
    "name": "홍길동",
    "createdAt": "2025-10-12T00:00:00.000Z",
    "updatedAt": "2025-10-12T00:00:00.000Z",
    "roomId": null
  }
}
