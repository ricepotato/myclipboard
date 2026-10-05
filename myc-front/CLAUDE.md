# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working Guidelines

When receiving feature modification or implementation requests, if there are any ambiguous aspects regarding functionality (e.g., expected behavior, edge cases, scope, UI interaction), ask the user clarifying questions before proceeding with implementation.

## Commands

```bash
npm start        # Start dev server (http://localhost:3000)
npm run build    # Production build
npm test         # Run tests in watch mode
npm run deploy   # Build and publish to GitHub Pages
```

Run a single test file:
```bash
npm test -- --testPathPattern=App.test
```

## Environment Variables

Firebase config is loaded from environment variables. Create a `.env` file at the project root:

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

## Architecture

**MyClipboard** is a React + TypeScript SPA that lets authenticated users save, view, and manage clipboard items (text and images) stored in Firebase.

### Stack
- **Create React App** with **CRACO** for webpack alias configuration
- **React Router v6** using `createHashRouter` (hash-based for GitHub Pages compatibility)
- **Firebase**: Firestore (clip storage), Firebase Auth (Google sign-in), Firebase Storage (image uploads)
- **Tailwind CSS** + **shadcn/ui** components (Radix UI primitives)
- **Pretendard Variable** font applied globally via `pretendard` CSS class

### Path Aliases (configured in `craco.config.js`)
- `@/components` → `src/components`
- `@/lib` → `src/lib`

### Data Flow

```
Firebase (Firestore/Storage/Auth)
        ↓
  repository.ts          ← single module for all Firestore/Storage operations + background sync
        ↕
  localStore.ts          ← IndexedDB outbox of clips not yet uploaded
        ↓
  hooks/useClip.ts       ← React hook managing clips state + pagination
        ↓
  routes/editor.tsx      ← full-screen input (writes via addClip)
  routes/list.tsx        ← clip list feed (reads via useClip)
```

**Clip document schema** (Firestore `clips` collection):
```ts
{ userId, username, createDatetime, type, text, status, imageUrl?, updateDatetime? }
```
- `status`: `"active"` | `"deleted"` (soft delete via `updateDoc`)
- `type`: MIME-type string (e.g. `"text/plain"`, `"image/png"`)

### Routes
| Path | Component | Auth |
|------|-----------|------|
| `/` | `Editor` | Optional |
| `/edit/:id` | `Editor` (edit mode) | Optional |
| `/list` | `List` | Optional |
| `/login` | `Login` | Public |

- **Editor**: Start screen. The whole screen is a textarea; top-left hamburger goes to `/list`, bottom-right button (or `⌘/Ctrl+Enter`) saves. Saving writes to the local outbox and clears the input immediately; the toast says "저장됨" when logged in and online, otherwise "기기에 저장됨". Pasting an image saves it as an image clip right away.
- **Editor (edit mode)**: Same screen at `/edit/:id`. Loads the clip via `getClip` (local outbox first, then Firestore; redirects to `/list` if missing, not owned, deleted, or an image) and saves via `updateClip` (sets `updateDatetime`, keeps `createDatetime`/order). Stays on screen after saving; save is disabled until the text changes. Image paste is ignored.
- **List**: Clipboard feed — clicking a text clip opens it in edit mode; shows server clips merged with local outbox clips (badged "동기화 대기"), in reverse chronological order with load-more pagination. Bottom-right floating `+` button returns to `/`.
- **Login**: Google OAuth via `signInWithPopup`.

### Auth & Offline
Login is optional and there is no loading screen: routes render immediately, and nothing redirects to `/login` (reach it from the List header). `repository.ts` functions await `authStateReady()` before hitting Firestore, so calls made before auth resolves still work.

- **Local-first saves**: `addClip` always writes to the IndexedDB outbox (`localStore.ts`), tagged with `ownerUid` (the current uid, or `null` when logged out). `syncPendingClips()` uploads outbox clips owned by the current user or `null` (so logged-out clips go to the first account that logs in), then removes them locally. Sync runs on app start/auth change (`startBackgroundSync` in `index.tsx`), on the `online` event, and after each save/edit.
- **Idempotent upload**: the local id is reused as the Firestore doc id (`setDoc`), so retries overwrite instead of duplicating. If a clip is edited mid-upload it stays in the outbox and is re-uploaded; if deleted mid-upload it is soft-deleted on the server.
- **Firestore offline cache**: `firebase.ts` uses `persistentLocalCache`, so previously loaded clips can be listed/edited offline. Firestore write promises don't settle while offline, so `writeToFirestore` doesn't await them when `navigator.onLine` is false.
- The CRA service worker (production builds only) serves the app shell offline after the first visit.

### Pagination
`useClip` uses a Firestore `QuerySnapshot` ref to cursor-paginate. `getClipsData()` resets from the top; `getClipsMore()` loads the next page prepended to the current list.

### Deployment
The app deploys to GitHub Pages at `https://ricepotato.github.io/myclipboard/`. The hash router is required for this hosting (no server-side routing support).
