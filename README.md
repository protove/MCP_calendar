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
| **v1.2.1** | ACM SSL 인증서, ALB HTTPS (TLS 1.3), AWS Free Tier 최적화 |
| **v1.2.0** | Terraform 인프라 — ALB, ECS Fargate, Multi-AZ RDS, Auto Scaling, CI/CD Pipeline |
| **v1.1.1** | 날씨 MCP 도구 3종, 대시보드 위젯 연동, 보안 핫픽스 |
| **v1.1.0** | 프론트엔드 리뉴얼 — 우주 테마, 대시보드, 가계부 차트, 반응형 |
| **v1.0.0** | 로컬 POC — MCP 서버,  LLM Function Calling, JWT 인증, 캘린더/가계부 CRUD |