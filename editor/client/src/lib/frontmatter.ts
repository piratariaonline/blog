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
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(frontmatter)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    cleaned[k] = v;
  }

  // Coerce a YYYY-MM-DD string into a real Date so js-yaml emits it as an
  // unquoted YAML timestamp (`date: 2026-04-18`) — matching the hand-authored
  // posts and Astro's `z.coerce.date()` happy path.
  if (typeof cleaned.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(cleaned.date)) {
    // Use UTC midnight to avoid timezone shifts changing the day.
    cleaned.date = new Date(`${cleaned.date}T00:00:00Z`);
  }

  // Goals (match the hand-authored frontmatter style):
  //   * lineWidth: -1   → never fold long strings into `>-` blocks.
  //   * flowLevel: 1    → arrays at depth 1 use inline `[a, b, c]` form.
  //   * quotingType `'` → prefer single quotes when quoting is needed.
  //   * styles `!!timestamp: canonical` → emit Date as `YYYY-MM-DD` only
  //     (no time component).
  let dumped = yaml
    .dump(cleaned, {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
      flowLevel: 1,
      quotingType: "'",
      forceQuotes: false,
      styles: { '!!timestamp': 'canonical' },
    })
    .trimEnd();

  // js-yaml's canonical timestamp still appends `T00:00:00.000Z`. Strip the
  // time portion when it's exactly midnight UTC so we get a clean date.
  dumped = dumped.replace(
    /^(\s*date:\s*)(\d{4}-\d{2}-\d{2})T00:00:00(?:\.000)?Z\s*$/m,
    '$1$2',
  );

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
