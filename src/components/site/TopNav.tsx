import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRightIcon, BriefcaseIcon, ChevronDownIcon, GlobeIcon, MenuIcon, XIcon } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { EASE } from '../motion/Reveal';
import { useHashLink } from '../../hooks/useHashLink';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
{ label: 'Portals', href: '#portals' },
{ label: 'Trust', href: '#trust' },
{ label: 'Observatory', href: '#observatory' },
{ label: 'Governance', href: '#governance' }];


const workspaceLinks = [
{ to: '/workspace', label: 'Exporter workspace', detail: 'Nigerian service exporters', icon: BriefcaseIcon },
{ to: '/buyer', label: 'Buyer workspace', detail: 'International buyers sourcing services', icon: GlobeIcon }];


export function TopNav() {
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const signInRef = useRef<HTMLDivElement>(null);
  const resolveHash = useHashLink();

  useEffect(() => {
    if (!signInOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!signInRef.current?.contains(event.target as Node)) setSignInOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSignInOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [signInOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // TopNav is fixed-position chrome that floats over both the Hero's dark
  // map art and the (theme-flipping) rest of the page, so it intentionally
  // stays dark-styled in both themes rather than flipping — avoids a light
  // nav pill flashing over the dark hero, and matching patterns like VS
  // Code's always-dark activity bar. The backdrop is never fully transparent
  // (even at rest) since pages without hero art behind it (e.g. Marketplace)
  // would otherwise leave the fixed-light nav text with no contrast in light mode.
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        aria-label="Primary"
        className={`mx-auto flex max-w-shell items-center gap-3 rounded-2xl border border-white/10 bg-black/70 px-3 py-2.5 backdrop-blur-xl transition-shadow duration-200 ease-out ${
        scrolled ? 'shadow-lg shadow-black/30' : ''}`
        }>

        <a href="/#top" className="flex items-center pl-1">
          <img src="/brand/nseg-logo-white.svg" alt="NSEG — Nigeria Service Export Gateway" className="h-9 w-auto sm:h-10" />
        </a>

        <ul className="ml-auto hidden items-center gap-1 md:flex">
          {navItems.map((item) =>
          <li key={item.href}>
              <a
              href={'/' + item.href}
              onClick={resolveHash(item.href)}
              className="rounded-lg px-3 py-1.5 text-[13px] text-white/60 transition-colors duration-150 ease-out hover:text-white">

                {item.label}
              </a>
            </li>
          )}
          <li>
            <Link
              to="/marketplace"
              className="rounded-lg px-3 py-1.5 text-[13px] text-white/60 transition-colors duration-150 ease-out hover:text-white">

              Marketplace
            </Link>
          </li>
        </ul>

        <div ref={signInRef} className="relative ml-auto hidden md:ml-0 md:block">
          <button
            type="button"
            onClick={() => setSignInOpen((value) => !value)}
            aria-expanded={signInOpen}
            aria-controls="sign-in-menu"
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[13px] text-white/80 transition-colors duration-150 ease-out hover:text-white">

            Sign in
            <ChevronDownIcon
              className={`h-3.5 w-3.5 transition-transform duration-150 ease-out ${signInOpen ? 'rotate-180' : ''}`}
              aria-hidden="true" />

          </button>
          {signInOpen &&
          <div
            id="sign-in-menu"
            className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-white/10 bg-black/95 p-2 shadow-xl shadow-black/40 backdrop-blur-xl">

              <ul>
                {workspaceLinks.map(({ to, label, detail, icon: Icon }) =>
              <li key={to}>
                    <Link
                  to={to}
                  onClick={() => setSignInOpen(false)}
                  className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 ease-out hover:bg-white/[0.06]">

                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gate-soft" aria-hidden="true" />
                      <span>
                        <span className="block text-[13.5px] font-medium text-white">{label}</span>
                        <span className="block text-[12px] text-white/60">{detail}</span>
                      </span>
                    </Link>
                  </li>
              )}
              </ul>
            </div>
          }
        </div>

        <a
          href="#governance"
          className="hidden items-center gap-1.5 rounded-xl bg-gate px-3.5 py-2 text-[13px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-gate-deep md:ml-0 md:inline-flex">

          Request access
          <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </a>

        <ThemeToggle className="hidden md:inline-flex" />

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="ml-auto rounded-lg border border-white/10 p-2 text-white md:hidden">

          {open ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
        </button>
      </nav>

      <AnimatePresence>
        {open &&
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="mx-auto mt-2 max-w-shell rounded-2xl border border-white/10 bg-black/90 p-3 backdrop-blur-xl md:hidden">

            <ul className="space-y-1">
              {navItems.map((item) =>
            <li key={item.href}>
                  <a
                href={'/' + item.href}
                onClick={(event) => {
                  resolveHash(item.href)(event);
                  setOpen(false);
                }}
                className="block rounded-lg px-3 py-2 text-[14px] text-white/60">

                    {item.label}
                  </a>
                </li>
            )}
              <li>
                <Link
                to="/marketplace"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-[14px] text-white/60">

                  Marketplace
                </Link>
              </li>
            </ul>
            <p className="mt-2 border-t border-white/10 px-3 pb-1 pt-3 text-[11px] uppercase tracking-[0.14em] text-white/60">
              Sign in
            </p>
            <ul className="space-y-1">
              {workspaceLinks.map(({ to, label, icon: Icon }) =>
            <li key={to}>
                  <Link
                to={to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] text-white">

                    <Icon className="h-4 w-4 text-gate-soft" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
            )}
            </ul>
            <a
            href="#governance"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-xl bg-gate px-3.5 py-2.5 text-center text-[14px] font-semibold text-white">

              Request access
            </a>
            <div className="mt-2 flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
              <span className="text-[13px] text-white/60">Appearance</span>
              <ThemeToggle />
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </header>);

}
