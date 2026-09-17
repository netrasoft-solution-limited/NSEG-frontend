import React, { useRef, useState } from 'react';
import { PlusIcon, SendIcon, ShieldAlertIcon, Trash2Icon, XIcon } from 'lucide-react';
import { BuyerLayout } from '../components/workspace/BuyerLayout';
import { sectors } from '../data/sectors';
import type { CriteriaKind } from '../data/opportunities';
import type { SupplyModeId } from '../data/regulations';
import { useBuyerSession, type BuyerDraftRequest, type RequestCriterion } from '../lib/buyerSession';
import {
  buyerOpportunities,
  buyerStanding,
  canSubmitRequests,
  requestStatusFor,
  requestStatusSteps,
  type RequestStatus } from
'../lib/buyerWorkspace';
import { modeLabel, sectorLabel } from '../lib/marketplaceLookups';
import { useAuditLog } from '../lib/auditLog';
import { useGatewayExchange, type RequestDecision } from '../lib/gatewayExchange';

const criteriaKinds: { id: CriteriaKind; label: string; help: string }[] = [
{ id: 'mandatory', label: 'Mandatory', help: 'Exporters who don’t meet it are excluded' },
{ id: 'preferred', label: 'Preferred', help: 'Counts in their favour' },
{ id: 'negotiable', label: 'Negotiable', help: 'Open to discussion' },
{ id: 'informational', label: 'Informational', help: 'Context only' }];


const modes: { id: SupplyModeId; label: string }[] = [
{ id: 'mode1', label: 'Delivered remotely from Nigeria' },
{ id: 'mode4', label: 'Exporter travels to us' },
{ id: 'mode2', label: 'We travel to Nigeria' },
{ id: 'mode3', label: 'Through the exporter’s local office' }];


interface FormState {
  title: string;
  sectorCode: string;
  mode: SupplyModeId | '';
  budgetMin: string;
  budgetMax: string;
  targetCompletion: string;
  summary: string;
  criteria: RequestCriterion[];
}

const emptyForm: FormState = {
  title: '',
  sectorCode: '',
  mode: '',
  budgetMin: '',
  budgetMax: '',
  targetCompletion: '',
  summary: '',
  criteria: [{ kind: 'mandatory', label: '' }]
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (!form.title.trim()) errors.title = 'Give the request a title exporters will recognise.';
  if (!form.sectorCode) errors.sectorCode = 'Choose the service sector.';
  if (!form.mode) errors.mode = 'Choose how the work will be delivered.';
  const min = Number(form.budgetMin);
  const max = Number(form.budgetMax);
  if (!form.budgetMin || !form.budgetMax || min <= 0 || max <= 0) {
    errors.budgetMin = 'Enter a budget range in US dollars.';
  } else if (min > max) {
    errors.budgetMin = 'The lower figure must not be above the upper figure.';
  }
  if (!form.targetCompletion) errors.targetCompletion = 'Choose a target completion date.';
  if (!form.summary.trim()) errors.summary = 'Describe the work in a sentence or two.';
  if (!form.criteria.some((criterion) => criterion.kind === 'mandatory' && criterion.label.trim())) {
    errors.criteria = 'Add at least one mandatory criterion so exporters can self-qualify.';
  }
  return errors;
}

const inputClass =
'w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-500 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/15 aria-[invalid=true]:border-rose-600';

function FieldError({ id, message }: {id: string;message?: string;}) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-[12.5px] text-rose-700">
      {message}
    </p>);

}

const decisionStatus: Record<Exclude<RequestDecision, 'rejected'>, RequestStatus> = {
  pending: 'awaiting-qualification',
  qualified: 'published'
};

function StatusTrack({ status }: {status: RequestStatus | 'not-qualified';}) {
  if (status === 'not-qualified') {
    return (
      <p className="rounded-xl bg-rose-50 p-3 text-[12.5px] leading-relaxed text-rose-900">
        <span className="font-semibold">Not qualified.</span> A desk officer couldn't qualify this request as written
        and will contact you about what to change.
      </p>);

  }
  const index = requestStatusSteps.findIndex((step) => step.id === status);
  return (
    <div>
      <p className="text-[12.5px] text-gray-700">
        Status: <span className="font-semibold text-gray-900">{requestStatusSteps[index].label}</span>
      </p>
      <ol className="mt-1.5 flex gap-1" aria-hidden="true">
        {requestStatusSteps.map((step, stepIndex) =>
        <li
          key={step.id}
          title={step.label}
          className={`h-1.5 flex-1 rounded-full ${stepIndex <= index ? 'bg-gray-900' : 'bg-gray-200'}`} />

        )}
      </ol>
    </div>);

}

