import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Buyer } from '../data/buyers';
import { useAccounts } from './accounts';
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
  buyer: Buyer | undefined;
  signOut: () => void;
  state: BuyerWorkspaceState;
  update: (patch: Partial<BuyerWorkspaceState>) => void;
}

const emptyState: BuyerWorkspaceState = {
  drafts: [],
  selections: {}
};

const BuyerSessionContext = createContext<BuyerSessionValue | null>(null);

/** The signed-in buyer and their private workspace state, the same way ExporterSessionProvider works. */
export function BuyerSessionProvider({ children }: {children: React.ReactNode;}) {
  const accounts = useAccounts();
  const [states, setStates] = useState<Record<string, BuyerWorkspaceState>>({});

  const buyer = accounts.buyers.find((item) => item.id === accounts.signedInBuyerId);
  const state = buyer ? states[buyer.id] ?? emptyState : emptyState;

  const value = useMemo<BuyerSessionValue>(
    () => ({
      buyer,
      signOut: accounts.signOutBuyer,
      state,
      update: (patch) => {
        if (!buyer) return;
        setStates((current) => ({
          ...current,
          [buyer.id]: { ...(current[buyer.id] ?? emptyState), ...patch }
        }));
      }
    }),
    [buyer, state, accounts.signOutBuyer]
  );

  return <BuyerSessionContext.Provider value={value}>{children}</BuyerSessionContext.Provider>;
}

/** For pages behind the sign-in guard: the buyer is always present there. */
export function useBuyerSession(): BuyerSessionValue & {buyer: Buyer;} {
  const context = useContext(BuyerSessionContext);
  if (!context) throw new Error('useBuyerSession must be used inside BuyerSessionProvider');
  if (!context.buyer) throw new Error('useBuyerSession needs a signed-in buyer — wrap the route in RequireBuyer');
  return context as BuyerSessionValue & {buyer: Buyer;};
}
