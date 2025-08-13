# uv 패키지 매니저 사용 가이드

## 소개

uv는 Rust로 작성된 빠른 Python 패키지 매니저로, pip와 conda의 장점을 결합한 도구입니다.

## 초기 설정 완료 내역

### 1. uv 설치

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
```

### 2. Python 환경 구성

- Python 3.12 가상환경 생성: `backend/.venv`
- `pyproject.toml` 파일에 모든 의존성 정의
- `requirements.txt`와 완전히 호환

## 주요 명령어

### 패키지 관리

```bash
# 가상환경 생성
uv venv --python 3.12

# 가상환경 활성화
source .venv/bin/activate  # Mac/Linux
.venv\Scripts\activate      # Windows

# 모든 의존성 설치 (pyproject.toml 기반)
uv sync

# 개발 의존성 포함 설치
uv sync --all-extras

# 새 패키지 추가
uv add django

# 개발 의존성 추가
uv add --dev pytest

# 패키지 제거
uv remove django

# 의존성 업데이트
uv sync --upgrade
```

### 프로젝트 실행

```bash
# Backend 서버 실행
cd backend
source .venv/bin/activate
python manage.py runserver

# Frontend 서버 실행
cd frontend
npm start

# 전체 프로젝트 실행 (루트 디렉토리에서)
npm run dev:clean
```

## conda와의 차이점

### 장점

1. **속도**: uv는 Rust로 작성되어 pip보다 10-100배 빠름
2. **의존성 해결**: 더 효율적인 의존성 해결 알고리즘
3. **캐싱**: 스마트한 캐싱으로 재설치 시간 단축
4. **표준 준수**: PEP 표준을 완벽히 따름
5. **pyproject.toml 네이티브 지원**: 현대적인 Python 프로젝트 구조

### conda 사용자를 위한 팁

| conda 명령어                        | uv 대응 명령어                  |
| ----------------------------------- | ------------------------------- |
| `conda create -n myenv python=3.12` | `uv venv --python 3.12`         |
| `conda activate myenv`              | `source .venv/bin/activate`     |
| `conda install package`             | `uv add package`                |
| `conda list`                        | `uv pip list`                   |
| `conda env list`                    | 해당 없음 (각 프로젝트별 .venv) |

## 현재 프로젝트 구조

```
emelmujiro/
├── backend/
│   ├── .venv/           # Python 가상환경 (uv로 관리)
│   ├── pyproject.toml   # Python 의존성 정의
│   └── requirements.txt # 레거시 호환용
├── frontend/
│   └── package.json     # Node.js 의존성
└── .env                 # 환경 변수 설정
```

## 문제 해결

### PATH 설정

셸을 재시작하거나 다음 명령 실행:

```bash
source $HOME/.local/bin/env
```

### 가상환경이 활성화되지 않을 때

```bash
cd backend
source .venv/bin/activate
```

### 패키지 설치 실패 시

```bash
# 캐시 정리
uv cache clean

# 다시 설치
uv sync --reinstall
```

## 추가 리소스

- [uv 공식 문서](https://github.com/astral-sh/uv)
- [pyproject.toml 가이드](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/)
