import React from 'react';
import { ShieldOffIcon } from 'lucide-react';
import { WorkspaceLayout } from '../components/workspace/WorkspaceLayout';
import { DataTable, EmptyState, Tag } from '../components/workspace/WorkspaceUI';
import { Spinner } from '../components/common/Spinner';
import { useExporterSession } from '../lib/exporterSession';
import { useGatewayExchange } from '../lib/gatewayExchange';
import { useAuditLog } from '../lib/auditLog';
import { usePendingAction } from '../lib/usePendingAction';
import { disclosuresFor } from '../lib/exporterDisclosures';

export function ExporterShared() {
  const { actor } = useExporterSession();
  const { introductions, respondToIntroduction } = useGatewayExchange();
  const { logEvent } = useAuditLog();
  const { run, pending, isPending } = usePendingAction();
  const rows = disclosuresFor(actor, introductions);

  return (
    <WorkspaceLayout
      title="What I have shared"
      intro="A complete record of every disclosure made from your profile. Withdrawing blocks all future access and keeps the history.">

      {rows.length === 0 ?
      <EmptyState title="Nothing shared yet">
          Every package of your details released to a buyer is listed here, with what it contained and whether it is still
          open.
        </EmptyState> :

      <DataTable label="Disclosures from your profile" head={['Recipient', 'Fields released', 'Issued', 'Status', '']}>
          {rows.map((row) =>
        <tr key={row.id} className="align-top">
              <td className="px-4 py-3.5">
                <p className="text-[14px] font-semibold text-gray-900">{row.recipient}</p>
                <p className="mt-0.5 font-mono text-[11.5px] text-gray-500">{row.id.toUpperCase()}</p>
              </td>
              <td className="px-4 py-3.5 text-[13px] text-gray-700">{row.fields.join(', ')}</td>
              <td className="px-4 py-3.5 text-[13px] text-gray-700">{row.issued}</td>
              <td className="px-4 py-3.5">
                <Tag tone={row.status === 'active' ? 'ok' : row.status === 'withdrawn' ? 'clay' : 'neutral'}>
                  {row.status === 'active' ? 'Active' : row.status === 'withdrawn' ? 'Withdrawn' : 'Expired'}
                </Tag>
              </td>
              <td className="px-4 py-3.5 text-right">
                {row.introduction && row.status === 'active' &&
            <button
              type="button"
              disabled={Boolean(pending)}
              aria-busy={isPending(row.id) || undefined}
              onClick={() =>
              run(row.id, () => {
                respondToIntroduction(row.id, 'withdrawn');
                logEvent(`${actor.name} withdrew consent from ${row.recipient}`, 'consent', actor.name);
              })
              }
              className="inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-full border border-gray-300 px-3.5 text-[13px] font-medium text-gray-800 hover:border-rose-400 hover:text-rose-800 disabled:cursor-progress">

                    {isPending(row.id) ? <Spinner /> : <ShieldOffIcon className="h-4 w-4" aria-hidden="true" />}
                    {isPending(row.id) ? 'Withdrawing…' : 'Withdraw'}
                    <span className="sr-only"> consent from {row.recipient}</span>
                  </button>
            }
              </td>
            </tr>
        )}
        </DataTable>
      }
    </WorkspaceLayout>);

}
