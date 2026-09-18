import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, RadarIcon } from 'lucide-react';
import type { ChangeImpact, ReviewTask } from '../../lib/regulatoryRegister';
import { AuditOnlyBadge } from './AuditOnlyBadge';

interface ChangeImpactPanelProps {
  impacts: ChangeImpact[];
  tasks: ReviewTask[];
  canMutate: boolean;
  onCloseTask: (task: ReviewTask) => void;
}

/** REG-05: every publication's reach, and the review tasks it raised. */
export function ChangeImpactPanel({ impacts, tasks, canMutate, onCloseTask }: ChangeImpactPanelProps) {
  if (impacts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-[16px] font-semibold text-gray-900">
        <RadarIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
        Change impact
      </h2>
      <p className="text-[12.5px] text-gray-400">
        Worked out when each version was published. Affected exporters are notified in their workspace; dependent
        assertions are flagged for revalidation.
      </p>

      <ul className="mt-4 space-y-3">
        {impacts.map((impact) => {
          const impactTasks = tasks.filter((task) => task.impactId === impact.id);
          const open = impactTasks.filter((task) => task.status === 'open').length;
          return (
            <li key={impact.id} className="rounded-xl border border-gray-100 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-gray-900">{impact.title}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${
                  open > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`
                  }>

                  {open > 0 ? `${open} open ${open === 1 ? 'task' : 'tasks'}` : 'All tasks closed'}
                </span>
              </div>
              <p className="text-[12px] text-gray-400">
                {impact.supersededId ? `${impact.supersededId} → ${impact.requirementId}` : `New: ${impact.requirementId}`} ·{' '}
                {impact.authority} · published {impact.publishedOn}
                {impact.changedFields.length > 0 && ` · changed: ${impact.changedFields.join(', ')}`}
              </p>

              <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
                {[
                ['Exporter pathways', impact.pathwayActorIds.length],
                ['Live opportunities', impact.opportunityIds.length],
                ['Assertions flagged', impact.flaggedAssertionIds.length]].
                map(([label, value]) =>
                <div key={label} className="rounded-lg bg-gray-50 px-2 py-2">
                    <dd className="font-display text-[18px] font-semibold tabular-nums text-gray-900">{value}</dd>
                    <dt className="text-[11px] text-gray-500">{label}</dt>
                  </div>
                )}
              </dl>

              {impactTasks.length > 0 &&
              <ul className="mt-3 space-y-1.5">
                  {impactTasks.map((task) =>
                <li key={task.id} className="flex flex-wrap items-center justify-between gap-2 text-[12.5px]">
                      <span className={task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'}>{task.label}</span>
                      {task.status === 'done' ?
                  <span className="text-[11.5px] text-gray-400">
                          {task.resolution} · {task.closedBy}
                        </span> :
                  task.kind === 'revalidate-assertion' ?
                  <Link
                    to="/console/registry/readiness"
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-gray-700 hover:text-gray-900">

                          Open in Readiness
                          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link> :
                  !canMutate ?
                  <AuditOnlyBadge /> :

                  <button
                    type="button"
                    onClick={() => onCloseTask(task)}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-[12px] font-medium text-gray-600 hover:border-gray-300">

                          <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          Criteria checked
                        </button>
                  }
                    </li>
                )}
                </ul>
              }
            </li>);

        })}
      </ul>
    </div>);

}
