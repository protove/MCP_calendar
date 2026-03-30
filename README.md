# 🗓️ MCP Calendar

> **LLM(Gemini) 기반 스마트 캘린더 & 가계부** — 자연어 대화로 일정 관리, 지출 추적, 날씨 확인까지 한 번에

[![Live Demo](https://img.shields.io/badge/Live-mcp--calendar.dev-blue?style=flat-square)](https://mcp-calendar.dev)

<br>

## 📌 프로젝트 소개

MCP Calendar는 **Model Context Protocol(MCP)** 아키텍처를 기반으로, LLM이 18개의 도구를 직접 호출하여 사용자의 요청을 처리하는 풀스택 애플리케이션입니다.

"다음 주 수요일 오후 3시에 팀 미팅 잡아줘", "이번 달 식비 얼마 썼어?", "내일 서울 날씨 어때?" 같은 자연어 명령을 이해하고 실행합니다.

### 핵심 차별점
- **MCP 서버 직접 구현** — 18개 도구(캘린더 6 + 가계부 9 + 날씨 3) 정의 및 Function Calling 연동
- **SSE 스트리밍** — LLM 응답을 실시간으로 클라이언트에 전달
- **프로덕션 인프라** — Terraform IaC로 AWS ECS Fargate, RDS, ElastiCache, ALB, ACM, CI/CD 구성

<br>

## 🏗️ 아키텍처

```
Client (Browser)
    │
    ▼ HTTPS
Cloudflare DNS (SSL Full Strict)
    │
    ▼ HTTPS (TLS 1.3)
ALB (ACM Certificate)
    ├── /api/*  → ECS Fargate (Backend :8080)
    │                ├── PostgreSQL (RDS Multi-AZ)
    │                ├── Redis (ElastiCache)
    │                └── Gemini API (Function Calling)
    │
    └── Vercel (Frontend - Next.js)
```

```
┌─────────────────────────────────────────────────┐
│  Chat Request: "내일 팀 미팅 잡아줘"              │
│         ↓                                        │
│  Gemini LLM ──Function Calling──→ MCP Server     │
│         │                          ├ create_event │
│         │                          ├ get_weather  │
│         │                          └ ...18 tools  │
│         ↓                                        │
│  SSE Stream → "내일 팀 미팅을 등록했습니다 ✓"      │
└─────────────────────────────────────────────────┘
```

<br>

## 🛠️ 기술 스택

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, FullCalendar, Recharts, Framer Motion, TanStack Query |
| **Backend** | Spring Boot 3.2, Kotlin, Exposed ORM, Spring Security, WebFlux |
| **Auth** | JWT (Access + Refresh Token), Redis 세션 관리 |
| **AI/LLM** | Google Gemini API, Function Calling, SSE Streaming |
| **Database** | PostgreSQL 16 (RDS Multi-AZ), Redis 7 (ElastiCache) |
| **Infra** | AWS ECS Fargate, ALB, ACM (TLS 1.3), VPC, CloudWatch |
| **CI/CD** | AWS CodePipeline, CodeBuild, ECR |
| **IaC** | Terraform (6개 모듈, 21개 리소스 파일) |
| **DNS/CDN** | Cloudflare (SSL Full Strict), Vercel |

<br>

## ✨ 주요 기능

### 💬 AI 채팅 (MCP + Function Calling)
- 자연어로 일정 생성/조회/수정/삭제
- 자연어로 수입/지출 기록 및 통계 조회
- 날씨 조회 및 옷차림 추천
- SSE 스트리밍으로 실시간 응답
- 멀티턴 대화 컨텍스트 유지

### 📅 캘린더
- 월간/주간/일간 뷰 (FullCalendar)
- 카테고리별 일정 관리 (업무, 개인, 회의, 중요)
- 드래그 앤 드롭 일정 이동
- 미니 캘린더 네비게이션

### 💰 가계부
- 수입/지출 CRUD 및 카테고리 분류
- 월별 요약 통계 (수입, 지출, 잔액)
- 카테고리별 지출 차트 (Recharts)
- 월별 추이 그래프
- 기간별 필터링

### 🌤️ 날씨
- 실시간 현재 날씨 (OpenWeather API)
- 5일 예보
- AI 기반 옷차림 추천
- 30분 캐시 (Redis)

### 🔐 인증
- JWT Access Token (30분) + Refresh Token (7일)
- Redis 기반 Refresh Token 관리
- 자동 토큰 갱신

<br>

## 🚀 MCP 도구 목록 (18개)

| 분류 | 도구명 | 설명 |
|------|--------|------|
| **캘린더** | `create_event` | 새 일정 생성 |
| | `get_event` | 일정 단건 조회 |
| | `list_events` | 전체 일정 목록 |
| | `get_monthly_events` | 월별 일정 조회 |
| | `update_event` | 일정 수정 |
| | `delete_event` | 일정 삭제 |
| **가계부** | `create_transaction` | 수입/지출 기록 |
| | `get_transaction` | 거래 단건 조회 |
| | `list_transactions` | 전체 거래 목록 |
| | `get_monthly_transactions` | 월별 거래 조회 |
| | `get_transactions_by_date_range` | 기간별 조회 |
| | `get_monthly_summary` | 월별 수입/지출 요약 |
| | `get_category_expense_stats` | 카테고리별 통계 |
| | `update_transaction` | 거래 수정 |
| | `delete_transaction` | 거래 삭제 |
| **날씨** | `get_current_weather` | 현재 날씨 |
| | `get_weather_forecast` | 5일 예보 |
| | `get_clothing_recommendation` | 옷차림 추천 |

<br>

## 📁 프로젝트 구조

```
MCP_calendar/
├── backend/                          # Spring Boot + Kotlin
│   └── src/main/kotlin/com/mcp/calendar/
│       ├── config/                   # Security, CORS, Redis, WebFlux 설정
│       ├── controller/               # REST API 엔드포인트
│       ├── service/                  # 비즈니스 로직 + MCP 도구 실행
│       ├── model/                    # Exposed ORM 테이블 정의
│       ├── dto/                      # 요청/응답 DTO
│       ├── repository/               # 데이터 접근 계층
│       └── exception/                # 전역 예외 처리
│
├── frontend/                         # Next.js 15 + React 19
│   └── src/
│       ├── app/                      # App Router 페이지
│       │   ├── (auth)/               # 로그인, 회원가입
│       │   ├── calendar/             # 캘린더 페이지
│       │   └── ledger/               # 가계부 페이지
│       ├── components/               # UI 컴포넌트
│       │   ├── chat/                 # LLM 채팅 인터페이스
│       │   ├── calendar/             # 캘린더 뷰, 이벤트 폼
│       │   ├── dashboard/            # 대시보드 위젯
│       │   ├── ledger/               # 가계부 차트, 거래 관리
│       │   └── ui/                   # 공통 UI (Button, Modal, Card...)
│       ├── lib/                      # API 클라이언트, 유틸리티
│       └── types/                    # TypeScript 타입 정의
│
├── terraform/                        # AWS 인프라 (IaC)
│   ├── environments/dev-free-tier/   # 환경별 설정
│   └── modules/
│       ├── networking/               # VPC, 서브넷, 보안그룹
│       ├── compute-free-tier/        # ECS Fargate, ALB, ACM, Auto Scaling
│       ├── database-free-tier/       # RDS PostgreSQL, ElastiCache Redis
│       ├── storage/                  # ECR, S3
│       ├── cicd/                     # CodePipeline, CodeBuild
│       └── monitoring/               # CloudWatch, SNS 알람
│
└── docker-compose.yml                # 로컬 개발 환경
```

<br>

## ☁️ AWS 인프라 (Terraform)

| 모듈 | 리소스 | 설명 |
|------|--------|------|
| **Networking** | VPC, Subnet×4, IGW, SG | 퍼블릭 2AZ + 프라이빗 2AZ |
| **Compute** | ECS Fargate, ALB, ACM | TLS 1.3, Auto Scaling (CPU 70%), Health Check |
| **Database** | RDS PostgreSQL 16 | Multi-AZ, gp3 암호화, 자동 백업 |
| **Cache** | ElastiCache Redis 7 | Replication Group, 자동 Failover, 암호화 |
| **Storage** | ECR, S3 | 이미지 스캐닝, 라이프사이클 정책 |
| **CI/CD** | CodePipeline, CodeBuild | GitHub → Build → ECR Push → ECS Deploy |
| **Monitoring** | CloudWatch, SNS | CPU/Memory 80% 알람, 이메일 알림 |

<br>

## 🛠️ 로컬 개발 환경

### 사전 요구사항
- Docker Desktop
- Git

### 설정 및 실행

```bash
# 1. 클론
git clone https://github.com/protove/MCP_calendar.git
cd MCP_calendar

# 2. 환경변수 설정
cp .env.dev.example .env.dev
# .env.dev 파일에 GEMINI_API_KEY, WEATHER_API_KEY 등 입력

# 3. 실행
docker-compose --env-file .env.dev up --build -d
```

### 접속
| 서비스 | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Health Check | http://localhost:8080/api/health |

<br>

## 📌 API 엔드포인트

<details>
<summary>전체 API 목록 (클릭하여 펼치기)</summary>

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 (JWT 발급) |
| POST | `/api/auth/refresh` | 토큰 갱신 |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/auth/me` | 내 정보 조회 |

### Calendar
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events` | 일정 생성 |
| GET | `/api/events/{id}` | 일정 조회 |
| GET | `/api/events` | 전체 일정 |
| GET | `/api/events/monthly` | 월별 일정 |
| PUT | `/api/events/{id}` | 일정 수정 |
| DELETE | `/api/events/{id}` | 일정 삭제 |

### Ledger
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions` | 거래 생성 |
| GET | `/api/transactions/{id}` | 거래 조회 |
| GET | `/api/transactions` | 전체 거래 |
| GET | `/api/transactions/monthly` | 월별 거래 |
| GET | `/api/transactions/summary` | 월별 요약 |
| PUT | `/api/transactions/{id}` | 거래 수정 |
| DELETE | `/api/transactions/{id}` | 거래 삭제 |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | 채팅 (JSON) |
| POST | `/api/chat/stream` | 채팅 (SSE 스트리밍) |
| DELETE | `/api/chat/{conversationId}` | 대화 초기화 |

### Weather
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather/current` | 현재 날씨 |
| GET | `/api/weather/forecast` | 5일 예보 |
| GET | `/api/weather/recommendation` | 옷차림 추천 |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | 서비스 상태 (DB, Redis) |

</details>

<br>

## 📊 버전 히스토리

| 버전 | 주요 변경사항 |
|------|-------------|
| **v1.3.0** | [대규모 트래픽 처리 & 운영 안정성 개선](#-성능-개선-기록) — ALB Stickiness, Gemini Rate Limiting, HikariCP Fail Fast |
| **v1.2.5** | [SSE 스트리밍 Network Error 수정](#-트러블슈팅-v125) — CORS 차단, 직접 fetch URL 프록시 전환 |
| **v1.2.4** | [MCP 도구 실행 허위 성공 & 토큰 자동 갱신 수정](#-트러블슈팅-v124) — Gemini 허위 성공 응답, 401 토큰 갱신 실패 |
| **v1.2.3** | [ECS Health Check 실패 수정](#-트러블슈팅-v123) — Alpine 이미지 curl 미포함, 컨테이너 반복 재시작 |
| **v1.2.2** | [일정/거래 생성 실패 핫픽스](#-트러블슈팅-v122) — DateTime 포맷, CORS, 에러 피드백 |
| **v1.2.1** | ACM SSL 인증서, ALB HTTPS (TLS 1.3), AWS Free Tier 최적화 |
| **v1.2.0** | Terraform 인프라 — ALB, ECS Fargate, Multi-AZ RDS, Auto Scaling, CI/CD Pipeline |
| **v1.1.1** | 날씨 MCP 도구 3종, 대시보드 위젯 연동, 보안 핫픽스 |
| **v1.1.0** | 프론트엔드 리뉴얼 — 우주 테마, 대시보드, 가계부 차트, 반응형 |
| **v1.0.0** | 로컬 POC — MCP 서버,  LLM Function Calling, JWT 인증, 캘린더/가계부 CRUD |

<br>

## � 성능 개선 기록

> **Issue:** [#8 — 대규모 트래픽 처리 — ALB Stickiness, Gemini Rate Limiting, HikariCP Fail Fast](https://github.com/protove/MCP_calendar/issues/8)

### Part 1: 대규모 트래픽 대응

k6로 300 VU 부하 테스트를 실행해 Auto Scaling 발동을 확인하고,
스케일 아웃 상황을 보며 Terraform 코드를 점검해
잠재적 문제를 발굴했습니다.

| 항목 | Before | After |
|------|--------|-------|
| ECS Auto Scaling | CPU 85% → Task 1→2 스케일 아웃 확인 | 동일 |
| SSE 연결 안정성 | Stickiness 없어 Task 증가 시 끊김 가능 | lb_cookie Stickiness 적용으로 선제 해결 |

### Part 2: 운영 안정성 개선

코드 리뷰를 통해 발견한 잠재적 문제를 개선했습니다.

| 문제 | 발견 방법 | 개선 내용 |
|------|----------|----------|
| Gemini Rate Limiting 없음 | GeminiService 코드 리뷰 | Redis 슬라이딩 윈도우 (분당 10회 / 일 50회) |
| HikariCP timeout 30초 | application.yml 코드 리뷰 | 3초로 단축 (Fail Fast, 장애 전파 차단) |

### 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `terraform/modules/compute-free-tier/main.tf` | ALB Target Group에 `lb_cookie` stickiness (3600초) 추가 |
| `backend/.../service/RateLimitService.kt` | Redis Sorted Set 슬라이딩 윈도우 Rate Limiting 구현 |
| `backend/.../service/ChatService.kt` | Rate Limit 체크 통합 (chat/chatStream) |
| `backend/.../resources/application.yml` | HikariCP connection-timeout 30s → 3s |

<br>

## �🔧 트러블슈팅 (v1.2.5)

> **Issue:** [#6 — SSE 스트리밍 채팅 Network Error — CORS 차단 및 직접 fetch URL 문제](https://github.com/protove/MCP_calendar/issues/6)

### 증상
- LLM 채팅 요청(SSE 스트리밍) 시 `Network Error` 발생
- 일반 API 요청(일정/거래 CRUD 등)은 정상 동작

### 원인 분석

#### SSE 스트리밍의 직접 fetch 호출 → CORS 차단 🔴

```
일반 API 요청 → axios → baseURL 사용 → 정상
SSE 스트리밍  → fetch(${apiUrl}/chat/stream) → 브라우저에서 백엔드 직접 호출
                         ↓
브라우저 cross-origin 요청 → CORS preflight 필요
                         ↓
CORS_ALLOWED_ORIGINS에 Vercel 도메인 누락 또는
NEXT_PUBLIC_API_URL 미설정 → http://localhost:8080 fallback
                         ↓
Network Error
```

- `streamChat()` 함수가 `process.env.NEXT_PUBLIC_API_URL`로 백엔드에 직접 `fetch` 호출
- 일반 API는 Next.js rewrite proxy를 경유할 수 있지만, SSE fetch는 직접 호출
- Vercel에서 `NEXT_PUBLIC_API_URL` 미설정 시 `http://localhost:8080/api` fallback → 당연히 실패
- CORS에 Vercel preview 도메인(`*.vercel.app`) 미포함

### 수정

**`frontend/src/lib/api.ts`** — streamChat 프록시 전환:
```typescript
// Before: 브라우저에서 백엔드로 직접 fetch (CORS 필요)
fetch(`${apiUrl}/chat/stream`, { ... })

// After: 상대 경로로 Next.js rewrite proxy 경유 (CORS 불필요)
fetch('/api/chat/stream', { ... })
```

**`frontend/next.config.js`** — rewrite destination fallback:
```javascript
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
```

**`SecurityConfig.kt`** — Vercel 도메인 안전망:
```kotlin
origins.add("https://*.vercel.app")  // preview/production 도메인 패턴
```

### 결과
- SSE 요청이 Next.js rewrite proxy를 경유하여 same-origin 요청으로 처리 → CORS 불필요
- `NEXT_PUBLIC_API_URL` 미설정 시에도 개발환경 fallback 동작
- Vercel preview 배포에서도 직접 API 호출 가능 (CORS 안전망)

### 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `frontend/src/lib/api.ts` | streamChat fetch URL을 상대 경로(`/api/chat/stream`)로 변경 |
| `frontend/next.config.js` | rewrite destination에 `NEXT_PUBLIC_API_URL` fallback 추가 |
| `backend/.../config/SecurityConfig.kt` | CORS에 `https://*.vercel.app` 패턴 추가 |

### ⚠️ Vercel 환경변수 설정 필요

Next.js rewrite proxy가 올바른 백엔드로 프록시하려면 **Vercel 대시보드**에서 환경변수를 설정해야 합니다:

```
NEXT_PUBLIC_API_URL = https://api.mcp-calendar.dev/api
```

<br>

## 🔧 트러블슈팅 (v1.2.4)

> **Issue:** [#4 — MCP 도구 실행 허위 성공 응답 & Refresh Token 미작동](https://github.com/protove/MCP_calendar/issues/4)

### 증상

**Bug #1 — MCP 도구 실행 허위 성공:**
- LLM 채팅에서 "일정을 추가했습니다" 등 성공 응답을 보여주지만 실제 데이터가 저장되지 않음
- Gemini가 Function Calling 결과의 에러 메시지를 성공으로 오해하여 사용자에게 거짓 확인

**Bug #2 — Refresh Token 미작동:**
- 로그인 후 30분(Access Token 만료) 이후 접속 시 로그인 상태는 유지되나 대시보드 데이터 로드 실패
- 401 응답 시 Refresh Token 갱신 시도 없이 즉시 로그아웃 처리

### 원인 분석

#### Bug #1: Function Response에 성공/실패 구분 없음 🔴

```
MCP Tool 실행 → 예외 발생 → catch에서 에러 문자열 반환
                         ↓
functionResponse = { result: "에러 메시지" }
                         ↓
성공/실패 필드 없음 → Gemini가 에러 메시지를 결과로 해석
                         ↓
"일정을 추가했습니다" 허위 응답 생성
```

#### Bug #2: Axios 인터셉터가 토큰 갱신 없이 즉시 로그아웃 🔴

```
Access Token 만료 (30분) → API 호출 → 401 Unauthorized
                         ↓
response interceptor: 즉시 localStorage 클리어 + /login 리다이렉트
                         ↓
Refresh Token이 있음에도 /auth/refresh 호출 안함
                         ↓
대시보드 데이터 로드 실패 + 강제 로그아웃
```

### 수정

**Bug #1 — `ChatService.kt`:**
- `ToolExecutionResult(success: Boolean, message: String)` 데이터 클래스 추가
- `executeToolCall()`이 성공 시 `ToolExecutionResult(true, result)`, 실패 시 `ToolExecutionResult(false, error)` 반환
- `functionResponse`에 `"success"` 필드 포함: `mapOf("success" to toolResult.success, "result" to toolResult.message)`

**Bug #1 — `SystemPrompt.kt`:**
- Gemini 시스템 프롬프트에 `success` 필드 확인 지시 추가
- `success: false` → 사용자에게 실패 알림, `success: true` → 성공 응답

**Bug #2 — `api.ts` Axios 인터셉터:**
- `isRefreshing` + `failedQueue` 패턴으로 동시 401 처리
- 401 응답 시 `/auth/refresh` 호출 → 성공하면 원래 요청 재시도
- Refresh 실패 시에만 로그아웃 처리

**Bug #2 — `api.ts` streamChat (SSE):**
- `refreshAccessToken()` 헬퍼 + `doFetch()` 재귀 패턴
- 401 응답 시 토큰 갱신 후 새 토큰으로 재시도

### 결과
- MCP 도구 실행 실패 시 Gemini가 정확히 "실패했습니다" 메시지 전달
- Access Token 만료 후에도 자동 갱신으로 대시보드 데이터 정상 로드
- 동시 다발 401 요청도 큐 처리로 안정적 갱신

### 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `backend/.../service/ChatService.kt` | `ToolExecutionResult` 추가, `functionResponse`에 success 필드 포함 |
| `backend/.../config/SystemPrompt.kt` | success 필드 확인 지시 추가 |
| `frontend/src/lib/api.ts` | 401 자동 토큰 갱신 인터셉터 + streamChat 토큰 갱신 |

<br>

## 🔧 트러블슈팅 (v1.2.3)

> **Issue:** [#3 — ECS 컨테이너 Health Check 실패 — Alpine 이미지에 curl 미포함](https://github.com/protove/MCP_calendar/issues/3)

### 증상
- ECS 서비스의 태스크가 지속적으로 **UNHEALTHY** 상태로 판정
- 태스크 반복 재시작 (`failedTasks: 889`), 서비스 불안정
- Spring Boot 애플리케이션은 정상 시작 완료 (47초)
- `/api/health` 엔드포인트 자체는 정상 응답 (DB: UP, Redis: UP)

### 원인 분석

#### ECS Health Check 명령과 Docker 이미지 불일치 🔴

```
ECS Task Definition Health Check:
  "curl -f http://localhost:8080/api/health || exit 1"
                    ↓
Docker Image: eclipse-temurin:21-jre-alpine
                    ↓
Alpine Linux에 curl 미포함 → 명령 실패 → UNHEALTHY
                    ↓
ECS가 태스크를 반복 교체하는 무한 루프
```

- Production Docker 이미지가 `eclipse-temurin:21-jre-alpine` 기반
- **Alpine Linux에는 `curl`이 기본 설치되어 있지 않음**
- Health check 명령이 `curl` 바이너리를 찾지 못해 항상 exit 1 반환

### 수정

**`backend/Dockerfile`** (Production Stage):
```dockerfile
FROM eclipse-temurin:21-jre-alpine AS production
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl
```

### 결과
- `failedTasks: 889` → **HEALTHY** 상태 정상화
- ECS 서비스 안정화, ALB Target Group 정상 등록
- API health 엔드포인트 `200 OK` (DB: UP, Redis: UP) 확인

### 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `backend/Dockerfile` | Production 스테이지에 `apk add --no-cache curl` 추가 |

<br>

## 🔧 트러블슈팅 (v1.2.2)

> **Issue:** [#1 — 캘린더 일정/가계부 거래 생성 실패 및 LLM 채팅 생성 불가](https://github.com/protove/MCP_calendar/issues/1)

### 증상
- 캘린더에서 일정 추가 버튼 클릭 시 저장되지 않음
- 가계부에서 거래 추가 버튼 클릭 시 저장되지 않음
- LLM 채팅을 통한 일정/거래 생성 동작 불가
- 백엔드 API 단독 테스트 시 정상 동작 확인됨

### 원인 분석 및 수정

#### 1. DateTime 포맷 불일치 (Frontend → Backend) 🔴
| | 포맷 |
|---|---|
| **프론트엔드** (datetime-local) | `yyyy-MM-ddTHH:mm` |
| **백엔드** (@JsonFormat) | `yyyy-MM-dd'T'HH:mm:ss` |

- 프론트엔드 `<input type="datetime-local">`은 초(`:ss`)를 포함하지 않음
- Jackson `@JsonFormat` 역직렬화 실패 → **400 Bad Request**

**수정:**
- **Frontend** (`EventForm.tsx`): 제출 시 `:00` (초) 자동 보정
- **Backend** (`CreateEventRequest.kt`, `UpdateEventRequest.kt`): `@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]")` — 초 선택적 파싱

#### 2. 종일(allDay) 이벤트 날짜 포맷 오류 🔴
- allDay 토글 ON 시 `<input type="date">`로 전환 → `yyyy-MM-dd`만 전송
- 백엔드 `LocalDateTime` 파싱 실패

**수정:** allDay 활성화 시 `T00:00:00` / `T23:59:59` 자동 부착, OFF 복원 시 `T09:00` / `T18:00` 기본값

#### 3. CORS 설정 오류 (Vercel → Cloudflare → ALB) 🔴
```
CORS_ALLOWED_ORIGINS 미설정 → 기본값 "*" (와일드카드)
                                     +
                        allowCredentials = true
                                     ↓
                    브라우저 CORS 정책 위반 → 모든 POST 차단
```

**수정** (`SecurityConfig.kt`):
- 기본값을 `http://localhost:3000`으로 변경
- 와일드카드(`*`) 사용 시 `allowCredentials = false` 자동 설정

#### 4. 에러 피드백 부재 (Silent Failure) ⚠️
- API 실패 시 `console.error`만 출력, 사용자에게 알림 없음
- 성공/실패 여부와 관계없이 모달이 닫힘

**수정** (`CalendarView.tsx`, `LedgerView.tsx`):
- 성공 시에만 모달 닫기
- 실패 시 `alert()`로 에러 메시지 표시, 모달 유지

#### 5. Gemini 예외 미처리 ⚠️
- `GeminiAuthException`, `GeminiRateLimitException` 등이 500으로만 반환됨

**수정** (`GlobalExceptionHandler.kt`):
- Gemini 예외별 적절한 HTTP 상태 코드 매핑 (401, 429, 403, 503)

### 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `frontend/src/components/calendar/EventForm.tsx` | DateTime 포맷 정규화, allDay 토글 보정 |
| `frontend/src/components/calendar/CalendarView.tsx` | 에러 피드백 추가, 실패 시 모달 유지 |
| `frontend/src/components/ledger/LedgerView.tsx` | 에러 피드백 추가, 실패 시 모달 유지 |
| `backend/.../config/SecurityConfig.kt` | CORS 기본값 변경, credentials 조건부 처리 |
| `backend/.../dto/request/CreateEventRequest.kt` | DateTime 포맷 유연화 `[:ss]` |
| `backend/.../dto/request/UpdateEventRequest.kt` | DateTime 포맷 유연화 `[:ss]` |
| `backend/.../exception/GlobalExceptionHandler.kt` | Gemini 예외 핸들러 추가 |