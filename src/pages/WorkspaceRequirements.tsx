import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircle2Icon, CircleDashedIcon, HourglassIcon, InfoIcon, PencilIcon } from 'lucide-react';
import { WorkspaceLayout } from '../components/workspace/WorkspaceLayout';
import { sectors } from '../data/sectors';
import {
  requirementCategoryLabels,
  targetMarkets,
  type SupplyModeId,
  type TargetMarketId } from
'../data/regulations';
import { trackLabels, type ExporterTrack } from '../data/trustTiers';
import { useExporterSession, type WizardAnswers } from '../lib/exporterSession';
import { buildPathway, type PathwayAnswers } from '../lib/requirementsPathway';
import { useRegulatoryRegister } from '../lib/regulatoryRegister';

const modeOptions: { id: SupplyModeId; label: string; detail: string }[] = [
{ id: 'mode1', label: 'Remotely, from Nigeria', detail: 'You deliver online or by phone. WTO/GATS Mode 1.' },
{ id: 'mode4', label: 'I travel to the client', detail: 'You or your staff go abroad to do the work. Mode 4.' },
{ id: 'mode2', label: 'The client comes to Nigeria', detail: 'For example training, medical or tourism services. Mode 2.' },
{ id: 'mode3', label: 'Through an office abroad', detail: 'You have a branch or subsidiary in the client’s country. Mode 3.' }];


const trackOptions: { id: ExporterTrack; detail: string }[] = [
{ id: 'firm', detail: 'You have a CAC-registered company or business name.' },
{ id: 'individual', detail: 'You work in your own name without CAC registration.' }];


interface Option {
  id: string;
  label: string;
  detail?: string;
}

function OptionGroup({
  name,
  options,
  value,
  onChange




}: {name: string;options: Option[];value?: string;onChange: (id: string) => void;}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const checked = option.id === value;
        return (
          <label
            key={option.id}
            className={`flex min-h-[56px] cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors duration-150 ease-out has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gray-900 ${
            checked ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-400'}`
            }>

            <input
              type="radio"
              name={name}
              value={option.id}
              checked={checked}
              onChange={() => onChange(option.id)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-gray-900" />

            <span>
              <span className="block text-[14px] font-medium text-gray-900">{option.label}</span>
              {option.detail && <span className="mt-0.5 block text-[12.5px] text-gray-600">{option.detail}</span>}
            </span>
          </label>);

      })}
    </div>);

}

const steps = ['Exporting as', 'Service', 'Delivery', 'Clients'] as const;

function isComplete(answers: WizardAnswers): answers is PathwayAnswers {
  return Boolean(answers.sectorCode && answers.mode && answers.market);
}

