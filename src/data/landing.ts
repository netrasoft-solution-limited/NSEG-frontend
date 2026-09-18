/** Landing page content: three audience doors, the four published rules, the six-stage process
 * and the footer. Kept as data so wording changes don't touch layout code. */

export type DoorId = 'buyer' | 'exporter' | 'institution';

export interface AudienceDoor {
  id: DoorId;
  title: string;
  audience: string;
  promises: string[];
  cta: {label: string;to: string;};
}

export const audienceDoors: AudienceDoor[] = [
{
  id: 'buyer',
  title: 'I am buying services',
  audience: 'International buyers, employers, platforms and procurement teams.',
  promises: [
  'State a requirement once, in structured form',
  'Receive a human-reviewed shortlist, never an automated one',
  'See dated evidence of capability and capacity'],

  cta: { label: 'Place a requirement', to: '/buyer/requests/new' }
},
{
  id: 'exporter',
  title: 'I am exporting services',
  audience: 'Firms, BPO and ITES providers, freelancers and licensed professionals.',
  promises: [
  'Find out exactly what your target market requires',
  'Build a readiness record you control and keep private',
  'Release your details only when you consent, field by field'],

  cta: { label: 'Open my workspace', to: '/workspace' }
},
{
  id: 'institution',
  title: 'I am an institution or partner',
  audience: 'Regulators, professional bodies, missions, chambers and providers.',
  promises: [
  'Own and validate the requirements published in your name',
  'Originate demand and record your contribution to outcomes',
  'Deliver interventions against measured, evidenced gaps'],

  // The operations console isn't linked from the public site; institutions are onboarded
  // through the Secretariat.
  cta: { label: 'Talk to the Secretariat', to: '/#support' }
}];


/** Named rather than imported here, so the data file stays free of component imports. */
export type TrustRuleIcon = 'owner' | 'evidence' | 'consent' | 'person';

export interface TrustRule {
  /** Says what the rule is about — a signed owner, a graded claim, a key, a person. */
  icon: TrustRuleIcon;
  title: string;
  body: string;
}

export const trustRules: TrustRule[] = [
{
  icon: 'owner',
  title: 'Every requirement has an owner',
  body: 'Nothing is published without a named institution, a source link, a version, a validation status and a review date. If it lacks any of these, it is not on the register.'
},
{
  icon: 'evidence',
  title: 'Claims carry their evidence class',
  body: 'Self-declared, submitted, source-verified and independently verified are shown as different things. Nothing is presented as confirmed until it has been.'
},
{
  icon: 'consent',
  title: 'Nothing is shared without consent',
  body: 'You choose the recipient, the fields, the documents and the expiry date. Withdraw at any time and access stops immediately, while the record of what happened is kept.'
},
{
  icon: 'person',
  title: 'A person makes every decision',
  body: 'Shortlisting, referral and outcome acceptance are made by a named officer with a recorded reason. No score decides anything about you, and any decision can be challenged.'
}];


export type ProcessIcon = 'demand' | 'qualified' | 'rules' | 'matched' | 'consent' | 'outcome';

export interface ProcessStage {
  id: string;
  title: string;
  detail: string;
  owner: string;
  /** A named person must decide at this stage (shown in gold). */
  humanDecision: boolean;
  icon: ProcessIcon;
}

export const processStages: ProcessStage[] = [
{
  id: 'demand',
  title: 'Demand stated',
  detail: 'A buyer submits a structured requirement. Authority and credibility are checked.',
  owner: 'Buyer',
  humanDecision: false,
  icon: 'demand'
},
{
  id: 'qualified',
  title: 'Qualified',
  detail: 'An officer decides, with a recorded reason. One canonical opportunity is created.',
  owner: 'Officer decides',
  humanDecision: true,
  icon: 'qualified'
},
{
  id: 'rules',
  title: 'Rules attached',
  detail: 'The exact published version of every applicable requirement is pinned to the case.',
  owner: 'Regulator',
  humanDecision: false,
  icon: 'rules'
},
{
  id: 'matched',
  title: 'Capability matched',
  detail: 'Evidenced capability and dated capacity are compared, with the reasoning shown in full.',
  owner: 'Platform',
  humanDecision: false,
  icon: 'matched'
},
{
  id: 'consent',
  title: 'Consent and referral',
  detail: 'Nothing is disclosed until the exporter agrees, field by field, with an expiry.',
  owner: 'Exporter decides',
  humanDecision: true,
  icon: 'consent'
},
{
  id: 'outcome',
  title: 'Contract and outcome',
  detail: 'Accepted, then recorded with evidence and verified by someone other than the reporter.',
  owner: 'Officer decides',
  humanDecision: true,
  icon: 'outcome'
}];


export interface FooterItem {
  label: string;
  /** Omitted when the page doesn't exist yet — rendered as plain text rather than a dead link. */
  href?: string;
}

export const siteFooterColumns: {heading: string;items: FooterItem[];}[] = [
{
  heading: 'Explore',
  items: [
  { label: 'Requirements register', href: '/workspace/requirements' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Our standards', href: '/#how-it-works' }]

},
{
  heading: 'For you',
  items: [
  { label: 'Exporters and firms', href: '/workspace/register' },
  { label: 'Professionals', href: '/workspace/register' },
  { label: 'International buyers', href: '/buyer/register' },
  { label: 'Institutions', href: '/#who-its-for' }]

},
{
  heading: 'About',
  items: [
  { label: 'The programme' },
  { label: 'Governance' },
  { label: 'Participating institutions' },
  { label: 'Service documentation' }]

},
{
  heading: 'Get help',
  items: [
  { label: 'Support and FAQs' },
  { label: 'Report a problem' },
  { label: 'Challenge a decision' },
  { label: 'Contact us' }]

}];


export const legalLinks: FooterItem[] = [
{ label: 'Privacy notice (NDPA 2023)' },
{ label: 'Accessibility statement' },
{ label: 'Terms of use' },
{ label: 'Freedom of information' },
{ label: 'Security disclosure' }];
