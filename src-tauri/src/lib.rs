mod files;
mod tree;
mod watcher;

use tree::TreeNode;

#[tauri::command]
fn scan_tree(root: String) -> Result<TreeNode, String> {
    tree::scan_tree(&root)
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    files::read_file(&path)
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    files::write_file(&path, &content)
}

#[tauri::command]
async fn pick_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    let folder = app.dialog().file().blocking_pick_folder();
    Ok(folder.map(|f| f.to_string()))
}

#[tauri::command]
fn start_watch(app: tauri::AppHandle, root: String) -> Result<(), String> {
    watcher::start_watch(app, root)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            scan_tree,
            read_file,
            write_file,
            pick_folder,
            start_watch
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
