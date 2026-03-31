"""
Management command to create initial blog posts.
Usage: uv run python manage.py create_blog_posts
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import BlogPost

POSTS = [
    {
        "title": "Google TurboQuant: 3비트 양자화로 LLM 메모리 6배 절감, 정확도 손실은 0",
        "description": "Google Research가 ICLR 2026에서 발표한 TurboQuant는 LLM의 KV 캐시를 3비트로 압축하면서도 정확도 손실 없이 H100에서 최대 8배 속도 향상을 달성했습니다.",
        "content": """Google Research가 ICLR 2026에서 발표한 TurboQuant는 LLM 추론 효율성의 새로운 기준을 제시합니다. 핵심은 단순합니다 — KV 캐시를 3비트로 압축하면서도 정확도 손실이 0입니다.

TurboQuant의 핵심 구조

TurboQuant는 두 가지 알고리즘을 결합합니다.

PolarQuant는 벡터를 직교좌표계(X/Y/Z)에서 극좌표계(반지름 + 각도)로 변환합니다. 기존 양자화에서 필수적이었던 정규화 단계를 원형 그리드 매핑으로 대체해 메모리 오버헤드를 완전히 제거합니다.

QJL(Quantized Johnson-Lindenstrauss)은 오차 보정을 위한 1비트 부호 벡터(+1/-1)를 사용합니다. 추가 메모리 비용 없이 양자화 오차를 교정하는 제로 오버헤드 기법입니다.

실험 결과

Google Research 팀은 Gemma, Mistral, Llama-3.1-8B-Instruct 등 오픈소스 모델에서 LongBench, Needle In A Haystack, ZeroSCROLLS, RULER, L-Eval 등 5개 벤치마크로 검증했습니다.

KV 캐시 메모리를 최소 6배 압축하면서 모든 벤치마크에서 정확도 손실이 없었습니다. 특히 4비트 TurboQuant는 H100 GPU에서 32비트 대비 최대 8배 성능 향상을 기록했습니다. 벡터 검색에서도 GloVe 데이터셋(d=200)에서 PQ, RabbiQ 대비 우수한 1@k 리콜 비율을 달성했습니다.

기업에 주는 의미

LLM을 프로덕션에 배포할 때 가장 큰 병목은 GPU 메모리입니다. TurboQuant가 실용화되면 동일한 H100 한 장으로 처리할 수 있는 동시 요청 수가 6배 이상 늘어납니다. 파인튜닝 없이 기존 모델에 바로 적용할 수 있다는 점이 핵심입니다.

특히 Gemini 모델 최적화에도 활용되고 있어, Google Cloud를 통한 기업 서비스에 직접 영향을 줄 것으로 보입니다. 온프레미스에서 오픈소스 LLM을 운영하는 기업이라면 TurboQuant 적용만으로 인프라 비용을 대폭 절감할 수 있습니다.

논문 저자: Amir Zandieh, Vahab Mirrokni, Praneeth Kacham, Majid Hadian, Insu Han, Majid Daliri, Lars Gottesbüren, Rajesh Jayaram (Google Research)""",
        "content_html": """<h2>Google Research가 ICLR 2026에서 발표한 TurboQuant는 LLM 추론 효율성의 새로운 기준을 제시합니다. 핵심은 단순합니다 — KV 캐시를 3비트로 압축하면서도 정확도 손실이 0입니다.</h2>

<h3>TurboQuant의 핵심 구조</h3>
<p>TurboQuant는 두 가지 알고리즘을 결합합니다.</p>
<p><strong>PolarQuant</strong>는 벡터를 직교좌표계(X/Y/Z)에서 극좌표계(반지름 + 각도)로 변환합니다. 기존 양자화에서 필수적이었던 정규화 단계를 원형 그리드 매핑으로 대체해 메모리 오버헤드를 완전히 제거합니다.</p>
<p><strong>QJL(Quantized Johnson-Lindenstrauss)</strong>은 오차 보정을 위한 1비트 부호 벡터(+1/-1)를 사용합니다. 추가 메모리 비용 없이 양자화 오차를 교정하는 제로 오버헤드 기법입니다.</p>

<h3>실험 결과</h3>
<p>Google Research 팀은 Gemma, Mistral, Llama-3.1-8B-Instruct 등 오픈소스 모델에서 LongBench, Needle In A Haystack, ZeroSCROLLS, RULER, L-Eval 등 5개 벤치마크로 검증했습니다.</p>
<ul>
<li><strong>KV 캐시 메모리를 최소 6배 압축</strong>하면서 모든 벤치마크에서 <strong>정확도 손실 0</strong></li>
<li>4비트 TurboQuant는 H100 GPU에서 32비트 대비 <strong>최대 8배 성능 향상</strong></li>
<li>벡터 검색에서 GloVe 데이터셋(d=200)에서 PQ, RabbiQ 대비 우수한 1@k 리콜 비율</li>
</ul>

