import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, BriefcaseIcon, CheckIcon, GlobeIcon, LandmarkIcon, LogInIcon } from 'lucide-react';
import type { IconComponent } from '../../types/icons';
import { audienceDoors, type DoorId } from '../../data/landing';
import { SectionEyebrow } from '../site/SectionEyebrow';
import { Reveal } from '../motion/Reveal';
import { useHashLink } from '../../hooks/useHashLink';

const doorIcons: Record<DoorId, IconComponent> = {
  buyer: GlobeIcon,
  exporter: BriefcaseIcon,
  institution: LandmarkIcon
};

/** "Start here": one door per audience, each opening the right workspace. */
export function AudienceDoors() {
  const resolveHash = useHashLink();

  return (
    <section id="who-its-for" className="mx-auto max-w-shell scroll-mt-28 px-4 py-24 sm:py-28">
      <Reveal>
        <div className="max-w-2xl">
          <SectionEyebrow icon={LogInIcon}>Start here</SectionEyebrow>
          <h2 className="mt-4 text-balance font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-chalk sm:text-[44px]">
            Three doors, one platform
          </h2>
          <p className="mt-4 text-[15.5px] leading-relaxed text-chalk-muted">
            What you can do depends on who you are. Choose the description that fits and the Gateway opens in the right
            workspace.
          </p>
        </div>
      </Reveal>

      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {audienceDoors.map((door, index) => {
          const Icon = doorIcons[door.id];
          const isHash = door.cta.to.startsWith('/#');
          const ctaClass =
          'mt-6 inline-flex min-h-[44px] items-center gap-1.5 self-start rounded-xl border border-hairline/15 px-4 text-[14px] font-semibold text-chalk transition-colors duration-150 ease-out hover:border-gate/60 group-hover:border-gate/40';
          return (
            <Reveal as="li" key={door.id} delay={index * 0.05}>
              <div className="group flex h-full flex-col rounded-3xl border border-hairline/10 bg-ink-800/70 p-6 transition-colors duration-150 ease-out hover:border-hairline/20 sm:p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gate/25 bg-gate/10 text-gate-soft">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-[22px] font-semibold tracking-[-0.01em] text-chalk">{door.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-chalk-muted">{door.audience}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {door.promises.map((promise) =>
                  <li key={promise} className="flex items-start gap-2.5 text-[14px] leading-snug text-chalk">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gate-soft" aria-hidden="true" />
                      {promise}
                    </li>
                  )}
                </ul>
                {isHash ?
                <a href={door.cta.to} onClick={resolveHash(door.cta.to.slice(1))} className={ctaClass}>
                    {door.cta.label}
                    <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                  </a> :

                <Link to={door.cta.to} className={ctaClass}>
                    {door.cta.label}
                    <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                }
              </div>
            </Reveal>);

        })}
      </ul>
    </section>);

}
