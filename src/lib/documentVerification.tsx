import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  documentKindLabels,
  vaultDocuments as seededDocuments,
  type DocumentVerificationStatus,
  type VaultDocument } from
'../data/vaultDocuments';
import { actors } from '../data/actors';
import { isCertificationDocument } from './certification';
import { useAuditLog } from './auditLog';

/**
 * Officer decisions on uploaded evidence, held once for the whole console.
 *
 * Certifications are a subset of the vault, not a separate store (BRD §4.2 — see
 * lib/certification.ts), so a decision taken on either surface has to be the same decision.
 * Keeping it per page meant verifying a document in the vault left it unverified in the
 * certification registry, and neither knew about the other.
 */
interface DocumentVerificationValue {
  /** Seeded documents with live decisions applied. */
  documents: VaultDocument[];
  statusOf: (document: VaultDocument) => DocumentVerificationStatus;
  decide: (id: string, status: DocumentVerificationStatus, officer: string) => void;
  remindersSent: Record<string, boolean>;
  sendRenewalReminder: (id: string, officer: string) => void;
}

const DocumentVerificationContext = createContext<DocumentVerificationValue | null>(null);

const actorName = (actorId: string) => actors.find((actor) => actor.id === actorId)?.name ?? 'an exporter';

export function DocumentVerificationProvider({ children }: {children: React.ReactNode;}) {
  const { logEvent } = useAuditLog();
  const [decisions, setDecisions] = useState<Record<string, DocumentVerificationStatus>>({});
  const [remindersSent, setRemindersSent] = useState<Record<string, boolean>>({});

  const value = useMemo<DocumentVerificationValue>(() => {
    const statusOf = (document: VaultDocument) => decisions[document.id] ?? document.verification;

    return {
      documents: seededDocuments.map((document) => ({ ...document, verification: statusOf(document) })),
      statusOf,
      decide: (id, status, officer) => {
        setDecisions((current) => ({ ...current, [id]: status }));
        const document = seededDocuments.find((item) => item.id === id);
        if (!document) return;
        const who = actorName(document.actorId);
        // A certification decision badges an exporter's profile; a vault decision confirms a
        // document. Same record, so the same log — worded for what the officer actually did.
        const message = isCertificationDocument(document) ?
        status === 'verified' ?
        `Issued a certification badge to ${who}` :
        `Rejected a certification submission from ${who}` :
        `${status === 'verified' ? 'Verified' : 'Rejected'} ${documentKindLabels[document.kind]} for ${who}`;
        logEvent(message, 'vault', officer);
      },
      remindersSent,
      sendRenewalReminder: (id, officer) => {
        setRemindersSent((current) => ({ ...current, [id]: true }));
        const document = seededDocuments.find((item) => item.id === id);
        if (!document) return;
        logEvent(
          `Sent a renewal reminder to ${actorName(document.actorId)} for a certification expiring in ${document.expiresInDays ?? '?'}d`,
          'vault',
          officer
        );
      }
    };
  }, [decisions, remindersSent, logEvent]);

  return <DocumentVerificationContext.Provider value={value}>{children}</DocumentVerificationContext.Provider>;
}

export function useDocumentVerification(): DocumentVerificationValue {
  const context = useContext(DocumentVerificationContext);
  if (!context) throw new Error('useDocumentVerification must be used within a DocumentVerificationProvider');
  return context;
}
