import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, CirclePlusIcon, PlusIcon, SendIcon, ShieldAlertIcon, Trash2Icon } from 'lucide-react';
import { BuyerLayout } from '../components/workspace/BuyerLayout';
import { StepProgress } from '../components/workspace/FormField';
import { DataTable, EmptyState, KeyValue, Tag, primaryLinkClass } from '../components/workspace/WorkspaceUI';
import { sectors } from '../data/sectors';
import type { CriteriaKind } from '../data/opportunities';
import { requirementCategoryLabels, type SupplyModeId } from '../data/regulations';
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
import { usePendingAction } from '../lib/usePendingAction';
import { useRegulatoryRegister } from '../lib/regulatoryRegister';
import { Spinner } from '../components/common/Spinner';
import { useGatewayExchange } from '../lib/gatewayExchange';

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

const wizardSteps = ['What you need', 'Scale and timing', 'Confirm'];

/** Validation for one wizard step, so buyers fix problems where they made them. */
function validateStep(form: FormState, step: number): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (!form.title.trim()) errors.title = 'Give the requirement a title exporters will recognise.';
    if (!form.sectorCode) errors.sectorCode = 'Choose the service sector.';
    if (!form.mode) errors.mode = 'Choose how the work will be delivered.';
    if (!form.summary.trim()) errors.summary = 'Describe the work in a sentence or two.';
  }
  if (step === 1) {
    const min = Number(form.budgetMin);
    const max = Number(form.budgetMax);
    if (!form.budgetMin || !form.budgetMax || min <= 0 || max <= 0) {
      errors.budgetMin = 'Enter a budget range in US dollars.';
    } else if (min > max) {
      errors.budgetMin = 'The lower figure must not be above the upper figure.';
    }
    if (!form.targetCompletion) errors.targetCompletion = 'Choose a target completion date.';
    if (!form.criteria.some((criterion) => criterion.kind === 'mandatory' && criterion.label.trim())) {
      errors.criteria = 'Add at least one mandatory criterion so exporters can self-qualify.';
    }
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

const labelClass = 'block text-[13px] font-medium text-gray-800';

/** "Place a requirement": a three-step wizard ending on a confirmation that shows which
 * published rules will be attached. */
export function BuyerPlaceRequirement() {
  const { buyer, state, update } = useBuyerSession();
  const { logEvent } = useAuditLog();
  const exchange = useGatewayExchange();
  const { requirements } = useRegulatoryRegister();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [gateShown, setGateShown] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const standing = buyerStanding(buyer);
  const { run, pending, isPending } = usePendingAction();

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const set = (patch: Partial<FormState>) => setForm((current) => ({ ...current, ...patch }));
  const errorList = Object.values(errors).filter(Boolean);

  const next = () => {
    const nextErrors = validateStep(form, step);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }
    setStep((current) => current + 1);
  };

  const toRequest = (): BuyerDraftRequest => ({
    id: `req-${Date.now()}`,
    title: form.title.trim(),
    sectorCode: form.sectorCode,
    mode: form.mode as SupplyModeId,
    budgetMin: Number(form.budgetMin),
    budgetMax: Number(form.budgetMax),
    targetCompletion: form.targetCompletion,
    summary: form.summary.trim(),
    criteria: form.criteria.filter((criterion) => criterion.label.trim())
  });

  const saveDraft = () => {
    const request = toRequest();
    update({ drafts: [request, ...state.drafts] });
    navigate('/buyer/requests', { state: { notice: `"${request.title}" was saved as a draft.` } });
  };

  const submit = () => {
    if (!canSubmitRequests(buyer)) {
      setGateShown(true);
      return;
    }
    const request = toRequest();
    run('submit-new', () => {
      exchange.submitRequest({ ...request, buyerId: buyer.id });
      logEvent(`${buyer.name} submitted "${request.title}" for qualification`, 'opportunities', buyer.name);
      navigate('/buyer/requests', {
        state: { notice: `"${request.title}" was sent to a desk officer for qualification.` }
      });
    });
  };

  const attached = form.sectorCode && form.mode ?
  requirements.filter(
    (item) =>
    item.status !== 'superseded' && (
    !item.sectorCode || item.sectorCode === form.sectorCode) && (
    !item.appliesTo.modes || item.appliesTo.modes.includes(form.mode as SupplyModeId))
  ) :
  [];

  return (
    <BuyerLayout
      title="Place a requirement"
      intro="Tell us what you need. A desk officer checks it is credible, attaches the rules that apply, and compares it against evidenced Nigerian capability. You never receive an automated shortlist.">

      <section aria-labelledby="wizard-step" className="max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
        <StepProgress steps={wizardSteps} current={step} />

        <h2
          id="wizard-step"
          ref={headingRef}
          tabIndex={-1}
          className="mt-6 font-display text-[22px] font-semibold tracking-[-0.01em] text-gray-900 focus:outline-none">

          {wizardSteps[step]}
        </h2>

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
            if (step < wizardSteps.length - 1) next();else
            submit();
          }}
          className="mt-5 space-y-4">

          {step === 0 &&
          <>
              <div>
                <label htmlFor="req-title" className={labelClass}>
                  Short title for the requirement
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
                  <label htmlFor="req-sector" className={labelClass}>
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
                  <label htmlFor="req-mode" className={labelClass}>
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
              <div>
                <label htmlFor="req-summary" className={labelClass}>
                  Describe what you need
                </label>
                <textarea
                id="req-summary"
                rows={4}
                value={form.summary}
                onChange={(event) => set({ summary: event.target.value })}
                placeholder="Scope, standards, working pattern — anything an exporter would need to respond sensibly."
                aria-invalid={Boolean(errors.summary)}
                aria-describedby={errors.summary ? 'req-summary-error' : undefined}
                className={`mt-1 ${inputClass}`} />

                <FieldError id="req-summary-error" message={errors.summary} />
              </div>
            </>
          }

          {step === 1 &&
          <>
              <div className="grid gap-4 sm:grid-cols-2">
                <fieldset>
                  <legend className={labelClass}>Budget range (USD)</legend>
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
                  <label htmlFor="req-date" className={labelClass}>
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

              <p className="rounded-xl bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-950">
                <span className="font-semibold">Why we ask for value.</span> It is used to check credibility and to report
                verified export earnings. The Gateway never processes payments and never holds funds.
              </p>

              <fieldset aria-describedby={errors.criteria ? 'req-criteria-error' : 'req-criteria-help'}>
                <legend className={labelClass}>Criteria</legend>
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
            </>
          }

          {step === 2 &&
          <>
              <dl className="grid gap-x-6 gap-y-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
                <KeyValue label="Requirement">{form.title}</KeyValue>
                <KeyValue label="Service sector">{sectorLabel(form.sectorCode)}</KeyValue>
                <KeyValue label="Delivery">{modes.find((mode) => mode.id === form.mode)?.label}</KeyValue>
                <KeyValue label="Budget">
                  USD {Number(form.budgetMin).toLocaleString()}–{Number(form.budgetMax).toLocaleString()}
                </KeyValue>
                <KeyValue label="Target completion">{form.targetCompletion}</KeyValue>
                <KeyValue label="Buyer">
                  {buyer.name}, {buyer.region}
                </KeyValue>
              </dl>

              <div>
                <h3 className="text-[14.5px] font-semibold text-gray-900">Rules that will be attached</h3>
                <p className="mt-0.5 text-[12.5px] text-gray-600">
                  Pinned to the exact published version. If one is revised later, this requirement is flagged for review.
                </p>
                {attached.length === 0 ?
              <p className="mt-2 text-[13px] text-gray-600">
                    No published requirement matches this combination yet. Your requirement will be flagged for content
                    authoring.
                  </p> :

              <ul className="mt-2 divide-y divide-gray-100">
                    {attached.map((item) =>
                <li key={item.id} className="flex flex-wrap items-start gap-3 py-2.5">
                        <Tag tone={item.category === 'statutory' ? 'gold' : item.category === 'buyer-standard' ? 'neutral' : 'green'}>
                          {requirementCategoryLabels[item.category]}
                        </Tag>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13.5px] font-medium text-gray-900">{item.title}</span>
                          <span className="block font-mono text-[11.5px] text-gray-500">
                            {item.id} v{item.version} · {item.authority}
                          </span>
                        </span>
                      </li>
                )}
                  </ul>
              }
              </div>

              {gateShown &&
            <div role="alert" className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
                  <ShieldAlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
                  <div className="text-[13px] leading-relaxed text-amber-900">
                    <p className="font-semibold">Verify your company before submitting</p>
                    <p className="mt-0.5">
                      Desk officers only qualify requirements from companies confirmed against a business registry.{' '}
                      {standing.nextAction} You can save this as a draft in the meantime.
                    </p>
                    {buyer.verificationQueue === 'none' &&
                <Link to="/buyer?verify=1" className="mt-2 inline-flex min-h-[44px] items-center font-semibold text-amber-950 underline underline-offset-2">
                        Verify your company now
                      </Link>
                }
                  </div>
                </div>
            }
            </>
          }

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-5">
            {step > 0 ?
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setStep((current) => current - 1);
              }}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-gray-300 px-5 text-[13.5px] font-medium text-gray-800 hover:border-gray-500">

                <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
                Back
              </button> :

            <span />
            }
            <div className="flex flex-wrap gap-2">
              {step === wizardSteps.length - 1 &&
              <button
                type="button"
                disabled={Boolean(pending)}
                onClick={saveDraft}
                className="inline-flex min-h-[44px] items-center rounded-full border border-gray-300 px-5 text-[13.5px] font-medium text-gray-800 hover:border-gray-500">

                  Save as draft
                </button>
              }
              <button
                type="submit"
                disabled={Boolean(pending)}
                aria-busy={isPending('submit-new') || undefined}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-gray-900 px-5 text-[13.5px] font-semibold text-white hover:bg-black disabled:cursor-progress disabled:bg-gray-800">

                {step < wizardSteps.length - 1 ?
                <>
                    Continue
                    <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                  </> :
                isPending('submit-new') ?
                <>
                    <Spinner />
                    Sending to a desk officer…
                  </> :

                <>
                    <SendIcon className="h-4 w-4" aria-hidden="true" />
                    Submit requirement
                  </>
                }
              </button>
            </div>
          </div>
        </form>
      </section>
    </BuyerLayout>);

}

