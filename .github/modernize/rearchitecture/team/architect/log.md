# Architect Log

## [t2] Analyzed active-root and archived architecture

- Resolved 23 implementation units: 15 pages, 4 API surfaces, and 4 ingestion jobs.
- Kept archived route registrars as public API-surface units so every endpoint remains frozen in wire contracts without duplicating source anchors.
- Found a persisted enum conflict: active `under_review` versus archived `rejected`; target data design must support both additively.
- Confirmed dark-named Tailwind utilities are remapped by `src/index.css` into the authoritative light medical theme.
- Confirmed archived memory persistence is process-local and DynamoDB selection is environment-driven; target fallback must be explicit.
- Local Ruby lacks `Array#tally`; compatibility-safe hash counting worked for artifact validation.
- Learnings consumed: [(none)]

## Status

Complete.

## [t4] Designed target architecture and preserved contracts

- Fixed one self-contained TypeScript sibling runtime with one React root, router, Query client, app-state provider, and Express composition root.
- Placed 14 unique lazy browser paths, merging archived dashboard behavior additively into the authoritative `/` route.
- Enumerated 15 preserved HTTP method/path contracts; corrected a downstream counting risk because PM summary says 13 archived contracts while source contains 14 archived routes.
- Kept browser PKCE separate from server JWT authorization, clinical decisions separate from AI, and persistence selection separate from adapter operations.
- Defined inward dependency direction and stable repository ports while leaving exact DynamoDB table/index evolution to t5 DBA design.
- Mapped REQ-001 through REQ-078 to target boundaries and executable evidence classes.
- Learnings consumed: [architect/binding-runtime-safety-contracts, architect/evidence-status-compatibility, architect/immutable-source-sibling-boundary, architect/light-theme-token-remap]

## [t2.1] Resolved seven blocking architecture findings

- Bound publication status to an additive four-value read union while retaining endpoint-specific write enums and absent-as-published legacy reads.
- Separated browser PKCE from server authorization and fixed issuer/audience/JWKS, role, bypass, and 401/403/503 semantics.
- Made deterministic governance authoritative, with strict downgrade and processing-error fail-closed behavior.
- Fixed Express middleware ordering, explicit startup adapter selection, no production memory fallback, and atomic ingestion create semantics.
- Preserved the active computed light theme rather than interpreting dark-named Tailwind utilities literally.
- Wrong assumption corrected: archived ingestion's visible skip behavior does not require preserving its racy get-before-put implementation; a conditional create preserves output while preventing overwrite.
- Validation used exact ADR/resolution counts, placeholder rejection, and required artifact-section checks.
- Learnings consumed: [architect/evidence-status-compatibility, architect/immutable-source-sibling-boundary, architect/light-theme-token-remap]

## [t2] Re-ran architecture analysis after remediation

- Confirmed the existing 23-unit decomposition and 23 unique source anchors still match current root/archive entrypoints.
- Propagated all seven binding ADRs from the narrative resolution into the implementation index, frozen wire contracts, affected unit contracts, and ingestion repository seam.
- Added a global Express middleware wire contract and strengthened ingestion to one conditional create while preserving visible ingest/skip behavior.
- Corrected the primary report from 22 to 23 wire contracts after adding the middleware boundary.
- Full structural validation passed for 23 units, 69 per-unit files, 29 shared references, 6 state flows, 23 wire contracts, and 3 seams.
- Application tests were intentionally not run because this architect task modified documentation artifacts only.
- Learnings consumed: [architect/binding-runtime-safety-contracts, architect/evidence-status-compatibility, architect/immutable-source-sibling-boundary, architect/light-theme-token-remap]

## [t4] Re-dispatch verified target architecture and contracts

- Confirmed current source exposes one active-root endpoint and 14 archived endpoint registrations, matching all 15 preserved HTTP rows.
- Revalidated ordered unique REQ-001 through REQ-078 coverage and the four-artifact target design set.
- Corrected one evidence mapping to its actual upstream owner, `architecture_index.md#Architecture-Constraints-For-Target-Design`.
- Added source-backed external prerequisites for Cognito, DynamoDB-compatible persistence, registry connectivity, Gemini, CORS, and TLS.
- Application tests remained out of scope because this architect task changed documentation only; the artifact gate passed with zero failures.
- Learnings consumed: [architect/binding-runtime-safety-contracts, architect/evidence-status-compatibility, architect/immutable-source-sibling-boundary, architect/light-theme-token-remap, architect/single-runtime-target-boundaries]
