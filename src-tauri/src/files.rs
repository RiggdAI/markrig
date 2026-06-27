//! Single-file read/write. The only place markdown content touches the disk.

pub fn read_file(path: &str) -> Result<String, String> {
    std::fs::read_to_string(path)
        .map_err(|e| format!("Couldn't read {path}: {e}"))
}

pub fn write_file(path: &str, content: &str) -> Result<(), String> {
    std::fs::write(path, content)
        .map_err(|e| format!("Couldn't write {path}: {e}"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn write_then_read_roundtrips() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("note.md");
        let p = path.to_str().unwrap();
        write_file(p, "# Hello").unwrap();
        assert_eq!(read_file(p).unwrap(), "# Hello");
    }

    #[test]
    fn read_missing_file_errors_with_path() {
        let err = read_file("/no/such/file.md").unwrap_err();
        assert!(err.contains("/no/such/file.md"));
    }
}
