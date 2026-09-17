import React from 'react';
import { Link } from 'react-router-dom';
import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  BuildingIcon,
  ClipboardListIcon,
  CompassIcon,
  FileTextIcon,
  HistoryIcon,
  InboxIcon,
  ScaleIcon,
  SettingsIcon,
  ShieldCheckIcon,
  ShieldIcon,
  UsersIcon,
  WalletIcon } from
'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { signals } from '../data/signals';
import { shortlists } from '../data/shortlists';
import { readinessSubmissions } from '../data/readinessSubmissions';
import { regulatoryRequirements } from '../data/regulations';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';

const quickLinks = [
{ to: '/console/exporters', icon: UsersIcon, label: 'Exporters', desc: 'Registry, verification tier, activity' },
{ to: '/console/buyers', icon: BuildingIcon, label: 'Buyers', desc: 'Demand-side registry, JIT verification' },
{ to: '/console/opportunities', icon: BriefcaseIcon, label: 'Opportunities', desc: 'Signal intake, shortlist approval' },
{ to: '/console/readiness', icon: CompassIcon, label: 'Readiness', desc: 'Self-assessments, evidence gaps, assertions' },
{ to: '/console/compliance', icon: ShieldCheckIcon, label: 'Compliance', desc: 'Regulatory requirements register' },
{ to: '/console/observatory', icon: ActivityIcon, label: 'Observatory', desc: 'Reconciliation, regional & inclusion data' },
{ to: '/console/incentives', icon: WalletIcon, label: 'Incentives', desc: 'Export grants, tax credits, trade mission subsidies' },
{ to: '/console/vault', icon: FileTextIcon, label: 'Vault', desc: 'Document verification, malware scans, hashes' },
{ to: '/console/consent', icon: ShieldIcon, label: 'Consent', desc: 'Purpose-bound consent grants and disclosures' },
{ to: '/console/audit', icon: HistoryIcon, label: 'Audit log', desc: 'Every officer decision, newest first' },
{ to: '/console/settings', icon: SettingsIcon, label: 'Settings', desc: 'Profile and notification preferences' }];


export function ConsoleDashboard() {
  const { profile } = useOfficerProfile();
  const { entries } = useAuditLog();
  const firstName = profile.name.split(' ')[0];
  const pendingSignals = signals.length;
  const pendingShortlists = shortlists.length;
  const pendingReadiness = readinessSubmissions.filter((submission) => submission.assertionStatus === 'pending').length;
  const reviewDueRequirements = regulatoryRequirements.filter((item) => item.reviewDue).length;

  return (
    <ConsoleLayout breadcrumb="Dashboard">
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">
          Good to see you, {firstName}
        </h1>
        <p className="mt-1 text-[13.5px] text-gray-500">Here's what needs your attention across the Gateway.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={InboxIcon}
          label="Signals awaiting qualification"
          value={pendingSignals.toString()}
          delta="Opportunities"
          positive
          accent="sky" />

        <StatCard
          icon={ScaleIcon}
          label="Shortlists awaiting approval"
          value={pendingShortlists.toString()}
          delta="Opportunities"
          positive
          accent="gate" />

        <StatCard
          icon={AlertTriangleIcon}
          label="Requirements review due"
          value={reviewDueRequirements.toString()}
          delta="Compliance"
          positive={false}
          accent="gold" />

        <StatCard
          icon={ClipboardListIcon}
          label="Readiness submissions pending"
          value={pendingReadiness.toString()}
          delta="Readiness"
          positive
          accent="rose" />

      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
          <h2 className="text-[16px] font-semibold text-gray-900">Jump into a section</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex flex-col gap-3 rounded-xl border border-gray-100 p-4 transition-colors duration-150 ease-out hover:border-gray-300">

                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="flex items-center gap-1.5 text-[14px] font-semibold text-gray-900">
                      {link.label}
                      <ArrowRightIcon
                        className="h-3.5 w-3.5 text-gray-400 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                        aria-hidden="true" />

                    </span>
                    <span className="text-[12.5px] text-gray-400">{link.desc}</span>
                  </span>
                </Link>);

            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[16px] font-semibold text-gray-900">Recent activity</h2>
            <Link
              to="/console/audit"
              className="flex items-center gap-1 text-[12px] font-medium text-gray-400 transition-colors duration-150 ease-out hover:text-gray-700">

              View full log
              <ArrowRightIcon className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {entries.slice(0, 6).map((entry) =>
            <li key={entry.id} className="flex gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
                <span>
                  <span className="block text-[13px] text-gray-700">{entry.message}</span>
                  <span className="block text-[11.5px] text-gray-400">{entry.when}</span>
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </ConsoleLayout>);

}
