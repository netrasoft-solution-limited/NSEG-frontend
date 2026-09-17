import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import {
  competentAuthorities,
  requirementCategoryLabels,
  requiredSignOffs,
  signOffAgency,
  targetMarkets,
  type RequirementCategory,
  type SupplyModeId,
  type TargetMarketId } from
'../../data/regulations';
import { sectors } from '../../data/sectors';
import { supplyModes } from '../../data/observatory';
import { trackLabels, type ExporterTrack } from '../../data/trustTiers';
import type { RequirementContent } from '../../lib/regulatoryRegister';

const authorityOptions = [...competentAuthorities, 'Buyer-side procurement standard'];

export const blankContent: RequirementContent = {
  title: '',
  category: 'statutory',
  authority: 'Central Bank of Nigeria',
  summary: '',
  officialChannel: '',
  evidenceExpected: '',
  sourceCitation: '',
  effectiveOn: '',
  nextReviewOn: '',
  appliesTo: {}
};

type Errors = Partial<Record<'title' | 'summary' | 'officialChannel' | 'evidenceExpected' | 'sourceCitation' | 'effectiveOn' | 'nextReviewOn', string>>;

function validate(content: RequirementContent): Errors {
  const errors: Errors = {};
  if (!content.title.trim()) errors.title = 'Add a title.';
  if (!content.summary.trim()) errors.summary = 'Write a plain-language summary for exporters.';
  if (!content.officialChannel.trim()) errors.officialChannel = 'Say where the exporter goes to do this.';
  if (!content.evidenceExpected.trim()) errors.evidenceExpected = 'Say what evidence the exporter should show.';
  if (!content.sourceCitation.trim()) errors.sourceCitation = 'Cite the source instrument.';
  if (!content.effectiveOn) errors.effectiveOn = 'Set the effective date.';
  if (!content.nextReviewOn) errors.nextReviewOn = 'Set the next review date.';else
  if (content.effectiveOn && content.nextReviewOn <= content.effectiveOn) {
    errors.nextReviewOn = 'The review date must be after the effective date.';
  }
  return errors;
}

interface RequirementDraftEditorProps {
  heading: string;
  /** e.g. "Revising reg-07 · version 1" */
  context?: string;
  initial: RequirementContent;
  onCancel: () => void;
  onSave: (content: RequirementContent, submit: boolean) => void;
}

const inputClass =
'mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 focus:border-gray-400 focus:outline-none aria-[invalid=true]:border-rose-500';

function toggle<T>(list: T[] | undefined, value: T): T[] | undefined {
  const next = list?.includes(value) ? list.filter((item) => item !== value) : [...(list ?? []), value];
  return next.length === 0 ? undefined : next;
}

