import React, { useState } from 'react';
import { CheckIcon, ClipboardListIcon, RefreshCwIcon, TrendingUpIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { ReadinessQueue } from '../components/console/ReadinessQueue';
import { readinessSubmissions, type AssertionStatus } from '../data/readinessSubmissions';
import { actors } from '../data/actors';
import { downloadCsv } from '../lib/exportCsv';
import { computeReadinessScore, readinessTierFor } from '../lib/readinessScore';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { canMutate } from '../lib/permissions';
import { useRegulatoryRegister } from '../lib/regulatoryRegister';
import { AssertionRegister } from '../components/console/AssertionRegister';

const actorsById = new Map(actors.map((actor) => [actor.id, actor]));

export function ConsoleReadiness() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const [decisions, setDecisions] = useState<Record<string, AssertionStatus>>({});
  const register = useRegulatoryRegister();
  const needRevalidation = register.assertions.filter((item) => item.status === 'revalidation-required').length;

  const statusOf = (id: string, fallback: AssertionStatus) => decisions[id] ?? fallback;

  const pending = readinessSubmissions.filter(
    (submission) => statusOf(submission.id, submission.assertionStatus) === 'pending'
  ).length;
  const issuedToday = Object.values(decisions).filter((status) => status === 'issued').length;
  const withheldToday = Object.values(decisions).filter((status) => status === 'withheld').length;
  const avgScore = Math.round(
    readinessSubmissions.reduce((total, submission) => total + computeReadinessScore(submission.parameterScores), 0) /
    readinessSubmissions.length
  );

  const handleExport = () => {
    downloadCsv(
      'nseg-readiness-submissions.csv',
      readinessSubmissions.map((submission) => {
        const score = computeReadinessScore(submission.parameterScores);
        return {
          exporter: actorsById.get(submission.actorId)?.name ?? submission.actorId,
          submittedOn: submission.submittedOn,
          diagnosticScore: score,
          readinessTier: readinessTierFor(score).label,
          evidenceGaps: submission.evidenceGaps.join('; '),
          assertionStatus: statusOf(submission.id, submission.assertionStatus)
        };
      })
    );
    logEvent(`Exported readiness submissions (${readinessSubmissions.length} rows)`, 'readiness', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Readiness" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">Readiness</h1>
        <p className="mt-1.5 text-[14.5px] text-gray-600">
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
          icon={RefreshCwIcon}
          label="Assertions to revalidate"
          value={needRevalidation.toString()}
          delta={`${withheldToday} withheld today`}
          positive={needRevalidation === 0}
          accent="rose" />

        <StatCard
          icon={TrendingUpIcon}
          label="Average diagnostic score"
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
          canMutate={canMutate(profile.role)}
          onDecide={(id, status) => {
            setDecisions((current) => ({ ...current, [id]: status }));
            const submission = readinessSubmissions.find((item) => item.id === id);
            const actor = submission ? actorsById.get(submission.actorId) : undefined;
            if (status === 'issued' && submission) {
              register.issueAssertion(submission.actorId, profile.name, submission.evidenceGaps);
            }
            logEvent(
              `${status === 'issued' ? 'Issued' : 'Withheld'} a Readiness Assertion for ${actor?.name ?? 'an exporter'}`,
              'readiness',
              profile.name
            );
          }} />

      </div>

      <div className="mt-6">
        <AssertionRegister
          assertions={register.assertions}
          actorsById={actorsById}
          impacts={register.impacts}
          canMutate={canMutate(profile.role)}
          onRevalidate={(assertion) => {
            register.revalidateAssertion(assertion.id, profile.name);
            logEvent(
              `Revalidated ${actorsById.get(assertion.actorId)?.name ?? 'an exporter'}'s readiness assertion against current requirements`,
              'readiness',
              profile.name
            );
          }}
          onWithdraw={(assertion, note) => {
            register.withdrawAssertion(assertion.id, profile.name, note);
            logEvent(
              `Withdrew ${actorsById.get(assertion.actorId)?.name ?? 'an exporter'}'s readiness assertion: ${note}`,
              'readiness',
              profile.name
            );
          }} />

      </div>
    </ConsoleLayout>);

}
