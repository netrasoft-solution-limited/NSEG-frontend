import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, LockIcon, MailCheckIcon } from 'lucide-react';
import { AuthLayout } from '../components/workspace/AuthLayout';
import {
  Field,
  PROTOTYPE_EMAIL_CODE,
  PrimaryButton,
  SecondaryButton,
  StepProgress,
  inputClass } from
'../components/workspace/FormField';
import { sectors } from '../data/sectors';
import { supplyModes } from '../data/observatory';
import { targetMarkets, type SupplyModeId, type TargetMarketId } from '../data/regulations';
import { trackLabels, type ExporterTrack } from '../data/trustTiers';
import { useAccounts } from '../lib/accounts';
import { useAuditLog } from '../lib/auditLog';
import { sectorLabel, modeLabel } from '../lib/marketplaceLookups';

const steps = ['Your account', 'Verify your email', 'How you export', 'Identity', 'What you offer', 'Review'];

const teamSizes = ['Just me', '2–10 people', '11–50 people', 'More than 50 people'];

interface FormState {
  fullName: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
  code: string;
  track: ExporterTrack | '';
  businessName: string;
  cacNumber: string;
  tin: string;
  nin: string;
  professionalCredential: string;
  sectorCode: string;
  modes: SupplyModeId[];
  markets: TargetMarketId[];
  teamSize: string;
  description: string;
}

const initial: FormState = {
  fullName: '',
  email: '',
  password: '',
  acceptedTerms: false,
  code: '',
  track: '',
  businessName: '',
  cacNumber: '',
  tin: '',
  nin: '',
  professionalCredential: '',
  sectorCode: '',
  modes: [],
  markets: [],
  teamSize: '',
  description: ''
};

