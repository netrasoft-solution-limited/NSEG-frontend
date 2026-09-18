import React from 'react';
import { ScaleIcon, UsersRoundIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { opportunityTabs } from '../components/console/consoleTabs';
import { StatCard } from '../components/console/StatCard';
import { ShortlistReview } from '../components/console/ShortlistReview';
import { opportunities } from '../data/opportunities';
import { shortlists } from '../data/shortlists';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { useCaseDecisions } from '../lib/caseDecisions';
import { canMutate } from '../lib/permissions';

const shortlistItems = shortlists.
map((shortlist) => {
  const opportunity = opportunities.find((item) => item.id === shortlist.opportunityId);
  return opportunity ? { opportunity, shortlist } : null;
}).
filter((item): item is {opportunity: (typeof opportunities)[number];shortlist: (typeof shortlists)[number];} => item !== null);

/** Matching results are a shortlist input, never a selection: a named officer approves who is
 * introduced, and says why — including why the others were not. */
export function ConsoleShortlists() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const mutable = canMutate(profile.role);
  const { shortlistDecisions, shortlistRecords, decideShortlist } = useCaseDecisions();

  const pending = shortlistItems.filter(
    ({ opportunity }) => (shortlistDecisions[opportunity.id] ?? 'pending') === 'pending'
  ).length;
  const approved = Object.values(shortlistDecisions).filter((decision) => decision === 'approved').length;
  const adjusting = Object.values(shortlistDecisions).filter((decision) => decision === 'adjust').length;
  const candidates = shortlistItems.reduce((total, item) => total + item.shortlist.candidates.length, 0);

  const handleExport = () => {
    downloadCsv(
      'nseg-shortlists.csv',
      shortlistItems.flatMap(({ opportunity, shortlist }) =>
      shortlist.candidates.map((candidate) => ({
        opportunity: opportunity.title,
        exporter: candidate.name,
        natepId: candidate.natepId,
        score: candidate.score,
        decision: shortlistDecisions[opportunity.id] ?? 'pending',
        rationale: shortlistRecords[opportunity.id]?.reason ?? ''
      }))
      )
    );
    logEvent(`Exported the shortlist register (${candidates} candidates)`, 'opportunities', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Opportunities · Shortlists" onExport={handleExport} tabs={opportunityTabs}>
      <div>
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">
          Shortlists
        </h1>
        <p className="mt-1.5 max-w-3xl text-[14.5px] text-gray-600">
          Scores rank and explain; they never select. Approving asks each exporter for consent — nothing reaches the
          buyer until they agree.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ScaleIcon}
          label="Awaiting approval"
          value={pending.toString()}
          delta={pending ? 'Needs a decision' : 'None waiting'}
          positive={pending === 0}
          accent="gate" />

        <StatCard
          icon={UsersRoundIcon}
          label="Candidates compared"
          value={candidates.toString()}
          delta="Across all shortlists"
          positive
          accent="sky" />

        <StatCard
          icon={ScaleIcon}
          label="Approved"
          value={approved.toString()}
          delta="Consent requested"
          positive
          accent="gold" />

        <StatCard
          icon={ScaleIcon}
          label="Sent back to matching"
          value={adjusting.toString()}
          delta="Reason recorded"
          positive={false}
          accent="rose" />

      </div>

      <div className="mt-6">
        <ShortlistReview
          items={shortlistItems}
          decisions={shortlistDecisions}
          records={shortlistRecords}
          canMutate={mutable}
          onDecide={(id, decision, record) => {
            decideShortlist(id, decision, record);
            const opportunity = opportunities.find((item) => item.id === id);
            logEvent(
              decision === 'approved' ?
              `Approved the shortlist for "${opportunity?.title ?? id}" — "${record.reason}"` :
              `Requested adjustment on the shortlist for "${opportunity?.title ?? id}" — "${record.reason}"`,
              'opportunities',
              profile.name
            );
          }} />

      </div>
    </ConsoleLayout>);

}
