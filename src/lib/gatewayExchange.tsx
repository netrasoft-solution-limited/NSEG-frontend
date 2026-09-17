import React, { createContext, useContext, useMemo, useState } from 'react';
import type { CriteriaKind } from '../data/opportunities';
import type { SupplyModeId } from '../data/regulations';

/**
 * The hand-offs between the buyer workspace, the exporter workspace and the officer console.
 * Each surface keeps its own private state; only what one party deliberately sends to another
 * lands here — the prototype's stand-in for the Gateway's shared records. Session-scoped, like
 * the audit log: a reload clears it.
 */

export type RequestDecision = 'pending' | 'qualified' | 'rejected';

/** A buyer request sent for qualification (DEM-02/03). */
export interface SubmittedRequest {
  id: string;
  buyerId: string;
  title: string;
  sectorCode: string;
  mode: SupplyModeId;
  budgetMin: number;
  budgetMax: number;
  targetCompletion: string;
  summary: string;
  criteria: { kind: CriteriaKind; label: string }[];
  decision: RequestDecision;
}

export type IntroductionResponse = 'pending' | 'accepted' | 'declined' | 'withdrawn';

/** A buyer asking to see a shortlisted exporter's profile (DEM-09). Accepting it is the
 * exporter's consent; withdrawing it ends the buyer's access. */
export interface IntroductionRequest {
  /** The shortlist candidate id — one request per candidate. */
  id: string;
  opportunityId: string;
  buyerId: string;
  actorId: string;
  response: IntroductionResponse;
}

/** A buyer's delivery confirmation (DEM-11) — always provisional until an officer verifies it. */
export interface DeliveryConfirmation {
  engagementId: string;
  amount: number;
  note: string;
}

interface GatewayExchangeValue {
  requests: SubmittedRequest[];
  submitRequest: (request: Omit<SubmittedRequest, 'decision'>) => void;
  decideRequest: (id: string, decision: RequestDecision) => void;
  introductions: IntroductionRequest[];
  requestIntroduction: (introduction: Omit<IntroductionRequest, 'response'>) => void;
  respondToIntroduction: (id: string, response: IntroductionResponse) => void;
  deliveryConfirmations: DeliveryConfirmation[];
  confirmDelivery: (confirmation: DeliveryConfirmation) => void;
}

const GatewayExchangeContext = createContext<GatewayExchangeValue | null>(null);

export function GatewayExchangeProvider({ children }: {children: React.ReactNode;}) {
  const [requests, setRequests] = useState<SubmittedRequest[]>([]);
  const [introductions, setIntroductions] = useState<IntroductionRequest[]>([]);
  const [deliveryConfirmations, setDeliveryConfirmations] = useState<DeliveryConfirmation[]>([]);

  const value = useMemo<GatewayExchangeValue>(
    () => ({
      requests,
      submitRequest: (request) => setRequests((current) => [{ ...request, decision: 'pending' }, ...current]),
      decideRequest: (id, decision) =>
      setRequests((current) => current.map((item) => item.id === id ? { ...item, decision } : item)),
      introductions,
      requestIntroduction: (introduction) =>
      setIntroductions((current) =>
      current.some((item) => item.id === introduction.id) ?
      current :
      [{ ...introduction, response: 'pending' }, ...current]
      ),
      respondToIntroduction: (id, response) =>
      setIntroductions((current) => current.map((item) => item.id === id ? { ...item, response } : item)),
      deliveryConfirmations,
      confirmDelivery: (confirmation) =>
      setDeliveryConfirmations((current) => [
      confirmation,
      ...current.filter((item) => item.engagementId !== confirmation.engagementId)]
      )
    }),
    [requests, introductions, deliveryConfirmations]
  );

  return <GatewayExchangeContext.Provider value={value}>{children}</GatewayExchangeContext.Provider>;
}

export function useGatewayExchange(): GatewayExchangeValue {
  const context = useContext(GatewayExchangeContext);
  if (!context) throw new Error('useGatewayExchange must be used within a GatewayExchangeProvider');
  return context;
}
