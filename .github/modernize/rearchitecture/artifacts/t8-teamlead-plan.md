# t8 Stage 2 Implementation Plan

**Date**: 2026-09-30 | **Specification**: `t3-pm-capability-inventory.md` | **Mode**: brownfield rewrite

## Summary

Evolve the active application at `/Users/rraviku2/aarti/salus-pramana-medical` so it preserves every current capability and restores every compatible archived capability. The work is sequenced as independently testable vertical slices over one React 19/Vite 8/Tailwind 4/TanStack Router 1/TanStack Query 5/Express 4.21/Node.js 22 package. Frozen pre-change root evidence and production behavior remain authoritative; `archive/legacy-monorepo` remains immutable provenance. Final completion depends on the VG-00 through VG-15 validation tail; missing external evidence keeps parity `FAIL` without blocking independent implementation.

## Technical Context

- **Language/runtime**: TypeScript 7 on Node.js 22.
- **Client**: React 19, Vite 8, Tailwind CSS 4, one TanStack Router 1 instance, one TanStack Query 5 client, and one shared app-state provider.
- **Server**: Express 4.21 with one injected `createApp(dependencies)` composition root.
- **Storage**: startup-selected memory or DynamoDB-compatible repositories; additive old-shape reads, transactional API mutation plus audit, conditional ingestion creates, and no operational failover.
- **Authentication**: browser PKCE S256 plus independently verified server JWT/JWKS claims and exact `evidence-editors` membership.
- **Testing**: Vitest 5, Supertest, parameterized repository contracts, Playwright, axe-core, visual comparison, and baseline-relative non-functional probes.
- **Target platform**: the active root package; browser SPA and Express process with Vercel compatibility. Deployment and provisioning are excluded.
- **Performance goal**: no p50/p95 latency, error-ratio, availability, or ingestion regression against paired authoritative baseline samples; no invented numeric target.
- **Constraints**: preserve 14 browser paths, 15 HTTP method/path contracts, 23 architecture units, six cross-unit state flows, all 78 requirements, active-root datasets, and the archive until final parity is proven.

## Constitution Check

| Principle | Plan result |
| --- | --- |
| I. Source authority and preservation | PASS: planned writes target the active root; VG-00 verifies archive byte integrity and preservation of every frozen root capability. |
| II. Exhaustive parity and traceability | PASS: REQ-001 through REQ-078 map to plan items, tasks, files, and VG evidence. |
| III. Immutable stack and boundary | PASS: one exact-stack package; no alternate router, state store, or runtime imports from parity sources. |
| IV. Contract, identity, and data continuity | PASS: frozen endpoints, server auth, additive DTOs, explicit adapters, and disposable mutation tests are mandatory. |
| V. Clinical determinism and evidence integrity | PASS: pure domain ownership, golden fixtures, fail-closed behavior, and AI no-upgrade checks precede UI acceptance. |
| VI. Accessible responsive equivalence | PASS: shared primitives and route slices feed mandatory browser, WCAG, responsive, and visual gates. |
| VII. Evidence-based validation | PASS: the final phase executes every VG-00 through VG-15 gate and rejects unexplained skips. |

No constitution exception is requested.

## Applied Guidelines

No framework-to-framework guideline matches this TypeScript/React/Express rewrite; the available catalog contains Java Spring patterns only. The binding local guidance is therefore the architecture module map, frozen wire contracts, t5 data invariants, t6 validation strategy, and t7 UX acceptance contract.

## Dependency Order

`P1 scaffold + authoritative baseline freeze -> P2 foundations -> {P3, P4, P5, P6, P7, P8, P9 vertical slices} -> P10 mandatory validation tail`.

P2 cannot start until P1 freezes every obtainable behavior, UI, API, clinical, accessibility,
latency, ingestion, and availability baseline and records unavailable external evidence as a blocking
prerequisite. P3 through P9 may run in parallel only after P2 passes its contract suites, except
cross-slice browser journeys run only in P10 after all participating slices. Within a slice, tasks
remain ordered. P10 starts only after every implementation task reports narrow tests, exact changed
files, requirement IDs, archive integrity, and active-root capability preservation.

## Implementation Steps And Task Breakdown

### P1. Active-Root Scaffold And Baseline Guard

- **Requirements**: REQ-076, REQ-077.
- **Design inputs**: constitution Principle I/III/VII; t4 runtime boundary; t6 VG-00/VG-01.
- **Outcome**: exact-stack single package, runnable client/server entrypoints, one authoritative API-base contract, immutable source manifests, frozen authoritative baselines, and test fixtures copied with provenance.

