#!/usr/bin/env python
"""
AI 관련 블로그 포스트 생성 스크립트
"""
import os
import sys
import django
from datetime import datetime, timedelta

# Django 설정
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from api.models import BlogPost
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

# 관리자 사용자 가져오기
try:
    author = User.objects.get(username="admin")
except User.DoesNotExist:
    print("Admin user not found. Creating one...")
    author = User.objects.create_superuser("admin", "admin@emelmujiro.com", "admin123")

# BlogPost 모델의 CATEGORY_CHOICES 활용
# ai, ml, ds, nlp, cv, rl, education, career, project, other

# AI 관련 블로그 포스트 데이터
blog_posts_data = [
    {
        "title": "2025년 AI 트렌드: ChatGPT를 넘어서",
        "description": "ChatGPT의 등장 이후 AI 산업은 급격히 변화하고 있습니다. 2025년 주목해야 할 AI 트렌드를 살펴봅니다.",
        "category": "ai",
        "content": """
# 2025년 AI 트렌드: ChatGPT를 넘어서

2024년이 ChatGPT와 생성형 AI의 해였다면, 2025년은 AI가 더욱 깊이 우리 일상에 스며드는 해가 될 것입니다.

## 1. 멀티모달 AI의 진화

텍스트, 이미지, 음성, 비디오를 동시에 이해하고 생성하는 멀티모달 AI가 주류가 됩니다. GPT-4V, Gemini Pro와 같은 모델들이 이미 이러한 능력을 보여주고 있으며, 2025년에는 더욱 정교한 멀티모달 상호작용이 가능해질 것입니다.

### 주요 응용 분야:
- **의료 진단**: X-ray, MRI 이미지와 환자 기록을 동시에 분석
- **교육**: 텍스트, 그림, 동영상을 활용한 맞춤형 학습
- **콘텐츠 제작**: 텍스트 설명만으로 완전한 비디오 콘텐츠 생성

## 2. AI 에이전트의 실용화

단순한 챗봇을 넘어 실제 업무를 수행할 수 있는 AI 에이전트가 등장합니다. AutoGPT, BabyAGI와 같은 프로젝트들이 이미 가능성을 보여주었고, 2025년에는 실제 업무 환경에서 활용될 것입니다.

### AI 에이전트가 할 수 있는 일:
- 복잡한 연구 과제 수행
- 코드 작성 및 디버깅
- 비즈니스 분석 및 보고서 작성
- 고객 서비스 자동화

## 3. 엣지 AI와 개인화

클라우드가 아닌 개인 디바이스에서 실행되는 AI 모델이 보편화됩니다. Apple의 AI 기능, Google의 Gemini Nano 등이 이미 스마트폰에서 구동되고 있습니다.

### 장점:
- **프라이버시 보호**: 개인 데이터가 기기를 벗어나지 않음
- **실시간 처리**: 네트워크 지연 없이 즉각적인 응답
- **오프라인 사용**: 인터넷 연결 없이도 AI 기능 사용

## 4. AI 규제와 윤리

EU의 AI Act를 시작으로 전 세계적으로 AI 규제가 본격화됩니다. 기업들은 AI 사용의 투명성과 설명 가능성을 확보해야 합니다.

### 주요 규제 포인트:
- AI 시스템의 위험 수준별 분류
- 고위험 AI 시스템에 대한 엄격한 요구사항
- AI 생성 콘텐츠의 명확한 표시 의무
- 개인정보 보호 강화

## 5. 산업별 AI 특화 모델

범용 AI를 넘어 특정 산업에 최적화된 AI 모델이 등장합니다.

### 예시:
- **금융**: 사기 탐지, 리스크 관리 특화 모델
- **의료**: 진단, 신약 개발 특화 모델
- **법률**: 계약서 검토, 법률 자문 특화 모델
- **제조**: 품질 관리, 예측 정비 특화 모델

## 결론

2025년은 AI가 '신기한 기술'에서 '필수 도구'로 전환되는 중요한 시기가 될 것입니다. 기업과 개인 모두 이러한 변화에 적응하고 AI를 효과적으로 활용하는 방법을 배워야 합니다.

에멜무지로는 이러한 AI 혁신의 최전선에서 여러분의 비즈니스가 AI를 효과적으로 활용할 수 있도록 돕겠습니다.
        """,
        "is_published": True,
        "is_featured": True,
        "view_count": 342,
    },
    {
        "title": "ChatGPT API 활용 가이드: 실전 예제와 함께",
        "description": "ChatGPT API를 실제 프로젝트에 적용하는 방법을 코드 예제와 함께 상세히 설명합니다.",
        "category": "nlp",
        "content": '''
# ChatGPT API 활용 가이드: 실전 예제와 함께

OpenAI의 ChatGPT API는 개발자들에게 강력한 AI 기능을 제공합니다. 이 가이드에서는 실제 프로젝트에 ChatGPT API를 통합하는 방법을 알아봅니다.

## API 시작하기

### 1. API 키 발급
먼저 OpenAI 웹사이트에서 API 키를 발급받아야 합니다.

```python
import openai
from openai import OpenAI

# API 키 설정
client = OpenAI(
    api_key="your-api-key-here"
)
```

### 2. 기본 사용법

```python
def chat_with_gpt(prompt, model="gpt-3.5-turbo"):
    """ChatGPT와 대화하는 기본 함수"""
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"

# 사용 예제
result = chat_with_gpt("파이썬으로 피보나치 수열을 구현하는 방법을 알려주세요")
print(result)
```

## 고급 활용 방법

### 1. 대화 컨텍스트 유지

```python
class ChatSession:
    def __init__(self, system_prompt="You are a helpful assistant."):
        self.messages = [{"role": "system", "content": system_prompt}]

    def add_message(self, role, content):
        self.messages.append({"role": role, "content": content})

    def get_response(self, user_input):
        self.add_message("user", user_input)

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=self.messages,
            temperature=0.7
        )

        assistant_response = response.choices[0].message.content
        self.add_message("assistant", assistant_response)

        return assistant_response

# 사용 예제
session = ChatSession("You are a Python programming expert.")
print(session.get_response("리스트와 튜플의 차이점은?"))
print(session.get_response("그럼 언제 튜플을 사용해야 할까?"))
```

### 2. 함수 호출 (Function Calling)

```python
import json

def get_weather(location):
    """날씨 정보를 가져오는 더미 함수"""
    return f"{location}의 날씨는 맑음, 온도는 25도입니다."

def chat_with_functions(user_input):
    functions = [
        {
            "name": "get_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city name"
                    }
                },
                "required": ["location"]
            }
        }
    ]

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": user_input}],
        functions=functions,
        function_call="auto"
    )

    message = response.choices[0].message

    if message.function_call:
        function_name = message.function_call.name
        function_args = json.loads(message.function_call.arguments)

        if function_name == "get_weather":
            result = get_weather(function_args["location"])
            return result

    return message.content

# 사용 예제
print(chat_with_functions("서울 날씨 어때?"))
```

## 실전 프로젝트 예제

### 1. 고객 서비스 봇

```python
class CustomerServiceBot:
    def __init__(self):
        self.system_prompt = """
        당신은 친절한 고객 서비스 상담원입니다.
        고객의 문의에 정중하고 도움이 되는 답변을 제공하세요.
        회사명: 에멜무지로
        주요 서비스: AI 솔루션 개발, IT 교육
        """

    def handle_inquiry(self, inquiry):
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": inquiry}
            ],
            temperature=0.3  # 낮은 temperature로 일관된 답변
        )
        return response.choices[0].message.content

bot = CustomerServiceBot()
print(bot.handle_inquiry("AI 교육 프로그램에 대해 알려주세요"))
```

### 2. 코드 리뷰 도우미

```python
def review_code(code_snippet, language="python"):
    prompt = f"""
    다음 {language} 코드를 리뷰해주세요.
    개선점, 버그, 최적화 가능한 부분을 찾아주세요.

    코드:
    ```{language}
    {code_snippet}
    ```
    """

    response = client.chat.completions.create(
        model="gpt-4",  # 코드 리뷰는 GPT-4가 더 정확
        messages=[
            {"role": "system", "content": "You are an expert code reviewer."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    return response.choices[0].message.content
```

## 비용 최적화 팁

### 1. 모델 선택
- **GPT-3.5-turbo**: 일반적인 대화, 간단한 작업
- **GPT-4**: 복잡한 추론, 코드 생성, 창의적 작업
- **GPT-4-turbo**: GPT-4 성능에 더 빠른 속도

### 2. 토큰 관리
```python
def count_tokens(text, model="gpt-3.5-turbo"):
    """토큰 수 계산 (tiktoken 라이브러리 필요)"""
    import tiktoken
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

# 토큰 제한으로 비용 관리
def safe_chat(prompt, max_tokens=500):
    token_count = count_tokens(prompt)
    if token_count > max_tokens:
        return "입력이 너무 깁니다."

    return chat_with_gpt(prompt, max_tokens=max_tokens)
```

### 3. 캐싱 전략
```python
import hashlib
import json

class CachedChat:
    def __init__(self):
        self.cache = {}

    def get_cache_key(self, prompt):
        return hashlib.md5(prompt.encode()).hexdigest()

    def chat(self, prompt):
        cache_key = self.get_cache_key(prompt)

        if cache_key in self.cache:
            print("캐시에서 응답 반환")
            return self.cache[cache_key]

        response = chat_with_gpt(prompt)
        self.cache[cache_key] = response

        return response
```

## 마무리

ChatGPT API는 강력한 도구이지만, 효과적으로 사용하려면 적절한 프롬프트 엔지니어링과 비용 관리가 필요합니다. 이 가이드의 예제들을 참고하여 여러분의 프로젝트에 AI를 통합해보세요.

에멜무지로는 ChatGPT API를 활용한 맞춤형 솔루션 개발을 지원합니다. 문의사항이 있으시면 언제든 연락주세요.
        ''',
        "is_published": True,
        "is_featured": True,
        "view_count": 523,
    },
    {
        "title": "AI가 바꾸는 교육의 미래: 개인 맞춤형 학습의 시대",
        "description": "AI 기술이 교육 분야에 가져온 혁신과 개인 맞춤형 학습의 가능성을 탐구합니다.",
        "category": "education",
        "content": '''
# AI가 바꾸는 교육의 미래: 개인 맞춤형 학습의 시대

교육은 인류 역사상 가장 중요한 활동 중 하나입니다. 이제 AI가 이 교육의 패러다임을 근본적으로 바꾸고 있습니다.

## 전통적 교육의 한계

### 일률적인 교육 방식
- 모든 학생이 같은 속도로 학습
- 개인의 학습 스타일 무시
- 재능과 관심사를 고려하지 않은 커리큘럼

### 제한된 피드백
- 교사 한 명이 수십 명의 학생 관리
- 즉각적인 피드백 부족
- 개별 학생의 약점 파악 어려움

## AI가 가져온 교육 혁신

### 1. 개인 맞춤형 학습 경로

AI는 각 학생의 학습 패턴을 분석하여 최적의 학습 경로를 제시합니다.

**실제 사례: Khan Academy의 Khanmigo**
- GPT-4 기반 AI 튜터
- 학생별 맞춤 문제 제공
- 실시간 힌트와 설명
- 소크라테스식 대화법으로 사고력 향상

### 2. 지능형 튜터링 시스템

```python
class AITutor:
    def analyze_student_response(self, question, student_answer):
        """학생의 답변을 분석하고 맞춤형 피드백 제공"""

        # 정답 여부 확인
        is_correct = self.check_answer(question, student_answer)

        # 오답 패턴 분석
        if not is_correct:
            error_type = self.identify_error_type(student_answer)
            feedback = self.generate_feedback(error_type)
            hint = self.provide_hint(question, error_type)

            return {
                "correct": False,
                "feedback": feedback,
                "hint": hint,
                "next_step": self.recommend_next_step(error_type)
            }

        return {
            "correct": True,
            "feedback": "잘했습니다!",
            "next_step": self.get_next_challenge(question.difficulty)
        }
```

### 3. 언어 학습의 혁명

**Duolingo의 AI 활용**
- 개인별 난이도 조정
- 발음 교정 AI
- 대화형 연습 with GPT-4
- 학습 패턴 분석을 통한 복습 시점 예측

### 4. 자동 평가 및 피드백

```python
def ai_essay_evaluation(essay_text):
    """AI를 활용한 에세이 자동 평가"""

    evaluation_criteria = {
        "grammar": check_grammar(essay_text),
        "coherence": analyze_coherence(essay_text),
        "vocabulary": assess_vocabulary_level(essay_text),
        "argument_strength": evaluate_arguments(essay_text),
        "originality": check_originality(essay_text)
    }

    feedback = generate_detailed_feedback(evaluation_criteria)
    suggestions = provide_improvement_suggestions(evaluation_criteria)

    return {
        "score": calculate_overall_score(evaluation_criteria),
        "feedback": feedback,
        "suggestions": suggestions
    }
```

## AI 교육 도구의 실제 적용

### 1. 초중고 교육

**수학 학습**
- Photomath: 사진으로 문제 해결 과정 설명
- Mathway: 단계별 풀이 제공
- GeoGebra: 시각적 수학 개념 학습

**언어 학습**
- Grammarly: 실시간 문법 교정
- QuillBot: 작문 능력 향상
- Speechling: AI 발음 코치

### 2. 대학 교육

**연구 지원**
- Semantic Scholar: AI 기반 논문 검색
- Elicit: 연구 질문에 대한 논문 요약
- Consensus: 과학적 합의 도출

**프로그래밍 교육**
```python
# GitHub Copilot을 활용한 코딩 교육
def teach_recursion():
    """재귀 함수 교육 예제"""

    # AI가 자동으로 예제 코드 생성
    def factorial(n):
        # Copilot이 자동 완성
        if n <= 1:
            return 1
        return n * factorial(n - 1)

    # AI가 설명 생성
    explanation = """
    재귀 함수는 자기 자신을 호출하는 함수입니다.
    factorial(5) = 5 * factorial(4)
                 = 5 * 4 * factorial(3)
                 = 5 * 4 * 3 * factorial(2)
                 = 5 * 4 * 3 * 2 * factorial(1)
                 = 5 * 4 * 3 * 2 * 1
                 = 120
    """

    return explanation
```

### 3. 기업 교육

**직무 교육**
- 시뮬레이션 기반 학습
- VR/AR과 AI의 결합
- 실시간 성과 추적

## AI 교육의 미래 전망

### 2025-2030 예측

1. **완전 개인화된 AI 교사**
   - 24/7 이용 가능
   - 감정 인식을 통한 학습 동기 부여
   - 다국어 지원

2. **메타버스 교실**
   - 가상 현실에서의 몰입형 학습
   - 전 세계 학생들과 협업
   - AI NPC와의 상호작용

3. **신경 인터페이스 학습**
   - 뇌-컴퓨터 인터페이스
   - 직접적인 지식 전달
   - 학습 효율 극대화

## 도전 과제와 해결 방안

### 1. 디지털 격차
- **문제**: 기술 접근성 불평등
- **해결**: 정부 지원, 저가 디바이스 개발

### 2. 개인정보 보호
- **문제**: 학습 데이터 수집과 프라이버시
- **해결**: 엄격한 데이터 보호 정책, 로컬 AI 처리

### 3. 인간 교사의 역할
- **문제**: AI가 교사를 대체할 것인가?
- **해결**: AI는 도구, 교사는 멘토이자 가이드

## 실제 구현 사례: 에멜무지로의 AI 교육 플랫폼

```python
class EmelMujiroAIEducation:
    def __init__(self):
        self.student_profiles = {}
        self.learning_paths = {}

    def create_personalized_curriculum(self, student_id):
        """학생별 맞춤 커리큘럼 생성"""

        # 학생 프로필 분석
        profile = self.analyze_student_profile(student_id)

        # 학습 목표 설정
        goals = self.set_learning_goals(profile)

        # AI 기반 커리큘럼 생성
        curriculum = self.generate_curriculum(profile, goals)

        # 적응형 학습 경로 설정
        learning_path = self.create_adaptive_path(curriculum)

        return learning_path

    def provide_real_time_assistance(self, student_id, question):
        """실시간 AI 튜터링"""

        # 질문 분석
        question_analysis = self.analyze_question(question)

        # 학생 수준 파악
        student_level = self.get_student_level(student_id)

        # 맞춤형 답변 생성
        response = self.generate_adaptive_response(
            question_analysis,
            student_level
        )

        return response
```

## 결론

AI는 교육을 민주화하고 개인화하는 강력한 도구입니다. 모든 학생이 자신만의 속도와 방식으로 학습할 수 있는 시대가 열리고 있습니다.

에멜무지로는 AI 교육 혁신의 선두에서 교육 기관과 기업의 디지털 전환을 지원합니다. 함께 교육의 미래를 만들어가겠습니다.
        ''',
        "is_published": True,
        "view_count": 267,
    },
    {
        "title": "LangChain으로 구축하는 지능형 챗봇: 단계별 가이드",
        "description": "LangChain 프레임워크를 사용하여 문서 기반 지능형 챗봇을 구축하는 방법을 상세히 알아봅니다.",
        "category": "nlp",
        "content": '''
# LangChain으로 구축하는 지능형 챗봇: 단계별 가이드

LangChain은 대규모 언어 모델(LLM)을 활용한 애플리케이션 개발을 위한 강력한 프레임워크입니다. 이 가이드에서는 LangChain을 사용하여 실제 문서를 기반으로 답변하는 지능형 챗봇을 구축합니다.

## LangChain이란?

LangChain은 LLM 애플리케이션 개발을 단순화하는 프레임워크로, 다음과 같은 핵심 기능을 제공합니다:

- **체인(Chains)**: 여러 컴포넌트를 연결
- **에이전트(Agents)**: 도구를 사용하여 작업 수행
- **메모리(Memory)**: 대화 컨텍스트 유지
- **벡터 스토어**: 문서 검색 및 저장

## 프로젝트 설정

### 1. 필요한 패키지 설치

```bash
pip install langchain openai chromadb tiktoken pypdf faiss-cpu
```

### 2. 환경 변수 설정

```python
import os
from dotenv import load_dotenv

load_dotenv()

# OpenAI API 키 설정
os.environ["OPENAI_API_KEY"] = "your-api-key-here"
```

## 문서 기반 챗봇 구축

### 1. 문서 로딩 및 전처리

```python
from langchain.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

class DocumentProcessor:
    def __init__(self, chunk_size=1000, chunk_overlap=200):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )

    def load_pdf(self, pdf_path):
        """PDF 문서 로딩"""
        loader = PyPDFLoader(pdf_path)
        documents = loader.load()
        return self.text_splitter.split_documents(documents)

    def load_text(self, text_path):
        """텍스트 파일 로딩"""
        loader = TextLoader(text_path, encoding='utf-8')
        documents = loader.load()
        return self.text_splitter.split_documents(documents)

    def load_multiple_documents(self, file_paths):
        """여러 문서 동시 로딩"""
        all_chunks = []

        for file_path in file_paths:
            if file_path.endswith('.pdf'):
                chunks = self.load_pdf(file_path)
            elif file_path.endswith('.txt'):
                chunks = self.load_text(file_path)
            else:
                continue

            all_chunks.extend(chunks)

        return all_chunks

# 사용 예제
processor = DocumentProcessor()
documents = processor.load_multiple_documents([
    "company_manual.pdf",
    "product_guide.txt",
    "faq.pdf"
])
```

### 2. 벡터 스토어 구축

```python
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.vectorstores import FAISS

class VectorStoreManager:
    def __init__(self, persist_directory="./chroma_db"):
        self.embeddings = OpenAIEmbeddings()
        self.persist_directory = persist_directory

    def create_chroma_store(self, documents):
        """Chroma 벡터 스토어 생성"""
        vectorstore = Chroma.from_documents(
            documents=documents,
            embedding=self.embeddings,
            persist_directory=self.persist_directory
        )
        vectorstore.persist()
        return vectorstore

    def create_faiss_store(self, documents):
        """FAISS 벡터 스토어 생성"""
        vectorstore = FAISS.from_documents(
            documents=documents,
            embedding=self.embeddings
        )
        # FAISS 인덱스 저장
        vectorstore.save_local("faiss_index")
        return vectorstore

    def load_chroma_store(self):
        """저장된 Chroma 스토어 로드"""
        return Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings
        )

    def similarity_search(self, vectorstore, query, k=4):
        """유사도 검색"""
        return vectorstore.similarity_search(query, k=k)

# 벡터 스토어 생성
manager = VectorStoreManager()
vectorstore = manager.create_chroma_store(documents)
```

### 3. 대화형 챗봇 구현

```python
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate

class IntelligentChatbot:
    def __init__(self, vectorstore, model_name="gpt-3.5-turbo"):
        self.vectorstore = vectorstore
        self.llm = ChatOpenAI(
            model_name=model_name,
            temperature=0.3,
            max_tokens=1000
        )

        # 대화 메모리 설정
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            output_key="answer"
        )

        # 커스텀 프롬프트 템플릿
        self.qa_prompt = PromptTemplate(
            template="""당신은 도움이 되는 AI 어시스턴트입니다.
            주어진 컨텍스트를 바탕으로 질문에 답변해주세요.
            만약 답을 모르겠다면, 모른다고 정직하게 답변하세요.

            컨텍스트: {context}

            질문: {question}

            답변:""",
            input_variables=["context", "question"]
        )

        # 대화 체인 생성
        self.qa_chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=vectorstore.as_retriever(
                search_kwargs={"k": 3}
            ),
            memory=self.memory,
            return_source_documents=True,
            combine_docs_chain_kwargs={"prompt": self.qa_prompt}
        )

    def chat(self, question):
        """사용자 질문에 답변"""
        result = self.qa_chain({"question": question})

        return {
            "answer": result["answer"],
            "source_documents": result.get("source_documents", [])
        }

    def clear_history(self):
        """대화 기록 초기화"""
        self.memory.clear()

    def get_chat_history(self):
        """대화 기록 조회"""
        return self.memory.chat_memory.messages

# 챗봇 초기화 및 사용
chatbot = IntelligentChatbot(vectorstore)

# 질문하기
response = chatbot.chat("회사의 휴가 정책에 대해 알려주세요")
print(f"답변: {response['answer']}")

# 출처 문서 확인
for doc in response['source_documents']:
    print(f"출처: {doc.metadata}")
```

### 4. 고급 기능: 에이전트와 도구

```python
from langchain.agents import initialize_agent, Tool
from langchain.agents import AgentType
from langchain.tools import DuckDuckGoSearchRun
from langchain.utilities import WikipediaAPIWrapper

class SmartAgent:
    def __init__(self, vectorstore):
        self.llm = ChatOpenAI(temperature=0.3)
        self.vectorstore = vectorstore

        # 도구 정의
        self.tools = [
            Tool(
                name="Company Knowledge Base",
                func=self.search_knowledge_base,
                description="회사 내부 문서에서 정보를 검색합니다"
            ),
            Tool(
                name="Web Search",
                func=DuckDuckGoSearchRun().run,
                description="최신 정보를 위해 웹을 검색합니다"
            ),
            Tool(
                name="Wikipedia",
                func=WikipediaAPIWrapper().run,
                description="백과사전 정보를 검색합니다"
            )
        ]

        # 에이전트 초기화
        self.agent = initialize_agent(
            self.tools,
            self.llm,
            agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True,
            max_iterations=3
        )

    def search_knowledge_base(self, query):
        """내부 지식 베이스 검색"""
        docs = self.vectorstore.similarity_search(query, k=2)
        return "\n".join([doc.page_content for doc in docs])

    def ask(self, question):
        """에이전트에게 질문"""
        return self.agent.run(question)

# 스마트 에이전트 사용
agent = SmartAgent(vectorstore)
answer = agent.ask("우리 회사 제품과 경쟁사 제품을 비교해주세요")
print(answer)
```

### 5. 스트리밍 응답 구현

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

class StreamingChatbot:
    def __init__(self, vectorstore):
        self.vectorstore = vectorstore

        # 스트리밍 콜백 설정
        self.streaming_llm = ChatOpenAI(
            temperature=0.3,
            streaming=True,
            callbacks=[StreamingStdOutCallbackHandler()]
        )

        self.qa_chain = ConversationalRetrievalChain.from_llm(
            llm=self.streaming_llm,
            retriever=vectorstore.as_retriever(),
            return_source_documents=True
        )

    def stream_chat(self, question):
        """스트리밍 방식으로 답변"""
        # 답변이 실시간으로 출력됨
        result = self.qa_chain({"question": question})
        return result

# 스트리밍 챗봇 사용
streaming_bot = StreamingChatbot(vectorstore)
streaming_bot.stream_chat("AI의 미래에 대해 설명해주세요")
```

## 성능 최적화

### 1. 캐싱 구현

```python
from functools import lru_cache
import hashlib

class CachedChatbot:
    def __init__(self, vectorstore):
        self.vectorstore = vectorstore
        self.cache = {}

    def get_cache_key(self, question):
        """질문의 해시값을 캐시 키로 사용"""
        return hashlib.md5(question.encode()).hexdigest()

    @lru_cache(maxsize=100)
    def search_similar_docs(self, question):
        """문서 검색 결과 캐싱"""
        return self.vectorstore.similarity_search(question)

    def chat_with_cache(self, question):
        """캐싱을 활용한 답변"""
        cache_key = self.get_cache_key(question)

        if cache_key in self.cache:
            print("캐시에서 답변 반환")
            return self.cache[cache_key]

        # 실제 처리
        docs = self.search_similar_docs(question)
        answer = self.generate_answer(question, docs)

        # 캐시에 저장
        self.cache[cache_key] = answer

        return answer
```

### 2. 벡터 스토어 최적화

```python
class OptimizedVectorStore:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()

    def create_indexed_store(self, documents):
        """인덱싱된 벡터 스토어 생성"""
        # FAISS 인덱스 타입 설정
        import faiss

        # 문서를 임베딩으로 변환
        texts = [doc.page_content for doc in documents]
        embeddings = self.embeddings.embed_documents(texts)

        # FAISS 인덱스 생성 (IVF)
        dimension = len(embeddings[0])
        nlist = 100  # 클러스터 수

        quantizer = faiss.IndexFlatL2(dimension)
        index = faiss.IndexIVFFlat(quantizer, dimension, nlist)

        # 인덱스 훈련
        index.train(np.array(embeddings).astype('float32'))
        index.add(np.array(embeddings).astype('float32'))

        return index
```

## 실전 배포

### Docker 컨테이너화

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### FastAPI 웹 서버

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class Question(BaseModel):
    text: str

class Answer(BaseModel):
    text: str
    sources: list

@app.post("/chat", response_model=Answer)
async def chat_endpoint(question: Question):
    try:
        response = chatbot.chat(question.text)
        return Answer(
            text=response["answer"],
            sources=[doc.metadata for doc in response["source_documents"]]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

## 결론

LangChain을 사용하면 강력한 문서 기반 챗봇을 쉽게 구축할 수 있습니다. 이 가이드의 코드를 기반으로 여러분만의 지능형 챗봇을 만들어보세요.

에멜무지로는 LangChain을 활용한 기업용 AI 솔루션 개발을 전문으로 합니다. 맞춤형 챗봇 구축이 필요하시면 언제든 문의해주세요.
        ''',
        "is_published": True,
        "is_featured": True,
        "view_count": 412,
    },
    {
        "title": "AI 윤리: 우리가 반드시 고민해야 할 문제들",
        "description": "AI 기술이 발전하면서 우리가 직면한 윤리적 딜레마와 해결 방안을 탐구합니다.",
        "category": "other",
        "content": '''
# AI 윤리: 우리가 반드시 고민해야 할 문제들

AI 기술이 급속도로 발전하면서 우리 사회는 전례 없는 윤리적 도전에 직면하고 있습니다. 이제는 "AI로 무엇을 할 수 있는가?"보다 "AI로 무엇을 해야 하는가?"를 묻는 시대입니다.

## AI 윤리의 핵심 이슈

### 1. 편향성과 공정성

AI 시스템은 학습 데이터에 내재된 편향을 그대로 학습합니다.

**실제 사례: 채용 AI의 성별 편향**
- Amazon의 채용 AI가 여성 지원자를 차별
- 과거 10년간의 이력서 데이터 학습
- 대부분이 남성 지원자 → AI가 남성 선호 패턴 학습

**해결 방안:**
```python
class FairAI:
    def __init__(self):
        self.bias_metrics = {}

    def detect_bias(self, predictions, sensitive_attributes):
        """편향성 탐지"""
        # 민감한 속성별 예측 결과 분석
        for attribute in sensitive_attributes:
            group_predictions = self.group_by_attribute(predictions, attribute)

            # 그룹 간 차이 계산
            disparity = self.calculate_disparity(group_predictions)

            if disparity > 0.2:  # 20% 이상 차이
                self.bias_metrics[attribute] = disparity
                self.flag_bias_alert(attribute, disparity)

        return self.bias_metrics

    def mitigate_bias(self, model, data):
        """편향성 완화"""
        # 1. 데이터 재균형
        balanced_data = self.rebalance_data(data)

        # 2. 공정성 제약 추가
        fair_model = self.add_fairness_constraints(model)

        # 3. 적대적 디바이싱
        debiased_model = self.adversarial_debiasing(fair_model)

        return debiased_model
```

### 2. 프라이버시와 데이터 보호

AI는 방대한 개인 데이터를 필요로 하지만, 이는 프라이버시 침해 위험을 수반합니다.

**핵심 이슈:**
- 동의 없는 데이터 수집
- 개인 식별 가능 정보 노출
- 데이터 결합을 통한 프로파일링

**프라이버시 보호 기술:**
```python
class PrivacyPreservingAI:
    def differential_privacy(self, data, epsilon=1.0):
        """차등 프라이버시 적용"""
        # 노이즈 추가로 개인 정보 보호
        noise_scale = 1.0 / epsilon
        noisy_data = data + np.random.laplace(0, noise_scale, data.shape)
        return noisy_data

    def federated_learning(self, local_models):
        """연합 학습: 데이터는 로컬에 유지"""
        # 각 디바이스에서 로컬 학습
        local_updates = []
        for model in local_models:
            update = model.train_on_local_data()
            local_updates.append(update)

        # 중앙 서버에서 모델 업데이트만 집계
        global_model = self.aggregate_updates(local_updates)

        return global_model

    def homomorphic_encryption(self, data):
        """동형 암호화: 암호화된 상태에서 연산"""
        encrypted_data = self.encrypt(data)

        # 암호화된 데이터로 직접 연산
        encrypted_result = self.compute_on_encrypted(encrypted_data)

        return encrypted_result
```

### 3. 설명 가능성과 투명성

**블랙박스 문제:**
딥러닝 모델의 의사결정 과정을 이해할 수 없다면, 그 결정을 신뢰할 수 있을까요?

```python
class ExplainableAI:
    def lime_explanation(self, model, instance):
        """LIME을 사용한 로컬 설명"""
        from lime import lime_tabular

        explainer = lime_tabular.LimeTabularExplainer(
            training_data=self.training_data,
            mode='classification'
        )

        explanation = explainer.explain_instance(
            instance,
            model.predict_proba,
            num_features=10
        )

        return explanation.as_list()

    def shap_values(self, model, data):
        """SHAP을 사용한 특성 중요도 분석"""
        import shap

        explainer = shap.Explainer(model, data)
        shap_values = explainer(data)

        # 특성별 중요도 시각화
        shap.summary_plot(shap_values, data)

        return shap_values

    def generate_explanation_report(self, prediction):
        """사용자 친화적 설명 생성"""
        report = f"""
        예측 결과: {prediction['result']}

        주요 영향 요인:
        1. {prediction['top_factors'][0]}: {prediction['impacts'][0]}%
        2. {prediction['top_factors'][1]}: {prediction['impacts'][1]}%
        3. {prediction['top_factors'][2]}: {prediction['impacts'][2]}%

        신뢰도: {prediction['confidence']}%

        이 결정은 {len(prediction['data_points'])}개의 데이터를 기반으로 했습니다.
        """

        return report
```

### 4. 자율성과 인간 통제

AI가 스스로 결정을 내릴 때, 인간의 통제권을 어떻게 유지할 것인가?

**Human-in-the-Loop 시스템:**
```python
class HumanInTheLoop:
    def __init__(self, confidence_threshold=0.8):
        self.confidence_threshold = confidence_threshold
        self.human_reviews = []

    def make_decision(self, ai_prediction):
        """AI 예측에 대한 인간 검토 필요 여부 판단"""

        if ai_prediction['confidence'] < self.confidence_threshold:
            # 신뢰도가 낮으면 인간 검토 요청
            return self.request_human_review(ai_prediction)

        if ai_prediction['impact'] == 'high':
            # 중요한 결정은 항상 인간 검토
            return self.request_human_review(ai_prediction)

        if ai_prediction['category'] in ['medical', 'legal', 'financial']:
            # 민감한 분야는 인간 승인 필요
            return self.request_human_approval(ai_prediction)

        # 그 외의 경우 AI 결정 수용
        return self.accept_ai_decision(ai_prediction)

    def request_human_review(self, prediction):
        """인간 검토 요청"""
        review_request = {
            'prediction': prediction,
            'timestamp': datetime.now(),
            'reason': self.determine_review_reason(prediction),
            'priority': self.calculate_priority(prediction)
        }

        self.human_reviews.append(review_request)
        return self.wait_for_human_decision(review_request)
```

### 5. 책임과 법적 문제

AI가 실수했을 때, 누가 책임져야 하는가?

**책임 추적 시스템:**
```python
class AIAccountability:
    def __init__(self):
        self.decision_log = []
        self.audit_trail = []

    def log_decision(self, decision):
        """모든 AI 결정 기록"""
        log_entry = {
            'timestamp': datetime.now(),
            'decision': decision,
            'model_version': self.model_version,
            'input_data': decision['input'],
            'output': decision['output'],
            'confidence': decision['confidence'],
            'responsible_parties': {
                'developer': self.developer_info,
                'operator': self.operator_info,
                'data_provider': self.data_provider_info
            }
        }

        self.decision_log.append(log_entry)
        self.create_audit_entry(log_entry)

        return log_entry['id']

    def assign_liability(self, incident):
        """책임 소재 판단"""
        # 사고 원인 분석
        root_cause = self.analyze_incident(incident)

        liability_matrix = {
            'data_error': 'data_provider',
            'model_error': 'developer',
            'deployment_error': 'operator',
            'misuse': 'user'
        }

        responsible_party = liability_matrix.get(root_cause, 'shared')

        return {
            'incident': incident,
            'root_cause': root_cause,
            'responsible_party': responsible_party,
            'recommendations': self.generate_recommendations(root_cause)
        }
```

## AI 윤리 원칙

### 1. 인간 중심 AI

```python
class HumanCentricAI:
    principles = {
        'beneficence': '인간의 복지 증진',
        'non_maleficence': '해를 끼치지 않음',
        'autonomy': '인간의 자율성 존중',
        'justice': '공정한 이익 분배',
        'explicability': '설명 가능하고 이해 가능'
    }

    def evaluate_ethical_compliance(self, ai_system):
        """AI 시스템의 윤리적 준수 평가"""
        scores = {}

        for principle, description in self.principles.items():
            score = self.assess_principle(ai_system, principle)
            scores[principle] = score

            if score < 0.7:  # 70% 미만이면 경고
                self.raise_ethical_concern(principle, score)

        return scores
```

### 2. 지속가능한 AI

**환경적 영향 고려:**
```python
def calculate_carbon_footprint(model_training):
    """AI 모델 훈련의 탄소 발자국 계산"""

    # GPU 사용 시간과 전력 소비
    gpu_hours = model_training['gpu_hours']
    power_consumption = model_training['watts_per_gpu']

    # 전력원별 탄소 배출량
    carbon_intensity = get_regional_carbon_intensity()

    total_emissions = gpu_hours * power_consumption * carbon_intensity

    return {
        'total_co2_kg': total_emissions,
        'equivalent_to': f"{total_emissions / 2.4}km 자동차 운행",
        'offset_trees_needed': int(total_emissions / 22)  # 연간 나무 1그루 CO2 흡수량
    }
```

## 글로벌 AI 거버넌스

### 주요 국가별 AI 규제

1. **EU - AI Act**
   - 위험 기반 접근법
   - 고위험 AI 엄격 규제
   - 위반 시 최대 연매출 6% 벌금

2. **미국 - AI Bill of Rights**
   - 자율 규제 중심
   - 산업별 가이드라인
   - 연방 차원 포괄적 규제 논의 중

3. **중국 - AI 규제**
   - 알고리즘 추천 규제
   - 딥페이크 규제
   - 생성형 AI 서비스 규정

4. **한국 - AI 기본법**
   - AI 윤리 기준 수립
   - 신뢰할 수 있는 AI 구현
   - AI 산업 육성과 규제 균형

## 실천 가이드라인

### 기업을 위한 AI 윤리 체크리스트

```python
class AIEthicsChecklist:
    def __init__(self):
        self.checklist = {
            'data_governance': [
                '개인정보 수집 동의 획득',
                '데이터 최소 수집 원칙 준수',
                '데이터 보안 조치 구현',
                '데이터 보존 기간 설정'
            ],
            'algorithm_fairness': [
                '편향성 테스트 실시',
                '다양한 그룹에 대한 성능 검증',
                '공정성 메트릭 모니터링',
                '차별 금지 원칙 준수'
            ],
            'transparency': [
                'AI 사용 사실 공개',
                '의사결정 과정 설명 제공',
                '이의제기 절차 마련',
                '정기적 감사 실시'
            ],
            'human_oversight': [
                '인간 검토 프로세스 구축',
                '긴급 정지 메커니즘',
                '책임자 지정',
                '사고 대응 계획 수립'
            ]
        }

    def audit(self, ai_system):
        """AI 시스템 윤리 감사"""
        audit_results = {}

        for category, items in self.checklist.items():
            category_score = 0

            for item in items:
                if self.check_compliance(ai_system, item):
                    category_score += 1

            audit_results[category] = {
                'score': category_score / len(items),
                'missing': [item for item in items
                           if not self.check_compliance(ai_system, item)]
            }

        return audit_results
```

## 미래를 위한 제언

### AI 윤리의 미래

1. **글로벌 표준 수립**
   - ISO/IEC 23053, 23894 등 국제 표준
   - 산업별 윤리 가이드라인
   - 국가 간 협력 체계

2. **기술적 해결책 개발**
   - 설명 가능한 AI 고도화
   - 프라이버시 보호 기술 발전
   - 공정성 보장 알고리즘

3. **교육과 인식 제고**
   - AI 리터러시 교육
   - 윤리적 AI 개발 교육
   - 시민 참여 확대

## 결론

AI 윤리는 선택이 아닌 필수입니다. 기술의 발전 속도만큼 윤리적 고민도 깊어져야 합니다. 우리는 AI가 인류에게 이익이 되도록 보장해야 할 책임이 있습니다.

에멜무지로는 윤리적 AI 개발을 최우선으로 생각합니다. 책임감 있는 AI 솔루션으로 더 나은 미래를 만들어가겠습니다.

**"The question is not whether we can build AI, but whether we should, and if so, how we can do it responsibly."**
        ''',
        "is_published": True,
        "view_count": 189,
    },
]

# 블로그 포스트 생성
for i, post_data in enumerate(blog_posts_data):
    # 제목으로 중복 체크
    if not BlogPost.objects.filter(title=post_data["title"]).exists():
        # 포스트 생성
        post = BlogPost.objects.create(**post_data)

        # 생성 시간을 과거로 조정 (더 자연스럽게)
        days_ago = (len(blog_posts_data) - i) * 3
        post.created_at = timezone.now() - timedelta(days=days_ago)
        post.updated_at = post.created_at + timedelta(hours=2)
        post.date = post.created_at
        post.save()

        print(f"Created post: {post.title}")
    else:
        print(f"Post already exists: {post_data['title']}")

print("\n✅ Blog posts created successfully!")
print(f"Total posts: {BlogPost.objects.count()}")
print("\nYou can now access the admin panel at http://localhost:8000/admin/")
print("Username: admin")
print("Password: admin123")
