# MyClipboard

텍스트와 이미지를 클라우드에 저장하고 어디서든 불러올 수 있는 클립보드 앱.

## Features

- Google 계정으로 로그인
- 텍스트 및 이미지 클립 저장
- 클립보드에서 직접 붙여넣기 (텍스트 / 이미지)
- 클립 복사 및 삭제
- 페이지네이션으로 과거 클립 불러오기
- Optimistic UI — 서버 응답 전에 즉시 화면에 반영

## Tech Stack

- **React** + **TypeScript** (Create React App + CRACO)
- **Firebase** — Firestore (데이터 저장), Firebase Auth (Google 로그인), Firebase Storage (이미지 업로드)
- **React Router v6** — Hash 기반 라우팅 (GitHub Pages 호환)
- **Tailwind CSS** + **shadcn/ui** (Radix UI)
- **Pretendard Variable** 폰트

## Routes

| Path | 설명 | 인증 |
|------|------|------|
| `/` | 클립 피드 (메인) | 필요 |
| `/login` | Google 로그인 | 불필요 |
| `/main` | 노트 에디터 | 필요 |

## Getting Started

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 Firebase 설정을 입력합니다.

```
REACT_APP_API_KEY=
REACT_APP_AUTH_DOMAIN=
REACT_APP_DATABASE_URL=
REACT_APP_PROJECT_ID=
REACT_APP_STORAGE_BUCKET=
REACT_APP_MESSAGING_SENDER_ID=
REACT_APP_APP_ID=
REACT_APP_MEASUREMENT_ID=
```

### Commands

```bash
npm start        # 개발 서버 실행 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm test         # 테스트 실행
npm run deploy   # GitHub Pages 배포
```

## Data Schema

Firestore `clips` 컬렉션의 문서 구조:

```ts
{
  userId: string
  username: string
  createDatetime: number      // Unix timestamp (ms)
  type: string                // "text/plain" | "image/png" 등
  text: string
  status: "active" | "deleted"
  imageUrl?: string           // 이미지 클립인 경우
}
```

## Deployment

GitHub Pages에 배포됩니다: `https://ricepotato.github.io/myclipboard/`

Hash 라우터(`createHashRouter`)를 사용하므로 별도의 서버 설정 없이 정적 호스팅이 가능합니다.
