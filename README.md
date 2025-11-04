# 🗓️ MCP Calendar

LLM 기반 자동화 기능을 갖춘 캘린더 및 가계부 웹 애플리케이션

## 🚀 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS
- **State Management**: TanStack Query (React Query)

### Backend
- **Language**: Kotlin
- **Framework**: Spring Boot 3.2
- **ORM**: Exposed ORM
- **Database**: PostgreSQL 16
- **LLM**: Anthropic Claude API (Spring AI)
- **Auth**: Spring Security + JWT

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Deployment**: Vercel (Frontend), Railway (Backend)

---

## 📋 주요 기능

✅ **캘린더**
- 일정 CRUD (생성/조회/수정/삭제)
- 자연어 기반 일정 등록 (LLM)
- 월별/주별/일별 뷰

✅ **가계부**
- 수입/지출 기록
- 자동 반복 일정 (월급, 월회비)
- 자연어 기반 가계부 등록 (LLM)
- 월별 수입/지출 요약

✅ **LLM 통합**
- Claude API 기반 자연어 파싱
- 텍스트 → 구조화된 데이터 변환

✅ **MCP 통합** (예정)
- 날씨 정보 조회
- 의상 추천
- 확장 가능한 MCP 서버 구조

---

## 🛠️ 빠른 시작

### 1. 사전 요구사항

- Docker Desktop 설치
- Node.js 20+ (로컬 개발 시)
- JDK 21+ (로컬 개발 시)
- Claude API Key

### 2. 환경 설정
```bash
# 저장소 클론
git clone <repository-url>
cd MCP_calender

# 환경변수 파일 생성
cp .env.dev.example .env.dev

# .env.dev 파일 편집
# CLAUDE_API_KEY=your-api-key-here
```

### 3. 실행 (개발 환경)
```bash
# Docker Compose로 전체 환경 실행
docker-compose --env-file .env.dev up --build

# 백그라운드 실행
docker-compose --env-file .env.dev up --build -d

# 로그 확인
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. 접속

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **PostgreSQL**: localhost:5432

---

## 📦 프로젝트 구조
```
MCP_calender/
├── docker-compose.yml       # Docker 오케스트레이션
├── .env.dev                # 개발 환경변수
├── .env.prod               # 프로덕션 환경변수
│
├── frontend/               # Next.js 프론트엔드
│   ├── Dockerfile
│   ├── src/
│   │   ├── app/           # App Router
│   │   ├── components/    # React 컴포넌트
│   │   ├── lib/           # 유틸리티
│   │   └── types/         # TypeScript 타입
│   └── package.json
│
└── backend/                # Kotlin Spring Boot 백엔드
    ├── Dockerfile
    └── src/
        └── main/
            ├── kotlin/
            │   └── com/mcp/calendar/
            │       ├── controller/
            │       ├── service/
            │       ├── repository/
            │       ├── model/
            │       └── dto/
            └── resources/
                └── application.yml
```

---

## 🔧 개발 명령어

### Docker 관련
```bash
# 전체 실행
docker-compose --env-file .env.dev up --build

# 특정 서비스만 재시작
docker-compose restart backend
docker-compose restart frontend

# 전체 종료
docker-compose down

# DB 포함 완전 삭제 (초기화)
docker-compose down -v

# 로그 확인
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Frontend (로컬 개발)
```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start

# 타입 체크
npm run type-check

# Lint
npm run lint
```

### Backend (로컬 개발)
```bash
cd backend

# 빌드
./gradlew build

# 실행
./gradlew bootRun

# 테스트
./gradlew test

# 클린 빌드
./gradlew clean build
```

---

## 🚢 프로덕션 배포

### 1. 환경변수 설정
```bash
# .env.prod 파일 편집
POSTGRES_PASSWORD=secure_password
CLAUDE_API_KEY=your_production_key
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### 2. 배포 실행
```bash
# 프로덕션 빌드 + 실행
docker-compose --env-file .env.prod up --build -d

# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f
```

---

## 🔐 보안 고려사항

- ✅ JWT 기반 인증
- ✅ 비밀번호 BCrypt 암호화
- ✅ CORS 설정
- ✅ HTTPS 통신 (프로덕션)
- ✅ 환경변수로 민감 정보 관리
- ✅ Non-root Docker 사용자

---

## 📝 API 문서

### 인증
```
POST /api/auth/register   # 회원가입
POST /api/auth/login      # 로그인
```

### 일정
```
GET    /api/events        # 일정 목록
POST   /api/events        # 일정 생성
GET    /api/events/{id}   # 일정 상세
PUT    /api/events/{id}   # 일정 수정
DELETE /api/events/{id}   # 일정 삭제
```

### 가계부
```
GET    /api/transactions          # 거래 목록
POST   /api/transactions          # 거래 생성
GET    /api/transactions/{id}     # 거래 상세
PUT    /api/transactions/{id}     # 거래 수정
DELETE /api/transactions/{id}     # 거래 삭제
GET    /api/transactions/summary  # 요약
```

### LLM
```
POST /api/llm/parse-event       # 자연어 → 일정
POST /api/llm/parse-transaction # 자연어 → 가계부
```

---

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

MIT License

---

## 📧 문의

프로젝트 관련 문의: your-email@example.com