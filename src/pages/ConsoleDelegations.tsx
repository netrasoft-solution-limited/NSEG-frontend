import React, { useState } from 'react';
import { AlertTriangleIcon, ShieldCheckIcon, UserMinusIcon, UsersRoundIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { registryTabs } from '../components/console/consoleTabs';
import { StatCard } from '../components/console/StatCard';
import { DelegationRegistry } from '../components/console/DelegationRegistry';
import { delegations, type DelegationStatus } from '../data/delegations';
import { actors } from '../data/actors';
import { buyers } from '../data/buyers';
import { orgFor } from '../lib/delegationLookup';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { canMutate } from '../lib/permissions';

const actorsById = new Map(actors.map((actor) => [actor.id, actor]));
const buyersById = new Map(buyers.map((buyer) => [buyer.id, buyer]));

export function ConsoleDelegations() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const mutable = canMutate(profile.role);
  const [overrides, setOverrides] = useState<Record<string, DelegationStatus>>({});

  const statusOf = (id: string, fallback: DelegationStatus) => overrides[id] ?? fallback;

  const activeCount = delegations.filter((item) => statusOf(item.id, item.status) === 'active').length;
  const expiringSoonCount = delegations.filter((item) => statusOf(item.id, item.status) === 'expiring-soon').length;
  const expiredCount = delegations.filter((item) => statusOf(item.id, item.status) === 'expired').length;
  const revokedCount = delegations.filter((item) => statusOf(item.id, item.status) === 'revoked').length;

  const handleExport = () => {
    downloadCsv(
      'nseg-delegations.csv',
      delegations.map((delegation) => {
        const org = orgFor(delegation, actorsById, buyersById);
        return {
          organization: org?.name ?? delegation.actorId,
          delegate: delegation.delegateName,
          role: delegation.delegateRole,
          assignedOn: delegation.assignedOn,
          expiresInDays: delegation.expiresInDays ?? '',
          status: statusOf(delegation.id, delegation.status)
        };
      })
    );
    logEvent(`Exported the delegation registry (${delegations.length} rows)`, 'delegations', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Registry · Delegated access" onExport={handleExport} tabs={registryTabs}>
      <div>
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">Delegations</h1>
        <p className="mt-1.5 text-[14.5px] text-gray-600">
          Every exporter and buyer account is an organization, not one login — see who's currently
          authorized to act on its behalf.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={UsersRoundIcon}
          label="Active delegates"
          value={activeCount.toString()}
          delta="Authorized"
          positive
          accent="gate" />

        <StatCard
          icon={AlertTriangleIcon}
          label="Expiring soon"
          value={expiringSoonCount.toString()}
          delta="Within 30 days"
          positive={false}
          accent="gold" />

        <StatCard
          icon={ShieldCheckIcon}
          label="Expired"
          value={expiredCount.toString()}
          delta="Recertification lapsed"
          positive
          accent="sky" />

        <StatCard
          icon={UserMinusIcon}
          label="Revoked"
          value={revokedCount.toString()}
          delta="Compliance action"
          positive={false}
          accent="rose" />

      </div>

      <div className="mt-6">
        <DelegationRegistry
          delegations={delegations}
          actorsById={actorsById}
          buyersById={buyersById}
          overrides={overrides}
          canMutate={mutable}
          onRevoke={(id) => {
            setOverrides((current) => ({ ...current, [id]: 'revoked' }));
            const delegation = delegations.find((item) => item.id === id);
            const org = delegation ? orgFor(delegation, actorsById, buyersById) : undefined;
            logEvent(
              `Revoked ${delegation?.delegateName ?? 'a delegate'}'s access to act for ${org?.name ?? 'an organization'}`,
              'delegations',
              profile.name
            );
          }} />

      </div>
    </ConsoleLayout>);

}
