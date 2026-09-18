import React from 'react';
import { BookOpenIcon, EyeIcon, FileCheck2Icon, LayoutGridIcon, LockIcon, OctagonAlertIcon, UserRoundIcon } from 'lucide-react';
import { trackLabels, trustTiers } from '../../data/trustTiers';
import { sectorLabel } from '../../lib/marketplaceLookups';
import { useExporterSession } from '../../lib/exporterSession';
import { useGatewayExchange } from '../../lib/gatewayExchange';
import { TierBadge } from './TierBadge';
import { WorkspaceShell, type WorkspaceNavItem, type WorkspaceTab } from './WorkspaceShell';


interface WorkspaceLayoutProps {
  title: string;
  intro: string;
  /** Short label for the header bar when it differs from the page title (e.g. a greeting). */
  section?: string;
  actions?: React.ReactNode;
  tabs?: WorkspaceTab[];
  children: React.ReactNode;
}

/** Sub-pages of the exporter's capability profile. */
export const profileTabs: WorkspaceTab[] = [
{ to: '/workspace/profile', label: 'Profile', end: true },
{ to: '/workspace/profile/evidence', label: 'Evidence and readiness' },
{ to: '/workspace/profile/tier', label: 'Tier and standing' }];


/** Sub-pages of the requirements register for exporters. */
export const exporterRegisterTabs: WorkspaceTab[] = [
{ to: '/workspace/requirements', label: 'Register', end: true },
{ to: '/workspace/requirements/pathway', label: 'My export pathway' }];


export function WorkspaceLayout({ title, intro, section, actions, tabs, children }: WorkspaceLayoutProps) {
  const { actor, signOut } = useExporterSession();
  const tier = trustTiers.find((item) => item.id === actor.tier)!;
  const { introductions } = useGatewayExchange();
  const pendingIntroductions = introductions.filter(
    (item) => item.actorId === actor.id && item.response === 'pending'
  ).length;

  const navItems: WorkspaceNavItem[] = [
  { to: '/workspace', label: 'Overview', icon: LayoutGridIcon, end: true, group: 'My organisation' },
  { to: '/workspace/profile', label: 'Capability profile', icon: UserRoundIcon, group: 'My organisation' },
  { to: '/workspace/consent', label: 'Consent requests', icon: LockIcon, count: pendingIntroductions, group: 'Opportunities' },
  { to: '/workspace/contracts', label: 'Contract offers', icon: FileCheck2Icon, group: 'Opportunities' },
  { to: '/workspace/shared', label: 'What I have shared', icon: EyeIcon, group: 'Opportunities' },
  { to: '/workspace/requirements', label: 'Requirements register', icon: BookOpenIcon, group: 'Reference' }];


  return (
    <WorkspaceShell
      audience="Exporter workspace"
      variant="exporter"
      homeHref="/workspace"
      navItems={navItems}
      signInHref="/workspace/sign-in"
      onSignOut={signOut}
      identity={{
        name: actor.contactName ?? actor.name,
        detail:
        <>
            {actor.contactName ? <>{actor.name} · </> : null}
            <span className="font-mono">{actor.natepId}</span> · {trackLabels[actor.track]}
          </>,

        badge: <TierBadge tier={tier} />,
        role: actor.contactName ? actor.name : trackLabels[actor.track],
        facts: [
        { label: 'Organisation', value: actor.name },
        { label: 'NATEP ID', value: <span className="font-mono">{actor.natepId}</span> },
        { label: 'Exporting as', value: trackLabels[actor.track] },
        { label: 'Main service', value: sectorLabel(actor.sectorCode) },
        { label: 'Registered', value: actor.registeredOn },
        { label: 'Email', value: actor.email }]

      }}
      section={section}
      profileHref="/workspace/profile"
      banner={
      actor.suspended &&
      <div role="status" className="mt-4 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <OctagonAlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" aria-hidden="true" />
            <p className="text-[13px] leading-relaxed text-rose-800">
              Your account is suspended, so bidding and match alerts are paused. You can still prepare privately
              here. Your desk officer will tell you what is needed to reinstate it.
            </p>
          </div>

      }
      title={title}
      intro={intro}
      actions={actions}
      tabs={tabs}>

      {children}
    </WorkspaceShell>);

}
