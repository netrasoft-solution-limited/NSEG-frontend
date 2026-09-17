# NSEG Portal — Prototype Product Requirements Document

**Status:** Living document. Update the change log (§11) whenever scope or build status changes.
**Baseline:** `NATEP Gateway PRD v1.0.pdf` (34 pages) at the repo root — the programme's own
product definition, covering the full BRD scope (Foundation plus six portals). It explicitly
supersedes the competing readings of the source pack, so it outranks every earlier reading in this
file.
**Underlying source:** `Copy of NATEP BRD_FRD Modules Specs (1).pdf` (162 pages). Go to the BRD only
for detail PRD v1.0 carries forward unchanged; where the two disagree, PRD v1.0 wins.

---

## 0. Purpose & how to use this document

This repo is a **frontend prototype** (React + Vite, static mock data, no backend, no real auth) of a
national platform. PRD v1.0 is written for the production build — real IAM, encryption, licensed
settlement partners, agency integrations. This file translates it into prototype terms so every session
can answer "what does the baseline ask for, what already exists, and what's next" without re-reading
both PDFs:

- §5 is the **complete requirement inventory**, using PRD v1.0's requirement IDs, with a build-status
  column and the exact files that implement each one (or don't).
- §4 tracks the **segregation-of-duties acceptance criteria**, which PRD v1.0 says are enforced in
  software, not policy.
- §8 is the **recommended build order**, kept in priority order.
- §10 mirrors PRD v1.0's **open decisions register** and notes which decisions shape prototype work.

Read §5 and §8 before starting new work. Update this file in the same commit as the work that
changes its status.

---

## 1. Naming & requirement IDs

The source pack reuses portal numbers for different domains ("Portal 2" is Regulatory Trust in the
BRD's Module 1 and Supply in Module 4). PRD v1.0 therefore names domains instead of numbering them,
and this document follows it:

| Domain | BRD module | Portal number in BRD Modules 3–8 | Requirement ID prefix |
|---|---|---|---|
| Foundation | Module 2 | — (shared layer) | `FND` |
| Demand | Module 3 | Portal 1 | `DEM` |
| Supply | Module 4 | Portal 2 | `SUP` |
| Regulatory Trust | Module 1 / TOR (capability, delivered inside Supply) | — | `REG` |
| Observatory | Module 5 | Portal 3 | `OBS` |
| Promotion | Module 6 | Portal 4 | `PRO` |
| Financing | Module 7 | Portal 5 | `FIN` |
| Disputes | Module 8 | Portal 6 | `DSP` |

**Regulatory Trust is a capability, not a portal.** Module 1 and the TOR require a requirements register,
a personalised wizard, change alerts and readiness assertions; Modules 3–8 never specify them. PRD v1.0
restores them (REG-01 to REG-06) inside Supply, consumed by Demand, and Gate G2 needs a live read-only
register by week 4.

The BRD's own IDs (FR-M2-04 and so on) are inconsistent across its drafts; PRD v1.0 replaces them.
A source-to-new ID mapping is a G1 deliverable (D-15). Older commit messages and code comments in this
repo still cite BRD section numbers (e.g. "Module 3.6") — read them through the table above.

---

## 2. Programme context

- **Programme:** Nigeria Service Export Gateway (NATEP / NCMSE). Executive sponsor FMITI; business
  owner the NATEP / NCMSE Secretariat; technical authority ADSPA.
- **Precedence** (highest first): Applicable Law → Executive Decisions → Integrated TOR → BRD Module 1
  → later modules. Applicable Law sitting on top is why regulated activity is delivered as an
  integration boundary (§3.1).
- **Single-Platform Mandate:** one identity store, actor registry, evidence vault, consent engine, audit
  chain, notification service and settlement instruction service. No domain builds its own. In this
  prototype, the app-wide `OfficerProfileProvider` and `AuditLogProvider` in [App.tsx](src/App.tsx)
  are the closest frontend analogue.
- **Release plan:** 26 weeks, gates G0–G6. G2 (week 4): public landing page, read-only requirements
  register with starter content, identity and taxonomy services. G3 (week 10): Foundation including
  settlement instruction service; Demand intake/qualification/lifecycle; Supply onboarding,
  credentialing and entitlements; Regulatory authoring. G4 (week 16): cross-domain contracts,
  matchmaking, escrow instruction in partner sandbox, Observatory pipeline and agency workspaces,
  Promotion showcase. G5 is week 22 (Module 1's timing; Modules 5–8's "week 20" is superseded).

---

## 3. Boundaries (binding on every requirement in §5)

### 3.1 Regulated activity — integration boundaries, not scope cuts
Three capabilities are regulated and cannot be performed by the platform itself. They are **in scope**,
but the platform holds the evidence and the instruction while a licensed partner holds the money or the
legal authority:

| Capability | Platform's role | Licensed party |
|---|---|---|
| Escrow and settlement (Demand, Financing) | Instruct, record, verify | CBN-licensed partner holds funds |
| Factoring, outcomes-based capital, income share (Financing) | Originate, score, record | Licensed lender books the facility |
| Binding arbitration (Disputes) | Case management, evidence custody, award registration | Accredited institution administers |

**Prototype rule:** build these as instruction/status trackers — typed instructions (hold, fund, release,
refund, lien, sweep) with a partner acknowledgement and outcome. Never a payment, lending or
tribunal feature. This is the same pattern `ConsoleEngagements` already uses for `contract-signed` /
`commenced`.

### 3.2 Retained boundaries from Module 1
PRD v1.0 assumes the Steering Committee formally amends Module 1's non-goals to permit escrow,
financing, arbitration and a public directory (D-01). Three non-goals survive the amendment because
they protect the platform's legal position:

1. **No autonomous award.** Scoring, matching and pre-qualification are decision support. No contract
   awarded, actor disqualified or grant approved without a recorded human decision at the point of effect.
2. **No direct legal contracting.** The platform records contract metadata and document hashes;
   execution happens outside it.
3. **No opaque quality rating.** Every badge and tier states what was verified, by whom and when.
   Names implying government endorsement of quality are replaced (D-06). The prototype now complies:
   exporter tiers are Registered / Identity Verified / Delivery Verified and buyer tiers are Registered /
   Registry Verified / Payment Verified (§5 SUP-06). Tier names don't yet say *by whom and when*.

Also out of scope (PRD v1.0 §2.2): historical agency data migration, modifying agencies' own systems,
the Gateway holding or moving funds, creating statutory obligations, and hardware/connectivity.

---

## 4. Segregation of duties (PRD v1.0 §3.3 — acceptance criteria)

| Action | Initiated by | Independent decision by | System guard | Prototype |
|---|---|---|---|---|
| Demand signal submission | Buyer or partner | Demand officer | Auto-promotion blocked; Pending Qualification | ✅ [SignalQueue.tsx](src/components/console/SignalQueue.tsx) — no rationale captured (DEM-04) |
| Match scoring | Matching engine | Demand officer | Output advisory; auto-transmission disabled | ✅ [ShortlistReview.tsx](src/components/console/ShortlistReview.tsx) |
| Disclosure of supplier data | Referral workflow | The data subject | 403 without active consent | ✅ [disclosurePackage.ts](src/lib/disclosurePackage.ts) |
| Outcome report | Exporter or buyer | Independent verification officer | Self-reported value Provisional; excluded from Observatory | ✅ [OutcomeLedger.tsx](src/components/console/OutcomeLedger.tsx) |
| Regulatory content change | Content drafter | Competent authority focal | Stays Draft until signed off | ⬜ No Draft state or sign-off (REG-02) |
| Actor merge | Deduplication engine | Data steward | Blocked in the 70–84% match band | ⬜ No dedup or steward queue (FND-02) |
| Audit log export | System administrator | ADSPA officer | Dual-key; unilateral extraction blocked | ⬜ [ConsoleAudit.tsx](src/pages/ConsoleAudit.tsx) has no dual-key export |
| Incentive disbursal | Rules engine pre-qualification | NATEP/NEPC administrator | Automated pass alone never disburses | ✅ [IncentiveQueue.tsx](src/components/console/IncentiveQueue.tsx) `canApprove` gate |
| Escrow release | Buyer approval or award | Licensed settlement partner | Platform instructs; partner executes | ⬜ No settlement instructions (FND-11) |
| Exporter suspension | Sanctions engine | Compliance officer or tribunal award | Automated suspension blocked without recorded decision | 🟡 [ActorTable.tsx](src/components/console/ActorTable.tsx) — manual and audit-logged, but no reason captured |

---

## 5. Requirement inventory

Status legend: ✅ Built · 🟡 Partial · ⬜ Not started · N/A Backend-only, no meaningful prototype surface

"Built" means the prototype demonstrates the requirement's workflow and decision boundary against
static data — never the production non-functional detail (Argon2id, AES-256-GCM, circuit breakers).

### 5.1 Foundation
| ID | Requirement | Status | Where in repo / gap |
|---|---|---|---|
| FND-01 | Identity and access (OIDC, MFA, context switching) | 🟡 | [officerProfile.tsx](src/lib/officerProfile.tsx) simulates three roles (desk officer, administrator, ADSPA auditor); [permissions.ts](src/lib/permissions.ts) `canMutate` puts the console in read-only mode for the auditor. No context switching between affiliated entities; none of PRD v1.0's other institutional roles (§3.2: data steward, verifier, agency analyst, arbitrator, system administrator…) |
| FND-02 | Canonical actor registry and deduplication | 🟡 | [ActorTable.tsx](src/components/console/ActorTable.tsx), [BuyerTable.tsx](src/components/console/BuyerTable.tsx), [VerificationQueue.tsx](src/components/console/VerificationQueue.tsx), [verification.ts](src/lib/verification.ts). Gaps: no UAID; no lifecycle Provisional → Pending Verification → Verified → Suspended → Archived (+ Rejected, reinstatement); no dedup with 85% block / 70–84% steward queue; separate exporter and buyer registries rather than one |
| FND-03 | Organisation delegation | ✅ | [ConsoleDelegations.tsx](src/pages/ConsoleDelegations.tsx), [DelegationRegistry.tsx](src/components/console/DelegationRegistry.tsx), [delegations.ts](src/data/delegations.ts), [delegationLookup.ts](src/lib/delegationLookup.ts) — 365-day cap surfaced as a 30-day warning |
| FND-04 | Evidence vault | ✅ | [ConsoleVault.tsx](src/pages/ConsoleVault.tsx), [EvidenceVault.tsx](src/components/console/EvidenceVault.tsx), [vaultDocuments.ts](src/data/vaultDocuments.ts) — mock SHA-256 reuse by reference, malware scan status. D-05's steward-only global hash index not represented |
| FND-05 | Consent engine | ✅ | [ConsoleConsent.tsx](src/pages/ConsoleConsent.tsx), [ConsentRegister.tsx](src/components/console/ConsentRegister.tsx), [consentGrants.ts](src/data/consentGrants.ts) — purpose, field list, revocation |
| FND-06 | Disclosure packages | ✅ | [DisclosurePackageViewer.tsx](src/components/console/DisclosurePackageViewer.tsx), [disclosurePackage.ts](src/lib/disclosurePackage.ts) — derived, voids instantly on revoke/expire (410 equivalent). TTL per purpose (D-07) not modelled |
| FND-07 | Taxonomies and master data | 🟡 | [ConsoleTaxonomies.tsx](src/pages/ConsoleTaxonomies.tsx), [TaxonomyRegistry.tsx](src/components/console/TaxonomyRegistry.tsx), [taxonomies.ts](src/data/taxonomies.ts) over [sectors.ts](src/data/sectors.ts) (UN CPC), `supplyModes`, [trustTiers.ts](src/data/trustTiers.ts), [buyerTiers.ts](src/data/buyerTiers.ts). Missing occupations, jurisdictions, currencies and ISIC Rev. 4 mapping |
| FND-08 | Workflow and SLA engine | 🟡 | Each domain has its own queue; no SLA timers on a business calendar, no 80% warning, no escalation |
| FND-09 | Notification service | 🟡 | [ConsoleSettings.tsx](src/pages/ConsoleSettings.tsx) has per-user preferences only; header bell is decorative; no in-app inbox, quiet hours or delivery tracking |
| FND-10 | API gateway, event bus, tamper-evident audit | 🟡 | [auditLog.tsx](src/lib/auditLog.tsx), [ConsoleAudit.tsx](src/pages/ConsoleAudit.tsx) — session-scoped log. No hash chain, no pre/post-state, no dual-key export. Gateway and event bus N/A |
| FND-11 | Settlement instruction service | ⬜ | Nothing yet. Needed by DEM-10, FIN-01/02, DSP-01/02/05 |

### 5.2 Demand
| ID | Requirement | Status | Where in repo / gap |
|---|---|---|---|
| DEM-01 | Buyer onboarding and just-in-time verification | ✅ | [ConsoleBuyers.tsx](src/pages/ConsoleBuyers.tsx), [BuyerTable.tsx](src/components/console/BuyerTable.tsx), [buyers.ts](src/data/buyers.ts), [buyerTiers.ts](src/data/buyerTiers.ts). Buyer tiers renamed to what was verified: Registered / Registry Verified / Payment Verified. Buyer-facing side in [BuyerOverview.tsx](src/pages/BuyerOverview.tsx) with [buyerWorkspace.ts](src/lib/buyerWorkspace.ts): buyers draft freely and are asked to verify only when they submit a request for qualification |
| DEM-02 | Opportunity and RFP lifecycle | 🟡 | [opportunities.ts](src/data/opportunities.ts) uses `qualified / matched / consented` only. Buyers create requests with budget range and target completion in [BuyerRequests.tsx](src/pages/BuyerRequests.tsx) and see a derived status (Draft → Officer review → Published → Shortlist → Introductions → In delivery). Officer qualify/reject reaches the buyer as Published / Not qualified. Still missing: the audited state machine in data (Awarded / Fulfilled / Closed), and deadline expiry |
| DEM-03 | Signal intake | 🟡 | [SignalQueue.tsx](src/components/console/SignalQueue.tsx), [signals.ts](src/data/signals.ts) record a route, but the seeded routes don't map to PRD v1.0's four (public form, assisted officer capture, external API, secure batch upload). Requests buyers submit from their workspace now arrive in the queue on a "Buyer workspace request" route via [gatewayExchange.tsx](src/lib/gatewayExchange.tsx), and the officer's decision flows back to the buyer |
| DEM-04 | Qualification | 🟡 | Qualify/reject is audit-logged to a named officer. No rationale, checklist, dedup against open signals or risk-tier escalation |
| DEM-05 | Opportunity Criteria Package | 🟡 | Criteria typed mandatory/preferred/negotiable/informational in [opportunities.ts](src/data/opportunities.ts); buyers author typed criteria (at least one mandatory) in the request form. No versioning or impact analysis |
| DEM-06 | Explainable matchmaking | 🟡 | [ShortlistReview.tsx](src/components/console/ShortlistReview.tsx), [shortlists.ts](src/data/shortlists.ts) — factor weights already match PRD v1.0 (30/30/20/20). Missing plain-language exclusion reasons, bias checks, and reason-required manual adjustment. D-09 multiplier not modelled |
| DEM-07 | Entitlement-gated bidding | ⬜ | Public marketplace gates detail *visibility* by tier ([accessControl.ts](src/lib/accessControl.ts)); nothing gates *response rights* or explains how to unlock |
| DEM-08 | Human shortlisting | ✅ | [ShortlistReview.tsx](src/components/console/ShortlistReview.tsx) — nothing transmits without officer approval. Buyers see approved shortlists with the factor breakdown in [BuyerShortlists.tsx](src/pages/BuyerShortlists.tsx) and record their own choice (audit-logged); the platform never selects |
| DEM-09 | Consented disclosure and engagement | 🟡 | [ConsoleEngagements.tsx](src/pages/ConsoleEngagements.tsx), [EngagementTracker.tsx](src/components/console/EngagementTracker.tsx), [engagementStage.ts](src/lib/engagementStage.ts). Buyer side: shortlisted exporters stay anonymous until an active consent grant exists; buyers can request an introduction; revoked or expired consent removes profile access in [BuyerEngagements.tsx](src/pages/BuyerEngagements.tsx). Introduction requests reach the exporter in [WorkspaceIntroductions.tsx](src/pages/WorkspaceIntroductions.tsx), which states exactly what will be shared; accepting discloses identity to the buyer, and withdrawing removes it straight away. Workspace consents are not yet shown in the console's consent register. No proposal lifecycle |
| DEM-10 | Escrow instruction and milestones | ⬜ | Engagement stages stop at `commenced`. No milestone schedule, funding instruction, funding-confirmation gate or release instruction |
| DEM-11 | Conversion and outcome verification | ✅ | [ConsoleOutcomes.tsx](src/pages/ConsoleOutcomes.tsx), [OutcomeLedger.tsx](src/components/console/OutcomeLedger.tsx), [outcomes.ts](src/data/outcomes.ts), [outcomeVerification.ts](src/lib/outcomeVerification.ts) — Provisional until independently verified, same-engagement duplicates flagged. Buyer delivery confirmations from the workspace join the console ledger as provisional buyer self-reports, so the existing single-count checks apply to them. Partner attribution lineage not modelled |

### 5.3 Supply
| ID | Requirement | Status | Where in repo / gap |
|---|---|---|---|
| SUP-01 | Onboarding and capability profiling | 🟡 | [ConsoleExporters.tsx](src/pages/ConsoleExporters.tsx), [ActorTable.tsx](src/components/console/ActorTable.tsx), [actors.ts](src/data/actors.ts). Individual track added (D-06): `track: 'firm' \| 'individual'`, `NT-I26-…` identifiers, three individual professionals in the seed data. No capability portfolio bound to UN CPC / ISIC (one primary `sectorCode` only) |
| SUP-02 | Capacity and freshness | ⬜ | No quantified capacity or stale-declaration exclusion |
| SUP-03 | Supply pools | ⬜ | — |
| SUP-04 | Regulatory credentialing | ✅ | [ConsoleCertifications.tsx](src/pages/ConsoleCertifications.tsx), [CertificationRegistry.tsx](src/components/console/CertificationRegistry.tsx), [certification.ts](src/lib/certification.ts) — issue/reject, 30-day renewal warning |
| SUP-05 | Readiness diagnostics and tiering | ✅ | [ConsoleReadiness.tsx](src/pages/ConsoleReadiness.tsx), [ReadinessQueue.tsx](src/components/console/ReadinessQueue.tsx), [readinessScore.ts](src/lib/readinessScore.ts) — weights (25/20/20/20/15) and bands (under 50 / 50–79 / 80+) already match PRD v1.0. No recalculation-on-change or downgrade notice |
| SUP-06 | Entitlements | 🟡 | One ladder in [trustTiers.ts](src/data/trustTiers.ts), derived by [exporterTier.ts](src/lib/exporterTier.ts): highest tier whose diagnostic floor *and* evidence (firm CAC + TIN, individual NIN + professional credential, plus verified delivery history for the top tier) are met, with an exact next action. Profile completion % removed. Shown to officers in [ConsoleTrustBadging.tsx](src/pages/ConsoleTrustBadging.tsx) and to exporters in [WorkspaceStanding.tsx](src/pages/WorkspaceStanding.tsx). Gaps: only opportunity visibility is gated (marketplace); bid ceilings aren't enforced; no downgrade on credential expiry |
| SUP-07 | Intervention mapping | ⬜ | — |
| SUP-08 | Incentives and trade facilitation | ✅ | [ConsoleIncentives.tsx](src/pages/ConsoleIncentives.tsx), [IncentiveQueue.tsx](src/components/console/IncentiveQueue.tsx), [incentives.ts](src/data/incentives.ts) — pre-qualification then administrator sign-off. D-10 (any-channel evidence, single base currency) not modelled |

### 5.4 Regulatory Trust (delivered within Supply) — G2 critical
| ID | Requirement | Status | Where in repo / gap |
|---|---|---|---|
| REG-01 | Requirements register | 🟡 | [ConsoleCompliance.tsx](src/pages/ConsoleCompliance.tsx), [ComplianceRegister.tsx](src/components/console/ComplianceRegister.tsx), [regulations.ts](src/data/regulations.ts) — the five categories match. Records now carry plain-language summary, official channel, applicability (track / mode / market, plus sector), evidence expected, source citation, effective and next-review dates. The console register doesn't display or edit the new fields yet; seed content is prototype text, not validated |
| REG-02 | Institutional authoring and validation | ⬜ | Statuses are `current / under-review / superseded`. No Draft, no per-agency queue, no competent-authority sign-off; the officer can mark content reviewed unilaterally |
| REG-03 | Wizard and pathway engine | 🟡 | [WorkspaceRequirements.tsx](src/pages/WorkspaceRequirements.tsx), [requirementsPathway.ts](src/lib/requirementsPathway.ts) — four-question wizard (track, sector, mode, market) producing a pathway ordered statutory → fiscal → professional → buyer standard → FX. Only `current` requirements are shown; applicable under-review items are counted, not shown. Marks requirements already met by verified evidence. No save/resume across sessions or change alerts |
| REG-04 | Exporter readiness workspace | 🟡 | [WorkspaceReadiness.tsx](src/pages/WorkspaceReadiness.tsx), [exporterSession.tsx](src/lib/exporterSession.tsx) — private by default with an explicit, revocable "share snapshot" switch; evidence status from the vault; bank & FX settlement checklist; private diagnostic draft that previews the tier it would support and is submitted for officer review. Sharing and submitting are audit-logged. The console doesn't yet show shared snapshots |
| REG-05 | Change alert and invalidation | 🟡 | [ComplianceRegister.tsx](src/components/console/ComplianceRegister.tsx) computes an "Affects" count against live opportunities. No review tasks, notifications, or flagging of dependent assertions for revalidation |
| REG-06 | Readiness assertions | 🟡 | [ReadinessQueue.tsx](src/components/console/ReadinessQueue.tsx) issues/withholds an assertion, but the assertion doesn't state what was verified, by which authority, when, scope limits, expiry or what isn't covered |

### 5.5 Observatory
| ID | Requirement | Status | Where in repo / gap |
|---|---|---|---|
| OBS-01 | Indicator pipeline | 🟡 | Static data by design (§9, P-2). Provisional-value exclusion lives in Outcomes, not surfaced in the Observatory |
| OBS-02 | Multi-dimensional aggregation | 🟡 | [ConsoleObservatory.tsx](src/pages/ConsoleObservatory.tsx), [ShareBarList.tsx](src/components/console/ShareBarList.tsx), [observatory.ts](src/data/observatory.ts) — fixed breakdowns; no dimension selection (mode, CPC, corridor, tier, period) |
| OBS-03 | Reconciliation and single count | 🟡 | [ReconciliationPanel.tsx](src/components/console/ReconciliationPanel.tsx) covers NEPC, NEXIM, CBN, FIRS. Missing NBS and FMITI; variance per source not shown |
| OBS-04 | Agency workspaces | ⬜ | Scoped read-only views for CBN, FIRS, NEPC, NEXIM, NBS, FMITI |
| OBS-05 | Anomaly detection | ⬜ | Declared vs verified vs filed discrepancies raising cases — a flag is a case, never a sanction |
| OBS-06 | Incentive audit and anti-leakage | ✅ | [IncentiveAuditLedger.tsx](src/components/console/IncentiveAuditLedger.tsx), [incentiveAudit.ts](src/lib/incentiveAudit.ts) — independent re-check of all conditions; `inc-07` seed shows a case the shallower check misses |
| OBS-07 | Policy simulation | ✅ | [PolicySimulator.tsx](src/components/console/PolicySimulator.tsx), [policySimulation.ts](src/lib/policySimulation.ts), [policyScenarios.ts](src/data/policyScenarios.ts) — isolated sandbox, immutable 12/24/36-month scenario reports |
| OBS-08 | Inclusion and bottleneck analytics | 🟡 | Regional and inclusion breakdowns exist; no pipeline funnel showing where actors are lost |
| OBS-09 | Disclosure control | ⬜ | No small-population suppression or dominance check |
| OBS-10 | Statistical integrity | ⬜ | Figures aren't labelled as platform-observed, reconciled national, or projection |

### 5.6 Promotion
| ID | Requirement | Status | Notes |
|---|---|---|---|
| PRO-01 | Investor concierge and landing pad | ⬜ | Per-agency clearance status (NIPC, NEPZA, FIRS) in one view; agency failures surfaced, not hidden |
| PRO-02 | Trade missions and delegations | ⬜ | Mission creation, delegate matching against verified supply, B2B schedules |
| PRO-03 | MOU and commitment tracking | ⬜ | — |
| PRO-04 | Ecosystem showcase | ⬜ | Opt-in, per-field public listing (D-13). The existing public [Marketplace.tsx](src/pages/Marketplace.tsx) lists *opportunities*, not suppliers, so it isn't this |

### 5.7 Financing (originate-score-record; a licensed lender books every facility)
| ID | Requirement | Status | Notes |
|---|---|---|---|
| FIN-01 | Factoring origination | ⬜ | Needs DEM-10 (confirmed hold) and FND-11 (lien instruction) first |
| FIN-02 | Repayment sweep | ⬜ | Instruction with confirmed outcome; partial/failed sweeps raise a case |
| FIN-03 | Outcomes-based capital | ⬜ | — |
| FIN-04 | Placement verification | ⬜ | — |
| FIN-05 | Capital provider gateway | ⬜ | Read-only; exporter-level data only under active consent |
| FIN-06 | Portfolio risk engine | ⬜ | Scores inform a lender's decision, never an automated credit decision |

### 5.8 Disputes (the platform never constitutes the tribunal)
| ID | Requirement | Status | Notes |
|---|---|---|---|
| DSP-01 | Case filing and hold | ⬜ | Needs FND-11 (hold instruction) |
| DSP-02 | Structured negotiation | ⬜ | Assisted proposals advisory and labelled |
| DSP-03 | Escalation and arbitrator appointment | ⬜ | Records appointment under institution rules; no random-rotation assignment (D-16) |
| DSP-04 | Evidence custody | ⬜ | Reuses FND-04 with access logging |
| DSP-05 | Award registration and execution | ⬜ | Immutable once registered; execution as release/refund instruction |
| DSP-06 | Sanctions and integrity register | ⬜ | Effects on standing require a recorded compliance decision; ties into §4's suspension row |

### Public-facing surface
[Landing.tsx](src/pages/Landing.tsx) and [Marketplace.tsx](src/pages/Marketplace.tsx) are the public
side. G2 requires the public landing page; the Marketplace's tier-gated opportunity browsing touches
DEM-07's intent. PRD v1.0 §7.5 requires WCAG 2.1 AA and mobile-first for public and exporter-facing
interfaces — the officer console is exempt from mobile-first but the public pages are not.

---

## 6. Cross-domain data contracts (PRD v1.0 §6)

No domain reads another domain's records directly. In a frontend prototype, the practical analogue is a
typed derivation function (like `disclosurePackage.ts`) that one page produces and another consumes,
returning an explicit typed failure instead of partial data.

| Contract | Producer | Prototype |
|---|---|---|
| Opportunity Criteria Package | Demand | 🟡 criteria in `opportunities.ts`, unversioned |
| Regulatory Requirement Link | Regulatory | ⬜ |
| Readiness Assertion | Regulatory | 🟡 issue/withhold only (REG-06) |
| Potential Fit Evaluation | Supply | 🟡 `shortlists.ts` factor breakdown, no exclusions |
| Capability Package | Supply | ⬜ |
| Consent Request / Grant | Foundation | ✅ `consentGrants.ts` |
| Shared Disclosure Package | Foundation | ✅ `disclosurePackage.ts` |
| Outcome / Attribution Event | Demand, verifier | 🟡 no attribution lineage |
| Settlement Instruction / Outcome | Foundation (FND-11) | ⬜ |
| Entitlement State | Supply | ⬜ |
| Sanction Notice | Disputes | ⬜ |

---

## 7. What this prototype is and isn't

**Is:** a static-data, no-backend UI prototype of the officer-facing Console plus a public
Landing/Marketplace, demonstrating the workflows, data relationships and human decision points PRD v1.0
specifies — verification queues, consent-gated disclosure, audit trails, sign-off gates, and (once built)
settlement and arbitration as instruction trackers.

**Isn't:** a working OIDC/MFA system, a real vault (files aren't stored or scanned), a real settlement,
lending or arbitration engine (those are licensed partners even in production), a live data pipeline into
NEPC/NEXIM/CBN/FIRS/NBS/FMITI, or an implementation of PRD v1.0 §7's non-functional targets
(uptime, latency, encryption, NDPA statutory clocks).

---

## 8. Recommended build order

Ordered by gate criticality in PRD v1.0 and by what unblocks later work. Earlier completed work is in
the change log (§11).

**Priority 1 — correct what now conflicts with the baseline**
1. ~~**Single tier ladder and honest tier names (D-06, SUP-05/06, §3.2).**~~ Done — see §11. Remaining:
   enforce bid ceilings, downgrade on credential expiry, and say by whom/when on each badge.
2. **Regulatory authoring with sign-off (REG-01, REG-02).** Add Draft status and the missing record
   fields; content stays Draft until a competent-authority focal signs off; supersede, never delete.
   Closes the §4 "regulatory content change" row. This is G2-critical.

**Priority 2 — Regulatory Trust capability set (G2/G3)**
3. **Change alerts and assertion revalidation (REG-05, REG-06).** Publishing a new requirement version
   raises review tasks and flags dependent readiness assertions for revalidation; assertions state what
   was verified, by whom, when, scope and expiry.
4. ~~**Wizard and pathway (REG-03).**~~ First version done in the exporter workspace (§11). Next: show
   and edit the new REG-01 fields in the console register, and surface shared readiness snapshots to officers.

**Priority 3 — G3 Foundation and Demand gaps**
5. **Settlement instruction service (FND-11).** A shared instruction ledger (hold, fund, release, refund,
   lien, sweep) with partner acknowledgement and outcome, and a blocked state when unacknowledged.
   Prerequisite for DEM-10, Financing and Disputes.
6. **Opportunity lifecycle and escrow milestones (DEM-02, DEM-10).** The full state machine, then
   milestone schedules whose work-commencement is gated on the funding-confirmation event.
7. **Actor lifecycle and deduplication (FND-02).** Five-state lifecycle, and a data-steward queue showing
   near-duplicates side by side in the 70–84% band. Closes the §4 "actor merge" row.
8. **Qualification rationale and suspension reasons (DEM-04, §4).** Required recorded rationale on
   reject/qualify and on suspension/reinstatement.

**Priority 4 — G4 Observatory and Promotion**
9. **Observatory integrity (OBS-03/04/09/10).** Add NBS and FMITI to reconciliation with per-source
   variance, basis labels on every figure, small-population suppression, then scoped agency workspaces.
10. **Promotion (PRO-01 to PRO-04).** Investor landing pad with per-agency clearance, trade missions,
    MOU tracking, opt-in ecosystem showcase.

**Priority 5 — G5 partner-dependent domains** (depend on items 5–6)
11. **Financing (FIN-01 to FIN-06)** as originate-score-record trackers.
12. **Disputes (DSP-01 to DSP-06)** as case management with hold/release instructions and an
    award/sanctions register.

**Supporting, schedule as capacity allows:** SLA timers on queues (FND-08), in-app notification inbox
(FND-09), hash-chained audit with dual-key export (FND-10), capacity/freshness and supply pools
(SUP-02/03), intervention mapping (SUP-07), NDPA subject-access and retention views (§7.3).

---

## 9. Scope decisions

### 9.1 Superseded by PRD v1.0 (2026-09-17)
The four decisions recorded earlier the same day are replaced:

1. ~~Portals 4–6 (Promotion, Disputes) out of scope~~ → **In scope.** PRD v1.0 covers the full BRD.
   Disputes is delivered as case management and instruction tracking; the accredited institution
   administers arbitration.
2. ~~Module 7 (Financing) descoped outright~~ → **In scope** as originate-score-record. The earlier
   objection (conflict with Module 1's Non-Goal 1) is resolved by PRD v1.0's D-01 amendment plus the
   licensed-lender boundary (§3.1).
3. **Simulated roles — still valid, now under-scoped.** The three-role switch stays. PRD v1.0 §3.2 names
   more institutional roles, and §4's dual-key and steward rows need at least a data steward and a system
   administrator to be demonstrable.
4. ~~Observatory "real-time" is a permanent non-goal~~ → **Production requirement, prototype constraint.**
   OBS-01 is real-time in production. The prototype keeps static data (P-2 below), which stays honest
   only once OBS-10 labelling is built.

### 9.2 Current prototype decisions
- **P-1 — Build partner-dependent domains as trackers.** Escrow, factoring and arbitration appear as
  typed instructions and statuses with a partner acknowledgement, never as money movement or a tribunal.
- **P-2 — Static data is permanent.** No live agency feeds. Every Observatory figure must carry an
  OBS-10 basis label once that work lands.
- **P-3 — Resolved: separate workspaces for exporters (`/workspace`) and buyers (`/buyer`).** Both share
  one shell ([WorkspaceShell.tsx](src/components/workspace/WorkspaceShell.tsx)) and are linked from the
  public site's "Sign in" menu, footer and marketplace. The officer console stays unlinked. Mobile-first and built toward WCAG 2.1
  AA (§7.5): skip link, labelled landmarks and controls, 44px targets, focus moved to each wizard step,
  body text at gray-600 or darker. A "viewing as" switch stands in for sign-in, so any seeded exporter can
  be inspected.

---

## 10. Open decisions register (PRD v1.0 §10)

Programme decisions; this prototype can't close them, but several shape how it's built. "Prototype
default" is what to assume until the programme decides.

| ID | Decision | Owner / needed by | Prototype default |
|---|---|---|---|
| D-01 | Amend Module 1 non-goals to permit escrow, financing, arbitration, public directory | Steering Committee / G1 | Assume amended (§3.2) |
| D-02 | Licensed partner selection | Ministry / week 6 | Generic "settlement partner" / "lender of record" labels |
| D-03 | Demand volume and regional inclusion targets | Secretariat / G1 | Show as unset, don't invent targets |
| D-04 | Public identifier format | ADSPA / G1 | Option A (`NT-I26-8942A`) with entity-type character per actor type; current `NT-B26-94821` is close |
| D-05 | Cross-tenant dedup exposure | ADSPA / G2 | Dedup within actor scope; global index steward-only |
| D-06 | Single tier ladder, individual track, badge naming | Secretariat / TWG / G3 | Built: diagnostic + evidence ladder, individual track, names state what was verified. Thresholds are data in `trustTiers.ts` |
| D-07 | Disclosure package TTL per purpose | ADSPA / G3 | 7 days for shortlist review, 15 minutes for one-time admin views |
| D-08 | Canonical event envelope | ADSPA / G1 | N/A (no event bus); use `eventId`, `eventType`, `eventTimestamp`, `actor`, `data` naming if simulated |
| D-09 | Readiness multiplier in match scoring | Demand TWG / G3 | Fold into verification-depth factor |
| D-10 | Incentive eligibility basis and FX rule | Secretariat / NEPC / G3 | Any-channel verified evidence; single base currency at stored CBN rate |
| D-11 | Register starter content for G2 | Secretariat / week 3 | Seeded `regulations.ts` stands in |
| D-12 | Inter-agency reconciliation rules | Secretariat + agencies / G3 | Show variance, don't claim a signed rule set |
| D-13 | Public listing consent model | ADSPA / Secretariat / G4 | Opt-in per supplier and per field, revocable |
| D-14 | Lender of record, consumer protection | Ministry / counsel / G4 | Terms disclosed before acceptance; no auto cross-default |
| D-15 | Requirement ID mapping | Delivery team / G1 | This file uses PRD v1.0 IDs (§1) |
| D-16 | Arbitration agreement, seat, institution | Counsel / G4 | Named institution placeholder; party autonomy over appointment |
| D-17 | Data residency | ADSPA / G1 | N/A to a frontend prototype |
| D-18 | Language coverage | Secretariat / G1 | English; avoid hardcoding strings where cheap |

---

## 11. Change log

- **2026-09-17** — Initial PRD drafted from a full-text extraction of the 162-page BRD/FRD (all 8
  modules, reconciled to the most complete draft of each), cross-referenced against repo state as of
  commit `0d83093` (Engagements module).
- **2026-09-17** — Added `ConsoleOutcomes` (Outcome / Attribution Event package): self-reported
  export value starts Provisional, requires independent officer verification, and same-engagement
  duplicate self-reports (exporter + buyer both reporting) are flagged so only one is ever counted.
- **2026-09-17** — Added the Disclosure Package viewer (Module 2.6): a derived, on-demand package
  view (not a stored record) shown from `ConsoleConsent` and `ConsoleEngagements`, so revoking the
  underlying consent grant voids it instantly with no separate cleanup.
- **2026-09-17** — Added `ConsoleCertifications` (Module 4.2): filters the Evidence Vault to
  professional/sectoral credentials (COREN, ISO 27001, etc.), separate from `ConsoleCompliance`'s
  rules-register scope, with issue/reject actions and 30-day renewal-warning reminders.
- **2026-09-17** — Added `ConsoleMarketIntelligence` (Module 3.5): a destination-market brief
  library indexed by country/sector/WTO-GATS mode, with a draft→under-review→published authoring
  workflow for NATEP Administrators.
- **2026-09-17** — Added `ConsoleTaxonomies` (Module 2.7): a read-only registry of the platform's
  controlled vocabularies (sectors, WTO/GATS modes, trust tiers) with version and deprecation
  metadata, deliberately excluded from `ConsoleSettings` per that page's personal-settings-only scope.
- **2026-09-17** — Resolved the four open scope questions: Portals 4/6 and Module 7 out of scope,
  simulated multi-role login in scope, Observatory "real-time" a permanent non-goal. *(Superseded later
  the same day — see the PRD v1.0 entry below and §9.1.)*
- **2026-09-17** — Added `ConsoleDelegations` (Module 2.3): models each exporter/buyer account as
  an organization with named delegates, surfaces the 365-day delegation cap as a 30-day expiry
  warning, and keeps revocation an officer-oversight action mirroring `ConsentRegister`.
- **2026-09-17** — Extended `ConsoleObservatory` with the Policy Simulation sandbox (Module 5.3)
  and the Incentive Audit & Anti-Leakage ledger (Module 5.4). The audit ledger re-derives all three
  conditions independently of `ConsoleIncentives`'s `autoPreQualified` flag; `inc-07` in
  `incentives.ts` demonstrates a case the shallower check passes but the deeper audit rejects.
- **2026-09-17** — Added the simulated `adspa-auditor` role to `officerProfile.tsx`, with a shared
  `canMutate(role)` check in `permissions.ts` gating every mutating action across the console, a shared
  `AuditOnlyBadge`, and a global "Read-only audit mode" banner in `ConsoleLayout`.
- **2026-09-17** — Added `ConsoleTrustBadging` (Module 3.6): exporter and buyer tier ladders side by
  side with unlocked capabilities and next-step prompts (added `nextStep` to `buyerTiers.ts`), plus a
  per-exporter completion breakdown. Read-only; no tier-gating logic.
- **2026-09-17** — **Rebaselined on `NATEP Gateway PRD v1.0.pdf`.** Adopted its domain naming and
  requirement IDs (FND/DEM/SUP/REG/OBS/PRO/FIN/DSP) and re-mapped every built module onto them
  (§5). Reversed the earlier scope decisions: Promotion, Financing and Disputes are in scope as
  instruction/record trackers behind licensed-partner boundaries (§3.1, §9.1). Restored Regulatory Trust
  (REG-01 to REG-06) as a G2-critical capability. Added the segregation-of-duties coverage table (§4),
  cross-domain contract coverage (§6) and the open decisions register with prototype defaults (§10).
  Flagged that the current tier ladders violate PRD v1.0's "no opaque quality rating" boundary and
  D-06's single-ladder default. New build order (§8) leads with the tier ladder fix and regulatory
  authoring sign-off.
- **2026-09-17** — **Single tier ladder and exporter workspace.** Replaced the profile-completion ladder
  with one ladder driven by the readiness diagnostic plus verified evidence (D-06): Registered → Identity
  Verified (50+, CAC + TIN or NIN + professional credential) → Delivery Verified (80+, plus verified
  delivery history). Tiers are derived in `exporterTier.ts`, never stored. Added the individual track
  and three individual exporters. Renamed buyer tiers to Registered / Registry Verified / Payment Verified
  and readiness band labels to "Band 80+" etc. Old tier codes kept as deprecated in the taxonomy registry
  (v2.0). Readiness submissions now read scores from each exporter's diagnostic so the console and
  workspace can't disagree. Added REG-01 record fields and the `/workspace` exporter workspace (My
  standing, Requirements wizard, private Readiness), resolving P-3.
- **2026-09-17** — **Buyer workspace and public sign-in links.** Added `/buyer` (Overview, Requests,
  Shortlists, Engagements) on a shared `WorkspaceShell`: buyer tier and next step with just-in-time
  verification (DEM-01), request authoring with budget, target date and typed criteria, gated on Registry
  Verified at submission (DEM-02/05), officer-approved shortlists with explainable factors and
  consent-gated identity plus a buyer-recorded choice (DEM-08/09), and delivery confirmation that stays
  provisional (DEM-11). Opportunities now carry `buyerId`. The public site links both workspaces from a
  "Sign in" menu, the footer and the marketplace ("Post a request"; locked details point to the exporter
  workspace).
- **2026-09-17** — **Connected the workspaces to each other and the console.** Added an app-wide
  `GatewayExchangeProvider` holding only what one party deliberately sends another; each workspace's
  private state stays private. Buyer requests reach the console signal queue and the officer's decision
  returns to the buyer (DEM-02/03). Buyer introduction requests reach a new exporter Introductions tab,
  where accepting discloses identity and withdrawing revokes it (DEM-09, FND-05). Buyer delivery
  confirmations join the console Outcomes ledger under the existing duplicate checks (DEM-11).
