# Architecture Implementation Index

## Implementation Guide

This index is not the full contract. Do not implement from this file alone; follow the artifact paths below.

### Global Artifacts

- `unit_graph.yaml`: all workers locate their unit, dependencies, public signatures, dynamic entrypoints, and shared-field whitelist. Source anchors prove behavior; they are not rewrite targets.
- `migration_boundary.yaml`: all workers use `must_rewrite` as source capability scope, copy `copy_as_is` assets, leave `legacy_allowed_to_remain` untouched, and write only to the sibling target.
- `wire_contracts.yaml`: filter `contracts` where `unit` equals the assigned unit; preserve frozen methods, paths, payloads, statuses, auth, and target signatures.
- `shared_modules.yaml`: filter `modules` where `used_by_units` contains the assigned unit; honor the migration strategy and only use fields listed by the unit's `shared_refs`.
- `cross_unit_state.yaml`: filter flows where `writer.unit` or `reader.unit` equals the assigned unit; retain every `must_preserve` flow and execute every `must_confirm: runtime` check.
- `seams.yaml`: filter cuts where either `cut_between` side equals the assigned unit; declared cuts and frozen-side rules are authoritative.
- `project-structure.md`, `tech-stack.md`, and `data-model.md`: read for current layering, exact source versions, and existing persisted shapes. They do not authorize redesign.

### Per-Unit Artifact Map

Each row lists the exact behavior, binding, and advisory split-candidate artifact. Behavior preserves branches/effects/errors; bindings preserve route/config/framework wiring; decomposition has `commit: false` and cannot dictate target structure.

| Unit and trigger | Behavior | Bindings | Split candidates |
| --- | --- | --- | --- |
| `active-home` - page `GET /` | `units/active-home/behavior.yaml` | `units/active-home/bindings.yaml` | `units/active-home/unit_decomposition.yaml` |
| `active-scientific-audit` - page `GET /scientific-audit` | `units/active-scientific-audit/behavior.yaml` | `units/active-scientific-audit/bindings.yaml` | `units/active-scientific-audit/unit_decomposition.yaml` |
| `active-global-health` - page `GET /global-health-equity` | `units/active-global-health/behavior.yaml` | `units/active-global-health/bindings.yaml` | `units/active-global-health/unit_decomposition.yaml` |
| `active-intelligence` - page `GET /cross-system-intelligence` | `units/active-intelligence/behavior.yaml` | `units/active-intelligence/bindings.yaml` | `units/active-intelligence/unit_decomposition.yaml` |
| `active-ode-lab` - page `GET /ode-interaction-lab` | `units/active-ode-lab/behavior.yaml` | `units/active-ode-lab/bindings.yaml` | `units/active-ode-lab/unit_decomposition.yaml` |
| `active-clinical-workbench` - page `GET /clinical-workbench` | `units/active-clinical-workbench/behavior.yaml` | `units/active-clinical-workbench/bindings.yaml` | `units/active-clinical-workbench/unit_decomposition.yaml` |
| `active-ai-synthesis` - page `GET /ai-clinical-reasoning` | `units/active-ai-synthesis/behavior.yaml` | `units/active-ai-synthesis/bindings.yaml` | `units/active-ai-synthesis/unit_decomposition.yaml` |
| `active-architecture` - page `GET /architecture` | `units/active-architecture/behavior.yaml` | `units/active-architecture/bindings.yaml` | `units/active-architecture/unit_decomposition.yaml` |
| `active-calibration` - page `GET /calibration-governance` | `units/active-calibration/behavior.yaml` | `units/active-calibration/bindings.yaml` | `units/active-calibration/unit_decomposition.yaml` |
| `legacy-dashboard` - page `GET /` | `units/legacy-dashboard/behavior.yaml` | `units/legacy-dashboard/bindings.yaml` | `units/legacy-dashboard/unit_decomposition.yaml` |
| `legacy-new-evidence` - page `GET /new` | `units/legacy-new-evidence/behavior.yaml` | `units/legacy-new-evidence/bindings.yaml` | `units/legacy-new-evidence/unit_decomposition.yaml` |
| `legacy-comparison` - page `GET /compare/$conditionId` | `units/legacy-comparison/behavior.yaml` | `units/legacy-comparison/bindings.yaml` | `units/legacy-comparison/unit_decomposition.yaml` |
| `legacy-editor` - page `GET /editor` | `units/legacy-editor/behavior.yaml` | `units/legacy-editor/bindings.yaml` | `units/legacy-editor/unit_decomposition.yaml` |
| `legacy-auth-callback` - page `GET /auth/callback` | `units/legacy-auth-callback/behavior.yaml` | `units/legacy-auth-callback/bindings.yaml` | `units/legacy-auth-callback/unit_decomposition.yaml` |
| `legacy-math` - page `GET /math` | `units/legacy-math/behavior.yaml` | `units/legacy-math/bindings.yaml` | `units/legacy-math/unit_decomposition.yaml` |
| `active-clinical-ai-api` - API `POST /api/clinical-ai` | `units/active-clinical-ai-api/behavior.yaml` | `units/active-clinical-ai-api/bindings.yaml` | `units/active-clinical-ai-api/unit_decomposition.yaml` |
| `legacy-health-api` - API `GET /health` | `units/legacy-health-api/behavior.yaml` | `units/legacy-health-api/bindings.yaml` | `units/legacy-health-api/unit_decomposition.yaml` |
| `legacy-evidence-api` - seven evidence/auth endpoints | `units/legacy-evidence-api/behavior.yaml` | `units/legacy-evidence-api/bindings.yaml` | `units/legacy-evidence-api/unit_decomposition.yaml` |
| `legacy-intelligence-api` - six intelligence endpoints | `units/legacy-intelligence-api/behavior.yaml` | `units/legacy-intelligence-api/bindings.yaml` | `units/legacy-intelligence-api/unit_decomposition.yaml` |
| `ingest-pubmed` - PubMed handler | `units/ingest-pubmed/behavior.yaml` | `units/ingest-pubmed/bindings.yaml` | `units/ingest-pubmed/unit_decomposition.yaml` |
| `ingest-clinicaltrials` - ClinicalTrials.gov handler | `units/ingest-clinicaltrials/behavior.yaml` | `units/ingest-clinicaltrials/bindings.yaml` | `units/ingest-clinicaltrials/unit_decomposition.yaml` |
| `ingest-ayush` - AYUSH handler | `units/ingest-ayush/behavior.yaml` | `units/ingest-ayush/bindings.yaml` | `units/ingest-ayush/unit_decomposition.yaml` |
| `ingest-ctri` - CTRI handler | `units/ingest-ctri/behavior.yaml` | `units/ingest-ctri/bindings.yaml` | `units/ingest-ctri/unit_decomposition.yaml` |

