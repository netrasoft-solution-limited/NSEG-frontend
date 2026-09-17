import React from 'react';
import { AlertTriangleIcon, AwardIcon, BadgeCheckIcon, HourglassIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { CertificationRegistry } from '../components/console/CertificationRegistry';
import { actors } from '../data/actors';
import { isCertificationDocument, renewalUrgency } from '../lib/certification';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { canMutate } from '../lib/permissions';
import { useDocumentVerification } from '../lib/documentVerification';

const actorsById = new Map(actors.map((actor) => [actor.id, actor]));
export function ConsoleCertifications() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const mutable = canMutate(profile.role);
  const { documents, decide, remindersSent, sendRenewalReminder } = useDocumentVerification();
  const certificationDocuments = documents.filter(isCertificationDocument);

  const pendingCount = certificationDocuments.filter((document) => document.verification === 'pending').length;
  const certifiedCount = certificationDocuments.filter((document) => document.verification === 'verified').length;

  const renewalWarningCount = certificationDocuments.filter(
    (document) => document.verification === 'verified' && renewalUrgency(document.expiresInDays) !== 'none'
  ).length;

  const urgentCount = certificationDocuments.filter(
    (document) => document.verification === 'verified' && renewalUrgency(document.expiresInDays) === 'urgent'
  ).length;

  const handleExport = () => {
    downloadCsv(
      'nseg-certifications.csv',
      certificationDocuments.map((document) => ({
        exporter: actorsById.get(document.actorId)?.name ?? document.actorId,
        credential: document.kind,
        uploadedOn: document.uploadedOn,
        status: document.verification,
        expiresInDays: document.expiresInDays ?? ''
      }))
    );
    logEvent(`Exported the certification registry (${certificationDocuments.length} rows)`, 'compliance', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Certifications" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">Certifications</h1>
        <p className="mt-1.5 text-[14.5px] text-gray-600">
          Verify sector-specific professional credentials before they badge an exporter's public
          trust profile — and catch renewals before a badge quietly lapses.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={HourglassIcon}
          label="Awaiting issuance"
          value={pendingCount.toString()}
          delta="Needs review"
          positive={false}
          accent="gold" />

        <StatCard
          icon={BadgeCheckIcon}
          label="Certified"
          value={certifiedCount.toString()}
          delta="Badged"
          positive
          accent="gate" />

        <StatCard
          icon={AlertTriangleIcon}
          label="Renewal warnings"
          value={renewalWarningCount.toString()}
          delta="Within 30 days"
          positive={false}
          accent="rose" />

        <StatCard
          icon={AwardIcon}
          label="Urgent"
          value={urgentCount.toString()}
          delta="Within 7 days"
          positive={false}
          accent="sky" />

      </div>

      <div className="mt-6">
        <CertificationRegistry
          documents={certificationDocuments}
          actorsById={actorsById}
          remindersSent={remindersSent}
          canMutate={mutable}
          onDecide={(id, status) => decide(id, status, profile.name)}
          onSendReminder={(id) => sendRenewalReminder(id, profile.name)} />

      </div>
    </ConsoleLayout>);

}