<h3>기업에 주는 의미</h3>
<p>LLM을 프로덕션에 배포할 때 가장 큰 병목은 GPU 메모리입니다. TurboQuant가 실용화되면 <strong>동일한 H100 한 장으로 처리할 수 있는 동시 요청 수가 6배 이상</strong> 늘어납니다. 파인튜닝 없이 기존 모델에 바로 적용할 수 있다는 점이 핵심입니다.</p>
<p>특히 Gemini 모델 최적화에도 활용되고 있어, Google Cloud를 통한 기업 서비스에 직접 영향을 줄 것으로 보입니다. 온프레미스에서 오픈소스 LLM을 운영하는 기업이라면 TurboQuant 적용만으로 인프라 비용을 대폭 절감할 수 있습니다.</p>

<p><em>논문 저자: Amir Zandieh, Vahab Mirrokni, Praneeth Kacham, Majid Hadian, Insu Han, Majid Daliri, Lars Gottesbüren, Rajesh Jayaram (Google Research)</em></p>""",
        "category": "ai",
        "tags": ["TurboQuant", "양자화", "LLM", "Google Research", "ICLR 2026", "KV Cache", "추론 최적화"],
        "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    },
    {
        "title": "2026년 3월 오픈소스 LLM 리더보드: GLM-5, Kimi K2.5가 S티어를 지배하다",
        "description": "2026년 3월 기준 오픈소스 LLM 리더보드를 분석합니다. GLM-5(744B)와 Kimi K2.5(1T)가 S티어를 차지한 가운데, Llama 4 Maverick은 C티어에 머물렀습니다.",
        "content": """2026년 3월 기준 Onyx AI의 오픈소스 LLM 리더보드가 큰 변화를 보여주고 있습니다. 1년 전만 해도 Meta의 Llama와 Mistral이 양강 구도였지만, 지금은 중국 모델들이 상위권을 장악했습니다.

S티어: 최정상급 오픈소스 모델

GLM-5 (744B 파라미터)가 1위를 차지했습니다. 중국 칭화대 스핀오프 Zhipu AI의 모델로, MoE 아키텍처 기반입니다.

Kimi K2.5 (1T 파라미터)는 Moonshot AI의 모델로 HumanEval에서 99.0을 기록하며 코딩 능력에서 압도적입니다. MMLU-Pro에서도 87.1을 달성했습니다.

DeepSeek V3.2 (685B)는 MMLU-Pro 84.0, 전체 MMLU 90.8로 안정적인 성능을 보여줍니다. Qwen 3.5 (397B)는 MMLU-Pro 87.8로 파라미터 대비 효율이 뛰어납니다.

A티어: 강력한 경쟁자들

DeepSeek R1 (671B)은 추론 특화 모델로 A티어에 위치합니다. Qwen 3 235B는 119개 언어를 지원하며 Apache 2.0 라이선스로 기업 도입이 자유롭습니다.

C티어로 밀려난 Llama 4

주목할 점은 Meta의 Llama 4 Maverick (400B)이 C티어에 머물렀다는 것입니다. 1000만 토큰 컨텍스트 윈도우는 인상적이지만 벤치마크 성능에서 중국 모델들에 밀렸습니다. Mistral Large 3 (675B)도 B티어에 그쳤습니다.

기업이 오픈소스 LLM을 선택할 때

리더보드 순위만으로 모델을 선택하면 안 됩니다. 실제 도입 시 고려할 핵심 요소들입니다.

라이선스가 가장 중요합니다. Qwen 3는 Apache 2.0으로 상업적 자유가 보장되지만, 일부 모델은 제한적 라이선스를 적용합니다. 인프라 요구사항도 다릅니다. 1T 파라미터 모델은 A100/H100 다수가 필요하지만, Nemotron Super 49B나 Gemma 3 27B는 단일 GPU에서 구동 가능합니다.

한국어 성능은 별도 평가가 필수입니다. 리더보드의 영어 중심 벤치마크 순위와 한국어 실무 성능은 크게 다를 수 있습니다. Qwen 시리즈가 119개 언어를 공식 지원하는 반면, GLM-5의 한국어 능력은 추가 검증이 필요합니다.

도메인 특화 평가를 반드시 수행해야 합니다. 코딩이 주 용도라면 Kimi K2.5(HumanEval 99.0)가 최선이고, 범용 추론이라면 GLM-5나 DeepSeek V3.2가 적합합니다.

Chatbot Arena 점수(1318~1454)도 참고할 만하지만, 실제 업무 태스크에서의 성능 평가가 가장 중요합니다.

