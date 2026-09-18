import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, BriefcaseIcon, GlobeIcon, LandmarkIcon, XIcon } from 'lucide-react';
import type { IconComponent } from '../../types/icons';
import { audienceDoors, type DoorId } from '../../data/landing';
import { useHashLink } from '../../hooks/useHashLink';

const doorIcons: Record<DoorId, IconComponent> = {
  buyer: GlobeIcon,
  exporter: BriefcaseIcon,
  institution: LandmarkIcon
};

/** "Get started" opens this: the same three doors as the landing page, so the choice of who you
 * are is made once, wherever you press it. */
export function GetStartedDialog({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const reduced = useReducedMotion();
  const resolveHash = useHashLink();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
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
          className="absolute inset-0 bg-[#020605]/70 backdrop-blur-sm"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          onClick={onClose}
          aria-hidden="true" />

          <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="get-started-title"
          initial={reduced ? false : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="auth-backdrop auth-galaxy relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] p-6 text-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/10 sm:rounded-[28px] sm:p-8">

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="auth-eyebrow inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  <span className="auth-live-dot" aria-hidden="true" />
                  Start here
                </p>
                <h2 id="get-started-title" className="mt-4 font-sora text-[26px] font-semibold leading-tight tracking-[-0.02em] sm:text-[32px]">
                  Which door is yours?
                </h2>
              </div>
              <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">

                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <ul className="mt-6 grid gap-3">
              {audienceDoors.map((door) => {
              const Icon = doorIcons[door.id];
              const isHash = door.cta.to.includes('#');
              const content =
              <>
                    <span className="auth-event-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:h-16 sm:w-16">
                      <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-semibold text-white">{door.title}</span>
                      <span className="mt-0.5 block text-[13px] leading-relaxed text-white/65">{door.audience}</span>
                      <span className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white">
                        {door.cta.label}
                        <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </span>
                  </>;

              const className =
              'auth-glass group flex w-full gap-4 rounded-2xl p-4 text-left transition-colors duration-150 hover:bg-white/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

              return (
                <li key={door.id}>
                    {isHash ?
                  <a
                    href={door.cta.to}
                    onClick={(event) => {
                      resolveHash(door.cta.to.replace('/', ''))(event);
                      onClose();
                    }}
                    className={className}>

                        {content}
                      </a> :

                  <Link to={door.cta.to} onClick={onClose} className={className}>
                        {content}
                      </Link>
                  }
                  </li>);

            })}
            </ul>

            <p className="mt-5 text-[12.5px] leading-relaxed text-white/55">
              Not sure yet? Every door is free to open — verification only matters when you place a requirement or bid
              for work.
            </p>
          </motion.div>
        </div>
      }
    </AnimatePresence>,
    document.body
  );
}
