import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDownIcon, InfoIcon } from 'lucide-react';
import { Field, PrimaryButton, inputClass } from './FormField';
import { Spinner } from '../common/Spinner';
import { usePendingAction } from '../../lib/usePendingAction';

interface DemoAccount {
  id: string;
  email: string;
  name: string;
  detail: string;
  badge: React.ReactNode;
}

interface SignInCardProps {
  heading: string;
  intro: string;
  registerHref: string;
  registerLabel: string;
  homeHref: string;
  findByEmail: (email: string) => {id: string;} | undefined;
  signIn: (id: string) => void;
  demoAccounts: DemoAccount[];
}

export function SignInCard({
  heading,
  intro,
  registerHref,
  registerLabel,
  homeHref,
  findByEmail,
  signIn,
  demoAccounts
}: SignInCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as {from?: string;} | null)?.from ?? homeHref;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string;password?: string;}>({});
  const [showDemo, setShowDemo] = useState(false);

  const { run, pending, isPending } = usePendingAction();

  const complete = (id: string, key: string) =>
  run(key, () => {
    signIn(id);
    navigate(from, { replace: true });
  });

  return (
    <>
      <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.01em] text-gray-900">{heading}</h1>
      <p className="mt-1 text-[14px] leading-relaxed text-gray-600">{intro}</p>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const next: typeof errors = {};
          const account = findByEmail(email);
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter the email address you registered with.';else
          if (!account) next.email = 'No account uses this email. Check it, or create an account.';
          if (!password) next.password = 'Enter your password.';
          setErrors(next);
          if (account && Object.keys(next).length === 0) complete(account.id, 'sign-in');
        }}
        className="mt-6 space-y-4">

        <Field id="sign-in-email" label="Email" error={errors.email}>
          {(describedBy) =>
          <input
            id="sign-in-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy}
            className={inputClass} />

          }
        </Field>
        <Field id="sign-in-password" label="Password" error={errors.password}>
          {(describedBy) =>
          <input
            id="sign-in-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={describedBy}
            className={inputClass} />

          }
        </Field>
        <div className="[&>button]:w-full">
          <PrimaryButton type="submit" loading={isPending('sign-in')} loadingLabel="Signing in…">Sign in</PrimaryButton>
        </div>
        <p className="flex gap-2 text-[12.5px] text-gray-600">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Prototype: passwords aren't stored or checked. In production, sign-in goes through the Gateway's single
          identity provider.
        </p>
      </form>

      <div className="mt-6 flex items-center gap-3 text-[12.5px] text-gray-500" aria-hidden="true">
        <span className="h-px flex-1 bg-gray-200" />
        New to the Gateway?
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <div className="mt-4">
        <Link
          to={registerHref}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-gray-300 px-5 text-[14px] font-semibold text-gray-900 transition-colors duration-150 ease-out hover:border-gray-900">

          {registerLabel}
        </Link>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={() => setShowDemo((value) => !value)}
          aria-expanded={showDemo}
          aria-controls="demo-accounts"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-medium text-gray-700 hover:text-gray-900">

          Reviewing the prototype? Sign in as a sample account
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${showDemo ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {showDemo &&
        <ul id="demo-accounts" className="mt-2 max-h-80 divide-y divide-gray-100 overflow-y-auto rounded-2xl border border-gray-200 bg-white">
            {demoAccounts.map((account) =>
          <li key={account.id}>
                <button
              type="button"
              onClick={() => complete(account.id, account.id)}
              disabled={Boolean(pending)}
              aria-busy={isPending(account.id) || undefined}
              className="flex min-h-[56px] w-full flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-gray-50 disabled:cursor-progress">

                  <span>
                    <span className="block text-[14px] font-medium text-gray-900">{account.name}</span>
                    <span className="block text-[12px] text-gray-600">{account.detail}</span>
                  </span>
                  {isPending(account.id) ?
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-gray-700">
                      <Spinner />
                      Signing in…
                    </span> :

                account.badge
                }
                </button>
              </li>
          )}
          </ul>
        }
      </div>
    </>);

}
