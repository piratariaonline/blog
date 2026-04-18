import { Router } from 'express';
import simpleGit from 'simple-git';
import { BLOG_REPO } from '../config.js';

const router = Router();

type LogEntry = { step: string; message: string; ok: boolean };

// POST /api/publish { message }
// Runs, inside BLOG_REPO:
//   git checkout main
//   git add src/content
//   git commit -m "<message>"
//   git push origin main
router.post('/', async (req, res) => {
  const message = String(req.body?.message || 'chore(content): update').trim();
  const git = simpleGit(BLOG_REPO);
  const logs: LogEntry[] = [];
  const log = (step: string, msg: string, ok = true) => logs.push({ step, message: msg, ok });

  try {
    log('start', `Publishing from ${BLOG_REPO}`);

    // 1. checkout main — safety first
    const before = (await git.branch()).current;
    log('checkout', `Current branch: ${before}. Switching to main...`);
    await git.checkout('main');

    // 2. stage only src/content
    log('add', 'Staging src/content...');
    await git.add(['src/content']);

    const status = await git.status();
    if (status.staged.length === 0) {
      log('noop', 'No staged changes in src/content. Nothing to publish.', false);
      return res.json({ ok: false, logs, error: 'No changes in src/content to commit.' });
    }
    log('add', `Staged ${status.staged.length} file(s): ${status.staged.join(', ')}`);

    // 3. commit
    log('commit', `Committing with message: "${message}"`);
    const commit = await git.commit(message);
    if (!commit.commit) {
      log('commit', 'Commit produced no hash — aborting.', false);
      return res.json({ ok: false, logs, error: 'Commit failed (no hash).' });
    }
    log('commit', `Committed ${commit.commit} on ${commit.branch ?? 'main'}`);

    // 4. push
    log('push', 'Pushing to origin/main...');
    const push = await git.push('origin', 'main');
    const pushSummary = push.pushed?.length
      ? push.pushed.map((p) => `${p.local} -> ${p.remote}`).join(', ')
      : 'push completed';
    log('push', pushSummary);

    log('done', 'Publish successful.');
    return res.json({ ok: true, logs, commit: commit.commit });
  } catch (err: any) {
    const msg = err?.message || String(err);
    log('error', msg, false);
    return res.status(500).json({ ok: false, logs, error: msg });
  }
});

export default router;
