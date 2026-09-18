import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, EyeIcon, EyeOffIcon, MailCheckIcon } from 'lucide-react';
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
import { useAccounts } from '../lib/accounts';
import { useAuditLog } from '../lib/auditLog';
import { usePendingAction } from '../lib/usePendingAction';
import { sectorLabel } from '../lib/marketplaceLookups';

const businessSteps = ['Your account', 'Verify your email', 'Your organisation', 'Review'];
const individualSteps = ['Your account', 'Verify your email', 'What you source', 'Review'];

/** DEM-01: registration is open, but only on a corporate email domain. */
const freeEmailDomains = [
'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'outlook.com', 'hotmail.com', 'live.com', 'icloud.com',
'aol.com', 'proton.me', 'protonmail.com', 'gmx.com', 'mail.com', 'yandex.com', 'zoho.com'];


const countries: { name: string; region: string }[] = [
{ name: 'Canada', region: 'North America' },
{ name: 'France', region: 'Western Europe' },
{ name: 'Germany', region: 'Western Europe' },
{ name: 'Ghana', region: 'West Africa' },
{ name: 'India', region: 'Asia-Pacific' },
{ name: 'Ireland', region: 'Western Europe' },
{ name: 'Kenya', region: 'East Africa' },
{ name: 'Netherlands', region: 'Western Europe' },
{ name: 'Qatar', region: 'Gulf States' },
{ name: 'Rwanda', region: 'East Africa' },
{ name: 'Saudi Arabia', region: 'Gulf States' },
{ name: 'Singapore', region: 'Asia-Pacific' },
{ name: 'South Africa', region: 'Southern Africa' },
{ name: 'United Arab Emirates', region: 'Gulf States' },
{ name: 'United Kingdom', region: 'Western Europe' },
{ name: 'United States', region: 'North America' }];


/**
 * Who is registering.
 *
 * An organisation is asked for its name, the person's job title in it, and a work email on its
 * domain — because the register has to be able to say which company this account speaks for. An
 * individual is none of those things, so they are not asked. Four fewer questions, and none of
 * them ones a sole buyer could sensibly answer.
 */
export type BuyerTrack = 'business' | 'individual';

interface FormState {
  track: BuyerTrack;
  fullName: string;
  email: string;
  jobTitle: string;
  password: string;
  acceptedTerms: boolean;
  code: string;
  companyName: string;
  country: string;
  sectorsOfInterest: string[];
}

const initial: FormState = {
  track: 'business',
  fullName: '',
  email: '',
  jobTitle: '',
  password: '',
  acceptedTerms: false,
  code: '',
  companyName: '',
  country: '',
  sectorsOfInterest: []
};

type Errors = Partial<Record<keyof FormState, string>>;

