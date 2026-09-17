import React from 'react';
import { BookOpenIcon, CircleCheckIcon, CirclePlusIcon, FileTextIcon, LayoutGridIcon, UserRoundIcon } from 'lucide-react';
import { buyerTiers } from '../../data/buyerTiers';
import { useBuyerSession } from '../../lib/buyerSession';
import { useGatewayExchange } from '../../lib/gatewayExchange';
import { buyerEngagements, buyerOpportunities, buyerShortlist, engagedCandidateId } from '../../lib/buyerWorkspace';
import { BuyerTierBadge } from './TierBadge';
import { WorkspaceShell, type WorkspaceNavItem, type WorkspaceTab } from './WorkspaceShell';

interface BuyerLayoutProps {
  title: string;
  intro: string;
  /** Short label for the header bar when it differs from the page title (e.g. a greeting). */
  section?: string;
  actions?: React.ReactNode;
  tabs?: WorkspaceTab[];
  children: React.ReactNode;
}

export function BuyerLayout({ title, intro, section, actions, tabs, children }: BuyerLayoutProps) {
  const { buyer, state, signOut } = useBuyerSession();
  const exchange = useGatewayExchange();
  const tier = buyerTiers.find((item) => item.id === buyer.tier)!;

  const requests = buyerOpportunities(buyer);
  const submitted = exchange.requests.filter((request) => request.buyerId === buyer.id);
  const shortlistsToReview = requests.filter(
    (opportunity) => buyerShortlist(opportunity) && !state.selections[opportunity.id] && !engagedCandidateId(opportunity)
  ).length;
  const unconfirmed = buyerEngagements(buyer).filter(
    (engagement) =>
    engagement.stage === 'commenced' &&
    !exchange.deliveryConfirmations.some((item) => item.engagementId === engagement.id)
  ).length;

  const navItems: WorkspaceNavItem[] = [
  { to: '/buyer', label: 'Overview', icon: LayoutGridIcon, end: true, group: 'Demand' },
  { to: '/buyer/requests/new', label: 'Place a requirement', icon: CirclePlusIcon, group: 'Demand' },
  {
    to: '/buyer/requests',
    label: 'My requirements',
    icon: FileTextIcon,
    end: true,
    count: requests.length + submitted.length + state.drafts.length,
    group: 'Demand'
  },
  { to: '/buyer/introductions', label: 'Introductions', icon: UserRoundIcon, count: shortlistsToReview, group: 'Responses' },
  { to: '/buyer/contracts', label: 'Contracts', icon: CircleCheckIcon, count: unconfirmed, group: 'Responses' },
  { to: '/buyer/requirements', label: 'Requirements register', icon: BookOpenIcon, group: 'Reference' }];


  return (
    <WorkspaceShell
      audience="Buyer workspace"
      variant="buyer"
      homeHref="/buyer"
      navItems={navItems}
      signInHref="/buyer/sign-in"
      onSignOut={signOut}
      identity={{
        name: buyer.contactName ?? buyer.name,
        detail:
        <>
            {buyer.contactName ? <>{buyer.name} · </> : null}
            <span className="font-mono">{buyer.referenceId}</span> · {buyer.region}
          </>,

        badge: <BuyerTierBadge tier={tier} />,
        role: buyer.contactName ? buyer.name : buyer.region,
        facts: [
        { label: 'Company', value: buyer.name },
        { label: 'Buyer reference', value: <span className="font-mono">{buyer.referenceId}</span> },
        { label: 'Region', value: buyer.region },
        ...(buyer.country ? [{ label: 'Country', value: buyer.country }] : []),
        ...(buyer.jobTitle ? [{ label: 'Role', value: buyer.jobTitle }] : []),
        { label: 'Registered', value: buyer.registeredOn },
        { label: 'Email', value: buyer.email }]

      }}
      section={section}
      title={title}
      intro={intro}
      actions={actions}
      tabs={tabs}>

      {children}
    </WorkspaceShell>);

}