### Global Row Filtering By Unit

For every unit above:

1. Read `unit_graph.yaml` at the matching `name`.
2. Read `wire_contracts.yaml` rows whose `unit` matches.
3. Read `shared_modules.yaml` rows whose `used_by_units` includes the unit; enforce the graph's `used_fields` subset.
4. Read `cross_unit_state.yaml` where either endpoint matches the unit.
5. Read `seams.yaml` where either cut side matches the unit.
6. Use `migration_boundary.yaml::must_rewrite`; never expand scope from source anchors.

### Completion Evidence For Every Unit

Before reporting completion, each implementation worker must provide:

- Exact architecture artifact paths read.
- Each `must_preserve` and `must_appear_in_target` row implemented, with target file references.
- Every matching frozen wire contract verified by executable positive, boundary, error, and auth tests.
- Every unresolved or intentionally deferred contract, with owner and blocking reason; an unresolved required contract fails parity.
- Narrow test results followed by required build/type/lint/runtime evidence.
- Confirmation that neither the source root nor `archive/legacy-monorepo` was modified.

## Architecture Constraints For Target Design

- One React root, one TanStack router, one TanStack query client, and one app-state provider.
- Active route paths remain authoritative; archived-only paths are additive.
- Canonical evidence reads accept `draft|published|rejected|under_review` plus absent legacy status; absence is public, while mutation schemas retain their source-specific accepted values and never rewrite stored status values.
- Express assembly order is correlation, start log, CORS, security/no-store headers, 1 MB limit, JSON parsing, auth, routes, not-found, then terminal error/finish logging; route-specific errors remain authoritative.
- Browser auth and server authorization remain separate: PKCE/session handling on the client never grants API authority; protected routes verify bearer signature, issuer, audience, validity, claims, and exact `evidence-editors` membership.
- Repository consumers depend on interfaces selected once at startup by `PERSISTENCE_ADAPTER`; production memory mode, implicit selection from table presence, and DynamoDB-to-memory operational failover are forbidden.
- Ingestion calls `EvidenceRepository.createImportedDraft`; one conditional create keyed by `evidenceId` preserves the first record, counts only conditional conflicts as skipped, and surfaces every other adapter error.
- Deterministic clinical calculations remain outside route handlers and AI generation; strict governance only downgrades, exceptions return the frozen fail-closed result, and AI output cannot create or upgrade a recommendation.
- Tailwind class names use remapped light-theme tokens in `src/index.css`; preserve computed visual behavior, not literal color-name assumptions.

These constraints incorporate all binding decisions from `t2.1-architect.md`; a target design that weakens any one of them fails the architecture gate.
