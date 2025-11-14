@echo off
REM ============================================
REM MCP Calendar 개발 환경 초기 설정
REM Windows용 스크립트
REM ============================================

echo 🚀 MCP Calendar 개발 환경 설정 시작...
echo.

REM 1. .env.dev 파일 확인
if not exist .env.dev (
    echo 📝 .env.dev 파일 생성 중...
    copy .env.dev.example .env.dev
    echo ✅ .env.dev 파일 생성 완료
) else (
    echo ✅ .env.dev 파일 이미 존재
)

REM 2. Windows는 UID/GID 설정 불필요
echo.
echo ℹ️  Windows 환경: USER_ID/GROUP_ID 기본값(1000) 사용
echo    (.env.dev 파일의 USER_ID/GROUP_ID는 변경하지 않아도 됩니다)

REM 3. package-lock.json 생성 (없는 경우)
if not exist frontend\package-lock.json (
    echo.
    echo 📦 package-lock.json 생성 중...
    
    docker run --rm ^
        -v "%cd%/frontend:/app" ^
        -w /app ^
        node:20-alpine ^
        npm install --legacy-peer-deps
    
    echo ✅ package-lock.json 생성 완료
) else (
    echo ✅ package-lock.json 이미 존재
)

REM 4. Windows에서는 권한 문제가 없음
echo.
echo ℹ️  Windows는 파일 권한 문제가 발생하지 않습니다

echo.
echo 🎉 설정 완료!
echo.
echo 다음 단계:
echo   1. 'docker-compose --env-file .env.dev build' 실행
echo   2. 'docker-compose --env-file .env.dev up' 실행
echo.
pause
