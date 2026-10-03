# Single Runtime Target Boundaries

SALUS parity is implemented as one self-contained TypeScript sibling runtime with strict inward dependency direction and singleton client/server composition roots.

## What Happened

In SALUS Pramana task t4, active and archived capabilities had overlapping UI routes and separate server implementations. The target design resolved them into one package, 14 unique lazy paths, one Express root, shared environment-neutral contracts, pure clinical modules, and repository ports with isolated adapters.

## Takeaway

- Keep exactly one React root, TanStack router, Query client, app-state provider, and Express composition root.
- Use dependency direction `client/server/ingestion -> application -> domain + persistence contracts`; adapters implement inward-facing ports.
- Merge overlapping archived dashboard behavior additively at `/`; never add a second shell or router.
- Keep exact persistence mechanics with the DBA, but bind all consumers to one startup-selected port set with no operational fallback.
- Enumerate source method/path pairs directly when summary counts conflict; preserving every contract is more important than matching a mistaken aggregate.

## History

- 2026-09-30 (salus-pramana-medical/t4): initial
- 2026-09-30 (salus-pramana-medical/t4 re-dispatch): verified 1 active plus 14 archived HTTP registrations and corrected the target-design evidence anchor
