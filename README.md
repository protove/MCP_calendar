# 🗓️ MCP Calendar

LLM 기반 캘린더 및 가계부 애플리케이션

---

## 🛠️ 개발 환경 구축

### 1. 사전 요구사항
- Docker Desktop 설치

### 2. 초기 설정

#### **Ubuntu/Linux/Mac**
```bash
git clone <repository-url>
cd MCP_calender
./setup-unix.sh
```

#### **Windows**
```batch
git clone <repository-url>
cd MCP_calender
setup-windows.bat
```

### 3. 실행
```bash
docker-compose --env-file .env.dev up --build -d
```

### 4. 접속
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
---