export function BuyerRequests() {
  const { buyer, state, update } = useBuyerSession();
  const { logEvent } = useAuditLog();
  const exchange = useGatewayExchange();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [gateShown, setGateShown] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeIsWarning, setNoticeIsWarning] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const standing = buyerStanding(buyer);
  const seeded = buyerOpportunities(buyer);
  const submitted = exchange.requests.filter((request) => request.buyerId === buyer.id);

  const sendForQualification = (request: BuyerDraftRequest) => {
    exchange.submitRequest({ ...request, buyerId: buyer.id });
    logEvent(`${buyer.name} submitted "${request.title}" for qualification`, 'opportunities', buyer.name);
    setNoticeIsWarning(false);
    setNotice(`"${request.title}" was sent to a desk officer for qualification.`);
  };
  const set = (patch: Partial<FormState>) => setForm((current) => ({ ...current, ...patch }));

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyForm);
    setErrors({});
    setGateShown(false);
  };

  const save = (submit: boolean) => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }
    if (submit && !canSubmitRequests(buyer)) {
      setGateShown(true);
      return;
    }
    const request: BuyerDraftRequest = {
      id: `req-${Date.now()}`,
      title: form.title.trim(),
      sectorCode: form.sectorCode,
      mode: form.mode as SupplyModeId,
      budgetMin: Number(form.budgetMin),
      budgetMax: Number(form.budgetMax),
      targetCompletion: form.targetCompletion,
      summary: form.summary.trim(),
      criteria: form.criteria.filter((criterion) => criterion.label.trim())
    };
    if (submit) {
      sendForQualification(request);
    } else {
      update({ drafts: [request, ...state.drafts] });
      setNoticeIsWarning(false);
      setNotice(`"${request.title}" was saved as a draft.`);
    }
    closeForm();
  };

  const submitDraft = (request: BuyerDraftRequest) => {
    if (!canSubmitRequests(buyer)) {
      setNoticeIsWarning(true);
      setNotice(`Verify your company registration before submitting "${request.title}". ${standing.nextAction}`);
      return;
    }
    update({ drafts: state.drafts.filter((item) => item.id !== request.id) });
    sendForQualification(request);
  };

  const errorList = Object.values(errors).filter(Boolean);

  return (
    <BuyerLayout
      title="Requests"
      intro="Describe the work you need. A NATEP desk officer qualifies every request before exporters see it, so it arrives as real, credible demand.">

      <p
        role="status"
        className={
        notice ?
        `mb-4 rounded-xl p-3 text-[13px] ${noticeIsWarning ? 'bg-amber-50 text-amber-900' : 'bg-emerald-50 text-emerald-900'}` :
        'sr-only'
        }>
        {notice}
      </p>

      {!formOpen ?
      <button
        type="button"
        onClick={() => {
          setFormOpen(true);
          setNotice('');
        }}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-gray-900 px-5 text-[13.5px] font-semibold text-white hover:bg-black">

          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          New request
        </button> :

      <section aria-labelledby="new-request" className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 id="new-request" className="text-[17px] font-semibold text-gray-900">
              New request
            </h2>
            <button
            type="button"
            onClick={closeForm}
            aria-label="Close the new request form"
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-600 hover:bg-gray-50 hover:text-gray-900">

              <XIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {errorList.length > 0 &&
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[13px] text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-600">

              <p className="font-semibold">Check {errorList.length === 1 ? 'this field' : `these ${errorList.length} fields`}:</p>
              <ul className="mt-1 list-disc pl-5">
                {errorList.map((message) =>
            <li key={message}>{message}</li>
            )}
              </ul>
            </div>
        }

          <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            save(true);
          }}
          className="mt-4 space-y-4">

            <div>
              <label htmlFor="req-title" className="block text-[13px] font-medium text-gray-800">
                Title
              </label>
              <input
              id="req-title"
              value={form.title}
              onChange={(event) => set({ title: event.target.value })}
              placeholder="e.g. Tier-1 helpdesk coverage pilot"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'req-title-error' : undefined}
              className={`mt-1 ${inputClass}`} />

              <FieldError id="req-title-error" message={errors.title} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="req-sector" className="block text-[13px] font-medium text-gray-800">
                  Service sector
                </label>
                <select
                id="req-sector"
                value={form.sectorCode}
                onChange={(event) => set({ sectorCode: event.target.value })}
                aria-invalid={Boolean(errors.sectorCode)}
                aria-describedby={errors.sectorCode ? 'req-sector-error' : undefined}
                className={`mt-1 ${inputClass}`}>

                  <option value="">Choose a sector</option>
                  {sectors.map((sector) =>
                <option key={sector.code} value={sector.code}>
                      {sector.label}
                    </option>
                )}
                </select>
                <FieldError id="req-sector-error" message={errors.sectorCode} />
              </div>
              <div>
                <label htmlFor="req-mode" className="block text-[13px] font-medium text-gray-800">
                  How it will be delivered
                </label>
                <select
                id="req-mode"
                value={form.mode}
                onChange={(event) => set({ mode: event.target.value as SupplyModeId })}
                aria-invalid={Boolean(errors.mode)}
                aria-describedby={errors.mode ? 'req-mode-error' : undefined}
                className={`mt-1 ${inputClass}`}>

                  <option value="">Choose a delivery mode</option>
                  {modes.map((mode) =>
                <option key={mode.id} value={mode.id}>
                      {mode.label}
                    </option>
                )}
                </select>
                <FieldError id="req-mode-error" message={errors.mode} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <fieldset>
                <legend className="text-[13px] font-medium text-gray-800">Budget range (USD)</legend>
                <div className="mt-1 flex items-center gap-2">
                  <label htmlFor="req-min" className="sr-only">
                    Lowest budget in US dollars
                  </label>
                  <input
                  id="req-min"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={form.budgetMin}
                  onChange={(event) => set({ budgetMin: event.target.value })}
                  placeholder="From"
                  aria-invalid={Boolean(errors.budgetMin)}
                  aria-describedby={errors.budgetMin ? 'req-budget-error' : undefined}
                  className={inputClass} />

                  <span className="text-gray-600" aria-hidden="true">
                    –
                  </span>
                  <label htmlFor="req-max" className="sr-only">
                    Highest budget in US dollars
                  </label>
                  <input
                  id="req-max"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={form.budgetMax}
                  onChange={(event) => set({ budgetMax: event.target.value })}
                  placeholder="To"
                  aria-invalid={Boolean(errors.budgetMin)}
                  aria-describedby={errors.budgetMin ? 'req-budget-error' : undefined}
                  className={inputClass} />

                </div>
                <FieldError id="req-budget-error" message={errors.budgetMin} />
              </fieldset>
              <div>
                <label htmlFor="req-date" className="block text-[13px] font-medium text-gray-800">
                  Target completion
                </label>
                <input
                id="req-date"
                type="date"
                value={form.targetCompletion}
                onChange={(event) => set({ targetCompletion: event.target.value })}
                aria-invalid={Boolean(errors.targetCompletion)}
                aria-describedby={errors.targetCompletion ? 'req-date-error' : undefined}
                className={`mt-1 ${inputClass}`} />

                <FieldError id="req-date-error" message={errors.targetCompletion} />
              </div>
            </div>

            <div>
              <label htmlFor="req-summary" className="block text-[13px] font-medium text-gray-800">
                What you need
              </label>
              <textarea
              id="req-summary"
              rows={3}
              value={form.summary}
              onChange={(event) => set({ summary: event.target.value })}
              aria-invalid={Boolean(errors.summary)}
              aria-describedby={errors.summary ? 'req-summary-error' : undefined}
              className={`mt-1 ${inputClass}`} />

              <FieldError id="req-summary-error" message={errors.summary} />
            </div>

            <fieldset aria-describedby={errors.criteria ? 'req-criteria-error' : 'req-criteria-help'}>
              <legend className="text-[13px] font-medium text-gray-800">Criteria</legend>
              <p id="req-criteria-help" className="text-[12.5px] text-gray-600">
                Mandatory criteria are always shown to exporters so they can self-qualify.{' '}
                {criteriaKinds.map((kind) => `${kind.label}: ${kind.help.toLowerCase()}.`).join(' ')}
              </p>
              <ul className="mt-2 space-y-2">
                {form.criteria.map((criterion, index) =>
              <li key={index} className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3 sm:flex-row sm:items-center">
                    <label htmlFor={`req-kind-${index}`} className="sr-only">
                      Criterion {index + 1} type
                    </label>
                    <select
                  id={`req-kind-${index}`}
                  value={criterion.kind}
                  onChange={(event) =>
                  set({
                    criteria: form.criteria.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, kind: event.target.value as CriteriaKind } : item
                    )
                  })
                  }
                  className={`${inputClass} sm:w-44`}>

                      {criteriaKinds.map((kind) =>
                  <option key={kind.id} value={kind.id}>
                          {kind.label}
                        </option>
                  )}
                    </select>
                    <label htmlFor={`req-criterion-${index}`} className="sr-only">
                      Criterion {index + 1}
                    </label>
                    <input
                  id={`req-criterion-${index}`}
                  value={criterion.label}
                  onChange={(event) =>
                  set({
                    criteria: form.criteria.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, label: event.target.value } : item
                    )
                  })
                  }
                  placeholder="e.g. ISO 27001 certificate in force"
                  className={`${inputClass} flex-1`} />

                    <button
                  type="button"
                  onClick={() => set({ criteria: form.criteria.filter((_, itemIndex) => itemIndex !== index) })}
                  disabled={form.criteria.length === 1}
                  aria-label={`Remove criterion ${index + 1}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-full text-gray-600 hover:bg-gray-50 hover:text-rose-700 disabled:hidden sm:self-auto">

                      <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
              )}
              </ul>
              <FieldError id="req-criteria-error" message={errors.criteria} />
              <button
              type="button"
              onClick={() => set({ criteria: [...form.criteria, { kind: 'preferred', label: '' }] })}
              className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-gray-800 hover:bg-gray-50">

                <PlusIcon className="h-4 w-4" aria-hidden="true" />
                Add criterion
              </button>
            </fieldset>

            {gateShown &&
          <div role="alert" className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
                <ShieldAlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
                <div className="text-[13px] leading-relaxed text-amber-900">
                  <p className="font-semibold">Verify your company before submitting</p>
                  <p className="mt-0.5">
                    Desk officers only qualify requests from companies confirmed against a business registry. {standing.nextAction} You
                    can save this as a draft in the meantime.
                  </p>
                </div>
              </div>
          }

            <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              <button
              type="submit"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-gray-900 px-5 text-[13.5px] font-semibold text-white hover:bg-black">

                <SendIcon className="h-4 w-4" aria-hidden="true" />
                Submit for qualification
              </button>
              <button
              type="button"
              onClick={() => save(false)}
              className="inline-flex min-h-[44px] items-center rounded-full border border-gray-300 px-5 text-[13.5px] font-medium text-gray-800 hover:border-gray-500">

                Save as draft
              </button>
            </div>
          </form>
        </section>
      }

      <section aria-labelledby="my-requests" className="mt-6">
        <h2 id="my-requests" className="text-[15px] font-semibold text-gray-900">
          Your requests
        </h2>
        <ul className="mt-3 space-y-3">
          {[...state.drafts.map((request) => ({ request, status: 'draft' as const })),
          ...submitted.map((request) => ({
            request,
            status: request.decision === 'rejected' ? 'not-qualified' as const : decisionStatus[request.decision]
          }))].map(({ request, status }) =>
          <li key={request.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-[15px] font-semibold text-gray-900">{request.title}</h3>
                  <p className="mt-0.5 text-[12.5px] text-gray-600">
                    {sectorLabel(request.sectorCode)} · {modeLabel(request.mode)} · USD{' '}
                    {request.budgetMin.toLocaleString()}–{request.budgetMax.toLocaleString()} · by {request.targetCompletion}
                  </p>
                </div>
                {status === 'draft' &&
              <button
                type="button"
                onClick={() => submitDraft(request as BuyerDraftRequest)}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-gray-300 px-4 text-[13px] font-medium text-gray-800 hover:border-gray-500">

                    <SendIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Submit
                  </button>
              }
              </div>
              <div className="mt-3">
                <StatusTrack status={status} />
              </div>
            </li>
          )}
          {seeded.map((opportunity) =>
          <li key={opportunity.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-[15px] font-semibold text-gray-900">{opportunity.title}</h3>
              <p className="mt-0.5 text-[12.5px] text-gray-600">
                {sectorLabel(opportunity.sectorCode)} · {modeLabel(opportunity.mode)}
                {opportunity.indicativeValue &&
              ` · ${opportunity.indicativeValue.unit} ${opportunity.indicativeValue.min.toLocaleString()}–${opportunity.indicativeValue.max.toLocaleString()}`}{' '}
                · posted {opportunity.postedOn}
              </p>
              <div className="mt-3">
                <StatusTrack status={requestStatusFor(opportunity)} />
              </div>
            </li>
          )}
        </ul>
        {state.drafts.length === 0 && submitted.length === 0 && seeded.length === 0 &&
        <p className="mt-2 text-[13.5px] text-gray-600">No requests yet.</p>
        }
      </section>
    </BuyerLayout>);

}
