import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, XCircleIcon } from 'lucide-react';
import type { DisclosurePackage } from '../../lib/disclosurePackage';

interface DisclosurePackageViewerProps {
  package: DisclosurePackage;
  onView: () => void;
}

export function DisclosurePackageViewer({ package: pkg, onView }: DisclosurePackageViewerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) onView();
        }}
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-gray-500 transition-colors duration-150 ease-out hover:text-gray-900">

        {open ? <ChevronUpIcon className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronDownIcon className="h-3.5 w-3.5" aria-hidden="true" />}
        View disclosure package
      </button>

      {open &&
      <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[10.5px] text-gray-400">{pkg.packageId}</p>
            {pkg.valid ?
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-medium text-emerald-700">
                Access valid
              </span> :

          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10.5px] font-medium text-rose-700">
                <XCircleIcon className="h-3 w-3" aria-hidden="true" />
                Void
              </span>
          }
          </div>
          {!pkg.valid &&
        <p className="mt-1.5 text-[11.5px] text-rose-600">{pkg.voidReason}</p>
        }
          <p className="mt-1.5 text-[12px] text-gray-600">
            To <span className="font-medium text-gray-900">{pkg.recipient}</span> — {pkg.purpose}
          </p>
          <p className="mt-1 text-[11px] text-gray-400">Issued {pkg.issuedOn}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pkg.fields.map((field) =>
          <span
            key={field}
            className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10.5px] text-gray-600">

                {field}
              </span>
          )}
          </div>
          <div className="mt-2">
            <p className="text-[11px] font-medium text-gray-500">Evidence bundled</p>
            {pkg.evidence.length === 0 ?
          <p className="mt-0.5 text-[11.5px] text-gray-400">No verified documents to bundle yet.</p> :

          <ul className="mt-0.5 space-y-0.5">
                {pkg.evidence.map((label) =>
            <li key={label} className="text-[11.5px] text-gray-600">
                    · {label}
                  </li>
            )}
              </ul>
          }
            {pkg.pendingEvidenceCount > 0 &&
          <p className="mt-1 text-[11px] text-gray-400">
                {pkg.pendingEvidenceCount} additional document{pkg.pendingEvidenceCount === 1 ? '' : 's'} pending
                verification — excluded until confirmed.
              </p>
          }
          </div>
        </div>
      }
    </div>);

}
