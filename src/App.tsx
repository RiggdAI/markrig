import { useEffect, useState } from 'react';
import './App.css';
import { useDocStore, isDirty } from './store/useDocStore';
import { FolderTree } from './components/FolderTree';
import { RenderedPane } from './components/RenderedPane';
import { EditorPane } from './components/EditorPane';
import {
  pickFolder, scanTree, readFile, writeFile, startWatch, onMdEvent,
} from './tauri';
import { addRecent, getRecents } from './recents';

export default function App() {
  const s = useDocStore();
  const dirty = isDirty(s);
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    getRecents().then(setRecents);
  }, []);

  useEffect(() => {
    const unlisten = onMdEvent(async (e) => {
      const { root } = useDocStore.getState();
      if (root) useDocStore.getState().setTree(await scanTree(root));
      if (e.path === useDocStore.getState().openPath && e.kind !== 'deleted') {
        useDocStore.getState().onDiskChange(e.path, await readFile(e.path));
      }
    });
    return () => { unlisten.then((u) => u()); };
  }, []);

  async function openRoot(root: string) {
    s.setRoot(root);
    s.setTree(await scanTree(root));
    await startWatch(root);
    await addRecent(root);
    setRecents(await getRecents());
  }

  async function importFolder() {
    const root = await pickFolder();
    if (!root) return;
    await openRoot(root);
  }

  async function open(path: string) {
    s.openFile(path, await readFile(path));
  }

  function doSave() {
    const { openPath, editorContent, markSaved } = useDocStore.getState();
    if (!openPath) return;
    void writeFile(openPath, editorContent).then(() => markSaved());
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        doSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main className="app">
      <aside className="sidebar">
        <button onClick={importFolder}>Import Folder</button>
        {recents.length > 0 && (
          <div className="recents">
            {recents.map((p) => (
              <button key={p} onClick={() => openRoot(p)} title={p}>
                {p.split('/').pop() || p}
              </button>
            ))}
          </div>
        )}
        <FolderTree tree={s.tree} openPath={s.openPath} onSelect={open} />
      </aside>
      <section className="content">
        {s.openPath ? (
          <>
            <header className="pane-header">
              <span className="filename">
                {s.openPath.split('/').pop()}{dirty ? ' •' : ''}
              </span>
              <div className="actions">
                <button
                  className={s.viewMode === 'rendered' ? 'active' : ''}
                  onClick={() => s.setViewMode('rendered')}
                >Rendered</button>
                <button
                  className={s.viewMode === 'source' ? 'active' : ''}
                  onClick={() => s.setViewMode('source')}
                >Source</button>
                <button onClick={doSave} disabled={!dirty}>Save</button>
              </div>
            </header>
            {s.conflict && (
              <div className="conflict-banner">
                This file changed on disk.
                <button onClick={() => s.resolveConflict('reload')}>Reload</button>
                <button onClick={() => s.resolveConflict('keep')}>Keep mine</button>
              </div>
            )}
            {s.viewMode === 'rendered' ? (
              <RenderedPane content={s.editorContent} />
            ) : (
              <EditorPane value={s.editorContent} onChange={s.setEditorContent} />
            )}
          </>
        ) : (
          <div className="empty-state">Import a folder to get started</div>
        )}
      </section>
    </main>
  );
}
