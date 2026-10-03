# t6 - Full Validation Strategy And Measurable Gates

## Decision Summary

SALUS Pramana is a mixed React SPA, Express API, persistence, and scheduled-ingestion rewrite.
Validation therefore uses Vitest for deterministic unit and in-process integration coverage,
Supertest for Express contracts, Playwright for browser journeys and visual evidence, axe-core plus
manual assistive-technology checks for WCAG 2.2 AA, and one repository contract suite executed
against both memory and a disposable DynamoDB-compatible store.

Parity is binary. A gate is `PASS` only when every required check has a retained result and zero
failures. Any missing evidence, unexplained skip, untested requirement, archive mutation,
constitution violation, or unresolved HIGH/CRITICAL finding makes the gate and overall parity
`FAIL`. Fallback execution may support local iteration, but it cannot satisfy a final gate whose
required production-fidelity tier remains unexecuted.

## Constitution Check

- The active root and current production-observable behavior are authoritative; archived behavior
  is additive where it does not conflict.
- Frozen pre-change evidence from `/Users/rraviku2/aarti/salus-pramana-medical` is the parity
  baseline; implementation and generated evidence belong in that active root.
- `archive/legacy-monorepo` remains a read-only parity reference and runtime dependency imports
  from it are prohibited.
- All 78 requirements, 14 browser paths, 15 HTTP method/path contracts, 23 architecture units, and
  six cross-unit state flows require executable evidence.
- Clinical decisions, authorization, persistence effects, audit records, and ingestion outcomes
  are compared semantically, not accepted from screenshots or build success.
- Deployment, Git commit/push, archive removal, production-data mutation, and removal of active-root
  behavior are excluded from validation activity.

## Measured Pre-Implementation Baseline

| Item | Evidence captured on 2026-09-30 | Consequence |
| --- | --- | --- |
| Active canonical command | `npm test` | Must remain the target aggregate unit command |
| Active result | 1 file, 2 tests passed, 0 failed, 0 skipped | Floor only; it covers route constants, not product parity |
| Discovered legacy assets | 10 files, 57 assertions | Preserve semantic intent and migrate into target aggregate tests |
| Legacy canonical command | `npm test` from `archive/legacy-monorepo` | Retained as characterization source, not the target command |
| Legacy execution | Blocked before discovery by workspace dependency resolution after an interrupted frozen install | Not passing evidence; target migration must execute all mapped assertions |
| Runtime | Node `v22.19.0`, npm `9.9.4` | Satisfies the Node.js 22 target for planning/baseline work |
| Docker axis | `docker info` failed; daemon unavailable | Memory tests may proceed; final DynamoDB adapter gate needs a restored daemon or isolated remote equivalent |
| Browser axis | Node available; Playwright package/browser installation not yet proven in the target | Playwright remains required; install and record browsers before browser validation |

Production screenshots, production/API latency samples, availability history, isolated Cognito
issuer credentials, and a disposable DynamoDB-compatible environment were not supplied to this
task. They are required inputs to their respective final gates and may not be replaced with guessed
numbers or production mutations.

## Legacy Test Asset Strategy

`migrationDecision: reuse-with-edits`. The target keeps the assertion intent, fixture values, and
positive/negative semantics while adapting imports and harness wiring to the single target package.
Passing assertions are not restructured. If more than 50% of a source test must change, its mapping
record must justify a journey-level rewrite.

| Source suite | Assertions | Target evidence family |
| --- | ---: | --- |
| `src/app/route-paths.test.ts` | 2 | Router manifest and deep-link unit tests |
| `packages/domain/src/index.test.ts` | 6 | Domain schema/allowlist characterization |
| `services/api/src/app.test.ts` | 19 | Supertest API contract suite |
| `services/api/src/editorial-auth.test.ts` | 6 | Cognito claim and editor authorization matrix |
| `services/api/src/intelligence.test.ts` | 4 | Clinical golden fixtures and fail-closed decisions |
| `services/api/src/ode-solver.test.ts` | 5 | RK4 trajectory and severity golden fixtures |
| `services/ingestion/src/pubmed-ingestor.test.ts` | 1 | Import configuration/error contract |
| `services/ingestion/src/shared/http.test.ts` | 4 | Timeout, retry, rate-cap, and structured-error contract |
| `services/ingestion/src/source-ingestors.test.ts` | 4 | Connector outcome/freshness contract |
| `services/ingestion/src/source-parsers.test.ts` | 5 | Registry parser fixtures |
| `apps/web/src/smoke.test.ts` | 3 | Browser-client API behavior/component tests |

