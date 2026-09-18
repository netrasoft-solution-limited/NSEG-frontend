import React from 'react';
import { Link } from 'react-router-dom';
import {
  ActivityIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  BanknoteIcon,
  ClipboardCheckIcon,
  CompassIcon,
  FileTextIcon,
  HistoryIcon,
  InboxIcon,
  ScaleIcon,
  ShieldIcon,
  UsersRoundIcon } from
'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { CountUp, PipelineFlow, ShareBars, ValueGauge } from '../components/console/DashboardParts';
import { signals } from '../data/signals';
import { shortlists } from '../data/shortlists';
import { actors } from '../data/actors';
import { buyers } from '../data/buyers';
import { opportunities } from '../data/opportunities';
import { engagements } from '../data/engagements';
import { consentGrants } from '../data/consentGrants';
import { outcomeReports } from '../data/outcomes';
import { readinessSubmissions } from '../data/readinessSubmissions';
import { headlineMetric, institutionReconciliation, regionalDistribution, topCategories } from '../data/observatory';
import { useRegulatoryRegister } from '../lib/regulatoryRegister';
import { useOfficerProfile } from '../lib/officerProfile';
import { useGatewayExchange } from '../lib/gatewayExchange';
import { useAuditLog } from '../lib/auditLog';

/** The quarter's target behind the headline figure, so the gauge has something to measure
 * against. Stated here rather than implied by the dial. */
const QUARTER_TARGET = 18;

const reconciliationTone: Record<string, string> = {
  reconciled: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  pending: 'bg-amber-50 text-amber-900 ring-amber-200',
  flagged: 'bg-rose-50 text-rose-800 ring-rose-200'
};

