# SALUS Pramana Complete Capability Parity Inventory

## Scope Baseline

**Mode**: complete brownfield rewrite. **Authority order**: explicit user instruction, resolved
clarification, ratified constitution, current active root and production-observable behavior,
then archived implementation evidence. The archive is immutable until a final parity PASS.

**In scope**: every active-root and archived UI, route, workflow, data field, calculation,
export, API contract, authorization rule, persistence effect, ingestion behavior, loading/empty/
error state, responsive state, and accessibility behavior. Archived-only capabilities are
`RESTORE`; root capabilities are `PRESERVE`; overlapping behavior is `RECONCILE` with root wins.

**Out of scope**: deployment, infrastructure rollout, Git commits/pushes, archive removal,
production-data mutation, and removal or narrowing of active-root capabilities.

## Actors

- **Public visitor/patient** — searches, compares, inspects sources, explores safety/equity/math,
  exports public evidence, and receives plainly framed uncertainty.
- **Clinician** — reviews clinical depth, contraindications, interactions, dose candidates,
  trajectories, and governance gates.
- **Researcher/Nobel juror/policy maker** — audits formulas, evidence decomposition, calibration,
  citations, population impact, source freshness, and reproducibility.
- **Authenticated contributor** — submits immutable draft evidence.
- **Evidence editor** — sees drafts, maintains condition taxonomy, changes publication status,
  and receives an auditable authorization result.
- **Automated ingestion operator** — imports and reconciles registry evidence with bounded,
  inspectable outcomes.

## Route Inventory

| Surface | Route | Disposition | Primary requirement IDs |
|---|---|---|---|
| Root research home | `/` | PRESERVE | REQ-002–REQ-011 |
| Root scientific audit | `/scientific-audit` | PRESERVE | REQ-034–REQ-036 |
| Root global equity | `/global-health-equity` | PRESERVE | REQ-029–REQ-033 |
| Root cross-system intelligence | `/cross-system-intelligence` | PRESERVE | REQ-012–REQ-017 |
| Root ODE interaction lab | `/ode-interaction-lab` | PRESERVE | REQ-018–REQ-021 |
| Root clinical workbench | `/clinical-workbench` | PRESERVE | REQ-022–REQ-025 |
| Root AI reasoning | `/ai-clinical-reasoning` | PRESERVE | REQ-026–REQ-028 |
| Root repository/math architecture | `/architecture` | PRESERVE | REQ-037–REQ-039 |
| Root calibration/governance | `/calibration-governance` | PRESERVE | REQ-038 |
| Archive comparison dashboard | `/` | RECONCILE into root experience | REQ-040–REQ-043 |
| Archive evidence submission | `/new` | RESTORE | REQ-044 |
| Archive condition comparison | `/compare/$conditionId` | RESTORE | REQ-043 |
| Archive editor console | `/editor` | RESTORE | REQ-045–REQ-047 |
| Archive auth callback | `/auth/callback` | RESTORE | REQ-048, REQ-069 |
| Archive math explainer | `/math` | RECONCILE with root math surfaces | REQ-078 |

## Functional Requirements

### Application Shell, Home, Discovery, and Personal State

- **REQ-001 (PRESERVE)** — All nine root workstation URLs shall deep-link directly, lazy-load
  independently, retain shared persona/export/citation/ODE handoff state during navigation,
  restore scroll behavior, show a pending state, offer retry after route failure, and show a
  home return action for unknown routes.
- **REQ-002 (PRESERVE)** — The home search shall match condition names/codes and evidence by
  intervention, medical system, grade, methodology, registry ID, outcome, and active ingredient,
  while visibly distinguishing condition and evidence results.
- **REQ-003 (PRESERVE)** — Search history shall retain the five most recent nontrivial unique
  queries newest-first, bump repeats, permit single deletion and clear-all, and continue through
  local fallback storage when IndexedDB is unavailable.
- **REQ-004 (PRESERVE)** — Search shall expose preset/popular queries, keyboard traversal of
  suggestions, explicit clearing, selection into the query, and a clear no-match state.
- **REQ-005 (PRESERVE)** — Search results shall expose condition identifiers, cross-tradition
  names, evidence grade/system, source registry links, outcomes, and direct actions into relevant
  workstations without losing the selected query.
- **REQ-006 (PRESERVE)** — Users shall share the current research view through a copyable link and
  receive visible success/failure feedback without blocking other work.