export function WorkspaceRequirements() {
  const { actor, workspace, updateWorkspace } = useExporterSession();
  const { requirements } = useRegulatoryRegister();
  const answers = workspace.wizard;
  const [step, setStep] = useState(() => isComplete(answers) ? steps.length : 0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Switching the demo account starts that exporter's own wizard.
  useEffect(() => {
    setStep(isComplete(workspace.wizard) ? steps.length : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor.id]);

  // Move focus to the new step's heading so screen reader users hear where they are.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const setAnswer = (patch: Partial<WizardAnswers>) => updateWorkspace({ wizard: { ...answers, ...patch } });

  const stepAnswered = [true, Boolean(answers.sectorCode), Boolean(answers.mode), Boolean(answers.market)];
  const showPathway = step === steps.length && isComplete(answers);
  const pathway = showPathway ? buildPathway(answers, actor.verifiedEvidence, requirements) : null;

  return (
    <WorkspaceLayout
      title="Requirements"
      intro="Answer four questions about how you export. You get the requirements that apply to you, in the order to tackle them.">

      {!showPathway &&
      <section aria-labelledby="wizard-step" className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <ol className="flex flex-wrap gap-x-4 gap-y-1 text-[12px]" aria-label="Wizard progress">
            {steps.map((label, index) =>
          <li
            key={label}
            aria-current={index === step ? 'step' : undefined}
            className={index === step ? 'font-semibold text-gray-900' : index < step ? 'text-gray-700' : 'text-gray-500'}>

                {index + 1}. {label}
              </li>
          )}
          </ol>

          <h2
          id="wizard-step"
          ref={headingRef}
          tabIndex={-1}
          className="mt-4 text-[17px] font-semibold text-gray-900 focus:outline-none">

            {step === 0 && 'Are you exporting as a company or as yourself?'}
            {step === 1 && 'What service do you export?'}
            {step === 2 && 'How do you deliver it?'}
            {step === 3 && 'Where are your clients?'}
          </h2>

          <fieldset className="mt-4">
            <legend className="sr-only">{steps[step]}</legend>
            {step === 0 &&
          <OptionGroup
            name="track"
            value={answers.track}
            onChange={(id) => setAnswer({ track: id as ExporterTrack })}
            options={trackOptions.map((option) => ({ id: option.id, label: trackLabels[option.id], detail: option.detail }))} />

          }
            {step === 1 &&
          <OptionGroup
            name="sector"
            value={answers.sectorCode}
            onChange={(id) => setAnswer({ sectorCode: id })}
            options={sectors.map((sector) => ({ id: sector.code, label: sector.label, detail: `UN CPC ${sector.code}` }))} />

          }
            {step === 2 &&
          <OptionGroup name="mode" value={answers.mode} onChange={(id) => setAnswer({ mode: id as SupplyModeId })} options={modeOptions} />
          }
            {step === 3 &&
          <OptionGroup
            name="market"
            value={answers.market}
            onChange={(id) => setAnswer({ market: id as TargetMarketId })}
            options={targetMarkets} />

          }
          </fieldset>

          {step === 0 && answers.track !== actor.track &&
        <p className="mt-3 text-[12.5px] text-amber-800">
              Your account is registered as {trackLabels[actor.track].toLowerCase()}. You can still explore the other
              route here.
            </p>
        }

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
            type="button"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-[13.5px] font-medium text-gray-700 hover:text-gray-900 disabled:invisible">

              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
            <button
            type="button"
            onClick={() => setStep((current) => current + 1)}
            disabled={!stepAnswered[step]}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-gray-900 px-5 text-[13.5px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600">

              {step === steps.length - 1 ? 'Show my requirements' : 'Next'}
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      }

      {pathway &&
      <>
          <section aria-labelledby="wizard-step" className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="wizard-step" ref={headingRef} tabIndex={-1} className="text-[17px] font-semibold text-gray-900 focus:outline-none">
                  Your pathway
                </h2>
                <p className="mt-1 text-[13.5px] text-gray-700">
                  {trackLabels[answers.track]} · {sectors.find((sector) => sector.code === answers.sectorCode)?.label} ·{' '}
                  {modeOptions.find((mode) => mode.id === answers.mode)?.label} ·{' '}
                  {targetMarkets.find((market) => market.id === answers.market)?.label}
                </p>
              </div>
              <button
              type="button"
              onClick={() => setStep(0)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-gray-300 px-4 text-[13px] font-medium text-gray-800 hover:border-gray-500">

                <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Change answers
              </button>
            </div>

            <p className="mt-4 text-[14px] text-gray-900">
              <span className="font-semibold tabular-nums">{pathway.total}</span> requirements apply to you ·{' '}
              <span className="font-semibold tabular-nums">{pathway.metCount}</span> already met through verified evidence
            </p>

            {pathway.underReviewCount > 0 &&
          <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-[12.5px] leading-relaxed text-amber-900">
                <HourglassIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {pathway.underReviewCount} more {pathway.underReviewCount === 1 ? 'requirement that may affect you is' : 'requirements that may affect you are'}{' '}
                being reviewed. We only show guidance that has been confirmed, so {pathway.underReviewCount === 1 ? 'it' : 'they'} will appear here
                once the review is finished.
              </p>
          }
          </section>

          <ol className="mt-6 space-y-6">
            {pathway.groups.map((group, groupIndex) =>
          <li key={group.category}>
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-gray-700">
                  Step {groupIndex + 1} · {requirementCategoryLabels[group.category]}
                </h3>
                <ul className="mt-2 space-y-3">
                  {group.items.map(({ requirement, alreadyMet }) =>
              <li key={requirement.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h4 className="max-w-xl text-[15px] font-semibold leading-snug text-gray-900">{requirement.title}</h4>
                        {alreadyMet ?
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-800">
                            <CheckCircle2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                            Already verified
                          </span> :

                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[12px] font-medium text-gray-700">
                            <CircleDashedIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            To do
                          </span>
                  }
                      </div>
                      <p className="mt-2 text-[14px] leading-relaxed text-gray-800">{requirement.summary}</p>
                      <dl className="mt-3 grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
                        <div>
                          <dt className="text-gray-600">Where to do it</dt>
                          <dd className="text-gray-900">{requirement.officialChannel}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-600">What to show</dt>
                          <dd className="text-gray-900">{requirement.evidenceExpected}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-600">Source</dt>
                          <dd className="text-gray-900">
                            {requirement.sourceCitation} · {requirement.authority}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-600">In effect</dt>
                          <dd className="text-gray-900">
                            Since {requirement.effectiveOn} · next review {requirement.nextReviewOn}
                          </dd>
                        </div>
                      </dl>
                    </li>
              )}
                </ul>
              </li>
          )}
          </ol>

          <p className="mt-6 flex gap-2 text-[12.5px] leading-relaxed text-gray-600">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            This is guidance, not legal advice. Confirm the details with the authority named on each requirement.
            Prototype register content — not yet validated by the NATEP Secretariat.
          </p>
        </>
      }
    </WorkspaceLayout>);

}
