import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  regulatoryRequirements as seededRequirements,
  requiredSignOffs,
  signOffAgency,
  type RegulatoryRequirement } from
'../data/regulations';
import type { OfficerRole } from './officerProfile';
import { actors } from '../data/actors';
import { opportunities } from '../data/opportunities';
import { readinessSubmissions } from '../data/readinessSubmissions';
import { buildAssertion, buildAssertionBasis, type ReadinessAssertion } from './readinessAssertions';

/** The authored content of a requirement — everything except publishing metadata. */
export type RequirementContent = Omit<
  RegulatoryRequirement,
  'id' | 'status' | 'lastReviewedOn' | 'reviewDue' | 'version' | 'signedOffBy' | 'signedOffOn'>;


export type DraftStage = 'draft' | 'in-sign-off' | 'returned' | 'published';

export interface SignOff {
  name: string;
  on: string;
}

/** REG-02: a requirement being written or revised. Never visible to exporters until published. */
export interface RequirementDraft {
  id: string;
  /** Set when this revises a published requirement. */
  supersedesId?: string;
  content: RequirementContent;
  stage: DraftStage;
  draftedBy: string;
  updatedOn: string;
  signOffs: SignOff[];
  returnedBy?: string;
  returnNote?: string;
  publishedAs?: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const diffLabels: Partial<Record<keyof RequirementContent, string>> = {
  title: 'title',
  summary: 'summary',
  officialChannel: 'official channel',
  evidenceExpected: 'evidence expected',
  sourceCitation: 'source citation',
  effectiveOn: 'effective date',
  nextReviewOn: 'review date',
  appliesTo: 'applicability',
  category: 'category',
  sectorCode: 'sector'
};

/** Plain-language names of the fields a revision changed. */
export function diffContent(content: RequirementContent, previous?: RegulatoryRequirement): string[] {
  if (!previous) return [];
  return (Object.keys(diffLabels) as (keyof RequirementContent)[]).
  filter((key) => JSON.stringify(content[key]) !== JSON.stringify(previous[key])).
  map((key) => diffLabels[key]!);
}

/** REG-05: what one publication touched. Computed once, at the moment of publishing. */
export interface ChangeImpact {
  id: string;
  requirementId: string;
  supersededId?: string;
  title: string;
  authority: string;
  publishedOn: string;
  changedFields: string[];
  /** Exporters whose pathway includes this requirement (by sector and exporter type). */
  pathwayActorIds: string[];
  opportunityIds: string[];
  flaggedAssertionIds: string[];
}

export type ReviewTaskKind = 'revalidate-assertion' | 'review-opportunities';

export interface ReviewTask {
  id: string;
  impactId: string;
  kind: ReviewTaskKind;
  /** Assertion id for revalidation tasks. */
  targetId?: string;
  label: string;
  status: 'open' | 'done';
  closedBy?: string;
  closedOn?: string;
  resolution?: string;
}

function contentOf(requirement: RegulatoryRequirement): RequirementContent {
  const { id, status, lastReviewedOn, reviewDue, version, signedOffBy, signedOffOn, ...content } = requirement;
  return content;
}

const byId = (id: string) => seededRequirements.find((item) => item.id === id)!;

/** The two submissions already issued in readinessSubmissions.ts, as full assertions. */
const seededAssertions: ReadinessAssertion[] = readinessSubmissions.
filter((submission) => submission.assertionStatus === 'issued').
map((submission) =>
buildAssertion(
  actors.find((actor) => actor.id === submission.actorId)!,
  seededRequirements,
  'Ada Chukwu',
  submission.submittedOn,
  submission.evidenceGaps
)
);

const seededDrafts: RequirementDraft[] = [
{
  id: 'draft-01',
  supersedesId: 'reg-07',
  content: {
    ...contentOf(byId('reg-07')),
    summary:
    'Foreign currency you earn from an export must come back through a Nigerian bank within the window in the current CBN circular. Your bank confirms the deadline for each receipt.',
    evidenceExpected: 'Bank credit advice matched to the export invoice, showing the receipt date',
    effectiveOn: '2026-10-01',
    nextReviewOn: '2027-04-01'
  },
  stage: 'in-sign-off',
  draftedBy: 'Tolu Adeyemi',
  updatedOn: '2026-09-12',
  signOffs: [{ name: 'Musa Ibrahim', on: '2026-09-15' }]
},
{
  id: 'draft-02',
  supersedesId: 'reg-02',
  content: {
    ...contentOf(byId('reg-02')),
    summary:
    'Before you move personal data about people in Nigeria to a client abroad, record the legal basis for the transfer and the safeguards in your contract.',
    evidenceExpected: 'Transfer basis record and a signed data processing agreement',
    effectiveOn: '2026-11-01',
    nextReviewOn: '2027-05-01'
  },
  stage: 'in-sign-off',
  draftedBy: 'Tolu Adeyemi',
  updatedOn: '2026-09-14',
  signOffs: []
},
{
  id: 'draft-03',
  content: {
    title: 'Keep engagement records for incentive claims',
    category: 'fiscal',
    authority: 'NATEP Secretariat',
    summary: 'If you plan to claim an export incentive, keep the contract, invoices and payment records for each engagement.',
    officialChannel: 'NATEP Secretariat — incentive desk',
    evidenceExpected: 'Contract, invoices and bank credit advices per engagement',
    sourceCitation: 'NATEP Programme Operating Manual',
    effectiveOn: '2026-10-15',
    nextReviewOn: '2027-04-15',
    appliesTo: {}
  },
  stage: 'returned',
  draftedBy: 'Ada Chukwu',
  updatedOn: '2026-09-10',
  signOffs: [],
  returnedBy: 'Emeka Obi',
  returnNote: 'Say how long records must be kept, and cite the manual section rather than the whole manual.'
}];


interface RegisterOverride {
  status?: RegulatoryRequirement['status'];
  reviewDue?: boolean;
  lastReviewedOn?: string;
  signedOffBy?: string[];
  signedOffOn?: string;
}

interface RegulatoryRegisterValue {
  /** The live register: seeded records plus published revisions, with review state applied. */
  requirements: RegulatoryRequirement[];
  drafts: RequirementDraft[];
  saveDraft: (draft: {id?: string;supersedesId?: string;content: RequirementContent;}, author: string) => string;
  submitForSignOff: (id: string) => void;
  /** Returns the published requirement id when this sign-off completes the chain. */
  signOff: (id: string, name: string) => string | undefined;
  returnDraft: (id: string, name: string, note: string) => void;
  flagForReview: (id: string) => void;
  confirmCurrent: (id: string, name: string) => void;
  assertions: ReadinessAssertion[];
  issueAssertion: (actorId: string, officer: string, evidenceGaps: string[]) => void;
  revalidateAssertion: (id: string, officer: string) => void;
  withdrawAssertion: (id: string, officer: string, note: string) => void;
  impacts: ChangeImpact[];
  tasks: ReviewTask[];
  closeTask: (id: string, officer: string, resolution: string) => void;
}

const RegulatoryRegisterContext = createContext<RegulatoryRegisterValue | null>(null);

export function RegulatoryRegisterProvider({ children }: {children: React.ReactNode;}) {
  const [drafts, setDrafts] = useState<RequirementDraft[]>(seededDrafts);
  const [published, setPublished] = useState<RegulatoryRequirement[]>([]);
  const [overrides, setOverrides] = useState<Record<string, RegisterOverride>>({});
  const [assertions, setAssertions] = useState<ReadinessAssertion[]>(seededAssertions);
  const [impacts, setImpacts] = useState<ChangeImpact[]>([]);
  const [tasks, setTasks] = useState<ReviewTask[]>([]);

  const requirements = useMemo(
    () => [...published, ...seededRequirements].map((item) => ({ ...item, ...overrides[item.id] })),
    [published, overrides]
  );

  const value = useMemo<RegulatoryRegisterValue>(() => {
    const override = (id: string, patch: RegisterOverride) =>
    setOverrides((current) => ({ ...current, [id]: { ...current[id], ...patch } }));

    return {
      requirements,
      drafts,
      saveDraft: ({ id, supersedesId, content }, author) => {
        const draftId = id ?? `draft-${Date.now()}`;
        setDrafts((current) => {
          const existing = current.find((item) => item.id === draftId);
          if (existing) {
            return current.map((item) =>
            item.id === draftId ?
            // Editing resets sign-offs: approvers signed a different text.
            { ...item, content, stage: item.stage === 'returned' ? 'returned' : 'draft', signOffs: [], updatedOn: today() } :
            item
            );
          }
          return [
          { id: draftId, supersedesId, content, stage: 'draft', draftedBy: author, updatedOn: today(), signOffs: [] },
          ...current];

        });
        return draftId;
      },
      submitForSignOff: (id) =>
      setDrafts((current) =>
      current.map((item) => item.id === id ? { ...item, stage: 'in-sign-off', updatedOn: today() } : item)
      ),
      signOff: (id, name) => {
        const draft = drafts.find((item) => item.id === id);
        if (!draft) return undefined;
        const signOffs = [...draft.signOffs, { name, on: today() }];
        if (signOffs.length < requiredSignOffs(draft.content.category)) {
          setDrafts((current) => current.map((item) => item.id === id ? { ...item, signOffs } : item));
          return undefined;
        }

        const previous = draft.supersedesId ? requirements.find((item) => item.id === draft.supersedesId) : undefined;
        const version = (previous?.version ?? 0) + 1;
        const baseId = previous ? previous.id.replace(/-v\d+$/, '') : `reg-${Date.now()}`;
        const publishedId = previous ? `${baseId}-v${version}` : baseId;
        const record: RegulatoryRequirement = {
          ...draft.content,
          id: publishedId,
          status: 'current',
          lastReviewedOn: today(),
          reviewDue: false,
          version,
          signedOffBy: signOffs.map((item) => item.name),
          signedOffOn: today()
        };
        setPublished((current) => [record, ...current]);
        if (previous) override(previous.id, { status: 'superseded', reviewDue: false });

        // REG-05 impact analysis. Assertions are flagged, never voided: they stay on record,
        // marked for an officer to revalidate against the new version or withdraw.
        const impactId = `impact-${publishedId}`;
        const { tracks } = draft.content.appliesTo;
        const pathwayActorIds = actors.
        filter((actor) => !draft.content.sectorCode || actor.sectorCode === draft.content.sectorCode).
        filter((actor) => !tracks || tracks.includes(actor.track)).
        map((actor) => actor.id);
        const opportunityIds = opportunities.
        filter((opportunity) => !draft.content.sectorCode || opportunity.sectorCode === draft.content.sectorCode).
        map((opportunity) => opportunity.id);
        const flagged = previous ?
        assertions.filter(
          (assertion) =>
          assertion.status === 'valid' && assertion.basis.some((item) => item.requirementId === previous.id)
        ) :
        [];

        setImpacts((current) => [
        {
          id: impactId,
          requirementId: publishedId,
          supersededId: previous?.id,
          title: draft.content.title,
          authority: draft.content.authority,
          publishedOn: today(),
          changedFields: diffContent(draft.content, previous),
          pathwayActorIds,
          opportunityIds,
          flaggedAssertionIds: flagged.map((item) => item.id)
        },
        ...current]
        );
        setAssertions((current) =>
        current.map((assertion) =>
        flagged.some((item) => item.id === assertion.id) ?
        {
          ...assertion,
          status: 'revalidation-required',
          flaggedBy: { impactId, requirementTitle: draft.content.title, fromId: previous!.id, toId: publishedId },
          history: [
          ...assertion.history,
          { on: today(), by: 'Change engine', event: `Flagged for revalidation: ${previous!.id} replaced by ${publishedId}` }]

        } :
        assertion
        )
        );
        setTasks((current) => [
        ...flagged.map((assertion): ReviewTask => ({
          id: `task-${impactId}-${assertion.id}`,
          impactId,
          kind: 'revalidate-assertion',
          targetId: assertion.id,
          label: `Revalidate the readiness assertion for ${actors.find((actor) => actor.id === assertion.actorId)?.name ?? assertion.actorId}`,
          status: 'open'
        })),
        ...(opportunityIds.length > 0 ?
        [
        {
          id: `task-${impactId}-opportunities`,
          impactId,
          kind: 'review-opportunities' as const,
          label: `Check the criteria on ${opportunityIds.length} live ${opportunityIds.length === 1 ? 'opportunity' : 'opportunities'} still match`,
          status: 'open' as const
        }] :

        []),
        ...current]
        );
        setDrafts((current) =>
        current.map((item) => item.id === id ? { ...item, signOffs, stage: 'published', publishedAs: publishedId } : item)
        );
        return publishedId;
      },
      returnDraft: (id, name, note) =>
      setDrafts((current) =>
      current.map((item) =>
      item.id === id ? { ...item, stage: 'returned', signOffs: [], returnedBy: name, returnNote: note } : item
      )
      ),
      flagForReview: (id) => override(id, { status: 'under-review', reviewDue: true }),
      confirmCurrent: (id, name) =>
      override(id, { status: 'current', reviewDue: false, lastReviewedOn: today(), signedOffBy: [name], signedOffOn: today() }),
      assertions,
      issueAssertion: (actorId, officer, evidenceGaps) => {
        const actor = actors.find((item) => item.id === actorId);
        if (!actor) return;
        const assertion = buildAssertion(actor, requirements, officer, today(), evidenceGaps);
        setAssertions((current) => [assertion, ...current.filter((item) => item.id !== assertion.id)]);
      },
      revalidateAssertion: (id, officer) => {
        setAssertions((current) =>
        current.map((assertion) => {
          if (assertion.id !== id) return assertion;
          const actor = actors.find((item) => item.id === assertion.actorId)!;
          return {
            ...assertion,
            status: 'valid',
            flaggedBy: undefined,
            basis: buildAssertionBasis(actor, requirements, today()),
            history: [...assertion.history, { on: today(), by: officer, event: 'Revalidated against current requirement versions' }]
          };
        })
        );
        setTasks((current) =>
        current.map((task) =>
        task.targetId === id && task.status === 'open' ?
        { ...task, status: 'done', closedBy: officer, closedOn: today(), resolution: 'Revalidated' } :
        task
        )
        );
      },
      withdrawAssertion: (id, officer, note) => {
        setAssertions((current) =>
        current.map((assertion) =>
        assertion.id === id ?
        {
          ...assertion,
          status: 'withdrawn',
          history: [...assertion.history, { on: today(), by: officer, event: `Withdrawn: ${note}` }]
        } :
        assertion
        )
        );
        setTasks((current) =>
        current.map((task) =>
        task.targetId === id && task.status === 'open' ?
        { ...task, status: 'done', closedBy: officer, closedOn: today(), resolution: `Withdrawn: ${note}` } :
        task
        )
        );
      },
      impacts,
      tasks,
      closeTask: (id, officer, resolution) =>
      setTasks((current) =>
      current.map((task) =>
      task.id === id ? { ...task, status: 'done', closedBy: officer, closedOn: today(), resolution } : task
      )
      )
    };
  }, [requirements, drafts, assertions, impacts, tasks]);

  return <RegulatoryRegisterContext.Provider value={value}>{children}</RegulatoryRegisterContext.Provider>;
}

export function useRegulatoryRegister(): RegulatoryRegisterValue {
  const context = useContext(RegulatoryRegisterContext);
  if (!context) throw new Error('useRegulatoryRegister must be used within a RegulatoryRegisterProvider');
  return context;
}

interface SignerProfile {
  name: string;
  role: OfficerRole;
  authority: string;
}

/** PRD v1.0 §4 segregation of duties. Returns why this officer can't sign, or undefined if
 * they can. Checked in one place so every sign-off button agrees. */
export function signOffBlocker(draft: RequirementDraft, signer: SignerProfile): string | undefined {
  const agency = signOffAgency(draft.content.authority);
  if (signer.role !== 'authority-focal') return `Only a ${agency} focal can sign this off.`;
  if (signer.authority !== agency) return `You sign for ${signer.authority}; this needs a ${agency} focal.`;
  if (signer.name === draft.draftedBy) return 'You drafted this version, so a different officer must sign it off.';
  if (draft.signOffs.some((item) => item.name === signer.name)) {
    return 'You already signed this off. The next sign-off must come from a different officer.';
  }
  return undefined;
}

/** Only the drafter role writes content; focals and desk officers don't. */
export function canDraft(role: OfficerRole): boolean {
  return role === 'content-drafter';
}

/** Confirming unchanged content is itself a sign-off, so it needs the authority's focal. */
export function canConfirmCurrent(requirement: RegulatoryRequirement, signer: SignerProfile): boolean {
  return signer.role === 'authority-focal' && signer.authority === signOffAgency(requirement.authority);
}