- [ ] T001 [Plan:1.1] Reconcile active-root `package.json`, lockfile, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, and Node 22 engine with exact mandated majors and real `typecheck` (`tsc --noEmit`), `build`, `lint`, `test`, `test:contracts`, `test:integration`, `test:e2e`, `test:a11y`, `test:visual`, `test:performance`, `start:client`, `start:server`, and `validate` scripts. Preserve the existing Vercel contract. [Verify: `npm run typecheck`] [Evidence: `evidence/slices/P1/T001.json`]
- [ ] T002 [Plan:1.1] Create the target `src/client`, `src/server`, `src/application`, `src/domain`, `src/persistence`, `src/ingestion`, `src/shared`, `tests`, and `evidence` boundaries plus `tests/architecture/import-boundaries.test.ts`. [Verify: `npm test -- tests/architecture/import-boundaries.test.ts`] [Evidence: `evidence/slices/P1/T002.json`]
- [ ] T003 [Plan:1.1] Reconcile active-root `index.html`, `src/client/main.tsx`, and `src/client/app/root.tsx` so Vite renders a visible route shell without runtime imports from the archive. [Source: index.html] [Source: src/main.tsx] [Verify: `npm run build`] [Evidence: `evidence/slices/P1/T003.json`]
- [ ] T004 [Plan:1.1] Create target `src/server/index.ts` and `src/server/app/create-app.ts` with injected startup, memory-mode default for local verification, graceful shutdown, and an ephemeral-port smoke harness. [Source: server.ts] [Source: archive/legacy-monorepo/services/api/src/app.ts] [Verify: `npm test -- tests/server/startup.test.ts`] [Evidence: `evidence/slices/P1/T004.json`]
- [ ] T005 [Plan:1.1] Establish the target API configuration contract: browser requests use same-origin `/api`; Vite owns the sole development proxy to `http://127.0.0.1:8787`; Express listens on configurable `PORT` defaulting to `8787`; CORS derives from one allowlist. Add `tests/config/api-base-consistency.test.ts` to reject client absolute API bases, duplicate proxy files, or divergent Vite/server/CORS ports. [Source: vite.config.ts] [Source: server.ts] [Source: archive/legacy-monorepo/apps/web/src/lib/evidence-client.ts] [Source: archive/legacy-monorepo/apps/web/src/lib/editor-client.ts] [Source: archive/legacy-monorepo/apps/web/src/lib/intelligence-client.ts] [Verify: `npm test -- tests/config/api-base-consistency.test.ts`] [Evidence: `evidence/slices/P1/T005.json`]
- [ ] T006 [Plan:1.1] Before implementation, capture SHA-256 manifests for active-root capability-bearing files and every file under `archive/legacy-monorepo` in `evidence/source-integrity/before.json`; exclude generated modernization and evidence artifacts only. The archive manifest is byte-immutable, while the root manifest anchors changed-file and capability-preservation review. [Verify: `npm test -- tests/architecture/source-integrity.test.ts`] [Evidence: `evidence/slices/P1/T006.json`]
- [ ] T007 [Plan:1.1] Before implementation, freeze every obtainable authoritative behavior/API response, clinical result, UI state/screenshot, accessibility result, latency sample, ingestion outcome, and availability sample under target `evidence/baseline/`; write `prerequisites.json` with exact owners and blocker evidence for unavailable production screenshots/telemetry, browser versions, Cognito identities, disposable DynamoDB, and live registries. Any affected downstream task remains blocked until its required baseline is present. [Verify: `npm test -- tests/baseline/completeness.test.ts`] [Evidence: `evidence/slices/P1/T007.json`]
- [ ] T008 [Plan:1.1] Copy provenance-tagged, non-PHI fixtures into `tests/fixtures/` from pre-change `src/data/*.ts`, `src/services/*.ts`, and archived `packages/domain/src/index.ts`; add `tests/fixtures/provenance.json` without changing the archive. [Source: src/data/globalHealthEquityData.ts] [Source: src/data/nobelEvaluationData.ts] [Source: src/data/salusRepositoryData.ts] [Source: archive/legacy-monorepo/packages/domain/src/index.ts] [Verify: `npm test -- tests/fixtures/provenance.test.ts`] [Evidence: `evidence/slices/P1/T008.json`]
- [ ] T009 [Plan:1.1] Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build`, the import/API-config/startup checks, and a client/server HTTP smoke; record versions, commands, and return codes in target `evidence/gates/VG-01.json` and `VG-02-scaffold.json`. [Verify: `npm run validate -- --scope scaffold`] [Evidence: `evidence/slices/P1/T009.json`]

### P2. Shared Contracts, Clinical Core, Identity, And Persistence Foundations

- **Requirements**: REQ-009, REQ-013, REQ-017-REQ-019, REQ-021, REQ-023-REQ-025, REQ-028, REQ-038, REQ-048, REQ-052-REQ-053, REQ-055-REQ-069, REQ-076-REQ-077.
- **Design inputs**: t4 module/dependency map and auth contracts; t5 invariants and verification matrix.
- **Outcome**: pure deterministic domain, additive schemas, explicit adapters, atomic audited commands, and browser/server identity boundaries.

- [ ] T010 [P] [Plan:2.1] Implement additive condition/evidence/audit/monitoring DTOs and endpoint-specific mutation schemas in target `src/domain/contracts/`; migrate allowlist and registry validation tests to `tests/domain/contracts.test.ts`. [Source: archive/legacy-monorepo/packages/domain/src/index.ts] [Source: src/types/salus.ts] [Verify: `npm test -- tests/domain/contracts.test.ts`] [Evidence: `evidence/slices/P2/T010.json`]
- [ ] T011 [P] [Plan:2.1] Port Pramana, validation gates, calibration, safety, Hill dose, RK4 interaction, and single-trajectory pure services to target `src/domain/clinical/` with named constants and golden fixtures in `tests/domain/clinical/`. [Source: src/services/pramanaCalculus.ts] [Source: src/services/doseResponseOptimizer.ts] [Source: src/services/odeInteractionSolver.ts] [Source: archive/legacy-monorepo/services/api/src/validation-gates.ts] [Source: archive/legacy-monorepo/services/api/src/ode-solver.ts] [Source: archive/legacy-monorepo/services/api/src/trajectory-simulator.ts] [Verify: `npm test -- tests/domain/clinical`] [Evidence: `evidence/slices/P2/T011.json`]
- [ ] T012 [P] [Plan:2.1] Define repository ports and typed outcomes in target `src/persistence/contracts/`, then implement the parity memory adapter and deterministic seeds in `src/persistence/memory/`. [Source: archive/legacy-monorepo/services/api/src/repository.ts] [Source: archive/legacy-monorepo/services/api/src/seed.ts] [Verify: `npm test -- tests/persistence/memory.test.ts`] [Evidence: `evidence/slices/P2/T012.json`]
- [ ] T013 [Plan:2.1] Implement DynamoDB-compatible repositories in target `src/persistence/dynamodb/` with paginated reads, unchanged keys/indexes, additive unknown-field preservation, transactional audited API mutations, conditional imported drafts, and read-only startup validation. [Source: archive/legacy-monorepo/services/api/src/repository.ts] [Verify: `npm test -- tests/persistence/dynamodb.test.ts`] [Evidence: `evidence/slices/P2/T013.json`]
- [ ] T014 [Plan:2.1] Implement explicit adapter selection in target `src/server/config/persistence.ts`; reject missing/unknown mode, production memory, incomplete tables, and runtime failover; add shared repository tests for memory and disposable DynamoDB-compatible stores in `tests/persistence/repository.contract.ts`. [Source: archive/legacy-monorepo/services/api/src/repository.ts#useDynamo] [Verify: `npm test -- tests/persistence/repository.contract.ts`] [Evidence: `evidence/slices/P2/T014.json`]
- [ ] T015 [P] [Plan:2.1] Implement browser PKCE/session logic in target `src/client/services/auth/` and server JWT/JWKS verification in `src/server/auth/`; add signed-token and browser-session matrices under `tests/auth/`. [Source: archive/legacy-monorepo/apps/web/src/lib/auth.ts] [Source: archive/legacy-monorepo/services/api/src/auth.ts] [Verify: `npm test -- tests/auth`] [Evidence: `evidence/slices/P2/T015.json`]
- [ ] T016 [Plan:2.1] Implement application commands/queries in target `src/application/` so authorized evidence snapshots feed deterministic intelligence, governance only downgrades, API mutations commit audit atomically, and AI output cannot change decisions. [Source: archive/legacy-monorepo/services/api/src/intelligence.ts] [Source: archive/legacy-monorepo/services/api/src/calibration-report.ts] [Verify: `npm test -- tests/application`] [Evidence: `evidence/slices/P2/T016.json`]
- [ ] T017 [Plan:2.1] Execute domain golden, auth, old-shape/status-union, memory repository, and disposable-store contract suites; block P3-P9 on any failure and retain reports under target `evidence/foundations/`. [Verify: `npm run test:contracts -- --reporter=json --outputFile=evidence/foundations/contracts.json`] [Evidence: `evidence/foundations/contracts.json`]

### P3. Application Shell, Home Discovery, And Personal State

- **Requirements**: REQ-001-REQ-011, REQ-016, REQ-040, REQ-049, REQ-073-REQ-077.
- **Design inputs**: t4 browser composition/route topology; t7 global shell and home patterns.
- **Outcome**: one provider tree, all route boundaries, preserved home workflow, browser stores, exports, citations, and accessible shared primitives.

- [ ] T018 [Plan:3.1] Implement one provider tree, query client, app-state provider, typed router, 14 lazy route declarations, pending/error/not-found recovery, focus, scroll, and navigation-only SPA fallback in target `src/client/app/`. [Source: src/main.tsx] [Source: src/app/router.tsx] [Source: src/app/app-context.tsx] [Source: src/app/route-boundaries.tsx] [Verify: `npm test -- tests/client/router.test.tsx`] [Evidence: `evidence/slices/P3/T018.json`]
- [ ] T019 [P] [Plan:3.1] Port active light-theme tokens and shared accessible shell, dialog, form, status, table, icon-button, and chart-alternative primitives into target `src/client/theme/` and `src/client/components/ui/`. [Source: src/index.css] [Source: src/components/ui] [Verify: `npm test -- tests/client/shared-ui.test.tsx`] [Evidence: `evidence/slices/P3/T019.json`]
- [ ] T020 [Plan:3.1] Implement home search, keyboard suggestions, five-item IndexedDB/localStorage history, blocked-storage fallback, and result handoff in target `src/client/features/home/`. [Source: src/components/ResearchHomepage.tsx] [Source: src/services/recentSearchesDb.ts] [Verify: `npm test -- tests/client/home-discovery.test.tsx`] [Evidence: `evidence/slices/P3/T020.json`]
- [ ] T021 [Plan:3.1] Implement home share, CSV/JSON export, evidence notifications, and citation formats in target `src/client/features/home/`. [Source: src/services/evidenceExportService.ts] [Source: src/services/evidenceSubscriptionService.ts] [Verify: `npm test -- tests/client/home-actions.test.tsx`] [Evidence: `evidence/slices/P3/T021.json`]
- [ ] T022 [Plan:3.1] Implement the Pramana sandbox, mission/disclaimers, and additive comparison entry in target `src/client/features/home/`. [Source: src/components/ResearchHomepage.tsx] [Source: archive/legacy-monorepo/apps/web/src/components/compare-dashboard.tsx] [Verify: `npm test -- tests/client/home-clinical.test.tsx`] [Evidence: `evidence/slices/P3/T022.json`]
- [ ] T023 [Plan:3.1] Add target `tests/client/home.test.tsx` and `tests/client/router.test.tsx` for REQ-001-REQ-011 and blocked-storage/chunk/unknown-route recovery; defer cross-slice J1-J3 browser execution to P10. [Verify: `npm test -- tests/client/home.test.tsx tests/client/router.test.tsx`] [Evidence: `evidence/slices/P3/T023.json`]
- [ ] T024 [Plan:3.1] Run the P3 unit/component slice; retain pass/fail/skip counts under target `evidence/slices/P3/`. [Verify: `npm test -- tests/client --reporter=json --outputFile=evidence/slices/P3/results.json`] [Evidence: `evidence/slices/P3/results.json`]

### P4. Clinical Intelligence, ODE, Workbench, And AI Reasoning

- **Requirements**: REQ-012-REQ-028, REQ-058-REQ-063, REQ-074-REQ-075, REQ-077.
- **Design inputs**: t4 clinical ownership and intelligence contracts; t6 J1-J3/VG-05; t7 intelligence/ODE/workbench/AI UX.
- **Outcome**: end-to-end deterministic clinical journeys and six frozen intelligence endpoints.

- [ ] T025 [P] [Plan:4.1] Implement cross-system intelligence and evidence-ledger feature in target `src/client/features/intelligence/`, including fail-closed empty state and ODE handoff. [Source: src/components/ClinicalIntelligenceStudio.tsx] [Verify: `npm test -- tests/client/intelligence.test.tsx`] [Evidence: `evidence/slices/P4/T025.json`]
- [ ] T026 [P] [Plan:4.1] Implement ODE and workbench features in target `src/client/features/ode/` and `src/client/features/workbench/` using only pure domain services. [Source: src/components/ODESimulationLab.tsx] [Source: src/components/DiagnosticDecisionWorkbench.tsx] [Verify: `npm test -- tests/client/ode-workbench.test.tsx`] [Evidence: `evidence/slices/P4/T026.json`]
- [ ] T027 [P] [Plan:4.1] Implement AI reasoning state and deterministic-first presentation in target `src/client/features/ai/`; preserve provider success/error/missing-key source labels. [Source: src/components/AIClinicalSynthesis.tsx] [Source: server.ts] [Verify: `npm test -- tests/client/ai-reasoning.test.tsx`] [Evidence: `evidence/slices/P4/T027.json`]
- [ ] T028 [Plan:4.1] Implement six intelligence routes in target `src/server/routes/intelligence.ts` and application handlers in `src/application/intelligence/` with exact query clamps, auth, statuses, same-snapshot governance, and fail-closed condition processing. [Source: archive/legacy-monorepo/services/api/src/routes/intelligence-routes.ts] [Verify: `npm test -- tests/contracts/intelligence.test.ts`] [Evidence: `evidence/slices/P4/T028.json`]
- [ ] T029 [Plan:4.1] Implement `POST /api/clinical-ai` in target `src/server/routes/clinical-ai.ts` with injected provider and deterministic fallback downstream of safety decisions. [Source: server.ts] [Verify: `npm test -- tests/contracts/clinical-ai.test.ts`] [Evidence: `evidence/slices/P4/T029.json`]
- [ ] T030 [Plan:4.1] Add and run target `tests/contracts/intelligence.test.ts` and `tests/domain/clinical-golden.test.ts`; require zero categorical or safety divergence and defer cross-slice J1-J3 browser execution to P10. [Verify: `npm test -- tests/contracts/intelligence.test.ts tests/domain/clinical-golden.test.ts`] [Evidence: `evidence/slices/P4/T030.json`]

### P5. Equity, Scientific Audit, Architecture, Calibration, And Math

- **Requirements**: REQ-029-REQ-039, REQ-073-REQ-075, REQ-077-REQ-078.
- **Design inputs**: t4 accessibility/theme/corpus boundaries; t7 map, audit, math, calibration, and graph UX.
- **Outcome**: preserved analytical workstations with complete non-visual equivalents and discoverable math/report corpus.

- [ ] T031 [P] [Plan:5.1] Port the equity map, seven metrics, country selection, independent arc state, and complete text alternative to target `src/client/features/equity/`. [Source: src/components/GlobalHealthEquityDashboard.tsx] [Source: src/components/D3WorldMap.tsx] [Source: src/data/globalHealthEquityData.ts] [Verify: `npm test -- tests/client/equity-map.test.tsx`] [Evidence: `evidence/slices/P5/T031.json`]
- [ ] T032 [P] [Plan:5.1] Implement six-region details and policy projection in target `src/client/features/equity/` with proportional domain fixtures. [Source: src/components/GlobalHealthEquityDashboard.tsx] [Source: src/data/globalHealthEquityData.ts] [Verify: `npm test -- tests/domain/equity-projection.test.ts tests/client/equity-details.test.tsx`] [Evidence: `evidence/slices/P5/T032.json`]
- [ ] T033 [P] [Plan:5.1] Port scientific audit and Nobel evaluation navigation, metrics, details, and copy feedback to target `src/client/features/audit/`. [Source: src/components/NobelEvaluationSuite.tsx] [Verify: `npm test -- tests/client/scientific-audit.test.tsx`] [Evidence: `evidence/slices/P5/T033.json`]
- [ ] T034 [P] [Plan:5.1] Port mathematical defense, citation graph, celebration behavior, and a complete non-visual graph projection to target `src/client/features/audit/`. [Source: src/components/NobelMathematicalDefense.tsx] [Source: src/components/InterParadigmCitationGraph.tsx] [Verify: `npm test -- tests/client/mathematical-defense.test.tsx tests/client/citation-graph.test.tsx`] [Evidence: `evidence/slices/P5/T034.json`]
- [ ] T035 [P] [Plan:5.1] Port architecture tabs, source narrative, and math rendering to target `src/client/features/architecture/`. [Source: src/components/RepositoryCodeArchitecture.tsx] [Source: src/components/MathRenderer.tsx] [Verify: `npm test -- tests/client/architecture.test.tsx`] [Evidence: `evidence/slices/P5/T035.json`]
- [ ] T036 [P] [Plan:5.1] Port calibration drift, report rendering, and recompute state to target `src/client/features/calibration/`. [Source: src/components/CalibrationDriftHub.tsx] [Source: src/services/calibrationReportService.ts] [Verify: `npm test -- tests/client/calibration.test.tsx`] [Evidence: `evidence/slices/P5/T036.json`]
- [ ] T037 [Plan:5.1] Implement the `/math` compatibility route in target `src/client/routes/math.lazy.tsx`, reconciling archived math with active `/architecture` surfaces. [Source: archive/legacy-monorepo/apps/web/src/components/math-explainer.tsx] [Verify: `npm test -- tests/client/math-route.test.tsx`] [Evidence: `evidence/slices/P5/T037.json`]
- [ ] T038 [Plan:5.1] Run P5 route/component/domain tests and keyboard map/graph alternatives; defer compact/wide research-audit browser execution to P10. [Verify: `npm test -- tests/client/equity-map.test.tsx tests/client/scientific-audit.test.tsx tests/client/architecture.test.tsx tests/client/calibration.test.tsx`] [Evidence: `evidence/slices/P5/T038.json`]

### P6. Comparison, Submission, Editor, And Auth Callback

- **Requirements**: REQ-040-REQ-049, REQ-069, REQ-074-REQ-075, REQ-077.
- **Design inputs**: t4 restored route/auth topology; t7 comparison/editor/auth UX.
- **Outcome**: coherent evidence lifecycle with persona-invariant evidence, protected contributions, auditable editorial actions, and recoverable auth.

- [ ] T039 [P] [Plan:6.1] Implement ranked comparison, persona-invariant projections, and `/compare/$conditionId` deep-link/empty recovery in target `src/client/features/comparison/` and `src/client/routes/condition-comparison.lazy.tsx`. [Source: archive/legacy-monorepo/apps/web/src/components/comparison-view.tsx] [Verify: `npm test -- tests/client/comparison.test.tsx`] [Evidence: `evidence/slices/P6/T039.json`]
- [ ] T040 [P] [Plan:6.1] Implement comparison snapshot, print/PDF, CSV, advanced table, and submission recovery in target `src/client/features/comparison/`. [Source: archive/legacy-monorepo/apps/web/src/components/compare-dashboard/sections.tsx] [Verify: `npm test -- tests/client/comparison-export.test.tsx`] [Evidence: `evidence/slices/P6/T040.json`]
- [ ] T041 [P] [Plan:6.1] Implement authenticated `/new` submission in target `src/client/features/submission/` and `src/client/routes/new-evidence.lazy.tsx`, retaining entered values and all contract error states. [Source: archive/legacy-monorepo/apps/web/src/components/new-evidence-form.tsx] [Verify: `npm test -- tests/client/submission.test.tsx`] [Evidence: `evidence/slices/P6/T041.json`]
- [ ] T042 [P] [Plan:6.1] Implement `/editor` identity, applied filters, paging, and export in target `src/client/features/editor/` and `src/client/routes/editor.lazy.tsx`. [Source: archive/legacy-monorepo/apps/web/src/components/editor-console.tsx] [Source: archive/legacy-monorepo/apps/web/src/lib/editor-client.ts] [Verify: `npm test -- tests/client/editor-query.test.tsx`] [Evidence: `evidence/slices/P6/T042.json`]
- [ ] T043 [P] [Plan:6.1] Implement editor taxonomy commands and publication transitions with focus retention and exact error states in target `src/client/features/editor/`. [Source: archive/legacy-monorepo/apps/web/src/components/editor-console.tsx] [Source: archive/legacy-monorepo/apps/web/src/lib/editor-client.ts] [Verify: `npm test -- tests/client/editor-mutations.test.tsx`] [Evidence: `evidence/slices/P6/T043.json`]
- [ ] T044 [Plan:6.1] Implement auth-aware shell and `/auth/callback` progress, state validation, token exchange, scrubbed parameters, allowlisted return, sign-out, and failure recovery in target `src/client/features/auth/`. [Source: archive/legacy-monorepo/apps/web/src/lib/auth.ts] [Source: archive/legacy-monorepo/apps/web/src/hooks/use-auth-session.ts] [Verify: `npm test -- tests/client/auth-callback.test.tsx`] [Evidence: `evidence/slices/P6/T044.json`]
- [ ] T045 [Plan:6.1] Run P6 component tests across contributor/viewer/editor/expired/error identities, mutation focus retention, downloads, print, and callback failures; defer cross-slice J5 browser execution until P7 is complete and P10 begins. [Verify: `npm test -- tests/client/comparison.test.tsx tests/client/submission.test.tsx tests/client/editor-query.test.tsx tests/client/editor-mutations.test.tsx tests/client/auth-callback.test.tsx`] [Evidence: `evidence/slices/P6/T045.json`]

### P7. Express Evidence, Condition, Health, And Auth Contracts

- **Requirements**: REQ-027, REQ-044-REQ-047, REQ-050-REQ-057, REQ-064, REQ-067, REQ-069, REQ-076.
- **Design inputs**: t4 global HTTP and 15-endpoint inventory; t5 atomic/non-destructive semantics.
- **Outcome**: one ordered Express app with exact headers, payloads, statuses, authorization, persistence effects, and audit.

- [ ] T046 [Plan:7.1] Implement target `src/server/app/create-app.ts` with fixed correlation/log/CORS/security/size/parser/auth/routes/not-found/error order and production-safe SPA/static handling. [Source: archive/legacy-monorepo/services/api/src/app.ts] [Source: server.ts] [Verify: `npm test -- tests/contracts/http-global.test.ts`] [Evidence: `evidence/slices/P7/T046.json`]
- [ ] T047 [P] [Plan:7.1] Implement `GET /health`, `GET/POST /conditions`, and `GET /auth/editor-status` handlers in target `src/server/routes/conditions.ts`, `health.ts`, and `auth.ts`. [Source: archive/legacy-monorepo/services/api/src/routes/evidence-routes.ts] [Source: archive/legacy-monorepo/services/api/src/app.ts] [Verify: `npm test -- tests/contracts/conditions.test.ts tests/contracts/auth.test.ts`] [Evidence: `evidence/slices/P7/T047.json`]
- [ ] T048 [P] [Plan:7.1] Implement list/export/create/publish evidence handlers in target `src/server/routes/evidence.ts` with exact filter, paging, CSV, draft, duplicate, status, audit, and error contracts. [Source: archive/legacy-monorepo/services/api/src/routes/evidence-routes.ts] [Verify: `npm test -- tests/contracts/evidence.test.ts`] [Evidence: `evidence/slices/P7/T048.json`]
- [ ] T049 [Plan:7.1] Add target `tests/contracts/http-global.test.ts`, `evidence.test.ts`, `conditions.test.ts`, and `auth.test.ts` covering all positive/boundary/error/auth/persistence cells for endpoint rows 1-15. [Verify: `npm run test:contracts`] [Evidence: `evidence/slices/P7/T049.json`]
- [ ] T050 [Plan:7.1] Start the composed target server in memory mode and run an API contract probe against all 15 method/path rows; retain request/response summaries with secrets redacted under target `evidence/slices/P7/`. [Verify: `npm run test:integration -- --contract-probe`] [Evidence: `evidence/slices/P7/contract-probe.json`]

### P8. Registry Ingestion

- **Requirements**: REQ-064, REQ-070-REQ-072, REQ-077.
- **Design inputs**: t4 ingestion contracts; t5 conditional-write and race invariants; t6 VG-08.
- **Outcome**: bounded, deterministic connectors that normalize drafts through repository ports and never overwrite or fail over.

- [ ] T051 [P] [Plan:8.1] Implement typed shared HTTP policy, parsers, normalization, connector result metadata, and fixed-clock test adapters in target `src/ingestion/shared/`. [Source: archive/legacy-monorepo/services/ingestion/src/shared/http.ts] [Source: archive/legacy-monorepo/services/ingestion/src/shared/source-parsers.ts] [Source: archive/legacy-monorepo/services/ingestion/src/shared/normalize.ts] [Verify: `npm test -- tests/ingestion/shared.test.ts`] [Evidence: `evidence/slices/P8/T051.json`]
- [ ] T052 [P] [Plan:8.1] Implement PubMed importer in target `src/ingestion/pubmed.ts` using `createImportedDraft` and structured missing-store behavior. [Source: archive/legacy-monorepo/services/ingestion/src/pubmed-ingestor.ts] [Verify: `npm test -- tests/ingestion/pubmed.test.ts`] [Evidence: `evidence/slices/P8/T052.json`]
- [ ] T053 [P] [Plan:8.1] Implement ClinicalTrials.gov, AYUSH/DHARA, and CTRI/ICTRP connectors in target `src/ingestion/connectors/` with bounded retrieval, prefixes, timestamps, and labeled deterministic fallback records. [Source: archive/legacy-monorepo/services/ingestion/src/clinicaltrials-ingestor.ts] [Source: archive/legacy-monorepo/services/ingestion/src/ayush-ingestor.ts] [Source: archive/legacy-monorepo/services/ingestion/src/ctri-ingestor.ts] [Verify: `npm test -- tests/ingestion/registries.test.ts`] [Evidence: `evidence/slices/P8/T053.json`]
- [ ] T054 [Plan:8.1] Add and run target ingestion success/timeout/retry/invalid-JSON/rate-cap/network/duplicate-race/missing-store suites in `tests/ingestion/`; assert exactly one create and byte-preserved first record. [Verify: `npm test -- tests/ingestion`] [Evidence: `evidence/slices/P8/T054.json`]

### P9. Static Discovery And Report Corpus

- **Requirements**: REQ-073, REQ-077, REQ-078.
- **Design inputs**: t4 static/corpus preservation; t7 discoverability; migration boundary copy-as-is rules.
- **Outcome**: reachable machine-readable discovery, formulas, reports, print assets, attribution, and internally valid canonical links.

- [ ] T055 [P] [Plan:9.1] Copy and reconcile `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, metadata, and manifest into target `public/`; update only target canonical links for all 14 routes. [Source: public/robots.txt] [Source: public/sitemap.xml] [Source: public/llms.txt] [Source: public/llms-full.txt] [Source: metadata.json] [Verify: `npm test -- tests/corpus/discovery-assets.test.ts`] [Evidence: `evidence/slices/P9/T055.json`]
- [ ] T056 [P] [Plan:9.1] Copy archived math, architecture, UX, deployment-reference, report, calibration, and print assets into target `public/reports/` with a provenance inventory and links from `/architecture` and `/math`. [Source: archive/legacy-monorepo/docs] [Verify: `npm test -- tests/corpus/report-inventory.test.ts`] [Evidence: `evidence/slices/P9/T056.json`]
- [ ] T057 [Plan:9.1] Add and run target `tests/corpus/discovery.test.ts` for URL reachability, content hashes, formula presence, attribution, print assets, and internal-link validity; documentation may describe deployment but no deployment is executed. [Verify: `npm test -- tests/corpus`] [Evidence: `evidence/slices/P9/T057.json`]

