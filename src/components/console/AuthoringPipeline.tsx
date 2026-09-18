import React, { useState } from 'react';
import { CheckIcon, ChevronDownIcon, CornerUpLeftIcon, PencilIcon, SendIcon } from 'lucide-react';
import {
  requirementCategoryLabels,
  requiredSignOffs,
  signOffAgency,
  type RegulatoryRequirement } from
'../../data/regulations';
import { sectorLabel } from '../../lib/marketplaceLookups';
import {
  canDraft,
  diffContent,
  signOffBlocker,
  type DraftStage,
  type RequirementDraft } from
'../../lib/regulatoryRegister';
import type { OfficerRole } from '../../lib/officerProfile';
import { AuditOnlyBadge } from './AuditOnlyBadge';

const stageMeta: Record<DraftStage, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600' },
  returned: { label: 'Returned to drafter', className: 'bg-rose-50 text-rose-700' },
  'in-sign-off': { label: 'Awaiting sign-off', className: 'bg-amber-50 text-amber-700' },
  published: { label: 'Published', className: 'bg-emerald-50 text-emerald-700' }
};

function changedFields(draft: RequirementDraft, previous?: RegulatoryRequirement): string[] {
  return diffContent(draft.content, previous);
}

interface AuthoringPipelineProps {
  drafts: RequirementDraft[];
  requirements: RegulatoryRequirement[];
  profile: {name: string;role: OfficerRole;authority: string;};
  canMutate: boolean;
  onEdit: (draft: RequirementDraft) => void;
  onSubmit: (draft: RequirementDraft) => void;
  onSignOff: (draft: RequirementDraft) => void;
  onReturn: (draft: RequirementDraft, note: string) => void;
}

