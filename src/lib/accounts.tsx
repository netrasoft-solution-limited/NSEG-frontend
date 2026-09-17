import React, { createContext, useContext, useMemo, useState } from 'react';
import { actors as seededActors, toActor, type Actor, type ActorRecord, type CapabilityProfile } from '../data/actors';
import { buyers as seededBuyers, type Buyer } from '../data/buyers';
import type { EvidenceKey, ExporterTrack } from '../data/trustTiers';

/**
 * Accounts created through the public sign-up flows, plus who is signed in to each workspace.
 * App-wide so a new registration shows up in the console's registries and verification queues,
 * and the officer's decision comes back to the account. Session-scoped: a reload clears it.
 *
 * There is no real authentication here. Passwords are never stored or checked; sign-in only
 * matches an email to an account. In production this is FND-01's single OIDC provider.
 */

export interface ExporterRegistration {
  fullName: string;
  email: string;
  track: ExporterTrack;
  /** Registered business name for firms; the person's own name for individuals. */
  displayName: string;
  cacNumber?: string;
  tin?: string;
  nin?: string;
  professionalCredential?: string;
  sectorCode: string;
  capability: CapabilityProfile;
}

export interface BuyerRegistration {
  fullName: string;
  email: string;
  jobTitle: string;
  companyName: string;
  country: string;
  region: string;
  sectorsOfInterest: string[];
}

export type RegistryType = 'lei' | 'companies-house' | 'vies' | 'other';

export const registryTypeLabels: Record<RegistryType, string> = {
  lei: 'LEI (GLEIF)',
  'companies-house': 'UK Companies House number',
  vies: 'EU VAT number (VIES)',
  other: 'Other national business registry'
};

type Decision = 'approved' | 'rejected';

interface AccountsValue {
  exporters: Actor[];
  buyers: Buyer[];
  isNewAccount: (id: string) => boolean;
  findExporterByEmail: (email: string) => Actor | undefined;
  findBuyerByEmail: (email: string) => Buyer | undefined;
  /** FND-02 near-duplicate check on name. */
  similarExporterName: (name: string) => Actor | undefined;
  signedInExporterId: string | null;
  signedInBuyerId: string | null;
  signInExporter: (id: string) => void;
  signOutExporter: () => void;
  signInBuyer: (id: string) => void;
  signOutBuyer: () => void;
  registerExporter: (registration: ExporterRegistration) => Actor;
  registerBuyer: (registration: BuyerRegistration) => Buyer;
  requestBuyerVerification: (buyerId: string, registry: RegistryType, identifier: string) => void;
  /** SUP-01 deferred verification: add an identifier skipped at registration. */
  submitExporterEvidence: (actorId: string, key: EvidenceKey, value: string) => void;
  decideExporterVerification: (id: string, decision: Decision) => void;
  decideBuyerVerification: (id: string, decision: Decision) => void;
}

const AccountsContext = createContext<AccountsValue | null>(null);

const normalise = (value: string) => value.trim().toLowerCase().replace(/\b(ltd|limited|plc|inc|llc|bv|nig|ng)\b\.?/g, '').replace(/[^a-z0-9]/g, '');

const randomDigits = (length: number) =>
Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

