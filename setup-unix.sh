#!/bin/bash
# ============================================
# MCP Calendar 개발 환경 초기 설정
# Ubuntu/Linux/Mac용 스크립트
# ============================================

set -e

echo "🚀 MCP Calendar 개발 환경 설정 시작..."
echo ""

# 1. .env.dev 파일 확인
if [ ! -f .env.dev ]; then
    echo "📝 .env.dev 파일 생성 중..."
    cp .env.dev.example .env.dev
    echo "✅ .env.dev 파일 생성 완료"
else
    echo "✅ .env.dev 파일 이미 존재"
fi

# 2. UID/GID 자동 설정 (Linux/Mac만)
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo "🔧 사용자 UID/GID 설정 중..."
    
    USER_ID=$(id -u)
    GROUP_ID=$(id -g)
    
    echo "   현재 사용자 UID: $USER_ID"
    echo "   현재 사용자 GID: $GROUP_ID"
    
    # .env.dev 파일에서 USER_ID, GROUP_ID 업데이트
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # Mac용 sed
        sed -i '' "s/^USER_ID=.*/USER_ID=$USER_ID/" .env.dev
        sed -i '' "s/^GROUP_ID=.*/GROUP_ID=$GROUP_ID/" .env.dev
    else
        # Linux용 sed
        sed -i "s/^USER_ID=.*/USER_ID=$USER_ID/" .env.dev
        sed -i "s/^GROUP_ID=.*/GROUP_ID=$GROUP_ID/" .env.dev
    fi
    
    echo "✅ UID/GID 설정 완료"
fi

# 3. package-lock.json 생성 (없는 경우)
if [ ! -f frontend/package-lock.json ]; then
    echo ""
    echo "📦 package-lock.json 생성 중..."
    
    docker run --rm \
        -v "$(pwd)/frontend:/app" \
        -w /app \
        -u "$(id -u):$(id -g)" \
        node:20-alpine \
        npm install --legacy-peer-deps
    
    echo "✅ package-lock.json 생성 완료"
else
    echo "✅ package-lock.json 이미 존재"
fi

# 4. node_modules 권한 수정 (이미 존재하는 경우)
if [ -d "frontend/node_modules" ]; then
    echo ""
    echo "🔐 node_modules 권한 수정 중..."
    
    # root 소유인 경우에만 수정
    if [ "$(stat -c '%U' frontend/node_modules 2>/dev/null || stat -f '%Su' frontend/node_modules 2>/dev/null)" == "root" ]; then
        echo "   root 소유권 발견, 수정이 필요합니다."
        echo "   sudo 권한이 필요합니다."
        sudo chown -R $(id -u):$(id -g) frontend/node_modules
        echo "✅ node_modules 권한 수정 완료"
    else
        echo "✅ node_modules 권한 이미 올바름"
    fi
fi

echo ""
echo "🎉 설정 완료!"
echo ""
echo "다음 단계:"
echo "  1. .env.dev 파일을 열어 CLAUDE_API_KEY를 설정하세요"
echo "  2. 'docker-compose --env-file .env.dev build' 실행"
echo "  3. 'docker-compose --env-file .env.dev up' 실행"
echo ""
