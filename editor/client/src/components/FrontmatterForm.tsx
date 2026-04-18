import { useState } from 'react';
import type { Frontmatter } from '../lib/frontmatter';
import { Upload, X } from 'lucide-react';
import { api } from '../lib/api';

type Props = {
  value: Frontmatter;
  onChange: (v: Frontmatter) => void;
  folder: string; // folder where post lives (for image uploads)
};

const inputCls =
  'w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm focus:outline-none focus:border-yellow-500';

function toDateInputValue(v: unknown): string {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'string') return v.slice(0, 10);
  return String(v).slice(0, 10);
}

export function FrontmatterForm({ value, onChange, folder }: Props) {
  const set = <K extends keyof Frontmatter>(k: K, v: Frontmatter[K]) =>
    onChange({ ...value, [k]: v });
  const [newTag, setNewTag] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [uploading, setUploading] = useState(false);

  const addTag = () => {
    const t = newTag.trim();
    if (!t) return;
    const cur = value.tags ?? [];
    if (!cur.includes(t)) set('tags', [...cur, t]);
    setNewTag('');
  };
  const addAuthor = () => {
    const t = newAuthor.trim();
    if (!t) return;
    const cur = value.authors ?? [];
    if (!cur.includes(t)) set('authors', [...cur, t]);
    setNewAuthor('');
  };

  const handleImageUpload = async (file: File) => {
    if (!folder) return alert('Selecione uma pasta primeiro.');
    setUploading(true);
    try {
      const r = await api.upload(folder, file);
      // store as relative filename (co-located convention)
      set('image', `./${r.filename}`);
    } catch (e: any) {
      alert(`Upload falhou: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-b border-neutral-800 bg-neutral-950 p-3 space-y-2 text-xs">
      <div className="grid grid-cols-[100px_1fr] items-center gap-2">
        <label className="text-neutral-400">Título</label>
        <input
          className={inputCls}
          value={value.title ?? ''}
          onChange={(e) => set('title', e.target.value)}
          placeholder="título da carta/notinha"
        />

        <label className="text-neutral-400">Descrição</label>
        <textarea
          className={inputCls + ' resize-y min-h-[52px]'}
          value={value.description ?? ''}
          onChange={(e) => set('description', e.target.value)}
          rows={2}
        />

        <label className="text-neutral-400">Data</label>
        <input
          type="date"
          className={inputCls}
          value={toDateInputValue(value.date)}
          onChange={(e) => set('date', e.target.value)}
        />

        <label className="text-neutral-400">Tags</label>
        <div className="flex flex-wrap gap-1 items-center">
          {(value.tags ?? []).map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 bg-neutral-800 rounded px-1.5 py-0.5"
            >
              {t}
              <button
                onClick={() =>
                  set('tags', (value.tags ?? []).filter((x) => x !== t))
                }
                className="text-neutral-500 hover:text-red-400"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            className={inputCls + ' w-28'}
            placeholder="nova tag"
          />
        </div>

        <label className="text-neutral-400">Autores</label>
        <div className="flex flex-wrap gap-1 items-center">
          {(value.authors ?? []).map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 bg-neutral-800 rounded px-1.5 py-0.5"
            >
              {t}
              <button
                onClick={() =>
                  set('authors', (value.authors ?? []).filter((x) => x !== t))
                }
                className="text-neutral-500 hover:text-red-400"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addAuthor();
              }
            }}
            className={inputCls + ' w-28'}
            placeholder="novo autor"
          />
        </div>

        <label className="text-neutral-400">Imagem</label>
        <div className="flex items-center gap-2">
          <input
            className={inputCls}
            value={value.image ?? ''}
            onChange={(e) => set('image', e.target.value)}
            placeholder="./image.png"
          />
          <label className="flex items-center gap-1 bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded cursor-pointer">
            <Upload size={12} />
            {uploading ? '...' : 'Upload'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImageUpload(f);
                e.target.value = '';
              }}
            />
          </label>
        </div>

        <label className="text-neutral-400">Alt da imagem</label>
        <input
          className={inputCls}
          value={value.imageAlt ?? ''}
          onChange={(e) => set('imageAlt', e.target.value)}
        />

        <label className="text-neutral-400">Ordem</label>
        <input
          type="number"
          className={inputCls}
          value={value.order ?? ''}
          onChange={(e) =>
            set('order', e.target.value === '' ? undefined : Number(e.target.value))
          }
        />

        <label className="text-neutral-400">Draft</label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!value.draft}
            onChange={(e) => set('draft', e.target.checked)}
          />
          <span className="text-neutral-500">não publicar (draft)</span>
        </label>
      </div>
    </div>
  );
}
