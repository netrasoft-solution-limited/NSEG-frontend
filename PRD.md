# NSEG Portal — Prototype Product Requirements Document

**Status:** Living document. Update the change log (§9) whenever scope or build status changes.
**Source of truth:** `Copy of NATEP BRD_FRD Modules Specs (1).pdf` (162 pages) at the repo root — the
Business Requirements Document / Functional Requirements Document for the Nigeria Service
Export Gateway (NATEP / NCMSE). This PRD is a derived, prototype-scoped reading of that BRD; the
BRD itself remains authoritative for the full production system.

---

## 0. Purpose & how to use this document

This repo is a **frontend prototype** (React + Vite, static mock data, no backend, no real auth) of a
subset of a much larger national platform. The source BRD describes a full enterprise system —
real IAM, encryption, microservices, escrow, cross-border arbitration. Every session that opens this
repo needs an answer to "what does the BRD ask for, what already exists, and what's next" without
re-reading 162 pages each time. That's what this document is for:

- §4 is the **complete subsystem inventory** — every module and subsystem the BRD defines, with a
  build-status column and the exact files that implement it (or don't).
- §5 flags **real contradictions inside the BRD itself** that need a human decision, not an assumption.
- §7 is the **recommended build order** for what's left, kept in priority order.

Read §4 and §7 before starting new console work. Update this file in the same commit as the work
that changes its status.

---

## 1. A note on the BRD's draft history

The PDF is a concatenation of multiple drafts, not one clean document. Two things to know before
trusting any single page of it in isolation:

1. **The "Architecture Outline" (PDF pages 1–6) describes an earlier, smaller 3-portal model**
   (Portal 1 Demand, Portal 2 Regulatory Trust & Exporter Readiness, Portal 3 Supply Ecosystem &
   Competitiveness, plus a National Observatory). The **detailed Module 1–8 BRD/FRD sections that
   follow it describe a superseding, larger 6-portal model** where "Portal 2" and "Portal 3" mean
   different things than they did in the outline (see §4 module map). This PRD is built from the
   detailed Module 1–8 sections, since they're the ones with FRD-level subsystems, API contracts,
   and acceptance criteria — the outline is background context only.
2. **Module 3 (Portal 1: Demand) and Module 4 (Portal 2: Supply) each appear more than once** in the
   file, as different drafts with different subsystem counts (Module 3 has a 5-subsystem draft and a
   later 7-subsystem draft that adds Trust Badging and Cross-Border Settlement; Module 4's two
   passes are materially the same). This PRD uses the **most complete draft of each** — the 7-subsystem
   version of Module 3. This also matches the terminology the previous build session already used
   (e.g. "Hybrid JIT Verification" only appears in the later draft), so it's the one already partially built.

---

## 2. Program context (condensed from BRD Module 1)

- **Parent programme:** Nigeria Service Export Gateway (NATEP / NCMSE), under the Federal Ministry
  of Industry, Trade and Investment (FMITI).
- **Precedence order** (highest first): Applicable Law → Executive Decisions → Integrated TOR → BRD
  Module 1 → BRD Module 2 → BRD Module 3 → BRD Module 4 → FRD/SRS specs. **Module 1 outranks
  every other module** — this matters directly in §5.
- **The Single-Platform Mandate:** portals are strictly forbidden from building siloed databases,
  duplicate auth, local file storage, or independent audit logs. Everything sits on one shared
  foundation (Module 2). The prototype's `AuditLogProvider` / `OfficerProfileProvider` pattern in
  [App.tsx](src/App.tsx) is the closest analogue to this in a frontend-only context.
- **Release plan:** 26-week, 3-release, 7-gate rollout (G0–G6). Gate G3 (Week 10) calls for "Shared
  Foundation operational, Portal 1 intake/qualification engine active, initial Portal 2/3 alphas." Gate
  G4 (Week 16) calls for "inter-portal API contracts functioning, consented capability transfer
  verified, Observatory fact engine active." This prototype is roughly at a G3→G4 milestone in
  scope (see §4).

---

## 3. Platform-wide non-goals (binding on every module below)

Verbatim from BRD Module 1 §1.3.2 — these override anything in a lower-precedence module that
conflicts with them (see §5 for where that actually happens):

1. **No stand-alone payment gateway, escrow, or direct commercial settlement engine.** Payment
   settlement happens through commercial banking/FX channels; the platform records transaction
   *metadata* only, for export verification and trade accounting.
2. **No unmoderated public directory.** No open-search listing of individuals or raw supplier lists;
   access to supplier capability profiles is consent-gated and mediated through qualified demand.
3. **No autonomous algorithmic contract award.** Matching/scoring is decision support only —
   automation must never award contracts, issue binding referrals, or disqualify actors without
   human review.
4. **No direct legal contracting.** The platform tracks milestone events (Contract Awarded,
   Commencement Confirmed) and reference hashes of executed agreements, but is not an
   e-signature tool.
5. **No creation of statutory obligations.** The Regulatory Trust domain compiles, explains, versions,
   and routes guidance from competent authorities — it has zero legal authority to create new
   statutory duties or levy fines.

The existing console already reflects several of these by construction: `ShortlistReview` requires
human approval before a match is acted on (non-goal 3); `IncentiveQueue`'s `canApprove` gate
requires a designated administrator sign-off rather than automatic disbursement; `ConsoleEngagements`
tracks `contract-signed` / `commenced` as milestone events, not an e-signature flow (non-goal 4).

---

## 4. Full module & subsystem inventory

Status legend: ✅ Built · 🟡 Partial · ⬜ Not started · 🚫 Out of scope (see §5)

### Module 1 — Core Governance, Scope & Single-Platform Principles
Policy/architecture only; no FRD subsystems, no direct UI. Its rules (Single-Platform Mandate, SoR
matrix, non-goals, precedence order) constrain every module below.

### Module 2 — Shared Platform Foundation Services (Canonical Common Layer)
| # | Subsystem | Status | Where in repo |
|---|---|---|---|
| 2.1 | Unified Identity & Access Management (IAM) | ⬜ | [officerProfile.tsx](src/lib/officerProfile.tsx) is a single mocked profile, no login/RBAC |
| 2.2 | Canonical Actor Registry & Identity Verification | 🟡 | [ActorTable.tsx](src/components/console/ActorTable.tsx), [BuyerTable.tsx](src/components/console/BuyerTable.tsx), [VerificationQueue.tsx](src/components/console/VerificationQueue.tsx), [verification.ts](src/lib/verification.ts) — per-portal actor/buyer views exist; no unified cross-portal registry or dedup UI |
| 2.3 | Organization Delegation & Multi-Tenant Context | ⬜ | Not started |
| 2.4 | Shared Evidence & Zero-Duplicate Document Vault | ✅ | [ConsoleVault.tsx](src/pages/ConsoleVault.tsx), [EvidenceVault.tsx](src/components/console/EvidenceVault.tsx), [vaultDocuments.ts](src/data/vaultDocuments.ts) |
| 2.5 | Granular User Consent & Privacy (NDPA 2023) | ✅ | [ConsoleConsent.tsx](src/pages/ConsoleConsent.tsx), [ConsentRegister.tsx](src/components/console/ConsentRegister.tsx), [consentGrants.ts](src/data/consentGrants.ts) |
| 2.6 | Immutable Disclosure Package | ✅ | [DisclosurePackageViewer.tsx](src/components/console/DisclosurePackageViewer.tsx), [disclosurePackage.ts](src/lib/disclosurePackage.ts) — built as a derived artifact (not stored), so revoking or expiring the underlying consent grant instantly voids it; surfaced from both `ConsoleConsent` and `ConsoleEngagements`; each view is audit-logged |
| 2.7 | Controlled Taxonomies & Master Data | 🟡 | Taxonomies exist as static data ([sectors.ts](src/data/sectors.ts), [trustTiers.ts](src/data/trustTiers.ts), [buyerTiers.ts](src/data/buyerTiers.ts)) but with no admin/versioning UI |
| 2.8 | Configurable Workflow & Task Engine | 🟡 | Each portal has its own ad hoc queue ([SignalQueue.tsx](src/components/console/SignalQueue.tsx), [IncentiveQueue.tsx](src/components/console/IncentiveQueue.tsx), etc.) but no generic/SLA-aware task engine |
| 2.9 | Event Bus, Universal Gateway & Tamper-Evident Audit | 🟡 | [auditLog.tsx](src/lib/auditLog.tsx), [ConsoleAudit.tsx](src/pages/ConsoleAudit.tsx) cover the audit trail; event bus/API gateway are backend concerns, N/A for a frontend prototype |

### Module 3 — Portal 1: Demand, Market Access & Buyer Matchmaking Domain
| # | Subsystem | Status | Where in repo |
|---|---|---|---|
| 3.1 | Global Buyer Onboarding & Hybrid JIT Verification | ✅ | [ConsoleBuyers.tsx](src/pages/ConsoleBuyers.tsx), [buyers.ts](src/data/buyers.ts) |
| 3.2 | Service Demand Opportunity & RFP Publishing | 🟡 | [ConsoleOpportunities.tsx](src/pages/ConsoleOpportunities.tsx), [opportunities.ts](src/data/opportunities.ts) — officer-side qualification exists; no buyer-facing RFP creation form |
| 3.3 | Automated Matchmaking & Supplier Discovery | ✅ | [ShortlistReview.tsx](src/components/console/ShortlistReview.tsx), [shortlists.ts](src/data/shortlists.ts) |
| 3.4 | Proposal Submission & Bid Management | 🟡 | [ConsoleEngagements.tsx](src/pages/ConsoleEngagements.tsx) tracks referral→interview→contract stages; no actual proposal/bid document submission |
| 3.5 | Market Access Intelligence & Regulatory Insights | ✅ | [ConsoleMarketIntelligence.tsx](src/pages/ConsoleMarketIntelligence.tsx), [MarketIntelligenceLibrary.tsx](src/components/console/MarketIntelligenceLibrary.tsx), [marketIntelligence.ts](src/data/marketIntelligence.ts) — destination-market briefs indexed by country/sector/mode with a draft→under-review→published authoring workflow |
| 3.6 | Symmetric Trust Badging & Progressive Feature Unlocking | 🟡 | [trustTiers.ts](src/data/trustTiers.ts), [buyerTiers.ts](src/data/buyerTiers.ts) drive badges shown in tables; no feature-unlock gating logic |
| 3.7 | Cross-Border Settlement & Verified Escrow | 🚫 | Constrained by Module 1 Non-Goal 1 — see §5. Track as milestone metadata only (already how `ConsoleEngagements` stages `contract-signed`/`commenced`) |
| — | Outcome / Attribution Event (Canonical Information Package #8) | ✅ | [ConsoleOutcomes.tsx](src/pages/ConsoleOutcomes.tsx), [OutcomeLedger.tsx](src/components/console/OutcomeLedger.tsx), [outcomes.ts](src/data/outcomes.ts) — self-reported outcomes start Provisional, an officer independently verifies, and same-engagement duplicate self-reports are flagged for single-count decisions before anything would feed the Observatory |

### Module 4 — Portal 2: Supply, Readiness, Certification & Incentives Domain
| # | Subsystem | Status | Where in repo |
|---|---|---|---|
| 4.1 | Exporter Onboarding & Profile Readiness | ✅ | [ConsoleExporters.tsx](src/pages/ConsoleExporters.tsx), [ActorTable.tsx](src/components/console/ActorTable.tsx), [actors.ts](src/data/actors.ts) |
| 4.2 | Sectoral Regulatory Validation & Certification | ✅ | [ConsoleCertifications.tsx](src/pages/ConsoleCertifications.tsx), [CertificationRegistry.tsx](src/components/console/CertificationRegistry.tsx), [certification.ts](src/lib/certification.ts) — a dedicated view over the Evidence Vault's `sector-license`/`iso-certificate` documents (professional credentials, distinct from `ConsoleCompliance`'s rules register), with issue/reject and 30-day renewal-warning reminders |
| 4.3 | Export Readiness Assessment & Diagnostic | ✅ | [ConsoleReadiness.tsx](src/pages/ConsoleReadiness.tsx), [ReadinessQueue.tsx](src/components/console/ReadinessQueue.tsx), [readinessScore.ts](src/lib/readinessScore.ts) |
| 4.4 | Export Incentives & Trade Facilitation | ✅ | [ConsoleIncentives.tsx](src/pages/ConsoleIncentives.tsx), [IncentiveQueue.tsx](src/components/console/IncentiveQueue.tsx), [incentives.ts](src/data/incentives.ts) |

### Module 5 — Portal 3: National Services Export Observatory, Governance & Policy Intelligence
| # | Subsystem | Status | Where in repo |
|---|---|---|---|
| 5.1 | Real-Time Macroeconomic Trade Observatory | 🟡 | [ConsoleObservatory.tsx](src/pages/ConsoleObservatory.tsx), [observatory.ts](src/data/observatory.ts), [ShareBarList.tsx](src/components/console/ShareBarList.tsx) — static demo metrics, not real-time |
| 5.2 | Inter-Agency Governance & Compliance Gateway | 🟡 | [ReconciliationPanel.tsx](src/components/console/ReconciliationPanel.tsx) — double-counting reconciliation across NEPC/NEXIM/CBN |
| 5.3 | Predictive Policy Simulation & Modeling | ⬜ | Not started |
| 5.4 | Automated Incentive Audit & Anti-Leakage | ⬜ | Not started (Incentives module has manual sign-off, no anti-leakage automation) |

### Module 6 — Portal 4: Global Promotion, Investment Facilitation & Delegation Matchmaking
| # | Subsystem | Status |
|---|---|---|
| 6.1 | Investor Concierge & Landing Pad | ⬜ Not started |
| 6.2 | International Trade Mission & Delegation Matchmaking | ⬜ Not started |

Entire portal not started. Did not appear in the Architecture Outline's earlier 3-portal framing at
all — see §5's open question on scope.

### Module 7 — Portal 5: Financing, Outcomes-Based Capital & Escrow
| # | Subsystem | Status |
|---|---|---|
| 7.1 | Export Contract & Invoice Factoring | ⬜ Not started |
| 7.2 | Outcomes-Based Capital & Upskilling Bond | ⬜ Not started |

Entire portal not started, and directly implicated by the Non-Goal 1 contradiction in §5 — if built,
must be scoped as financing-readiness/eligibility tracking, not real factoring or capital transfer.

### Module 8 — Portal 6: Dispute Resolution, Cross-Border Contract Enforcement
| # | Subsystem | Status |
|---|---|---|
| 8.1 | Online Dispute Resolution (ODR) & Mediation | ⬜ Not started |
| 8.2 | Digital Cross-Border Arbitration Tribunal | ⬜ Not started |

Entire portal not started. Also absent from the Architecture Outline's original framing.

### Public-facing surface (not a numbered BRD subsystem, but part of the delivered app)
[Landing.tsx](src/pages/Landing.tsx) and [Marketplace.tsx](src/pages/Marketplace.tsx) provide the
public-facing views that touch Module 3's opportunity browsing and Module 4's exporter visibility
non-goals (consent-gated, no raw directory exposure).

---

## 5. Resolved scope conflicts & judgment calls

**Escrow/payment processing (Module 1 Non-Goal 1 vs. Module 3.7 and all of Module 7):** Module 1's
own precedence rule (§2) puts it above every other module. Where Module 3's "Cross-Border
Settlement & Verified Escrow" subsystem or Module 7's entire financing/escrow portal would imply
the platform *itself* moving money, Non-Goal 1 wins: **the platform may only track settlement/financing
milestones and metadata, never execute the transaction.** This is already the pattern used in
`ConsoleIncentives` (sign-off tracking, not fund disbursement) and `ConsoleEngagements` (`contract-signed`
/ `commenced` as milestone events). Any future work on Module 3.7 or Module 7 should follow the
same pattern — a status tracker referencing an external settlement, not a payment feature.

**3-portal outline vs. 6-portal detailed modules:** The Architecture Outline (§1) never mentions
Portals 4–6 (Global Promotion/Investment, Financing/Escrow, Dispute Resolution). It's unclear
whether these were added in a later scoping round the outline page was never updated to reflect, or
whether they're aspirational/Phase 2 additions that shouldn't be prioritized against the original
3-portal MVP. **This PRD does not resolve that — see §8, open question 1.**

---

## 6. What this prototype is and isn't

**Is:** a static-data (no backend) UI prototype of the officer-facing Console plus a public
Landing/Marketplace, demonstrating the workflows, data relationships, and decision boundaries the
BRD specifies — verification queues, consent-gated disclosure, audit trails, sign-off gates.

**Isn't:** a working IAM/SSO system, a real document vault (files aren't actually stored/scanned), a
real payment/escrow engine (explicitly out of scope per Module 1 regardless), a live data pipeline
into NEPC/NEXIM/CBN, or an implementation of Modules 6–8 (Investment Facilitation, Financing,
Dispute Resolution) in any form yet.

