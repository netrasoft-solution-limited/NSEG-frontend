import React, { useState } from 'react';
import { AlertTriangleIcon, CalendarClockIcon, CheckCircleIcon, FilePenLineIcon, PlusIcon, StampIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { ComplianceRegister, type ComplianceFilterState } from '../components/console/ComplianceRegister';
import { AuthoringPipeline } from '../components/console/AuthoringPipeline';
import { ChangeImpactPanel } from '../components/console/ChangeImpactPanel';
import { RequirementDraftEditor, blankContent } from '../components/console/RequirementDraftEditor';
import { signOffAgency } from '../data/regulations';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { canMutate } from '../lib/permissions';
import { canDraft, useRegulatoryRegister, type RequirementContent } from '../lib/regulatoryRegister';

const emptyFilters: ComplianceFilterState = { search: '', category: 'all', status: 'all' };

interface EditorState {
  draftId?: string;
  supersedesId?: string;
  heading: string;
  context?: string;
  content: RequirementContent;
}

const today = () => new Date().toISOString().slice(0, 10);

export function ConsoleCompliance() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const register = useRegulatoryRegister();
  const mutable = canMutate(profile.role);
  const [filters, setFilters] = useState<ComplianceFilterState>(emptyFilters);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [notice, setNotice] = useState('');

  const { requirements, drafts } = register;
  const query = filters.search.trim().toLowerCase();
  const filtered = requirements.filter((requirement) => {
    const matchesSearch =
    !query ||
    requirement.title.toLowerCase().includes(query) ||
    requirement.authority.toLowerCase().includes(query);
    const matchesCategory = filters.category === 'all' || requirement.category === filters.category;
    const matchesStatus = filters.status === 'all' || requirement.status === filters.status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openDrafts = drafts.filter((draft) => draft.stage !== 'published');
  const revisionsInProgress = new Set(openDrafts.flatMap((draft) => draft.supersedesId ? [draft.supersedesId] : []));
  const currentCount = requirements.filter((item) => item.status === 'current').length;
  const awaitingSignOff = drafts.filter((draft) => draft.stage === 'in-sign-off').length;
  const reviewDueCount = requirements.filter((item) => item.reviewDue && item.status !== 'superseded').length;

  const calendar = requirements.
  filter((item) => item.status !== 'superseded' && /^\d{4}-/.test(item.nextReviewOn)).
  sort((a, b) => a.nextReviewOn.localeCompare(b.nextReviewOn)).
  slice(0, 6);

  const handleExport = () => {
    downloadCsv(
      'nseg-regulatory-register.csv',
      requirements.map((requirement) => ({
        id: requirement.id,
        title: requirement.title,
        category: requirement.category,
        authority: requirement.authority,
        version: requirement.version,
        status: requirement.status,
        signedOffBy: requirement.signedOffBy.join('; '),
        signedOffOn: requirement.signedOffOn,
        effectiveOn: requirement.effectiveOn,
        nextReviewOn: requirement.nextReviewOn
      }))
    );
    logEvent(`Exported the regulatory register (${requirements.length} rows)`, 'compliance', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Compliance" onExport={handleExport}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">Compliance</h1>
          <p className="mt-1.5 text-[14.5px] text-gray-600">
            The regulatory requirements register. Drafters write, competent authorities sign off, and only signed-off
            content reaches the exporter wizard.
          </p>
        </div>
        {mutable && canDraft(profile.role) && !editor &&
        <button
          type="button"
          onClick={() => setEditor({ heading: 'New requirement', content: blankContent })}
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-black">

            <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
            New requirement
          </button>
        }
      </div>

      {!canDraft(profile.role) && profile.role !== 'authority-focal' &&
      <p className="mt-4 rounded-xl bg-sky-50 px-4 py-2.5 text-[12.5px] text-sky-800">
          You're viewing as {profile.role === 'adspa-auditor' ? 'an auditor' : 'a desk officer'}. Switch to Content Drafter or
          Competent Authority Focal in Settings to write or sign off requirements.
        </p>
      }
      {profile.role === 'authority-focal' &&
      <p className="mt-4 rounded-xl bg-sky-50 px-4 py-2.5 text-[12.5px] text-sky-800">
          You sign off for {profile.authority}. Change this in Settings.
        </p>
      }

      <p role="status" className={notice ? 'mt-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-[12.5px] text-emerald-800' : 'sr-only'}>
        {notice}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CheckCircleIcon}
          label="Published and current"
          value={currentCount.toString()}
          delta="In the wizard"
          positive
          accent="gate" />

        <StatCard
          icon={StampIcon}
          label="Awaiting sign-off"
          value={awaitingSignOff.toString()}
          delta="At authorities"
          positive
          accent="gold" />

        <StatCard
          icon={FilePenLineIcon}
          label="Drafts and returns"
          value={openDrafts.filter((draft) => draft.stage !== 'in-sign-off').length.toString()}
          delta="With drafters"
          positive
          accent="sky" />

        <StatCard
          icon={AlertTriangleIcon}
          label="Review due"
          value={reviewDueCount.toString()}
          delta="Needs attention"
          positive={false}
          accent="rose" />

      </div>

      {editor &&
      <div className="mt-6">
          <RequirementDraftEditor
          key={editor.draftId ?? editor.supersedesId ?? 'new'}
          heading={editor.heading}
          context={editor.context}
          initial={editor.content}
          onCancel={() => setEditor(null)}
          onSave={(content, submit) => {
            const id = register.saveDraft(
              { id: editor.draftId, supersedesId: editor.supersedesId, content },
              profile.name
            );
            if (submit) register.submitForSignOff(id);
            logEvent(
              `${submit ? 'Sent for sign-off' : 'Saved a draft of'} "${content.title}"${editor.supersedesId ? ` (revision of ${editor.supersedesId})` : ''}`,
              'compliance',
              profile.name
            );
            setNotice(
              submit ?
              `"${content.title}" is with ${signOffAgency(content.authority)} for sign-off. It won't reach exporters until then.` :
              `"${content.title}" saved as a draft.`
            );
            setEditor(null);
          }} />

        </div>
      }

      {register.impacts.length > 0 &&
      <div className="mt-6">
          <ChangeImpactPanel
          impacts={register.impacts}
          tasks={register.tasks}
          canMutate={mutable}
          onCloseTask={(task) => {
            register.closeTask(task.id, profile.name, 'Criteria checked');
            logEvent(`Closed review task: ${task.label}`, 'compliance', profile.name);
          }} />

        </div>
      }

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <AuthoringPipeline
          drafts={drafts}
          requirements={requirements}
          profile={profile}
          canMutate={mutable}
          onEdit={(draft) =>
          setEditor({
            draftId: draft.id,
            supersedesId: draft.supersedesId,
            heading: 'Edit draft',
            context: 'Saving changes clears any sign-offs already given.',
            content: draft.content
          })
          }
          onSubmit={(draft) => {
            register.submitForSignOff(draft.id);
            logEvent(`Sent for sign-off "${draft.content.title}"`, 'compliance', profile.name);
            setNotice(`"${draft.content.title}" is with ${signOffAgency(draft.content.authority)} for sign-off.`);
          }}
          onSignOff={(draft) => {
            const publishedId = register.signOff(draft.id, profile.name);
            logEvent(
              publishedId ?
              `Signed off and published "${draft.content.title}" as ${publishedId}` :
              `Signed off "${draft.content.title}" — awaiting a second officer`,
              'compliance',
              profile.name
            );
            setNotice(
              publishedId ?
              `Published as ${publishedId}.${draft.supersedesId ? ` ${draft.supersedesId} is kept as superseded.` : ''} Exporters see it in the wizard now — see Change impact for what it touched.` :
              `Your sign-off is recorded. A second ${signOffAgency(draft.content.authority)} officer must sign before it publishes.`
            );
          }}
          onReturn={(draft, note) => {
            register.returnDraft(draft.id, profile.name, note);
            logEvent(`Returned "${draft.content.title}" to the drafter: ${note}`, 'compliance', profile.name);
            setNotice(`"${draft.content.title}" returned to ${draft.draftedBy}.`);
          }} />


        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-[16px] font-semibold text-gray-900">
            <CalendarClockIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
            Review calendar
          </h2>
          <p className="text-[12.5px] text-gray-400">Next scheduled reviews across all authorities.</p>
          <ul className="mt-3 space-y-2.5">
            {calendar.map((item) => {
              const overdue = item.nextReviewOn < today();
              return (
                <li key={item.id} className="text-[12.5px]">
                  <p className={`font-mono text-[11px] ${overdue ? 'text-rose-600' : 'text-gray-400'}`}>
                    {item.nextReviewOn}
                    {overdue && ' · overdue'}
                  </p>
                  <p className="text-gray-800">{item.title}</p>
                  <p className="text-[11.5px] text-gray-400">{signOffAgency(item.authority)}</p>
                </li>);

            })}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <ComplianceRegister
          requirements={filtered}
          total={requirements.length}
          filters={filters}
          onFilterChange={setFilters}
          profile={profile}
          revisionsInProgress={revisionsInProgress}
          canMutate={mutable}
          onFlag={(requirement) => {
            register.flagForReview(requirement.id);
            logEvent(`Flagged "${requirement.title}" for review`, 'compliance', profile.name);
          }}
          onConfirm={(requirement) => {
            register.confirmCurrent(requirement.id, profile.name);
            logEvent(`Confirmed "${requirement.title}" is unchanged, for ${profile.authority}`, 'compliance', profile.name);
          }}
          onRevise={(requirement) => {
            const { id, status, lastReviewedOn, reviewDue, version, signedOffBy, signedOffOn, ...content } = requirement;
            setEditor({
              supersedesId: id,
              heading: `Revise: ${requirement.title}`,
              context: `Revising ${id} · version ${version}. The current version stays live until the revision is signed off.`,
              content
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />

      </div>
    </ConsoleLayout>);

}