### P10. Mandatory Validation Tail And Parity Evidence

- **Requirements**: REQ-001-REQ-078.
- **Design inputs**: t6 complete strategy, VG-00-VG-15, J1-J8, fallback matrix, and evidence rules; t5 verification matrix; t7 browser acceptance.
- **Outcome**: full unscoped validation and a binary parity report. This phase cannot be removed, shortened, filtered, or replaced by build-only evidence.

- [ ] T058 [Plan:10.1] Run VG-00 and VG-01: prove the archive before/after manifests are identical, reconcile active-root changed files against the frozen capability inventory, perform the frozen root install, capture Node/npm/dependency versions, and prove one React/router/query runtime. [Verify: `npm run validate -- --gates VG-00,VG-01`] [Evidence: `evidence/gates/VG-00.json`, `evidence/gates/VG-01.json`]
- [ ] T059 [Plan:10.1] Run VG-02 unscoped from the active root with `npm run typecheck`, `npm run lint`, and `npm run build`; require all three return code 0 and all lazy route chunks emitted. [Verify: `npm run typecheck && npm run lint && npm run build`] [Evidence: `evidence/gates/VG-02.json`]
- [ ] T060 [Plan:10.1] Run VG-03 unscoped from the active root with `npm test`; require all 59 migrated characterization intents mapped and executed with zero required skips. [Verify: `npm test`] [Evidence: `evidence/gates/VG-03.json`]
- [ ] T061 [P] [Plan:10.1] Run VG-04/VG-05/VG-07: all 15 HTTP contracts, clinical golden fixtures, signed-token matrix, and isolated real-issuer confirmation when credentials are supplied. [Verify: `npm run validate -- --gates VG-04,VG-05,VG-07`] [Evidence: `evidence/gates/VG-04.json`, `evidence/gates/VG-05.json`, `evidence/gates/VG-07.json`]
- [ ] T062 [P] [Plan:10.1] Run VG-06/VG-08: the same repository suite against memory and a disposable DynamoDB-compatible store plus all connector stubs/races and separately labeled live-source smoke. [Verify: `npm run validate -- --gates VG-06,VG-08`] [Evidence: `evidence/gates/VG-06.json`, `evidence/gates/VG-08.json`]
- [ ] T063 [Plan:10.1] Run VG-09 only after P3-P8 complete: execute J1-J8 at compact/wide viewports, all 14 deep links, and every required pending/empty/error/auth/result state with zero console/page errors. [Verify: `npm run test:e2e -- --project=chromium`] [Evidence: `evidence/gates/VG-09.json`]
- [ ] T064 [P] [Plan:10.1] Run VG-10 visual and responsive checks at 320, 375, 768, 1024, 1280, and 1440 px plus 100%, 200%, and 400% zoom against the P1 frozen screenshots. [Verify: `npm run test:visual`] [Evidence: `evidence/gates/VG-10.json`]
- [ ] T065 [P] [Plan:10.1] Run VG-11 axe automation and the complete manual keyboard, VoiceOver, contrast, focus, zoom/reflow, reduced-motion, forced-colors, chart, and map checklist. [Verify: `npm run test:a11y`] [Evidence: `evidence/gates/VG-11.json`]
- [ ] T066 [P] [Plan:10.1] Run VG-12 on current Playwright Chromium/Firefox/WebKit and record direct or equivalent latest-two-major Chrome, Firefox, Safari, and Edge evidence with every substitution gap explicit. [Verify: `npm run test:e2e -- --project=chromium --project=firefox --project=webkit`] [Evidence: `evidence/gates/VG-12.json`]
- [ ] T067 [P] [Plan:10.1] Run VG-13 paired baseline/target probes with five warmups and at least 30 measured samples per workload under the P1 frozen runner/data/network profile; missing production telemetry or probe permission is a gate failure, never a guessed threshold. [Verify: `npm run test:performance`] [Evidence: `evidence/gates/VG-13.json`]
- [ ] T068 [P] [Plan:10.1] Run VG-14 corpus/discovery reachability and semantic-completeness checks across public assets, reports, formulas, print styles, and machine-readable content. [Verify: `npm test -- tests/corpus`] [Evidence: `evidence/gates/VG-14.json`]
- [ ] T069 [Plan:10.1] Build target `evidence/traceability/requirements.json` with 78 requirement-to-design-to-task-to-test rows, 23 unit rows, six state-flow rows, and links to every raw gate report; run VG-15 completeness validation. [Verify: `npm run validate -- --gates VG-15`] [Evidence: `evidence/gates/VG-15.json`]
- [ ] T070 [Plan:10.1] Produce `evidence/parity-report.md` with changed active-root files, archive integrity, frozen root capability preservation, per-gate PASS/FAIL, test pass/fail/skip counts, parity status, unresolved HIGH/CRITICAL findings, and remaining external prerequisites. Preserve the archive regardless of verdict; do not deploy, commit, push, remove archive content, or remove active-root capabilities. [Verify: `npm run validate -- --report evidence/parity-report.md`] [Evidence: `evidence/parity-report.md`]

