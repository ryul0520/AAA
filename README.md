# 생기부 기반 면접 대비 — 개인용

원본 사이트의 주요 구조를 참고해 만든 **완전 독립형 정적 웹앱**입니다.

## 포함 기능

- 활동 아카이브
  - 카드 / 피드 / 게시판 / 갤러리 탭
  - 검색
  - 분류 필터
  - 정렬
  - 활동 등록 / 편집
  - 즐겨찾기
  - 활동 상세 면접 질문
- 공통 면접 질문
- 메모·회고
- 대시보드
- 즐겨찾기
- Activity Map
- 랜덤 면접 + 말하기 시간 측정
- Quick Review
- JSON 백업 / 복원
- 다크 모드
- 브라우저 localStorage 저장

## 개인정보

이 버전은 Google Analytics, Firebase, 별도 API, 서버 DB를 사용하지 않습니다.
입력한 생기부와 활동 기록은 해당 브라우저의 localStorage에만 저장됩니다.

따라서 GitHub 저장소에 생기부 원문을 넣을 필요가 없습니다.

주의: 브라우저 localStorage는 같은 PC의 같은 브라우저 프로필에서 접근할 수 있습니다. 공용 PC에서는 사용하지 마세요.

## GitHub Pages

저장소 루트에 `index.html`, `style.css`, `app.js`를 올리고
Settings → Pages → Deploy from a branch → main / root를 선택하면 됩니다.
