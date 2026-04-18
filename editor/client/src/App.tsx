import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { PanelGroup, Panel, PanelResizeHandle, type ImperativePanelHandle } from 'react-resizable-panels';
import { api, type TreeNode } from './lib/api';
import {
  parseMdx,
  stringifyMdx,
  defaultCartaFrontmatter,
  defaultNotinhaFrontmatter,
  type Frontmatter,
} from './lib/frontmatter';
import { FileTree } from './components/FileTree';
import { FrontmatterForm } from './components/FrontmatterForm';
import { MdxBodyEditor } from './components/MdxBodyEditor';
import { Preview } from './components/Preview';
import {
  NewCartaDialog,
  NewNotinhaDialog,
  NewFolderDialog,
  UploadDialog,
} from './components/Dialogs';
import { PublishDialog } from './components/PublishDialog';
import {
  FolderPlus,
  FilePlus2,
  StickyNote,
  Upload,
  Save,
  Rocket,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

type LoadedFile = {
  path: string;
  frontmatter: Frontmatter;
  body: string;
};

const btn =
  'inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-neutral-800 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed';

export default function App() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [selectedDir, setSelectedDir] = useState<string>('');
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<LoadedFile | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [dlgCarta, setDlgCarta] = useState(false);
  const [dlgNotinha, setDlgNotinha] = useState(false);
  const [dlgFolder, setDlgFolder] = useState(false);
  const [dlgUpload, setDlgUpload] = useState(false);
  const [dlgPublish, setDlgPublish] = useState(false);

  // Collapse state for the left file tree and the frontmatter form.
  const treePanelRef = useRef<ImperativePanelHandle | null>(null);
  const [treeCollapsed, setTreeCollapsed] = useState(false);
  const [fmCollapsed, setFmCollapsed] = useState(false);

  const toggleTree = () => {
    const p = treePanelRef.current;
    if (!p) return;
    if (p.isCollapsed()) p.expand();
    else p.collapse();
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const refreshTree = useCallback(async () => {
    try {
      const t = await api.tree();
      setTree(t);
    } catch (e: any) {
      setHealthError(e.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await api.health();
        await refreshTree();
      } catch (e: any) {
        setHealthError(e.message);
      }
    })();
  }, [refreshTree]);

  const openFile = async (p: string) => {
    if (dirty && !confirm('Descartar alterações não salvas?')) return;
    try {
      const r = await api.getFile(p);
      const { frontmatter, body } = parseMdx(r.content);
      setLoaded({ path: p, frontmatter, body });
      setCurrentPath(p);
      setDirty(false);
      // select parent dir
      const dir = p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '';
      setSelectedDir(dir);
    } catch (e: any) {
      showToast(`Erro ao abrir: ${e.message}`);
    }
  };

  const folderOfCurrent = useMemo(() => {
    if (!loaded) return selectedDir;
    return loaded.path.includes('/')
      ? loaded.path.slice(0, loaded.path.lastIndexOf('/'))
      : '';
  }, [loaded, selectedDir]);

  const save = async () => {
    if (!loaded) return;
    setSaving(true);
    try {
      const content = stringifyMdx(loaded.frontmatter, loaded.body);
      await api.putFile(loaded.path, content);
      setDirty(false);
      showToast('Salvo.');
    } catch (e: any) {
      showToast(`Erro ao salvar: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Cmd/Ctrl+S
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (loaded && dirty && !saving) save();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [loaded, dirty, saving]);

  const createCarta = async (title: string, slug: string) => {
    const fm = defaultCartaFrontmatter(title);
    const content = stringifyMdx(fm, '\n');
    const r = await api.createCarta(selectedDir, slug, content);
    await refreshTree();
    await openFile(r.path);
  };

  const createNotinha = async (title: string, slug: string) => {
    const fm = defaultNotinhaFrontmatter(title);
    const content = stringifyMdx(fm, '\n');
    const r = await api.createNotinha(selectedDir, slug, content);
    await refreshTree();
    await openFile(r.path);
  };

  const createFolder = async (name: string) => {
    const p = selectedDir ? `${selectedDir}/${name}` : name;
    await api.createFolder(p);
    await refreshTree();
    setSelectedDir(p);
  };

  const uploadToSelected = async (file: File) => {
    const folder = folderOfCurrent || selectedDir;
    await api.upload(folder, file);
    showToast(`Enviado: ${file.name}`);
    await refreshTree();
  };

  const defaultCommitMsg = useMemo(() => {
    if (loaded) {
      const slug = loaded.path.replace(/\.(mdx|md)$/, '');
      return `post: update ${slug}`;
    }
    return 'chore(content): update';
  }, [loaded]);

  if (healthError) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="max-w-xl border border-red-900 bg-red-950/40 rounded p-6 text-sm">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertCircle size={18} />
            <h1 className="font-semibold">Editor não pode iniciar</h1>
          </div>
          <pre className="whitespace-pre-wrap text-red-300">{healthError}</pre>
          <p className="mt-3 text-neutral-400">
            Verifique se o servidor está rodando (<code>npm run dev</code>) e se a variável{' '}
            <code>BLOG_REPO</code> aponta para a raiz do repositório do blog.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen flex flex-col overflow-hidden">
      {/* top bar */}
      <header className="flex items-center gap-2 px-3 py-2 border-b border-neutral-800 bg-neutral-950">
        <div className="font-semibold text-yellow-400 text-sm">carta na garrafa · editor</div>
        <div className="text-xs text-neutral-500 ml-2 font-mono truncate">
          {currentPath ?? '—'}
          {dirty && <span className="text-yellow-400 ml-1">●</span>}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button className={btn} onClick={refreshTree} title="Atualizar árvore">
            <RefreshCw size={12} /> Atualizar
          </button>
          <button className={btn} onClick={() => setDlgFolder(true)}>
            <FolderPlus size={12} /> Nova pasta
          </button>
          <button className={btn} onClick={() => setDlgCarta(true)}>
            <FilePlus2 size={12} /> Nova carta
          </button>
          <button
            className={btn}
            onClick={() => setDlgNotinha(true)}
            disabled={!selectedDir}
            title={selectedDir ? 'Nova notinha na pasta selecionada' : 'Selecione uma pasta primeiro'}
          >
            <StickyNote size={12} /> Nova notinha
          </button>
          <button
            className={btn}
            onClick={() => setDlgUpload(true)}
            disabled={!folderOfCurrent && !selectedDir}
          >
            <Upload size={12} /> Upload
          </button>

          <div className="mx-1 h-5 w-px bg-neutral-800" />

          <button
            className={btn + ' bg-neutral-800'}
            onClick={save}
            disabled={!loaded || !dirty || saving}
          >
            <Save size={12} /> {saving ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            className={
              'inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-yellow-500 text-black font-semibold hover:bg-yellow-400'
            }
            onClick={() => setDlgPublish(true)}
          >
            <Rocket size={12} /> Publicar
          </button>
        </div>
      </header>

      {/* three-column workspace */}
      <div className="flex-1 min-h-0">
        <PanelGroup direction="horizontal">
          <Panel
            ref={treePanelRef}
            defaultSize={18}
            minSize={12}
            collapsible
            collapsedSize={0}
            onCollapse={() => setTreeCollapsed(true)}
            onExpand={() => setTreeCollapsed(false)}
          >
            <div className="h-full overflow-auto border-r border-neutral-800 bg-neutral-950">
              <FileTree
                nodes={tree}
                currentPath={currentPath}
                selectedDir={selectedDir}
                onSelectFile={openFile}
                onSelectDir={setSelectedDir}
              />
            </div>
          </Panel>
          <PanelResizeHandle className="panel-handle panel-handle-v">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={toggleTree}
              className="panel-handle-btn"
              title={treeCollapsed ? 'Mostrar árvore' : 'Ocultar árvore'}
            >
              {treeCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
          </PanelResizeHandle>
          <Panel defaultSize={50} minSize={25}>
            <div className="h-full flex flex-col bg-neutral-950 overflow-hidden">
              {loaded ? (
                <>
                  {!fmCollapsed && (
                    <div className="flex-none max-h-[45%] overflow-auto">
                      <FrontmatterForm
                        value={loaded.frontmatter}
                        onChange={(fm) => {
                          setLoaded({ ...loaded, frontmatter: fm });
                          setDirty(true);
                        }}
                        folder={folderOfCurrent}
                      />
                    </div>
                  )}
                  {/* horizontal divider with collapse toggle for the frontmatter */}
                  <div className="panel-handle-h">
                    <button
                      type="button"
                      onClick={() => setFmCollapsed((v) => !v)}
                      className="panel-handle-btn"
                      title={fmCollapsed ? 'Mostrar frontmatter' : 'Ocultar frontmatter'}
                    >
                      {fmCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 relative overflow-hidden">
                    <MdxBodyEditor
                      markdown={loaded.body}
                      folder={folderOfCurrent}
                      onChange={(md) => {
                        if (md !== loaded.body) {
                          setLoaded({ ...loaded, body: md });
                          setDirty(true);
                        }
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-neutral-600 text-sm">
                  Selecione um arquivo .mdx na árvore ou crie uma nova carta.
                </div>
              )}
            </div>
          </Panel>
          <PanelResizeHandle className="panel-handle" />
          <Panel defaultSize={32} minSize={20}>
            <div className="h-full border-l border-neutral-800">
              {loaded ? (
                <Preview
                  body={loaded.body}
                  frontmatter={loaded.frontmatter}
                  folder={folderOfCurrent}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-600 text-sm">
                  Preview aparecerá aqui.
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 px-3 py-1.5 text-[11px] text-neutral-500 flex items-center gap-3">
        <span>{tree.length > 0 ? `${countFiles(tree)} arquivo(s)` : 'árvore vazia'}</span>
        <span>
          pasta atual: <code className="text-neutral-300">{selectedDir || 'src/content'}</code>
        </span>
        {toast && <span className="ml-auto text-yellow-400">{toast}</span>}
      </footer>

      <NewCartaDialog
        open={dlgCarta}
        onClose={() => setDlgCarta(false)}
        parent={selectedDir}
        onCreate={createCarta}
      />
      <NewNotinhaDialog
        open={dlgNotinha}
        onClose={() => setDlgNotinha(false)}
        parent={selectedDir}
        onCreate={createNotinha}
      />
      <NewFolderDialog
        open={dlgFolder}
        onClose={() => setDlgFolder(false)}
        parent={selectedDir}
        onCreate={createFolder}
      />
      <UploadDialog
        open={dlgUpload}
        onClose={() => setDlgUpload(false)}
        folder={folderOfCurrent || selectedDir}
        onUpload={uploadToSelected}
      />
      <PublishDialog
        open={dlgPublish}
        onClose={() => setDlgPublish(false)}
        defaultMessage={defaultCommitMsg}
      />
    </div>
  );
}

function countFiles(nodes: TreeNode[]): number {
  let n = 0;
  for (const x of nodes) {
    if (x.type === 'file') n++;
    else n += countFiles(x.children);
  }
  return n;
}