type Errors = Partial<Record<keyof FormState, string>>;

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function ExporterRegister() {
  const accounts = useAccounts();
  const { logEvent } = useAuditLog();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const set = (patch: Partial<FormState>) => setForm((current) => ({ ...current, ...patch }));
  const displayName = form.track === 'firm' ? form.businessName : form.fullName;

  const validate = (index: number): Errors => {
    const next: Errors = {};
    if (index === 0) {
      if (!form.fullName.trim()) next.fullName = 'Enter your full name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';else
      if (accounts.findExporterByEmail(form.email)) next.email = 'An exporter account already uses this email. Sign in instead.';
      if (form.password.length < 8) next.password = 'Use at least 8 characters.';
      if (!form.acceptedTerms) next.acceptedTerms = 'You need to accept the terms and privacy notice to continue.';
    }
    if (index === 1 && form.code.trim() !== PROTOTYPE_EMAIL_CODE) next.code = 'That code doesn’t match. Check the email and try again.';
    if (index === 2 && !form.track) next.track = 'Choose how you export.';
    if (index === 3) {
      if (form.track === 'firm') {
        if (!form.businessName.trim()) next.businessName = 'Enter your registered business name.';
        if (form.cacNumber && !/^(RC|BN|IT)?\s?\d{5,8}$/i.test(form.cacNumber.trim())) {
          next.cacNumber = 'Use the format on your CAC certificate, for example RC 1234567.';
        }
        if (form.tin && !/^\d{8}-?\d{4}$/.test(form.tin.trim())) next.tin = 'A TIN has 12 digits, for example 12345678-0001.';
      } else {
        if (form.nin && !/^\d{11}$/.test(form.nin.trim())) next.nin = 'A NIN has 11 digits.';
      }
    }
    if (index === 4) {
      if (!form.sectorCode) next.sectorCode = 'Choose your main service.';
      if (form.modes.length === 0) next.modes = 'Choose at least one way you deliver.';
      if (form.markets.length === 0) next.markets = 'Choose at least one market.';
      if (!form.teamSize) next.teamSize = 'Choose your team size.';
    }
    return next;
  };

  const next = () => {
    const found = validate(step);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep((current) => current + 1);
  };

  const create = () => {
    const actor = accounts.registerExporter({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      track: form.track as ExporterTrack,
      displayName: displayName.trim(),
      cacNumber: form.cacNumber.trim() || undefined,
      tin: form.tin.trim() || undefined,
      nin: form.nin.trim() || undefined,
      professionalCredential: form.professionalCredential.trim() || undefined,
      sectorCode: form.sectorCode,
      capability: { modes: form.modes, markets: form.markets, teamSize: form.teamSize, description: form.description.trim() }
    });
    logEvent(`${actor.name} registered as an exporter (${actor.natepId})`, 'exporters', actor.name);
    navigate('/workspace', { replace: true });
  };

  const similar = step === 5 ? accounts.similarExporterName(displayName) : undefined;

  return (
    <AuthLayout audience="exporter" steps={steps} currentStep={step} switchLink={{ label: 'Already registered? Sign in', to: '/workspace/sign-in' }}>
      <div className="lg:hidden">
        <StepProgress steps={steps} current={step} />
      </div>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (step === steps.length - 1) create();else
          next();
        }}
        className="mt-5 lg:mt-0">

        <h1 ref={headingRef} tabIndex={-1} className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900 focus:outline-none">
          {step === 0 && 'Create your exporter account'}
          {step === 1 && 'Check your email'}
          {step === 2 && 'How do you export?'}
          {step === 3 && form.track === 'firm' && 'Your business'}
          {step === 3 && form.track === 'individual' && 'Your identity'}
          {step === 4 && 'What you offer'}
          {step === 5 && 'Check your details'}
        </h1>

        <div className="mt-5 space-y-4">
          {step === 0 &&
          <>
              <p className="text-[13.5px] text-gray-600">
                Registration is free and open. You can explore the workspace straight away — verification comes later,
                when you're ready to bid.
              </p>
              <Field id="reg-name" label="Full name" error={errors.fullName}>
                {(d) => <input id="reg-name" autoComplete="name" value={form.fullName} onChange={(e) => set({ fullName: e.target.value })} aria-invalid={Boolean(errors.fullName)} aria-describedby={d} className={inputClass} />}
              </Field>
              <Field id="reg-email" label="Email" error={errors.email}>
                {(d) => <input id="reg-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set({ email: e.target.value })} aria-invalid={Boolean(errors.email)} aria-describedby={d} className={inputClass} />}
              </Field>
              <Field id="reg-password" label="Create a password" hint="At least 8 characters." error={errors.password}>
                {(d) => <input id="reg-password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => set({ password: e.target.value })} aria-invalid={Boolean(errors.password)} aria-describedby={d} className={inputClass} />}
              </Field>
              <div>
                <label className="flex items-start gap-3 text-[13.5px] text-gray-800">
                  <input
                  type="checkbox"
                  checked={form.acceptedTerms}
                  onChange={(e) => set({ acceptedTerms: e.target.checked })}
                  aria-invalid={Boolean(errors.acceptedTerms)}
                  aria-describedby={errors.acceptedTerms ? 'reg-terms-error' : undefined}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-gray-900" />

                  <span>
                    I accept the Gateway terms of use and privacy notice. My profile stays private until I choose to share
                    it, and I can withdraw consent at any time (NDPA 2023).
                  </span>
                </label>
                {errors.acceptedTerms &&
              <p id="reg-terms-error" className="mt-1 text-[12.5px] text-rose-700">
                    {errors.acceptedTerms}
                  </p>
              }
              </div>
            </>
          }

          {step === 1 &&
          <>
              <p className="flex gap-2 text-[14px] text-gray-800">
                <MailCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-600" aria-hidden="true" />
                We sent a 6-digit code to <span className="font-medium">{form.email}</span>.
              </p>
              <Field id="reg-code" label="Verification code" hint={`Prototype: no email is sent — use ${PROTOTYPE_EMAIL_CODE}.`} error={errors.code}>
                {(d) => <input id="reg-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={form.code} onChange={(e) => set({ code: e.target.value.replace(/\D/g, '') })} aria-invalid={Boolean(errors.code)} aria-describedby={d} className={`${inputClass} max-w-[180px] font-mono tracking-[0.3em]`} />}
              </Field>
            </>
          }

          {step === 2 &&
          <fieldset aria-describedby={errors.track ? 'reg-track-error' : undefined}>
              <legend className="sr-only">How you export</legend>
              <div className="grid gap-2">
                {(['firm', 'individual'] as ExporterTrack[]).map((track) =>
              <label
                key={track}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gray-900 ${
                form.track === track ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`
                }>

                    <input type="radio" name="track" checked={form.track === track} onChange={() => set({ track })} className="mt-0.5 h-4 w-4 accent-gray-900" />
                    <span>
                      <span className="block text-[14.5px] font-medium text-gray-900">{trackLabels[track]}</span>
                      <span className="block text-[13px] text-gray-600">
                        {track === 'firm' ?
                    'You have a CAC-registered company or business name. You’ll verify with your CAC number and TIN.' :
                    'You work in your own name, without CAC registration. You’ll verify with your NIN and a professional credential.'}
                      </span>
                    </span>
                  </label>
              )}
              </div>
              {errors.track && <p id="reg-track-error" className="mt-1 text-[12.5px] text-rose-700">{errors.track}</p>}
            </fieldset>
          }

          {step === 3 &&
          <>
              <p className="rounded-xl bg-gray-50 p-3 text-[13px] leading-relaxed text-gray-700">
                The identifiers below are optional now. Add them to start verification straight away, or skip and add them
                later. You'll need them verified before you can bid.
              </p>
              {form.track === 'firm' ?
            <>
                  <Field id="reg-business" label="Registered business name" error={errors.businessName}>
                    {(d) => <input id="reg-business" autoComplete="organization" value={form.businessName} onChange={(e) => set({ businessName: e.target.value })} aria-invalid={Boolean(errors.businessName)} aria-describedby={d} className={inputClass} />}
                  </Field>
                  <Field id="reg-cac" label="CAC registration number" optional hint="As shown on your CAC certificate, e.g. RC 1234567." error={errors.cacNumber}>
                    {(d) => <input id="reg-cac" value={form.cacNumber} onChange={(e) => set({ cacNumber: e.target.value })} aria-invalid={Boolean(errors.cacNumber)} aria-describedby={d} className={inputClass} />}
                  </Field>
                  <Field id="reg-tin" label="Tax identification number (TIN)" optional error={errors.tin}>
                    {(d) => <input id="reg-tin" inputMode="numeric" value={form.tin} onChange={(e) => set({ tin: e.target.value })} aria-invalid={Boolean(errors.tin)} aria-describedby={d} className={inputClass} />}
                  </Field>
                </> :

            <>
                  <Field id="reg-nin" label="National identification number (NIN)" optional hint="11 digits. We only show the last four to officers." error={errors.nin}>
                    {(d) => <input id="reg-nin" inputMode="numeric" maxLength={11} value={form.nin} onChange={(e) => set({ nin: e.target.value.replace(/\D/g, '') })} aria-invalid={Boolean(errors.nin)} aria-describedby={d} className={inputClass} />}
                  </Field>
                  <Field id="reg-credential" label="Professional credential" optional hint="Name and number, e.g. ICAN membership 12345." error={errors.professionalCredential}>
                    {(d) => <input id="reg-credential" value={form.professionalCredential} onChange={(e) => set({ professionalCredential: e.target.value })} aria-describedby={d} className={inputClass} />}
                  </Field>
                </>
            }
            </>
          }

          {step === 4 &&
          <>
              <p className="flex gap-2 text-[13px] text-gray-700">
                <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                Private by default. Buyers see none of this until you accept an introduction.
              </p>
              <Field id="reg-sector" label="Main service" error={errors.sectorCode}>
                {(d) =>
              <select id="reg-sector" value={form.sectorCode} onChange={(e) => set({ sectorCode: e.target.value })} aria-invalid={Boolean(errors.sectorCode)} aria-describedby={d} className={inputClass}>
                    <option value="">Choose a service</option>
                    {sectors.map((sector) => <option key={sector.code} value={sector.code}>{sector.label}</option>)}
                  </select>
              }
              </Field>
              <fieldset aria-describedby={errors.modes ? 'reg-modes-error' : undefined}>
                <legend className="text-[13px] font-medium text-gray-800">How you deliver</legend>
                <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                  {supplyModes.map((mode) =>
                <label key={mode.id} className="flex min-h-[40px] items-center gap-2.5 text-[13.5px] text-gray-800">
                      <input type="checkbox" checked={form.modes.includes(mode.id as SupplyModeId)} onChange={() => set({ modes: toggle(form.modes, mode.id as SupplyModeId) })} className="h-4 w-4 accent-gray-900" />
                      {mode.label}
                    </label>
                )}
                </div>
                {errors.modes && <p id="reg-modes-error" className="text-[12.5px] text-rose-700">{errors.modes}</p>}
              </fieldset>
              <fieldset aria-describedby={errors.markets ? 'reg-markets-error' : undefined}>
                <legend className="text-[13px] font-medium text-gray-800">Markets you serve or want to serve</legend>
                <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                  {targetMarkets.map((market) =>
                <label key={market.id} className="flex min-h-[40px] items-center gap-2.5 text-[13.5px] text-gray-800">
                      <input type="checkbox" checked={form.markets.includes(market.id)} onChange={() => set({ markets: toggle(form.markets, market.id) })} className="h-4 w-4 accent-gray-900" />
                      {market.label}
                    </label>
                )}
                </div>
                {errors.markets && <p id="reg-markets-error" className="text-[12.5px] text-rose-700">{errors.markets}</p>}
              </fieldset>
              <Field id="reg-team" label="Team size" error={errors.teamSize}>
                {(d) =>
              <select id="reg-team" value={form.teamSize} onChange={(e) => set({ teamSize: e.target.value })} aria-invalid={Boolean(errors.teamSize)} aria-describedby={d} className={inputClass}>
                    <option value="">Choose a size</option>
                    {teamSizes.map((size) => <option key={size} value={size}>{size}</option>)}
                  </select>
              }
              </Field>
              <Field id="reg-description" label="What you do, in a sentence or two" optional hint={`${280 - form.description.length} characters left.`}>
                {(d) => <textarea id="reg-description" rows={3} maxLength={280} value={form.description} onChange={(e) => set({ description: e.target.value })} aria-describedby={d} className={inputClass} />}
              </Field>
            </>
          }

          {step === 5 &&
          <>
              <dl className="divide-y divide-gray-100 text-[13.5px]">
                {[
              ['Name', form.fullName, 0],
              ['Email', form.email, 0],
              ['Exporting as', trackLabels[form.track as ExporterTrack], 2],
              ...(form.track === 'firm' ?
              [['Business', form.businessName, 3], ['CAC number', form.cacNumber || 'Add later', 3], ['TIN', form.tin || 'Add later', 3]] :
              [['NIN', form.nin ? `•••••••${form.nin.slice(-4)}` : 'Add later', 3], ['Credential', form.professionalCredential || 'Add later', 3]]),
              ['Main service', sectorLabel(form.sectorCode), 4],
              ['Delivery', form.modes.map(modeLabel).join(', '), 4],
              ['Markets', form.markets.map((id) => targetMarkets.find((market) => market.id === id)?.label).join(', '), 4],
              ['Team size', form.teamSize, 4]].
              map(([label, value, target]) =>
              <div key={label as string} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5">
                    <dt className="text-gray-600">{label}</dt>
                    <dd className="flex items-baseline gap-3 text-right text-gray-900">
                      {value}
                      <button type="button" onClick={() => setStep(target as number)} className="text-[12.5px] font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900">
                        Change<span className="sr-only"> {label}</span>
                      </button>
                    </dd>
                  </div>
              )}
              </dl>
              {similar &&
            <p className="rounded-xl bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-900">
                  A business with a very similar name is already registered. You can still create your account — a data
                  steward will check it isn't a duplicate before verification.
                </p>
            }
              <p className="text-[13px] leading-relaxed text-gray-600">
                You'll start at the Registered tier. {(form.cacNumber || form.tin || form.nin || form.professionalCredential) ?
              'We’ll send the identifiers you added for verification.' :
              'Add your identifiers from the workspace whenever you’re ready.'}
              </p>
            </>
          }
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
          {step > 0 ?
          <SecondaryButton type="button" onClick={() => setStep((current) => current - 1)}>
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
              Back
            </SecondaryButton> :

          <Link to="/workspace/sign-in" className="text-[13px] font-medium text-gray-700 underline underline-offset-2">
              I already have an account
            </Link>
          }
          <PrimaryButton type="submit">
            {step === 0 && 'Continue'}
            {step === 1 && 'Verify email'}
            {step > 1 && step < 5 && 'Continue'}
            {step === 5 && 'Create account'}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </PrimaryButton>
        </div>
      </form>
    </AuthLayout>);

}
