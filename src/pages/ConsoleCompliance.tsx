import React, { useState } from 'react';
import { AlertTriangleIcon, CheckCircleIcon, FileTextIcon, HistoryIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { ComplianceRegister, type ComplianceFilterState } from '../components/console/ComplianceRegister';
import { regulatoryRequirements } from '../data/regulations';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { canMutate } from '../lib/permissions';

const emptyFilters: ComplianceFilterState = { search: '', category: 'all', status: 'all' };

interface OverrideState {
  status: (typeof regulatoryRequirements)[number]['status'];
  reviewDue: boolean;
}

export function ConsoleCompliance() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const [filters, setFilters] = useState<ComplianceFilterState>(emptyFilters);
  const [overrides, setOverrides] = useState<Record<string, OverrideState>>({});

  const stateOf = (id: string) => {
    const requirement = regulatoryRequirements.find((item) => item.id === id);
    return overrides[id] ?? { status: requirement?.status ?? 'current', reviewDue: requirement?.reviewDue ?? false };
  };

  const query = filters.search.trim().toLowerCase();
  const filtered = regulatoryRequirements.filter((requirement) => {
    const state = stateOf(requirement.id);
    const matchesSearch =
    !query ||
    requirement.title.toLowerCase().includes(query) ||
    requirement.authority.toLowerCase().includes(query);
    const matchesCategory = filters.category === 'all' || requirement.category === filters.category;
    const matchesStatus = filters.status === 'all' || state.status === filters.status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const reviewDueCount = regulatoryRequirements.filter((item) => stateOf(item.id).reviewDue).length;
  const underReviewCount = regulatoryRequirements.filter((item) => stateOf(item.id).status === 'under-review').length;
  const currentCount = regulatoryRequirements.filter((item) => stateOf(item.id).status === 'current').length;

  const handleExport = () => {
    downloadCsv(
      'nseg-regulatory-register.csv',
      regulatoryRequirements.map((requirement) => {
        const state = stateOf(requirement.id);
        return {
          title: requirement.title,
          category: requirement.category,
          authority: requirement.authority,
          lastReviewedOn: requirement.lastReviewedOn,
          status: state.status,
          reviewDue: state.reviewDue ? 'yes' : 'no'
        };
      })
    );
    logEvent(`Exported the regulatory register (${regulatoryRequirements.length} rows)`, 'compliance', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Compliance" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">Compliance</h1>
        <p className="mt-1 text-[13.5px] text-gray-500">
          Maintain the regulatory requirements register — the content, not the exporter-facing wizard.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileTextIcon}
          label="Total requirements"
          value={regulatoryRequirements.length.toString()}
          delta="Register"
          positive
          accent="sky" />

        <StatCard
          icon={CheckCircleIcon}
          label="Current"
          value={currentCount.toString()}
          delta="Register"
          positive
          accent="gate" />

        <StatCard
          icon={HistoryIcon}
          label="Under review"
          value={underReviewCount.toString()}
          delta="Register"
          positive
          accent="gold" />

        <StatCard
          icon={AlertTriangleIcon}
          label="Review due"
          value={reviewDueCount.toString()}
          delta="Needs attention"
          positive={false}
          accent="rose" />

      </div>

      <div className="mt-6">
        <ComplianceRegister
          requirements={filtered}
          total={regulatoryRequirements.length}
          filters={filters}
          onFilterChange={setFilters}
          overrides={overrides}
          canMutate={canMutate(profile.role)}
          onAction={(id, next) => {
            setOverrides((current) => ({ ...current, [id]: next }));
            const requirement = regulatoryRequirements.find((item) => item.id === id);
            logEvent(
              next.status === 'current' ?
              `Marked "${requirement?.title ?? id}" as reviewed` :
              `Flagged "${requirement?.title ?? id}" for review`,
              'compliance',
              profile.name
            );
          }} />

      </div>
    </ConsoleLayout>);

}