The two active and 57 archived assertions total 59. Their migration mapping must name the source
test, target test, retained intent, and reason for every changed expectation. No source test is
discarded merely because the source suite currently cannot execute.

## Primary Validation Stack

| Tier | Required implementation | Required scope |
| --- | --- | --- |
| Static | TypeScript 7 typecheck, lint, Vite 8 production build | Entire target package, no filters or weakened flags |
| Unit | Vitest 5 | Pure clinical/domain services, parsers, state helpers, UI behavior, all migrated characterization tests |
| Integration | Vitest + Supertest + injected adapters/provider stubs | Full Express composition, middleware order, all routes, audit effects, fallback behavior |
| Persistence | Shared parameterized repository suite | Memory plus disposable DynamoDB-compatible store, identical fixtures and assertions |
| Browser E2E | Playwright TypeScript | All critical journeys, routes, states, downloads, responsive/browser behavior |
| Accessibility | `@axe-core/playwright` plus manual WCAG matrix | Every route and required modal/loading/empty/error/auth/result state |
| Visual | Playwright screenshots against frozen authoritative captures | Active-root states at matching viewport/data/persona; restored views against approved target UX |
| Non-functional | Repeatable HTTP/browser/ingestion harness | Latency, error ratio, availability, ingestion duration/outcome versus frozen baseline |

The target `package.json` must expose `build`, `lint`, `test`, `test:contracts`, `test:integration`,
`test:e2e`, `test:a11y`, `test:visual`, `test:performance`, and an aggregate `validate` script. The
aggregate must execute every required suite and fail on any child nonzero return code. New tests
must not live behind an unreferenced command.

## Independent Capability Fallback Matrix

| Axis | Primary | Permitted iteration fallback | Coverage lost | Final parity rule |
| --- | --- | --- | --- | --- |
| Infrastructure, Docker available | Disposable DynamoDB-compatible service plus memory adapter | None | None | Both adapter runs required |
| Infrastructure, Docker unavailable | Remote disposable DynamoDB-compatible test account; memory for local fast tests | Memory only while blocked | SDK, pagination, conditional/transactional, index/TTL fidelity | Memory-only result is FAIL for VG-06 |
| Browser, Node and Playwright available | Chromium, Firefox, WebKit; direct branded matrix where available | None | None | Browser evidence required |
| Browser install unavailable | Playwright browser suite | Framework/Supertest integration tests | Rendering, focus, downloads, route chunks, browser storage, responsive and visual behavior | HTTP-only result is FAIL for VG-09 through VG-12 |

Each fallback record must include the attempted command, return code, exact error, attempted
remediation, affected axis, and lost coverage. Docker failure never permits dropping Playwright;
Playwright failure never permits dropping the disposable persistence tier.

## Test Infrastructure Contract

### External Dependencies

| Dependency | Test strategy | Configuration and isolation |
| --- | --- | --- |
| Generative AI | Deterministic provider stub for all required assertions; one optional credentialed smoke | Stub both success and provider error; verify deterministic fallback and that AI never upgrades gates |
| Cognito/JWKS | Local signed JWT fixture server for complete matrix; isolated real issuer confirmation | Ephemeral keys, issuer/audience/email/group fixtures; no real tokens in logs/artifacts |
| DynamoDB | Disposable compatible store plus memory adapter | Run-scoped table names and IDs; never point mutation tests at production |
| Registry APIs | Protocol-level HTTP stubs for deterministic suites; separately labeled live connector smoke | Fixture success, timeout, retry status, invalid JSON, rate cap, network failure, and freshness |
| Browser storage | Fresh Playwright context per test | IndexedDB available/blocked and local/session storage seeded only by the test |
| Downloads/clipboard/print | Browser fixtures and temporary output directory | Assert bytes, MIME type, filenames, schema, print layout, and cleanup after run |
| Production reference | Read-only browser/API probes and frozen captures | Same content, persona, viewport, network profile, and sampling protocol as target |

