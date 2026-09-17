import React, { createContext, useContext, useMemo, useState } from 'react';
import { buyers, type Buyer } from '../data/buyers';
import type { CriteriaKind } from '../data/opportunities';
import type { SupplyModeId } from '../data/regulations';

export interface RequestCriterion {
  kind: CriteriaKind;
  label: string;
}

/** A request the buyer is still drafting — private until submitted to the Gateway exchange.
 * Seeded requests live in opportunities.ts. */
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
}

/** Private to the buyer. Anything another party must see goes through gatewayExchange.tsx. */
interface BuyerWorkspaceState {
  drafts: BuyerDraftRequest[];
  /** DEM-08: the buyer's own recorded choice per opportunity — never made by the platform. */
  selections: Record<string, string>;
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
  drafts: [],
  selections: {}
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
