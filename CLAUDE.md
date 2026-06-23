# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Greenfield. The repository is currently empty — no code, build system, or tooling exists yet. There is no git history. The sections below describe the intended product; update this file with concrete commands and architecture as soon as the first code lands.

## Purpose

`markrig` is a desktop app for reading and editing the Markdown plan files that Claude Code (and plugins like Claude plan / superpowers) generate while working on a project. Today those `.md` plans are scattered across project folders and are tedious to find and open. This app surfaces them in one place with live folder watching and a readable rendered view.

## Core Requirements

These are the product constraints that future implementation work must satisfy:

- **Import a project repo folder** — user points the app at a project directory.
- **Live folder watching** — detect Markdown (`.md`) files as they are created, changed, or deleted, and reflect changes in the UI without manual refresh.
- **Two-pane layout** — left pane lists the project's Markdown files (folder tree); right pane renders the selected file.
- **Readable rendered view** — render Markdown into a clean, readable reader view.
- **Edit and save** — user can edit file content in the app and persist it back to disk.
- **View toggle** — switch the right pane between raw Markdown source and the rendered view.
- **Open source** — license and public repo.
- **Installable via Homebrew** — distribute through `brew` (macOS, and ideally Linux). Cross-platform (macOS/Linux) is a goal; the specific GUI stack is not yet decided.

## Architecture Notes (to be decided)

The GUI framework, language, and packaging approach are open decisions. When chosen, document here:

- The chosen stack and why (e.g. Electron/Tauri/native), since it drives the rest of the codebase.
- How the file watcher integrates with the UI render loop.
- How the editor reconciles in-app edits with external (Claude-driven) file changes — conflict/refresh behavior is a likely source of subtle bugs.
- The Homebrew formula / release pipeline once it exists.

## Working In This Repo

- This is the user's machine working directory and is **not** a git repository yet; do not assume git commands will work until it is initialized.
- Before adding a build/test/lint section below, wire up real commands and verify they run — do not document commands that have not been tried.