Shared test setup must provide an Express app factory, provider stubs, signed-token helpers,
repository factory, seeded clinical fixtures, registry HTTP fixture server, deterministic clock,
unique run ID, and Playwright authenticated/anonymous contexts. Every architecture unit receives a
startup/import test during scaffold, then capability-specific tests during implementation. Each
implementation task runs its narrow suite and reports pass/fail/skip counts; any failure blocks the
task.

### Test Data

- Freeze active-root and archive data into provenance-tagged, non-PHI fixtures. Preserve formula
  constants, labels, identifiers, links, statuses, and old/additive record shapes.
- Use `${runId}-${fixtureId}` keys and isolated tables/browser contexts. Tests assume no pre-existing
  records and clean only their own disposable data.
- Use a fixed UTC clock and seeded pseudo-random generator. Dynamic production timestamps are
  masked only in visual comparisons and remain structurally asserted.
- Mutation tests never target production. Production probes are read-only.

## Critical Journey Acceptance

| Journey | Requirement scope | Required executable acceptance |
| --- | --- | --- |
| J1 Discover to decision | REQ-001-017, REQ-040-043 | Search condition/evidence, retain query/persona, compare, inspect ledger/source, export, hand off to ODE; empty evidence returns exact fail-closed state |
| J2 Clinical safety | REQ-018-025, REQ-077 | Boundary eGFR/pregnancy/regimen fixtures reproduce alerts, one optimal dose, 15-minute RK4 trajectories, threshold times, severity, and protocol with zero categorical divergence |
| J3 AI reasoning | REQ-026-028 | Provider success/error and missing credentials return required source/content states; generated text cannot alter deterministic warning or recommendation |
| J4 Equity and research audit | REQ-029-039, REQ-078 | Keyboard/pointer map, policy updates, audit filters, formulas, calibration, graph alternatives, copy actions, and report corpus remain reproducible and sourced |
| J5 Evidence lifecycle | REQ-044-057, REQ-067, REQ-069 | Contributor/viewer/editor matrices cover callback, submit draft, duplicate, taxonomy, filter/page/export, publish/reject, audit, expiry, and exact 400/401/403/404/409/503 semantics |
| J6 Intelligence APIs | REQ-050, REQ-058-063 | Middleware and all intelligence endpoints preserve payload/status/header/error contracts; strict gates only downgrade and processing errors fail closed |
| J7 Data continuity and ingestion | REQ-064-072 | Old shapes, status union, adapter parity, atomic audit, idempotent seed, duplicate races, connector errors/fallback metadata, and no silent store failover pass |
| J8 Discovery, recovery, and access | REQ-001, REQ-048-049, REQ-073-076 | Every path deep-links; chunk/API/storage/auth failures recover; static discovery works; keyboard, screen reader, reflow, zoom, reduced motion, visual and browser checks pass |

## Clinical Golden-Fixture Rules

- Recommendation class, governance gate result, insufficiency state, contraindication level,
  severity class, optimal-candidate identity, warning text keys, registry/source identity, and audit
  action are exact-match fields. One mismatch is CRITICAL and fails VG-05.
- Displayed numeric values must exactly match the authoritative rendered value after the preserved
  rounding rule. For raw deterministic floating-point outputs, use
  $|target-baseline| \le \max(10^{-12}, 10^{-9}|baseline|)$; no tolerance applies to bounds,
  timestamps generated from the fixed clock, sample counts, or categorical thresholds.