- **REQ-007 (PRESERVE)** — Users shall export filtered evidence to UTF-8 CSV and structured JSON
  with provenance, confidence intervals, statistics, source links, record count, query, timestamp,
  and deterministic sanitized filenames.
- **REQ-008 (PRESERVE)** — Users shall create and delete locally retained evidence notifications
  by topic, one or more medical systems, minimum grade, frequency, and valid email; duplicate
  email/topic subscriptions shall be replaced rather than multiplied, and invalid submissions
  shall identify the problem.
- **REQ-009 (PRESERVE)** — The interactive Pramana sandbox shall expose grade, design, bias,
  recency, sample-size, and precision inputs and update the decomposed contribution and normalized
  score as inputs change.
- **REQ-010 (PRESERVE)** — Citation discovery shall offer APA, Vancouver, BibTeX, RIS, and LLM
  formats, copy feedback, repository/author attribution, and external source links.
- **REQ-011 (PRESERVE)** — The home page shall retain the mission, six charter principles,
  medical/evidence disclaimers, workstation entry actions, author/repository attribution, and
  responsive header/footer navigation.

### Cross-System Intelligence and Evidence Audit

- **REQ-012 (PRESERVE)** — Selecting a condition shall show ICD-11, category, prevalence,
  pathophysiology context, and Ayurveda/Siddha/Naturopathy mappings without presenting traditions
  as causally equivalent.
- **REQ-013 (PRESERVE)** — Condition intelligence shall show evidence count, Pramana score,
  confidence score and 95% interval, Bayesian threshold probability, recommendation class,
  top intervention, uncertainty explanation, and GO/CONDITIONAL/NO-GO gate state.
- **REQ-014 (PRESERVE)** — Users shall filter the evidence ledger by medical system and grade and
  search intervention, summary, registry ID, or active ingredient, including a no-results state.
- **REQ-015 (PRESERVE)** — Each evidence record shall expose score decomposition, grade,
  methodology, sample, year/recency, effect statistics, bias, ingredients/targets,
  contraindications, interactions, verified registry link, and clinical outcome.
- **REQ-016 (PRESERVE)** — A user shall send an evidence intervention plus comparison partner to
  the ODE lab and arrive with both values populated.
- **REQ-017 (PRESERVE)** — Missing evidence shall fail closed as `INSUFFICIENT_EVIDENCE`, with zero
  scores, low coverage, failed gates, no invented top intervention, and a useful empty state.

### ODE Interaction Simulation

- **REQ-018 (PRESERVE)** — Users shall select any named intervention pair or one of the four
  supplied clinical presets and adjust coupling, both elimination rates, stagger delay, and a
  12–72 hour horizon within displayed bounds.
- **REQ-019 (PRESERVE)** — The simulator shall deterministically produce paired concentration and
  risk trajectories at 15-minute RK4 steps, sampled for display, with no negative concentration.
- **REQ-020 (PRESERVE)** — Results shall expose curves, peak risk/time, mild/severe threshold
  timing, none/mild/moderate/severe class, interaction mechanism, and action protocol; changing
  any input shall update all dependent outputs.
- **REQ-021 (PRESERVE)** — Staggering shall visibly delay the second intervention; no-known-
  interaction mode shall return baseline risk and concurrent-use guidance; severity boundaries
  shall remain `<20`, `20–44`, `45–74`, and `75+`.

### Clinical Decision Workbench

- **REQ-022 (PRESERVE)** — Users shall select indication, age 18–90, eGFR 15–120, pregnancy/
  lactation status, and any available multi-tradition regimen candidates; condition change shall
  clear incompatible selections.
- **REQ-023 (PRESERVE)** — The workbench shall continuously recompute a safety audit and clearly
  distinguish critical, warning, advisory, and no-alert outcomes with cited rationale.
- **REQ-024 (PRESERVE)** — Existing safety boundaries shall be retained: metformin critical below
  eGFR 30 and dose warning at 30–44; high-potassium regimen risk below 30; berberine pregnancy
  contraindication; specified herb-drug pair warnings/advisories and staggering guidance.
- **REQ-025 (PRESERVE)** — The lead selected intervention shall show bounded Hill-equation dose
  candidates with dose/unit, efficacy, toxicity, net benefit, therapeutic index, and exactly one
  optimal frontier; no candidate table appears without a lead treatment.

### Clinical AI Reasoning

- **REQ-026 (PRESERVE)** — Users shall select a condition, author a clinical inquiry, choose the
  supplied interaction/comparison examples, initiate synthesis, and see distinct ready/loading/
  result states with the selected persona retained.
