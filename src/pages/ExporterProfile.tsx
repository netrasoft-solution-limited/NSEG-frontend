import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, LockIcon } from 'lucide-react';
import { WorkspaceLayout, profileTabs } from '../components/workspace/WorkspaceLayout';
import { KeyValue, Panel, Tag } from '../components/workspace/WorkspaceUI';
import { useExporterSession } from '../lib/exporterSession';
import { exporterStanding } from '../lib/exporterTier';
import { readinessTierFor } from '../lib/readinessScore';
import { modeLabel, sectorLabel } from '../lib/marketplaceLookups';
import { evidenceLabels, trackLabels, trustTiers, type EvidenceKey } from '../data/trustTiers';
import { targetMarkets } from '../data/regulations';
import { documentKindLabels, vaultDocuments } from '../data/vaultDocuments';

export function ExporterProfile() {
  const { actor } = useExporterSession();
  const standing = exporterStanding(actor);
  const band = readinessTierFor(standing.score);
  const capability = actor.capability;
  const documents = vaultDocuments.filter((doc) => doc.actorId === actor.id);
  const evidenceKeys = trustTiers[trustTiers.length - 1].evidence[actor.track] as EvidenceKey[];

  const evidenceState = (key: EvidenceKey) =>
  actor.verifiedEvidence.includes(key) ?
  <Tag tone="ok">Registry verified</Tag> :
  actor.pendingEvidence?.includes(key) ?
  <Tag tone="gold">Awaiting check</Tag> :

  <Tag>Self-declared or missing</Tag>;


  return (
    <WorkspaceLayout
      title="Capability profile"
      intro="Private by default. Nothing here reaches a buyer without your explicit consent."
      tabs={profileTabs}>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Panel title="Organisation">
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <KeyValue label="Registered name">{actor.name}</KeyValue>
              <KeyValue label="Exporting as">{trackLabels[actor.track]}</KeyValue>
              <KeyValue label="NATEP ID">
                <span className="font-mono">{actor.natepId}</span>
              </KeyValue>
              <KeyValue label="Registered">{actor.registeredOn}</KeyValue>
              <KeyValue label="Main service">{sectorLabel(actor.sectorCode)}</KeyValue>
              <KeyValue label="Team size">{capability?.teamSize ?? 'Not added yet'}</KeyValue>
              <KeyValue label="How you deliver">
                {capability?.modes.length ? capability.modes.map(modeLabel).join(', ') : 'Not added yet'}
              </KeyValue>
              <KeyValue label="Markets served">
                {capability?.markets.length ?
                capability.markets.map((id) => targetMarkets.find((market) => market.id === id)?.label ?? id).join(', ') :
                'Not added yet'}
              </KeyValue>
            </dl>
            {capability?.description &&
            <p className="mt-4 border-t border-gray-100 pt-4 text-[13.5px] leading-relaxed text-gray-700">{capability.description}</p>
            }
          </Panel>

          <Panel
            title="Readiness"
            aside={<Tag tone={standing.score >= 80 ? 'ok' : standing.score >= 50 ? 'green' : 'gold'}>{band.label}</Tag>}>

            <p className="flex items-baseline gap-2">
              <span className="font-display text-[40px] font-semibold leading-none tracking-[-0.03em] text-gray-900 tabular-nums">
                {standing.score}
              </span>
              <span className="text-[13.5px] text-gray-600">out of 100 on the readiness diagnostic</span>
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-gray-600">
              A score alone never moves your tier — it needs verified evidence too.
            </p>
            <Link
              to="/workspace/profile/evidence#diagnostic"
              className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-[13.5px] font-semibold text-gray-900 underline-offset-4 hover:underline">

              Update the diagnostic
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Evidence" intro="Each item carries the class of proof behind it. Buyers see the class, not just the claim.">
            <ul className="divide-y divide-gray-100">
              {evidenceKeys.map((key) =>
              <li key={key} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span className="text-[14px] font-medium text-gray-900">{evidenceLabels[key]}</span>
                  {evidenceState(key)}
                </li>
              )}
              {documents.map((doc) =>
              <li key={doc.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span>
                    <span className="block text-[14px] font-medium text-gray-900">{documentKindLabels[doc.kind]}</span>
                    <span className="block text-[12px] text-gray-500">
                      {doc.fileName}
                      {doc.expiresInDays !== undefined && ` · valid for ${doc.expiresInDays} more days`}
                    </span>
                  </span>
                  <Tag tone={doc.verification === 'verified' ? 'ok' : doc.verification === 'pending' ? 'gold' : 'clay'}>
                    {doc.verification === 'verified' ? 'Officer verified' : doc.verification === 'pending' ? 'Awaiting check' : 'Rejected'}
                  </Tag>
                </li>
              )}
            </ul>
            <Link
              to="/workspace/profile/evidence"
              className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-[13.5px] font-semibold text-gray-900 underline-offset-4 hover:underline">

              Add or renew evidence
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Panel>

          <Panel title="Who can see this">
            <p className="flex gap-2.5 text-[13.5px] leading-relaxed text-gray-700">
              <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
              Only you and the officers who verify your evidence. A buyer sees your details only after you accept their
              introduction request, and only for as long as you allow.
            </p>
            <Link
              to="/workspace/shared"
              className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-[13.5px] font-semibold text-gray-900 underline-offset-4 hover:underline">

              See what I have shared
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Panel>
        </div>
      </div>
    </WorkspaceLayout>);

}