## Project Structure

```text
/Users/rraviku2/aarti/salus-pramana-medical/
├── package.json
├── src/
│   ├── client/{app,routes,features,services,state,theme,components}
│   ├── server/{app,routes,auth,config}
│   ├── application/{conditions,evidence,intelligence,ingestion}
│   ├── domain/{contracts,clinical,export}
│   ├── persistence/{contracts,memory,dynamodb}
│   ├── ingestion/{shared,connectors}
│   └── shared/
├── public/{reports,robots.txt,sitemap.xml,llms.txt,llms-full.txt}
├── tests/{architecture,auth,browser,client,contracts,corpus,domain,fixtures,ingestion,persistence}
└── evidence/{foundations,gates,slices,source-integrity,traceability}
```

## Testing Strategy

- **appType**: mixed React SPA, Express API, persistence adapters, and scheduled/batch ingestion.
- **Critical journeys**: J1 discover-to-decision; J2 clinical safety; J3 AI reasoning; J4 equity/research audit; J5 evidence lifecycle; J6 intelligence APIs; J7 data continuity/ingestion; J8 discovery/recovery/access.
- **primaryValidationStack**: TypeScript/lint/Vite build; Vitest unit/component; Supertest HTTP; memory plus disposable DynamoDB-compatible repository suite; Playwright Chromium/Firefox/WebKit; axe-core and manual assistive technology; visual and non-functional comparison.
- **Infrastructure fallback**: remote disposable DynamoDB-compatible account when Docker is unavailable; memory-only supports iteration but VG-06 remains `FAIL`.
- **Browser fallback**: framework/Supertest checks may support iteration if browser installation fails, but VG-09 through VG-12 remain `FAIL`.
- **Environment**: Node.js 22, frozen npm install, Playwright browsers, Docker or isolated DynamoDB-compatible store, local signed-JWT fixture server, isolated Cognito-compatible issuer, deterministic registry stubs, optional read-only live registry access, and read-only production references.
- **Known gaps**: current Docker daemon unavailable; Playwright installation unproven; production screenshots/telemetry, isolated Cognito identities, direct latest-two-major browser access, and live connector access are external prerequisites.
- **Test data**: provenance-tagged non-PHI fixtures, fixed UTC clock, seeded pseudo-random values, `${runId}-${fixtureId}` keys, fresh browser contexts, disposable tables, and cleanup limited to run-owned data.
- **Baseline prerequisite**: T007 must freeze every obtainable authoritative artifact before P2. Its `prerequisites.json` blocks only the affected capability/gate when external access is absent; evidence is never synthesized or deferred silently.
- **API configuration authority**: same-origin `/api` is the only browser contract; Vite has the only development proxy to Express `127.0.0.1:8787`; `PORT` and one CORS allowlist are the only server overrides; T005 rejects duplicate or divergent configurations.
- **Acceptance**: each task runs its narrow suite; each VG gate is binary; final parity requires VG-00 through VG-15 PASS, 78/78 traceability, 23/23 units, six/six state flows, zero required skips, and zero unresolved HIGH/CRITICAL findings.
- **Review**: tester executes t6 exactly; a later independent teamlead gate reviews evidence conformance and does not reinterpret missing proof.

