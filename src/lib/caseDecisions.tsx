import React, { createContext, useContext, useMemo, useState } from 'react';

export type SignalDecision = 'pending' | 'qualified' | 'rejected';
export type ShortlistDecision = 'pending' | 'approved' | 'adjust';

/** What the officer recorded with a decision. The reason is the point of the record. */
export interface DecisionRecord {
  reason: string;
  confidence?: 'High' | 'Medium' | 'Low';
}

/** A rule pinned to a case at the version it held when the case was qualified. */
export interface PinnedRequirement {
  id: string;
  version: number;
  title: string;
}

/** The canonical record qualifying a signal creates: one per qualified requirement, carried
 * unchanged from here to the verified outcome. */
export interface QualifiedOpportunity {
  id: string;
  signalId: string;
  title: string;
  origin: string;
  sectorCode: string;
  qualifiedOn: string;
  confidence?: string;
  reason: string;
  /** REG-02: pinned to the exact published version. A later revision flags the case. */
  criteriaVersion: number;
  pinned: PinnedRequirement[];
}

/**
 * Qualification and shortlist decisions, held for the whole console rather than for one page.
 *
 * Qualification and matching are separate queues an officer moves between, so the decisions
 * have to outlive the page: a signal qualified on the queue is the signal the shortlist screen
 * sees, and neither loses its recorded reason on the way.
 */
interface CaseDecisionsValue {
  /** Opportunities created by qualifying a signal in this session. */
  qualified: QualifiedOpportunity[];
  signalDecisions: Record<string, SignalDecision>;
  signalRecords: Record<string, DecisionRecord>;
  shortlistDecisions: Record<string, ShortlistDecision>;
  shortlistRecords: Record<string, DecisionRecord>;
  decideSignal: (
  id: string,
  decision: SignalDecision,
  record: DecisionRecord,
  /** Supplied when qualifying: what the case is, and the rules in force for it. */
  opportunity?: {title: string;origin: string;sectorCode: string;pinned: PinnedRequirement[];}) =>
  string | undefined;
  decideShortlist: (id: string, decision: ShortlistDecision, record: DecisionRecord) => void;
}

const CaseDecisionsContext = createContext<CaseDecisionsValue | null>(null);

export function CaseDecisionsProvider({ children }: {children: React.ReactNode;}) {
  const [signalDecisions, setSignalDecisions] = useState<Record<string, SignalDecision>>({});
  const [signalRecords, setSignalRecords] = useState<Record<string, DecisionRecord>>({});
  const [shortlistDecisions, setShortlistDecisions] = useState<Record<string, ShortlistDecision>>({});
  const [shortlistRecords, setShortlistRecords] = useState<Record<string, DecisionRecord>>({});
  const [qualified, setQualified] = useState<QualifiedOpportunity[]>([]);

  const value = useMemo<CaseDecisionsValue>(
    () => ({
      qualified,
      signalDecisions,
      signalRecords,
      shortlistDecisions,
      shortlistRecords,
      decideSignal: (id, decision, record, opportunity) => {
        setSignalDecisions((current) => ({ ...current, [id]: decision }));
        setSignalRecords((current) => ({ ...current, [id]: record }));
        if (decision !== 'qualified' || !opportunity) return undefined;
        // Qualifying is what creates the case, with the rules in force pinned to it.
        const opportunityId = `OPP-${2000 + qualified.length + 1}`;
        setQualified((current) => [
        {
          id: opportunityId,
          signalId: id,
          title: opportunity.title,
          origin: opportunity.origin,
          sectorCode: opportunity.sectorCode,
          qualifiedOn: new Date().toISOString().slice(0, 10),
          confidence: record.confidence,
          reason: record.reason,
          criteriaVersion: 1,
          pinned: opportunity.pinned
        },
        ...current]
        );
        return opportunityId;
      },
      decideShortlist: (id, decision, record) => {
        setShortlistDecisions((current) => ({ ...current, [id]: decision }));
        setShortlistRecords((current) => ({ ...current, [id]: record }));
      }
    }),
    [signalDecisions, signalRecords, shortlistDecisions, shortlistRecords, qualified]
  );

  return <CaseDecisionsContext.Provider value={value}>{children}</CaseDecisionsContext.Provider>;
}

export function useCaseDecisions(): CaseDecisionsValue {
  const context = useContext(CaseDecisionsContext);
  if (!context) throw new Error('useCaseDecisions must be used within a CaseDecisionsProvider');
  return context;
}