export function RequirementDraftEditor({ heading, context, initial, onCancel, onSave }: RequirementDraftEditorProps) {
  const [content, setContent] = useState<RequirementContent>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const set = (patch: Partial<RequirementContent>) => setContent((current) => ({ ...current, ...patch }));

  const save = (submit: boolean) => {
    const next = validate(content);
    setErrors(next);
    if (Object.keys(next).length === 0) onSave(content, submit);
  };

  const text = (key: keyof Errors, label: string, multiline = false) =>
  <div>
      <label htmlFor={`draft-${key}`} className="block text-[12px] font-medium text-gray-600">
        {label}
      </label>
      {multiline ?
    <textarea
      id={`draft-${key}`}
      rows={3}
      value={content[key] as string}
      onChange={(event) => set({ [key]: event.target.value })}
      aria-invalid={Boolean(errors[key])}
      className={inputClass} /> :


    <input
      id={`draft-${key}`}
      type={key === 'effectiveOn' || key === 'nextReviewOn' ? 'date' : 'text'}
      value={content[key] as string}
      onChange={(event) => set({ [key]: event.target.value })}
      aria-invalid={Boolean(errors[key])}
      className={inputClass} />

    }
      {errors[key] && <p className="mt-1 text-[11.5px] text-rose-600">{errors[key]}</p>}
    </div>;


  const agency = signOffAgency(content.authority);
  const signOffs = requiredSignOffs(content.category);

  return (
    <div className="rounded-2xl border border-gray-900 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-gray-900">{heading}</h2>
          {context && <p className="text-[12.5px] text-gray-500">{context}</p>}
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close editor"
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700">

          <XIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {text('title', 'Title')}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="draft-category" className="block text-[12px] font-medium text-gray-600">
              Category
            </label>
            <select
              id="draft-category"
              value={content.category}
              onChange={(event) => set({ category: event.target.value as RequirementCategory })}
              className={inputClass}>

              {Object.entries(requirementCategoryLabels).map(([value, label]) =>
              <option key={value} value={value}>
                  {label}
                </option>
              )}
            </select>
          </div>
          <div>
            <label htmlFor="draft-sector" className="block text-[12px] font-medium text-gray-600">
              Sector
            </label>
            <select
              id="draft-sector"
              value={content.sectorCode ?? ''}
              onChange={(event) => set({ sectorCode: event.target.value || undefined })}
              className={inputClass}>

              <option value="">All sectors</option>
              {sectors.map((sector) =>
              <option key={sector.code} value={sector.code}>
                  {sector.label}
                </option>
              )}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="draft-authority" className="block text-[12px] font-medium text-gray-600">
            Authoring authority
          </label>
          <select
            id="draft-authority"
            value={content.authority}
            onChange={(event) => set({ authority: event.target.value })}
            className={inputClass}>

            {authorityOptions.map((authority) =>
            <option key={authority} value={authority}>
                {authority}
              </option>
            )}
          </select>
          <p className="mt-1 text-[11.5px] text-gray-500">
            Signed off by {signOffs === 2 ? 'two different officers' : 'one officer'} at {agency}.
          </p>
        </div>
        {text('sourceCitation', 'Source citation')}
        <div className="lg:col-span-2">{text('summary', 'Plain-language summary (what exporters read)', true)}</div>
        {text('officialChannel', 'Official channel')}
        {text('evidenceExpected', 'Evidence expected')}
        {text('effectiveOn', 'Effective date')}
        {text('nextReviewOn', 'Next review date')}
      </div>

      <fieldset className="mt-4 rounded-xl border border-gray-100 p-4">
        <legend className="px-1 text-[12px] font-medium text-gray-600">Applies to — leave a group empty to apply to all</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-gray-400">Exporter type</p>
            {(['firm', 'individual'] as ExporterTrack[]).map((track) =>
            <label key={track} className="mt-1.5 flex items-center gap-2 text-[13px] text-gray-700">
                <input
                type="checkbox"
                checked={content.appliesTo.tracks?.includes(track) ?? false}
                onChange={() => set({ appliesTo: { ...content.appliesTo, tracks: toggle(content.appliesTo.tracks, track) } })}
                className="h-4 w-4 accent-gray-900" />

                {trackLabels[track]}
              </label>
            )}
          </div>
          <div>
            <p className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-gray-400">Mode of supply</p>
            {supplyModes.map((mode) =>
            <label key={mode.id} className="mt-1.5 flex items-center gap-2 text-[13px] text-gray-700">
                <input
                type="checkbox"
                checked={content.appliesTo.modes?.includes(mode.id as SupplyModeId) ?? false}
                onChange={() =>
                set({ appliesTo: { ...content.appliesTo, modes: toggle(content.appliesTo.modes, mode.id as SupplyModeId) } })
                }
                className="h-4 w-4 accent-gray-900" />

                {mode.label}
              </label>
            )}
          </div>
          <div>
            <p className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-gray-400">Destination market</p>
            {targetMarkets.map((market) =>
            <label key={market.id} className="mt-1.5 flex items-center gap-2 text-[13px] text-gray-700">
                <input
                type="checkbox"
                checked={content.appliesTo.markets?.includes(market.id) ?? false}
                onChange={() =>
                set({
                  appliesTo: { ...content.appliesTo, markets: toggle<TargetMarketId>(content.appliesTo.markets, market.id) }
                })
                }
                className="h-4 w-4 accent-gray-900" />

                {market.label}
              </label>
            )}
          </div>
        </div>
      </fieldset>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => save(true)}
          className="rounded-full bg-gray-900 px-4 py-2 text-[13px] font-semibold text-white hover:bg-black">

          Save and send for sign-off
        </button>
        <button
          type="button"
          onClick={() => save(false)}
          className="rounded-full border border-gray-200 px-4 py-2 text-[13px] font-medium text-gray-700 hover:border-gray-300">

          Save as draft
        </button>
        <p className="text-[11.5px] text-gray-500">Stays Draft and invisible to exporters until {agency} signs it off.</p>
      </div>
    </div>);

}
