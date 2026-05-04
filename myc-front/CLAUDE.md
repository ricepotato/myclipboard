# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
  routes/root.tsx        ← main clipboard feed page
```

**Clip document schema** (Firestore `clips` collection):
```ts
{ userId, username, createDatetime, type, text, status, imageUrl? }
```
- `status`: `"active"` | `"deleted"` (soft delete via `updateDoc`)
- `type`: MIME-type string (e.g. `"text/plain"`, `"image/png"`)

### Routes
| Path | Component | Auth |
|------|-----------|------|
| `/` | `Root` | Required (redirects if no user) |
| `/login` | `Login` | Public |
| `/main` | `Main` | Required |

- **Root**: Clipboard feed — displays clips in reverse chronological order with load-more pagination. `ClipboardForm` is a fixed bottom input for adding new clips.
- **Main**: Note editor view with collapsible `Aside` sidebar (toggle at `w-80` / `w-16`). Save logic (`⌘S`) is wired up but not yet implemented in the backend.
- **Login**: Google OAuth via `signInWithPopup`.

### Auth Initialization
`App.tsx` waits for `auth.authStateReady()` (min 1 second) before rendering routes, showing `Loading` in the interim.

### Pagination
`useClip` uses a Firestore `QuerySnapshot` ref to cursor-paginate. `getClipsData()` resets from the top; `getClipsMore()` loads the next page prepended to the current list.

### Deployment
The app deploys to GitHub Pages at `https://ricepotato.github.io/myclipboard/`. The hash router is required for this hosting (no server-side routing support).
