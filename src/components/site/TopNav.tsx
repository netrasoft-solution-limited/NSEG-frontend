import React, { useEffect, useRef, useState } from 'react';
import { NigeriaFlag } from '../common/NigeriaFlag';
import { BrandLogo } from '../common/BrandLogo';
import { ArrowRightIcon, BriefcaseIcon, ChevronDownIcon, GlobeIcon, LifeBuoyIcon, MenuIcon, ShieldCheckIcon, XIcon } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { EASE } from '../motion/Reveal';
import { useHashLink } from '../../hooks/useHashLink';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
{ label: 'Home', href: '#top' },
{ label: 'Who it is for', href: '#who-its-for' },
{ label: 'How it works', href: '#how-it-works' },
{ label: 'The process', href: '#process' }];


const workspaceLinks = [
{ to: '/workspace', label: 'Exporter workspace', detail: 'Nigerian service exporters', icon: BriefcaseIcon },
{ to: '/buyer', label: 'Buyer workspace', detail: 'International buyers sourcing services', icon: GlobeIcon }];


export function TopNav() {
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const signInRef = useRef<HTMLDivElement>(null);
  const resolveHash = useHashLink();
  const { pathname } = useLocation();
  const isCurrent = (label: string) => label === 'Home' && pathname === '/';

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
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3">
      <div className="mx-auto mb-2 max-w-shell">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border border-white/10 bg-[#0A100D]/85 px-3 py-1.5 text-[12px] text-white/75 backdrop-blur-xl">
          <span className="inline-flex items-center gap-1.5">
            <NigeriaFlag className="h-3" />
            <span className="sm:hidden">Official FMITI platform</span>
            <span className="hidden sm:inline">An official platform of the Federal Ministry of Industry, Trade and Investment</span>
          </span>
          <span className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setVerifyOpen((value) => !value)}
              aria-expanded={verifyOpen}
              aria-controls="verify-site"
              className="inline-flex items-center gap-1 text-white/80 underline-offset-2 hover:text-white hover:underline">

              <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Verify this site
            </button>
            <a
              href="/#support"
              onClick={resolveHash('#support')}
              className="inline-flex items-center gap-1 text-white/80 underline-offset-2 hover:text-white hover:underline">

              <LifeBuoyIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Support
            </a>
          </span>
        </div>
        {verifyOpen &&
        <p id="verify-site" className="mt-1.5 rounded-xl border border-white/10 bg-[#0A100D]/95 px-3 py-2 text-[12.5px] leading-relaxed text-white/80">
            Official Gateway pages are served from a <span className="font-semibold text-white">.gov.ng</span> address over a
            secure connection. We will never ask for your password by email or phone. This is a prototype build.
          </p>
        }
      </div>
      <nav
        aria-label="Primary"
        className={`mx-auto flex max-w-shell items-center gap-3 rounded-2xl border border-white/10 bg-[#0A100D]/80 px-3 py-2.5 backdrop-blur-xl transition-shadow duration-200 ease-out ${
        scrolled ? 'shadow-lg shadow-black/30' : ''}`
        }>

        <a href="/#top" className="flex items-center pl-1">
          <BrandLogo className="h-7 sm:h-8" />
        </a>

        <ul className="ml-auto hidden items-center gap-1 lg:flex">
          {navItems.map((item) =>
          <li key={item.href}>
              <a
              href={'/' + item.href}
              onClick={resolveHash(item.href)}
              aria-current={isCurrent(item.label) ? 'page' : undefined}
              className={`rounded-lg px-3 py-1.5 text-[13px] transition-colors duration-150 ease-out hover:text-white ${
              isCurrent(item.label) ? 'text-white' : 'text-white/60'}`
              }>

                {item.label}
              </a>
            </li>
          )}
        </ul>

        <div ref={signInRef} className="relative ml-auto hidden lg:ml-0 lg:block">
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
            className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-white/10 bg-[#0A100D]/95 p-2 shadow-xl shadow-black/40 backdrop-blur-xl">

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
          href="/#who-its-for"
          onClick={resolveHash('#who-its-for')}
          className="hidden items-center gap-1.5 rounded-xl bg-gate px-3.5 py-2 text-[13px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-gate-deep lg:ml-0 lg:inline-flex">

          Get started
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </a>

        <ThemeToggle className="hidden lg:inline-flex" />

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="ml-auto rounded-lg border border-white/10 p-2 text-white lg:hidden">

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
          className="mx-auto mt-2 max-w-shell rounded-2xl border border-white/10 bg-[#0A100D]/95 p-3 backdrop-blur-xl lg:hidden">

            <ul className="space-y-1">
              {navItems.map((item) =>
            <li key={item.href}>
                  <a
                href={'/' + item.href}
                onClick={(event) => {
                  resolveHash(item.href)(event);
                  setOpen(false);
                }}
                aria-current={isCurrent(item.label) ? 'page' : undefined}
                className={`block rounded-lg px-3 py-2 text-[14px] ${isCurrent(item.label) ? 'bg-white/[0.06] text-white' : 'text-white/60'}`}>

                    {item.label}
                  </a>
                </li>
            )}
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
            href="/#who-its-for"
            onClick={(event) => {
              resolveHash('#who-its-for')(event);
              setOpen(false);
            }}
            className="mt-2 block rounded-xl bg-gate px-3.5 py-2.5 text-center text-[14px] font-semibold text-white">

              Get started
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
