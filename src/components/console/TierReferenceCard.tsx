import React from 'react';
import { ArrowRightIcon, UnlockIcon } from 'lucide-react';

interface TierReferenceCardProps {
  badge: string;
  unlocked: string[];
  nextStep: string;
  accentClass: string;
}

export function TierReferenceCard({ badge, unlocked, nextStep, accentClass }: TierReferenceCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 px-4 py-3">
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-medium ${accentClass}`}>
        {badge}
      </span>
      <ul className="mt-2 space-y-1">
        {unlocked.map((item) =>
        <li key={item} className="flex items-center gap-1.5 text-[12px] text-gray-600">
            <UnlockIcon className="h-3 w-3 shrink-0 text-gray-400" aria-hidden="true" />
            {item}
          </li>
        )}
      </ul>
      <p className="mt-2 flex items-start gap-1.5 text-[11.5px] text-gray-400">
        <ArrowRightIcon className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        {nextStep}
      </p>
    </div>);

}
