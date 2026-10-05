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
  repository.ts          ← single module for all Firestore/Storage operations
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
| `/` | `Editor` | Required (redirects if no user) |
| `/edit/:id` | `Editor` (edit mode) | Required (redirects if no user) |
| `/list` | `List` | Required (redirects if no user) |
| `/login` | `Login` | Public |

- **Editor**: Start screen. The whole screen is a textarea; top-left hamburger goes to `/list`, bottom-right button (or `⌘/Ctrl+Enter`) saves. Saving runs in the background and clears the input immediately; a toast reports success/failure. Pasting an image saves it as an image clip right away.
- **Editor (edit mode)**: Same screen at `/edit/:id`. Loads the clip via `getClip` (redirects to `/list` if missing, not owned, deleted, or an image) and saves via `updateClip` (sets `updateDatetime`, keeps `createDatetime`/order). Stays on screen after saving; save is disabled until the text changes. Image paste is ignored.
- **List**: Clipboard feed — clicking a text clip opens it in edit mode; displays clips in reverse chronological order with load-more pagination. Bottom-right floating `+` button returns to `/`.
- **Login**: Google OAuth via `signInWithPopup`.

### Auth Initialization
There is no loading screen: routes render immediately. `Layout` awaits `auth.authStateReady()` in the background and redirects to `/login` if there is no user. `repository.ts` functions also await `authStateReady()` before hitting Firestore, so calls made before auth resolves still work.

### Pagination
`useClip` uses a Firestore `QuerySnapshot` ref to cursor-paginate. `getClipsData()` resets from the top; `getClipsMore()` loads the next page prepended to the current list.

### Deployment
The app deploys to GitHub Pages at `https://ricepotato.github.io/myclipboard/`. The hash router is required for this hosting (no server-side routing support).
