import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { CONTENT_DIR } from '../config.js';

const router = Router();

export type TreeNode =
  | { type: 'dir'; name: string; path: string; children: TreeNode[] }
  | { type: 'file'; name: string; path: string; ext: string };

async function readTree(dir: string, rel = ''): Promise<TreeNode[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  entries.sort((a, b) => {
    // directories first, then files, alphabetical
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  const out: TreeNode[] = [];
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const childRel = rel ? `${rel}/${e.name}` : e.name;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push({
        type: 'dir',
        name: e.name,
        path: childRel,
        children: await readTree(abs, childRel),
      });
    } else {
      out.push({
        type: 'file',
        name: e.name,
        path: childRel,
        ext: path.extname(e.name).toLowerCase(),
      });
    }
  }
  return out;
}

router.get('/', async (_req, res) => {
  try {
    const tree = await readTree(CONTENT_DIR);
    res.json(tree);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
