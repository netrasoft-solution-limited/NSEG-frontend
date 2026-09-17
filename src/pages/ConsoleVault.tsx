import React, { useState } from 'react';
import { AlertTriangleIcon, CheckCircleIcon, ClockIcon, FileTextIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { EvidenceVault } from '../components/console/EvidenceVault';
import { documentKindLabels, vaultDocuments, type DocumentVerificationStatus } from '../data/vaultDocuments';
import { actors } from '../data/actors';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { canMutate } from '../lib/permissions';

const actorsById = new Map(actors.map((actor) => [actor.id, actor]));

export function ConsoleVault() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const [decisions, setDecisions] = useState<Record<string, DocumentVerificationStatus>>({});

  const statusOf = (id: string, fallback: DocumentVerificationStatus) => decisions[id] ?? fallback;

  const pending = vaultDocuments.filter((doc) => statusOf(doc.id, doc.verification) === 'pending').length;
  const verified = vaultDocuments.filter((doc) => statusOf(doc.id, doc.verification) === 'verified').length;
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
        verification: statusOf(doc.id, doc.verification)
      }))
    );
    logEvent(`Exported the evidence vault register (${vaultDocuments.length} rows)`, 'vault', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Vault" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">Evidence Vault</h1>
        <p className="mt-1 text-[13.5px] text-gray-500">
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
          decisions={decisions}
          canMutate={canMutate(profile.role)}
          onDecide={(id, status) => {
            setDecisions((current) => ({ ...current, [id]: status }));
            const doc = vaultDocuments.find((item) => item.id === id);
            const actor = doc ? actorsById.get(doc.actorId) : undefined;
            logEvent(
              `${status === 'verified' ? 'Verified' : 'Rejected'} ${doc ? documentKindLabels[doc.kind] : 'a document'} for ${actor?.name ?? 'an exporter'}`,
              'vault',
              profile.name
            );
          }} />

      </div>
    </ConsoleLayout>);

}
