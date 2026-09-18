import React, { createContext, useContext, useMemo, useState } from 'react';
import { readinessSubmissions as seededSubmissions, type ReadinessSubmission } from '../data/readinessSubmissions';
import { incentiveApplications as seededApplications, type IncentiveApplication, type IncentiveReviewStatus } from '../data/incentives';
import { delegations as seededDelegations, type Delegation, type DelegationStatus } from '../data/delegations';
import type { AssertionStatus } from '../data/readinessSubmissions';

/**
 * Officer decisions on an exporter's own record — readiness assertions, incentive reviews and
 * delegated access. Held here rather than per page, because each of these is shown twice: on
 * its registry-wide queue and again on that exporter's record, and the two have to agree.
 */
interface RegistryDecisionsValue {
  submissions: ReadinessSubmission[];
  applications: IncentiveApplication[];
  delegations: Delegation[];
  /** True when an officer has suspended (or reinstated) this exporter in the console. */
  isSuspended: (actorId: string, seeded: boolean) => boolean;
  setSuspended: (actorId: string, suspended: boolean) => void;
  decideAssertion: (id: string, status: AssertionStatus) => void;
  decideIncentive: (id: string, status: IncentiveReviewStatus) => void;
  revokeDelegation: (id: string) => void;
}

const RegistryDecisionsContext = createContext<RegistryDecisionsValue | null>(null);

export function RegistryDecisionsProvider({ children }: {children: React.ReactNode;}) {
  const [assertions, setAssertions] = useState<Record<string, AssertionStatus>>({});
  const [incentives, setIncentives] = useState<Record<string, IncentiveReviewStatus>>({});
  const [delegationOverrides, setDelegationOverrides] = useState<Record<string, DelegationStatus>>({});
  const [suspensions, setSuspensions] = useState<Record<string, boolean>>({});

  const value = useMemo<RegistryDecisionsValue>(
    () => ({
      submissions: seededSubmissions.map((submission) => ({
        ...submission,
        assertionStatus: assertions[submission.id] ?? submission.assertionStatus
      })),
      applications: seededApplications.map((application) => ({
        ...application,
        reviewStatus: incentives[application.id] ?? application.reviewStatus
      })),
      delegations: seededDelegations.map((delegation) => ({
        ...delegation,
        status: delegationOverrides[delegation.id] ?? delegation.status
      })),
      isSuspended: (actorId, seeded) => suspensions[actorId] ?? seeded,
      setSuspended: (actorId, suspended) => setSuspensions((current) => ({ ...current, [actorId]: suspended })),
      decideAssertion: (id, status) => setAssertions((current) => ({ ...current, [id]: status })),
      decideIncentive: (id, status) => setIncentives((current) => ({ ...current, [id]: status })),
      revokeDelegation: (id) => setDelegationOverrides((current) => ({ ...current, [id]: 'revoked' }))
    }),
    [assertions, incentives, delegationOverrides, suspensions]
  );

  return <RegistryDecisionsContext.Provider value={value}>{children}</RegistryDecisionsContext.Provider>;
}

export function useRegistryDecisions(): RegistryDecisionsValue {
  const context = useContext(RegistryDecisionsContext);
  if (!context) throw new Error('useRegistryDecisions must be used within a RegistryDecisionsProvider');
  return context;
}
