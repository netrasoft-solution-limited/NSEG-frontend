import type { DocumentKind, VaultDocument } from '../data/vaultDocuments';

/** Sectoral/professional certifications (COREN, NITDA/NDPC, CIBN, ISO 27001, etc.) are a
 * subset of the Evidence Vault, not a separate store — BRD §4.2 verifies and badges these
 * specifically, distinct from corporate registration documents (CAC/TIN/incorporation)
 * that establish the entity rather than its professional competence. */
const certificationKinds: DocumentKind[] = ['sector-license', 'iso-certificate'];

export function isCertificationDocument(document: VaultDocument): boolean {
  return certificationKinds.includes(document.kind);
}

export function certifyingBodyFor(document: VaultDocument): string {
  if (document.kind === 'iso-certificate') return 'ISO';
  if (document.fileName.includes('coren')) return 'COREN';
  if (document.fileName.includes('hipaa')) return 'Sector data-protection authority';
  if (document.fileName.includes('haulage') || document.fileName.includes('safety')) return 'NUPRC/haulage safety authority';
  return 'Sector regulator';
}

export type RenewalUrgency = 'urgent' | 'warning' | 'none';

export function renewalUrgency(expiresInDays: number | undefined): RenewalUrgency {
  if (expiresInDays === undefined) return 'none';
  if (expiresInDays <= 7) return 'urgent';
  if (expiresInDays <= 30) return 'warning';
  return 'none';
}
