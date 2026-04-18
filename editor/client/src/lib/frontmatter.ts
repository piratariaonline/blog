import yaml from 'js-yaml';

export type Frontmatter = {
  title?: string;
  description?: string;
  date?: string; // ISO or YYYY-MM-DD
  tags?: string[];
  authors?: string[];
  image?: string;
  imageAlt?: string;
  order?: number;
  draft?: boolean;
  [key: string]: unknown;
};

const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function parseMdx(source: string): { frontmatter: Frontmatter; body: string } {
  const m = source.match(FM_RE);
  if (!m) return { frontmatter: {}, body: source };
  const raw = m[1];
  let fm: Frontmatter = {};
  try {
    // Use JSON_SCHEMA so YAML timestamps (`date: 2024-05-15`) stay as plain strings
    // instead of being coerced into JS Date objects.
    fm = (yaml.load(raw, { schema: yaml.JSON_SCHEMA }) as Frontmatter) || {};
  } catch (err) {
    // swallow — user will see raw text in diff-source mode
    fm = {};
  }
  // Defensive: coerce Date instances (or other non-string date values) to YYYY-MM-DD
  const d: unknown = fm.date;
  if (d instanceof Date) {
    fm.date = d.toISOString().slice(0, 10);
  } else if (d != null && typeof d !== 'string') {
    fm.date = String(d);
  }
  const body = source.slice(m[0].length);
  return { frontmatter: fm, body };
}

export function stringifyMdx(frontmatter: Frontmatter, body: string): string {
  const cleaned: Frontmatter = {};
  for (const [k, v] of Object.entries(frontmatter)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    cleaned[k] = v;
  }
  const dumped = yaml
    .dump(cleaned, { lineWidth: 120, noRefs: true, sortKeys: false })
    .trimEnd();
  if (!dumped) return body.startsWith('\n') ? body.slice(1) : body;
  return `---\n${dumped}\n---\n\n${body.replace(/^\n+/, '')}`;
}

export function defaultCartaFrontmatter(title: string): Frontmatter {
  return {
    title,
    description: '',
    date: new Date().toISOString().slice(0, 10),
    tags: [],
    authors: ['alein'],
    draft: true,
  };
}

export function defaultNotinhaFrontmatter(title: string): Frontmatter {
  return {
    title,
    description: '',
    date: new Date().toISOString().slice(0, 10),
    tags: [],
    authors: ['alein'],
    order: 1,
    draft: true,
  };
}

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
