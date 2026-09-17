import React, { useState } from 'react';
import { BadgeCheckIcon, BuildingIcon, DownloadIcon, ShieldAlertIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { BuyerTable } from '../components/console/BuyerTable';
import { VerificationQueue, type VerificationDecision } from '../components/console/VerificationQueue';
import { useAccounts } from '../lib/accounts';
import { filterBuyers, type BuyerFilterState } from '../lib/buyerFilters';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { canMutate } from '../lib/permissions';

const emptyFilters: BuyerFilterState = { search: '', tier: 'all' };

export function ConsoleBuyers() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const mutable = canMutate(profile.role);
  const [filters, setFilters] = useState<BuyerFilterState>(emptyFilters);
  const [verificationDecisions, setVerificationDecisions] = useState<Record<string, VerificationDecision>>({});
  const accounts = useAccounts();
  const buyers = accounts.buyers;

  const filtered = filterBuyers(buyers, filters);
  const registryVerifiedOrAbove = buyers.filter((buyer) => buyer.tier !== 'registered').length;
  const rfpsPosted = buyers.reduce((total, buyer) => total + buyer.opportunitiesPosted, 0);
  const pendingVerificationCount = buyers.filter(
    (buyer) => buyer.verificationQueue !== 'none' && !verificationDecisions[buyer.id]
  ).length;

  const handleExport = () => {
    downloadCsv(
      'nseg-buyers.csv',
      filtered.map((buyer) => ({
        name: buyer.name,
        email: buyer.email,
        region: buyer.region,
        registeredOn: buyer.registeredOn,
        opportunitiesPosted: buyer.opportunitiesPosted,
        tier: buyer.tier
      }))
    );
    logEvent(`Exported the buyer registry (${filtered.length} rows)`, 'buyers', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Buyers" onExport={handleExport}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">Buyers</h1>
          <p className="mt-1 text-[13.5px] text-gray-500">
            The demand-side registry — international buyers onboarded through hybrid JIT verification.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black">

          <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Export buyers
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BuildingIcon}
          label="Total buyers"
          value={buyers.length.toLocaleString()}
          delta="Demand side"
          positive
          accent="gate" />

        <StatCard
          icon={BadgeCheckIcon}
          label="Registry verified or above"
          value={registryVerifiedOrAbove.toString()}
          delta="Trust tier"
          positive
          accent="sky" />

        <StatCard
          icon={ShieldAlertIcon}
          label="Pending verification"
          value={pendingVerificationCount.toString()}
          delta="Needs review"
          positive={false}
          accent="rose" />

        <StatCard
          icon={BuildingIcon}
          label="RFPs posted"
          value={rfpsPosted.toString()}
          delta="Lifetime"
          positive
          accent="gold" />

      </div>

      <div className="mt-6">
        <VerificationQueue
          entities={buyers.map((buyer) => ({
            ...buyer,
            verificationQueue: verificationDecisions[buyer.id] && buyer.verificationQueue === 'none' ? 'pending' : buyer.verificationQueue
          }))}
          decisions={verificationDecisions}
          canMutate={mutable}
          onDecide={(id, decision) => {
            setVerificationDecisions((current) => ({ ...current, [id]: decision }));
            if (accounts.isNewAccount(id)) accounts.decideBuyerVerification(id, decision);
            const buyer = buyers.find((item) => item.id === id);
            logEvent(
              `${decision === 'approved' ? 'Verified' : 'Rejected'} ${buyer?.name ?? id}'s buyer account`,
              'buyers',
              profile.name
            );
          }} />

      </div>

      <div className="mt-6">
        <BuyerTable buyers={filtered} total={buyers.length} filters={filters} onChange={setFilters} />
      </div>
    </ConsoleLayout>);

}
