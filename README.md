# psychtest

심리테스트 + 친구/커플 궁합 사이트.

- Vite + React, HashRouter로 GitHub Pages 하위 경로 배포
- Supabase(`pt_` 접두사 테이블)에 결과 저장, 결과 코드로 궁합 조회
- 로그인 없음 — 결과 링크/코드 공유 방식

## 개발

```
npm install
npm run dev
```

`.env.local`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` 필요 (`.env.example` 참고).

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 빌드해서 Pages로 배포한다.

## 테스트 추가하기

`src/data/tests/`에 새 테스트 정의 파일을 만들고 `tests` 맵에 등록하면 된다.
엔진(`testEngine.js`, `compatEngine.js`)은 축(axis)/극(pole) 구조만 맞으면
어떤 테스트든 그대로 처리한다.
