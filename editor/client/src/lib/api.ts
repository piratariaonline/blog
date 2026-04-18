export type TreeNode =
  | { type: 'dir'; name: string; path: string; children: TreeNode[] }
  | { type: 'file'; name: string; path: string; ext: string };

async function json<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || `HTTP ${res.status}`);
  return data as T;
}

export const api = {
  health: () => fetch('/api/health').then((r) => json<{ ok: boolean; blogRepo: string }>(r)),
  tree: () => fetch('/api/tree').then((r) => json<TreeNode[]>(r)),
  getFile: (path: string) =>
    fetch(`/api/file?path=${encodeURIComponent(path)}`).then((r) =>
      json<{ path: string; content: string }>(r),
    ),
  putFile: (path: string, content: string) =>
    fetch('/api/file', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content }),
    }).then((r) => json<{ ok: true }>(r)),
  createFolder: (path: string) =>
    fetch('/api/file/folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    }).then((r) => json<{ ok: true; path: string }>(r)),
  createCarta: (parent: string, slug: string, content: string) =>
    fetch('/api/file/carta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parent, slug, content }),
    }).then((r) => json<{ ok: true; path: string }>(r)),
  createNotinha: (parent: string, slug: string, content: string) =>
    fetch('/api/file/notinha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parent, slug, content }),
    }).then((r) => json<{ ok: true; path: string }>(r)),
  upload: async (folder: string, file: File) => {
    const fd = new FormData();
    fd.append('folder', folder);
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    return json<{ ok: true; path: string; filename: string }>(res);
  },
  publish: (message: string) =>
    fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    }).then(async (r) => {
      const data = await r.json();
      return data as {
        ok: boolean;
        logs: { step: string; message: string; ok: boolean }[];
        error?: string;
        commit?: string;
      };
    }),
};
