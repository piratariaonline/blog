import { Router } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { BLOG_REPO } from '../config.js';

const router = Router();

// Whitelisted roots inside the blog repo that the preview iframe can fetch.
// Keeps the surface area tiny — no arbitrary repo traversal.
const ROOTS: Record<string, string> = {
  styles: path.join(BLOG_REPO, 'src', 'styles'),
  fonts: path.join(BLOG_REPO, 'public', 'fonts'),
  public: path.join(BLOG_REPO, 'public'),
};

// The blog's global.css starts with `@import 'tailwindcss';`, which the
// browser resolves as a URL relative to the stylesheet. Return empty CSS
// so the preview iframe doesn't log a 404 — tailwind utility classes are
// not needed for the rendered post body (typography.css handles .prose).
router.get('/styles/tailwindcss', (_req, res) => {
  res.type('text/css').send('/* tailwindcss @import stub — preview iframe */');
});

router.get(/^\/(styles|fonts|public)\/(.+)$/, (req, res) => {
  const root = (req.params as any)[0] as keyof typeof ROOTS;
  const rel = (req.params as any)[1] as string;
  const base = ROOTS[root];
  const abs = path.resolve(base, rel);
  if (!abs.startsWith(base)) return res.status(403).end();
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return res.status(404).end();
  res.sendFile(abs);
});

export default router;
