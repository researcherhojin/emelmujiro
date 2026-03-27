# Next Session TODO

## 1. Profile Page Final Check

- [ ] Add missing lecture history (충남ICT, 제주더큰내일센터, UST, 한국환경산업기술원)
- [ ] Verify career descriptions match 데이원컴퍼니 profile image

## 2. Blog Content Expansion

### Post 1: [종합] 2026 프론티어 AI 모델 아키텍처·성능 완전 비교

- [ ] 10개 모델 아키텍처 분류 (Dense / Sparse MoE / Hybrid)
  - MoE: DeepSeek V3.2, GLM-5, Kimi K2.5, MiniMax M2.5, Step-3.5-Flash, Llama 4 Maverick
  - Hybrid: Nemotron 3 (Mamba+Transformer), Qwen 3.5 (Gated DeltaNet)
  - Dense/Small: Gemma 3, GPT-OSS
- [ ] 벤치마크 비교표 (SWE-Bench, AIME, LiveCodeBench, MMLU, 한국어)
- [ ] 비용·라이선스·도입 가이드
- [ ] Ref: Sebastian Raschka LLM Architecture Gallery

### Post 2: [딥다이브] Sparse MoE 전쟁 — DeepSeek V3.2 vs GLM-5 vs Kimi K2.5 vs Llama 4

- [ ] MLA (Multi-head Latent Attention) vs GQA vs Early Fusion 비교
- [ ] DeepSeek Sparse Attention (DSA) 분석
- [ ] Expert 라우팅 전략 차이 (shared expert, top-k routing)
- [ ] Ref: DeepSeek V3 technical report, GLM-5 report, Llama 4 Meta blog
- [ ] Ref: arxiv papers for each model

### Post 3: [딥다이브] 하이브리드 아키텍처의 부상 — Nemotron 3 vs Qwen 3.5

- [ ] SSM (Mamba-2) vs Linear Attention (Gated DeltaNet) vs Transformer 장단점
- [ ] Latent MoE + Multi-token prediction (Nemotron 3)
- [ ] 추론 속도·메모리 효율·KV 캐시 비교
- [ ] Ref: Mamba paper (Gu & Dao), Nemotron 3 Super technical report (NVIDIA)
- [ ] Ref: Qwen3.5 technical report, DeltaNet paper

### Post 4: [딥다이브] 오픈소스 LLM 실전 선택 가이드 — GPT-OSS vs Gemma 3 vs Qwen 시리즈

- [ ] Qwen 버전별 아키텍처 변화 (2.5 Dense → 3 MoE → 3.5 Hybrid)
- [ ] Gemma 3 sliding window attention (5:1 local/global)
- [ ] GPT-OSS MXFP4 양자화, 엣지 배포
- [ ] 한국어 성능 비교, 실무 도입 시나리오
- [ ] Ref: Gemma 3 arxiv (2503.19786), GPT-OSS OpenAI blog
- [ ] Ref: Qwen series technical reports

### Common

- [ ] Appropriate thumbnail images per post
- [ ] Each post includes paper references and benchmark metrics

## 3. Production Deploy Verification

- [ ] Verify frontend build is properly deployed after new changes
- [ ] Test service modals, blog, profile on emelmujiro.com
