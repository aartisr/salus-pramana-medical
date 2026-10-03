# Requirement To Target Design Map

Every requirement below has a named target owner and executable evidence class. Implementation planning must replace each evidence class with concrete test IDs and target file paths; no row may be omitted or marked not applicable without a parity failure.

| Requirement | Target design element | Required evidence |
| --- | --- | --- |
| REQ-001 | Single provider tree; 14 lazy route modules; pending/error/not-found/focus/scroll boundaries | Route manifest, deep-link, state-retention, chunk-failure, unknown-route tests |
| REQ-002 | Home discovery feature with domain-index projection | Search corpus fixture tests |
| REQ-003 | Browser recent-search repository with IndexedDB/localStorage adapters | Shared contract tests with blocked IndexedDB |
| REQ-004 | Accessible combobox/suggestion state machine | Keyboard, clear, preset, no-match tests |
| REQ-005 | Typed condition/evidence search result projections and route actions | Result field/link/handoff tests |
| REQ-006 | Share-link browser adapter and status live region | Clipboard success/failure tests |
| REQ-007 | Deterministic client export projection | UTF-8 CSV/JSON golden files and filename tests |
| REQ-008 | Versioned local subscription repository | Validation, replacement-dedupe, create/delete persistence tests |
| REQ-009 | Pure Pramana sandbox calculation module | Golden contribution/normalization tests |
| REQ-010 | Citation formatter boundary | APA/Vancouver/BibTeX/RIS/LLM golden outputs and copy feedback |
| REQ-011 | Root home/shell feature composition | Content, navigation, attribution, responsive snapshot tests |
| REQ-012 | Cross-system condition projection | Taxonomy/mapping fixture tests and causal-framing assertion |
| REQ-013 | Condition intelligence domain result and governance projection | Golden score/interval/probability/gate tests |
| REQ-014 | Evidence query/filter feature and no-results state | Filter/search matrix tests |
| REQ-015 | Evidence detail projection | Required-field/source/safety detail tests |
| REQ-016 | App-state ODE handoff and router navigation | Cross-route handoff test |
| REQ-017 | Domain fail-closed result constructor | Zero-evidence golden fixture and UI empty-state test |
| REQ-018 | ODE input state and bounded presets | Boundary/control tests |
| REQ-019 | Pure RK4 interaction solver | 15-minute deterministic/no-negative golden trajectories |
| REQ-020 | ODE derived result projection | Curve/peak/threshold/class/mechanism/protocol tests |
| REQ-021 | RK4 delay/baseline/severity rules | Exact boundary and stagger fixtures |
| REQ-022 | Clinical workbench state reducer | Age/eGFR/status/selection boundary and reset tests |
| REQ-023 | Pure safety audit service and severity projection | Continuous recomputation and severity tests |
| REQ-024 | Named clinical threshold constants | eGFR, pregnancy, potassium, pair-warning golden fixtures |
| REQ-025 | Pure Hill dose optimizer and frontier selector | Bounded candidates and exactly-one-optimum tests |
| REQ-026 | AI route feature state machine using shared persona state | Ready/loading/result/example/persona tests |
| REQ-027 | `POST /api/clinical-ai` handler and provider adapter | Success, missing-key, provider-error fallback contract tests |
| REQ-028 | AI explanation adapter downstream of deterministic context | Source/uncertainty/safety fields and no-upgrade invariant test |
| REQ-029 | Accessible map adapter and metric/country state | Seven metrics, selection, zoom, textual-value tests |
| REQ-030 | Independent arc visibility state | Toggle-without-state-loss test |
| REQ-031 | Country/regional projection modules | Field completeness and six-region fixture tests |
| REQ-032 | Pure policy projection function | 10..100 by 5 proportional-output tests |
| REQ-033 | Equity summary and simulation-label primitives | Label/unit/source-context assertions |
| REQ-034 | Scientific audit route composition | Summary/highlight/link/navigation tests |
| REQ-035 | Audit metric filter/detail projection | Category/detail/math evidence tests |
| REQ-036 | Mathematical defense feature and copy/celebration adapters | Proof selection/copy/action tests |
| REQ-037 | Architecture route tab state and copy actions | Four-tab and source-tree narrative tests |
| REQ-038 | Calibration domain/report service and route state | Golden metrics/bins/verdict plus recompute-cycle tests |
| REQ-039 | Citation graph projection with textual alternatives | Filter/CI/hover/select/variance/accessibility tests |
| REQ-040 | Additive comparison sections at `/` with persona lens | Lens-framing and invariant-evidence tests |
| REQ-041 | Comparison projection modules | Ranking/map/timeline/governance/top-five/risk-profile tests |
| REQ-042 | Snapshot/report/export boundaries | Print/PDF content, CSV, advanced-table tests |
| REQ-043 | `/compare/$conditionId` lazy route | Deep-link, rows/links, unknown/empty/submission recovery tests |
| REQ-044 | `/new` route plus authenticated submission mutation | Auth, validation, duplicate, pending/success/service-error tests |
| REQ-045 | `/editor` query state and typed editor API client | Identity/filter/apply/pagination/export/loading/error/empty tests |
| REQ-046 | Editor condition command | Authorized create/upsert success and field/service-error tests |
| REQ-047 | Editor publication command and invalidation | Role/disabled/mutation/audit/refresh tests |
| REQ-048 | Browser PKCE module and auth-aware shell | Sign-in/out, callback, scrub, allowlist, error-recovery tests |
| REQ-049 | Shared route/query/form/auth recovery primitives | 4xx no-retry and complete state inventory tests |
| REQ-050 | Express global middleware plus health handler | Header/CORS/log/body-limit/500/correlation and exact health tests |
| REQ-051 | Conditions query and response schema | Empty and populated schema contract tests |
| REQ-052 | Editor-authenticated condition command and audit | 201/400/401/403/503 plus audit tests |
| REQ-053 | Evidence query service | Filter/search/sort/pagination/query-echo/disclaimer/auth tests |
| REQ-054 | Evidence CSV projection handler | Same-filter/auth/order plus exact 15-column golden CSV tests |
| REQ-055 | Authenticated submission command | Draft/default date/existing condition/conditional create/audit status matrix |
| REQ-056 | Editor publication command | Accepted enum, conditional update, exact audit, status matrix |
| REQ-057 | Editor-status handler and normalized claims | Authenticated response/no-token-material/401/503 tests |
| REQ-058 | Condition intelligence application service | Modes/drafts/strict/same-snapshot/downgrade/fail-closed tests |
| REQ-059 | Evidence intelligence application service | Modes/drafts/strict downgrade/404 tests |
| REQ-060 | Governance gate application service | Complete report/mode/draft auth tests |
| REQ-061 | Interaction timeline application service | Pair required, 6..168/48 clamp, draft auth, response tests |
| REQ-062 | Trajectory application service | 6..168/72 clamp and 400/404/500 tests |
| REQ-063 | Dose application service | Draft auth, bounded result, 400/404/500 tests |
| REQ-064 | Additive canonical contracts and surface mutation schemas | Old/root/archive shape, enum, registry, HTTPS/allowlist contract suite |
| REQ-065 | DynamoDB-compatible adapters behind ports | Existing-item/index/old-shape/additive/no-rewrite integration tests |
| REQ-066 | Explicit memory adapter and startup selector | Shared repository suite and no-failover startup/operation tests |
| REQ-067 | Append-only audit repository | Field/actor/IP/unique ID/90-day expiry/no-secret tests |
| REQ-068 | Seed service | Idempotent/non-destructive/count/mode/missing-table tests |
| REQ-069 | Browser PKCE plus server JWT/role boundaries | S256/state/session/expiry/JWKS/claims/role/logout/401/403/503/bypass tests |
| REQ-070 | PubMed importer through conditional create | Normalize/draft/dedupe/no-overwrite/result/missing-table tests |
| REQ-071 | Three source connectors and shared normalizer | Query/URL/prefix/bounds/timestamp/fallback/result tests |
| REQ-072 | Shared registry HTTP policy | Timeout/retry/interval/cap/status/error-kind/determinism tests |
| REQ-073 | Static discovery/corpus asset boundary | Reachability, canonical-link, content-presence tests |
| REQ-074 | Shared accessible primitives and feature semantics | Automated axe plus manual keyboard/focus/name/contrast/status/error/target/reflow/motion checks |
| REQ-075 | Mobile-first CSS and browser support boundary | Required viewports and latest-two-major browser journey matrix |
| REQ-076 | One-package exact stack and singleton client/router architecture | Lockfile/version/engine checks and architecture import/singleton tests |
| REQ-077 | Ported root datasets plus additive archive seeds | Corpus count/identity/link/constant/handoff consistency fixtures |
| REQ-078 | `/math` plus `/architecture` corpus discovery | Formula/report/print/calibration/machine-readable reachability tests |

