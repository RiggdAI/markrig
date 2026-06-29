import { useState } from 'react';
import type { TreeNode } from '../types';

function Node({
  node, openPath, onSelect,
}: { node: TreeNode; openPath: string | null; onSelect: (p: string) => void }) {
  const [open, setOpen] = useState(true);
  if (!node.is_dir) {
    return (
      <li>
        <button
          className={node.path === openPath ? 'file selected' : 'file'}
          onClick={() => onSelect(node.path)}
        >
          {node.name}
        </button>
      </li>
    );
  }
  return (
    <li>
      <button className="dir" onClick={() => setOpen((o) => !o)}>
        {open ? '▾' : '▸'} {node.name}
      </button>
      {open && (
        <ul>
          {node.children.map((c) => (
            <Node key={c.path} node={c} openPath={openPath} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FolderTree({
  tree, openPath, onSelect,
}: { tree: TreeNode | null; openPath: string | null; onSelect: (path: string) => void }) {
  if (!tree) return <div className="folder-tree empty">No folder imported</div>;
  return (
    <nav className="folder-tree">
      <ul>
        {tree.children.map((c) => (
          <Node key={c.path} node={c} openPath={openPath} onSelect={onSelect} />
        ))}
      </ul>
    </nav>
  );
}
