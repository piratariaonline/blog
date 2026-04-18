import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Load editor/.env.local then editor/.env
const here = path.dirname(fileURLToPath(import.meta.url));
const editorRoot = path.resolve(here, '..', '..');
dotenv.config({ path: path.join(editorRoot, '.env.local') });
dotenv.config({ path: path.join(editorRoot, '.env') });

const defaultRepo = path.resolve(editorRoot, '..');

export const BLOG_REPO = path.resolve(process.env.BLOG_REPO || defaultRepo);
export const CONTENT_DIR = path.join(BLOG_REPO, 'src', 'content');
export const PORT = Number(process.env.PORT || 4455);

export type ValidationResult = { ok: true } | { ok: false; error: string };

export function validateEnv(): ValidationResult {
  if (!process.env.BLOG_REPO) {
    // not fatal, just informational — we fall back to default
  }
  if (!fs.existsSync(BLOG_REPO)) {
    return {
      ok: false,
      error: `BLOG_REPO does not exist: ${BLOG_REPO}. Set it in editor/.env.local or as an environment variable.`,
    };
  }
  if (!fs.statSync(BLOG_REPO).isDirectory()) {
    return { ok: false, error: `BLOG_REPO is not a directory: ${BLOG_REPO}` };
  }
  if (!fs.existsSync(CONTENT_DIR) || !fs.statSync(CONTENT_DIR).isDirectory()) {
    return {
      ok: false,
      error: `Could not find src/content inside blog repo: ${CONTENT_DIR}`,
    };
  }
  return { ok: true };
}

/**
 * Resolve a user-supplied relative path against CONTENT_DIR, ensuring it does
 * not escape. Accepts forward-slash or OS-native separators.
 */
export function safePath(relative: string): string {
  const normalized = String(relative || '').replace(/^[/\\]+/, '');
  const abs = path.resolve(CONTENT_DIR, normalized);
  const rel = path.relative(CONTENT_DIR, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Path escapes content directory: ${relative}`);
  }
  return abs;
}
