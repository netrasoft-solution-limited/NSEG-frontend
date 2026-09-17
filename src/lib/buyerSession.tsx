import React, { createContext, useContext, useMemo, useState } from 'react';
import { buyers, type Buyer } from '../data/buyers';
import type { CriteriaKind } from '../data/opportunities';
import type { SupplyModeId } from '../data/regulations';

export interface RequestCriterion {
  kind: CriteriaKind;
  label: string;
}

/** A request the buyer created this session. Seeded requests live in opportunities.ts. */
export interface BuyerDraftRequest {
  id: string;
  title: string;
  sectorCode: string;
  mode: SupplyModeId;
  budgetMin: number;
  budgetMax: number;
  targetCompletion: string;
  summary: string;
  criteria: RequestCriterion[];
  status: 'draft' | 'awaiting-qualification';
}

export interface DeliveryConfirmation {
  amount: number;
  note: string;
}

interface BuyerWorkspaceState {
  requests: BuyerDraftRequest[];
  /** Shortlist candidate ids the buyer asked to be introduced to. */
  introductionRequests: string[];
  /** DEM-08: the buyer's own recorded choice per opportunity — never made by the platform. */
  selections: Record<string, string>;
  deliveryConfirmations: Record<string, DeliveryConfirmation>;
}

interface BuyerSessionValue {
  buyer: Buyer;
  setBuyerId: (id: string) => void;
  state: BuyerWorkspaceState;
  update: (patch: Partial<BuyerWorkspaceState>) => void;
}

/** Ferrovia Manufacturing Group has requests at every stage — published, shortlisted, in
 * delivery — so the default view shows the whole flow end to end. */
const DEFAULT_BUYER_ID = 'byr-08';

const emptyState: BuyerWorkspaceState = {
  requests: [],
  introductionRequests: [],
  selections: {},
  deliveryConfirmations: {}
};

const BuyerSessionContext = createContext<BuyerSessionValue | null>(null);

/** Stands in for a signed-in buyer, the same way ExporterSessionProvider does. */
export function BuyerSessionProvider({ children }: {children: React.ReactNode;}) {
  const [buyerId, setBuyerId] = useState(DEFAULT_BUYER_ID);
  const [states, setStates] = useState<Record<string, BuyerWorkspaceState>>({});

  const buyer = buyers.find((item) => item.id === buyerId) ?? buyers[0];
  const state = states[buyer.id] ?? emptyState;

  const value = useMemo<BuyerSessionValue>(
    () => ({
      buyer,
      setBuyerId,
      state,
      update: (patch) =>
      setStates((current) => ({
        ...current,
        [buyer.id]: { ...(current[buyer.id] ?? emptyState), ...patch }
      }))
    }),
    [buyer, state]
  );

  return <BuyerSessionContext.Provider value={value}>{children}</BuyerSessionContext.Provider>;
}

export function useBuyerSession(): BuyerSessionValue {
  const context = useContext(BuyerSessionContext);
  if (!context) throw new Error('useBuyerSession must be used inside BuyerSessionProvider');
  return context;
}
