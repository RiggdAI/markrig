//! Recursive folder watching. Emits debounced markdown change events.

use serde::Serialize;

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
