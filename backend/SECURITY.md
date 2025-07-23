# 에멜무지로 보안 가이드

## 개요

이 문서는 에멜무지로 프로젝트의 보안 구성 및 관리 방법을 설명합니다.

## 🔒 구현된 보안 기능

### 1. 기본 보안 설정

-   **SECRET_KEY**: 50자 이상의 안전한 키 사용
-   **DEBUG**: 프로덕션에서 False 설정
-   **ALLOWED_HOSTS**: 허용된 도메인만 접근 가능
-   **HTTPS**: SSL/TLS 강제 사용 (프로덕션)

### 2. 인증 및 접근 제어

-   **Rate Limiting**: API 호출 횟수 제한
    -   일반 사용자: 시간당 100회
    -   문의 폼: 시간당 5회
    -   뉴스레터: 시간당 3회
-   **reCAPTCHA**: 봇 방지 (프론트엔드 구현 필요)
-   **IP 차단**: 악성 행위 감지 시 자동 차단

### 3. 데이터 보호

-   **입력 검증**: 모든 사용자 입력에 대한 엄격한 검증
-   **XSS 방지**: Content Security Policy 적용
-   **SQL Injection 방지**: Django ORM 사용
-   **CSRF 보호**: Django CSRF 미들웨어 활용

### 4. 통신 보안

-   **보안 헤더**:
    -   X-Frame-Options: DENY
    -   X-Content-Type-Options: nosniff
    -   X-XSS-Protection: 1; mode=block
    -   Referrer-Policy: strict-origin-when-cross-origin
-   **CORS 설정**: 허용된 도메인만 접근 가능

### 5. 모니터링 및 로깅

-   **보안 이벤트 로깅**: 의심스러운 활동 추적
-   **접근 로그**: IP 주소 및 User-Agent 기록
-   **성능 모니터링**: 느린 요청 감지

## 🛡️ 보안 미들웨어

### SecurityMiddleware

-   악성 패턴 감지 및 차단
-   IP 기반 접근 제어
-   Rate limiting 구현

### ContentSecurityMiddleware

-   Content Security Policy 헤더 추가
-   보안 관련 HTTP 헤더 설정

### APIResponseTimeMiddleware

-   응답 시간 모니터링
-   성능 이슈 감지

## 📊 보안 관리 명령어

### 보안 상태 확인

```bash
python manage.py security_check --action=check
```

### 보안 통계 확인

```bash
python manage.py security_check --action=stats
```

### IP 차단 해제

```bash
python manage.py security_check --action=unblock --ip=192.168.1.1
```

### 오래된 로그 정리

```bash
python manage.py security_check --action=clean
```

## 🔧 환경 설정

### 필수 환경변수

```bash
# 기본 설정
SECRET_KEY=your-secret-key-here-minimum-50-characters-long
DEBUG=False
ALLOWED_HOSTS=yourdomain.com

# 이메일 설정
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# reCAPTCHA 설정
RECAPTCHA_PUBLIC_KEY=your-recaptcha-public-key
RECAPTCHA_PRIVATE_KEY=your-recaptcha-private-key
```

### 프로덕션 추가 설정

```bash
# HTTPS 보안
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True

# CORS 설정
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

## 🚨 보안 이벤트 대응

### 1. 악성 공격 감지 시

-   자동 IP 차단 (1시간)
-   보안 로그에 기록
-   3회 이상 차단 시 관리자 알림

### 2. Rate Limiting 초과 시

-   429 응답 반환
-   일시적 접근 제한
-   정상 사용자 영향 최소화

### 3. 의심스러운 파일 업로드 시

-   허용된 확장자만 업로드 가능
-   파일 크기 제한 (5MB)
-   바이러스 스캔 (선택사항)

## 📋 정기 보안 점검

### 일일 점검

-   [ ] 보안 로그 확인
-   [ ] 차단된 IP 검토
-   [ ] 시스템 성능 확인

### 주간 점검

-   [ ] 보안 통계 분석
-   [ ] 오래된 로그 정리
-   [ ] 의존성 업데이트 확인

### 월간 점검

-   [ ] 보안 설정 전체 검토
-   [ ] 침투 테스트 수행
-   [ ] 백업 데이터 확인

## 🔄 보안 업데이트

### Django 보안 업데이트

```bash
pip install --upgrade django
python manage.py check --deploy
```

### 의존성 보안 스캔

```bash
pip install safety
safety check
```

## 📞 보안 사고 신고

보안 취약점을 발견하셨다면:

-   이메일: researcherhojin@gmail.com
-   제목: [보안] 취약점 신고
-   내용: 상세한 취약점 설명 및 재현 방법

## 🔐 개인정보 보호

### 수집 정보

-   이름, 이메일, 전화번호 (선택)
-   IP 주소 (보안 목적)
-   문의 내용

### 보관 기간

-   문의 데이터: 3년
-   로그 데이터: 1년
-   캐시 데이터: 24시간

### 삭제 요청

개인정보 삭제를 원하시면 researcherhojin@gmail.com으로 연락주세요.

---

**마지막 업데이트**: 2025년 6월
**다음 검토 예정**: 2025년 12월
