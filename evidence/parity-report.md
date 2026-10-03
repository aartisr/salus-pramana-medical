# SALUS Legacy-to-Current Parity Report

Generated: 2026-09-30

## Verdict

**Implementation parity: PASS**

All capabilities available from the immutable legacy source have an active-root implementation, compatibility route, published artifact, or explicit provider adapter. Existing production capabilities remain present.

**Environment-confirmed production parity: CONDITIONAL**

Four external validations require credentials or infrastructure that are not available in this workspace. They are listed below and were not fabricated.

## Implemented Capability Slices

- 14 typed, lazy TanStack routes, pending/error recovery, shared state, and light medical-research theme.
- Additive condition, evidence, audit, monitoring, registry, and source validation contracts.
- Deterministic Pramana, calibration, validation-gate, safety, Hill-dose, RK4 interaction, and trajectory services.
- Memory and DynamoDB-compatible repository adapters with explicit startup selection and no runtime failover.
- Atomic evidence/condition publication commands with append-only audit semantics.
- Cognito-compatible JWT/JWKS server authorization and browser PKCE session/callback flow.
- Fifteen preserved Express HTTP contracts plus same-origin `/api` browser aliases and deterministic AI fallback.
- PubMed, ClinicalTrials.gov, AYUSH/DHARA, and CTRI/ICTRP connectors with bounded HTTP policy, normalization, deduplication, and deterministic fallback records.
- Restored ranked comparison, CSV/print export, evidence submission, editor, auth callback, and math/report workflows.
- Byte-preserved 20-asset legacy report corpus under `public/reports/` with provenance and integrity tests.
- Canonical sitemap coverage for all 14 routes and machine-readable crawler/LLM assets.

## Internal Validation Results

| Gate | Result | Evidence |
| --- | --- | --- |
| Active-root integrity | PASS | `tests/architecture/source-integrity.test.ts` |
| Baseline completeness | PASS | `tests/baseline/completeness.test.ts` |
| Fixture provenance | PASS | `tests/fixtures/provenance.test.ts` |
| Domain/application/persistence | PASS | 33 focused tests landed; full suite included below |
| API/auth contracts | PASS | `tests/contracts`, `tests/auth`, `tests/server` |
| Ingestion connectors | PASS | `tests/ingestion` |
| Client compatibility workflows | PASS | `tests/client` |
| Corpus/discovery | PASS | `tests/corpus` |
| Full unit/contract suite | PASS | 33 files, 97 tests, 0 failures, 0 skips |
| TypeScript | PASS | `npm run typecheck` |
| Lint | PASS | `npm run lint` |
| Production build | PASS | Vite 8, 14 lazy route chunks emitted |
| Dependency security | PASS | `npm audit --audit-level=low`: 0 vulnerabilities |
| Browser route smoke | PASS | 14/14 routes rendered with no console errors |
| Responsive containment | PASS | Compact routes verified; 0 horizontal overflow after KaTeX/ODE fixes |
| API-backed browser workflows | PASS | Comparison, submission, editor, math; same-origin API alias verified |

## External Prerequisites

These do not block local implementation but prevent claiming environment-confirmed production parity:

1. Isolated Cognito-compatible viewer/editor identities and issuer access for a real signed-token matrix.
2. Disposable DynamoDB-compatible tables for the second repository-contract execution target.
3. Read-only production telemetry or permission to run paired latency/availability probes.
4. Optional read-only live registry access for separately labeled connector smoke tests.

## Preservation

- The active root is self-contained; no retired legacy source is required at runtime, build time, or test time.
- Deployment, Git commit, Git push, and production mutation were not performed.
- Requirement traceability: `evidence/traceability/requirements.json` contains 78/78 requirement rows.

## Remaining Risk

The remaining risk is environmental validation, not missing implementation. Production release should remain gated on the four external prerequisites above and a deployment-specific smoke test.