출처: Onyx AI Open LLM Leaderboard (2026년 3월)""",
        "content_html": """<h2>2026년 3월 기준 Onyx AI의 오픈소스 LLM 리더보드가 큰 변화를 보여주고 있습니다. 1년 전만 해도 Meta의 Llama와 Mistral이 양강 구도였지만, 지금은 중국 모델들이 상위권을 장악했습니다.</h2>

<h3>S티어: 최정상급 오픈소스 모델</h3>
<p><strong>GLM-5 (744B 파라미터)</strong>가 1위를 차지했습니다. 중국 칭화대 스핀오프 Zhipu AI의 모델로, MoE 아키텍처 기반입니다.</p>
<p><strong>Kimi K2.5 (1T 파라미터)</strong>는 Moonshot AI의 모델로 HumanEval에서 99.0을 기록하며 코딩 능력에서 압도적입니다. MMLU-Pro에서도 87.1을 달성했습니다.</p>
<p><strong>DeepSeek V3.2 (685B)</strong>는 MMLU-Pro 84.0, 전체 MMLU 90.8로 안정적인 성능을 보여줍니다. <strong>Qwen 3.5 (397B)</strong>는 MMLU-Pro 87.8로 파라미터 대비 효율이 뛰어납니다.</p>

<h3>A티어: 강력한 경쟁자들</h3>
<p><strong>DeepSeek R1 (671B)</strong>은 추론 특화 모델로 A티어에 위치합니다. <strong>Qwen 3 235B</strong>는 119개 언어를 지원하며 Apache 2.0 라이선스로 기업 도입이 자유롭습니다.</p>

<h3>C티어로 밀려난 Llama 4</h3>
<p>주목할 점은 <strong>Meta의 Llama 4 Maverick (400B)</strong>이 C티어에 머물렀다는 것입니다. 1000만 토큰 컨텍스트 윈도우는 인상적이지만 벤치마크 성능에서 중국 모델들에 밀렸습니다. <strong>Mistral Large 3 (675B)</strong>도 B티어에 그쳤습니다.</p>

<h3>기업이 오픈소스 LLM을 선택할 때</h3>
<p>리더보드 순위만으로 모델을 선택하면 안 됩니다. 실제 도입 시 고려할 핵심 요소들입니다.</p>
<ul>
<li><strong>라이선스</strong>가 가장 중요합니다. Qwen 3는 Apache 2.0으로 상업적 자유가 보장되지만, 일부 모델은 제한적 라이선스를 적용합니다.</li>
<li><strong>인프라 요구사항</strong>도 다릅니다. 1T 파라미터 모델은 A100/H100 다수가 필요하지만, Nemotron Super 49B나 Gemma 3 27B는 단일 GPU에서 구동 가능합니다.</li>
<li><strong>한국어 성능</strong>은 별도 평가가 필수입니다. 리더보드의 영어 중심 벤치마크 순위와 한국어 실무 성능은 크게 다를 수 있습니다.</li>
<li><strong>도메인 특화 평가</strong>를 반드시 수행해야 합니다. 코딩이 주 용도라면 Kimi K2.5(HumanEval 99.0)가 최선이고, 범용 추론이라면 GLM-5나 DeepSeek V3.2가 적합합니다.</li>
</ul>
<p>Chatbot Arena 점수(1318~1454)도 참고할 만하지만, 실제 업무 태스크에서의 성능 평가가 가장 중요합니다.</p>

<p><em>출처: <a href="https://onyx.app/open-llm-leaderboard">Onyx AI Open LLM Leaderboard</a> (2026년 3월)</em></p>""",
        "category": "ai",
        "tags": ["오픈소스 LLM", "GLM-5", "Kimi K2.5", "DeepSeek", "Qwen", "Llama 4", "리더보드", "벤치마크"],
        "image_url": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=400&fit=crop",
    },
]


class Command(BaseCommand):
    help = "Create initial blog posts"

    def handle(self, *args, **options):
        created = 0
        for post_data in POSTS:
            if BlogPost.objects.filter(title=post_data["title"]).exists():
                self.stdout.write(self.style.WARNING(f'  Skipped (exists): {post_data["title"][:50]}'))
                continue

            BlogPost.objects.create(
                title=post_data["title"],
                description=post_data["description"],
                content=post_data["content"],
                content_html=post_data["content_html"],
                author="이호진",
                category=post_data["category"],
                tags=post_data["tags"],
                image_url=post_data["image_url"],
                is_published=True,
                is_featured=True,
                date=timezone.now(),
            )
            created += 1
            self.stdout.write(self.style.SUCCESS(f'  Created: {post_data["title"][:50]}'))

        self.stdout.write(self.style.SUCCESS(f"\nDone: {created} posts created"))