- **REQ-027 (PRESERVE)** — `POST /api/clinical-ai` shall accept condition, interventions,
  patient profile, and query type and return content plus source. Missing credentials or provider
  errors shall produce a deterministic evidence-grounded synthesis rather than an empty result.
- **REQ-028 (PRESERVE)** — Synthesis shall identify condition/code, evidence grades, registry
  grounding, interactions, uncertainty/governance status, actionable safety context, and engine
  source without allowing generated text to override deterministic safety gates.

### Global Health Equity

- **REQ-029 (PRESERVE)** — The world map shall switch among all seven equity metrics, select a
  country, expose map zoom-in/zoom-out/reset, and present an accessible metric/country value.
- **REQ-030 (PRESERVE)** — Users shall toggle evidence-distribution arcs without altering country
  selection or metric state.
- **REQ-031 (PRESERVE)** — Country inspection shall show ISO/region/population, GHEI, UHC,
  out-of-pocket burden, physician density, incidents averted, traditional systems/policy,
  disparity narrative, DALY reduction, and projected savings; regional summaries shall cover all
  six WHO regions.
- **REQ-032 (PRESERVE)** — The policy simulator shall accept 10–100% adoption in 5% steps and
  update DALYs, savings, prevented collisions, and population served proportionally.
- **REQ-033 (PRESERVE)** — The dashboard shall retain global summary indicators and clearly label
  simulated live telemetry, registry federation, projections, units, and source context so
  simulated values are not mistaken for measured patient outcomes.

### Scientific Audit, Mathematics, Architecture, Calibration, and Citation Graph

- **REQ-034 (PRESERVE)** — The scientific audit shall retain the overall self-assessment grade,
  executive summary, four impact highlights, external author/repository links, and navigation to
  equity, intelligence, ODE, and architecture views.
- **REQ-035 (PRESERVE)** — Users shall filter audit metrics by category, select a metric, and see
  score/weight, rationale, strengths, opportunities, benchmarks, and mathematical evidence.
- **REQ-036 (PRESERVE)** — Mathematical defense shall let users select each proof, copy formulas
  with feedback, inspect assumptions/conclusions, and trigger the existing celebration action.
- **REQ-037 (PRESERVE)** — Repository architecture shall retain Math, Schemas, Architecture, and
  Source Tree tabs, formula/schema copy actions, and the observable repository/domain narrative.
- **REQ-038 (PRESERVE)** — Calibration governance shall show timestamp, trial count, Brier score,
  ECE, MCE, 95% coverage, drift status, bin details, verdict, and a recompute loading/result cycle.
- **REQ-039 (PRESERVE)** — The citation graph shall retain system and consensus filters, optional
  confidence intervals, node/link hover and selection details, statistical variance audit, and
  accessible status/relationship descriptions.

### Archived Comparison and Editorial Experience

- **REQ-040 (RESTORE)** — The comparison dashboard shall combine condition and care-goal
  selection with Patient/Clinician/Researcher lenses and adapt summary framing without changing
  underlying evidence.
- **REQ-041 (RESTORE)** — Ranked comparison shall expose at-a-glance metrics, best options,
  confidence/freshness, benefit-risk map with grade toggles, safety overview, freshness timeline,
  intelligence and governance panels, and top-five value decomposition with four risk profiles.
- **REQ-042 (RESTORE)** — Users shall select an intervention and create a shareable clinical
  snapshot containing contraindications, interactions, and citation appendix through print/PDF,
  plus CSV export and an expandable advanced evidence table.
- **REQ-043 (RESTORE)** — `/compare/$conditionId` shall deep-link to the requested condition and
  expose evidence rows/source links; absent or unknown condition data shall produce a useful empty
  state and evidence-submission path.
- **REQ-044 (RESTORE)** — `/new` shall require sign-in when configured and allow authenticated
  contributors to submit intervention, system, grade, methodology, registry ID, allowlisted HTTPS
  source URL, and outcome; pending, success, validation, duplicate, and service errors shall be
  visible, and every accepted record shall be an immutable draft.
- **REQ-045 (RESTORE)** — `/editor` shall show editor identity/status, include drafts, filter by
  condition and free text, apply search explicitly, page next/previous with correct disabled
  states, export the current filter, and expose loading/error/empty states.
