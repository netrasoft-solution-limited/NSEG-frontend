import React, { useState } from 'react';
import { CheckCircleIcon, ClockIcon, ShieldIcon, ShieldOffIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { ConsentRegister } from '../components/console/ConsentRegister';
import { consentGrants, type ConsentStatus } from '../data/consentGrants';
import { actors } from '../data/actors';
import { vaultDocuments } from '../data/vaultDocuments';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { canMutate } from '../lib/permissions';

const actorsById = new Map(actors.map((actor) => [actor.id, actor]));

export function ConsoleConsent() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const mutable = canMutate(profile.role);
  const [overrides, setOverrides] = useState<Record<string, ConsentStatus>>({});

  const statusOf = (id: string, fallback: ConsentStatus) => overrides[id] ?? fallback;

  const activeCount = consentGrants.filter((grant) => statusOf(grant.id, grant.status) === 'active').length;
  const revokedCount = consentGrants.filter((grant) => statusOf(grant.id, grant.status) === 'revoked').length;
  const expiredCount = consentGrants.filter((grant) => statusOf(grant.id, grant.status) === 'expired').length;

  const handleExport = () => {
    downloadCsv(
      'nseg-consent-grants.csv',
      consentGrants.map((grant) => ({
        exporter: actorsById.get(grant.actorId)?.name ?? grant.actorId,
        recipient: grant.recipient,
        purpose: grant.purpose,
        fieldsDisclosed: grant.fieldsDisclosed.join('; '),
        grantedOn: grant.grantedOn,
        status: statusOf(grant.id, grant.status)
      }))
    );
    logEvent(`Exported the consent register (${consentGrants.length} rows)`, 'consent', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Consent" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">Consent</h1>
        <p className="mt-1 text-[13.5px] text-gray-500">
          Oversight of purpose-bound consent grants and disclosure packages — exporters grant these, officers audit them.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ShieldIcon}
          label="Total grants"
          value={consentGrants.length.toString()}
          delta="Register"
          positive
          accent="sky" />

        <StatCard
          icon={CheckCircleIcon}
          label="Active"
          value={activeCount.toString()}
          delta="Register"
          positive
          accent="gate" />

        <StatCard
          icon={ClockIcon}
          label="Expired"
          value={expiredCount.toString()}
          delta="Register"
          positive={false}
          accent="gold" />

        <StatCard
          icon={ShieldOffIcon}
          label="Revoked"
          value={revokedCount.toString()}
          delta="Compliance action"
          positive={false}
          accent="rose" />

      </div>

      <div className="mt-6">
        <ConsentRegister
          grants={consentGrants}
          actorsById={actorsById}
          vaultDocuments={vaultDocuments}
          overrides={overrides}
          canMutate={mutable}
          onRevoke={(id) => {
            setOverrides((current) => ({ ...current, [id]: 'revoked' }));
            const grant = consentGrants.find((item) => item.id === id);
            const actor = grant ? actorsById.get(grant.actorId) : undefined;
            logEvent(
              `Revoked ${actor?.name ?? 'an exporter'}'s consent grant to ${grant?.recipient ?? 'a recipient'}`,
              'consent',
              profile.name
            );
          }}
          onViewPackage={(id) => {
            const grant = consentGrants.find((item) => item.id === id);
            const actor = grant ? actorsById.get(grant.actorId) : undefined;
            logEvent(
              `Viewed the disclosure package for ${actor?.name ?? 'an exporter'} sent to ${grant?.recipient ?? 'a recipient'}`,
              'consent',
              profile.name
            );
          }} />

      </div>
    </ConsoleLayout>);

}
