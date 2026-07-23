# 학습 기록 운영 가이드

## Notion에서 쓰고, Notebook으로 공개하기

수업 글은 Notion에, 실행 가능한 코드는 VS Code에 작성합니다. 하루가 끝나면 같은 날짜·주제의 Notion 글을 하나로 합쳐 Jupyter Notebook의 Markdown 셀에 넣습니다. 이 최종본을 GitHub와 HTML에서 로그인 없이 확인합니다.

| 단계 | 작성 위치 | 기록 내용 |
|---:|---|---|
| 1 | Notion | 배운 내용 · 들으면서 든 생각 · 궁금한 점 |
| 2 | VS Code | 실습 설명 · 코드 · 실행 결과 · 차트 |
| 3 | Notion | 배운 점 · 실제 적용 아이디어 · 다음 액션 |
| 4 | Jupyter Notebook | 같은 날짜·주제의 Notion 글 + 코드·실행 결과 |

## 최종 노트북 순서

```text
# YYYY.MM.DD · 수업 주제

- [09:00 수업 노트](Notion URL)
- [14:00 수업 노트](Notion URL)

## 수업 기록

[같은 날짜·주제의 오전·오후 Notion 글을 하나로 합친 Markdown]

## 실습 코드

[코드 셀] 공통 환경
[코드 셀] 데이터 확인·분석·시각화
[실행 결과]
```

## 파일 저장 규칙

- 코드 실습이 있는 날: `YYYY-MM-DD_topic.ipynb` 생성
- 데이터: 저장소 루트의 `data/`
- 노트북에서 만든 이미지: 해당 주차의 `assets/`
- 코드가 없는 날: Notion에만 기록하고 `.ipynb`를 만들지 않습니다.
- 오전·오후의 날짜와 주제가 같으면 한 개의 노트북으로 합칩니다.
- 날짜가 같아도 주제가 다르면 노트북을 분리합니다.
- 하나의 주제를 여러 날 학습하면 날짜별 노트북을 만들고, 주차 README에서 같은 주제로 묶습니다.

예시:

```text
week01/
├── README.md
├── 2026-07-22_marketing_funnel.ipynb
├── 2026-07-23_marketing_analysis.ipynb
└── assets/
    └── 2026-07-23_funnel_chart.png
```

기존 주제별 노트북은 링크가 깨지지 않도록 파일명을 유지합니다. 새 기록부터 날짜형 파일명을 사용합니다.

## 새 노트북 만들기

저장소 루트에서 다음 명령을 실행합니다.

```bash
node scripts/new_daily_notebook.mjs \
  --week 1 \
  --date 2026-07-23 \
  --slug marketing_analysis \
  --title "마케팅 분석 기법" \
  --notion "https://app.notion.com/p/페이지주소"
```

생성 결과:

```text
week01/2026-07-23_marketing_analysis.ipynb
```

## 하루 마감 체크

- [ ] 날짜·수업명과 Notion 원문 링크가 맞는가?
- [ ] 같은 날짜·주제의 Notion 글을 중복 없이 한 Markdown 셀로 합쳤는가?
- [ ] 코드 셀을 위에서 아래로 다시 실행했는가?
- [ ] 개인 정보·인증키·공개할 수 없는 원본 데이터가 포함되지 않았는가?
- [ ] 주차 README에 새 노트북 링크를 추가했는가?

> Notion은 작성 원본, Notebook은 글·코드·실행 결과를 함께 보는 공개본입니다. Notion에는 전체 코드를 붙이지 않고 실습 주제·핵심 결과만 간단히 적습니다.
