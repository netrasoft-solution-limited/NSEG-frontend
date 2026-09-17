import React, { useState } from 'react';
import { PlayIcon } from 'lucide-react';
import { sectors } from '../../data/sectors';
import type { PolicyScenarioReport } from '../../data/policyScenarios';
import type { PolicyScenarioInputs } from '../../lib/policySimulation';
import { sectorLabel } from '../../lib/marketplaceLookups';

interface PolicySimulatorProps {
  reports: PolicyScenarioReport[];
  onRun: (inputs: PolicyScenarioInputs) => void;
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const horizonLabels: Record<12 | 24 | 36, string> = { 12: '12 months', 24: '24 months', 36: '36 months' };

export function PolicySimulator({ reports, onRun }: PolicySimulatorProps) {
  const [inputs, setInputs] = useState<PolicyScenarioInputs>({
    grantMatchPercent: 5,
    taxRebatePercent: 2,
    escrowFeeAdjustmentPercent: 0.5,
    sectorFocus: sectors[0].code
  });

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-[16px] font-semibold text-gray-900">Policy simulation sandbox</h2>
        <p className="text-[12.5px] text-gray-400">
          Model incentive policy changes against historical trade velocity — a sandbox run doesn't
          change any live incentive, and every completed run is stored for executive review.
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="flex items-center justify-between text-[12.5px] font-medium text-gray-600">
            Grant match percentage
            <span className="font-mono text-[11px] text-gray-400">{inputs.grantMatchPercent}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={25}
            step={0.5}
            value={inputs.grantMatchPercent}
            onChange={(event) => setInputs((current) => ({ ...current, grantMatchPercent: Number(event.target.value) }))}
            className="mt-2 w-full accent-gray-900" />

        </label>

        <label className="block">
          <span className="flex items-center justify-between text-[12.5px] font-medium text-gray-600">
            Tax rebate rate
            <span className="font-mono text-[11px] text-gray-400">{inputs.taxRebatePercent}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={15}
            step={0.5}
            value={inputs.taxRebatePercent}
            onChange={(event) => setInputs((current) => ({ ...current, taxRebatePercent: Number(event.target.value) }))}
            className="mt-2 w-full accent-gray-900" />

        </label>

        <label className="block">
          <span className="flex items-center justify-between text-[12.5px] font-medium text-gray-600">
            Platform escrow fee adjustment
            <span className="font-mono text-[11px] text-gray-400">{inputs.escrowFeeAdjustmentPercent}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={inputs.escrowFeeAdjustmentPercent}
            onChange={(event) =>
            setInputs((current) => ({ ...current, escrowFeeAdjustmentPercent: Number(event.target.value) }))
            }
            className="mt-2 w-full accent-gray-900" />

        </label>

        <label className="block">
          <span className="text-[12.5px] font-medium text-gray-600">Sector training allocation</span>
          <select
            value={inputs.sectorFocus}
            onChange={(event) => setInputs((current) => ({ ...current, sectorFocus: event.target.value }))}
            className="mt-2 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-900 focus:border-gray-400 focus:outline-none">

            {sectors.map((sector) =>
            <option key={sector.code} value={sector.code}>{sector.label}</option>
            )}
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={() => onRun(inputs)}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black">

        <PlayIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Run simulation
      </button>

      <div className="mt-5 border-t border-gray-50 pt-4">
        <p className="text-[12.5px] font-medium text-gray-600">Scenario reports</p>
        <ul className="mt-2 space-y-3">
          {reports.map((report) =>
          <li key={report.id} className="rounded-xl border border-gray-100 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[12.5px] text-gray-500">
                  Grant match {report.inputs.grantMatchPercent}% · Tax rebate {report.inputs.taxRebatePercent}% ·
                  Escrow fee +{report.inputs.escrowFeeAdjustmentPercent}% · {sectorLabel(report.inputs.sectorFocus)}
                </p>
                <span className="text-[11px] text-gray-400">
                  {report.runOn} · {report.runBy}
                </span>
              </div>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left text-[12.5px]">
                  <thead>
                    <tr className="text-[10.5px] uppercase tracking-[0.06em] text-gray-400">
                      <th className="py-1 pr-3 font-medium">Horizon</th>
                      <th className="py-1 pr-3 font-medium">Export volume growth</th>
                      <th className="py-1 pr-3 font-medium">FX inflow</th>
                      <th className="py-1 pr-3 font-medium">Tax revenue impact</th>
                      <th className="py-1 font-medium">Jobs created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.projections.map((projection) =>
                  <tr key={projection.horizonMonths} className="border-t border-gray-50">
                        <td className="py-1.5 pr-3 text-gray-500">{horizonLabels[projection.horizonMonths]}</td>
                        <td className="py-1.5 pr-3 font-medium text-gray-900">
                          +{projection.exportVolumeGrowthPercent}%
                        </td>
                        <td className="py-1.5 pr-3 text-gray-700">{currency.format(projection.fxInflowUsd)}</td>
                        <td
                      className={`py-1.5 pr-3 font-medium ${
                      projection.taxRevenueImpactUsd >= 0 ? 'text-emerald-700' : 'text-rose-600'}`
                      }>

                          {currency.format(projection.taxRevenueImpactUsd)}
                        </td>
                        <td className="py-1.5 text-gray-700">{projection.jobsCreated.toLocaleString()}</td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>);

}
