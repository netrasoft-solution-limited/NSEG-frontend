import React, { useState } from 'react';
import {
  BriefcaseIcon,
  BuildingIcon,
  ClipboardCheckIcon,
  CompassIcon,
  FileTextIcon,
  HandshakeIcon,
  HistoryIcon,
  SettingsIcon,
  ShieldCheckIcon,
  ShieldIcon,
  UsersIcon,
  WalletIcon } from
'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { useAuditLog, type AuditCategory } from '../lib/auditLog';
import type { IconComponent } from '../types/icons';

const categoryMeta: Record<AuditCategory, { label: string; icon: IconComponent }> = {
  exporters: { label: 'Exporters', icon: UsersIcon },
  buyers: { label: 'Buyers', icon: BuildingIcon },
  opportunities: { label: 'Opportunities', icon: BriefcaseIcon },
  engagements: { label: 'Engagements', icon: HandshakeIcon },
  readiness: { label: 'Readiness', icon: CompassIcon },
  compliance: { label: 'Compliance', icon: ShieldCheckIcon },
  incentives: { label: 'Incentives', icon: WalletIcon },
  vault: { label: 'Vault', icon: FileTextIcon },
  consent: { label: 'Consent', icon: ShieldIcon },
  settings: { label: 'Settings', icon: SettingsIcon }
};

const categoryOrder = Object.keys(categoryMeta) as AuditCategory[];

export function ConsoleAudit() {
  const { entries } = useAuditLog();
  const [filter, setFilter] = useState<AuditCategory | 'all'>('all');

  const filtered = filter === 'all' ? entries : entries.filter((entry) => entry.category === filter);

  return (
    <ConsoleLayout breadcrumb="Audit log">
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">Audit log</h1>
        <p className="mt-1 text-[13.5px] text-gray-500">
          Every officer decision across the Console, newest first.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <ClipboardCheckIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-150 ease-out ${
          filter === 'all' ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-500 hover:border-gray-300'}`
          }>

          All activity
        </button>
        {categoryOrder.map((category) => {
          const Icon = categoryMeta[category].icon;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-150 ease-out ${
              filter === category ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-500 hover:border-gray-300'}`
              }>

              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {categoryMeta[category].label}
            </button>);

        })}
      </div>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
        <ul className="space-y-3">
          {filtered.map((entry) => {
            const Icon = categoryMeta[entry.category].icon;
            return (
              <li key={entry.id} className="flex gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] text-gray-700">{entry.message}</span>
                  <span className="block text-[11.5px] text-gray-400">{entry.actorName} · {entry.when}</span>
                </span>
              </li>);

          })}
          {filtered.length === 0 &&
          <p className="py-6 text-center text-[13px] text-gray-400">No activity logged in this category yet.</p>
          }
        </ul>
        <p className="mt-4 flex items-center gap-1.5 text-[11.5px] text-gray-300">
          <HistoryIcon className="h-3 w-3" aria-hidden="true" />
          This session's log lives in memory — production writes each entry as a tamper-evident event to Module 2's
          WORM-backed audit trail.
        </p>
      </div>
    </ConsoleLayout>);

}
