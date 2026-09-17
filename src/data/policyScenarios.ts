import { runPolicySimulation, type PolicyScenarioInputs, type PolicyScenarioProjection } from '../lib/policySimulation';

/** A completed simulation run — immutable once produced, stored for FMITI executive
 * review (BRD §5.3). Past runs are seeded here rather than recomputed on load, so
 * historical reports never shift if the sandbox formula is later tuned. */
export interface PolicyScenarioReport {
  id: string;
  runOn: string;
  runBy: string;
  inputs: PolicyScenarioInputs;
  projections: PolicyScenarioProjection[];
}

const baselineExportVolumeUsd = 14250000;

export const policyScenarioReports: PolicyScenarioReport[] = [
{
  id: 'sim-01',
  runOn: '2026-08-15',
  runBy: 'Chidi Okonkwo, FMITI Strategic Director',
  inputs: { grantMatchPercent: 5, taxRebatePercent: 2, escrowFeeAdjustmentPercent: 0.5, sectorFocus: '83131' },
  projections: runPolicySimulation(
    { grantMatchPercent: 5, taxRebatePercent: 2, escrowFeeAdjustmentPercent: 0.5, sectorFocus: '83131' },
    baselineExportVolumeUsd
  )
},
{
  id: 'sim-02',
  runOn: '2026-09-01',
  runBy: 'Chidi Okonkwo, FMITI Strategic Director',
  inputs: { grantMatchPercent: 10, taxRebatePercent: 5, escrowFeeAdjustmentPercent: 1, sectorFocus: '85999' },
  projections: runPolicySimulation(
    { grantMatchPercent: 10, taxRebatePercent: 5, escrowFeeAdjustmentPercent: 1, sectorFocus: '85999' },
    baselineExportVolumeUsd
  )
}];
