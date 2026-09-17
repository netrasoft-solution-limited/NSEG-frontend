import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2Icon, CircleDashedIcon, EyeIcon, HourglassIcon, LockIcon, SendIcon, XCircleIcon } from 'lucide-react';
import { WorkspaceLayout } from '../components/workspace/WorkspaceLayout';
import { TierBadge } from '../components/workspace/TierBadge';
import { evidenceLabels, trustTiers, type EvidenceKey } from '../data/trustTiers';
import { documentKindLabels, vaultDocuments, type DocumentKind } from '../data/vaultDocuments';
import { settlementCheckItems, useExporterSession } from '../lib/exporterSession';
import { deriveExporterTier } from '../lib/exporterTier';
import { computeReadinessScore, readinessParameterWeights, readinessTierFor } from '../lib/readinessScore';
import { useAuditLog } from '../lib/auditLog';
import { useRegulatoryRegister } from '../lib/regulatoryRegister';

/** Which vault document backs each evidence item. Delivery history comes from verified
 * outcomes, not an upload, so it has no document kind. */
const evidenceDocumentKind: Partial<Record<EvidenceKey, DocumentKind>> = {
  cac: 'cac-certificate',
  tin: 'tin-certificate',
  nin: 'nin-slip',
  'professional-credential': 'professional-credential'
};

type EvidenceState = 'verified' | 'in-review' | 'rejected' | 'not-started';

const evidenceStateMeta: Record<EvidenceState, { label: string; className: string; icon: typeof CheckCircle2Icon }> = {
  verified: { label: 'Verified', className: 'bg-emerald-50 text-emerald-800', icon: CheckCircle2Icon },
  'in-review': { label: 'In review', className: 'bg-amber-50 text-amber-900', icon: HourglassIcon },
  rejected: { label: 'Not accepted', className: 'bg-rose-50 text-rose-800', icon: XCircleIcon },
  'not-started': { label: 'Not submitted', className: 'bg-gray-100 text-gray-700', icon: CircleDashedIcon }
};