type RowStatus = RequestStatus | 'not-qualified';

function statusTag(status: RowStatus) {
  if (status === 'not-qualified') return <Tag tone="clay">Not qualified</Tag>;
  const label = requestStatusSteps.find((step) => step.id === status)?.label;
  const tone = status === 'draft' ? 'neutral' : status === 'awaiting-qualification' ? 'gold' : status === 'in-delivery' ? 'ok' : 'green';
  return <Tag tone={tone}>{label}</Tag>;
}

/** "My requirements": every requirement with its stage, including drafts that can still be sent. */
export function BuyerMyRequirements() {
  const { buyer, state, update } = useBuyerSession();
  const { logEvent } = useAuditLog();
  const exchange = useGatewayExchange();
  const location = useLocation();
  const [notice, setNotice] = useState((location.state as {notice?: string;} | null)?.notice ?? '');
  const [noticeIsWarning, setNoticeIsWarning] = useState(false);
  const standing = buyerStanding(buyer);
  const seeded = buyerOpportunities(buyer);
  const submitted = exchange.requests.filter((request) => request.buyerId === buyer.id);
  const { run, pending, isPending } = usePendingAction();

  const submitDraft = (request: BuyerDraftRequest) => {
    if (!canSubmitRequests(buyer)) {
      setNoticeIsWarning(true);
      setNotice(`Verify your company registration before submitting "${request.title}". ${standing.nextAction}`);
      return;
    }
    run(request.id, () => {
      update({ drafts: state.drafts.filter((item) => item.id !== request.id) });
      exchange.submitRequest({ ...request, buyerId: buyer.id });
      logEvent(`${buyer.name} submitted "${request.title}" for qualification`, 'opportunities', buyer.name);
      setNoticeIsWarning(false);
      setNotice(`"${request.title}" was sent to a desk officer for qualification.`);
    });
  };

  const rows = [
  ...state.drafts.map((request) => ({
    id: request.id,
    title: request.title,
    sector: sectorLabel(request.sectorCode),
    mode: modeLabel(request.mode),
    value: `USD ${request.budgetMin.toLocaleString()}–${request.budgetMax.toLocaleString()}`,
    status: 'draft' as RowStatus,
    draft: request
  })),
  ...submitted.map((request) => ({
    id: request.id,
    title: request.title,
    sector: sectorLabel(request.sectorCode),
    mode: modeLabel(request.mode),
    value: `USD ${request.budgetMin.toLocaleString()}–${request.budgetMax.toLocaleString()}`,
    status: (request.decision === 'rejected' ? 'not-qualified' : request.decision === 'pending' ? 'awaiting-qualification' : 'published') as RowStatus,
    draft: undefined
  })),
  ...seeded.map((opportunity) => ({
    id: opportunity.id,
    title: opportunity.title,
    sector: sectorLabel(opportunity.sectorCode),
    mode: modeLabel(opportunity.mode),
    value: opportunity.indicativeValue ?
    `${opportunity.indicativeValue.unit} ${opportunity.indicativeValue.min.toLocaleString()}–${opportunity.indicativeValue.max.toLocaleString()}` :
    'Not stated',
    status: requestStatusFor(opportunity) as RowStatus,
    draft: undefined
  }))];


  return (
    <BuyerLayout
      title="My requirements"
      intro="Every stage of every requirement, with the decisions and who took them."
      actions={
      <Link to="/buyer/requests/new" className={primaryLinkClass}>
          <CirclePlusIcon className="h-4 w-4" aria-hidden="true" />
          Place a requirement
        </Link>
      }>

      <p
        role="status"
        className={
        notice ?
        `mb-4 rounded-xl p-3 text-[13px] ${noticeIsWarning ? 'bg-amber-50 text-amber-900' : 'bg-emerald-50 text-emerald-900'}` :
        'sr-only'
        }>

        {notice}
      </p>

      {rows.length === 0 ?
      <EmptyState
        title="Nothing placed yet"
        action={
        <Link to="/buyer/requests/new" className="inline-flex min-h-[44px] items-center rounded-full bg-gray-900 px-5 text-[13.5px] font-semibold text-white hover:bg-black">
              Place a requirement
            </Link>
        }>

          Requirements you submit appear here with their current stage and full history.
        </EmptyState> :

      <DataTable label="Your requirements" head={['Requirement', 'Sector', 'Budget', 'Stage', '']}>
          {rows.map((row) =>
        <tr key={row.id} className="align-top">
              <td className="px-4 py-3.5">
                <p className="text-[14px] font-semibold text-gray-900">{row.title}</p>
                <p className="mt-0.5 font-mono text-[11.5px] text-gray-500">{row.id.toUpperCase()}</p>
              </td>
              <td className="px-4 py-3.5 text-[13px] text-gray-700">
                {row.sector}
                <span className="block text-[12px] text-gray-500">{row.mode}</span>
              </td>
              <td className="px-4 py-3.5 text-[13px] font-medium text-gray-800">{row.value}</td>
              <td className="px-4 py-3.5">
                {statusTag(row.status)}
                {row.status === 'not-qualified' &&
            <p className="mt-1 max-w-[220px] text-[12px] text-gray-600">A desk officer will contact you about what to change.</p>
            }
              </td>
              <td className="px-4 py-3.5 text-right">
                {row.draft &&
            <button
              type="button"
              onClick={() => submitDraft(row.draft!)}
              disabled={Boolean(pending)}
              aria-busy={isPending(row.id) || undefined}
              className="inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-full border border-gray-300 px-3.5 text-[13px] font-medium text-gray-800 hover:border-gray-500 disabled:cursor-progress">

                    {isPending(row.id) ? <Spinner className="h-3.5 w-3.5" /> : <SendIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                    {isPending(row.id) ? 'Sending…' : 'Submit'}
                    <span className="sr-only"> {row.title}</span>
                  </button>
            }
              </td>
            </tr>
        )}
        </DataTable>
      }
    </BuyerLayout>);

}
