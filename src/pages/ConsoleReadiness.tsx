import React, { useState } from 'react';
import { CheckIcon, ClipboardListIcon, TrendingUpIcon, XIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { ReadinessQueue } from '../components/console/ReadinessQueue';
import { readinessSubmissions, type AssertionStatus } from '../data/readinessSubmissions';
import { actors } from '../data/actors';
import { downloadCsv } from '../lib/exportCsv';

const actorsById = new Map(actors.map((actor) => [actor.id, actor]));

export function ConsoleReadiness() {
  const [decisions, setDecisions] = useState<Record<string, AssertionStatus>>({});

  const statusOf = (id: string, fallback: AssertionStatus) => decisions[id] ?? fallback;

  const pending = readinessSubmissions.filter(
    (submission) => statusOf(submission.id, submission.assertionStatus) === 'pending'
  ).length;
  const issuedToday = Object.values(decisions).filter((status) => status === 'issued').length;
  const withheldToday = Object.values(decisions).filter((status) => status === 'withheld').length;
  const avgScore = Math.round(
    readinessSubmissions.reduce((total, submission) => total + submission.selfScore, 0) / readinessSubmissions.length
  );

  const handleExport = () => {
    downloadCsv(
      'nseg-readiness-submissions.csv',
      readinessSubmissions.map((submission) => ({
        exporter: actorsById.get(submission.actorId)?.name ?? submission.actorId,
        submittedOn: submission.submittedOn,
        selfScore: submission.selfScore,
        evidenceGaps: submission.evidenceGaps.join('; '),
        assertionStatus: statusOf(submission.id, submission.assertionStatus)
      }))
    );
  };

  return (
    <ConsoleLayout breadcrumb="Readiness" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">Readiness</h1>
        <p className="mt-1 text-[13.5px] text-gray-500">
          Review exporters' self-assessments and issue or withhold their Readiness Assertion.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ClipboardListIcon}
          label="Submissions awaiting review"
          value={pending.toString()}
          delta="Readiness"
          positive
          accent="sky" />

        <StatCard
          icon={CheckIcon}
          label="Assertions issued today"
          value={issuedToday.toString()}
          delta="+decision"
          positive
          accent="gate" />

        <StatCard
          icon={XIcon}
          label="Withheld today"
          value={withheldToday.toString()}
          delta="+decision"
          positive={false}
          accent="rose" />

        <StatCard
          icon={TrendingUpIcon}
          label="Average self-score"
          value={avgScore.toString()}
          delta="all submissions"
          positive
          accent="gold" />

      </div>

      <div className="mt-6">
        <ReadinessQueue
          submissions={readinessSubmissions}
          actorsById={actorsById}
          decisions={decisions}
          onDecide={(id, status) => setDecisions((current) => ({ ...current, [id]: status }))} />

      </div>
    </ConsoleLayout>);

}
