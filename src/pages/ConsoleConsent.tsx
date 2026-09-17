import React from 'react';
import { CheckCircleIcon, ClockIcon, ShieldIcon, ShieldOffIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { ConsentRegister } from '../components/console/ConsentRegister';
import { actors } from '../data/actors';
import { vaultDocuments } from '../data/vaultDocuments';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { canMutate } from '../lib/permissions';
import { useEngagementLedger } from '../lib/engagementLedger';

const actorsById = new Map(actors.map((actor) => [actor.id, actor]));

export function ConsoleConsent() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const mutable = canMutate(profile.role);
  const { consentGrants, revokeConsent } = useEngagementLedger();

  const activeCount = consentGrants.filter((grant) => grant.status === 'active').length;
  const revokedCount = consentGrants.filter((grant) => grant.status === 'revoked').length;
  const expiredCount = consentGrants.filter((grant) => grant.status === 'expired').length;

  const handleExport = () => {
    downloadCsv(
      'nseg-consent-grants.csv',
      consentGrants.map((grant) => ({
        exporter: actorsById.get(grant.actorId)?.name ?? grant.actorId,
        recipient: grant.recipient,
        purpose: grant.purpose,
        fieldsDisclosed: grant.fieldsDisclosed.join('; '),
        grantedOn: grant.grantedOn,
        status: grant.status
      }))
    );
    logEvent(`Exported the consent register (${consentGrants.length} rows)`, 'consent', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Consent" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">Consent</h1>
        <p className="mt-1.5 text-[14.5px] text-gray-600">
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
          canMutate={mutable}
          onRevoke={(id) => revokeConsent(id, profile.name)}
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
