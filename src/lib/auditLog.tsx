import React, { createContext, useContext, useMemo, useState } from 'react';

export type AuditCategory =
'exporters' |
'buyers' |
'opportunities' |
'engagements' |
'outcomes' |
'market-intelligence' |
'readiness' |
'compliance' |
'incentives' |
'vault' |
'consent' |
'taxonomies' |
'settings';

export interface AuditLogEntry {
  id: string;
  message: string;
  category: AuditCategory;
  actorName: string;
  /** Display string rather than a timestamp — seeded entries use a fixed relative
   * label (see the `isNew` convention in data/actors.ts) so they never drift once the
   * real clock moves past whatever date this was authored on; entries logged during
   * this session use 'Just now' since that's true at the moment they're recorded. */
  when: string;
}

/** Session history before this app instance started — the same five entries the
 * dashboard used to hardcode, now folded into one real (session-scoped) log. */
const seedEntries: AuditLogEntry[] = [
{ id: 'seed-1', message: 'Qualified a signal from Rotterdam, Netherlands', category: 'opportunities', actorName: 'Ada Chukwu', when: '2 hours ago' },
{ id: 'seed-2', message: 'Approved the shortlist for "Enterprise cloud security assessment"', category: 'opportunities', actorName: 'Ada Chukwu', when: '5 hours ago' },
{ id: 'seed-3', message: 'Exported the exporter registry (12 rows)', category: 'exporters', actorName: 'Ada Chukwu', when: 'Yesterday' },
{ id: 'seed-4', message: 'Rejected a flagged signal from Singapore — duplicate suspected', category: 'opportunities', actorName: 'Ada Chukwu', when: 'Yesterday' },
{ id: 'seed-5', message: 'Requested adjustment on the shortlist for "Structural engineering peer review"', category: 'opportunities', actorName: 'Ada Chukwu', when: '2 days ago' },
{ id: 'seed-6', message: 'Issued a Readiness Assertion for Riverside BPO Hub', category: 'readiness', actorName: 'Ada Chukwu', when: '3 days ago' },
{ id: 'seed-7', message: 'Marked "NDPA cross-border data transfer conditions" as under review', category: 'compliance', actorName: 'Ada Chukwu', when: '4 days ago' }];


interface AuditLogContextValue {
  entries: AuditLogEntry[];
  logEvent: (message: string, category: AuditCategory, actorName: string) => void;
}

const AuditLogContext = createContext<AuditLogContextValue | null>(null);

export function AuditLogProvider({ children }: {children: React.ReactNode;}) {
  const [runtimeEntries, setRuntimeEntries] = useState<AuditLogEntry[]>([]);

  const value = useMemo<AuditLogContextValue>(
    () => ({
      entries: [...runtimeEntries, ...seedEntries],
      logEvent: (message, category, actorName) => {
        const entry: AuditLogEntry = {
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          message,
          category,
          actorName,
          when: 'Just now'
        };
        setRuntimeEntries((current) => [entry, ...current]);
      }
    }),
    [runtimeEntries]
  );

  return <AuditLogContext.Provider value={value}>{children}</AuditLogContext.Provider>;
}

export function useAuditLog(): AuditLogContextValue {
  const context = useContext(AuditLogContext);
  if (!context) throw new Error('useAuditLog must be used within an AuditLogProvider');
  return context;
}
