import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { WorkspaceLayout } from '../components/workspace/WorkspaceLayout';
import { Callout, Panel, Stat, StatGrid, Tag, Timeline, onDarkLinkClass, primaryLinkClass } from '../components/workspace/WorkspaceUI';
import { useExporterSession } from '../lib/exporterSession';
import { useGatewayExchange } from '../lib/gatewayExchange';
import { useAccounts } from '../lib/accounts';
import { exporterStanding } from '../lib/exporterTier';
import { disclosuresFor, engagementsFor } from '../lib/exporterDisclosures';
import { engagementStageLabels } from '../lib/engagementStage';
import { trackLabels, trustTiers } from '../data/trustTiers';

export function ExporterOverview() {
  const { actor } = useExporterSession();
  const { introductions } = useGatewayExchange();
  const accounts = useAccounts();
  const standing = exporterStanding(actor);

  const pendingConsent = introductions.filter((item) => item.actorId === actor.id && item.response === 'pending');
  const activeDisclosures = disclosuresFor(actor, introductions).filter((row) => row.status === 'active');
  const contracts = engagementsFor(actor);
  const verified = actor.verifiedEvidence.length;
  const awaiting = actor.pendingEvidence?.length ?? 0;
  const credentialLapsing = actor.credentialExpiresInDays !== undefined && actor.credentialExpiresInDays <= 30;
  const isNew = accounts.isNewAccount(actor.id);

  return (
    <WorkspaceLayout
      section="Overview"
      title={actor.contactName ? `Welcome back, ${actor.contactName.split(' ')[0]}` : 'Welcome back'}
      intro={`${actor.name} · ${trackLabels[actor.track]} · ${standing.tier.badge}`}
      actions={
      <Link to="/workspace/profile" className={primaryLinkClass}>
          Open my profile
        </Link>
      }>

      <div className="space-y-4">
        {pendingConsent.length > 0 &&
        <Callout
          tone="gold"
          title={`${pendingConsent.length} ${pendingConsent.length === 1 ? 'buyer wants' : 'buyers want'} to see your details`}
          action={{ label: 'Review requests', to: '/workspace/consent' }}>

            Nothing has been shared. You choose whether to release your details, to whom, and you can withdraw at any time.
          </Callout>
        }
        {credentialLapsing &&
        <Callout
          tone="clay"
          title={`Your sector credential lapses in ${actor.credentialExpiresInDays} days`}
          action={{ label: 'Renew evidence', to: '/workspace/profile/evidence' }}>

            Once it lapses you are excluded from new matching until it is renewed. This protects buyers from stale claims.
          </Callout>
        }
        {isNew &&
        <Callout tone="green" title="Finish setting up" action={{ label: 'See the steps', to: '/workspace/profile/tier' }}>
            You can explore everything now. Verification only matters when you're ready to bid.
          </Callout>
        }
      </div>

      <div className={pendingConsent.length || credentialLapsing || isNew ? 'mt-6' : ''}>
        <StatGrid>
          <Stat label="Trust tier" value={`${trustTiers.indexOf(standing.tier) + 1} of ${trustTiers.length}`} detail={standing.tier.badge} />
          <Stat label="Evidence items" value={verified} detail={awaiting ? `${awaiting} awaiting a registry check` : 'Verified by a registry or officer'} />
          <Stat label="Consent requests" value={pendingConsent.length} detail={pendingConsent.length ? 'Awaiting your decision' : 'None outstanding'} />
          <Stat label="Active disclosures" value={activeDisclosures.length} detail="Currently visible to a buyer" />
        </StatGrid>
      </div>

      <section className="mt-6 rounded-2xl bg-gray-900 p-5 text-white sm:p-6" aria-labelledby="next-step">
        <h2 id="next-step" className="text-[12px] font-medium uppercase tracking-[0.08em] text-gray-300">
          {standing.next ? 'Your next step' : 'Holding your tier'}
        </h2>
        <p className="mt-1.5 max-w-2xl text-[15px] leading-snug">{standing.nextAction}</p>
        {standing.next &&
        <Link to={standing.missingEvidence.length ? '/workspace/profile/evidence' : '/workspace/profile/tier'} className={`mt-3 ${onDarkLinkClass}`}>
            {standing.missingEvidence.length ? 'Check my evidence' : 'See my standing'}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          title="Contract offers"
          aside={contracts.length > 0 ? <Tag tone="gold">{contracts.length} open</Tag> : undefined}>

          {contracts.length === 0 ?
          <p className="text-[13.5px] text-gray-600">
              No offers yet. Offers appear here after a buyer reviews your consented introduction.
            </p> :

          <ul className="divide-y divide-gray-100">
              {contracts.slice(0, 4).map(({ engagement, opportunity, buyer }) =>
            <li key={engagement.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900">{opportunity.title}</p>
                    <p className="text-[12.5px] text-gray-600">{buyer?.name ?? 'Buyer'} · {engagementStageLabels[engagement.stage]}</p>
                  </div>
                  <Link to="/workspace/contracts" className="inline-flex min-h-[40px] items-center rounded-full px-3 text-[13px] font-semibold text-gray-900 hover:bg-gray-100">
                    Review
                  </Link>
                </li>
            )}
            </ul>
          }
        </Panel>

        <Panel title="Your privacy on this platform" intro="Your profile is private by default. These are the only ways your details ever leave it.">
          <Timeline
            steps={[
            { title: 'You are matched anonymously', detail: 'Buyers see why you match, never your identity', state: 'done' },
            { title: 'An officer shortlists you', detail: 'A named person decides, with a reason you can request', state: 'done' },
            {
              title: 'You are asked for consent',
              detail: 'Naming the buyer and what they would see',
              state: pendingConsent.length ? 'now' : activeDisclosures.length ? 'done' : 'later'
            },
            { title: 'You choose to share or decline', detail: 'Declining creates no disclosure at all', state: activeDisclosures.length ? 'done' : 'later' },
            { title: 'You can withdraw at any time', detail: 'Access stops immediately; the record is kept', state: 'later' }]
            } />

        </Panel>
      </div>
    </WorkspaceLayout>);

}
