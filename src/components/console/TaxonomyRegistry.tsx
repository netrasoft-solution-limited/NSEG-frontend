import React from 'react';
import { ArchiveIcon } from 'lucide-react';
import { sectors } from '../../data/sectors';
import { supplyModes } from '../../data/observatory';
import { trustTiers } from '../../data/trustTiers';
import { buyerTiers } from '../../data/buyerTiers';
import { deprecatedCodes, taxonomyVersions, type TaxonomyCategory } from '../../data/taxonomies';

const codesByCategory: Record<TaxonomyCategory, { code: string; label: string }[]> = {
  'service-sectors': sectors.map((sector) => ({ code: sector.code, label: sector.label })),
  'supply-modes': supplyModes.map((mode) => ({ code: mode.id, label: mode.label })),
  'exporter-trust-tiers': trustTiers.map((tier) => ({ code: tier.id, label: tier.badge })),
  'buyer-tiers': buyerTiers.map((tier) => ({ code: tier.id, label: tier.badge }))
};

export function TaxonomyRegistry() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-[16px] font-semibold text-gray-900">Controlled vocabularies</h2>
        <p className="text-[12.5px] text-gray-400">
          Read-only — every dropdown in the Console draws from these tables, so nothing here is
          hardcoded per portal. Version supersession requires Technical Working Group sign-off, not a
          desk officer action.
        </p>
      </div>

      <div className="mt-4 space-y-5">
        {taxonomyVersions.map((taxonomy) => {
          const codes = codesByCategory[taxonomy.category];
          const deprecated = deprecatedCodes.filter((item) => item.category === taxonomy.category);

          return (
            <div key={taxonomy.category} className="rounded-xl border border-gray-100 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900">{taxonomy.label}</p>
                  <p className="text-[11.5px] text-gray-400">
                    {taxonomy.standard} · Updated {taxonomy.lastUpdatedOn}
                  </p>
                </div>
                <span className="rounded-full bg-gray-50 px-2.5 py-1 font-mono text-[11px] font-medium text-gray-500">
                  {taxonomy.version}
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {codes.map((item) =>
                <span
                  key={item.code}
                  title={item.code}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11.5px] text-gray-600">

                    <span className="font-mono text-[10px] text-gray-400">{item.code}</span>
                    {item.label}
                  </span>
                )}
              </div>

              {deprecated.length > 0 &&
              <div className="mt-2.5 border-t border-gray-50 pt-2.5">
                  <p className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                    <ArchiveIcon className="h-3 w-3" aria-hidden="true" />
                    Deprecated — kept for historical records only
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {deprecated.map((item) =>
                  <li key={item.code} className="text-[11.5px] text-gray-400">
                        <span className="font-mono text-[10px]">{item.code}</span> {item.label} · retired{' '}
                        {item.deprecatedOn}
                        {item.supersededByLabel &&
                    <> · superseded by <span className="font-mono text-[10px]">{item.supersededByCode}</span>{' '}
                          {item.supersededByLabel}</>
                    }
                      </li>
                  )}
                  </ul>
                </div>
              }
            </div>);

        })}
      </div>
    </div>);

}
