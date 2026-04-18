import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { safePath } from '../config.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
});
const router = Router();

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
}

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file is required' });
    const folderRel = String(req.body.folder || '');
    const filename = sanitizeFilename(req.file.originalname || 'upload');
    const rel = folderRel ? `${folderRel}/${filename}` : filename;
    const abs = safePath(rel);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, req.file.buffer);
    res.json({ ok: true, path: rel, filename });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
