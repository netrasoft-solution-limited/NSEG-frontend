export interface PolicyScenarioInputs {
  grantMatchPercent: number;
  taxRebatePercent: number;
  escrowFeeAdjustmentPercent: number;
  sectorFocus: string;
}

export interface PolicyScenarioProjection {
  horizonMonths: 12 | 24 | 36;
  exportVolumeGrowthPercent: number;
  fxInflowUsd: number;
  taxRevenueImpactUsd: number;
  jobsCreated: number;
}

/** Illustrative sandbox math standing in for BRD §5.3's predictive engine — not a real
 * economic model. Deterministic and derived transparently from the input variables, so a
 * reviewer can sanity-check the direction of every projection rather than trusting a
 * black box: more grant match and tax rebate drive growth, a higher escrow fee dampens
 * it, and generous rebates cost more in foregone tax revenue than they return early on. */
export function runPolicySimulation(
inputs: PolicyScenarioInputs,
baselineExportVolumeUsd: number)
: PolicyScenarioProjection[] {
  const annualGrowthRatePercent =
  2 + inputs.grantMatchPercent * 0.6 + inputs.taxRebatePercent * 0.4 - inputs.escrowFeeAdjustmentPercent * 1.5;

  const horizons: Array<12 | 24 | 36> = [12, 24, 36];

  return horizons.map((horizonMonths) => {
    const years = horizonMonths / 12;
    const exportVolumeGrowthPercent = Math.max(0, annualGrowthRatePercent * years);
    const fxInflowUsd = baselineExportVolumeUsd * (exportVolumeGrowthPercent / 100);
    const grantFiscalCostUsd = baselineExportVolumeUsd * (inputs.grantMatchPercent / 100) * 0.02 * years;
    const rebateFiscalCostUsd = fxInflowUsd * (inputs.taxRebatePercent / 100);
    const taxRevenueImpactUsd = fxInflowUsd * 0.05 - grantFiscalCostUsd - rebateFiscalCostUsd;
    const jobsCreated = Math.round(fxInflowUsd / 45000);

    return {
      horizonMonths,
      exportVolumeGrowthPercent: Math.round(exportVolumeGrowthPercent * 10) / 10,
      fxInflowUsd: Math.round(fxInflowUsd),
      taxRevenueImpactUsd: Math.round(taxRevenueImpactUsd),
      jobsCreated
    };
  });
}