- **REQ-046 (RESTORE)** — Authorized editors shall create or update condition taxonomy with ID,
  ICD-11, standard name, traditional equivalents, and pathophysiology, receiving success or
  field/service error feedback.
- **REQ-047 (RESTORE)** — Authorized editors shall move evidence among draft, published, and
  rejected; controls remain disabled for non-editors/pending mutations, list data refreshes after
  success, and each status change is audited.
- **REQ-048 (RESTORE)** — The shell shall expose auth-aware sign-in/sign-out and protected-route
  guidance; callback shall show progress, sanitize callback parameters, return to the requested
  allowed route, and show actionable callback failure with a dashboard return link.
- **REQ-049 (RECONCILE)** — All active and restored views shall preserve meaningful pending,
  skeleton, empty, validation, offline/fallback, authorization, unexpected-error, retry, and
  recovery states; actionable 4xx responses shall not be retried as transient failures.

### HTTP API Contracts

- **REQ-050 (RESTORE)** — `GET /health` shall retain its 200 JSON service/motto response. All API
  responses shall preserve correlation IDs, structured request lifecycle observability, explicit
  CORS origins/methods/headers, security headers, no-store behavior, a 1 MB body limit with 413,
  and sanitized 500 responses containing the correlation ID.
- **REQ-051 (RESTORE)** — `GET /conditions` shall return schema-valid conditions with the existing
  field names; an empty collection is a successful response.
- **REQ-052 (RESTORE)** — `POST /conditions` shall require authenticated editor status, validate
  fields, return 201 and the saved condition, and audit `condition.create`; invalid input is 400,
  missing/invalid auth 401, unavailable auth config 503, and non-editor 403.
- **REQ-053 (RESTORE)** — `GET /evidence` shall preserve optional `conditionId`, `q`, `limit`,
  `cursor`, and editor-only `includeDrafts`; default/max limit 25/100, nonnegative cursor, newest-
  verification then ID sorting, searchable corpus, pagination counts/next cursor, query echo, and
  causal-equivalency disclaimer shall remain stable.
- **REQ-054 (RESTORE)** — `GET /evidence/export.csv` shall apply the same condition/search/draft
  rules, sort order, authorization, 15-column schema, quoting, UTF-8 content type, and attachment
  filename.
- **REQ-055 (RESTORE)** — `POST /evidence` shall require authentication, validate the full evidence
  contract and existing condition, force draft status/default verification date, create once,
  audit `evidence.create`, and preserve 201/400/401/409/503 semantics.
- **REQ-056 (RESTORE)** — `PATCH /evidence/:id/publish` shall require an authenticated editor,
  accept only draft/published/rejected, return the updated record, audit the exact transition, and
  preserve 400/401/403/404/503 responses.
- **REQ-057 (RESTORE)** — `GET /auth/editor-status` shall require authentication and return
  `authenticated`, actor email, groups, and `isEditor` without exposing token material.
- **REQ-058 (RESTORE)** — `GET /intelligence/condition/:conditionId` shall preserve public/
  clinician mode, editor-only drafts, optional strict gates, all score/uncertainty/contribution
  fields, and governance downgrade from RECOMMEND to `INSUFFICIENT_EVIDENCE`; processing failure
  shall return the established safe insufficient-evidence payload.
- **REQ-059 (RESTORE)** — `GET /intelligence/evidence/:evidenceId` shall return source-level
  intelligence in public/clinician mode with optional editor-only drafts and strict downgrade;
  unknown evidence is 404.
- **REQ-060 (RESTORE)** — `GET /intelligence/gates/:conditionId` shall return the complete
  condition gate report for public/clinician mode and protect draft inclusion.
- **REQ-061 (RESTORE)** — `GET /intelligence/interaction/:conditionId` shall require both named
  interventions, clamp hours to 6–168 with 48 default, preserve draft authorization, and return
  condition/pair/timeline/timestamp; missing inputs are 400.
- **REQ-062 (RESTORE)** — `GET /intelligence/trajectory/:evidenceId` shall clamp hours to 6–168
  with 72 default, preserve draft authorization, return evidence trajectory/timestamp, and retain
  400/404/500 failure meanings.
- **REQ-063 (RESTORE)** — `GET /intelligence/dose-optimizer/:evidenceId` shall preserve draft
  authorization, return bounded dose suggestions for the evidence, and retain 400/404/500
  failure meanings.

### Domain, Persistence, Identity, and Ingestion