- ODE fixtures assert every 15-minute integration point before display sampling, non-negative
  concentrations, exact intervention delay, peak value/time, and `<20`, `20-44`, `45-74`, `75+`
  boundary classifications.
- Score, calibration, Hill-dose, and ODE fixtures include ordinary, exact-boundary, empty,
  non-finite/invalid, and fail-closed cases. Snapshot-only evidence is insufficient.

## Measurable Validation Gates

| Gate | Evidence | PASS condition |
| --- | --- | --- |
| VG-00 Preservation integrity | Before/after cryptographic archive manifest plus frozen active-root capability/baseline inventory | Zero archive additions, removals, or byte changes; every pre-change active-root capability remains implemented and evidenced |
| VG-01 Toolchain/install | `node --version`, package-manager version, frozen install log, dependency tree | Node 22; mandated package majors; frozen install rc 0; no duplicate React/router/query runtime |
| VG-02 Static/full build | Unscoped `npm run lint` and `npm run build` | Both rc 0; all lazy chunks emitted; zero type/lint/build errors |
| VG-03 Unit/characterization | Unscoped `npm test` plus 59-row legacy mapping | rc 0; zero failed/skipped required assertions; every mapped intent executes |
| VG-04 HTTP contracts | Supertest contract matrix for 15 method/path rows plus global middleware | 15/15 positive contracts and every applicable boundary/error/auth/persistence cell pass; exact status/body/header assertions |
| VG-05 Clinical determinism | Versioned golden fixtures and diff report | All fixtures within numeric rule; zero categorical, safety, source, gate, or fail-closed divergence |
| VG-06 Persistence/data | Same repository suite on memory and disposable DynamoDB-compatible store | Identical observable DTOs/outcomes; zero destructive writes, silent failovers, unaudited API mutations, pagination loss, or race overwrites |
| VG-07 Identity/security behavior | Local signed-token matrix plus isolated real issuer confirmation | Missing/malformed/expired/wrong issuer/wrong audience/viewer/editor/config cases return exact semantics; no token/body leak |
| VG-08 Ingestion | Stubbed and live-labeled connector suites | All four connectors pass success and defined failure cases; one conditional winner per duplicate race; bounded retries/caps; no overwrite |
| VG-09 Browser journeys | Playwright traces for J1-J8 at compact and wide viewports | 8/8 journeys pass; 14/14 paths deep-link; all required pending/empty/error/auth/result states pass; no console/page errors |
| VG-10 Visual/responsive | Frozen captures and layout assertions at 320, 375, 768, 1024, 1280, 1440 px; 100%, 200%, 400% zoom | No overlap/clipping/page scroll; critical regions have zero unexpected pixels; other active-root snapshots use `maxDiffPixelRatio <= 0.001` with reviewed masks only for nondeterministic values |
| VG-11 WCAG 2.2 AA | axe results plus manual keyboard, VoiceOver, Chromium screen-reader, contrast, focus, zoom/reflow, reduced-motion, forced-colors checklist | Zero unresolved applicable automated violations; 100% required manual checks pass; no keyboard trap or inaccessible chart/map-only meaning |
| VG-12 Browser compatibility | Current Playwright Chromium/Firefox/WebKit plus latest-two-major direct or equivalent-engine matrix | Every required J1/J2 path and one smoke per remaining route pass with zero blocking behavioral difference; substitutions name residual gap |
| VG-13 Non-functional baseline | Frozen baseline and target raw samples under identical runner/data/network profile | Target p50/p95 latency and error ratio do not exceed baseline; availability success ratio does not fall below baseline; ingestion duration does not exceed baseline and outcomes are identical |
| VG-14 Corpus/discovery | URL/content/hash inventory for public assets and reconciled reports | Required discovery files and math/print/machine-readable corpus are reachable, internally linked, and semantically complete |
| VG-15 Traceability/parity | Machine-readable REQ-to-design-to-task-to-test matrix and all gate reports | 78/78 complete links; 23/23 units and six state flows evidenced; VG-00 through VG-14 PASS; zero unresolved HIGH/CRITICAL; archive retained |

