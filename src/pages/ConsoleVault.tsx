import React from 'react';
import { AlertTriangleIcon, CheckCircleIcon, ClockIcon, FileTextIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { EvidenceVault } from '../components/console/EvidenceVault';
import { documentKindLabels } from '../data/vaultDocuments';
import { actors } from '../data/actors';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { canMutate } from '../lib/permissions';
import { useDocumentVerification } from '../lib/documentVerification';

const actorsById = new Map(actors.map((actor) => [actor.id, actor]));

export function ConsoleVault() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const { documents: vaultDocuments, decide } = useDocumentVerification();

  const pending = vaultDocuments.filter((doc) => doc.verification === 'pending').length;
  const verified = vaultDocuments.filter((doc) => doc.verification === 'verified').length;
  const flaggedScans = vaultDocuments.filter((doc) => doc.malwareScan === 'flagged').length;
  const expiringSoon = vaultDocuments.filter((doc) => doc.expiresInDays !== undefined && doc.expiresInDays <= 30).length;

  const handleExport = () => {
    downloadCsv(
      'nseg-evidence-vault.csv',
      vaultDocuments.map((doc) => ({
        exporter: actorsById.get(doc.actorId)?.name ?? doc.actorId,
        documentKind: documentKindLabels[doc.kind],
        fileName: doc.fileName,
        sha256: doc.sha256,
        uploadedOn: doc.uploadedOn,
        malwareScan: doc.malwareScan,
        verification: doc.verification
      }))
    );
    logEvent(`Exported the evidence vault register (${vaultDocuments.length} rows)`, 'vault', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Vault" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">Evidence Vault</h1>
        <p className="mt-1.5 text-[14.5px] text-gray-600">
          Verify uploaded credentials once — reuse-by-reference means no exporter re-uploads the same document twice.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileTextIcon}
          label="Total documents"
          value={vaultDocuments.length.toString()}
          delta="Vault"
          positive
          accent="sky" />

        <StatCard
          icon={ClockIcon}
          label="Pending review"
          value={pending.toString()}
          delta="Needs review"
          positive
          accent="gold" />

        <StatCard
          icon={CheckCircleIcon}
          label="Verified"
          value={verified.toString()}
          delta="Vault"
          positive
          accent="gate" />

        <StatCard
          icon={AlertTriangleIcon}
          label="Flagged scans / expiring soon"
          value={`${flaggedScans} / ${expiringSoon}`}
          delta="Needs attention"
          positive={false}
          accent="rose" />

      </div>

      <div className="mt-6">
        <EvidenceVault
          documents={vaultDocuments}
          actorsById={actorsById}
          canMutate={canMutate(profile.role)}
          onDecide={(id, status) => decide(id, status, profile.name)} />

      </div>
    </ConsoleLayout>);

}
