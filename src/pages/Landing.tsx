import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TopNav } from '../components/site/TopNav';
import { SiteFooter } from '../components/site/SiteFooter';
import { Hero, type HeroVariant } from '../components/landing/Hero';
import { AudienceDoors } from '../components/landing/AudienceDoors';
import { TrustRules } from '../components/landing/TrustRules';
import { ProcessSection } from '../components/landing/ProcessSection';

interface LandingProps {
  heroVariant: HeroVariant;
  liveDemos: boolean;
}

export function Landing({ heroVariant }: LandingProps) {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    // Deferred a frame: MandateStatement's useScroll() resets window scroll to
    // (0,0) during its initial layout measurement on mount, which otherwise
    // races and clobbers this scroll on cross-route navigation.
    const raf = requestAnimationFrame(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(raf);
  }, [hash]);

  return (
    <div className="min-h-full w-full">
      <TopNav />
      <main>
        <Hero variant={heroVariant} />
        <AudienceDoors />
        <TrustRules />
        <ProcessSection />
      </main>
      <SiteFooter />
    </div>);

}