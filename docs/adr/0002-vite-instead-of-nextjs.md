# ADR-0002: Keep the Vite application for the pilot

- **Status:** Proposed — approver ADSPA
- **Date:** 2026-09-18
- **Baseline:** NATEP Gateway Solution Architecture v1.0 draft, §10 technology stack

## Context

The architecture specifies Next.js as an installable PWA, for three stated reasons: server
rendering for the public register and showcase, one codebase for every portal, and offline-safe
forms through a service worker and local queue.

The working prototype is a Vite React SPA with the public site, both workspaces and the officer
console already built, verified across desktop and phone. Porting it to Next.js before connecting
a backend would pause feature work to gain rendering behaviour that only two routes need today.

## Decision

Keep Vite for the pilot. Connect it to the API as planned.

To keep the Next.js option cheap, two constraints hold from now on:

1. **The public routes stay data-thin and route-isolated.** The landing page, the requirements
   register and the marketplace read only published, non-personal projections, and import nothing
   from the workspace or console trees. They can be lifted into a Next app without dragging
   authenticated code with them.
2. **No router-specific logic leaks into pages.** Data fetching goes through the generated client
   and query hooks, so a page moves between routers by changing its imports.

## Triggers for revisiting

- The public register or showcase needs indexing by search engines, or first-paint on a slow
  connection becomes a stated requirement.
- Offline-safe forms move from desirable to required — resumable upload (the tus protocol) is
  independent of this and works either way.
- The PWA install requirement is tested at a gate.

## Consequences

The public register and showcase render client-side until this is revisited, which costs first
paint and search indexing on those routes only. Everything behind sign-in is unaffected: an
authenticated console has no use for server rendering.

If the trigger fires, the migration is a new Next app consuming the same contracts package, taking
the public routes first and the authenticated surfaces later or never.
