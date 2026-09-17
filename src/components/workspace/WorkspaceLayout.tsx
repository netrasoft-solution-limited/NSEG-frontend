import React from 'react';
import { CompassIcon, LockIcon, OctagonAlertIcon, ShieldCheckIcon } from 'lucide-react';
import { actors } from '../../data/actors';
import { trackLabels, trustTiers } from '../../data/trustTiers';
import { useExporterSession } from '../../lib/exporterSession';
import { TierBadge } from './TierBadge';
import { WorkspaceShell, type WorkspaceNavItem } from './WorkspaceShell';

const navItems: WorkspaceNavItem[] = [
{ to: '/workspace', label: 'My standing', icon: ShieldCheckIcon, end: true },
{ to: '/workspace/requirements', label: 'Requirements', icon: CompassIcon },
{ to: '/workspace/readiness', label: 'Readiness', icon: LockIcon }];


interface WorkspaceLayoutProps {
  title: string;
  intro: string;
  children: React.ReactNode;
}

export function WorkspaceLayout({ title, intro, children }: WorkspaceLayoutProps) {
  const { actor, setActorId } = useExporterSession();
  const tier = trustTiers.find((item) => item.id === actor.tier)!;

  return (
    <WorkspaceShell
      audience="Exporter workspace"
      homeHref="/workspace"
      navItems={navItems}
      switcher={{
        value: actor.id,
        onChange: setActorId,
        groups: (['firm', 'individual'] as const).map((track) => ({
          label: trackLabels[track],
          options: actors.filter((item) => item.track === track).map((item) => ({ value: item.id, label: item.name }))
        }))
      }}
      identity={{
        name: actor.name,
        detail:
        <>
            <span className="font-mono">{actor.natepId}</span> · {trackLabels[actor.track]}
          </>,

        badge: <TierBadge tier={tier} />
      }}
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
      intro={intro}>

      {children}
    </WorkspaceShell>);

}
