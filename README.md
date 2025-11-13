# 🗓️ MCP Calendar

LLM 기반 캘린더 및 가계부 애플리케이션

---

## �️ 개발 환경 구축

### 1. 사전 요구사항
- Docker Desktop 설치
- Claude API Key

### 2. 초기 설정

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

### 3. API Key 설정
`.env.dev` 파일을 열어 Claude API Key를 입력하세요:
```bash
CLAUDE_API_KEY=your-api-key-here
```

### 4. 실행
```bash
docker-compose --env-file .env.dev up
```

### 5. 접속
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

---

##  트러블슈팅

### VS Code 타입 오류 (Linux/Mac만)
```bash
sudo chown -R $USER:$USER frontend/node_modules
```

### 의존성 충돌
```bash
npm install --legacy-peer-deps
```

### globals.tsx 오류
```bash
# Linux/Mac
cd frontend/src/app && mv globals.tsx globals.css

# Windows
cd frontend\src\app && rename globals.tsx globals.css
```