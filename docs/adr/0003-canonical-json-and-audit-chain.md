# ADR-0003: Canonical JSON and the audit chain

- **Status:** Proposed — approver ADSPA
- **Date:** 2026-09-18
- **Baseline:** NATEP Gateway Solution Architecture v1.0 draft, §4.8 (FND-10), AD-07

## Context

Every audit entry stores a hash of the state before an action and the state after it, and a digest
chained to the previous entry. The table is append-only: its role holds INSERT and SELECT, and
UPDATE, DELETE and TRUNCATE are revoked.

That makes the hashing rule irreversible. If the way state is serialised changes after entries
exist, every earlier digest becomes unverifiable, and the table cannot be rewritten to fix it —
which is the point of the table. So the rule is settled before the first entry is written.

## Decision

**Serialisation.** State is hashed as JSON Canonicalisation Scheme (RFC 8785): object keys sorted
by UTF-16 code unit, no insignificant whitespace, numbers in the shortest round-tripping form,
strings escaped minimally. JCS is chosen over a hand-rolled sort because it is specified, has
implementations, and settles number and Unicode edge cases that a local rule would get wrong.

**What is hashed.** The owning service's representation of the record after excluding:

- `updated_at`, `version` and other fields that change on every write without changing meaning;
- ciphertext columns — the **plaintext** of an encrypted identifier is hashed, so that re-encrypting
  under a rotated key does not break the chain;
- computed projections that are derivable from what is already included.

Each service declares its excluded fields in one place beside its entity, and a test asserts that
the exclusion list has not changed without an ADR.

**Digest.** `digest = SHA-256( prev_digest || id || occurred_at || actor_uaid || action ||
target_type || target_id || pre_state_hash || post_state_hash )`, with fields joined by a byte
that cannot appear in them. The genesis entry uses 32 zero bytes as `prev_digest`.

**Where it is computed.** In the database, in a `BEFORE INSERT` trigger holding a transaction-level
advisory lock on the table. The application supplies the state hashes; it cannot choose its
predecessor, and concurrent inserts cannot interleave into a broken chain.

**One writer.** The audit module appends entries by consuming events, which carry `preStateHash`
and `postStateHash`. No other service writes to the table, and no other role has INSERT on it.

**Verification.** `audit.verify_chain(from_seq, to_seq)` ships in the same migration as the table.
A scheduled job verifies the tail and writes the chain head to an object-locked bucket every ten
minutes, so tampering is detectable against an anchor the database administrator cannot alter.

## Consequences

Changing the serialisation, the excluded fields or the digest inputs later requires a new ADR and
a chain break record: the old chain is closed with a final anchor, and a new chain starts with its
genesis entry referencing it. Verification then spans two chains, which is legible; silently
rehashing is not possible and must not be attempted.

Hashing plaintext identifiers means the verifier needs decryption access to check those entries.
The alternative — hashing ciphertext — would break the chain on every key rotation, which is worse.
The verifier therefore runs with its own key access and is audited like any other reader.
