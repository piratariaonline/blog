import { useEffect, useRef } from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  DiffSourceToggleWrapper,
  InsertCodeBlock,
  type MDXEditorMethods,
} from '@mdxeditor/editor';
import { api } from '../lib/api';

type Props = {
  markdown: string;
  onChange: (md: string) => void;
  folder: string;
};

export function MdxBodyEditor({ markdown, onChange, folder }: Props) {
  const ref = useRef<MDXEditorMethods>(null);

  // When the file changes externally, reset editor content
  useEffect(() => {
    ref.current?.setMarkdown(markdown);
  }, [markdown /* intentional: runs only when prop changes */]);

  const imageUploadHandler = async (image: File): Promise<string> => {
    if (!folder) throw new Error('Selecione uma pasta antes de inserir imagens.');
    const r = await api.upload(folder, image);
    return `./${r.filename}`;
  };

  return (
    <div className="mdx-body-editor-host">
      <MDXEditor
        ref={ref}
        className="dark-theme dark-editor"
        markdown={markdown}
        onChange={onChange}
        contentEditableClassName="prose prose-invert max-w-none px-6 py-4"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({ imageUploadHandler }),
          tablePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'ts' }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              ts: 'TypeScript',
              js: 'JavaScript',
              tsx: 'TSX',
              jsx: 'JSX',
              css: 'CSS',
              html: 'HTML',
              bash: 'Bash',
              json: 'JSON',
              md: 'Markdown',
              mdx: 'MDX',
              python: 'Python',
              '': 'sem destaque',
            },
          }),
          diffSourcePlugin({ viewMode: 'rich-text' }),
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                <BlockTypeSelect />
                <CreateLink />
                <InsertImage />
                <InsertTable />
                <InsertThematicBreak />
                <ListsToggle />
                <InsertCodeBlock />
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      />
    </div>
  );
}
