# 생기부 기반 면접 연습 - Local

## 특징

- GitHub Pages에서 바로 실행 가능
- 생기부 텍스트를 외부 서버로 업로드하지 않음
- 브라우저의 JavaScript로만 분석
- 활동·과정 / 개념·원리 / 한계·배운 점 / 꼬리질문 / 진로·전공 질문 생성
- 질문별 답변 연습
- 스톱워치
- 답변 저장(페이지를 새로고침하면 삭제)

## GitHub Pages에 올리는 방법

1. 이 폴더의 `index.html`, `style.css`, `app.js`를 GitHub 저장소에 업로드
2. GitHub 저장소의 Settings → Pages
3. Deploy from a branch 선택
4. `main` / `/ (root)` 선택
5. 저장 후 생성된 GitHub Pages 주소 접속

## 개인정보 관련

이 버전은 생기부 내용을 fetch, XMLHttpRequest, 서버 API 등으로 전송하지 않습니다.
입력 내용은 현재 브라우저 탭의 메모리에서만 사용합니다.

PDF/HWP 자동 업로드 기능은 넣지 않았습니다. 생기부 파일을 자동으로 서버에 보내는 구조를 피하기 위해서입니다.
