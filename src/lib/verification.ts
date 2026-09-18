/**
 * `none` — no manual action needed. `pending` — the hybrid JIT verification pipeline
 * (open registry lookup, then AI document fallback) hasn't resolved automatically and
 * is queued for 1-click officer review. `flagged` — both automated routes failed
 * outright and the officer decision blocks or clears the account.
 *
 * Shared between the exporter (supply-side) and buyer (demand-side) registries — both
 * go through the same hybrid JIT verification pipeline per the BRD, just against
 * different registries (CAC/TIN vs. GLEIF/Companies House/VIES).
 */
export type VerificationQueueStatus = 'none' | 'pending' | 'flagged';
