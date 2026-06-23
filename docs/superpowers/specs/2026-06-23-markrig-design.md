# markrig — Design Spec

Date: 2026-06-23

## Purpose

A cross-platform desktop app for reading and editing the Markdown plan files that
Claude Code (and plugins like Claude plan / superpowers) generate while working on a
project. Today those `.md` plans are scattered across project folders and tedious to
find and open. `markrig` imports a project folder, watches it live, lists its Markdown
files in a tree, and renders the selected file in a readable view — with editing,
saving, and a source/rendered toggle.

## Stack

- **Tauri v2** — Rust backend, native webview, small cross-platform binaries.
- **Frontend:** React + Vite + TypeScript.
- **State:** Zustand.
- **Markdown rendering:** `react-markdown` + `remark-gfm` (tables, task lists,
  strikethrough) + `rehype-highlight` (code blocks) + `rehype-sanitize` (safety).
- **Editor:** CodeMirror 6 with markdown language support.
- **Tauri plugins:** `tauri-plugin-dialog` (folder picker), `tauri-plugin-store`
  (recent folders persistence).
- **Distribution:** Tauri bundler → Homebrew cask (macOS), AppImage / `.deb` (Linux).

## Architecture

Two processes: a trusted Rust core that owns all filesystem access, and a React
webview that only renders and edits in memory, calling the core for any disk operation.

### Rust core

All filesystem work lives here, exposed as Tauri commands and events. Split into
focused modules:

- **`files.rs`**
  - `read_file(path) -> Result<String>`
  - `write_file(path, content) -> Result<()>`
- **`tree.rs`**
  - `scan_tree(root) -> Result<TreeNode>` — walks the folder and returns a nested tree
    containing only directories that (transitively) contain `.md` files, plus the
    `.md` files themselves. Ignores `node_modules`, `.git`, and other VCS/build dirs.
- **`watcher.rs`**
  - `watch_folder(root)` — starts a recursive watcher using the `notify` crate.
    Emits debounced Tauri events to the frontend: `md:created`, `md:changed`,
    `md:deleted`, each carrying the affected path. Replaces any prior watcher when a
    new folder is imported.
- **Recent folders** — persisted via `tauri-plugin-store` as a small JSON file in the
  app config dir; loaded on startup to offer recents.

All commands return typed `Result`s. Errors are specific and actionable (path,
operation, OS error) and surfaced to the UI — never silently swallowed.

### React UI

The webview never touches the disk directly; it calls Rust commands and listens for
watcher events.

- **`useDocStore` (Zustand)** — holds: imported root, tree, recent folders, open file
  path, `diskContent`, `editorContent`, view mode (`source` | `rendered`), and the
  conflict-banner state. Derived `isDirty = diskContent !== editorContent`.
- **`FolderTree`** — left pane. Nested, collapsible tree of only folders containing
  `.md`. Clicking a file opens it. Updates live in response to watcher events.
- **Right pane:**
  - **`PaneHeader`** — file name, dirty indicator, and the `ViewToggle`.
  - **`ViewToggle`** — switches the body between Source and Rendered.
  - **`EditorPane`** — CodeMirror 6, markdown highlighting. Edits update
    `editorContent`. This is the source view and the editor (same component).
  - **`RenderedPane`** — `react-markdown` pipeline, styled for readable, document-like
    output.
- **Save** — `Cmd/Ctrl+S` and a Save button call `write_file`, then set
  `diskContent = editorContent` to clear the dirty state.

## Data flow

1. User imports a folder (`pick_folder` dialog, or selects a recent).
2. `scan_tree` populates the tree; `watch_folder` starts watching the root.
3. Watcher events mutate the tree in real time (add/remove nodes for created/deleted
   `.md` files).
4. When the **currently open** file emits `md:changed`:
   - **No unsaved edits** (`!isDirty`) → reload silently: read the file, set both
     `diskContent` and `editorContent`.
   - **Unsaved edits** (`isDirty`) → show a "changed on disk" banner with **Reload**
     (disk wins) and **Keep mine** (dismiss, keep editor content; new `diskContent` is
     stored so a later save still works against the latest known disk state).

## Error handling

- Rust commands fail loudly with typed errors including the path and OS cause.
- The UI shows the failure inline (e.g. "Couldn't read `<file>`: permission denied")
  rather than blank states or silent recovery.
- A file that disappears while open shows a clear "file no longer exists" state.

## Testing

- **Rust:**
  - `scan_tree` against a temp fixture directory — asserts the tree shape and that
    ignore rules (`node_modules`, `.git`) and the "only folders containing `.md`" rule
    hold.
  - `watcher` test — asserts an event fires when a fixture `.md` file is modified.
- **Frontend:**
  - Render test — markdown input (including a GFM task list and a table) produces the
    expected DOM.
  - Conflict/dirty-state logic test — `isDirty` derivation and the
    reload-vs-banner branch given simulated `md:changed` events.

## Out of scope (YAGNI for v1)

- WYSIWYG editing, multi-tab/multi-file editing, search across files, git integration,
  themes beyond a single readable default, non-`.md` file types.
