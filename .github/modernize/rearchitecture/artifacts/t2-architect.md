# t2 - Active And Archived Architecture Analysis

## Summary

The remediation rerun confirms 23 implementation units spanning nine authoritative active pages, six archived-only pages, one active AI API, three archived API surfaces, and four ingestion jobs. The analysis freezes 23 outward contracts and six implicit cross-unit state flows while keeping all source and archive files immutable. All seven prior blockers are resolved by the binding decisions in `t2.1-architect.md` and are incorporated into the primary architecture contracts.

## Deliverables

- [architecture_index.md](./architecture_index.md) - required implementation guide and per-unit artifact map.
- [unit_graph.yaml](./unit_graph.yaml) - 23 source-anchored units, signatures, dependencies, and shared references.
- [migration_boundary.yaml](./migration_boundary.yaml) - full sibling-runtime rewrite scope and immutable-source rule.
- [wire_contracts.yaml](./wire_contracts.yaml) - 23 concrete middleware, API, auth, ingestion, and persistence-edge contracts.
- [shared_modules.yaml](./shared_modules.yaml) - shared state, domain, repository, auth, and ingestion contracts.
- [cross_unit_state.yaml](./cross_unit_state.yaml) - persona, ODE handoff, auth, and evidence visibility flows.
- [seams.yaml](./seams.yaml) - declared frozen source cuts and ingestion-repository bridge.
- [project-structure.md](./project-structure.md) - measured layers, entrypoints, and domains.
- [tech-stack.md](./tech-stack.md) - exact existing active and archived dependency/runtime inventory.
- [data-model.md](./data-model.md) - as-is entities, keys, indexes, fallback semantics, and transaction boundaries.
- `units/<unit>/behavior.yaml`, `bindings.yaml`, and `unit_decomposition.yaml` - complete triplets for every graph unit.

## Architectural Findings

- **RESOLVED / CRITICAL contract**: publication status uses an additive read union of `draft|published|rejected|under_review` plus absent-as-published legacy reads, with surface-specific write enums and no data rewrite.
- **RESOLVED / CRITICAL contract**: browser PKCE is not authority; every protected Express endpoint verifies issuer, audience, cached JWKS signature, validity, claims, and exact `evidence-editors` membership server-side.
- **RESOLVED / CRITICAL contract**: deterministic calculus and governance own recommendation state; strict gates and processing exceptions fail closed, and AI cannot upgrade a decision.
- **RESOLVED / HIGH contract**: Express middleware order and correlation, CORS, security headers, 1 MB body limit, structured logs, not-found, and terminal JSON error semantics are fixed.
- **RESOLVED / HIGH contract**: startup selects an explicit persistence adapter; production memory mode and DynamoDB-to-memory operational failover are forbidden.
- **RESOLVED / HIGH contract**: ingestion uses one conditional create keyed by `evidenceId`; duplicate conflicts skip without overwrite and all other adapter errors surface.
- **RESOLVED / HIGH contract**: the active computed light theme and Tailwind 4 token remapping are authoritative despite dark-named utility classes.
- **WARNING**: active root tests do not cover `server.ts`; archived API and ingestion suites are separate and excluded from the active TypeScript project. The validation strategy must bridge these suites in the sibling runtime.

## Boundary Decision

The implementation boundary is a complete sibling-runtime rewrite because the user requires every active and archived capability to run independently on the fixed target stack. Cleanup is not required: the source root and archive remain untouched as parity references, and the target must not import them at runtime.

## Test Results

- Command: Ruby YAML parse plus unit uniqueness, source-anchor uniqueness, per-unit triplet completeness, shared-field subset, unmatched-state confirmation, wire-target/unit validity, decomposition, and seam validation.
- Passed: 23 unit graph rows; 69 per-unit YAML files; 23 unique source anchors; 29 shared references; 6 state flows; 23 wire contracts; 3 seams; all seven ADR contract markers present.
- Failed: 0.
- Skipped: application build/runtime tests because this rerun changes documentation artifacts only; implementation validation remains owned by the later validation tasks.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t1-teamlead.md` - located the ratified constitution and inherited preservation/validation constraints.
- `.github/modernize/rearchitecture/artifacts/t2.1-architect.md` - supplied the seven binding remediation decisions incorporated into primary architecture contracts.
- `.github/modernize/rearchitecture/artifacts/constitution.md` - governed source authority, target versions, data/auth/clinical invariants, exclusions, and binary parity.
- `.github/modernize/rearchitecture/clarification.md` - supplied approved stack, route/state/theme, auth/data, browser/accessibility, output, and no-reconfirmation decisions.
- `.github/modernize/rearchitecture/artifacts/project-profile.yaml` - supplied 18,611 LOC scope and active/archive subsystem boundaries.

## Evidence Mapping

- `t1-teamlead.md#Summary` and `constitution.md#I-Source-Authority-and-Preservation` -> `migration_boundary.yaml`, `seams.yaml`, and immutable-source completion evidence.
- `constitution.md#II-Exhaustive-Capability-Parity-and-Traceability` -> `unit_graph.yaml`, all 23 per-unit triplets, and `architecture_index.md`.
- `constitution.md#III-Immutable-Target-Stack-and-Rewrite-Boundary` -> `tech-stack.md`, `migration_boundary.yaml`, and target architecture constraints.
- `constitution.md#IV-Contract-Identity-and-Data-Continuity` -> `wire_contracts.yaml`, `data-model.md`, `shared_modules.yaml`, and auth/data state flows.
- `constitution.md#V-Clinical-Determinism-and-Evidence-Integrity` -> active/legacy intelligence behavior contracts and fail-closed wire semantics.
- `t2.1-architect.md#ADR-01..ADR-07` -> additive publication compatibility, exact server auth, fail-closed governance, ordered middleware, explicit adapters, atomic ingestion, and computed-theme constraints in `architecture_index.md`, `wire_contracts.yaml`, affected per-unit contracts, and `seams.yaml`.
- `clarification.md#Frontend` -> active/archived page units, lazy-route bindings, light-theme constraint, and shared state contracts.
- `clarification.md#Backend` -> Express migration boundary, frozen API contracts, Cognito flow, and DynamoDB/memory repository evidence.
- `project-profile.yaml#project.structure` -> measured `project-structure.md` layers and subsystem coverage.
