'use client';

import { ReactNode, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

type ResourceModalProps = {
  title: string;
  description?: string;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  footer?: ReactNode;
};

export function ResourceModal({ title, description, children, open, onClose, footer }: ResourceModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 cursor-pointer bg-transparent"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id={titleId} className="text-xl font-semibold text-slate-900">
              {title}
            </h3>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm text-slate-700">{children}</div>

        {footer && <div className="mt-6 flex items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