## Coverage Gate

- Requirement IDs mapped: 78 of 78.
- Every row identifies a target boundary and executable evidence class.
- Implementation planning must add concrete task and test identifiers without replacing these architecture owners.
- Any unmapped implementation file or test that changes a frozen contract requires architecture review.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t3-pm-capability-inventory.md` - authoritative REQ-001 through REQ-078 definitions and success criteria.
- `.github/modernize/rearchitecture/artifacts/t2-architect.md` and `architecture_index.md` - source units and required contract evidence.
- `.github/modernize/rearchitecture/clarification.md` - target stack, browser, accessibility, auth/data, and immutable scope.

## Evidence Mapping

- `t3-pm-capability-inventory.md#Application-Shell-Home-Discovery-And-Personal-State` -> REQ-001 through REQ-011 rows.
- `t3-pm-capability-inventory.md#Cross-System-Intelligence-And-Evidence-Audit` through `#Archived-Comparison-And-Editorial-Experience` -> REQ-012 through REQ-049 rows.
- `t3-pm-capability-inventory.md#HTTP-API-Contracts` -> REQ-050 through REQ-063 rows.
- `t3-pm-capability-inventory.md#Domain-Persistence-Identity-And-Ingestion` -> REQ-064 through REQ-072 rows.
- `t3-pm-capability-inventory.md#Static-Discovery-Accessibility-Compatibility-And-Corpus-Preservation` -> REQ-073 through REQ-078 rows.
