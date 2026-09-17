import React from 'react';
import { WorkspaceLayout, exporterRegisterTabs } from '../components/workspace/WorkspaceLayout';
import { BuyerLayout } from '../components/workspace/BuyerLayout';
import { RequirementsRegisterTable } from '../components/workspace/RequirementsRegisterTable';

const intro =
'Open, free and citable. Statutory duties, professional rules and buyer standards are kept apart and labelled, because treating them as the same thing is what sinks most export attempts.';

export function ExporterRequirementsRegister() {
  return (
    <WorkspaceLayout title="Requirements register" intro={intro} tabs={exporterRegisterTabs}>
      <RequirementsRegisterTable />
    </WorkspaceLayout>);

}

export function BuyerRequirementsRegister() {
  return (
    <BuyerLayout title="Requirements register" intro={intro}>
      <RequirementsRegisterTable />
    </BuyerLayout>);

}
