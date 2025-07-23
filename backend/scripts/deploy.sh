#!/bin/bash

# 에멜무지로 백엔드 배포 스크립트
echo "🚀 에멜무지로 백엔드 배포 시작..."

# 환경변수 확인
if [ ! -f .env ]; then
    echo "❌ .env 파일이 존재하지 않습니다. env_example.txt를 참고하여 .env 파일을 생성해주세요."
    exit 1
fi

# 가상환경 활성화 (선택사항)
if [ -d "venv" ]; then
    echo "📦 가상환경 활성화..."
    source venv/bin/activate
fi

# 의존성 설치
echo "📦 의존성 설치..."
pip install -r requirements.txt

# 정적 파일 수집
echo "📁 정적 파일 수집..."
python manage.py collectstatic --noinput

# 마이그레이션 적용
echo "🗄️ 데이터베이스 마이그레이션..."
python manage.py migrate

# 슈퍼유저 생성 확인
echo "👤 슈퍼유저 생성이 필요한지 확인..."
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(is_superuser=True).exists():
    print('슈퍼유저가 존재하지 않습니다. 다음 명령어로 생성하세요:')
    print('python manage.py createsuperuser')
else:
    print('슈퍼유저가 이미 존재합니다.')
"

# 보안 체크
echo "🔒 보안 설정 확인..."
python manage.py security_check --action=check

# 서버 시작 (Gunicorn 사용 권장)
echo "🌐 서버 시작..."
if command -v gunicorn &> /dev/null; then
    echo "Gunicorn으로 서버 시작..."
    gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
else
    echo "개발 서버로 시작... (프로덕션에서는 Gunicorn 사용 권장)"
    python manage.py runserver 0.0.0.0:8000
fi 