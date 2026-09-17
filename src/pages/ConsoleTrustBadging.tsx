import React from 'react';
import { AwardIcon, CrownIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { TierReferenceCard } from '../components/console/TierReferenceCard';
import { actors } from '../data/actors';
import { buyers } from '../data/buyers';
import { trustTiers, type TrustTier } from '../data/trustTiers';
import { buyerTiers, type BuyerTierId } from '../data/buyerTiers';
import { isTopBuyerTier, isTopExporterTier, nextBuyerTier, nextExporterTier } from '../lib/trustBadging';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';

const exporterAccent: Record<TrustTier['accent'], string> = {
  dim: 'bg-gray-100 text-gray-600',
  gate: 'bg-emerald-50 text-emerald-700',
  gold: 'bg-amber-50 text-amber-700'
};

const buyerAccent: Record<BuyerTierId, string> = {
  standard: 'bg-gray-100 text-gray-600',
  established: 'bg-emerald-50 text-emerald-700',
  'verified-enterprise': 'bg-amber-50 text-amber-700'
};

export function ConsoleTrustBadging() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();

  const topExporterCount = actors.filter((actor) => isTopExporterTier(actor.tier)).length;
  const topBuyerCount = buyers.filter((buyer) => isTopBuyerTier(buyer.tier)).length;

  const handleExport = () => {
    downloadCsv(
      'nseg-trust-tiers.csv',
      [
      ...actors.map((actor) => ({ side: 'exporter', name: actor.name, tier: actor.tier, completion: actor.profileCompletion })),
      ...buyers.map((buyer) => ({ side: 'buyer', name: buyer.name, tier: buyer.tier, completion: '' }))]

    );
    logEvent(`Exported the trust tier breakdown (${actors.length + buyers.length} rows)`, 'exporters', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Trust & badging" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">Trust & badging</h1>
        <p className="mt-1 text-[13.5px] text-gray-500">
          Symmetric trust pipelines for both sides of the platform — what each tier unlocks, and the
          one thing standing between an actor and the next one.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={UsersIcon}
          label="Exporters tracked"
          value={actors.length.toString()}
          delta="Supply side"
          positive
          accent="sky" />

        <StatCard
          icon={CrownIcon}
          label="Top-Rated exporters"
          value={topExporterCount.toString()}
          delta="Highest tier"
          positive
          accent="gold" />

        <StatCard
          icon={ShieldCheckIcon}
          label="Buyers tracked"
          value={buyers.length.toString()}
          delta="Demand side"
          positive
          accent="gate" />

        <StatCard
          icon={AwardIcon}
          label="Verified Enterprise buyers"
          value={topBuyerCount.toString()}
          delta="Highest tier"
          positive
          accent="rose" />

      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
          <h2 className="text-[16px] font-semibold text-gray-900">Exporter tiers</h2>
          <p className="text-[12.5px] text-gray-400">Weighted 40% data completeness, 60% verification depth.</p>
          <div className="mt-3 space-y-2">
            {trustTiers.map((tier) =>
            <TierReferenceCard
              key={tier.id}
              badge={`${tier.badge} · ${tier.range}`}
              unlocked={tier.unlocked}
              nextStep={tier.nextStep}
              accentClass={exporterAccent[tier.accent]} />

            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
          <h2 className="text-[16px] font-semibold text-gray-900">Buyer tiers</h2>
          <p className="text-[12.5px] text-gray-400">Progresses through officer verification, not a self-reported score.</p>
          <div className="mt-3 space-y-2">
            {buyerTiers.map((tier) =>
            <TierReferenceCard
              key={tier.id}
              badge={tier.badge}
              unlocked={tier.unlocked}
              nextStep={tier.nextStep}
              accentClass={buyerAccent[tier.id]} />

            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
        <h2 className="text-[16px] font-semibold text-gray-900">Exporters closest to their next tier</h2>
        <p className="text-[12.5px] text-gray-400">
          Sorted by profile completion — the Next Unlock Prompt every profile dashboard is required to show.
        </p>
        <ul className="mt-3 space-y-2">
          {[...actors].
          sort((a, b) => b.profileCompletion - a.profileCompletion).
          slice(0, 6).
          map((actor) => {
            const next = nextExporterTier(actor.tier);
            return (
              <li key={actor.id} className="rounded-xl border border-gray-100 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-gray-900">{actor.name}</p>
                  <span className="font-mono text-[11px] text-gray-400">{actor.profileCompletion}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-gray-900" style={{ width: `${actor.profileCompletion}%` }} />
                </div>
                <p className="mt-1.5 text-[11.5px] text-gray-400">
                  {next ?
                  <>Next: <span className="text-gray-600">{next.badge}</span> — {trustTiers.find((t) => t.id === actor.tier)?.nextStep}</> :

                  'Already at the highest tier — ' + trustTiers.find((t) => t.id === actor.tier)?.nextStep
                  }
                </p>
              </li>);

          })}
        </ul>
      </div>
    </ConsoleLayout>);

}
