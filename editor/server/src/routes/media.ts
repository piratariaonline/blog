import { Router } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { CONTENT_DIR } from '../config.js';

const router = Router();

// GET /media/<relative path inside CONTENT_DIR>
router.get(/^\/(.*)$/, (req, res) => {
  const rel = (req.params as any)[0] as string;
  const abs = path.resolve(CONTENT_DIR, rel);
  if (!abs.startsWith(CONTENT_DIR)) return res.status(403).end();
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return res.status(404).end();
  res.sendFile(abs);
});

export default router;
