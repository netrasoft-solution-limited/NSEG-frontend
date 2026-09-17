import React, { createContext, useContext, useMemo, useState } from 'react';
import { actors, type Actor } from '../data/actors';
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
  actor: Actor;
  setActorId: (id: string) => void;
  workspace: PrivateWorkspace;
  updateWorkspace: (patch: Partial<PrivateWorkspace>) => void;
}

/** Lagos Delivery Collective: Identity Verified with a score already past 80, so the only
 * thing between them and the next tier is evidence — the most instructive default. */
const DEFAULT_ACTOR_ID = 'act-02';

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
    wizard: { track: actor.track, sectorCode: actor.sectorCode },
    diagnosticDraft: { ...actor.diagnostic },
    settlementChecks: settlementCheckItems.slice(0, seededChecks).map((item) => item.id),
    sharedWithOfficer: false,
    diagnosticSubmitted: false
  };
}

const ExporterSessionContext = createContext<ExporterSessionValue | null>(null);

/** Stands in for a signed-in exporter. The "viewing as" switch is a prototype affordance so
 * reviewers can see the workspace from each tier and track — not a real account model. */
export function ExporterSessionProvider({ children }: {children: React.ReactNode;}) {
  const [actorId, setActorId] = useState(DEFAULT_ACTOR_ID);
  const [workspaces, setWorkspaces] = useState<Record<string, PrivateWorkspace>>({});

  const actor = actors.find((item) => item.id === actorId) ?? actors[0];
  const workspace = workspaces[actor.id] ?? initialWorkspace(actor);

  const value = useMemo<ExporterSessionValue>(
    () => ({
      actor,
      setActorId,
      workspace,
      updateWorkspace: (patch) =>
      setWorkspaces((current) => ({
        ...current,
        [actor.id]: { ...(current[actor.id] ?? initialWorkspace(actor)), ...patch }
      }))
    }),
    [actor, workspace]
  );

  return <ExporterSessionContext.Provider value={value}>{children}</ExporterSessionContext.Provider>;
}

export function useExporterSession(): ExporterSessionValue {
  const context = useContext(ExporterSessionContext);
  if (!context) throw new Error('useExporterSession must be used inside ExporterSessionProvider');
  return context;
}
