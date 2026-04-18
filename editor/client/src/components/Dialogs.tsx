import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { slugify } from '../lib/frontmatter';

const inputCls =
  'w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-sm focus:outline-none focus:border-yellow-500';
const btn =
  'px-3 py-1.5 rounded text-sm bg-yellow-500 text-black font-medium hover:bg-yellow-400 disabled:opacity-50';
const btnGhost =
  'px-3 py-1.5 rounded text-sm border border-neutral-700 hover:bg-neutral-800';

export function NewCartaDialog({
  open,
  onClose,
  parent,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  parent: string;
  onCreate: (title: string, slug: string) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setTitle('');
      setSlug('');
    }
  }, [open]);
  return (
    <Modal open={open} onClose={onClose} title="Nova carta">
      <div className="space-y-3 min-w-[420px]">
        <p className="text-xs text-neutral-500">
          Pasta-mãe: <code>{parent || 'src/content'}</code>
        </p>
        <label className="block text-xs text-neutral-400">Título</label>
        <input
          className={inputCls}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSlug(slugify(e.target.value));
          }}
          autoFocus
        />
        <label className="block text-xs text-neutral-400">Slug (nome da pasta)</label>
        <input className={inputCls} value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
        <p className="text-xs text-neutral-500">
          Cria: <code>{parent ? `${parent}/` : ''}{slug || '<slug>'}/index.mdx</code>
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <button className={btnGhost} onClick={onClose}>Cancelar</button>
          <button
            className={btn}
            disabled={!title || !slug || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onCreate(title, slug);
                onClose();
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Criando...' : 'Criar carta'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function NewNotinhaDialog({
  open,
  onClose,
  parent,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  parent: string;
  onCreate: (title: string, slug: string) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setTitle('');
      setSlug('');
    }
  }, [open]);
  const canSubmit = !!parent && !!title && !!slug;
  return (
    <Modal open={open} onClose={onClose} title="Nova notinha">
      <div className="space-y-3 min-w-[420px]">
        {parent ? (
          <p className="text-xs text-neutral-500">
            Dentro de: <code>{parent}</code>
          </p>
        ) : (
          <p className="text-xs text-red-400">
            Selecione primeiro a pasta de uma carta existente.
          </p>
        )}
        <label className="block text-xs text-neutral-400">Título</label>
        <input
          className={inputCls}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSlug(slugify(e.target.value));
          }}
          autoFocus
        />
        <label className="block text-xs text-neutral-400">Slug (nome do arquivo)</label>
        <input className={inputCls} value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
        <p className="text-xs text-neutral-500">
          Cria: <code>{parent}/{slug || '<slug>'}.mdx</code>
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <button className={btnGhost} onClick={onClose}>Cancelar</button>
          <button
            className={btn}
            disabled={!canSubmit || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onCreate(title, slug);
                onClose();
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Criando...' : 'Criar notinha'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function NewFolderDialog({
  open,
  onClose,
  parent,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  parent: string;
  onCreate: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) setName('');
  }, [open]);
  return (
    <Modal open={open} onClose={onClose} title="Nova pasta">
      <div className="space-y-3 min-w-[360px]">
        <p className="text-xs text-neutral-500">
          Dentro de: <code>{parent || 'src/content'}</code>
        </p>
        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(slugify(e.target.value))}
          placeholder="nome-da-pasta"
          autoFocus
        />
        <div className="flex justify-end gap-2 pt-2">
          <button className={btnGhost} onClick={onClose}>Cancelar</button>
          <button
            className={btn}
            disabled={!name || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onCreate(name);
                onClose();
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Criando...' : 'Criar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function UploadDialog({
  open,
  onClose,
  folder,
  onUpload,
}: {
  open: boolean;
  onClose: () => void;
  folder: string;
  onUpload: (file: File) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) setFile(null);
  }, [open]);
  return (
    <Modal open={open} onClose={onClose} title="Adicionar arquivo">
      <div className="space-y-3 min-w-[380px]">
        <p className="text-xs text-neutral-500">
          Pasta destino: <code>{folder || 'src/content'}</code>
        </p>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <div className="flex justify-end gap-2 pt-2">
          <button className={btnGhost} onClick={onClose}>Cancelar</button>
          <button
            className={btn}
            disabled={!file || busy}
            onClick={async () => {
              if (!file) return;
              setBusy(true);
              try {
                await onUpload(file);
                onClose();
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
