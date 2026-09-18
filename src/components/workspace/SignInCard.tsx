import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, ChevronDownIcon, EyeIcon, EyeOffIcon, InfoIcon, LockIcon, MailIcon } from 'lucide-react';
import { Field, PrimaryButton, inputClass } from './FormField';
import { Spinner } from '../common/Spinner';
import { usePendingAction } from '../../lib/usePendingAction';
import { initialsOf } from '../../lib/initials';

interface DemoAccount {
  id: string;
  email: string;
  name: string;
  detail: string;
  badge: React.ReactNode;
}

interface SignInCardProps {
  heading: string;
  intro?: string;
  registerHref: string;
  registerLabel: string;
  homeHref: string;
  findByEmail: (email: string) => {id: string;} | undefined;
  signIn: (id: string) => void;
  demoAccounts: DemoAccount[];
}

/** Two-stage sign-in: identify the account by email, then confirm with a password against a
 * chip that shows who is signing in. Sample accounts for reviewers sit behind a disclosure. */
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
  const reduced = useReducedMotion();
  const from = (location.state as {from?: string;} | null)?.from ?? homeHref;
  const [stage, setStage] = useState<'email' | 'password'>('email');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string;password?: string;}>({});
  const [showDemo, setShowDemo] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const firstRender = useRef(true);

  const { run, pending, isPending } = usePendingAction();

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    (stage === 'password' ? passwordRef : emailRef).current?.focus();
  }, [stage]);

  const complete = (id: string, key: string) =>
  run(key, () => {
    signIn(id);
    navigate(from, { replace: true });
  });

  /** Staggered rise-in for each block of the card. */
  const rise = (index: number) =>
  reduced ?
  {} :
  {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay: 0.15 + index * 0.08, ease: [0.22, 1, 0.36, 1] }
  };
  const title = stage === 'email' ? heading : 'Enter your password';

  const account = demoAccounts.find((item) => item.id === accountId);
  const slide = reduced ?
  {} :
  {
    initial: { opacity: 0, x: stage === 'password' ? 24 : -24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: stage === 'password' ? -24 : 24 },
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <>
      <h1 aria-label={title} className="text-balance font-sora text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#0D1A15] sm:text-[36px]">
        {title.split(' ').map((word, index) =>
        <span key={`${title}-${index}`} aria-hidden="true" className="inline-block overflow-hidden pb-1 align-bottom">
            <motion.span
            className="inline-block"
            initial={reduced ? false : { y: '110%', rotate: 4 }}
            animate={{ y: '0%', rotate: 0 }}
            transition={{ duration: 0.7, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}>

              {word}
            </motion.span>
            {'\u00A0'}
          </span>
        )}
      </h1>
      {intro && <motion.p {...rise(1)} className="mt-2 text-[15px] text-gray-600">{intro}</motion.p>}

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (stage === 'email') {
            const found = findByEmail(email);
            let message: string | undefined;
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) message = 'Enter the email address you registered with.';else
            if (!found) message = 'No account uses this email. Check it, or create an account.';
            setErrors({ email: message });
            if (found && !message) {
              run('lookup', () => {
                setAccountId(found.id);
                setStage('password');
              }, 450);
            }
            return;
          }
          if (!password) {
            setErrors({ password: 'Enter your password.' });
            return;
          }
          setErrors({});
          if (accountId) complete(accountId, 'sign-in');
        }}
        className="mt-8">
        <motion.div {...rise(2)}>

        <AnimatePresence mode="wait" initial={false}>
          {stage === 'email' ?
          <motion.div key="email" {...slide} className="space-y-5">
              <Field id="sign-in-email" label="Email address" error={errors.email}>
                {(describedBy) =>
              <div className="relative">
                    <MailIcon className="auth-input-icon" aria-hidden="true" />
                    <input
                  ref={emailRef}
                  id="sign-in-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={describedBy}
                  className={`${inputClass} has-lead`} />

                  </div>
              }
              </Field>
              <PrimaryButton type="submit" className="w-full" loading={isPending('lookup')} loadingLabel="Finding your account…">
                Continue
                <ArrowRightIcon className="auth-arrow h-4 w-4" aria-hidden="true" />
              </PrimaryButton>
            </motion.div> :

          <motion.div key="password" {...slide} className="space-y-5">
              <div className="flex items-center gap-3 rounded-2xl bg-white p-2.5 pr-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06]">
                <span className="auth-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold" aria-hidden="true">
                  {initialsOf(account?.name ?? email)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-semibold text-gray-900">{account?.name ?? 'Your account'}</span>
                  <span className="block truncate text-[12.5px] text-gray-600">{email.trim()}</span>
                </span>
                <button
                type="button"
                onClick={() => {
                  setStage('email');
                  setPassword('');
                  setErrors({});
                }}
                className="inline-flex min-h-[40px] items-center rounded-full px-3 text-[13px] font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900">

                  Change<span className="sr-only"> account</span>
                </button>
              </div>

              <Field id="sign-in-password" label="Password" error={errors.password}>
                {(describedBy) =>
              <div className="relative">
                    <LockIcon className="auth-input-icon" aria-hidden="true" />
                    <input
                  ref={passwordRef}
                  id="sign-in-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={describedBy}
                  className={`${inputClass} has-lead has-trail`} />

                    <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1.5 top-1/2 mt-0.5 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900">

                      {showPassword ? <EyeOffIcon className="h-[18px] w-[18px]" aria-hidden="true" /> : <EyeIcon className="h-[18px] w-[18px]" aria-hidden="true" />}
                    </button>
                  </div>
              }
              </Field>
              <PrimaryButton type="submit" className="w-full" loading={isPending('sign-in')} loadingLabel="Signing in…">
                Sign in
                <ArrowRightIcon className="auth-arrow h-4 w-4" aria-hidden="true" />
              </PrimaryButton>
              <p className="flex gap-2 text-[12.5px] leading-relaxed text-gray-500">
                <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                Prototype: any password works.
              </p>
            </motion.div>
          }
        </AnimatePresence>
        </motion.div>
      </form>

      <motion.div {...rise(4)}>
      <Link
        to={registerHref}
        className="group mt-8 flex min-h-[64px] items-center gap-4 rounded-2xl border border-dashed border-gray-300 px-4 py-3 transition-all duration-200 hover:border-solid hover:border-transparent hover:bg-white hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.18)]">

        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-gray-900">{registerLabel}</span>
        </span>
        <span className="auth-cta-circle flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5">
          <ArrowRightIcon className="auth-nudge h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
      </motion.div>

      <motion.div {...rise(5)} className="mt-6">
        <button
          type="button"
          onClick={() => setShowDemo((value) => !value)}
          aria-expanded={showDemo}
          aria-controls="demo-accounts"
          className="flex min-h-[48px] w-full items-center gap-3 rounded-2xl px-1 text-left text-[13.5px] font-medium text-gray-700 hover:text-[#0D1A15]">

          <span className="flex -space-x-2" aria-hidden="true">
            {demoAccounts.slice(0, 3).map((item) =>
            <span
              key={item.id}
              className="auth-avatar auth-bob flex h-8 w-8 items-center justify-center rounded-full text-[10.5px] font-bold ring-2 ring-white">

                {initialsOf(item.name)}
              </span>
            )}
          </span>
          <span className="flex-1">Try a sample account</span>
          <ChevronDownIcon className={`h-4 w-4 shrink-0 transition-transform duration-200 ${showDemo ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        <AnimatePresence initial={false}>
          {showDemo &&
          <motion.ul
            id="demo-accounts"
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduced ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2 max-h-80 space-y-1.5 overflow-y-auto">

              {demoAccounts.map((item) =>
            <li key={item.id}>
                  <button
                type="button"
                onClick={() => complete(item.id, item.id)}
                disabled={Boolean(pending)}
                aria-busy={isPending(item.id) || undefined}
                className="flex min-h-[60px] w-full flex-wrap items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-left ring-1 ring-black/[0.05] transition-all duration-150 hover:bg-white hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)] disabled:cursor-progress">

                    <span className="auth-avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold" aria-hidden="true">
                      {initialsOf(item.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-gray-900">{item.name}</span>
                      <span className="block truncate text-[12px] text-gray-600">{item.detail}</span>
                    </span>
                    {isPending(item.id) ?
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-gray-700">
                        <Spinner />
                        Signing in…
                      </span> :

                item.badge
                }
                  </button>
                </li>
            )}
            </motion.ul>
          }
        </AnimatePresence>
      </motion.div>
    </>);

}
