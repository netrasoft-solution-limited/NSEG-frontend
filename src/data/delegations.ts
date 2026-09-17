export type DelegationStatus = 'active' | 'expiring-soon' | 'expired' | 'revoked';
export type DelegateRole = 'employee' | 'contractor' | 'branch-officer';

/** An Enterprise Administrator (ROLE_ENTITY_ADMIN) assigns a time-bound delegation scope
 * to a named individual acting on behalf of their organization (BRD §2.3) — a firm or
 * buyer isn't one login, it's an org with delegated staff. Max lifetime is 365 days; a
 * daily background job flags un-recertified records EXPIRED rather than deleting them.
 * An officer's role here is oversight only: revoking a delegation is a compliance action,
 * not something the platform does routinely, mirroring how ConsentRegister treats revoke. */
export interface Delegation {
  id: string;
  actorId: string;
  actorKind: 'exporter' | 'buyer';
  delegateName: string;
  delegateRole: DelegateRole;
  assignedOn: string;
  /** Days remaining until the 365-day cap lapses — undefined once expired or revoked,
   * following the relative-day convention used elsewhere (see actors.ts). */
  expiresInDays?: number;
  status: DelegationStatus;
  note?: string;
}

export const delegations: Delegation[] = [
{
  id: 'del-01',
  actorId: 'act-08',
  actorKind: 'exporter',
  delegateName: 'Ngozi Eze',
  delegateRole: 'branch-officer',
  assignedOn: '2026-03-10',
  expiresInDays: 210,
  status: 'active'
},
{
  id: 'del-02',
  actorId: 'act-01',
  actorKind: 'exporter',
  delegateName: 'Chidinma Okafor',
  delegateRole: 'employee',
  assignedOn: '2026-02-01',
  expiresInDays: 22,
  status: 'expiring-soon'
},
{
  id: 'del-03',
  actorId: 'act-09',
  actorKind: 'exporter',
  delegateName: 'Tunde Bakare',
  delegateRole: 'contractor',
  assignedOn: '2025-09-01',
  status: 'expired',
  note: 'Un-recertified past the 365-day cap — auto-flagged by the daily lifecycle job.'
},
{
  id: 'del-04',
  actorId: 'byr-04',
  actorKind: 'buyer',
  delegateName: 'James Whitfield',
  delegateRole: 'employee',
  assignedOn: '2026-01-15',
  expiresInDays: 300,
  status: 'active'
},
{
  id: 'del-05',
  actorId: 'act-05',
  actorKind: 'exporter',
  delegateName: 'Amaka Chukwu',
  delegateRole: 'branch-officer',
  assignedOn: '2025-10-01',
  status: 'revoked',
  note: 'Revoked following a compliance investigation into duplicate export claims.'
},
{
  id: 'del-06',
  actorId: 'byr-11',
  actorKind: 'buyer',
  delegateName: 'Sarah Connolly',
  delegateRole: 'contractor',
  assignedOn: '2026-06-01',
  expiresInDays: 6,
  status: 'expiring-soon'
}];
