import { useState } from 'react';
import { Modal } from './Modal';
import { api } from '../lib/api';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type LogEntry = { step: string; message: string; ok: boolean };

export function PublishDialog({
  open,
  onClose,
  defaultMessage,
}: {
  open: boolean;
  onClose: () => void;
  defaultMessage: string;
}) {
  const [message, setMessage] = useState(defaultMessage);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [result, setResult] = useState<null | { ok: boolean; error?: string; commit?: string }>(null);

  const run = async () => {
    setRunning(true);
    setLogs([]);
    setResult(null);
    try {
      const r = await api.publish(message || 'chore(content): update');
      setLogs(r.logs || []);
      setResult({ ok: r.ok, error: r.error, commit: r.commit });
    } catch (e: any) {
      setResult({ ok: false, error: e.message });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Modal open={open} onClose={running ? () => {} : onClose} title="Publicar">
      <div className="space-y-3 min-w-[560px] max-w-[680px]">
        <div className="text-xs text-neutral-400 space-y-1">
          <p>O processo de publicação vai executar, dentro do repositório do blog:</p>
          <ol className="list-decimal list-inside pl-2 space-y-0.5 font-mono text-[11px]">
            <li>git checkout main</li>
            <li>git add src/content</li>
            <li>git commit -m "…"</li>
            <li>git push origin main</li>
          </ol>
        </div>

        <label className="block text-xs text-neutral-400">Mensagem do commit</label>
        <input
          className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:border-yellow-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={running}
        />

        <div className="border border-neutral-800 rounded bg-black/50 p-2 font-mono text-[11px] min-h-[180px] max-h-[280px] overflow-auto">
          {logs.length === 0 && !running && (
            <p className="text-neutral-600">Pronto para publicar.</p>
          )}
          {running && logs.length === 0 && <p className="text-neutral-500">Executando...</p>}
          {logs.map((l, i) => (
            <div key={i} className={l.ok ? 'text-neutral-300' : 'text-red-400'}>
              <span className="text-neutral-500">[{l.step}]</span> {l.message}
            </div>
          ))}
          {result && (
            <div
              className={`mt-2 flex items-center gap-2 ${
                result.ok ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {result.ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              {result.ok
                ? `Publicado. commit ${result.commit}`
                : `Falhou: ${result.error ?? 'erro desconhecido'}`}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            className="px-3 py-1.5 rounded text-sm border border-neutral-700 hover:bg-neutral-800 disabled:opacity-50"
            onClick={onClose}
            disabled={running}
          >
            Fechar
          </button>
          <button
            className="px-3 py-1.5 rounded text-sm bg-yellow-500 text-black font-medium hover:bg-yellow-400 disabled:opacity-50 inline-flex items-center gap-2"
            onClick={run}
            disabled={running}
          >
            {running && <Loader2 size={14} className="animate-spin" />}
            {running ? 'Publicando...' : 'Publicar agora'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