For VG-13, capture baseline and target with the same warm-up and sampling procedure: five warm-up
requests, at least 30 measured samples per API/route workload, and the same concurrency, fixture,
machine, browser, and network profile. Availability uses the same fixed-duration synthetic probe
window and interval for both systems. Ingestion uses the same frozen source payload and item count.
If production telemetry or a reproducible read-only production probe is unavailable, VG-13 is
`FAIL` for missing baseline evidence; no numeric target may be invented.

## Requirement-To-Gate Coverage

| Requirements | Primary gates |
| --- | --- |
| REQ-001, REQ-002, REQ-003, REQ-004, REQ-005 | VG-03, VG-09, VG-10, VG-11, VG-12 |
| REQ-006, REQ-007, REQ-008, REQ-009, REQ-010, REQ-011 | VG-03, VG-09, VG-10, VG-11, VG-14 |
| REQ-012, REQ-013, REQ-014, REQ-015, REQ-016, REQ-017 | VG-03, VG-05, VG-09, VG-11 |
| REQ-018, REQ-019, REQ-020, REQ-021 | VG-03, VG-05, VG-09, VG-11, VG-12 |
| REQ-022, REQ-023, REQ-024, REQ-025 | VG-03, VG-05, VG-09, VG-11, VG-12 |
| REQ-026, REQ-027, REQ-028 | VG-03, VG-04, VG-05, VG-09 |
| REQ-029, REQ-030, REQ-031, REQ-032, REQ-033 | VG-03, VG-09, VG-10, VG-11, VG-12 |
| REQ-034, REQ-035, REQ-036, REQ-037, REQ-038, REQ-039 | VG-03, VG-05, VG-09, VG-10, VG-11 |
| REQ-040, REQ-041, REQ-042, REQ-043 | VG-03, VG-09, VG-10, VG-11, VG-12 |
| REQ-044, REQ-045, REQ-046, REQ-047, REQ-048, REQ-049 | VG-04, VG-06, VG-07, VG-09, VG-11 |
| REQ-050, REQ-051, REQ-052, REQ-053, REQ-054, REQ-055, REQ-056, REQ-057 | VG-04, VG-06, VG-07, VG-13 |
| REQ-058, REQ-059, REQ-060, REQ-061, REQ-062, REQ-063 | VG-04, VG-05, VG-06, VG-07, VG-13 |
| REQ-064, REQ-065, REQ-066, REQ-067, REQ-068, REQ-069 | VG-03, VG-04, VG-06, VG-07 |
| REQ-070, REQ-071, REQ-072 | VG-03, VG-06, VG-08, VG-13 |
| REQ-073 | VG-09, VG-14 |
| REQ-074 | VG-09, VG-10, VG-11, VG-12 |
| REQ-075 | VG-09, VG-10, VG-12 |
| REQ-076 | VG-01, VG-02, VG-09 |
| REQ-077 | VG-00, VG-03, VG-05, VG-06, VG-14 |
| REQ-078 | VG-09, VG-10, VG-11, VG-14 |

Every row also inherits VG-15. Grouping requirements here does not permit grouped implementation
evidence: the final traceability file must contain one independently reviewable row per REQ ID.

## Evidence Bundle And Review Rules

Each gate report must retain exact commands, working directory, UTC start/end, tool/runtime
versions, configuration mode, return codes, pass/fail/skip counts, and links to raw machine-readable
results. Browser evidence also retains screenshots, traces, console/page errors, downloads, and
viewport/browser versions. Contract and clinical evidence retains fixture version and structured
expected/actual diffs. Secret values and production data are redacted at source, not after capture.

The tester executes this strategy and reports deviations. The final teamlead conformance review is
a separate task and checks that execution followed this strategy; it does not rerun or reinterpret
missing evidence. A documented unavailable prerequisite may explain a fallback, but the relevant
required gate remains `FAIL` unless its stated equivalent evidence satisfies the gate.

## Remaining External Prerequisites

