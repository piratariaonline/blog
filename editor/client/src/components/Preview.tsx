import { useEffect, useMemo, useRef, useState } from 'react';
import * as runtime from 'react/jsx-runtime';
import { evaluate } from '@mdx-js/mdx';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement, type ComponentType } from 'react';
import type { Frontmatter } from '../lib/frontmatter';

type Props = {
  body: string;
  frontmatter: Frontmatter;
  folder: string;
};

// Minimal stubs for Astro components used in posts.
function Callout({ type = 'note', title, children }: any) {
  const colors: Record<string, string> = {
    note: '#3b82f6',
    tip: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    important: '#8b5cf6',
  };
  const color = colors[type] ?? colors.note;
  return createElement(
    'aside',
    {
      className: 'not-prose callout',
      style: {
        borderLeft: `4px solid ${color}`,
        padding: '0.75rem 1rem',
        margin: '1.5rem 0',
        background: `color-mix(in oklch, ${color} 12%, transparent)`,
        borderRadius: '6px',
      },
    },
    title ? createElement('div', { style: { fontWeight: 600, marginBottom: 4 } }, title) : null,
    createElement('div', null, children),
  );
}

function resolveSrc(src: string, folder: string): string {
  if (!src) return src;
  if (/^(https?:)?\/\//.test(src)) return src;
  if (src.startsWith('./')) return `/media/${folder}/${src.slice(2)}`;
  if (src.startsWith('/')) return `/media${src}`;
  return `/media/${folder}/${src}`;
}

export function Preview({ body, frontmatter, folder }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [html, setHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Debounced MDX → static HTML compile.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const mod = await evaluate(body, { ...(runtime as any), development: false });
        const Content = mod.default as ComponentType<any>;
        const components: Record<string, any> = {
          Callout,
          img: (props: any) =>
            createElement('img', {
              ...props,
              src: resolveSrc(props.src || '', folder),
              style: { maxWidth: '100%', height: 'auto', ...(props.style || {}) },
            }),
          a: (props: any) => createElement('a', { ...props, target: '_blank', rel: 'noreferrer' }),
        };
        const rendered = renderToStaticMarkup(createElement(Content, { components }));
        if (!cancelled) {
          setHtml(rendered);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || String(e));
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [body, folder]);

  const heroImage = frontmatter.image ? resolveSrc(String(frontmatter.image), folder) : null;
  const title = (frontmatter.title as string) || '';
  const description = (frontmatter.description as string) || '';
  const date = (frontmatter.date as string) || '';
  const imageAlt = (frontmatter.imageAlt as string) || '';

  const srcDoc = useMemo(() => {
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<!doctype html>
<html lang="pt-BR" data-theme="dark">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="stylesheet" href="/blog-asset/styles/global.css" />
<link rel="stylesheet" href="/blog-asset/styles/typography.css" />
<style>
  @font-face {
    font-family: 'Geist';
    src: url('/blog-asset/fonts/GeistVF.woff2') format('woff2-variations');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Geist Mono';
    src: url('/blog-asset/fonts/GeistMonoVF.woff2') format('woff2-variations');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }
  html, body {
    margin: 0;
    padding: 0;
    background: var(--background, #1a1a1a);
    color: var(--foreground, #e5e5e5);
    font-family: Geist, ui-sans-serif, system-ui, sans-serif;
  }
  .post-wrap {
    max-width: 768px;
    margin: 0 auto;
    padding: 2rem 1.25rem 5rem;
  }
  .post-meta {
    font-size: 0.8rem;
    opacity: 0.6;
    margin-bottom: 0.5rem;
  }
  .post-title {
    font-size: 2.25rem;
    line-height: 1.1;
    font-weight: 600;
    margin: 0 0 0.75rem;
  }
  .post-desc {
    font-style: italic;
    opacity: 0.75;
    margin: 0 0 1.5rem;
  }
  .hero {
    width: 100%;
    border-radius: 8px;
    margin-bottom: 2rem;
  }
  .err {
    color: #f87171;
    white-space: pre-wrap;
    font-family: 'Geist Mono', ui-monospace, monospace;
    font-size: 12px;
    padding: 1rem;
    border: 1px solid #7f1d1d;
    border-radius: 6px;
    background: rgba(127, 29, 29, 0.15);
  }
  /* Preview-only: render links as white (with underline) instead of blue. */
  .post-wrap a,
  .post-wrap .prose a {
    color: #fafafa !important;
    text-decoration: underline;
    text-decoration-color: rgba(250, 250, 250, 0.4);
    text-underline-offset: 2px;
  }
  .post-wrap a:hover,
  .post-wrap .prose a:hover {
    text-decoration-color: #f5c518;
    color: #ffffff !important;
  }
</style>
</head>
<body>
  <article class="post-wrap">
    ${date ? `<div class="post-meta">${esc(date)}</div>` : ''}
    ${title ? `<h1 class="post-title">${esc(title)}</h1>` : ''}
    ${description ? `<p class="post-desc">${esc(description)}</p>` : ''}
    ${heroImage ? `<img class="hero" src="${esc(heroImage)}" alt="${esc(imageAlt)}" />` : ''}
    <div class="prose">
      ${error ? `<pre class="err">${esc(error)}</pre>` : html}
    </div>
  </article>
</body>
</html>`;
  }, [html, error, title, description, date, heroImage, imageAlt]);

  // To preserve scroll position between recompiles, write the full document
  // only on first load; afterward just swap the <article> innerHTML.
  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    const doc = frame.contentDocument;
    if (!doc) return;
    const article = doc.querySelector('article.post-wrap');
    if (article) {
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(srcDoc, 'text/html');
      const newArticle = newDoc.querySelector('article.post-wrap');
      if (newArticle) {
        article.innerHTML = newArticle.innerHTML;
        return;
      }
    }
    doc.open();
    doc.write(srcDoc);
    doc.close();
  }, [srcDoc]);

  return <iframe ref={iframeRef} title="preview" className="preview-frame" />;
}
