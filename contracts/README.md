Written for: engineers building the Gateway services and the web app.

# Contracts

The specification is the source. Server stubs, client types and mock servers are generated from
what is in this folder — so a change here is a change to every service and to the web app, and the
build says so.

```
contracts/
  openapi/
    domain/demand.yaml           signals, qualification, opportunities, shortlists
    foundation/consent.yaml      consent requests, grants, evaluation, disclosure packages
    shared/problem.yaml          the RFC 9457 document and the registry of problem types
  events/
    envelope.schema.json         the one envelope every event uses
    field-catalogue.json         every field consent can be asked about, with its classification
    *.v1.json                    one schema per event type
  scripts/lint-events.mjs        fails the build if an event would carry personal data
```

## Rules these files encode

**Events carry identifiers, never payloads.** A consumer that needs a name or a credential fetches
it through the gateway, where its own authorisation and the subject's consent are checked. The
lint enforces this from the field catalogue's classifications, so classifying a new field as
personal protects the bus without anyone remembering to update a word list.

**Versions are pinned, never rewritten.** Qualifying a signal copies the requirement versions in
force onto the case. Publishing a new version flags the cases pinned to the old one; it does not
change them.

**Approving a shortlist discloses nothing.** It raises a consent request per exporter. Only a
grant releases anything, and a package is built by copying consented fields into an empty object —
a withheld field is absent rather than null, so the shape itself reveals nothing.

**Errors are typed.** Every failure is a problem document with a stable `type` a client can branch
on. The registry in `shared/problem.yaml` is the whole set; a service may not invent one without
adding it there. The distinctions matter: 403 revoked and 410 expired say different things, and so
do 409 superseded and 409 already-decided.

**Every command is idempotent.** Mutating routes require an `Idempotency-Key`; repeating a request
with the same key returns the first response rather than acting twice.

## Commands

```
npm run lint:events        # personal data on the bus — exits non-zero with the offending paths
npm run lint:openapi       # Redocly validation of every spec
npm run mock               # Prism mock servers, one per spec, before any service exists
```

## Changing a contract

1. Change the spec, not the implementation.
2. Run both lints.
3. Regenerate types. The web app and the services fail to compile where they disagree — that is
   the point of one repository.
4. A breaking event change is a new `.v2` published alongside `.v1` until consumers migrate. A
   breaking API change is a new path version.
