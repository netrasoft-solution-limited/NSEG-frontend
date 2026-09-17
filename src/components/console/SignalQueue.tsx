import React, { useState } from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
import type { Signal } from '../../data/signals';
import { sectorLabel } from '../../lib/marketplaceLookups';
import { AuditOnlyBadge } from './AuditOnlyBadge';
import { ConsoleDialog, DialogNote, dialogFieldClass, dialogLabelClass } from './ConsoleDialog';

export type SignalDecision = 'pending' | 'qualified' | 'rejected';

export type Confidence = 'High' | 'Medium' | 'Low';

/** What an officer recorded when they decided: the reason is the point of the record. */
export interface DecisionRecord {
  reason: string;
  confidence?: Confidence;
}

/** Short enough to type, long enough to be a reason rather than a shrug. */
const MIN_REASON = 12;

const riskStyles: Record<Signal['riskTier'], string> = {
  New: 'bg-sky-50 text-sky-700',
  Review: 'bg-amber-50 text-amber-700',
  Flagged: 'bg-rose-50 text-rose-700'
};

interface SignalQueueProps {
  signals: Signal[];
  decisions: Record<string, SignalDecision>;
  /** What was recorded with each decision, keyed by signal id. */
  records?: Record<string, DecisionRecord>;
  onDecide: (id: string, decision: SignalDecision, record: DecisionRecord) => void;
  canMutate: boolean;
}

export function SignalQueue({ signals, decisions, records = {}, onDecide, canMutate }: SignalQueueProps) {
  const [pending, setPending] = useState<{signal: Signal;decision: Exclude<SignalDecision, 'pending'>;} | null>(null);
  const [confidence, setConfidence] = useState<Confidence>('High');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const open = (signal: Signal, decision: Exclude<SignalDecision, 'pending'>) => {
    setPending({ signal, decision });
    setConfidence('High');
    setReason('');
    setError('');
  };

  const close = () => setPending(null);

  const confirm = () => {
    const trimmed = reason.trim();
    if (trimmed.length < MIN_REASON) {
      setError('Record a reason. This is what makes the decision auditable.');
      return;
    }
    if (pending) {
      onDecide(pending.signal.id, pending.decision, {
        reason: trimmed,
        confidence: pending.decision === 'qualified' ? confidence : undefined
      });
    }
    close();
  };

  const qualifying = pending?.decision === 'qualified';

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-[16px] font-semibold text-gray-900">Signal intake</h2>
        <p className="text-[12.5px] text-gray-400">Every inbound buyer signal waits here until an officer qualifies or rejects it.</p>
      </div>

      <ul className="mt-4 space-y-2">
        {signals.map((signal) => {
          const decision = decisions[signal.id] ?? 'pending';
          return (
            <li
              key={signal.id}
              className={`rounded-xl border px-4 py-3 transition-colors duration-150 ease-out ${
              decision === 'qualified' ?
              'border-emerald-200 bg-emerald-50/40' :
              decision === 'rejected' ?
              'border-gray-100 bg-gray-50 opacity-60' :
              'border-gray-100 bg-white'}`
              }>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{signal.route}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${riskStyles[signal.riskTier]}`}>
                      {signal.riskTier}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-gray-400">
                    {signal.origin} · {sectorLabel(signal.sectorCode)} · Received {signal.receivedOn}
                  </p>
                  <p className="mt-1 text-[13px] text-gray-500">{signal.summary}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {decision === 'pending' && !canMutate && <AuditOnlyBadge />}
                  {decision === 'pending' && canMutate &&
                  <>
                      <button
                    type="button"
                    onClick={() => open(signal, 'qualified')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black">

                        <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Qualify
                      </button>
                      <button
                    type="button"
                    onClick={() => open(signal, 'rejected')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors duration-150 ease-out hover:border-gray-300 hover:text-gray-700">

                        <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Reject
                      </button>
                    </>
                  }
                  {decision === 'qualified' &&
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
                      <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Qualified
                    </span>
                  }
                  {decision === 'rejected' &&
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[12px] font-medium text-gray-500">
                      <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Rejected
                    </span>
                  }
                </div>
              </div>

              {records[signal.id] &&
              <p className="mt-2 border-t border-gray-200/70 pt-2 text-[12.5px] leading-relaxed text-gray-600">
                  <span className="font-medium text-gray-800">
                    {decision === 'qualified' ? 'Qualified' : 'Rejected'}
                    {records[signal.id].confidence ? ` · ${records[signal.id].confidence} confidence` : ''}:
                  </span>{' '}
                  “{records[signal.id].reason}”
                </p>
              }
            </li>);

        })}
      </ul>

      <ConsoleDialog
        open={Boolean(pending)}
        title={qualifying ? 'Qualify this demand signal' : 'Reject this demand signal'}
        subtitle={pending ? `${pending.signal.route} · ${pending.signal.origin}` : undefined}
        confirmLabel={qualifying ? 'Qualify and create opportunity' : 'Reject with this reason'}
        onConfirm={confirm}
        onClose={close}>

        <div className="space-y-4">
          <DialogNote title="This is a human decision">
            The Gateway cannot qualify a signal on its own. Your name and reason are recorded against the case, and can be
            requested by the buyer or any exporter affected by it.
          </DialogNote>

          {qualifying &&
          <div>
              <label htmlFor="qualify-confidence" className={dialogLabelClass}>
                Confidence in this demand
              </label>
              <select
              id="qualify-confidence"
              value={confidence}
              onChange={(event) => setConfidence(event.target.value as Confidence)}
              className={dialogFieldClass}>

                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          }

          <div>
            <label htmlFor="decision-reason" className={dialogLabelClass}>
              Reason for the decision
            </label>
            <textarea
              id="decision-reason"
              rows={4}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setError('');
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'decision-reason-error' : 'decision-reason-hint'}
              placeholder={
              qualifying ?
              'Buyer authority, decision route, procurement or hiring model, value credibility, next action.' :
              'What could not be established, and what the buyer would need to change.'
              }
              className={dialogFieldClass} />

            {error ?
            <p id="decision-reason-error" className="mt-1 text-[12.5px] text-rose-700">
                {error}
              </p> :

            <p id="decision-reason-hint" className="mt-1 text-[12.5px] text-gray-600">
                Written for the buyer or exporter who may ask to see it.
              </p>
            }
          </div>
        </div>
      </ConsoleDialog>
    </div>);

}