- **REQ-064 (RECONCILE)** — Condition and evidence contracts shall preserve every readable root
  and archive field, the four medical systems, grade A/B/C semantics, publication lifecycle,
  arrays for contraindications/interactions, and registry prefixes PMID/DOI/CTRI/ICTRP/AYUSH/
  DHARA/NCT; source URLs must be HTTPS and on the established evidence-domain allowlist.
- **REQ-065 (RESTORE)** — DynamoDB-compatible storage shall preserve `evidenceId`, `conditionId`,
  `auditId`, and `snapshotId` keys, both `byCondition` indexes, existing records/attributes, and
  old-shape readability; all evolution is additive and no automatic destructive rewrite occurs.
- **REQ-066 (RESTORE)** — An explicitly selected local-memory adapter shall provide the same
  condition/evidence create, read, list, filtering, publication, duplicate, and seed semantics;
  a failed configured persistent store shall never silently switch to memory.
- **REQ-067 (RESTORE)** — Condition creation, evidence creation, and publication transitions shall
  produce audit records with unique ID, action, actor email, target, timestamp, optional IP, and
  90-day expiry without exposing secrets.
- **REQ-068 (RESTORE)** — Seed behavior shall be idempotent and non-destructive in memory and
  persistent modes, report inserted counts/mode, and skip safely when required table contracts
  are absent.
- **REQ-069 (RESTORE)** — Cognito-compatible auth shall preserve authorization-code PKCE with
  S256/state validation, session-scoped access token/expiry, expiry cleanup, issuer/audience/JWKS
  validation, email and `cognito:groups` claims, `evidence-editors` enforcement server-side,
  logout, and exact 401/403/503 distinctions; local bypass is explicit and non-production only.
- **REQ-070 (RESTORE)** — PubMed ingestion shall accept PMID inputs, normalize allowlisted source
  records, deduplicate by evidence ID, create drafts without overwriting newer/equal evidence,
  and report source, ingested, skipped, and missing-table reason.
- **REQ-071 (RESTORE)** — ClinicalTrials.gov, AYUSH/DHARA, and CTRI/ICTRP connectors shall retain
  configured query/URL inputs, registry-prefix mapping, bounded per-run retrieval, source
  timestamp/freshness metadata, deterministic fallback references, normalized drafts, and
  ingested/skipped outcomes.
- **REQ-072 (RESTORE)** — Registry HTTP behavior shall enforce configured timeout, retries,
  minimum interval, request cap, and retry statuses and distinguish timeout, HTTP, network,
  invalid-JSON, and rate-limit failures with attempts/status/retryability; ingestion deduplication
  and source parsing shall remain deterministic.

### Static Discovery, Accessibility, Compatibility, and Corpus Preservation

- **REQ-073 (PRESERVE)** — `robots.txt`, sitemap, web manifest/metadata, `llms.txt`, and
  `llms-full.txt` shall remain reachable with current canonical routes, author/repository/license,
  scientific formulas, indications, registry grounding, and machine-readable discovery links.
- **REQ-074 (PRESERVE/RESTORE)** — Every route, modal, form, table, chart, map, filter, status,
  error, and auth flow shall meet WCAG 2.2 AA for keyboard operation, focus visibility/order,
  names/roles/values, semantics, contrast, status announcements, error identification,
  target size, reflow, zoom, and reduced motion.
- **REQ-075 (PRESERVE/RESTORE)** — All journeys shall retain functional mobile-first layouts at
  existing breakpoints with no clipped content or horizontal page scrolling and work in the
  latest two major versions of Chrome, Firefox, Safari, and Edge.
- **REQ-076 (CONSTRAINT)** — Delivered parity shall execute on the exact mandated target stack:
  React 19, Vite 8, Tailwind CSS 4, TanStack Query 5, TanStack Router 1 lazy routes, Express 4.21,
  and Node.js 22; no parallel router or duplicate server-state store may create divergent user
  behavior.
- **REQ-077 (PRESERVE)** — All active root conditions, evidence records, country profiles,
  evaluation metrics, formula constants, labels, source links, and cross-workstation handoff
  values shall remain present and internally consistent; archived seed records remain readable
  and additive where not superseded by root data.
- **REQ-078 (RECONCILE)** — The archived `/math` explainer and report corpus shall remain
  accessible through the root math/architecture experience or equivalent discoverable views,
  preserving Pramana, RK4, Hill, entropy, calibration, DALY, API-contract, printable academic/
  executive, and machine-readable calibration content.

## User Scenarios and Independent Acceptance

