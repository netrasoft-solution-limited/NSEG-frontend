import React from 'react';
import { ClipboardListIcon, HandshakeIcon, LayoutGridIcon, UsersRoundIcon } from 'lucide-react';
import { buyerTiers } from '../../data/buyerTiers';
import { useBuyerSession } from '../../lib/buyerSession';
import { BuyerTierBadge } from './TierBadge';
import { WorkspaceShell, type WorkspaceNavItem } from './WorkspaceShell';

const navItems: WorkspaceNavItem[] = [
{ to: '/buyer', label: 'Overview', icon: LayoutGridIcon, end: true },
{ to: '/buyer/requests', label: 'Requests', icon: ClipboardListIcon },
{ to: '/buyer/shortlists', label: 'Shortlists', icon: UsersRoundIcon },
{ to: '/buyer/engagements', label: 'Engagements', icon: HandshakeIcon }];


interface BuyerLayoutProps {
  title: string;
  intro: string;
  children: React.ReactNode;
}

export function BuyerLayout({ title, intro, children }: BuyerLayoutProps) {
  const { buyer, signOut } = useBuyerSession();
  const tier = buyerTiers.find((item) => item.id === buyer.tier)!;

  return (
    <WorkspaceShell
      audience="Buyer workspace"
      homeHref="/buyer"
      navItems={navItems}
      signInHref="/buyer/sign-in"
      onSignOut={signOut}
      identity={{
        name: buyer.name,
        detail:
        <>
            <span className="font-mono">{buyer.referenceId}</span> · {buyer.region}
          </>,

        badge: <BuyerTierBadge tier={tier} />
      }}
      title={title}
      intro={intro}>

      {children}
    </WorkspaceShell>);

}
