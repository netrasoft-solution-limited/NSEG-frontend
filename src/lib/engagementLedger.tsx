import React, { createContext, useContext, useMemo, useState } from 'react';
import { engagements as seededEngagements, type Engagement } from '../data/engagements';
import { consentGrants as seededGrants, type ConsentGrant, type ConsentStatus } from '../data/consentGrants';
import { outcomeReports as seededReports, type OutcomeReport } from '../data/outcomes';
import { opportunities } from '../data/opportunities';
import { actors } from '../data/actors';
import { nextStage, type EngagementStage } from './engagementStage';
import type { OutcomeVerificationStatus } from '../data/outcomes';
import { useAuditLog } from './auditLog';

/**
 * One case runs consent → referral → outcome, and officers act on all three. Holding each
 * page's decisions in its own state meant the stages disagreed: advancing a referral never
 * reached the outcome ledger, and revoking a consent grant never invalidated the referral that
 * depended on it — even though BRD §3.8 says access dies with the consent behind it.
 */
interface EngagementLedgerValue {
  engagements: Engagement[];
  consentGrants: ConsentGrant[];
  outcomeReports: OutcomeReport[];
  stageOf: (engagement: Engagement) => EngagementStage;
  consentStatusOf: (grant: ConsentGrant) => ConsentStatus;
  outcomeStatusOf: (report: OutcomeReport) => OutcomeVerificationStatus;
  advanceStage: (id: string, officer: string) => void;
  declineEngagement: (id: string, officer: string) => void;
  revokeConsent: (id: string, officer: string) => void;
  decideOutcome: (id: string, status: OutcomeVerificationStatus, officer: string) => void;
}

const EngagementLedgerContext = createContext<EngagementLedgerValue | null>(null);

const actorName = (actorId: string) => actors.find((actor) => actor.id === actorId)?.name ?? 'an exporter';
const opportunityTitle = (id: string) => opportunities.find((item) => item.id === id)?.title ?? id;

export function EngagementLedgerProvider({ children }: {children: React.ReactNode;}) {
  const { logEvent } = useAuditLog();
  const [stages, setStages] = useState<Record<string, EngagementStage>>({});
  const [consentOverrides, setConsentOverrides] = useState<Record<string, ConsentStatus>>({});
  const [outcomeDecisions, setOutcomeDecisions] = useState<Record<string, OutcomeVerificationStatus>>({});

  const value = useMemo<EngagementLedgerValue>(() => {
    const stageOf = (engagement: Engagement) => stages[engagement.id] ?? engagement.stage;
    const consentStatusOf = (grant: ConsentGrant) => consentOverrides[grant.id] ?? grant.status;
    const outcomeStatusOf = (report: OutcomeReport) => outcomeDecisions[report.id] ?? report.verification;

    return {
      engagements: seededEngagements.map((engagement) => ({ ...engagement, stage: stageOf(engagement) })),
      consentGrants: seededGrants.map((grant) => ({ ...grant, status: consentStatusOf(grant) })),
      outcomeReports: seededReports.map((report) => ({ ...report, verification: outcomeStatusOf(report) })),
      stageOf,
      consentStatusOf,
      outcomeStatusOf,
      advanceStage: (id, officer) => {
        const engagement = seededEngagements.find((item) => item.id === id);
        if (!engagement) return;
        const next = nextStage(stages[id] ?? engagement.stage);
        if (!next) return;
        setStages((current) => ({ ...current, [id]: next }));
        logEvent(`Advanced "${opportunityTitle(engagement.opportunityId)}" to ${next.replace('-', ' ')}`, 'engagements', officer);
      },
      declineEngagement: (id, officer) => {
        const engagement = seededEngagements.find((item) => item.id === id);
        if (!engagement) return;
        setStages((current) => ({ ...current, [id]: 'declined' }));
        logEvent(`Marked "${opportunityTitle(engagement.opportunityId)}" as declined`, 'engagements', officer);
      },
      revokeConsent: (id, officer) => {
        setConsentOverrides((current) => ({ ...current, [id]: 'revoked' }));
        const grant = seededGrants.find((item) => item.id === id);
        if (!grant) return;
        logEvent(`Revoked ${actorName(grant.actorId)}'s consent grant to ${grant.recipient}`, 'consent', officer);
      },
      decideOutcome: (id, status, officer) => {
        setOutcomeDecisions((current) => ({ ...current, [id]: status }));
        const report = seededReports.find((item) => item.id === id);
        const engagement = report ? seededEngagements.find((item) => item.id === report.engagementId) : undefined;
        const title = engagement ? opportunityTitle(engagement.opportunityId) : id;
        logEvent(
          status === 'verified' ?
          `Verified USD ${(report?.amount ?? 0).toLocaleString()} in export value for "${title}"` :
          `Rejected an outcome report for "${title}"`,
          'outcomes',
          officer
        );
      }
    };
  }, [stages, consentOverrides, outcomeDecisions, logEvent]);

  return <EngagementLedgerContext.Provider value={value}>{children}</EngagementLedgerContext.Provider>;
}

export function useEngagementLedger(): EngagementLedgerValue {
  const context = useContext(EngagementLedgerContext);
  if (!context) throw new Error('useEngagementLedger must be used within an EngagementLedgerProvider');
  return context;
}
