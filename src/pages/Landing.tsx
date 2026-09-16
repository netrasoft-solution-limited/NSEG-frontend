import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TopNav } from '../components/site/TopNav';
import { SiteFooter } from '../components/site/SiteFooter';
import { Hero, type HeroVariant } from '../components/landing/Hero';
import { AgencyMarquee } from '../components/landing/AgencyMarquee';
import { MandateStatement } from '../components/landing/MandateStatement';
import { CapabilityGrid } from '../components/landing/CapabilityGrid';
import { MarketplacePreview } from '../components/landing/MarketplacePreview';
import { TrustLadder } from '../components/landing/TrustLadder';
import { ObservatorySection } from '../components/landing/ObservatorySection';
import { Guardrails } from '../components/landing/Guardrails';
import { ClosingCta } from '../components/landing/ClosingCta';

interface LandingProps {
  heroVariant: HeroVariant;
  liveDemos: boolean;
}

export function Landing({ heroVariant, liveDemos }: LandingProps) {
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
        <AgencyMarquee />
        <MandateStatement />
        <CapabilityGrid liveDemos={liveDemos} />
        <MarketplacePreview />
        <TrustLadder />
        <ObservatorySection />
        <Guardrails />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>);

}