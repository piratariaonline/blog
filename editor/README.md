# Blog Editor

Local-only WYSIWYG MDX editor for authoring blog posts. Reads and writes files directly on disk inside the blog repository's `src/content` folder, and publishes changes via git.

## Architecture

Two npm workspaces under `editor/`:

- **`server/`** — Node + Express. Validates `BLOG_REPO`, exposes a small REST API for the file tree, file read/write, folder creation, uploads, and a `publish` endpoint that runs git commands.
- **`client/`** — Vite + React + TypeScript. Three-column UI: file tree | MDX WYSIWYG editor ([@mdxeditor/editor](https://mdxeditor.dev/)) | live preview.

## Setup

```powershell
cd editor
npm install
```

Optionally copy `.env.example` → `.env.local` and set `BLOG_REPO`. If unset, the server defaults to the parent directory (this repo), which is what you want when running from inside the blog repo.

## Run

```powershell
npm run dev
```

- Server: <http://localhost:4455>
- Editor UI: <http://localhost:5173>

The server refuses to start if `BLOG_REPO` doesn't exist or has no `src/content` directory.

## Publish flow

Clicking **Publish** runs, inside the blog repo:

1. `git checkout main` (safety — always publish from main)
2. `git add src/content` (only content is staged, nothing else)
3. `git commit -m "<your message>"`
4. `git push origin main`

Output of each step is reported back to the UI. If there are no staged changes, the publish is aborted with a clear message.

## What gets committed

The `editor/` folder itself is committed to the blog repo. `node_modules/`, build output, and `.env.local` are gitignored.
