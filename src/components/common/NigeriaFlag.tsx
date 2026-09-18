import React from 'react';

/** The Nigerian national flag: three equal bands, green–white–green. */
export function NigeriaFlag({ className = 'h-3.5' }: {className?: string;}) {
  return (
    <svg viewBox="0 0 18 12" role="img" aria-label="Flag of Nigeria" className={`${className} w-auto shrink-0 rounded-[2px] ring-1 ring-inset ring-black/10`}>
      <rect width="18" height="12" fill="#ffffff" />
      <rect width="6" height="12" fill="#008751" />
      <rect x="12" width="6" height="12" fill="#008751" />
    </svg>);

}