1. **P1 Public evidence decision**: Given any indexed condition, when a visitor searches and opens
   intelligence, then the same evidence set, scores, uncertainty, safety warnings, sources, and
   fail-closed decision are traceable across home, studio, export, and comparison views.
2. **P1 Clinical safety**: Given boundary eGFR/pregnancy/regimen inputs, when the workbench and ODE
   lab recompute, then exact threshold alerts, curves, severity, timing, and protocols match frozen
   fixtures and no generated content weakens them.
3. **P1 Evidence lifecycle**: Given contributor, viewer, and editor identities, when they submit,
   inspect drafts, create taxonomy, or change status, then each allowed action and each 401/403/
   409 denial matches the contract and every mutation is auditable.
4. **P1 Data continuity**: Given old-shape records and identical operations against persistent and
   memory adapters, then reads and observable outcomes match and no existing data is rewritten.
5. **P2 Research audit**: Given a researcher selecting filters, metrics, formulas, citations, and
   calibration, then every displayed claim remains linked to inputs, source, uncertainty, and a
   reproducible calculation/export.
6. **P2 Global equity exploration**: Given keyboard-only and pointer users on mobile/desktop, when
   they change map metric/country/flows/adoption, then all details and derived values update without
   lost state, overlap, or inaccessible chart-only meaning.
7. **P2 Registry ingestion**: Given success, timeout, retryable HTTP, invalid JSON, rate cap,
   duplicate, and missing-store cases, then each connector returns its defined structured outcome
   and never overwrites authoritative data.
8. **P3 Discovery and recovery**: Given a deep link, unknown route, failed lazy chunk, empty query,
   failed API, blocked storage, or auth callback error, then a meaningful, accessible recovery path
   appears and unaffected capabilities remain usable.

## Success Criteria

- **SC-001** — 78 of 78 requirements have target design, implementation task, and executable
  evidence links; any missing link is parity FAIL.
- **SC-002** — 9/9 root routes, 6/6 archived routes, and 13/13 archived API contracts pass positive,
  boundary, error, authorization, and persistence checks applicable to each.
- **SC-003** — Golden clinical fixtures reproduce evidence scores, gates, dose candidates, ODE
  trajectories, contraindications, and calibration within validation-strategy tolerances, with
  zero safety-critical decision divergence.
- **SC-004** — Persistent and memory adapters pass the same repository contract suite with zero
  destructive writes or silent fallback events.
- **SC-005** — Every critical user journey completes at all validation viewports with zero WCAG
  2.2 AA automated violations and all required manual checks passed.
- **SC-006** — Latest-two-major browser coverage reports zero blocking behavioral differences;
  any unavailable direct browser is documented with equivalent-engine evidence and residual gap.
- **SC-007** — Full validation has zero failed required checks, zero unresolved HIGH/CRITICAL
  findings, and no unexplained regression against measured production latency, availability, or
  ingestion baselines.

## Assumptions and Risks

- Production screenshots/browser captures remain required baseline inputs for visual parity; this
  inventory defines behavior but does not claim visual sign-off.
- Simulated telemetry and synthetic calibration remain clearly labeled; they are preserved product
  behavior, not assertions of live clinical outcomes.
- Archived docs contain roadmap language alongside implemented code. Requirements above include
  behavior evidenced by implementation/contracts and expressly requested complete capability
  parity; deployment instructions themselves remain out of scope.
- No unresolved clarification markers remain.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t1-teamlead.md` — constitution entry point.
- `.github/modernize/rearchitecture/artifacts/constitution.md` — binding parity and safety rules.
- `.github/modernize/rearchitecture/clarification.md` — resolved product and target constraints.
- `.github/modernize/rearchitecture/artifacts/project-profile.yaml` — source-area scope.

## Evidence Mapping

- `constitution.md#II` → REQ-001–REQ-078 and SC-001–SC-002.
- `constitution.md#IV` → REQ-044–REQ-072 and SC-004.
- `constitution.md#V` → REQ-009, REQ-013, REQ-017–REQ-028, REQ-038–REQ-039,
  REQ-058–REQ-064, REQ-077–REQ-078, and SC-003.
- `constitution.md#VI` → REQ-074–REQ-075 and SC-005–SC-006.
- `constitution.md#VII` → User Scenarios, Success Criteria, and binary parity rule.
- `clarification.md#Frontend` → REQ-001–REQ-049 and REQ-073–REQ-078.
- `clarification.md#Backend` → REQ-050–REQ-072.
