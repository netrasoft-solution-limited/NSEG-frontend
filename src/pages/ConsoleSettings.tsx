import React, { useState } from 'react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { useOfficerProfile, type OfficerRole } from '../lib/officerProfile';
import { initialsOf } from '../lib/initials';
import { useAuditLog } from '../lib/auditLog';

const roleLabels: Record<OfficerRole, string> = {
  'desk-officer': 'Desk Officer',
  administrator: 'NATEP/NEPC Administrator',
  'adspa-auditor': 'ADSPA Security & Compliance Auditor'
};

interface NotificationPreference {
  id: string;
  label: string;
  detail: string;
  enabled: boolean;
}

const defaultPreferences: NotificationPreference[] = [
{ id: 'signals', label: 'New signals need qualification', detail: 'Ping when a new buyer signal enters the queue', enabled: true },
{ id: 'shortlists', label: 'Shortlist ready for review', detail: 'Ping when a matched opportunity is ready to approve', enabled: true },
{ id: 'readiness', label: 'Readiness submission received', detail: 'Ping when an exporter submits a self-assessment', enabled: true },
{ id: 'compliance', label: 'Compliance requirement due', detail: 'Ping when a regulatory requirement needs review', enabled: false },
{ id: 'digest', label: 'Weekly digest email', detail: 'A Monday-morning summary across every section', enabled: false }];


function ToggleSwitch({ enabled, onToggle, label }: {enabled: boolean;onToggle: () => void;label: string;}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onToggle}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ease-out ${
      enabled ? 'bg-gray-900' : 'bg-gray-200'}`
      }>

      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ease-out ${
        enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`
        } />

    </button>);

}

export function ConsoleSettings() {
  const { profile, setName, setRole } = useOfficerProfile();
  const { entries, logEvent } = useAuditLog();
  const [draftName, setDraftName] = useState(profile.name);
  const [preferences, setPreferences] = useState<NotificationPreference[]>(defaultPreferences);

  const togglePreference = (id: string) => {
    setPreferences((current) =>
    current.map((preference) =>
    preference.id === id ? { ...preference, enabled: !preference.enabled } : preference
    )
    );
    const preference = preferences.find((item) => item.id === id);
    if (preference) {
      logEvent(
        `Turned ${preference.enabled ? 'off' : 'on'} notifications for "${preference.label}"`,
        'settings',
        profile.name
      );
    }
  };

  return (
    <ConsoleLayout breadcrumb="Settings">
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">Settings</h1>
        <p className="mt-1 text-[13.5px] text-gray-500">
          Your own profile and notification preferences — not organization or role administration.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
          <h2 className="text-[16px] font-semibold text-gray-900">Profile</h2>
          <p className="text-[12.5px] text-gray-400">Visible in the Console header across every section.</p>

          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-[14px] font-semibold text-white">
              {initialsOf(draftName || profile.name)}
            </span>
            <div>
              <p className="text-[14px] font-semibold text-gray-900">{draftName || profile.name}</p>
              <p className="font-mono text-[11px] text-gray-400">OFC-2024-0182</p>
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              const trimmed = draftName.trim();
              if (trimmed) {
                setName(trimmed);
                logEvent(`Updated display name to "${trimmed}"`, 'settings', profile.name);
              }
            }}
            className="mt-5 space-y-4">

            <div>
              <label htmlFor="display-name" className="block text-[12.5px] font-medium text-gray-600">
                Display name
              </label>
              <input
                id="display-name"
                type="text"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13.5px] text-gray-900 focus:border-gray-400 focus:outline-none" />

            </div>

            <div>
              <label className="block text-[12.5px] font-medium text-gray-600">Job title</label>
              <p className="mt-1.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-[13.5px] text-gray-500">
                {profile.title} · not editable here
              </p>
            </div>

            <div>
              <label htmlFor="sign-off-clearance" className="block text-[12.5px] font-medium text-gray-600">
                Platform role
              </label>
              <select
                id="sign-off-clearance"
                value={profile.role}
                onChange={(event) => {
                  const nextRole = event.target.value as OfficerRole;
                  setRole(nextRole);
                  logEvent(`Switched platform role to "${roleLabels[nextRole]}"`, 'settings', profile.name);
                }}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[13.5px] text-gray-900 focus:border-gray-400 focus:outline-none">

                <option value="desk-officer">{roleLabels['desk-officer']}</option>
                <option value="administrator">{roleLabels.administrator}</option>
                <option value="adspa-auditor">{roleLabels['adspa-auditor']}</option>
              </select>
              <p className="mt-1.5 text-[11px] text-gray-400">
                Demo control only — a real deployment assigns this via IAM, not a self-service dropdown.
                Administrator gates high-value incentive sign-off; ADSPA Auditor puts the entire Console into
                read-only audit mode (BRD ROLE_ADSPA_OFFICER — inspect everything, modify nothing).
              </p>
            </div>

            <button
              type="submit"
              disabled={!draftName.trim() || draftName.trim() === profile.name}
              className="rounded-full bg-gray-900 px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black disabled:cursor-not-allowed disabled:opacity-40">

              Save name
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
          <h2 className="text-[16px] font-semibold text-gray-900">Notification preferences</h2>
          <p className="text-[12.5px] text-gray-400">Choose what you're pinged about — no email delivery is wired up yet.</p>

          <ul className="mt-4 space-y-3">
            {preferences.map((preference) =>
            <li key={preference.id} className="flex items-center justify-between gap-4">
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-medium text-gray-900">{preference.label}</span>
                  <span className="block text-[12px] text-gray-400">{preference.detail}</span>
                </span>
                <ToggleSwitch
                enabled={preference.enabled}
                onToggle={() => togglePreference(preference.id)}
                label={preference.label} />

              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
        <h2 className="text-[16px] font-semibold text-gray-900">Your recent activity</h2>
        <ul className="mt-4 space-y-3">
          {entries.slice(0, 8).map((entry) =>
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
    </ConsoleLayout>);

}
