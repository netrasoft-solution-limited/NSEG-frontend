import { useEffect, useState } from 'react';
import { NigeriaFlag } from '../common/NigeriaFlag';
import { BrandLogo } from '../common/BrandLogo';
import { ArrowRightIcon, LifeBuoyIcon, MenuIcon, XIcon } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { EASE } from '../motion/Reveal';
import { useHashLink } from '../../hooks/useHashLink';
import { ThemeToggle } from './ThemeToggle';
import { GetStartedDialog } from './GetStartedDialog';

const navItems = [
{ label: 'Home', href: '#top' },
{ label: 'Who it is for', href: '#who-its-for' },
{ label: 'How it works', href: '#how-it-works' },
{ label: 'The process', href: '#process' }];




export function TopNav() {
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [getStartedOpen, setGetStartedOpen] = useState(false);
  const resolveHash = useHashLink();
  const { pathname } = useLocation();
  const [activeHash, setActiveHash] = useState('#top');
  const isCurrent = (label: string) =>
  pathname === '/' && navItems.find((item) => item.label === label)?.href === activeHash;

  // Which section is in view decides the current menu item, so the menu follows the reader
  // rather than always claiming "Home".
  useEffect(() => {
    if (pathname !== '/') return;
    const onScroll = () => {
      const line = window.scrollY + window.innerHeight * 0.35;
      const current = navItems.
      slice(1).
      filter((item) => {
        const section = document.getElementById(item.href.slice(1));
        return section ? section.offsetTop <= line : false;
      }).
      pop();
      setActiveHash(current?.href ?? '#top');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);


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
            <span className="sm:hidden">
              Official <span className="font-semibold text-white">FMITI</span> platform
            </span>
            <span className="hidden sm:inline">
              An official platform of the{' '}
              <span className="font-semibold text-white">Federal Ministry of Industry, Trade and Investment</span>
            </span>
          </span>
          <span className="flex items-center gap-3">
            <a
              href="/#support"
              onClick={resolveHash('#support')}
              className="inline-flex items-center gap-1 text-white/80 underline-offset-2 hover:text-white hover:underline">

              <LifeBuoyIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Support
            </a>
          </span>
        </div>
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
              className={`rounded-lg px-3 py-2 text-[14.5px] transition-colors duration-150 ease-out hover:text-white ${
              isCurrent(item.label) ? 'font-semibold text-white' : 'text-white/85'}`
              }>

                {item.label}
              </a>
            </li>
          )}
        </ul>

        <button
          type="button"
          onClick={() => setGetStartedOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={getStartedOpen}
          className="hidden items-center gap-1.5 rounded-xl bg-gate px-4 py-2 text-[14px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-gate-deep lg:ml-2 lg:inline-flex">

          Get started
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

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
            <button
            type="button"
            onClick={() => {
              setOpen(false);
              setGetStartedOpen(true);
            }}
            aria-haspopup="dialog"
            className="mt-2 block w-full rounded-xl bg-gate px-3.5 py-2.5 text-center text-[14px] font-semibold text-white">

              Get started
            </button>
            <div className="mt-2 flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
              <span className="text-[13px] text-white/60">Appearance</span>
              <ThemeToggle />
            </div>
          </motion.div>
        }
      </AnimatePresence>
      <GetStartedDialog open={getStartedOpen} onClose={() => setGetStartedOpen(false)} />
    </header>);

}
