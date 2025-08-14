# 🤝 Contributing to Emelmujiro

우선 Emelmujiro 프로젝트에 기여하고자 하는 관심에 감사드립니다!

## 📋 기여 방법

### 1. 이슈 생성

- 버그를 발견하거나 새로운 기능을 제안하고 싶다면 먼저 [이슈](https://github.com/researcherhojin/emelmujiro/issues)를 확인해주세요
- 동일한 이슈가 없다면 새로운 이슈를 생성해주세요

### 2. Fork & Clone

```bash
# Fork 후 클론
git clone https://github.com/[your-username]/emelmujiro.git
cd emelmujiro

# Upstream 추가
git remote add upstream https://github.com/researcherhojin/emelmujiro.git
```

### 3. 브랜치 생성

```bash
# 기능 개발
git checkout -b feature/your-feature-name

# 버그 수정
git checkout -b fix/bug-description
```

### 4. 개발 환경 설정

```bash
# Frontend 의존성 설치
cd frontend
npm install

# Backend 의존성 설치
cd ../backend
pip install -r requirements.txt
```

### 5. 코드 작성

- TypeScript를 사용해주세요 (Frontend)
- ESLint와 Prettier 규칙을 준수해주세요
- 테스트를 작성해주세요
- 커밋 메시지는 다음 형식을 따라주세요:
  - `feat:` 새로운 기능
  - `fix:` 버그 수정
  - `docs:` 문서 수정
  - `style:` 코드 포맷팅
  - `refactor:` 코드 리팩토링
  - `test:` 테스트 추가/수정
  - `chore:` 빌드 과정 또는 보조 도구 수정

### 6. 테스트

```bash
# Frontend 테스트
npm test

# Lint 검사
npm run lint

# TypeScript 타입 체크
npm run type-check
```

### 7. Pull Request

- main 브랜치로 PR을 생성해주세요
- PR 템플릿을 작성해주세요
- 모든 CI 체크가 통과하는지 확인해주세요

## 🎨 코드 스타일

### TypeScript/JavaScript

- 함수형 컴포넌트 사용 (React)
- Props에 TypeScript 인터페이스 정의
- async/await 사용 권장

### CSS

- Tailwind CSS 유틸리티 클래스 우선 사용
- 커스텀 CSS는 최소화

## 📝 문서화

- 복잡한 로직에는 주석 추가
- README 업데이트 필요시 함께 수정
- API 변경사항은 문서화

## ❓ 질문이 있으신가요?

- [GitHub Issues](https://github.com/researcherhojin/emelmujiro/issues)에 질문을 남겨주세요
- 이메일: researcherhojin@gmail.com

감사합니다! 🙏