export function WorkspaceReadiness() {
  const { actor, workspace, updateWorkspace } = useExporterSession();
  const { logEvent } = useAuditLog();
  const { assertions } = useRegulatoryRegister();
  const assertion =
  assertions.find((item) => item.actorId === actor.id && item.status !== 'withdrawn') ??
  assertions.find((item) => item.actorId === actor.id);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView({ block: 'start' }));
    }
  }, [location.hash]);

  const actorDocuments = vaultDocuments.filter((doc) => doc.actorId === actor.id);
  const requiredEvidence = trustTiers[trustTiers.length - 1].evidence[actor.track];

  const evidenceState = (key: EvidenceKey): EvidenceState => {
    if (actor.verifiedEvidence.includes(key)) return 'verified';
    const kind = evidenceDocumentKind[key];
    const doc = kind && actorDocuments.find((item) => item.kind === kind);
    if (doc?.verification === 'pending') return 'in-review';
    if (doc?.verification === 'rejected') return 'rejected';
    return 'not-started';
  };

  const draft = workspace.diagnosticDraft;
  const draftScore = computeReadinessScore(draft);
  const submittedScore = computeReadinessScore(actor.diagnostic);
  const draftChanged = readinessParameterWeights.some(({ key }) => draft[key] !== actor.diagnostic[key]);
  const draftTier = deriveExporterTier({ ...actor, diagnostic: draft });

  const toggleCheck = (id: string) =>
  updateWorkspace({
    settlementChecks: workspace.settlementChecks.includes(id) ?
    workspace.settlementChecks.filter((item) => item !== id) :
    [...workspace.settlementChecks, id]
  });

  const toggleShare = () => {
    const next = !workspace.sharedWithOfficer;
    updateWorkspace({ sharedWithOfficer: next });
    logEvent(
      next ?
      `${actor.name} shared a readiness snapshot with their desk officer` :
      `${actor.name} stopped sharing their readiness snapshot`,
      'readiness',
      actor.name
    );
  };

  const submitDiagnostic = () => {
    updateWorkspace({ diagnosticSubmitted: true });
    logEvent(`${actor.name} submitted an updated readiness diagnostic (score ${draftScore})`, 'readiness', actor.name);
  };

  return (
    <WorkspaceLayout
      title="Readiness"
      intro="Prepare at your own pace. This page is private to you — nothing here reaches an officer or a buyer unless you choose to share it.">

      <section
        aria-labelledby="privacy"
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5">

        <div className="flex max-w-lg gap-3">
          {workspace.sharedWithOfficer ?
          <EyeIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" /> :

          <LockIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
          }
          <div>
            <h2 id="privacy" className="text-[15px] font-semibold text-gray-900">
              {workspace.sharedWithOfficer ? 'Shared with your desk officer' : 'Private to you'}
            </h2>
            <p className="mt-0.5 text-[13px] leading-relaxed text-gray-600">
              {workspace.sharedWithOfficer ?
              'Your officer can see a read-only snapshot of your checklist and diagnostic draft. Buyers never can.' :
              'Your checklist and diagnostic draft are only visible to you. Verified evidence is reviewed separately.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={workspace.sharedWithOfficer}
          aria-labelledby="share-label"
          onClick={toggleShare}
          className="flex min-h-[44px] items-center gap-3 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">

          <span id="share-label" className="text-[13px] font-medium text-gray-800">
            Share snapshot
          </span>
          <span
            className={`relative block h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ease-out ${
            workspace.sharedWithOfficer ? 'bg-gray-900' : 'bg-gray-300'}`
            }>

            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ease-out ${
              workspace.sharedWithOfficer ? 'translate-x-5' : 'translate-x-0'}`
              } />

          </span>
        </button>
      </section>

      {assertion &&
      <section aria-labelledby="assertion" className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 id="assertion" className="text-[15px] font-semibold text-gray-900">
                Your readiness assertion
              </h2>
              <p className="mt-0.5 text-[12.5px] text-gray-600">
                Issued {assertion.issuedOn} by {assertion.issuedBy} · expires {assertion.expiresOn}
              </p>
            </div>
            <span
            className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${
            assertion.status === 'valid' ?
            'bg-emerald-50 text-emerald-800' :
            assertion.status === 'revalidation-required' ?
            'bg-amber-50 text-amber-900' :
            'bg-gray-100 text-gray-700'}`
            }>

              {assertion.status === 'valid' ? 'Valid' : assertion.status === 'revalidation-required' ? 'Being revalidated' : 'Withdrawn'}
            </span>
          </div>

          {assertion.status === 'revalidation-required' && assertion.flaggedBy &&
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-900">
              A requirement it relies on changed: "{assertion.flaggedBy.requirementTitle}". Your assertion stays on record while
              a desk officer checks it against the new version. You don't need to do anything unless they contact you.
            </p>
        }
          {assertion.status === 'withdrawn' &&
        <p className="mt-3 rounded-xl bg-gray-100 p-3 text-[13px] leading-relaxed text-gray-800">
              {assertion.history[assertion.history.length - 1]?.event}. Your desk officer will explain what's needed for a new one.
            </p>
        }

          <p className="mt-3 text-[13px] text-gray-800">
            <span className="font-medium">For:</span> {assertion.purpose} · {assertion.scope}
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-[13px] font-medium text-gray-800">What it confirms</h3>
              <ul className="mt-1.5 space-y-1.5">
                {assertion.basis.map((item) =>
              <li key={item.label} className="text-[13px]">
                    <p className="text-gray-900">{item.label}</p>
                    <p className="text-[12px] text-gray-600">
                      {item.authority} · {item.verifiedOn}
                    </p>
                  </li>
              )}
              </ul>
            </div>
            <div>
              <h3 className="text-[13px] font-medium text-gray-800">What it doesn't cover</h3>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[13px] text-gray-700">
                {assertion.notCovered.map((item) =>
              <li key={item}>{item}</li>
              )}
              </ul>
            </div>
          </div>
        </section>
      }

      <section aria-labelledby="evidence" className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 id="evidence" className="text-[15px] font-semibold text-gray-900">
          Evidence for your tier
        </h2>
        <p className="mt-1 text-[13px] text-gray-600">
          Everything the ladder asks of {actor.track === 'firm' ? 'a registered firm' : 'an individual professional'}.
          Officers and registries verify these — you can&apos;t mark them done yourself.
        </p>
        <ul className="mt-4 divide-y divide-gray-100">
          {requiredEvidence.map((key) => {
            const state = evidenceState(key);
            const meta = evidenceStateMeta[state];
            const Icon = meta.icon;
            return (
              <li key={key} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="text-[14px] text-gray-900">{evidenceLabels[key]}</p>
                  {key === 'delivery-history' && state !== 'verified' &&
                  <p className="text-[12.5px] text-gray-600">
                      Verified automatically once a buyer confirms a completed engagement.
                    </p>
                  }
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium ${meta.className}`}>
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {meta.label}
                </span>
              </li>);

          })}
        </ul>
        {actor.verificationNote &&
        <p className="mt-2 rounded-xl bg-amber-50 p-3 text-[12.5px] leading-relaxed text-amber-900">
            Update from your desk officer: {actor.verificationNote}
          </p>
        }
        {actorDocuments.length > 0 &&
        <div className="mt-4">
            <h3 className="text-[13px] font-medium text-gray-700">In your evidence vault</h3>
            <ul className="mt-1.5 space-y-1 text-[13px] text-gray-700">
              {actorDocuments.map((doc) =>
            <li key={doc.id} className="flex flex-wrap justify-between gap-2">
                  <span>{documentKindLabels[doc.kind]}</span>
                  <span className="text-gray-600">
                    {doc.verification === 'verified' ? 'Verified' : doc.verification === 'pending' ? 'In review' : 'Not accepted'}
                    {doc.expiresInDays !== undefined && ` · expires in ${doc.expiresInDays} days`}
                  </span>
                </li>
            )}
            </ul>
          </div>
        }
      </section>

      <section aria-labelledby="settlement" className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="settlement" className="text-[15px] font-semibold text-gray-900">
            Bank &amp; FX settlement readiness
          </h2>
          <p className="text-[13px] tabular-nums text-gray-700">
            {workspace.settlementChecks.length} of {settlementCheckItems.length} ready
          </p>
        </div>
        <p className="mt-1 text-[13px] text-gray-600">
          Getting paid is where first exports most often stall. Tick these off for yourself.
        </p>
        <ul className="mt-4 space-y-2">
          {settlementCheckItems.map((item) => {
            const checked = workspace.settlementChecks.includes(item.id);
            return (
              <li key={item.id}>
                <label
                  htmlFor={`settle-${item.id}`}
                  className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3.5 hover:border-gray-400 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gray-900">

                  <input
                    id={`settle-${item.id}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCheck(item.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-gray-900" />

                  <span>
                    <span className={`block text-[14px] font-medium ${checked ? 'text-gray-900' : 'text-gray-800'}`}>{item.label}</span>
                    <span className="block text-[12.5px] text-gray-600">{item.detail}</span>
                  </span>
                </label>
              </li>);

          })}
        </ul>
      </section>

      <section
        id="diagnostic"
        aria-labelledby="diagnostic-heading"
        className="mt-6 scroll-mt-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="diagnostic-heading" className="text-[15px] font-semibold text-gray-900">
              Diagnostic draft
            </h2>
            <p className="mt-1 max-w-md text-[13px] text-gray-600">
              Rework your self-assessment privately. Your tier only changes after you submit and an officer reviews it.
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-[30px] font-semibold leading-none tabular-nums text-gray-900" aria-live="polite">
              {draftScore}
              <span className="text-[14px] font-medium text-gray-500">/100</span>
            </p>
            <p className="mt-1 text-[12px] text-gray-600">
              {readinessTierFor(draftScore).label} · submitted: {submittedScore}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {readinessParameterWeights.map(({ key, label, weight }) =>
          <div key={key}>
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={`diag-${key}`} className="text-[13.5px] text-gray-800">
                  {label} <span className="text-gray-500">· {Math.round(weight * 100)}%</span>
                </label>
                <span className="font-mono text-[12px] tabular-nums text-gray-700">{draft[key]}</span>
              </div>
              <input
              id={`diag-${key}`}
              type="range"
              min={0}
              max={100}
              step={1}
              value={draft[key]}
              onChange={(event) =>
              updateWorkspace({
                diagnosticDraft: { ...draft, [key]: Number(event.target.value) },
                diagnosticSubmitted: false
              })
              }
              className="mt-1.5 w-full accent-gray-900" />

            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 p-3.5 text-[13px] text-gray-800">
          With your current verified evidence, this score would support
          <TierBadge tier={draftTier} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={submitDiagnostic}
            disabled={!draftChanged || workspace.diagnosticSubmitted}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-gray-900 px-5 text-[13.5px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600">

            <SendIcon className="h-4 w-4" aria-hidden="true" />
            Submit for review
          </button>
          <button
            type="button"
            onClick={() => updateWorkspace({ diagnosticDraft: { ...actor.diagnostic }, diagnosticSubmitted: false })}
            disabled={!draftChanged}
            className="inline-flex min-h-[44px] items-center rounded-full px-4 text-[13.5px] font-medium text-gray-700 hover:text-gray-900 disabled:cursor-not-allowed disabled:text-gray-400">

            Reset to submitted
          </button>
          <p role="status" className="basis-full text-[12.5px] text-emerald-800">
            {workspace.diagnosticSubmitted && 'Submitted. A desk officer will review it — your tier stays the same until they do.'}
          </p>
        </div>
      </section>
    </WorkspaceLayout>);

}
