# markrig

A live viewer and editor for Claude Code markdown plans. markrig gives you a two-pane layout — a file tree on the left and a rendered or editable view on the right — so you can navigate, read, and edit `.md` files in a project folder without leaving your flow.

**Features**

- Import a project folder and browse its markdown files in a nested tree
- Live folder watching: the view auto-reloads when files change on disk
- Toggle between rendered (GitHub-flavoured markdown) and source (CodeMirror editor) views
- Edit and save with Cmd/Ctrl+S; a dirty-banner warns when on-disk content differs from your edits
- Recent folders remembered across sessions

## Screenshots

<!-- Add screenshots here once the app is running -->

## Development

**Requirements:** Node 20+, Rust stable, and [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/).

```bash
npm install
npm run tauri dev
```

This starts the Vite dev server and opens the app in a Tauri window with hot-reload.

## Packaging

```bash
npm run tauri build
```

Produces a `.app` bundle and `.dmg` installer under `src-tauri/target/release/bundle/`.

## Install via Homebrew (coming soon)

A Homebrew cask skeleton lives at [`Casks/markrig.rb`](Casks/markrig.rb). It is not yet installable — the cask URL and `sha256` must be finalized once the first GitHub release is published at `https://github.com/maxlibin/markrig/releases`.

Once released, the cask will be installable via:

```bash
brew install --cask markrig
```

## License

MIT
