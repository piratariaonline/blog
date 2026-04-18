import { useState } from 'react';
import type { TreeNode } from '../lib/api';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  FileImage,
  File as FileIcon,
} from 'lucide-react';

type Props = {
  nodes: TreeNode[];
  currentPath: string | null;
  selectedDir: string;
  onSelectFile: (path: string) => void;
  onSelectDir: (path: string) => void;
};

function iconFor(ext: string) {
  if (ext === '.mdx' || ext === '.md') return <FileText size={14} className="shrink-0" />;
  if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext))
    return <FileImage size={14} className="shrink-0" />;
  return <FileIcon size={14} className="shrink-0" />;
}

function Node({
  node,
  depth,
  currentPath,
  selectedDir,
  onSelectFile,
  onSelectDir,
}: {
  node: TreeNode;
  depth: number;
} & Omit<Props, 'nodes'>) {
  const [open, setOpen] = useState(depth < 1);
  if (node.type === 'file') {
    const selected = currentPath === node.path;
    return (
      <button
        onClick={() => onSelectFile(node.path)}
        className={`w-full text-left flex items-center gap-1.5 px-2 py-0.5 text-xs hover:bg-neutral-800 ${
          selected ? 'bg-neutral-800 text-yellow-400' : 'text-neutral-300'
        }`}
        style={{ paddingLeft: 8 + depth * 12 }}
        title={node.path}
      >
        {iconFor(node.ext)}
        <span className="truncate">{node.name}</span>
      </button>
    );
  }
  const dirSelected = selectedDir === node.path;
  return (
    <div>
      <div
        className={`w-full flex items-center gap-1 px-2 py-0.5 text-xs cursor-pointer hover:bg-neutral-800 ${
          dirSelected ? 'bg-neutral-800/70 text-yellow-400' : 'text-neutral-200'
        }`}
        style={{ paddingLeft: 4 + depth * 12 }}
        onClick={() => {
          setOpen((o) => !o);
          onSelectDir(node.path);
        }}
        title={node.path}
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {open ? <FolderOpen size={14} className="shrink-0" /> : <Folder size={14} className="shrink-0" />}
        <span className="truncate font-medium">{node.name}</span>
      </div>
      {open &&
        node.children.map((c) => (
          <Node
            key={c.path}
            node={c}
            depth={depth + 1}
            currentPath={currentPath}
            selectedDir={selectedDir}
            onSelectFile={onSelectFile}
            onSelectDir={onSelectDir}
          />
        ))}
    </div>
  );
}

export function FileTree({ nodes, ...rest }: Props) {
  return (
    <div className="text-xs font-mono select-none">
      <div
        className={`px-2 py-1 text-[10px] uppercase tracking-wider ${
          rest.selectedDir === '' ? 'text-yellow-400' : 'text-neutral-500'
        } cursor-pointer hover:bg-neutral-800`}
        onClick={() => rest.onSelectDir('')}
      >
        src/content /
      </div>
      {nodes.map((n) => (
        <Node key={n.path} node={n} depth={0} {...rest} />
      ))}
    </div>
  );
}
