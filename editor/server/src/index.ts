import express from 'express';
import cors from 'cors';
import { PORT, BLOG_REPO, CONTENT_DIR, validateEnv } from './config.js';
import treeRouter from './routes/tree.js';
import fileRouter from './routes/file.js';
import uploadRouter from './routes/upload.js';
import publishRouter from './routes/publish.js';
import mediaRouter from './routes/media.js';
import blogAssetRouter from './routes/blog-asset.js';

const check = validateEnv();
if (!check.ok) {
  console.error('\n\x1b[31m[editor] Refusing to start:\x1b[0m', check.error, '\n');
  process.exit(1);
}

console.log(`[editor] BLOG_REPO    = ${BLOG_REPO}`);
console.log(`[editor] CONTENT_DIR  = ${CONTENT_DIR}`);

const app = express();
app.use(cors());
app.use(express.json({ limit: '4mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, blogRepo: BLOG_REPO, contentDir: CONTENT_DIR });
});

app.use('/api/tree', treeRouter);
app.use('/api/file', fileRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/publish', publishRouter);
app.use('/media', mediaRouter);
app.use('/blog-asset', blogAssetRouter);

app.listen(PORT, () => {
  console.log(`[editor] listening on http://localhost:${PORT}`);
});
