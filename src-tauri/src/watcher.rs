//! Recursive folder watching. Emits debounced markdown change events.

use notify_debouncer_mini::{new_debouncer, notify::RecursiveMode};
use serde::Serialize;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

#[derive(Serialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum MdEventKind {
    Created,
    Changed,
    Deleted,
}

#[derive(Serialize, Clone, Debug)]
pub struct MdEvent {
    pub kind: MdEventKind,
    pub path: String,
}

pub fn is_markdown(path: &std::path::Path) -> bool {
    path.extension().and_then(|e| e.to_str()) == Some("md")
}

pub fn classify_event(existed_before: bool, exists_now: bool) -> MdEventKind {
    match (existed_before, exists_now) {
        (false, true) => MdEventKind::Created,
        (true, false) => MdEventKind::Deleted,
        _ => MdEventKind::Changed,
    }
}

/// Starts a recursive watcher on `root`, emitting `md-event` for markdown paths.
/// The debouncer is leaked intentionally so it lives for the app's lifetime.
pub fn start_watch(app: AppHandle, root: String) -> Result<(), String> {
    let mut debouncer = new_debouncer(Duration::from_millis(300), move |res: notify_debouncer_mini::DebounceEventResult| {
        if let Ok(events) = res {
            for ev in events {
                let path = ev.path;
                if !is_markdown(&path) {
                    continue;
                }
                let kind = classify_event(true, path.exists());
                let _ = app.emit(
                    "md-event",
                    MdEvent { kind, path: path.to_string_lossy().to_string() },
                );
            }
        }
    })
    .map_err(|e| format!("Couldn't create watcher: {e}"))?;

    debouncer
        .watcher()
        .watch(std::path::Path::new(&root), RecursiveMode::Recursive)
        .map_err(|e| format!("Couldn't watch {root}: {e}"))?;

    std::mem::forget(debouncer);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn is_markdown_checks_extension() {
        assert!(is_markdown(Path::new("/a/b/plan.md")));
        assert!(!is_markdown(Path::new("/a/b/notes.txt")));
    }

    #[test]
    fn classify_covers_create_change_delete() {
        assert_eq!(classify_event(false, true), MdEventKind::Created);
        assert_eq!(classify_event(true, true), MdEventKind::Changed);
        assert_eq!(classify_event(true, false), MdEventKind::Deleted);
    }
}
