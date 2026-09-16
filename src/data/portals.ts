export type DemoKey = 'intake' | 'matching' | 'consent' | 'vault' | 'readiness' | 'observatory';

export interface Capability {
  id: string;
  eyebrow: string;
  title: string;
  blurb: string;
  demo: DemoKey;
  span: 'wide' | 'tall' | 'single';
}

export const capabilities: Capability[] = [
{
  id: 'matching',
  eyebrow: 'For foreign buyers',
  title: 'The right shortlist, with reasons',
  blurb: 'Buyers see who fits and why. A NATEP officer approves the shortlist before anyone is contacted.',
  demo: 'matching',
  span: 'wide'
},
{
  id: 'intake',
  eyebrow: 'For trade officers',
  title: 'Every lead lands in one queue',
  blurb: 'However an opportunity arrives, it waits for a real review before it reaches exporters.',
  demo: 'intake',
  span: 'single'
},
{
  id: 'consent',
  eyebrow: 'For exporters',
  title: 'You choose what a buyer sees',
  blurb: 'Share only the details you want, only with who you name — and take it back whenever you like.',
  demo: 'consent',
  span: 'single'
},
{
  id: 'readiness',
  eyebrow: 'For growing firms',
  title: 'Know where you stand',
  blurb: 'A clear readiness score, the gaps behind it, and the next step to move up a level.',
  demo: 'readiness',
  span: 'single'
},
{
  id: 'vault',
  eyebrow: 'For everyone',
  title: 'Send a document once',
  blurb: 'A certificate proven in one place is recognised everywhere else. No re-uploading the same paperwork.',
  demo: 'vault',
  span: 'single'
},
{
  id: 'observatory',
  eyebrow: 'For policymakers',
  title: 'One honest national picture',
  blurb: 'Trade figures that agencies agree on, with each contract counted a single time.',
  demo: 'observatory',
  span: 'wide'
}];