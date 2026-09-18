import React from 'react';

/** The official full-colour NSEG logo. Its "NSE" lettering is black, so on dark surfaces it
 * sits on a white tile rather than being swapped for a single-colour version. */
export function BrandLogo({ className = 'h-8' }: {className?: string;}) {
  return (
    <span className="inline-flex items-center rounded-xl bg-white px-2.5 py-1 shadow-sm ring-1 ring-black/5">
      <img src="/brand/nseg-logo-color.svg" alt="NSEG — Nigeria Service Export Gateway" className={`w-auto ${className}`} />
    </span>);

}
