import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckIcon } from 'lucide-react';
import { Spinner } from '../common/Spinner';

export const inputClass =
'mt-1 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-500 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/15 aria-[invalid=true]:border-rose-600';

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: (describedBy: string | undefined) => React.ReactNode;
}

/** Label, hint and error wired to the control with aria-describedby. */
export function Field({ id, label, error, hint, optional, children }: FieldProps) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-gray-800">
        {label}
        {optional && <span className="font-normal text-gray-600"> (optional)</span>}
      </label>
      {hint &&
      <p id={`${id}-hint`} className="mt-0.5 text-[12.5px] text-gray-600">
          {hint}
        </p>
      }
      {children(describedBy)}
      {error &&
      <p id={`${id}-error`} className="mt-1 text-[12.5px] text-rose-700">
          {error}
        </p>
      }
    </div>);

}

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Shows a spinner and this label, and blocks clicks, while an action is in flight. */
  loading?: boolean;
  loadingLabel?: string;
}

export function PrimaryButton({ children, loading = false, loadingLabel, disabled, className = '', ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      data-variant="primary"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${className} inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full px-5 text-[14px] font-semibold transition-colors duration-150 ease-out ${
      loading ?
      'cursor-progress bg-gray-800 text-white' :
      'bg-gray-900 text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600'}`
      }>

      {loading ?
      <>
          <Spinner />
          {loadingLabel ?? children}
        </> :

      children
      }
    </button>);

}

export function SecondaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      data-variant="secondary"
      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-gray-300 bg-white px-5 text-[14px] font-medium text-gray-800 hover:border-gray-500">

      {children}
    </button>);

}

/** Onboarding stepper, sat directly above the form: numbered nodes joined by a line that fills
 * as steps complete, then the current step and what comes next. */
export function StepProgress({ steps, current }: {steps: string[];current: number;}) {
  const reduced = useReducedMotion();
  const next = steps[current + 1];
  return (
    <div className="auth-stepper">
      <ol className="flex items-center" aria-label="Registration progress">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li
              key={step}
              aria-current={active ? 'step' : undefined}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>

              <span
                className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12.5px] font-semibold transition-colors duration-300 ${
                active ? 'auth-node--active' : done ? 'auth-node--done' : 'auth-node'}`
                }>

                {active && !reduced &&
                <motion.span
                  layoutId="auth-node-halo"
                  className="auth-node-halo absolute -inset-1.5 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }} />

                }
                <span className="relative">
                  {done ? <CheckIcon className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : index + 1}
                </span>
                <span className="sr-only">
                  {` ${step}${done ? ' (done)' : active ? ' (current)' : ''}`}
                </span>
              </span>
              {index < steps.length - 1 &&
              <span className="relative mx-1.5 h-[3px] flex-1 overflow-hidden rounded-full bg-gray-200" aria-hidden="true">
                  <motion.span
                  className="auth-line-fill absolute inset-y-0 left-0 rounded-full"
                  initial={false}
                  animate={{ width: done ? '100%' : '0%' }}
                  transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }} />

                </span>
              }
            </li>);

        })}
      </ol>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1" aria-hidden="true">
        <p className="text-[13px] text-gray-600">
          Step {current + 1} of {steps.length} · <span className="font-semibold text-gray-900">{steps[current]}</span>
        </p>
        {next && <p className="text-[12.5px] text-gray-500">Next: {next}</p>}
      </div>
    </div>);

}

/** Stand-in for the email code: nothing is sent in the prototype. */
export const PROTOTYPE_EMAIL_CODE = '123456';