## Requirement Mapping

| Requirement | Description | Plan items | Task IDs | Implementation/test evidence |
| --- | --- | --- | --- | --- |
| REQ-001 | Router/deep-link/state recovery | P3, P10 | T018, T023, T058, T063, T064, T065, T066, T069 | `src/client/app/router.tsx`; router and J8 tests |
| REQ-002 | Home search corpus | P3, P10 | T020, T021, T022, T023, T059, T060, T063, T064, T065, T066, T069 | `features/home`; home/J1 tests |
| REQ-003 | Recent-search storage/fallback | P3, P10 | T020, T021, T022, T023, T059, T060, T063, T064, T065, T066, T069 | `services/browser/recent-searches.ts`; blocked-storage tests |
| REQ-004 | Suggestions and keyboard control | P3, P10 | T020, T021, T022, T023, T059, T060, T063, T064, T065, T066, T069 | home combobox; keyboard tests |
| REQ-005 | Search result fields/actions | P3, P10 | T020, T021, T022, T023, T059, T060, T063, T064, T065, T066, T069 | result projection; J1 tests |
| REQ-006 | Share feedback | P3, P10 | T020, T021, T022, T023, T059, T060, T063, T064, T065, T066, T069 | share adapter; clipboard tests |
| REQ-007 | CSV/JSON export | P3, P10 | T020, T021, T022, T023, T059, T060, T063, T064, T065, T066, T069 | domain export; golden download tests |
| REQ-008 | Evidence notifications | P3, P10 | T020, T021, T022, T023, T059, T060, T063, T064, T065, T066, T069 | subscription repository; persistence tests |
| REQ-009 | Pramana sandbox | P2, P3, P10 | T011, T020, T021, T022, T023, T061, T063, T064, T065, T066, T069 | clinical Pramana; golden UI/domain tests |
| REQ-010 | Citation formats | P3, P10 | T020, T021, T022, T023, T059, T060, T063, T064, T065, T066, T068, T069 | citation formatter; golden copy tests |
| REQ-011 | Home content/shell | P3, P10 | T018, T019, T020, T021, T022, T023, T063, T064, T065, T066, T069 | shell/home; responsive/visual tests |
| REQ-012 | Cross-system context | P4, P10 | T025, T030, T061, T063, T064, T065, T066, T069 | intelligence feature; fixture tests |
| REQ-013 | Condition intelligence | P2, P4, P10 | T011, T016, T025, T030, T061, T069 | clinical/application intelligence; golden tests |
| REQ-014 | Evidence ledger filters | P4, P10 | T025, T030, T061, T063, T064, T065, T066, T069 | ledger query feature; matrix tests |
| REQ-015 | Evidence detail/provenance | P4, P10 | T025, T030, T061, T063, T064, T065, T066, T069 | evidence projection; detail tests |
| REQ-016 | ODE handoff | P3, P4, P10 | T018, T025, T026, T030, T063, T064, T065, T066, T069 | app state/router; cross-route test |
| REQ-017 | Fail-closed intelligence | P2, P4, P10 | T011, T016, T025, T030, T061, T069 | fail-closed constructor; zero-evidence tests |
| REQ-018 | ODE bounded inputs | P2, P4, P10 | T011, T026, T030, T061, T063, T064, T065, T066, T069 | ODE feature/domain; boundary tests |
| REQ-019 | RK4 trajectories | P2, P4, P10 | T011, T026, T030, T061, T063, T064, T065, T066, T069 | RK4 service; 15-minute golden tests |
| REQ-020 | ODE result projection | P4, P10 | T026, T030, T061, T063, T064, T065, T066, T069 | ODE result UI; journey tests |
| REQ-021 | Delay/baseline/severity | P2, P4, P10 | T011, T026, T030, T061, T063, T064, T065, T066, T069 | RK4 constants; boundary fixtures |
| REQ-022 | Workbench state | P4, P10 | T026, T030, T061, T063, T064, T065, T066, T069 | workbench reducer; reset tests |
| REQ-023 | Safety audit | P2, P4, P10 | T011, T026, T030, T061, T063, T064, T065, T066, T069 | safety service/UI; severity tests |
| REQ-024 | Clinical thresholds | P2, P4, P10 | T011, T026, T030, T061, T063, T064, T065, T066, T069 | named constants; exact fixtures |
| REQ-025 | Hill dose optimizer | P2, P4, P10 | T011, T026, T030, T061, T063, T064, T065, T066, T069 | dose service/UI; frontier tests |
| REQ-026 | AI reasoning states | P4, P10 | T027, T030, T061, T063, T064, T065, T066, T069 | AI feature; state/persona tests |
| REQ-027 | Clinical AI endpoint | P4, P7, P10 | T027, T029, T049, T050, T061, T069 | clinical AI route; fallback contracts |
| REQ-028 | AI no-upgrade safety | P2, P4, P10 | T016, T027, T029, T030, T061, T069 | application AI adapter; invariant tests |
| REQ-029 | Accessible equity map | P5, P10 | T031, T032, T038, T063, T064, T065, T066, T069 | equity feature; keyboard/text tests |
| REQ-030 | Arc state independence | P5, P10 | T031, T032, T038, T063, T064, T065, T066, T069 | equity state; toggle test |
| REQ-031 | Country/region details | P5, P10 | T031, T032, T038, T063, T064, T065, T066, T069 | equity projections; fixture tests |
| REQ-032 | Policy projection | P5, P10 | T031, T032, T038, T063, T064, T065, T066, T069 | projection function; proportional tests |
| REQ-033 | Equity labels/context | P5, P10 | T031, T032, T038, T063, T064, T065, T066, T069 | summary primitives; label tests |
| REQ-034 | Scientific audit | P5, P10 | T033, T034, T038, T063, T064, T065, T066, T069 | audit route; content/navigation tests |
| REQ-035 | Audit metric details | P5, P10 | T033, T034, T038, T063, T064, T065, T066, T069 | audit filters; detail tests |
| REQ-036 | Mathematical defense | P5, P10 | T033, T034, T038, T063, T064, T065, T066, T069 | math defense; copy/action tests |
| REQ-037 | Architecture tabs | P5, P10 | T035, T036, T038, T063, T064, T065, T066, T068, T069 | architecture feature; tab tests |
| REQ-038 | Calibration report | P2, P5, P10 | T011, T035, T036, T038, T061, T063, T064, T065, T066, T069 | calibration service/UI; golden cycle tests |
| REQ-039 | Citation graph | P5, P10 | T033, T034, T038, T063, T064, T065, T066, T068, T069 | graph/text projection; accessibility tests |
| REQ-040 | Persona comparison | P3, P6, P10 | T020, T021, T022, T039, T040, T045, T063, T064, T065, T066, T069 | comparison lens; invariance tests |
| REQ-041 | Ranked comparison | P6, P10 | T039, T040, T045, T063, T064, T065, T066, T069 | comparison sections; projection tests |
| REQ-042 | Snapshot/PDF/CSV | P6, P10 | T039, T040, T045, T063, T064, T065, T066, T069 | export boundaries; browser download tests |
| REQ-043 | Comparison deep link | P6, P10 | T039, T040, T045, T063, T064, T065, T066, T069 | comparison route; empty/recovery tests |
| REQ-044 | Evidence submission | P6, P7, P10 | T041, T045, T048, T049, T061, T063, T064, T065, T066, T069 | submission UI/API; lifecycle tests |
| REQ-045 | Editor query workflow | P6, P7, P10 | T042, T043, T045, T048, T049, T061, T063, T064, T065, T066, T069 | editor UI/client; filter/page tests |
| REQ-046 | Condition editorial command | P6, P7, P10 | T042, T043, T045, T047, T049, T061, T063, T064, T065, T066, T069 | taxonomy UI/API; status tests |
| REQ-047 | Publication transitions | P6, P7, P10 | T042, T043, T045, T048, T049, T061, T063, T064, T065, T066, T069 | editor/API command; audit tests |
| REQ-048 | Auth shell/callback | P2, P6, P10 | T015, T044, T045, T061, T063, T064, T065, T066, T069 | PKCE feature; callback tests |
| REQ-049 | Recovery states | P3, P6, P10 | T018, T019, T023, T045, T063, T064, T065, T066, T069 | shared boundaries; J8 tests |
| REQ-050 | Global HTTP/health | P7, P10 | T046, T047, T049, T050, T061, T067, T069 | Express root/health; contract tests |
| REQ-051 | Condition list | P7, P10 | T047, T049, T050, T061, T067, T069 | condition route; schema tests |
| REQ-052 | Condition create/audit | P2, P7, P10 | T016, T047, T049, T050, T061, T067, T069 | condition command; auth/audit matrix |
| REQ-053 | Evidence query | P2, P7, P10 | T012, T013, T048, T049, T050, T061, T067, T069 | evidence query; filter/page contracts |
| REQ-054 | Evidence CSV API | P7, P10 | T048, T049, T050, T061, T067, T069 | CSV handler; 15-column golden test |
| REQ-055 | Evidence create | P2, P7, P10 | T016, T048, T049, T050, T061, T067, T069 | evidence command; status/audit matrix |
| REQ-056 | Publication API | P2, P7, P10 | T016, T048, T049, T050, T061, T067, T069 | publish command; transition matrix |
| REQ-057 | Editor-status API | P2, P7, P10 | T015, T047, T049, T050, T061, T067, T069 | auth route; claims/no-secret tests |
| REQ-058 | Condition intelligence API | P2, P4, P10 | T016, T028, T030, T061, T067, T069 | condition service/route; mode/gate tests |
| REQ-059 | Evidence intelligence API | P2, P4, P10 | T016, T028, T030, T061, T067, T069 | evidence service/route; auth/404 tests |
| REQ-060 | Governance gates API | P2, P4, P10 | T016, T028, T030, T061, T067, T069 | gate service/route; report tests |
| REQ-061 | Interaction API | P2, P4, P10 | T011, T016, T028, T030, T061, T067, T069 | interaction service/route; clamp tests |
| REQ-062 | Trajectory API | P2, P4, P10 | T011, T016, T028, T030, T061, T067, T069 | trajectory service/route; error tests |
| REQ-063 | Dose API | P2, P4, P10 | T011, T016, T028, T030, T061, T067, T069 | dose service/route; bounded/error tests |
| REQ-064 | Additive contracts | P2, P7, P8, P10 | T010, T012, T013, T048, T051, T061, T062, T069 | domain contracts; shape/validation suite |
| REQ-065 | DynamoDB compatibility | P2, P10 | T013, T014, T017, T062, T069 | DynamoDB adapter; disposable integration tests |
| REQ-066 | Memory parity/no failover | P2, P10 | T012, T014, T017, T062, T069 | memory/selector; shared contract suite |
| REQ-067 | Append-only audit | P2, P7, P10 | T010, T013, T016, T047, T048, T061, T062, T069 | audit repository; atomic/no-secret tests |
| REQ-068 | Idempotent seed | P2, P10 | T012, T013, T014, T017, T062, T069 | seed service; byte-preservation tests |
| REQ-069 | Cognito-compatible auth | P2, P6, P7, P10 | T015, T044, T045, T047, T049, T061, T069 | browser/server auth; full identity matrix |
| REQ-070 | PubMed ingestion | P8, P10 | T052, T054, T062, T067, T069 | PubMed importer; dedupe tests |
| REQ-071 | Registry connectors | P8, P10 | T051, T053, T054, T062, T067, T069 | connector modules; source fixture tests |
| REQ-072 | Shared HTTP policy | P8, P10 | T051, T053, T054, T062, T067, T069 | HTTP policy; failure-kind tests |
| REQ-073 | Discovery assets | P3, P5, P9, P10 | T018, T037, T055, T057, T063, T064, T065, T066, T068, T069 | public assets; reachability tests |
| REQ-074 | WCAG 2.2 AA | P3, P4, P5, P6, P10 | T019, T023, T030, T038, T045, T063, T064, T065, T066, T069 | shared primitives; axe/manual matrix |
| REQ-075 | Responsive/browser support | P3, P4, P5, P6, P10 | T019, T023, T030, T038, T045, T063, T064, T065, T066, T069 | theme/features; viewport/browser matrix |
| REQ-076 | Exact singleton stack | P1, P2, P3, P7, P10 | T001, T002, T009, T014, T018, T046, T058, T059, T060, T069 | package/architecture tests; VG-01/VG-02 |
| REQ-077 | Dataset/corpus continuity | P1, P2, P3, P4, P5, P6, P8, P9, P10 | T006, T008, T011, T020, T021, T022, T025, T026, T031, T032, T033, T034, T035, T036, T039, T040, T051, T055, T056, T058, T061, T062, T068, T069 | fixtures/data modules; identity/hash tests |
| REQ-078 | Math/report corpus | P5, P9, P10 | T035, T036, T037, T056, T057, T063, T064, T065, T066, T068, T069 | math route/reports; discovery tests |

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/clarification.md` - submitted stack, output, parity, browser, accessibility, auth/data, and no-reconfirmation decisions.
- `.github/modernize/rearchitecture/artifacts/t4-architect.md` and its three linked details - target boundaries, frozen contracts, and REQ-to-design ownership.
- `.github/modernize/rearchitecture/artifacts/t5-dba.md` - additive schemas, explicit adapters, atomicity, rollback, and persistence verification.
- `.github/modernize/rearchitecture/artifacts/t6-teamlead.md` - mandatory validation stack, J1-J8, VG-00-VG-15, evidence, and fallback rules.
- `.github/modernize/rearchitecture/artifacts/t7-ux.md` - responsive, interaction, WCAG, visual, browser, and assistive-technology acceptance.
- `.github/modernize/rearchitecture/artifacts/t3-pm.md` and `t3-pm-capability-inventory.md` - complete 78-requirement product specification.

## Evidence Mapping

- `t4-architect-target-architecture.md#Target-Module-Map` -> target project structure and P1-P9 boundaries.
- `t4-architect-api-contracts.md#HTTP-Endpoint-Inventory` -> P4/P7 handlers and T049/T050/T061 contract evidence.
- `t4-architect-requirement-map.md#Requirement-To-Target-Design-Map` -> 78-row Requirement Mapping and checkpoint.
- `t5-dba.md#Verification-Matrix` -> T013/T014/T017/T062 persistence evidence.
- `t6-teamlead.md#Measurable-Validation-Gates` -> P10/T058-T070 mandatory validation tail.
- `t7-ux.md#Requirement-Coverage-Matrix` -> P3-P6 UI tasks and T063-T066 browser/accessibility evidence.
- `t3-pm-capability-inventory.md#User-Scenarios-and-Independent-Acceptance` -> J1-J8 test strategy.

## Test Results

- Command: Node structural validation for REQ-001 through REQ-078, P1-P10, T001-T070, VG-00 through VG-15, required scripts, upstream sections, checkpoint consistency, and forbidden unresolved placeholders.
- Passed: 78 requirements; 10 plan items; 70 tasks; 16 gates; 2 checkpoints; 0 missing links.
- Failed: 0.
- Skipped: application execution; this task creates the implementation plan and does not modify target application source.