function DraftCard({
  draft,
  previous,
  profile,
  canMutate,
  onEdit,
  onSubmit,
  onSignOff,
  onReturn




}: Omit<AuthoringPipelineProps, 'drafts' | 'requirements'> & {draft: RequirementDraft;previous?: RegulatoryRequirement;}) {
  const [expanded, setExpanded] = useState(false);
  const [returning, setReturning] = useState(false);
  const [note, setNote] = useState('');

  const agency = signOffAgency(draft.content.authority);
  const needed = requiredSignOffs(draft.content.category);
  const blocker = signOffBlocker(draft, profile);
  const isAgencyFocal = profile.role === 'authority-focal' && profile.authority === agency;
  const changes = changedFields(draft, previous);
  const stage = stageMeta[draft.stage];

  return (
    <li className="rounded-xl border border-gray-100 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-gray-900">{draft.content.title}</p>
            <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${stage.className}`}>{stage.label}</span>
          </div>
          <p className="text-[12px] text-gray-400">
            {previous ? `Revision of ${previous.id} · v${previous.version} → v${previous.version + 1}` : 'New requirement'} ·{' '}
            {requirementCategoryLabels[draft.content.category]} · drafted by {draft.draftedBy} · updated {draft.updatedOn}
          </p>
          {changes.length > 0 &&
          <p className="mt-1 text-[12px] text-gray-500">Changes: {changes.join(', ')}</p>
          }

          {draft.stage !== 'published' &&
          <p className="mt-1.5 text-[12px] text-gray-600">
              Sign-off {draft.signOffs.length} of {needed}
              {draft.signOffs.length > 0 &&
            <> · {draft.signOffs.map((item) => `${item.name} (${item.on})`).join(', ')}</>
            }
            </p>
          }
          {draft.stage === 'published' &&
          <p className="mt-1.5 text-[12px] text-emerald-700">
              Published as {draft.publishedAs} · signed off by {draft.signOffs.map((item) => item.name).join(' and ')}
            </p>
          }
          {draft.returnNote && draft.stage !== 'published' &&
          <p className="mt-1.5 rounded-lg bg-rose-50 px-3 py-2 text-[12px] text-rose-800">
              {draft.returnedBy} returned it: “{draft.returnNote}”
            </p>
          }

          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-gray-400 hover:text-gray-700">

            {expanded ? 'Hide content' : 'Read content'}
            <ChevronDownIcon className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {expanded &&
          <dl className="mt-2 grid gap-x-6 gap-y-2 rounded-lg bg-gray-50 p-3 text-[12.5px] sm:grid-cols-2">
              {(
            [
            ['Summary', draft.content.summary, 'summary'],
            ['Official channel', draft.content.officialChannel, 'official channel'],
            ['Evidence expected', draft.content.evidenceExpected, 'evidence expected'],
            ['Source', draft.content.sourceCitation, 'source citation'],
            ['Effective', draft.content.effectiveOn, 'effective date'],
            ['Next review', draft.content.nextReviewOn, 'review date'],
            ['Sector', draft.content.sectorCode ? sectorLabel(draft.content.sectorCode) : 'All sectors', 'sector']] as
            const).
            map(([label, value, field]) =>
            <div key={label} className={label === 'Summary' ? 'sm:col-span-2' : undefined}>
                  <dt className="text-gray-400">
                    {label}
                    {changes.includes(field) && <span className="ml-1.5 font-medium text-amber-700">changed</span>}
                  </dt>
                  <dd className="text-gray-800">{value}</dd>
                </div>
            )}
            </dl>
          }
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {!canMutate && draft.stage !== 'published' && <AuditOnlyBadge />}

          {canMutate && (draft.stage === 'draft' || draft.stage === 'returned') && canDraft(profile.role) &&
          <div className="flex gap-1.5">
              <button
              type="button"
              onClick={() => onEdit(draft)}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600 hover:border-gray-300">

                <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </button>
              <button
              type="button"
              onClick={() => onSubmit(draft)}
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-black">

                <SendIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Send for sign-off
              </button>
            </div>
          }

          {canMutate && draft.stage === 'in-sign-off' && isAgencyFocal && !returning &&
          <div className="flex gap-1.5">
              <button
              type="button"
              onClick={() => setReturning(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600 hover:border-gray-300">

                <CornerUpLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Return
              </button>
              <button
              type="button"
              onClick={() => onSignOff(draft)}
              disabled={Boolean(blocker)}
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500">

                <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {draft.signOffs.length + 1 >= needed ? 'Sign off and publish' : 'Sign off'}
              </button>
            </div>
          }
          {canMutate && draft.stage === 'in-sign-off' && blocker &&
          <p className="max-w-[240px] text-right text-[11.5px] text-gray-500">{blocker}</p>
          }
        </div>
      </div>

      {returning &&
      <div className="mt-3 rounded-lg border border-gray-200 p-3">
          <label htmlFor={`return-${draft.id}`} className="block text-[12px] font-medium text-gray-600">
            What needs to change? The drafter sees this note.
          </label>
          <textarea
          id={`return-${draft.id}`}
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] focus:border-gray-400 focus:outline-none" />

          <div className="mt-2 flex gap-1.5">
            <button
            type="button"
            disabled={!note.trim()}
            onClick={() => {
              onReturn(draft, note.trim());
              setReturning(false);
              setNote('');
            }}
            className="rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500">

              Return to drafter
            </button>
            <button
            type="button"
            onClick={() => setReturning(false)}
            className="rounded-full px-3 py-1.5 text-[12px] font-medium text-gray-500 hover:text-gray-800">

              Cancel
            </button>
          </div>
        </div>
      }
    </li>);

}

/** REG-02 per-agency queues. Everyone sees the pipeline; only the drafter role edits and only
 * the right agency's focal signs off. */
export function AuthoringPipeline(props: AuthoringPipelineProps) {
  const { drafts, requirements } = props;
  const agencies = Array.from(new Set(drafts.map((draft) => signOffAgency(draft.content.authority)))).sort((a, b) =>
  a === props.profile.authority ? -1 : b === props.profile.authority ? 1 : a.localeCompare(b)
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold text-gray-900">Authoring and sign-off</h2>
      <p className="text-[12.5px] text-gray-400">
        Content stays Draft — and out of the exporter wizard — until the competent authority signs it off. The
        drafter can never sign their own work.
      </p>

      {drafts.length === 0 &&
      <p className="mt-4 text-[13px] text-gray-400">Nothing in authoring.</p>
      }

      <div className="mt-4 space-y-5">
        {agencies.map((agency) => {
          const queue = drafts.filter((draft) => signOffAgency(draft.content.authority) === agency);
          const waiting = queue.filter((draft) => draft.stage === 'in-sign-off').length;
          return (
            <section key={agency} aria-label={`${agency} queue`}>
              <h3 className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-gray-700">
                {agency}
                <span className="font-normal text-gray-400">
                  {waiting} awaiting sign-off
                </span>
                {props.profile.role === 'authority-focal' && props.profile.authority === agency &&
                <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10.5px] font-medium text-white">Your queue</span>
                }
              </h3>
              <ul className="mt-2 space-y-2">
                {queue.map((draft) =>
                <DraftCard
                  key={draft.id}
                  {...props}
                  draft={draft}
                  previous={draft.supersedesId ? requirements.find((item) => item.id === draft.supersedesId) : undefined} />

                )}
              </ul>
            </section>);

        })}
      </div>
    </div>);

}
