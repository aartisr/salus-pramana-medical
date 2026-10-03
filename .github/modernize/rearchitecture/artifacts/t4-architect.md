# t4 - Target Architecture And Preserved Contracts

## Summary

Defines one isolated sibling runtime on the mandated stack, with 14 lazy browser paths, 15 preserved HTTP method/path contracts, deterministic clinical domain services, server-enforced Cognito-compatible authorization, and explicit DynamoDB-compatible or local-memory repository adapters. The current root remains authoritative, archived-only behavior is additive, and neither source tree is a runtime dependency.

## Deliverables

- [t4-architect-target-architecture.md](./t4-architect-target-architecture.md) - module boundaries, dependency rules, runtime composition, migration constraints, and risk controls.
- [t4-architect-api-contracts.md](./t4-architect-api-contracts.md) - frozen middleware, HTTP, auth, repository, ingestion, and error contracts.
- [t4-architect-requirement-map.md](./t4-architect-requirement-map.md) - explicit REQ-001 through REQ-078 mapping to target design elements and required evidence.

## Binding Decisions

1. Build only in `/Users/rraviku2/aarti/salus-pramana-medical-new`; source root and `archive/legacy-monorepo` remain immutable parity references.
2. Use one TypeScript application package, one React root, one TanStack Router instance, one TanStack Query client, one shared app-state provider, and one Express composition root.
3. Preserve all nine active paths; add `/new`, `/compare/$conditionId`, `/editor`, `/auth/callback`, and `/math`. Merge the archived dashboard into `/` without replacing authoritative root behavior.
4. Preserve all 15 enumerated HTTP method/path contracts. The PM count of 13 archived contracts conflicts with the 14 archived routes present in source; no route is dropped to satisfy the count.
5. Keep deterministic clinical computation independent of React, Express, persistence SDKs, and generative AI. AI can explain but cannot create or upgrade a recommendation.
6. Select one persistence adapter at startup. Memory is explicit, non-production, process-local, and never an operational fallback after a DynamoDB-compatible failure.
7. Preserve old-shape data additively, including both `rejected` and `under_review` reads plus absent-as-published behavior. Mutation schemas remain endpoint-specific.
8. Treat WCAG 2.2 AA, computed light-theme fidelity, latest-two-major browser behavior, and route/error recovery as architecture contracts rather than post-build polish.

## Architecture Gate

Implementation conforms only if imports follow the dependency rules, all matching frozen rows in `wire_contracts.yaml` remain executable, all 78 requirements have implementation and test links, and validation confirms zero source/archive modifications. Any missing route, endpoint, server-side auth check, clinical fail-closed path, or no-failover guarantee is a parity failure.

## Re-dispatch Source Verification

- `clarification-questions.json` is the immutable question-set record; the submitted F1-F10, B1-B5, and G1-G2 values are normalized in `clarification.md`, which remains the binding downstream contract.
- Current source still exposes one active-root endpoint in `server.ts` and 14 archived endpoints across the API application and route registrars. All 15 method/path pairs remain represented in the preserved contract inventory.
- The re-dispatch found no target-boundary or contract change that supersedes the binding decisions above.

## Test Results

- Command: Node artifact gate for required sections, ordered unique REQ-001 through REQ-078 rows, 15 HTTP method/path rows, current-source route registrations, forbidden placeholders, upstream evidence sections, Mermaid safety marker, and evidence-anchor validity.
- Passed: 4 artifacts; 78 of 78 requirement IDs; 15 endpoint rows matching 1 active-root plus 14 archived source registrations; corrected evidence anchor exists upstream; 0 placeholders.
- Failed: 0.
- Skipped: application build/runtime tests because this task produces architecture documentation only.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t2-architect.md` - 23-unit implementation boundary and remediated architecture findings.
- `.github/modernize/rearchitecture/artifacts/t3-pm.md` and `t3-pm-capability-inventory.md` - 78 parity requirements, route inventory, API behavior, and success criteria.
- `.github/modernize/rearchitecture/clarification.md` - exact target stack, sibling output, browser/accessibility, auth/data, and preservation constraints.

## Evidence Mapping

- `t2-architect.md#Boundary-Decision` -> sibling-only target, immutable source/archive, and dependency prohibition in `t4-architect-target-architecture.md`.
- `t2-architect.md#Architectural-Findings` -> auth, middleware, governance, persistence, ingestion, status, and theme decisions across both design details.
- `t3-pm-capability-inventory.md#Route-Inventory` -> 14-path target router table.
- `t3-pm-capability-inventory.md#HTTP-API-Contracts` -> 15-row HTTP contract table and global middleware contract.
- `t3-pm-capability-inventory.md#Functional-Requirements` -> complete mapping in `t4-architect-requirement-map.md`.
- `clarification.md#Frontend` -> React/Vite/Tailwind/Query/Router, route splitting, app-state, WCAG, responsive, and browser boundaries.
- `clarification.md#Backend` -> Express/Node, Cognito verification, preserved API behavior, explicit adapters, and non-destructive schemas.
