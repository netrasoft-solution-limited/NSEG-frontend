import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Actor } from '../data/actors';
import { useAccounts } from './accounts';
import type { ReadinessParameterScores } from './readinessScore';
import type { SupplyModeId, TargetMarketId } from '../data/regulations';
import type { ExporterTrack } from '../data/trustTiers';

export interface WizardAnswers {
  track: ExporterTrack;
  sectorCode?: string;
  mode?: SupplyModeId;
  market?: TargetMarketId;
}

/** REG-04: everything here is private to the exporter. Nothing leaves this state unless
 * they explicitly share a snapshot or submit a diagnostic for review. */
export interface PrivateWorkspace {
  wizard: WizardAnswers;
  diagnosticDraft: ReadinessParameterScores;
  settlementChecks: string[];
  sharedWithOfficer: boolean;
  diagnosticSubmitted: boolean;
}

interface ExporterSessionValue {
  /** Undefined until someone signs in — workspace routes are guarded, see App.tsx. */
  actor: Actor | undefined;
  signOut: () => void;
  workspace: PrivateWorkspace;
  updateWorkspace: (patch: Partial<PrivateWorkspace>) => void;
}

export const settlementCheckItems: { id: string; label: string; detail: string }[] = [
{
  id: 'dom-account',
  label: 'Domiciliary account open',
  detail: 'A foreign currency account in your own or your company’s name.'
},
{
  id: 'bank-briefed',
  label: 'Bank trade desk briefed',
  detail: 'Your bank knows to expect export receipts and which client they come from.'
},
{
  id: 'invoice-terms',
  label: 'Invoice currency and payment terms decided',
  detail: 'Agreed before work starts, so escrow and milestones line up with the contract.'
},
{
  id: 'tin-on-invoice',
  label: 'TIN on your invoice template',
  detail: 'Every export invoice carries your tax identification number.'
},
{
  id: 'repatriation-plan',
  label: 'Plan to bring proceeds home in time',
  detail: 'Receipts come back through a Nigerian bank within the repatriation window.'
}];


function initialWorkspace(actor: Actor): PrivateWorkspace {
  const seededChecks =
  actor.tier === 'delivery-verified' ?
  settlementCheckItems.length :
  actor.tier === 'identity-verified' ?
  2 :
  0;
  return {
    wizard: {
      track: actor.track,
      sectorCode: actor.sectorCode,
      mode: actor.capability?.modes[0],
      market: actor.capability?.markets[0]
    },
    diagnosticDraft: { ...actor.diagnostic },
    settlementChecks: settlementCheckItems.slice(0, seededChecks).map((item) => item.id),
    sharedWithOfficer: false,
    diagnosticSubmitted: false
  };
}

const ExporterSessionContext = createContext<ExporterSessionValue | null>(null);

/** The signed-in exporter and their private workspace state, kept per account for the session. */
export function ExporterSessionProvider({ children }: {children: React.ReactNode;}) {
  const accounts = useAccounts();
  const [workspaces, setWorkspaces] = useState<Record<string, PrivateWorkspace>>({});

  const actor = accounts.exporters.find((item) => item.id === accounts.signedInExporterId);
  const emptyWorkspace = { wizard: { track: 'firm' }, diagnosticDraft: { exportCapacity: 0, financialStability: 0, qualitySystems: 0, crossBorderExperience: 0, legalIpProtection: 0 }, settlementChecks: [], sharedWithOfficer: false, diagnosticSubmitted: false } as PrivateWorkspace;
  const workspace = actor ? workspaces[actor.id] ?? initialWorkspace(actor) : emptyWorkspace;

  const value = useMemo<ExporterSessionValue>(
    () => ({
      actor,
      signOut: accounts.signOutExporter,
      workspace,
      updateWorkspace: (patch) => {
        if (!actor) return;
        setWorkspaces((current) => ({
          ...current,
          [actor.id]: { ...(current[actor.id] ?? initialWorkspace(actor)), ...patch }
        }));
      }
    }),
    [actor, workspace, accounts.signOutExporter]
  );

  return <ExporterSessionContext.Provider value={value}>{children}</ExporterSessionContext.Provider>;
}

/** For pages behind the sign-in guard: the actor is always present there. */
export function useExporterSession(): ExporterSessionValue & {actor: Actor;} {
  const context = useContext(ExporterSessionContext);
  if (!context) throw new Error('useExporterSession must be used inside ExporterSessionProvider');
  if (!context.actor) throw new Error('useExporterSession needs a signed-in exporter — wrap the route in RequireExporter');
  return context as ExporterSessionValue & {actor: Actor;};
}
