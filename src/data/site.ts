export interface Agency {
  name: string;
  src: string;
}

export const agencies: Agency[] = [
{
  name: 'Federal Ministry of Industry, Trade & Investment',
  src: "/image.png"
},
{
  name: 'Nigerian Export Promotion Council',
  src: "/image-1.png"
},
{
  name: 'Nigerian Export-Import Bank',
  src: "/image-2.png"
},
{
  name: 'Central Bank of Nigeria',
  src: "/image-3.png"
},
{
  name: 'Nigeria Revenue Service',
  src: "/image-4.png"
},
{
  name: 'National Information Technology Development Agency',
  src: "/image-5.png"
},
{
  name: 'Corporate Affairs Commission',
  src: "/image-6.png"
},
{
  name: 'National Identity Management Commission',
  src: "/image-7.png"
},
{
  name: 'Nigeria Export Processing Zones Authority',
  src: "/image-8.png"
}];


export type StageIcon = 'signal' | 'review' | 'match' | 'consent' | 'contract' | 'verified';

export interface PipelineStage {
  id: string;
  label: string;
  detail: string;
  icon: StageIcon;
}

export const pipelineStages: PipelineStage[] = [
{ id: 'signal', label: 'Signal captured', detail: 'Form · mission · API · batch', icon: 'signal' },
{ id: 'qualified', label: 'Officer qualified', detail: 'Dedupe, risk tier, rationale', icon: 'review' },
{ id: 'matched', label: 'Explainably matched', detail: 'Weights, exclusions, bias check', icon: 'match' },
{ id: 'consented', label: 'Consent granted', detail: 'Purpose-bound, expiring', icon: 'consent' },
{ id: 'contracted', label: 'Contract placed', detail: 'Milestones, escrow lock', icon: 'contract' },
{ id: 'verified', label: 'Outcome verified', detail: 'Counted once, attributed', icon: 'verified' }];


export interface FooterLink {
  label: string;
  href: string;
}

export const footerColumns: { heading: string;links: FooterLink[] }[] = [
{
  heading: 'Portals',
  links: [
  { label: 'Demand & Market Access', href: '/marketplace' },
  { label: 'Exporter workspace', href: '/workspace' },
  { label: 'Buyer workspace', href: '/buyer' },
  { label: 'Regulatory Trust', href: '/#trust' },
  { label: 'Supply Ecosystem', href: '/#portals' },
  { label: 'National Observatory', href: '/#observatory' }]

},
{
  heading: 'Foundation',
  links: [
  { label: 'Identity & SSO', href: '/#top' },
  { label: 'Actor Registry', href: '/#top' },
  { label: 'Evidence Vault', href: '/#top' },
  { label: 'Consent Engine', href: '/#top' },
  { label: 'Audit Trail', href: '/#top' }]

},
{
  heading: 'Governance',
  links: [
  { label: 'Mandate & TOR', href: '/#governance' },
  { label: 'NDPA 2023 posture', href: '/#governance' },
  { label: 'Stage gates G0–G6', href: '/#governance' },
  { label: 'Contact the Secretariat', href: '/#governance' }]

}];