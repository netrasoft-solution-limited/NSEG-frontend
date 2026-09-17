import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ActivityIcon,
  BanknoteIcon,
  BellIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  CompassIcon,
  DownloadIcon,
  FileTextIcon,
  HandshakeIcon,
  HistoryIcon,
  InfoIcon,
  LayoutGridIcon,
  LogOutIcon,
  SearchIcon,
  SettingsIcon,
  ShieldCheckIcon,
  ShieldIcon,
  UsersIcon,
  WalletIcon } from
'lucide-react';
import type { IconComponent } from '../../types/icons';
import { useOfficerProfile } from '../../lib/officerProfile';
import { initialsOf } from '../../lib/initials';

interface SidebarItem {
  icon: IconComponent;
  label: string;
  href?: string;
}

const sidebarItems: SidebarItem[] = [
{ icon: LayoutGridIcon, label: 'Dashboard', href: '/console' },
{ icon: UsersIcon, label: 'Exporters', href: '/console/exporters' },
{ icon: BuildingIcon, label: 'Buyers', href: '/console/buyers' },
{ icon: BriefcaseIcon, label: 'Opportunities', href: '/console/opportunities' },
{ icon: HandshakeIcon, label: 'Engagements', href: '/console/engagements' },
{ icon: BanknoteIcon, label: 'Outcomes', href: '/console/outcomes' },
{ icon: CompassIcon, label: 'Readiness', href: '/console/readiness' },
{ icon: ActivityIcon, label: 'Observatory', href: '/console/observatory' },
{ icon: ShieldCheckIcon, label: 'Compliance', href: '/console/compliance' },
{ icon: WalletIcon, label: 'Incentives', href: '/console/incentives' },
{ icon: FileTextIcon, label: 'Vault', href: '/console/vault' },
{ icon: ShieldIcon, label: 'Consent', href: '/console/consent' },
{ icon: HistoryIcon, label: 'Audit log', href: '/console/audit' },
{ icon: SettingsIcon, label: 'Settings', href: '/console/settings' }];


interface ConsoleLayoutProps {
  breadcrumb: string;
  onExport?: () => void;
  children: React.ReactNode;
}

export function ConsoleLayout({ breadcrumb, onExport, children }: ConsoleLayoutProps) {
  const location = useLocation();
  const { profile } = useOfficerProfile();

  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
      <aside className="flex w-[72px] shrink-0 flex-col items-center gap-1 border-r border-gray-100 bg-white py-5">
        <Link
          to="/console"
          className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-gate">

          <span className="h-2.5 w-2.5 rounded-sm bg-black" />
        </Link>

        <nav className="flex flex-1 flex-col items-center gap-1 overflow-y-auto" aria-label="Console sections">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === location.pathname;

            if (!item.href) {
              return (
                <button
                  key={item.label}
                  type="button"
                  disabled
                  title={`${item.label} (coming soon)`}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 disabled:cursor-not-allowed">

                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
                </button>);

            }

            return (
              <Link
                key={item.label}
                to={item.href}
                aria-current={isActive ? 'page' : undefined}
                title={item.label}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150 ease-out ${
                isActive ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-50'}`
                }>

                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
              </Link>);

          })}
        </nav>

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            disabled
            title="About this console"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 disabled:cursor-not-allowed">

            <InfoIcon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled
            title="Sign out (demo)"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-300 disabled:cursor-not-allowed">

            <LogOutIcon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-gray-100 bg-white/80 px-6 py-3.5 backdrop-blur">
          <p className="text-[13px] text-gray-400">
            <span className="text-gray-500">Console</span> <span className="mx-1">/</span>
            <span className="font-medium text-gray-900">{breadcrumb}</span>
          </p>

          <div className="relative ml-2 hidden min-w-[220px] flex-1 max-w-sm sm:block">
            <SearchIcon
              className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              aria-hidden="true" />

            <input
              type="text"
              disabled
              placeholder="Search users, opportunities..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-[13px] text-gray-500 placeholder:text-gray-400 disabled:cursor-not-allowed" />

          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12.5px] font-medium text-gray-600">
              <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Last 30 days
            </span>
            <button
              type="button"
              onClick={onExport}
              disabled={!onExport}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12.5px] font-medium text-gray-600 transition-colors duration-150 ease-out hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600">

              <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Export
            </button>
            <button
              type="button"
              disabled
              aria-label="Notifications"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 disabled:cursor-not-allowed">

              <BellIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="ml-1 flex items-center gap-2 rounded-full border border-gray-200 py-1 pl-1 pr-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white">
                {initialsOf(profile.name)}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-[12.5px] font-semibold text-gray-900">{profile.name}</span>
                <span className="block text-[11px] text-gray-400">{profile.title}</span>
              </span>
            </span>
          </div>
        </header>

        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>);

}
