import React from 'react';

interface ShareBarListProps {
  title: string;
  caption: string;
  items: { label: string; share: number }[];
}

export function ShareBarList({ title, caption, items }: ShareBarListProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold text-gray-900">{title}</h2>
      <p className="text-[12.5px] text-gray-400">{caption}</p>

      <ul className="mt-4 space-y-3">
        {items.map((item) =>
        <li key={item.label}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[13px] text-gray-700">{item.label}</span>
              <span className="font-mono text-[12px] text-gray-400">{item.share}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-gray-900" style={{ width: `${item.share}%` }} />
            </div>
          </li>
        )}
      </ul>
    </div>);

}