const registeredOnLabel = () =>
new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function AccountsProvider({ children }: {children: React.ReactNode;}) {
  const [exporterRecords, setExporterRecords] = useState<ActorRecord[]>([]);
  const [newBuyers, setNewBuyers] = useState<Buyer[]>([]);
  const [signedInExporterId, setSignedInExporterId] = useState<string | null>(null);
  const [signedInBuyerId, setSignedInBuyerId] = useState<string | null>(null);

  const value = useMemo<AccountsValue>(() => {
    const exporters = [...exporterRecords.map(toActor), ...seededActors];
    const buyers = [...newBuyers, ...seededBuyers];
    const newIds = new Set([...exporterRecords.map((item) => item.id), ...newBuyers.map((item) => item.id)]);

    return {
      exporters,
      buyers,
      isNewAccount: (id) => newIds.has(id),
      findExporterByEmail: (email) => exporters.find((item) => item.email.toLowerCase() === email.trim().toLowerCase()),
      findBuyerByEmail: (email) => buyers.find((item) => item.email.toLowerCase() === email.trim().toLowerCase()),
      similarExporterName: (name) => {
        const key = normalise(name);
        return key ? exporters.find((item) => normalise(item.name) === key) : undefined;
      },
      signedInExporterId,
      signedInBuyerId,
      signInExporter: setSignedInExporterId,
      signOutExporter: () => setSignedInExporterId(null),
      signInBuyer: setSignedInBuyerId,
      signOutBuyer: () => setSignedInBuyerId(null),

      registerExporter: (registration) => {
        const pendingEvidence: EvidenceKey[] =
        registration.track === 'firm' ?
        [...(registration.cacNumber ? ['cac' as const] : []), ...(registration.tin ? ['tin' as const] : [])] :
        [
        ...(registration.nin ? ['nin' as const] : []),
        ...(registration.professionalCredential ? ['professional-credential' as const] : [])];

        const duplicate = exporters.find((item) => normalise(item.name) === normalise(registration.displayName));
        const submitted = [
        registration.cacNumber && `CAC ${registration.cacNumber}`,
        registration.tin && `TIN ${registration.tin}`,
        registration.nin && `NIN ending ${registration.nin.slice(-4)}`,
        registration.professionalCredential && `credential "${registration.professionalCredential}"`].
        filter(Boolean).join(', ');

        const record: ActorRecord = {
          id: `act-new-${Date.now()}`,
          name: registration.displayName,
          contactName: registration.fullName.trim(),
          email: registration.email.trim(),
          natepId: `NT-${registration.track === 'firm' ? 'B' : 'I'}26-${randomDigits(5)}`,
          track: registration.track,
          sectorCode: registration.sectorCode,
          registeredOn: registeredOnLabel(),
          lastActiveDaysAgo: 0,
          matchCount: 0,
          suspended: false,
          isNew: true,
          verifiedEvidence: [],
          pendingEvidence,
          diagnostic: { exportCapacity: 0, financialStability: 0, qualitySystems: 0, crossBorderExperience: 0, legalIpProtection: 0 },
          verificationQueue: duplicate ? 'flagged' : pendingEvidence.length > 0 ? 'pending' : 'none',
          verificationNote: duplicate ?
          `Possible duplicate of ${duplicate.name} (${duplicate.natepId}) — data steward review before verification.` :
          pendingEvidence.length > 0 ?
          `Submitted at registration: ${submitted}. Registry lookup queued for officer confirmation.` :
          undefined,
          capability: registration.capability
        };
        setExporterRecords((current) => [record, ...current]);
        setSignedInExporterId(record.id);
        return toActor(record);
      },

      registerBuyer: (registration) => {
        const buyer: Buyer = {
          id: `byr-new-${Date.now()}`,
          name: registration.companyName.trim(),
          referenceId: `BYR-26-${randomDigits(5)}`,
          email: registration.email.trim(),
          region: registration.region,
          registeredOn: registeredOnLabel(),
          tier: 'registered',
          opportunitiesPosted: 0,
          verificationQueue: 'none',
          contactName: registration.fullName.trim(),
          jobTitle: registration.jobTitle.trim(),
          country: registration.country,
          sectorsOfInterest: registration.sectorsOfInterest
        };
        setNewBuyers((current) => [buyer, ...current]);
        setSignedInBuyerId(buyer.id);
        return buyer;
      },

      requestBuyerVerification: (buyerId, registry, identifier) =>
      setNewBuyers((current) =>
      current.map((buyer) =>
      buyer.id === buyerId ?
      {
        ...buyer,
        verificationQueue: 'pending',
        verificationNote: `${registryTypeLabels[registry]} ${identifier} submitted by the buyer. No automatic registry match yet — awaiting officer review.`
      } :
      buyer
      )
      ),

      submitExporterEvidence: (actorId, key, value) =>
      setExporterRecords((current) =>
      current.map((record) => {
        if (record.id !== actorId) return record;
        const shown = key === 'nin' ? `NIN ending ${value.slice(-4)}` : `${key.toUpperCase().replace('-', ' ')} ${value}`;
        const pendingEvidence = Array.from(new Set([...(record.pendingEvidence ?? []), key]));
        return {
          ...record,
          pendingEvidence,
          verificationQueue: record.verificationQueue === 'flagged' ? 'flagged' : 'pending',
          verificationNote:
          record.verificationQueue !== 'none' && record.verificationNote ?
          `${record.verificationNote} Also submitted: ${shown}.` :
          `Submitted from the workspace: ${shown}. Registry lookup queued for officer confirmation.`
        };
      })
      ),

      decideExporterVerification: (id, decision) =>
      setExporterRecords((current) =>
      current.map((record) =>
      record.id === id ?
      {
        ...record,
        verifiedEvidence:
        decision === 'approved' ?
        Array.from(new Set([...record.verifiedEvidence, ...(record.pendingEvidence ?? [])])) :
        record.verifiedEvidence,
        pendingEvidence: [],
        verificationQueue: 'none',
        verificationNote:
        decision === 'rejected' ?
        'The details submitted could not be verified. Check them and submit again — your account stays open.' :
        undefined
      } :
      record
      )
      ),

      decideBuyerVerification: (id, decision) =>
      setNewBuyers((current) =>
      current.map((buyer) =>
      buyer.id === id ?
      {
        ...buyer,
        tier: decision === 'approved' ? 'registry-verified' : buyer.tier,
        verificationQueue: 'none',
        verificationNote:
        decision === 'rejected' ?
        'We could not match your company to that registry entry. Check the identifier and try again — your account stays open.' :
        undefined
      } :
      buyer
      )
      )
    };
  }, [exporterRecords, newBuyers, signedInExporterId, signedInBuyerId]);

  return <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>;
}

export function useAccounts(): AccountsValue {
  const context = useContext(AccountsContext);
  if (!context) throw new Error('useAccounts must be used within an AccountsProvider');
  return context;
}
