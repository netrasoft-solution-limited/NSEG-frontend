import React from 'react';

/** A spinning ring. Decorative on its own — pair it with visible or sr-only text. */
export function Spinner({ className = 'h-4 w-4' }: {className?: string;}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`animate-spin motion-reduce:[animation-duration:1.6s] ${className}`}>

      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path d="M21.5 12A9.5 9.5 0 0 0 12 2.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>);

}
