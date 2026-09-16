export interface HeroMessage {
  id: string;
  headline: string;
  highlight: string;
  sub: string;
}

export const heroMessages: HeroMessage[] = [
{
  id: 'rail',
  headline: "One verified rail for Nigeria's service exports.",
  highlight: "Nigeria's",
  sub: "Qualified demand, authoritative compliance and verified supply — on one platform, under the exporter's consent."
},
{
  id: 'evidence',
  headline: 'Buyers arrive. The evidence is already proven.',
  highlight: 'proven.',
  sub: 'Upload a certificate once. Every portal references the same hash-verified vault.'
},
{
  id: 'counted',
  headline: 'Every export counted once, nationally.',
  highlight: 'once,',
  sub: 'Reconciled across NEPC, NEXIM, CBN and FIRS — no duplicated claims, no blind spots.'
}];