1. Authoritative production screenshots for required states at matching content/persona/viewports.
2. Read-only production/API telemetry or permission to run the specified paired baseline probes.
3. Functional Docker daemon or an isolated disposable DynamoDB-compatible environment with no
   production table access.
4. Target-installed Playwright and browser binaries; direct or equivalent latest-two-major browser
   access, including Safari/VoiceOver and a Chromium screen reader.
5. Isolated Cognito-compatible issuer/audience/JWKS configuration and non-production contributor,
   viewer, and `evidence-editors` identities.
6. Network access or recorded fixtures for PubMed, ClinicalTrials.gov, AYUSH/DHARA, and CTRI/ICTRP;
   any live smoke remains read-only and separately labeled from deterministic tests.

Absence of any prerequisite blocks only its dependent execution while implementation continues on
independent tiers. It does not authorize a parity PASS.

## Test Results

- Artifact validation: `node -e` structural contract check.
- Artifact validation result: 78 requirements, 16 gates, 8 journeys, 10 required sections, and 0
  placeholders; passed.
- Command: `npm test` at the authoritative active root.
- Passed: 2 tests in 1 file.
- Failed: 0.
- Skipped: 0.
- Legacy baseline command: `npm test` from `archive/legacy-monorepo`.
- Legacy result: blocked before test discovery by unresolved workspace dependency execution after
  an interrupted frozen install; 10 files and 57 assertions remain mapped as required target
  characterization assets.
- Application runtime/E2E tests: not executed because t6 defines the pre-implementation strategy;
  execution belongs to the tester after implementation.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/clarification.md` - submitted F1-F10, B1-B5, and G1-G2 target,
  compatibility, accessibility, browser, SLA, parity, and exclusion decisions.
- `.github/modernize/rearchitecture/artifacts/t2-architect.md` - 23-unit boundary, architecture
  findings, frozen contracts, and six cross-unit state flows.
- `.github/modernize/rearchitecture/artifacts/t3-pm.md` and
  `.github/modernize/rearchitecture/artifacts/t3-pm-capability-inventory.md` - 78 requirements,
  eight scenarios, and seven measurable success criteria.
- `.github/modernize/rearchitecture/artifacts/t4-architect.md` - corroborating target route,
  contract, module, and requirement mapping available during strategy drafting.
- `.github/modernize/rearchitecture/artifacts/t5-dba.md` - corroborating adapter, non-destructive,
  atomicity, pagination, and no-failover verification expectations available during drafting.
- `.github/modernize/rearchitecture/artifacts/t7-ux.md` - completed viewport, interaction, WCAG,
  browser, visual, and assistive-technology acceptance contract.

## Evidence Mapping

- `clarification.md#Frontend` -> primary browser stack, VG-09 through VG-12, and REQ-001-049/073-078 coverage.
- `clarification.md#Backend` -> VG-04 through VG-08 and baseline-relative VG-13.
- `clarification.md#Generic` -> VG-00, VG-03, VG-15, binary parity, and out-of-scope controls.
- `t2-architect.md#Architectural-Findings` -> auth, middleware, governance, persistence, ingestion,
  status compatibility, and theme checks in VG-04 through VG-10.
- `t2-architect.md#Boundary-Decision` -> single-runtime boundaries retained; the explicit user destination amendment changes execution to the active root and VG-00 preserves archive bytes plus root capabilities.
- `t3-pm-capability-inventory.md#Functional-Requirements` -> complete Requirement-To-Gate Coverage.
- `t3-pm-capability-inventory.md#User-Scenarios-and-Independent-Acceptance` -> J1 through J8.
- `t3-pm-capability-inventory.md#Success-Criteria` -> VG-05, VG-06, VG-09 through VG-13, and VG-15.
- `t4-architect.md#Binding-Decisions` -> route/API counts, single-runtime checks, and clinical/auth/data boundaries.
- `t5-dba.md#Verification-Matrix` -> VG-06 persistence and data-integrity acceptance.
- `t7-ux.md#Browser-and-Assistive-Technology-Acceptance` -> VG-09 through VG-12 evidence rules.
