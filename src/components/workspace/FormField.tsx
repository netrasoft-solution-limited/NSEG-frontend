import React from 'react';

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

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-gray-900 px-5 text-[14px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600">

      {children}
    </button>);

}

export function SecondaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-gray-300 bg-white px-5 text-[14px] font-medium text-gray-800 hover:border-gray-500">

      {children}
    </button>);

}

/** Step progress for onboarding: "Step 2 of 5 · Verify your email" plus a bar. */
export function StepProgress({ steps, current }: {steps: string[];current: number;}) {
  return (
    <div>
      <p className="text-[12.5px] text-gray-600">
        Step {current + 1} of {steps.length} · <span className="font-medium text-gray-900">{steps[current]}</span>
      </p>
      <div className="mt-2 flex gap-1" aria-hidden="true">
        {steps.map((step, index) =>
        <span key={step} className={`h-1.5 flex-1 rounded-full ${index <= current ? 'bg-gray-900' : 'bg-gray-200'}`} />
        )}
      </div>
    </div>);

}

/** Stand-in for the email code: nothing is sent in the prototype. */
export const PROTOTYPE_EMAIL_CODE = '123456';