---

## 7. Recommended build order for remaining prototype work

**Near-term — extends current console, low scope risk:**
1. ~~Outcome Verification & Attribution~~ — done: `ConsoleOutcomes` closes the loop `ConsoleEngagements`
   starts (`commenced` → self-reported → independently verified export value), including duplicate-report
   detection when both exporter and buyer self-report the same engagement.
2. ~~Disclosure Package viewer~~ — done: a "view package" surface on both `ConsoleEngagements` and
   `ConsoleConsent` shows exactly what was bundled and sent, and instantly reflects Void when the
   underlying consent grant is revoked or expired.
3. ~~Sectoral certification issuance workflow~~ — done: `ConsoleCertifications` filters the Evidence
   Vault to professional/sectoral credentials, with issue/reject actions and 30-day renewal-warning
   reminders, kept separate from `ConsoleCompliance`'s rules-register scope.
4. ~~Market Access Intelligence & Regulatory Insights~~ — done: `ConsoleMarketIntelligence` is a
   searchable library of destination-market briefs (country/sector/mode-indexed) with a
   draft→under-review→published authoring workflow.
5. Taxonomies & Master Data reference view (Module 2.7) — lightweight, likely folds into
   `ConsoleSettings`.

**Mid-term — net-new, moderate scope:**
6. Organization Delegation / multi-tenant context (Module 2.3) — an agency-delegate switcher.
7. Predictive Policy Simulation (Module 5.3) and Automated Incentive Audit & Anti-Leakage (Module
   5.4) — extend `ConsoleObservatory`.