export function BuyerRegister() {
  const accounts = useAccounts();
  const { logEvent } = useAuditLog();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [showPassword, setShowPassword] = useState(false);
  const isBusiness = form.track === 'business';
  const steps = isBusiness ? businessSteps : individualSteps;
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
  const domain = form.email.trim().split('@')[1]?.toLowerCase() ?? '';

  const validate = (index: number): Errors => {
    const next: Errors = {};
    if (index === 0) {
      if (!form.fullName.trim()) next.fullName = 'Enter your full name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';else
      // Only an organisation is held to its own domain: that is how the register knows which
      // company this account speaks for. An individual has no domain to be held to, and refusing
      // them a personal address would refuse them an account.
      if (isBusiness && freeEmailDomains.includes(domain)) next.email = 'Use your work email on your company’s domain, so we can confirm which organisation you act for.';else
      if (accounts.findBuyerByEmail(form.email)) next.email = 'An account already uses this email. Sign in instead.';
      if (isBusiness && !form.jobTitle.trim()) next.jobTitle = 'Enter your job title.';

      // Letters and numbers, both. Length alone lets through a passphrase of one repeated word,
      // and a rule nobody can state is a rule nobody follows — so it is said in the hint too.
      const password = form.password;
      if (password.length < 8) next.password = 'Use at least 8 characters.';else
      if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) next.password = 'Use both letters and numbers.';
      if (!form.acceptedTerms) next.acceptedTerms = 'You need to accept the terms and privacy notice to continue.';
    }
    if (index === 1 && form.code.trim() !== PROTOTYPE_EMAIL_CODE) next.code = 'That code doesn’t match. Check the email and try again.';
    if (index === 2) {
      if (isBusiness && !form.companyName.trim()) next.companyName = 'Enter your organisation’s name.';
      if (!form.country) next.country = isBusiness
        ? 'Choose the country your organisation is registered in.'
        : 'Choose the country you are based in.';
    }
    return next;
  };

  const { run, isPending } = usePendingAction();

  const next = () => {
    const found = validate(step);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    // Checking the email code is a server round-trip in production.
    if (step === 1) run('submit', () => setStep((current) => current + 1));else
    setStep((current) => current + 1);
  };

  const create = () => {
    const buyer = accounts.registerBuyer({
      fullName: form.fullName,
      email: form.email,
      jobTitle: isBusiness ? form.jobTitle : 'Individual buyer',
      // An individual buys under their own name, which is also their entry on the register.
      companyName: isBusiness ? form.companyName : form.fullName,
      country: form.country,
      region: countries.find((item) => item.name === form.country)?.region ?? 'Other',
      sectorsOfInterest: form.sectorsOfInterest
    });
    logEvent(`${buyer.name} registered as a buyer (${buyer.referenceId})`, 'buyers', form.fullName.trim());
    navigate('/buyer', { replace: true });
  };

  return (
    <AuthLayout audience="buyer" steps={steps} currentStep={step} switchLink={{ label: 'Already registered? Sign in', to: '/buyer/sign-in' }}>
      <div>
        <StepProgress steps={steps} current={step} />
      </div>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (step === steps.length - 1) run('submit', create);else
          next();
        }}
        className="mt-8">

        <h1 ref={headingRef} tabIndex={-1} className="text-balance font-sora text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-gray-900 focus:outline-none sm:text-[34px]">
          {step === 0 && 'Create your buyer account'}
          {step === 1 && 'Check your email'}
          {step === 2 && (isBusiness ? 'Your organisation' : 'What you source')}
          {step === 3 && 'Check your details'}
        </h1>

        <div className="mt-5 space-y-4">
          {step === 0 &&
          <>
              <fieldset>
                <legend className="text-[13px] font-medium text-gray-800">Are you buying as…</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {([
                { id: 'business', label: 'An organisation', detail: 'Buying on behalf of a company or institution' },
                { id: 'individual', label: 'An individual', detail: 'Buying in your own name' }] as const).
                map((option) =>
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-colors duration-150 ${
                  form.track === option.id ?
                  'border-transparent bg-[var(--auth-soft)] ring-2 ring-[var(--auth-accent)]' :
                  'border-gray-200 hover:border-gray-300'}`
                  }>

                      <input
                    type="radio"
                    name="buyer-track"
                    value={option.id}
                    checked={form.track === option.id}
                    // Switching changes which questions follow, so a half-answered form for the
                    // other track is cleared rather than carried along invisibly.
                    onChange={() => set({ track: option.id, jobTitle: '', companyName: '' })}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--auth-accent)]" />

                      <span className="min-w-0">
                        <span className="block text-[14px] font-semibold text-gray-900">{option.label}</span>
                        <span className="block text-[12.5px] text-gray-600">{option.detail}</span>
                      </span>
                    </label>
                )}
                </div>
              </fieldset>

              <p className="text-[13.5px] text-gray-600">
                {isBusiness ?
              'Start exploring and drafting requests right away. We\'ll only ask you to verify your company when you send a request for qualification.' :
              'Start exploring and drafting requests right away. We\'ll ask for more only when you send a request for qualification.'}
              </p>
              <Field id="buyer-name" label="Full name" error={errors.fullName}>
                {(d) => <input id="buyer-name" autoComplete="name" value={form.fullName} onChange={(e) => set({ fullName: e.target.value })} aria-invalid={Boolean(errors.fullName)} aria-describedby={d} className={inputClass} />}
              </Field>
              <Field id="buyer-email" label="Email" hint="Using your work email gives you more credibility." error={errors.email}>
                {(d) => <input id="buyer-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set({ email: e.target.value })} aria-invalid={Boolean(errors.email)} aria-describedby={d} className={inputClass} />}
              </Field>
              {isBusiness &&
            <Field id="buyer-title" label="Job title" error={errors.jobTitle}>
                {(d) => <input id="buyer-title" autoComplete="organization-title" value={form.jobTitle} onChange={(e) => set({ jobTitle: e.target.value })} aria-invalid={Boolean(errors.jobTitle)} aria-describedby={d} className={inputClass} />}
              </Field>
            }
              <Field id="buyer-password" label="Create a password" hint="At least 8 characters, using both letters and numbers." error={errors.password}>
                {(d) =>
              <div className="relative">
                    <input
                  id="buyer-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => set({ password: e.target.value })}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={d}
                  className={`${inputClass} has-trail`} />

                    <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900">

                      {showPassword ?
                  <EyeOffIcon className="h-[18px] w-[18px]" aria-hidden="true" /> :
                  <EyeIcon className="h-[18px] w-[18px]" aria-hidden="true" />}
                    </button>
                  </div>
              }
              </Field>
              <div>
                <label className="flex items-start gap-3 text-[13.5px] text-gray-800">
                  <input
                  type="checkbox"
                  checked={form.acceptedTerms}
                  onChange={(e) => set({ acceptedTerms: e.target.checked })}
                  aria-invalid={Boolean(errors.acceptedTerms)}
                  aria-describedby={errors.acceptedTerms ? 'buyer-terms-error' : undefined}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-gray-900" />

                  <span>
                    I accept the Gateway terms of use and privacy notice, including that exporter profiles I receive may only
                    be used for the request they were shared for.
                  </span>
                </label>
                {errors.acceptedTerms &&
              <p id="buyer-terms-error" className="mt-1 text-[12.5px] text-rose-700">
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
                {isBusiness && <> This also confirms your company domain, <span className="font-medium">{domain}</span>.</>}
              </p>
              <Field id="buyer-code" label="Verification code" hint={`Prototype: no email is sent — use ${PROTOTYPE_EMAIL_CODE}.`} error={errors.code}>
                {(d) => <input id="buyer-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={form.code} onChange={(e) => set({ code: e.target.value.replace(/\D/g, '') })} aria-invalid={Boolean(errors.code)} aria-describedby={d} className={`${inputClass} max-w-[180px] font-mono tracking-[0.3em]`} />}
              </Field>
            </>
          }

          {step === 2 &&
          <>
              {isBusiness &&
            <Field id="buyer-company" label="Organisation name" error={errors.companyName}>
                {(d) => <input id="buyer-company" autoComplete="organization" value={form.companyName} onChange={(e) => set({ companyName: e.target.value })} aria-invalid={Boolean(errors.companyName)} aria-describedby={d} className={inputClass} />}
              </Field>
            }
              <Field id="buyer-country" label={isBusiness ? 'Country of registration' : 'Country you are based in'} error={errors.country}>
                {(d) =>
              <select id="buyer-country" value={form.country} onChange={(e) => set({ country: e.target.value })} aria-invalid={Boolean(errors.country)} aria-describedby={d} className={inputClass}>
                    <option value="">Choose a country</option>
                    {countries.map((country) => <option key={country.name} value={country.name}>{country.name}</option>)}
                  </select>
              }
              </Field>
              <fieldset>
                <legend className="text-[13px] font-medium text-gray-800">
                  Services you expect to source <span className="font-normal text-gray-600">(optional)</span>
                </legend>
                <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                  {sectors.map((sector) =>
                <label key={sector.code} className="flex min-h-[40px] items-center gap-2.5 text-[13.5px] text-gray-800">
                      <input
                    type="checkbox"
                    checked={form.sectorsOfInterest.includes(sector.code)}
                    onChange={() =>
                    set({
                      sectorsOfInterest: form.sectorsOfInterest.includes(sector.code) ?
                      form.sectorsOfInterest.filter((code) => code !== sector.code) :
                      [...form.sectorsOfInterest, sector.code]
                    })
                    }
                    className="h-4 w-4 accent-gray-900" />

                      {sector.label}
                    </label>
                )}
                </div>
              </fieldset>
            </>
          }

          {step === 3 &&
          <>
              <dl className="divide-y divide-gray-100 text-[13.5px]">
                {([
              ['Buying as', isBusiness ? 'An organisation' : 'An individual', 0],
              ['Name', form.fullName, 0],
              ['Email', form.email, 0],
              ...(isBusiness ? [['Job title', form.jobTitle, 0]] : []),
              ...(isBusiness ? [['Organisation', form.companyName, 2]] : []),
              ['Country', form.country, 2],
              ['Services', form.sectorsOfInterest.length ? form.sectorsOfInterest.map(sectorLabel).join(', ') : 'Not specified', 2]] as Array<[string, string, number]>).
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
              <p className="text-[13px] leading-relaxed text-gray-600">
                You'll start at the Registered tier: your email is confirmed, your company isn't checked yet. You can
                draft requests immediately.
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

          <Link to="/buyer/sign-in" className="text-[13px] font-medium text-gray-700 underline underline-offset-2">
              I already have an account
            </Link>
          }
          <PrimaryButton
            type="submit"
            loading={isPending('submit')}
            loadingLabel={step === 1 ? 'Verifying…' : 'Creating account…'}>
            {step === 1 ? 'Verify email' : step === 3 ? 'Create account' : 'Continue'}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </PrimaryButton>
        </div>
      </form>
    </AuthLayout>);

}
