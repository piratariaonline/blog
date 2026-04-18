import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { safePath } from '../config.js';

const router = Router();

// GET /api/file?path=blog/foo/index.mdx
router.get('/', async (req, res) => {
  try {
    const rel = String(req.query.path || '');
    const abs = safePath(rel);
    const content = await fs.readFile(abs, 'utf8');
    res.json({ path: rel, content });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/file { path, content }
router.put('/', async (req, res) => {
  try {
    const { path: rel, content } = req.body as { path: string; content: string };
    if (typeof rel !== 'string' || typeof content !== 'string') {
      return res.status(400).json({ error: 'path and content are required strings' });
    }
    const abs = safePath(rel);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, content, 'utf8');
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/file/folder { path }
router.post('/folder', async (req, res) => {
  try {
    const rel = String(req.body?.path || '');
    if (!rel) return res.status(400).json({ error: 'path is required' });
    const abs = safePath(rel);
    await fs.mkdir(abs, { recursive: true });
    res.json({ ok: true, path: rel });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/file/carta { parent, slug, content }
// Creates <parent>/<slug>/index.mdx
router.post('/carta', async (req, res) => {
  try {
    const { parent, slug, content } = req.body as {
      parent: string;
      slug: string;
      content: string;
    };
    if (!slug) return res.status(400).json({ error: 'slug is required' });
    const folderRel = parent ? `${parent}/${slug}` : slug;
    const fileRel = `${folderRel}/index.mdx`;
    const abs = safePath(fileRel);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    try {
      await fs.access(abs);
      return res.status(409).json({ error: `Already exists: ${fileRel}` });
    } catch {
      /* not exists, good */
    }
    await fs.writeFile(abs, content ?? '', 'utf8');
    res.json({ ok: true, path: fileRel });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/file/notinha { parent, slug, content }
// Creates <parent>/<slug>.mdx  (parent must already exist)
router.post('/notinha', async (req, res) => {
  try {
    const { parent, slug, content } = req.body as {
      parent: string;
      slug: string;
      content: string;
    };
    if (!parent || !slug) return res.status(400).json({ error: 'parent and slug are required' });
    const fileRel = `${parent}/${slug}.mdx`;
    const abs = safePath(fileRel);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    try {
      await fs.access(abs);
      return res.status(409).json({ error: `Already exists: ${fileRel}` });
    } catch {
      /* not exists, good */
    }
    await fs.writeFile(abs, content ?? '', 'utf8');
    res.json({ ok: true, path: fileRel });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
