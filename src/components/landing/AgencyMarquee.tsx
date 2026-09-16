import React from 'react';
import { agencies } from '../../data/site';

export function AgencyMarquee() {
  const row = [...agencies, ...agencies];

  return (
    <section className="relative bg-ink-800/40 py-8" aria-label="Participating institutions">
      <p className="mb-6 px-4 text-center text-[11px] uppercase tracking-[0.18em] text-chalk-dim">
        Coordinated with the institutions that hold the mandate
      </p>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent sm:w-28" />

        <ul className="marquee-track flex w-max items-center gap-4 pl-4">
          {row.map((agency, index) =>
          <li
            key={`${agency.name}-${index}`}
            className="flex h-[78px] w-[186px] shrink-0 items-center justify-center rounded-xl border border-cream/25 bg-cream px-5 py-3">
            
              <img
              src={agency.src}
              alt={agency.name}
              loading="lazy"
              className="max-h-[46px] w-auto max-w-full object-contain grayscale opacity-80 mix-blend-multiply" />
            
            </li>
          )}
        </ul>
      </div>
    </section>);

}