export function ConsoleDashboard() {
  const { profile } = useOfficerProfile();
  const { entries } = useAuditLog();
  const { requirements } = useRegulatoryRegister();
  const exchange = useGatewayExchange();
  const firstName = profile.name.split(' ')[0];

  const submittedSignals = signals.length + exchange.requests.filter((request) => request.decision === 'pending').length;
  const shortlistsToApprove = shortlists.length;
  const provisionalOutcomes = outcomeReports.filter((report) => report.verification === 'provisional').length;
  const readinessPending = readinessSubmissions.filter((submission) => submission.assertionStatus === 'pending').length;
  const reviewDue = requirements.filter((item) => item.reviewDue).length;
  const verifiedOutcomes = outcomeReports.filter((report) => report.verification === 'verified').length;

  /** Only the queues that actually have something in them, most consequential first. */
  const queues = [
  {
    count: submittedSignals,
    title: `Qualify ${submittedSignals} demand signal${submittedSignals === 1 ? '' : 's'}`,
    detail: 'A named officer decides, with a reason. The Gateway never qualifies on its own.',
    to: '/console/opportunities',
    icon: InboxIcon
  },
  {
    count: shortlistsToApprove,
    title: `Approve ${shortlistsToApprove} shortlist${shortlistsToApprove === 1 ? '' : 's'}`,
    detail: 'Check the match reasoning before any exporter is contacted.',
    to: '/console/opportunities',
    icon: ClipboardCheckIcon
  },
  {
    count: provisionalOutcomes,
    title: `Verify ${provisionalOutcomes} reported outcome${provisionalOutcomes === 1 ? '' : 's'}`,
    detail: 'Self-reported value stays out of the Observatory until it is verified.',
    to: '/console/engagements/outcomes',
    icon: BadgeCheckIcon
  },
  {
    count: readinessPending,
    title: `Review ${readinessPending} readiness submission${readinessPending === 1 ? '' : 's'}`,
    detail: 'Issue or decline the assertion an exporter is waiting on.',
    to: '/console/registry/readiness',
    icon: CompassIcon
  },
  {
    count: reviewDue,
    title: `${reviewDue} requirement${reviewDue === 1 ? '' : 's'} past review`,
    detail: 'An out-of-date rule blocks the cases pinned to it.',
    to: '/console/requirements',
    icon: ScaleIcon
  }].
  filter((queue) => queue.count > 0);

  const waiting = queues.reduce((total, queue) => total + queue.count, 0);

  const pipeline = [
  { label: 'Signals', detail: 'Awaiting qualification', count: submittedSignals },
  { label: 'Qualified', detail: 'Criteria published', count: opportunities.filter((item) => item.stage === 'qualified').length },
  { label: 'Matched', detail: 'Shortlist with reasons', count: opportunities.filter((item) => item.stage === 'matched').length },
  { label: 'Consented', detail: 'Exporter agreed to share', count: opportunities.filter((item) => item.stage === 'consented').length },
  { label: 'Contracted', detail: 'Engagement under way', count: engagements.filter((item) => item.stage === 'commenced' || item.stage === 'contract-signed').length },
  { label: 'Verified', detail: 'Counted once, attributed', count: verifiedOutcomes }];


  const registryStats = [
  { icon: UsersRoundIcon, label: 'Exporters registered', value: actors.length, note: `${actors.filter((actor) => actor.verifiedEvidence.length > 0).length} with verified evidence` },
  { icon: ActivityIcon, label: 'Buyers registered', value: buyers.length, note: `${buyers.filter((buyer) => buyer.tier !== 'registered').length} verified against a registry` },
  { icon: ShieldIcon, label: 'Active consents', value: consentGrants.filter((grant) => grant.status === 'active').length, note: 'Purpose-bound and expiring' },
  { icon: FileTextIcon, label: 'Published requirements', value: requirements.filter((item) => item.status === 'current').length, note: `${reviewDue} past review` }];


  return (
    <ConsoleLayout breadcrumb="Dashboard">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">
            Good to see you, {firstName}
          </h1>
          <p className="mt-1.5 text-[14.5px] text-gray-600">
            {waiting > 0 ?
            <>
                <span className="font-semibold text-gray-900">{waiting} decisions</span> are waiting on an officer.
              </> :
            'Nothing is waiting on an officer. Every case is with a buyer or an exporter.'}
          </p>
        </div>
        <Link
          to="/console/observatory/audit"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-[13.5px] font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 hover:text-gray-900 hover:ring-gray-400">

          <HistoryIcon className="h-4 w-4" aria-hidden="true" />
          Audit log
        </Link>
      </div>

      {/* The work itself, before any chart: a queue an officer can open straight from here. */}
      <section aria-labelledby="waiting" className="console-command mt-6 overflow-hidden rounded-3xl p-5 text-white sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="waiting" className="font-display text-[20px] font-semibold tracking-[-0.01em]">
            Work waiting on you
          </h2>
          <span className="auth-eyebrow inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]">
            <span className="auth-live-dot" aria-hidden="true" />
            {profile.role === 'adspa-auditor' ? 'Read-only' : 'Decisions needed'}
          </span>
        </div>

        {queues.length === 0 ?
        <p className="mt-4 text-[14px] text-white/70">
            Nothing outstanding. New signals, shortlists and reported outcomes arrive here.
          </p> :

        <ul className="mt-5 grid gap-3 lg:grid-cols-2">
            {queues.map(({ icon: Icon, title, detail, to, count }) =>
          <li key={title}>
                <Link
              to={to}
              className="auth-glass group flex items-center gap-4 rounded-2xl p-4 transition-colors duration-150 hover:bg-white/[0.12]">

                  <span className="auth-event-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-white">{title}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-white/60">{detail}</span>
                  </span>
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-white">
                    <span className="auth-count rounded-full px-2 py-0.5 text-[12px] leading-none">{count}</span>
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
          )}
          </ul>
        }
      </section>

      <section aria-labelledby="pipeline" className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="pipeline" className="text-[16px] font-semibold text-gray-900">
              The pipeline, end to end
            </h2>
            <p className="mt-1 text-[13px] text-gray-600">
              One canonical record per case, carried from a stated requirement to a verified outcome.
            </p>
          </div>
          <Link to="/console/opportunities" className="text-[13px] font-semibold text-gray-900 underline-offset-4 hover:underline">
            Open case management
          </Link>
        </div>
        <div className="mt-5">
          <PipelineFlow steps={pipeline} />
        </div>
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <section aria-labelledby="value" className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
          <h2 id="value" className="text-[16px] font-semibold text-gray-900">
            {headlineMetric.label}
          </h2>
          <div className="mt-5">
            <ValueGauge
              value={headlineMetric.value}
              target={QUARTER_TARGET}
              unit="M"
              caption={`${headlineMetric.note}. Target for the quarter is $${QUARTER_TARGET}M.`} />

          </div>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          <section aria-labelledby="categories" className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
            <h2 id="categories" className="text-[16px] font-semibold text-gray-900">
              Verified value by service
            </h2>
            <div className="mt-4">
              <ShareBars
                rows={topCategories.map((category) => ({
                  label: category.label,
                  value: Number.parseFloat(category.value),
                  note: `$${category.value}`
                }))} />

            </div>
          </section>

          <section aria-labelledby="regions" className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
            <h2 id="regions" className="text-[16px] font-semibold text-gray-900">
              Where it comes from
            </h2>
            <div className="mt-4">
              <ShareBars rows={regionalDistribution.map((region) => ({ label: region.region, value: region.share }))} unit="%" />
            </div>
          </section>

          <section aria-labelledby="reconciliation" className="rounded-3xl border border-gray-200 bg-white p-5 sm:col-span-2 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="reconciliation" className="text-[16px] font-semibold text-gray-900">
                Institution reconciliation
              </h2>
              <Link to="/console/observatory" className="text-[13px] font-semibold text-gray-900 underline-offset-4 hover:underline">
                Open the Observatory
              </Link>
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {institutionReconciliation.map((institution) =>
              <li
                key={institution.institution}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-gray-50 px-3.5 py-3 ring-1 ring-inset ring-gray-200/70">

                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold text-gray-900">{institution.institution}</span>
                    <span className="block truncate text-[12px] text-gray-600">{institution.fullName}</span>
                  </span>
                  <span
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset ${
                  reconciliationTone[institution.status]}`
                  }>

                    {institution.status === 'flagged' ? `${institution.flaggedClaims} flagged` : institution.status === 'pending' ? 'Sync pending' : 'Reconciled'}
                  </span>
                </li>
              )}
            </ul>
          </section>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {registryStats.map(({ icon: Icon, label, value, note }) =>
        <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4">
            <dt className="flex items-center gap-2 text-[12.5px] font-medium text-gray-600">
              <Icon className="h-4 w-4 text-gray-500" aria-hidden="true" />
              {label}
            </dt>
            <dd>
              <span className="mt-1.5 block font-display text-[28px] font-semibold leading-none text-gray-900">
                <CountUp to={value} />
              </span>
              <span className="mt-1 block text-[12px] text-gray-600">{note}</span>
            </dd>
          </div>
        )}
      </dl>

      <section aria-labelledby="activity" className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="activity" className="text-[16px] font-semibold text-gray-900">
            Recent decisions
          </h2>
          <Link to="/console/observatory/audit" className="text-[13px] font-semibold text-gray-900 underline-offset-4 hover:underline">
            View the full log
          </Link>
        </div>
        <ol className="mt-4 space-y-0">
          {entries.slice(0, 6).map((entry, index) =>
          <li key={entry.id} className="relative flex gap-3.5 pb-4 last:pb-0">
              {index < Math.min(entries.length, 6) - 1 &&
            <span aria-hidden="true" className="absolute left-[5px] top-4 h-[calc(100%-10px)] w-px bg-gray-200" />
            }
              <span className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-gate" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-medium text-gray-900">{entry.message}</span>
                <span className="block text-[12px] text-gray-500">
                  {entry.actorName} · {entry.when}
                </span>
              </span>
            </li>
          )}
        </ol>
      </section>

      <p className="mt-6 flex items-start gap-2 text-[12.5px] leading-relaxed text-gray-600">
        <BanknoteIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Figures above the pipeline are the national totals the Observatory publishes. Case counts are this prototype's own
        records.
      </p>
    </ConsoleLayout>);

}