**Long-term — needs explicit go-ahead before starting (see §8):**
8. Portal 4 (Global Promotion & Investment Facilitation) — Module 6.
9. Portal 5 (Financing & Escrow) — Module 7, and only ever as milestone tracking (§5).
10. Portal 6 (Dispute Resolution) — Module 8.
11. Real IAM/SSO/RBAC (Module 2.1) — only meaningful once there's a real backend; a lightweight
    role-switcher simulating `ROLE_SYS_ADMIN` / `ROLE_ADSPA_OFFICER` / `ROLE_DATA_STEWARD` /
    `ROLE_ENTITY_ADMIN` / `ROLE_ACTOR_USER` could demonstrate segregation-of-duties sooner, in the
    same spirit as `IncentiveQueue`'s `canApprove` gate.

---

## 8. Open questions for stakeholders

1. **Are Portals 4–6 (Investment Facilitation, Financing/Escrow, Dispute Resolution) actually in scope
   for this prototype**, or are they a later/aspirational addition to the BRD that shouldn't compete
   for build time against finishing Portals 1–3 and the Observatory? (See §5.)
2. **Should Module 7 (Financing/Escrow) be built at all**, given it sits closest to the platform's own
   Non-Goal 1? If yes, confirm the "tracking only, never processing" framing in §5 is the right scope.
