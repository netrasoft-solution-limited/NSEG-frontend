export type DocumentKind =
'cac-certificate' |
'tin-certificate' |
'sector-license' |
'bank-reference' |
'iso-certificate' |
'incorporation-certificate' |
'nin-slip' |
'professional-credential';

export type MalwareScanStatus = 'clean' | 'scanning' | 'flagged';
export type DocumentVerificationStatus = 'verified' | 'pending' | 'rejected';

export interface VaultDocument {
  id: string;
  actorId: string;
  kind: DocumentKind;
  fileName: string;
  /** Mock SHA-256 — the vault indexes by hash so the same certificate can be reused by
   * reference across portals instead of re-uploaded. */
  sha256: string;
  uploadedOn: string;
  malwareScan: MalwareScanStatus;
  verification: DocumentVerificationStatus;
  /** Days until a time-bound credential lapses — see the relative-day convention in
   * data/actors.ts. */
  expiresInDays?: number;
}

export const documentKindLabels: Record<DocumentKind, string> = {
  'cac-certificate': 'CAC Registration Certificate',
  'tin-certificate': 'Tax Identification Number Certificate',
  'sector-license': 'Sector Regulatory License',
  'bank-reference': 'Bank Reference Letter',
  'iso-certificate': 'ISO 27001 Certificate',
  'incorporation-certificate': 'Certificate of Incorporation',
  'nin-slip': 'National Identification Number Slip',
  'professional-credential': 'Professional Credential'
};

export const vaultDocuments: VaultDocument[] = [
{
  id: 'doc-01',
  actorId: 'act-03',
  kind: 'sector-license',
  fileName: 'coren-practice-license-2026.pdf',
  sha256: '9f2c7a1e4b8d6f0a3c5e9b7d1f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a',
  uploadedOn: '2026-08-14',
  malwareScan: 'clean',
  verification: 'verified',
  expiresInDays: 16
},
{
  id: 'doc-02',
  actorId: 'act-04',
  kind: 'cac-certificate',
  fileName: 'northbridge-cac-cert.pdf',
  sha256: '1a3b5c7d9e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b',
  uploadedOn: '2026-09-10',
  malwareScan: 'clean',
  verification: 'pending'
},
{
  id: 'doc-05',
  actorId: 'act-05',
  kind: 'iso-certificate',
  fileName: 'kaduna-textiles-iso27001.pdf',
  sha256: '3c5e7f9a1b3d5f7a9c1e3f5a7c9e1f3a5c7e9f1a3c5e7f9a1c3e5f7a9c1e3f5a',
  uploadedOn: '2026-08-29',
  malwareScan: 'clean',
  verification: 'verified',
  expiresInDays: 12
},
{
  id: 'doc-07',
  actorId: 'act-07',
  kind: 'tin-certificate',
  fileName: 'ibadan-creative-tin.pdf',
  sha256: '5e7a9c1f3b5d7f9a1c3e5f7a9c1e3f5a7c9e1f3a5c7e9f1a3c5e7f9a1c3e5f7a',
  uploadedOn: '2026-09-12',
  malwareScan: 'clean',
  verification: 'pending'
},
{
  id: 'doc-09a',
  actorId: 'act-09',
  kind: 'incorporation-certificate',
  fileName: 'coastal-legal-incorporation.pdf',
  sha256: '7c9e1f3a5b7d9f1a3c5e7f9a1c3e5f7a9c1e3f5a7c9e1f3a5c7e9f1a3c5e7f9a',
  uploadedOn: '2026-08-01',
  malwareScan: 'flagged',
  verification: 'rejected'
},
{
  id: 'doc-09b',
  actorId: 'act-09',
  kind: 'bank-reference',
  fileName: 'coastal-legal-bank-ref.pdf',
  sha256: '9c1e3f5a7b9d1f3a5c7e9f1a3c5e7f9a1c3e5f7a9c1e3f5a7c9e1f3a5c7e9f1a',
  uploadedOn: '2026-09-07',
  malwareScan: 'clean',
  verification: 'pending'
},
{
  id: 'doc-10',
  actorId: 'act-10',
  kind: 'sector-license',
  fileName: 'savannah-healthtech-hipaa-attestation.pdf',
  sha256: '1e3f5a7c9b1d3f5a7c9e1f3a5c7e9f1a3c5e7f9a1c3e5f7a9c1e3f5a7c9e1f3a',
  uploadedOn: '2026-08-20',
  malwareScan: 'clean',
  verification: 'verified',
  expiresInDays: 4
},
{
  id: 'doc-12',
  actorId: 'act-12',
  kind: 'cac-certificate',
  fileName: 'plateau-media-cac-cert.pdf',
  sha256: '3f5a7c9e1b3d5f7a9c1e3f5a7c9e1f3a5c7e9f1a3c5e7f9a1c3e5f7a9c1e3f5a',
  uploadedOn: '2026-08-27',
  malwareScan: 'clean',
  verification: 'pending'
},
{
  id: 'doc-13',
  actorId: 'act-02',
  kind: 'sector-license',
  fileName: 'lagos-delivery-haulage-safety-cert.pdf',
  sha256: '5a7c9e1f3b5d7f9a1c3e5f7a9c1e3f5a7c9e1f3a5c7e9f1a3c5e7f9a1c3e5f7a',
  uploadedOn: '2026-09-13',
  malwareScan: 'clean',
  verification: 'pending'
},
{
  id: 'doc-14a',
  actorId: 'act-14',
  kind: 'nin-slip',
  fileName: 'tunde-bakare-nin-verification.pdf',
  sha256: '7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d',
  uploadedOn: '2026-09-13',
  malwareScan: 'clean',
  verification: 'verified'
},
{
  id: 'doc-14b',
  actorId: 'act-14',
  kind: 'professional-credential',
  fileName: 'tunde-bakare-cloud-data-engineer-cert.pdf',
  sha256: '9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f',
  uploadedOn: '2026-09-14',
  malwareScan: 'clean',
  verification: 'pending'
},
{
  id: 'doc-15',
  actorId: 'act-13',
  kind: 'professional-credential',
  fileName: 'chiamaka-obi-ux-research-certification.pdf',
  sha256: '2c4e6a8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c',
  uploadedOn: '2026-08-19',
  malwareScan: 'clean',
  verification: 'verified',
  expiresInDays: 210
}];
