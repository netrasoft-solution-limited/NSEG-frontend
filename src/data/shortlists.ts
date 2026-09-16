export interface ShortlistCandidate {
  id: string;
  name: string;
  natepId: string;
  score: number;
  factors: { label: string; weight: number; got: number }[];
}

export interface Shortlist {
  opportunityId: string;
  candidates: ShortlistCandidate[];
}

const factorSet = [
{ label: 'Team capacity', weight: 30 },
{ label: 'Verified status', weight: 30 },
{ label: 'Track record', weight: 20 },
{ label: 'Skills match', weight: 20 }];


export const shortlists: Shortlist[] = [
{
  opportunityId: 'opp-04',
  candidates: [
  {
    id: 'sl-04-a',
    name: 'Riverside BPO Hub',
    natepId: 'NT-B26-63357',
    score: 91,
    factors: [
    { ...factorSet[0], got: 28 },
    { ...factorSet[1], got: 30 },
    { ...factorSet[2], got: 18 },
    { ...factorSet[3], got: 15 }]

  },
  {
    id: 'sl-04-b',
    name: 'Lagos Delivery Collective',
    natepId: 'NT-B26-11029',
    score: 78,
    factors: [
    { ...factorSet[0], got: 24 },
    { ...factorSet[1], got: 22 },
    { ...factorSet[2], got: 16 },
    { ...factorSet[3], got: 16 }]

  },
  {
    id: 'sl-04-c',
    name: 'Plateau Media Collective',
    natepId: 'NT-B26-40982',
    score: 61,
    factors: [
    { ...factorSet[0], got: 17 },
    { ...factorSet[1], got: 18 },
    { ...factorSet[2], got: 12 },
    { ...factorSet[3], got: 14 }]

  }]

},
{
  opportunityId: 'opp-08',
  candidates: [
  {
    id: 'sl-08-a',
    name: 'Apex Software Global',
    natepId: 'NT-B26-94821',
    score: 94,
    factors: [
    { ...factorSet[0], got: 29 },
    { ...factorSet[1], got: 30 },
    { ...factorSet[2], got: 19 },
    { ...factorSet[3], got: 16 }]

  },
  {
    id: 'sl-08-b',
    name: 'Abuja Analytics Partners',
    natepId: 'NT-B26-55402',
    score: 82,
    factors: [
    { ...factorSet[0], got: 25 },
    { ...factorSet[1], got: 28 },
    { ...factorSet[2], got: 15 },
    { ...factorSet[3], got: 14 }]

  }]

},
{
  opportunityId: 'opp-10',
  candidates: [
  {
    id: 'sl-10-a',
    name: 'Delta Engineering Works',
    natepId: 'NT-B26-77630',
    score: 87,
    factors: [
    { ...factorSet[0], got: 26 },
    { ...factorSet[1], got: 27 },
    { ...factorSet[2], got: 18 },
    { ...factorSet[3], got: 16 }]

  },
  {
    id: 'sl-10-b',
    name: 'Kaduna Textile Exports',
    natepId: 'NT-B26-30871',
    score: 59,
    factors: [
    { ...factorSet[0], got: 16 },
    { ...factorSet[1], got: 20 },
    { ...factorSet[2], got: 12 },
    { ...factorSet[3], got: 11 }]

  }]

},
{
  opportunityId: 'opp-13',
  candidates: [
  {
    id: 'sl-13-a',
    name: 'Savannah Healthtech Ltd',
    natepId: 'NT-B25-11567',
    score: 96,
    factors: [
    { ...factorSet[0], got: 30 },
    { ...factorSet[1], got: 30 },
    { ...factorSet[2], got: 20 },
    { ...factorSet[3], got: 16 }]

  },
  {
    id: 'sl-13-b',
    name: 'Abuja Analytics Partners',
    natepId: 'NT-B26-55402',
    score: 74,
    factors: [
    { ...factorSet[0], got: 21 },
    { ...factorSet[1], got: 26 },
    { ...factorSet[2], got: 14 },
    { ...factorSet[3], got: 13 }]

  }]

}];
