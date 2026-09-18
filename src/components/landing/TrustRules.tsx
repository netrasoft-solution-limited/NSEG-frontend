import { BadgeCheckIcon, KeyRoundIcon, ShieldCheckIcon, StampIcon, UserCheckIcon } from 'lucide-react';
import { trustRules, type TrustRuleIcon } from '../../data/landing';
import { SectionEyebrow } from '../site/SectionEyebrow';
import { Reveal } from '../motion/Reveal';

/**
 * The icon for each rule.
 *
 * Chosen to carry the rule's meaning rather than to decorate it: a stamp for a named owner, a
 * badge for a graded claim, a key the subject holds, a person for a person's decision. They
 * replaced "Rule 1…Rule 4", which numbered the rules without saying anything about them.
 */
const ruleIcons: Record<TrustRuleIcon, typeof ShieldCheckIcon> = {
  owner: StampIcon,
  evidence: BadgeCheckIcon,
  consent: KeyRoundIcon,
  person: UserCheckIcon
};

/** "Why it can be trusted": the four published rules. */
export function TrustRules() {
  return (
    <section id="how-it-works" className="scroll-mt-28 border-y border-hairline/[0.03] bg-ink-800/30">
      <div className="mx-auto max-w-shell px-4 py-24 sm:py-28">
        <Reveal>
          <div className="max-w-2xl">
            <SectionEyebrow icon={ShieldCheckIcon}>Why it can be trusted</SectionEyebrow>
            <h2 className="mt-4 text-balance font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-chalk sm:text-[44px]">
              Built on evidence, not assertion
            </h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-chalk-muted">
              Four rules govern everything here. They are published so that you can hold the platform to them.
            </p>
          </div>
        </Reveal>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {trustRules.map((rule, index) => {
            const Icon = ruleIcons[rule.icon];
            return (
              <Reveal as="li" key={rule.title} delay={index * 0.04}>
                <div className="h-full rounded-3xl border border-hairline/10 bg-ink/60 p-6 sm:p-7">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gate/10 text-gate-soft ring-1 ring-gate/20">
                    <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-[20px] font-semibold tracking-[-0.01em] text-chalk">{rule.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-chalk-muted">{rule.body}</p>
                </div>
              </Reveal>);

          })}
        </ul>

      </div>
    </section>);

}
