import React from 'react';
import { AwardIcon, PackageCheckIcon, ShieldCheckIcon, UserRoundIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { TierReferenceCard } from '../components/console/TierReferenceCard';
import { actors } from '../data/actors';
import { buyers } from '../data/buyers';
import { evidenceLabels, trackLabels, trustTiers, type TrustTier } from '../data/trustTiers';
import { buyerTiers, type BuyerTierId } from '../data/buyerTiers';
import { isTopBuyerTier, isTopExporterTier } from '../lib/trustBadging';
import { exporterStanding, stepsToNextTier } from '../lib/exporterTier';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';

const exporterAccent: Record<TrustTier['accent'], string> = {
  dim: 'bg-gray-100 text-gray-600',
  gate: 'bg-emerald-50 text-emerald-700',
  gold: 'bg-amber-50 text-amber-700'
};

const buyerAccent: Record<BuyerTierId, string> = {
  registered: 'bg-gray-100 text-gray-600',
  'registry-verified': 'bg-emerald-50 text-emerald-700',
  'payment-verified': 'bg-amber-50 text-amber-700'
};

function evidenceRequirement(tier: TrustTier): string {
  if (tier.evidence.firm.length === 0) return 'No evidence required';
  const list = (keys: TrustTier['evidence']['firm']) => keys.map((key) => evidenceLabels[key]).join(' + ');
  return `Firm: ${list(tier.evidence.firm)} · Individual: ${list(tier.evidence.individual)}`;
}

export function ConsoleTrustBadging() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();

  const standings = actors.map((actor) => ({ actor, standing: exporterStanding(actor) }));
  const topExporterCount = actors.filter((actor) => isTopExporterTier(actor.tier)).length;
  const individualCount = actors.filter((actor) => actor.track === 'individual').length;
  const topBuyerCount = buyers.filter((buyer) => isTopBuyerTier(buyer.tier)).length;

  const handleExport = () => {
    downloadCsv(
      'nseg-trust-tiers.csv',
      [
      ...standings.map(({ actor, standing }) => ({
        side: 'exporter',
        name: actor.name,
        track: actor.track,
        tier: actor.tier,
        diagnosticScore: standing.score,
        nextAction: standing.nextAction
      })),
      ...buyers.map((buyer) => ({ side: 'buyer', name: buyer.name, track: '', tier: buyer.tier, diagnosticScore: '', nextAction: '' }))]

    );
    logEvent(`Exported the trust tier breakdown (${actors.length + buyers.length} rows)`, 'exporters', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Trust & badging" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">Trust & badging</h1>
        <p className="mt-1.5 text-[14.5px] text-gray-600">
          One ladder per side. Every tier is named for what was verified — never a rating of work quality —
          and every actor sees the one thing standing between them and the next tier.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={PackageCheckIcon}
          label="Delivery Verified exporters"
          value={topExporterCount.toString()}
          delta={`of ${actors.length} exporters`}
          positive
          accent="gold" />

        <StatCard
          icon={UserRoundIcon}
          label="Individual-track exporters"
          value={individualCount.toString()}
          delta="NIN + credential"
          positive
          accent="sky" />

        <StatCard
          icon={ShieldCheckIcon}
          label="Buyers tracked"
          value={buyers.length.toString()}
          delta="Demand side"
          positive
          accent="gate" />

        <StatCard
          icon={AwardIcon}
          label="Payment Verified buyers"
          value={topBuyerCount.toString()}
          delta="Highest tier"
          positive
          accent="rose" />

      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="text-[16px] font-semibold text-gray-900">Exporter tiers</h2>
          <p className="text-[12.5px] text-gray-400">
            Highest rung where the diagnostic score and the verified evidence are both met.
          </p>
          <div className="mt-3 space-y-2">
            {trustTiers.map((tier) =>
            <TierReferenceCard
              key={tier.id}
              badge={`${tier.badge} · diagnostic ${tier.minDiagnostic}+`}
              requirement={evidenceRequirement(tier)}
              unlocked={tier.unlocked}
              nextStep={tier.nextStep}
              accentClass={exporterAccent[tier.accent]} />

            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="text-[16px] font-semibold text-gray-900">Buyer tiers</h2>
          <p className="text-[12.5px] text-gray-400">Progresses through officer verification, not a self-reported score.</p>
          <div className="mt-3 space-y-2">
            {buyerTiers.map((tier) =>
            <TierReferenceCard
              key={tier.id}
              badge={tier.badge}
              requirement={tier.verifies}
              unlocked={tier.unlocked}
              nextStep={tier.nextStep}
              accentClass={buyerAccent[tier.id]} />

            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="text-[16px] font-semibold text-gray-900">Exporters closest to their next tier</h2>
        <p className="text-[12.5px] text-gray-400">
          Missing evidence counts for more than score points — a high score never lifts a tier on its own.
          This is the same next action each exporter sees in their workspace.
        </p>
        <ul className="mt-3 space-y-2">
          {standings.
          filter(({ standing }) => standing.next).
          sort((a, b) => stepsToNextTier(a.standing) - stepsToNextTier(b.standing)).
          slice(0, 6).
          map(({ actor, standing }) => {
            const tier = trustTiers.find((item) => item.id === actor.tier)!;
            const next = standing.next!;
            const requirementCount = next.evidence[actor.track].length + 1;
            const metCount = requirementCount - standing.missingEvidence.length - (standing.scoreGap > 0 ? 1 : 0);
            const progress =
            (next.evidence[actor.track].length - standing.missingEvidence.length + Math.min(1, standing.score / next.minDiagnostic)) /
            requirementCount;
            return (
              <li key={actor.id} className="rounded-xl border border-gray-200 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">{actor.name}</p>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-medium ${exporterAccent[tier.accent]}`}>
                      {tier.badge}
                    </span>
                    <span className="text-[11px] text-gray-400">{trackLabels[actor.track]}</span>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {metCount} of {requirementCount} requirements met · score {standing.score}/{next.minDiagnostic}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gray-900"
                    style={{ width: `${Math.round(progress * 100)}%` }} />
                </div>
                <p className="mt-1.5 text-[11.5px] text-gray-500">{standing.nextAction}</p>
              </li>);

          })}
        </ul>
      </div>
    </ConsoleLayout>);

}
