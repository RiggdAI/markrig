//! Walks a project folder and returns a tree containing only `.md` files
//! and the directories that (transitively) contain them.

use serde::Serialize;

const IGNORED_DIRS: [&str; 4] = ["node_modules", ".git", "dist", "target"];

#[derive(Serialize, Clone, Debug, PartialEq)]
pub struct TreeNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Vec<TreeNode>,
}

pub fn scan_tree(root: &str) -> Result<TreeNode, String> {
    let path = std::path::Path::new(root);
    let name = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| root.to_string());
    build_dir(path, name)?
        .ok_or_else(|| format!("No markdown files found under {root}"))
}

/// Returns Some(node) if the directory contains markdown (directly or nested),
/// otherwise None so empty branches are pruned.
fn build_dir(dir: &std::path::Path, name: String) -> Result<Option<TreeNode>, String> {
    let entries = std::fs::read_dir(dir)
        .map_err(|e| format!("Couldn't read {}: {e}", dir.display()))?;
    let mut children = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| format!("Couldn't read entry in {}: {e}", dir.display()))?;
        let p = entry.path();
        let child_name = entry.file_name().to_string_lossy().to_string();
        if p.is_dir() {
            if IGNORED_DIRS.contains(&child_name.as_str()) {
                continue;
            }
            if let Some(node) = build_dir(&p, child_name)? {
                children.push(node);
            }
        } else if p.extension().and_then(|e| e.to_str()) == Some("md") {
            children.push(TreeNode {
                name: child_name,
                path: p.to_string_lossy().to_string(),
                is_dir: false,
                children: vec![],
            });
        }
    }
    if children.is_empty() {
        return Ok(None);
    }
    children.sort_by(|a, b| (b.is_dir, &a.name).cmp(&(a.is_dir, &b.name)));
    Ok(Some(TreeNode {
        name,
        path: dir.to_string_lossy().to_string(),
        is_dir: true,
        children,
    }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    fn names(node: &TreeNode) -> Vec<String> {
        node.children.iter().map(|c| c.name.clone()).collect()
    }

    #[test]
    fn includes_md_and_dirs_containing_md_only() {
        let dir = tempdir().unwrap();
        let root = dir.path();
        fs::write(root.join("README.md"), "x").unwrap();
        fs::write(root.join("notes.txt"), "x").unwrap(); // non-md ignored
        fs::create_dir(root.join("docs")).unwrap();
        fs::write(root.join("docs/plan.md"), "x").unwrap();
        fs::create_dir(root.join("empty")).unwrap(); // no md -> dropped
        fs::create_dir(root.join("node_modules")).unwrap();
        fs::write(root.join("node_modules/dep.md"), "x").unwrap(); // ignored dir

        let tree = scan_tree(root.to_str().unwrap()).unwrap();
        let mut top = names(&tree);
        top.sort();
        assert_eq!(top, vec!["README.md".to_string(), "docs".to_string()]);

        let docs = tree.children.iter().find(|c| c.name == "docs").unwrap();
        assert_eq!(names(docs), vec!["plan.md".to_string()]);
    }
}
