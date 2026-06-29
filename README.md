# markrig

A live viewer and editor for the Markdown plan files Claude Code generates. markrig gives you a two-pane layout — a file tree on the left, a rendered or editable view on the right — so you can navigate, read, and edit a project's `.md` files without digging through folders.

Built with [Tauri v2](https://v2.tauri.app/) (Rust) + React + TypeScript, so it runs on macOS and Linux as a small native app.

## Features

- **Import a project folder** and browse its markdown files in a nested tree (only folders containing `.md` are shown; `node_modules`, `.git`, `dist`, `target` are ignored).
- **Live folder watching** — the tree updates as files appear/disappear, and the open file auto-reloads when it changes on disk.
- **Rendered ↔ Source toggle** — read GitHub-flavoured markdown (tables, task lists, code highlighting) or edit the raw source in a CodeMirror editor.
- **Edit and save** with `Cmd/Ctrl+S`. A conflict banner appears if the file changed on disk while you had unsaved edits, letting you reload or keep your changes.
- **Recent folders** remembered across sessions.

## Screenshots

<!-- Add screenshots here once the app is running -->

## Prerequisites

- **Node.js 20+** and npm
- **Rust** (stable) — install via [rustup](https://rustup.rs)
- **Tauri v2 system dependencies** — follow the [Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/) for your OS:
  - **macOS:** Xcode Command Line Tools (`xcode-select --install`)
  - **Linux:** `webkit2gtk`, `librsvg`, and related packages (see the guide)

## Quick start

```bash
# 1. Clone
git clone https://github.com/RiggdAI/markrig.git
cd markrig

# 2. Install JS dependencies
npm install

# 3. Run the app in development (Vite dev server + Tauri window, hot-reload)
npm run tauri dev
```

The first `npm run tauri dev` compiles the Rust backend, so it takes a minute; subsequent runs are fast.

## Using markrig

1. **Import a folder** — click **Import Folder** and pick a project directory. Its markdown files appear in the left tree.
2. **Open a file** — click any `.md` file. It renders in the right pane.
3. **Toggle the view** — use **Rendered** / **Source** in the header. Source mode is also the editor.
4. **Edit & save** — type in Source mode, then press `Cmd/Ctrl+S` (or the **Save** button). The header shows a dirty indicator (`•`) while you have unsaved changes.
5. **Live updates** — if Claude Code (or anything else) rewrites the open file, markrig reloads it automatically when you have no unsaved edits. If you *do* have unsaved edits, a banner offers **Reload** (take disk version) or **Keep mine**.
6. **Recents** — previously imported folders appear in the sidebar for one-click reopening.

## Scripts

| Command | What it does |
|---|---|
| `npm run tauri dev` | Run the full app (frontend + Rust) with hot-reload |
| `npm run dev` | Run only the Vite frontend in a browser (no Tauri APIs) |
| `npm run build` | Type-check (`tsc`) and build the frontend bundle |
| `npm run tauri build` | Build a production app bundle + installer (see below) |
| `npm test` | Run the frontend test suite (Vitest) |
| `npm run test:watch` | Run frontend tests in watch mode |

Rust tests live in `src-tauri`:

```bash
cd src-tauri && cargo test
```

## Building a release

```bash
npm run tauri build
```

Produces a native bundle under `src-tauri/target/release/bundle/` — a `.app` and `.dmg` on macOS, an AppImage / `.deb` on Linux. macOS `.dmg` packaging requires a full macOS environment (and signing for distribution).

## Install via Homebrew (coming soon)

A Homebrew cask skeleton lives at [`Casks/markrig.rb`](Casks/markrig.rb). It is **not yet installable** — the cask `url` and `sha256` must be finalized once the first release is published at https://github.com/RiggdAI/markrig/releases.

Once released:

```bash
brew install --cask markrig
```

## Project structure

```
markrig/
├── src/                # React + TypeScript frontend
│   ├── components/      # FolderTree, RenderedPane, EditorPane
│   ├── store/           # Zustand document store (open file, dirty/conflict state)
│   ├── tauri.ts         # Typed wrappers around Tauri commands/events
│   └── App.tsx          # Two-pane app shell
├── src-tauri/           # Rust backend
│   └── src/             # files, tree (scan), watcher, command wiring
└── Casks/markrig.rb     # Homebrew cask (skeleton)
```

## License

MIT
