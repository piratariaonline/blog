import type { PropsWithChildren } from 'react';
import { X } from 'lucide-react';

export function Modal({
  open,
  onClose,
  title,
  children,
}: PropsWithChildren<{ open: boolean; onClose: () => void; title: string }>) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl min-w-[420px] max-w-[90vw] max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
          <h2 className="font-semibold text-sm">{title}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