3. **Is a simulated multi-role login (Module 2.1) worth building** to demonstrate segregation-of-duties
   in the UI, or does the single-officer mock profile stay indefinitely since there's no real backend to
   authenticate against?
4. **Should the Observatory's "real-time" framing (Module 5.1) be treated as a prototype non-goal**
   (i.e. static/demo data is fine indefinitely) or is there an expectation of eventually wiring live
   metrics in this prototype phase?

---

## 9. Change log

- **2026-09-17** — Initial PRD drafted from a full-text extraction of the 162-page BRD/FRD (all 8
  modules, reconciled to the most complete draft of each — see §1), cross-referenced against repo
  state as of commit `0d83093` (Engagements module).
- **2026-09-17** — Added `ConsoleOutcomes` (Outcome / Attribution Event package): self-reported
  export value starts Provisional, requires independent officer verification, and same-engagement
  duplicate self-reports (exporter + buyer both reporting) are flagged so only one is ever counted.
  Build order item 1 (§7) is now done.
- **2026-09-17** — Added the Disclosure Package viewer (Module 2.6): a derived, on-demand package
  view (not a stored record) shown from `ConsoleConsent` and `ConsoleEngagements`, so revoking the
  underlying consent grant voids it instantly with no separate cleanup. Build order item 2 (§7) is now
  done.
- **2026-09-17** — Added `ConsoleCertifications` (Module 4.2): filters the Evidence Vault to
  professional/sectoral credentials (COREN, ISO 27001, etc.), separate from `ConsoleCompliance`'s
  rules-register scope, with issue/reject actions and 30-day renewal-warning reminders. Build order
  item 3 (§7) is now done.
- **2026-09-17** — Added `ConsoleMarketIntelligence` (Module 3.5): a destination-market brief
  library indexed by country/sector/WTO-GATS mode, with a draft→under-review→published authoring
  workflow for NATEP Administrators. Build order item 4 (§7) is now done — only item 5 (Taxonomies
  & Master Data) remains in the near-term list.
