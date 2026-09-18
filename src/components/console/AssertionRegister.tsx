import React, { useState } from 'react';
import { AlertTriangleIcon, ChevronDownIcon, RefreshCwIcon, XIcon } from 'lucide-react';
import type { Actor } from '../../data/actors';
import type { AssertionStatus, ReadinessAssertion } from '../../lib/readinessAssertions';
import type { ChangeImpact } from '../../lib/regulatoryRegister';
import { AuditOnlyBadge } from './AuditOnlyBadge';

const statusMeta: Record<AssertionStatus, { label: string; className: string }> = {
  valid: { label: 'Valid', className: 'bg-emerald-50 text-emerald-700' },
  'revalidation-required': { label: 'Revalidation required', className: 'bg-amber-50 text-amber-700' },
  withdrawn: { label: 'Withdrawn', className: 'bg-gray-100 text-gray-500' }
};

interface AssertionRegisterProps {
  assertions: ReadinessAssertion[];
  actorsById: Map<string, Actor>;
  impacts: ChangeImpact[];
  canMutate: boolean;
  onRevalidate: (assertion: ReadinessAssertion) => void;
  onWithdraw: (assertion: ReadinessAssertion, note: string) => void;
}

function AssertionRow({
  assertion,
  actor,
  impact,
  canMutate,
  onRevalidate,
  onWithdraw




}: Omit<AssertionRegisterProps, 'assertions' | 'actorsById' | 'impacts'> & {assertion: ReadinessAssertion;actor?: Actor;impact?: ChangeImpact;}) {
  const [expanded, setExpanded] = useState(assertion.status === 'revalidation-required');
  const [withdrawing, setWithdrawing] = useState(false);
  const [note, setNote] = useState('');
  const status = statusMeta[assertion.status];

  return (
    <li
      className={`rounded-xl border px-4 py-3 ${
      assertion.status === 'revalidation-required' ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'}`
      }>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-gray-900">{actor?.name ?? assertion.actorId}</p>
            <span className="font-mono text-[10.5px] text-gray-400">{assertion.id}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${status.className}`}>{status.label}</span>
          </div>
          <p className="text-[12px] text-gray-400">
            Issued {assertion.issuedOn} by {assertion.issuedBy} · expires {assertion.expiresOn}
          </p>
          <p className="mt-0.5 text-[12.5px] text-gray-600">
            {assertion.purpose} · {assertion.scope}
          </p>

          {assertion.flaggedBy &&
          <p className="mt-2 flex gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
              <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                Relies on {assertion.flaggedBy.fromId}, replaced by {assertion.flaggedBy.toId} ("{assertion.flaggedBy.requirementTitle}")
                {impact?.changedFields.length ? ` — changed: ${impact.changedFields.join(', ')}` : ''}. It stays on record
                until an officer revalidates or withdraws it.
              </span>
            </p>
          }

          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-gray-400 hover:text-gray-700">

            {expanded ? 'Hide details' : 'What it asserts'}
            <ChevronDownIcon className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>

          {expanded &&
          <div className="mt-2 grid gap-4 rounded-lg bg-gray-50 p-3 text-[12.5px] lg:grid-cols-2">
              <div>
                <p className="font-medium text-gray-700">Verified</p>
                <ul className="mt-1 space-y-1.5">
                  {assertion.basis.map((item) =>
                <li key={item.label}>
                      <p className="text-gray-800">{item.label}</p>
                      <p className="text-[11.5px] text-gray-400">
                        {item.authority} · {item.verifiedOn}
                        {item.requirementId && ` · ${item.requirementId} v${item.requirementVersion}`}
                      </p>
                    </li>
                )}
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-700">Not covered</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-gray-600">
                  {assertion.notCovered.map((item) =>
                <li key={item}>{item}</li>
                )}
                </ul>
                <p className="mt-3 font-medium text-gray-700">History</p>
                <ul className="mt-1 space-y-1 text-[11.5px] text-gray-500">
                  {assertion.history.map((event, index) =>
                <li key={index}>
                      {event.on} · {event.by} · {event.event}
                    </li>
                )}
                </ul>
              </div>
            </div>
          }
        </div>

        {assertion.status === 'revalidation-required' &&
        <div className="flex shrink-0 items-center gap-1.5">
            {!canMutate ?
          <AuditOnlyBadge /> :
          !withdrawing &&
          <>
                  <button
              type="button"
              onClick={() => setWithdrawing(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600 hover:border-gray-300">

                    <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Withdraw
                  </button>
                  <button
              type="button"
              onClick={() => onRevalidate(assertion)}
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-black">

                    <RefreshCwIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Revalidate
                  </button>
                </>

          }
          </div>
        }
      </div>

      {withdrawing &&
      <div className="mt-3 rounded-lg border border-gray-200 p-3">
          <label htmlFor={`withdraw-${assertion.id}`} className="block text-[12px] font-medium text-gray-600">
            Why is it being withdrawn? This stays on the assertion's history.
          </label>
          <textarea
          id={`withdraw-${assertion.id}`}
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] focus:border-gray-400 focus:outline-none" />

          <div className="mt-2 flex gap-1.5">
            <button
            type="button"
            disabled={!note.trim()}
            onClick={() => {
              onWithdraw(assertion, note.trim());
              setWithdrawing(false);
            }}
            className="rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500">

              Withdraw assertion
            </button>
            <button
            type="button"
            onClick={() => setWithdrawing(false)}
            className="rounded-full px-3 py-1.5 text-[12px] font-medium text-gray-500 hover:text-gray-800">

              Cancel
            </button>
          </div>
        </div>
      }
    </li>);

}

/** REG-06 assertions, with REG-05's revalidation flags. Nothing here is ever deleted. */
export function AssertionRegister({ assertions, actorsById, impacts, ...rest }: AssertionRegisterProps) {
  const ordered = [...assertions].sort((a, b) => {
    const rank = (item: ReadinessAssertion) => item.status === 'revalidation-required' ? 0 : item.status === 'valid' ? 1 : 2;
    return rank(a) - rank(b);
  });

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold text-gray-900">Readiness assertions</h2>
      <p className="text-[12.5px] text-gray-400">
        What each assertion verified, by which authority and when — and what it doesn't cover. When a requirement it
        relies on changes, it's flagged for revalidation, never silently voided.
      </p>
      <ul className="mt-4 space-y-2">
        {ordered.map((assertion) =>
        <AssertionRow
          key={assertion.id}
          {...rest}
          assertion={assertion}
          actor={actorsById.get(assertion.actorId)}
          impact={impacts.find((item) => item.id === assertion.flaggedBy?.impactId)} />

        )}
      </ul>
      {assertions.length === 0 && <p className="mt-4 text-[13px] text-gray-400">No assertions issued yet.</p>}
    </div>);

}
