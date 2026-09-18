import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { XIcon } from 'lucide-react';

interface ConsoleDialogProps {
  open: boolean;
  title: string;
  subtitle?: string;
  /** Submit button label, e.g. "Qualify and create opportunity". */
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  busy?: boolean;
  children: React.ReactNode;
}

/** The frame for a decision an officer has to justify: what is being decided, the fields that
 * record why, and a submit that names the act. Submitting goes through the form, so Enter works
 * and the browser does the validation plumbing. */
export function ConsoleDialog({ open, title, subtitle, confirmLabel, onConfirm, onClose, busy, children }: ConsoleDialogProps) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    // Focus the first field so the officer starts where the reason goes.
    const first = panelRef.current?.querySelector<HTMLElement>('textarea, select, input, button');
    first?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
          className="absolute inset-0 bg-[#0A100D]/55 backdrop-blur-sm"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          onClick={onClose}
          aria-hidden="true" />

          <motion.form
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="console-dialog-title"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm();
          }}
          initial={reduced ? false : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)] sm:rounded-[28px]">

            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
              <div className="min-w-0">
                <h2 id="console-dialog-title" className="font-display text-[20px] font-semibold tracking-[-0.01em] text-gray-900">
                  {title}
                </h2>
                {subtitle && <p className="mt-0.5 truncate text-[13px] text-gray-600">{subtitle}</p>}
              </div>
              <button
              type="button"
              onClick={onClose}
              aria-label="Cancel"
              className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900">

                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200 px-6 py-4">
              <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[44px] items-center rounded-full border border-gray-300 px-5 text-[13.5px] font-medium text-gray-800 hover:border-gray-500">

                Cancel
              </button>
              <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-gray-900 px-5 text-[13.5px] font-semibold text-white hover:bg-black disabled:cursor-progress disabled:bg-gray-800">

                {confirmLabel}
              </button>
            </div>
          </motion.form>
        </div>
      }
    </AnimatePresence>,
    document.body
  );
}

/** A note the officer should read before deciding — amber for "this is on you", grey for context. */
export function DialogNote({ tone = 'gold', title, children }: {tone?: 'gold' | 'neutral';title?: string;children: React.ReactNode;}) {
  return (
    <div className={`rounded-xl p-4 ${tone === 'gold' ? 'bg-amber-50 text-amber-950' : 'bg-gray-50 text-gray-700'}`}>
      {title && <p className="text-[13.5px] font-semibold">{title}</p>}
      <p className={`text-[12.5px] leading-relaxed ${title ? 'mt-1' : ''}`}>{children}</p>
    </div>);

}

export const dialogFieldClass =
'mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-500 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/15 aria-[invalid=true]:border-rose-600';

export const dialogLabelClass = 'block text-[13px] font-medium text-gray-800';
