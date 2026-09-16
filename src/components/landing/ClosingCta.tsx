import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, Building2Icon, CheckIcon, LoaderIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { footerColumns } from '../../data/site';
import { EASE, Reveal } from '../motion/Reveal';

type Status = 'idle' | 'submitting' | 'done' | 'error';

export function ClosingCta() {
  const reduced = useReducedMotion();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      return;
    }
    setStatus('submitting');
    window.setTimeout(() => setStatus('done'), 900);
  };

  return (
    <section id="governance" className="mx-auto max-w-shell px-4 pb-10 pt-24 sm:pt-28">
      <Reveal>
        <div className="grid gap-10 rounded-4xl bg-cream p-7 text-black sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-black/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-black/60">
              <Building2Icon className="h-3.5 w-3.5" aria-hidden="true" />
              Institutional onboarding
            </p>
            <h2 className="mt-4 font-display text-[34px] font-semibold leading-[1.06] tracking-[-0.025em] sm:text-[46px]">
              Bring your agency onto the rail.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-black/70">
              Competent authorities, exporters and international buyers onboard through the NATEP / NCMSE Secretariat.
              Tell us who you are and we will route you to the right workspace.
            </p>

            <form onSubmit={submit} className="mt-8 max-w-md" noValidate>
              <label htmlFor="official-email" className="block text-[12px] font-medium text-black/60">
                Official email address
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  id="official-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="name@agency.gov.ng"
                  aria-invalid={status === 'error'}
                  disabled={status === 'submitting' || status === 'done'}
                  className={`flex-1 rounded-xl border bg-white px-4 py-3 text-[14px] text-black placeholder:text-black/35 transition-colors duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-gate-deep/40 ${
                  status === 'error' ? 'border-red-600' : 'border-black/15'}`
                  } />

                <button
                  type="submit"
                  disabled={status === 'submitting' || status === 'done'}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gate-deep px-5 py-3 text-[14px] font-semibold text-cream transition-colors duration-150 ease-out hover:bg-black disabled:opacity-70">

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={status}
                      initial={reduced ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduced ? undefined : { opacity: 0, y: -4 }}
                      transition={{ duration: 0.16, ease: EASE }}
                      className="inline-flex items-center gap-2">

                      {status === 'submitting' && <LoaderIcon className="h-4 w-4 animate-spin" aria-hidden="true" />}
                      {status === 'done' && <CheckIcon className="h-4 w-4" aria-hidden="true" />}
                      {status === 'submitting' ? 'Routing' : status === 'done' ? 'Request received' : 'Request access'}
                      {status === 'idle' && <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </div>
              <p
                role="status"
                className={`mt-2.5 text-[12.5px] ${status === 'error' ? 'text-red-700' : 'text-black/55'}`}>

                {status === 'error' ?
                'Enter a valid email address so the Secretariat can respond.' :
                status === 'done' ?
                'A desk officer will confirm your workspace within two business days.' :
                'We use this only to verify your institution. No marketing lists.'}
              </p>
            </form>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 lg:gap-6">
            {footerColumns.map((column) =>
            <div key={column.heading}>
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-black/45">{column.heading}</p>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) =>
                <li key={link.label}>
                      <Link
                    to={link.href}
                    className="text-[13.5px] leading-snug text-black/75 transition-colors duration-150 ease-out hover:text-black">

                        {link.label}
                      </Link>
                    </li>
                )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </section>);

}
