# t7 — Parity-Preserving Responsive UX and Accessibility Design

## Purpose and Authority

This document defines the target interaction and information design for the brownfield rewrite.
It is documentation only. The active root, current production UI, and submitted clarification
remain authoritative; archived capabilities are additive and may not replace or narrow newer root
behavior. The light medical visual language, existing content, formulas, labels, datasets, and
breakpoints must be preserved through computed visual and behavioral equivalence.

The design applies to public visitors, patients, clinicians, researchers, policy makers,
authenticated contributors, and evidence editors. Clinical and governance results must remain
identical across personas; only framing and progressive disclosure may change.

## Constitution Check

- **Source preservation**: PASS by design. No active-root, archive, deployment, or production-data
  change is authorized by this artifact.
- **Capability parity**: Every user-facing PM requirement is mapped below. Missing states or
  inaccessible alternatives are parity failures, not follow-up enhancements.
- **Target boundary**: One application shell, router, query-state experience, and shared persona /
  handoff state are assumed. This document does not authorize a parallel navigation or state model.
- **Clinical integrity**: Safety, uncertainty, provenance, registry, and fail-closed decisions are
  visually prominent and never encoded by color alone.
- **Accessibility**: WCAG 2.2 AA, mobile-first reflow, reduced motion, zoom, keyboard-only use, and
  latest-two-major Chrome, Firefox, Safari, and Edge are acceptance gates.

## Information Architecture

### Global Shell

The shell order is consistent on every route:

1. Skip link targeting the main heading.
2. Header with product identity/home link, primary workstations, persona control, authentication
   state, and context actions.
3. Optional route-context row for breadcrumbs, selected condition, or active handoff.
4. One `main` landmark beginning with a unique `h1`.
5. Route content and route-local dialogs.
6. Footer with mission, medical/evidence disclaimer, attribution, repository, license, and
   discovery links.
7. A polite global status region and an assertive error region.

Desktop navigation exposes the nine active workstations as stable destinations, groups secondary
restored destinations under clearly named Evidence and Governance menus, and always exposes Home.
Mobile navigation uses one menu button with expanded state; opening moves focus to the first item,
Escape closes it, activation closes it, and closing returns focus to the menu button. Authentication
actions remain reachable without horizontal scrolling or reliance on hover.

### Route Map

| Route | Page purpose and primary landmark | Required adjacent destinations |
| --- | --- | --- |
| `/` | Research discovery, mission, comparison entry, personal history | Every workstation, compare, submit evidence |
| `/scientific-audit` | Scientific self-assessment and mathematical defense | Equity, intelligence, ODE, architecture |
| `/global-health-equity` | Equity map, country inspection, regional and policy simulation | Research home, intelligence |
| `/cross-system-intelligence` | Condition context, governance result, evidence ledger | ODE handoff, compare, submit evidence |
| `/ode-interaction-lab` | Interaction inputs, trajectories, risk and action protocol | Intelligence return, workbench |
| `/clinical-workbench` | Patient factors, regimen safety, dose candidates | ODE, AI reasoning |
| `/ai-clinical-reasoning` | Grounded synthesis request and result | Workbench, evidence sources |
| `/architecture` | Math, schemas, architecture, source tree, report corpus | Scientific audit, `/math` equivalent |
| `/calibration-governance` | Calibration summary, bins, drift and recompute | Scientific audit, architecture |
| `/compare/$conditionId` | Condition-specific ranked comparison and clinical snapshot | Intelligence, submit evidence |
| `/new` | Protected evidence submission | Sign in, dashboard/condition return |
| `/editor` | Protected taxonomy and publication workspace | Sign in, dashboard |
| `/auth/callback` | Authentication progress or actionable failure | Sanitized allowed return route, dashboard |
| `/math` | Discoverable compatibility entry to the root math experience | Architecture Math tab and report corpus |

Unknown routes present the requested path as unavailable, a Home action, and the primary
workstation links. They do not silently redirect. Every deep link renders a route-specific pending
state, then places focus on the route `h1`; a failed lazy route exposes Retry and Home without
discarding shared persona, selected query, or ODE handoff state.

## Responsive Layout Contract

Validation must include widths 320, 375, 768, 1024, 1280, and 1440 CSS pixels, portrait and
landscape where supported, at 100%, 200%, and 400% browser zoom. Existing production breakpoints
control exact transitions; these rules define the required outcomes.

| Surface | Compact outcome | Wide outcome |
| --- | --- | --- |
| Shell | Menu-controlled navigation; context actions wrap below title | Persistent navigation; context actions align without obscuring title |
| Filter + results | Filters precede results in a collapsible region with visible active-filter count | Filter rail remains beside results; DOM order stays filters then results |
| Metric collections | One column; key value, unit, and status remain together | Multi-column grid with equal reading order and no nested cards |
| Forms | Labels above full-width controls; related binary inputs use fieldsets | Two columns only for independent fields; errors remain next to owning field |
| Tables | Essential columns remain visible; secondary fields use per-row disclosure | Full semantic table with sticky header only when it does not obscure focus |
| Charts/maps | Fit container with pan/zoom controls; text alternative immediately follows | Visualization and synchronized detail panel can sit side by side |
| Dialogs | Inset full-height sheet with internal scroll and visible close control | Centered bounded dialog; background remains inert |
| Action groups | Wrap in task order; primary action first, destructive action separated | Inline alignment is allowed without changing DOM or tab order |

No page may horizontally scroll at 320 CSS pixels or at 400% zoom at 1280 CSS pixels. Data tables
may use a labeled internal horizontal scroller only when row disclosure cannot preserve meaning;
keyboard focus and a visible scroll affordance must remain available. Text is not truncated when it
contains safety, evidence grade, source, uncertainty, error, or authorization information.

Touch/pointer targets are at least 24 by 24 CSS pixels with sufficient spacing; frequently used
primary, navigation, map, and destructive controls target 44 by 44 CSS pixels. Hover content is
also available on focus and is dismissible with Escape.

## Shared Interaction Patterns

### Navigation and State Continuity

- Persona selection, search query, selected condition, export/citation context, and ODE handoff
  survive route navigation for the current session. Browser Back/Forward restores route and filter
  state and returns to the triggering control where practical.
- A route change announces the new page title once. Loading announcements are delayed enough to
  avoid noise for instant transitions; failures are announced immediately.
- Scroll resets to the page heading for new destinations and is restored for Back/Forward history.
  Dialog open/close never resets the underlying page scroll.
- Links use anchors and retain standard new-tab behavior. Buttons are reserved for in-page actions.

### Pending, Empty, Offline, Error, and Recovery States

- Pending views preserve the page heading and control geometry; skeletons are hidden from assistive
  technology and accompanied by concise status text.
- Empty states identify whether the cause is no source data, current filters, an unknown condition,
  or insufficient evidence. They offer the smallest valid recovery: clear filters, change condition,
  submit evidence, retry, or return.
- Query failures preserve successful neighboring panels and user inputs. No fabricated comparison,
  score, chart, editor status, or AI result fills a failed panel.
- Actionable 4xx errors are shown once and are not described as temporary. Retry is offered only for
  retryable failures. Unexpected errors include recovery and a non-sensitive correlation ID when
  supplied by the server.
- IndexedDB failure presents a non-blocking notice that local fallback is active. A configured
  persistent-store failure never claims memory fallback or successful persistence.

### Status and Feedback

- Copy, share, export, subscription, formula-copy, recompute, submission, taxonomy, publication,
  and sign-out actions expose pending, success, and failure status in text.
- Polite live regions announce successful non-blocking updates. Validation, authorization, safety,
  callback, and destructive-action failures use an assertive region without repeatedly announcing
  unchanged content.
- Loading buttons retain their accessible name, add a pending description, and remain disabled only
  while duplicate activation would be harmful.

### Dialogs

Export, citation discovery, evidence notifications, math foundations, and report dialogs use the
same modal contract: invoking control opens the named dialog; initial focus goes to the heading or
first invalid field; Tab/Shift+Tab remain inside; Escape closes unless a non-cancellable mutation is
active; background is inert; Close is visible; closing returns focus to the invoker. Nested dialogs
are prohibited. Closing a dirty form requires explicit confirmation without discarding data first.

### Forms and Validation

- Every control has a persistent visible label, purpose-specific autocomplete where applicable,
  programmatic description for units/bounds, and an error linked with `aria-describedby`.
- Validation occurs on submit and, after the first failure, on corrected blur/change. A summary at
  the top links to each invalid control; focus moves to the summary on failed submit.
- Enter submits only when expected; multiline clinical inquiries retain Enter for new lines.
  Escape does not erase values. Required state and accepted format are stated before submission.
- Numeric controls permit direct entry plus keyboard-safe increment/decrement. Displayed bounds and
  units accompany grade, bias, recency, sample, precision, age, eGFR, coupling, elimination, delay,
  horizon, and adoption inputs.
- Submissions retain entered values after validation, authorization, duplicate, service, or network
  errors. Successful evidence submission replaces the form with draft status and a clear next step.

### Data Tables and Progressive Disclosure

Tables have a caption, column headers, announced sort state, and row identity in each action name.
Pagination reports the shown range and total, Next/Previous disabled states, and retains filters.
Mobile row disclosure preserves the same field labels and source actions. Advanced evidence remains
collapsed by default but its count and expansion control are discoverable. Export applies exactly
the visible filter/draft scope and reports record count.

## Route-Specific UX Requirements

### Home, Search, Export, Notifications, and Citation

- Search is the first task after the page introduction. Condition and evidence suggestions are
  grouped and labeled, use listbox keyboard semantics, support Up/Down/Home/End/Enter/Escape, and
  keep typed text when no result is chosen. Clear is separately named.
- Recent searches show at most five newest-first items with row-specific remove actions and a
  separate clear-all action requiring confirmation. Popular presets do not masquerade as history.
- Results retain the query, distinguish condition from evidence, expose identifiers, tradition,
  grade, system, outcome, and verified source, and provide named actions into intelligence,
  comparison, ODE, and workbench where applicable.
- Share feedback is non-modal. Export and citation use the dialog contract and expose format before
  download/copy. Notification fields are grouped in reading order and duplicate replacement is
  explained in success feedback.
- The Pramana sandbox presents each input before score output; decomposed contributions precede the
  normalized score. Updates are announced as one summarized result, not on every slider tick.

### Intelligence and Comparison

- Condition identity, cross-tradition names, prevalence, and pathophysiology precede decision
  metrics. Tradition mappings include an explicit non-causal-equivalence statement.
- The primary governance block presents decision, confidence interval, coverage, uncertainty, and
  rationale together. `INSUFFICIENT_EVIDENCE` uses text/icon/structure, zero values, failed gates,
  and no implied recommendation or top intervention.
- Evidence filters precede the ledger, expose active values and clear-all, and retain state after
  opening/closing evidence details. Each record groups source/provenance, effect statistics,
  methodology/grade, safety, and ingredients/targets in that reading order.
- ODE handoff names both selected interventions before navigation. Comparison persona lenses change
  explanatory framing only; a persistent note states that evidence and calculations are unchanged.
- Ranked comparison orders summary, best options, confidence/freshness, benefit-risk, safety,
  timeline, intelligence/governance, decomposition, then advanced evidence. Print/PDF and CSV
  include active condition/lens/filter context and citation appendix.

### ODE Lab and Clinical Workbench

- Inputs precede outputs in DOM order. Presets populate all affected controls and announce the
  selected preset. Every input shows bounds and current value; invalid/non-finite values never
  reach a chart.
- Trajectories have a synchronized legend, textual series table/summary, peak value/time, threshold
  crossings, severity, mechanism, and action protocol. Severity is not color-only. Staggering is
  described as delayed timing, and no-known-interaction mode explicitly states baseline guidance.
- Workbench patient factors precede regimen selection. Changing indication warns before clearing
  incompatible selections. Safety audit appears before dose candidates and uses Critical, Warning,
  Advisory, or No alert headings with cited rationale.
- Dose candidates are absent until a lead intervention exists. Once present, each row exposes dose,
  unit, efficacy, toxicity, net benefit, therapeutic index, and exactly one text-labeled optimum.

### AI Clinical Reasoning

Condition, persona, inquiry, interaction/comparison examples, patient context, and synthesis action
form one labeled workflow. Ready, loading, deterministic fallback, provider result, and failure are
visually distinct. The result begins with engine source and governance status, then condition/code,
grades/registry grounding, interactions, uncertainty, and actionable safety. Generated prose is
visually subordinate to deterministic safety and cannot replace gate or warning content.

### Equity Map and Policy Simulation

- Metric selection precedes the map; selected metric and country persist through zoom/reset and arc
  toggling. Zoom controls are buttons with names and disabled limits.
- The map has a concise accessible summary and a synchronized country list/table operable without
  pointer or geography recognition. Keyboard selection updates the same detail panel as pointer
  selection. Hover-only country data is prohibited.
- Country details follow identity, health access, burden, workforce, outcomes, traditional systems,
  disparity, projections, then sources. Units and simulated/projected/live labels accompany values.
- Adoption input shows 10–100%, 5% steps, and updates one polite summary containing DALYs, savings,
  prevented collisions, and population served. Reduced motion disables animated map transitions.

### Scientific Audit, Math, Architecture, Calibration, and Citation Graph

- Audit category filters precede metric selection. Metric details retain score/weight, rationale,
  strengths, opportunities, benchmarks, and mathematical evidence. Persona changes framing only.
- Proof and formula selectors use tabs only when their panels follow tab semantics; otherwise they
  use buttons. Copy feedback names the formula. Celebration is optional motion, never conveys the
  only success state, and is suppressed for reduced motion.
- Architecture uses Math, Schemas, Architecture, and Source Tree tabs with arrow-key tab behavior,
  persistent selected tab in history, and readable preformatted content that wraps or scrolls in a
  labeled region. The `/math` route resolves to a discoverable equivalent and preserves report links.
- Calibration presents timestamp and trial count before aggregate metrics, then bin detail, drift,
  coverage, and verdict. Recompute retains prior results with an updating status and announces one
  completed summary. Synthetic values are explicitly labeled.
- Citation graph filters precede the graph. A text relationship list/table, node detail, link detail,
  confidence interval values, and variance audit provide complete non-visual equivalence.

### Evidence Submission, Editor, and Authentication

- `/new` presents sign-in guidance instead of disabled form controls when unauthenticated. The form
  order is condition/intervention/system/grade/methodology/registry/source/outcome; source guidance
  explains HTTPS and allowlisted domains before submission. Accepted evidence is labeled immutable
  draft, not published evidence.
- `/editor` begins with identity and verified editor status. While status is loading, failed, or
  non-editor, mutation controls are absent or disabled and guidance remains visible. Draft inclusion,
  condition, and text filters apply only through the explicit Apply action; pagination and export
  share that applied state.
- Taxonomy editing groups ID/ICD-11/name before traditional equivalents/pathophysiology. Publication
  status controls state record identity and current/target status, require confirmation for rejected
  or published transitions, disable during mutation, announce success, and refresh without moving
  focus away from the changed record.
- The shell describes sign-in/sign-out state without exposing claims or tokens. Protected links may
  remain visible with sign-in guidance but never imply authorization. Callback progress has one
  heading and status; success sanitizes parameters before returning only to an allowlisted route.
  Missing/mismatched state or failed exchange stores no partial session and exposes Retry sign-in and
  Return to dashboard.

## WCAG 2.2 AA Conformance Contract

| Criterion area | Required design evidence |
| --- | --- |
| 1.1.1 Text alternatives | Meaningful images, map regions, chart series, graph nodes/links, icons, and formula images have equivalent text; decorative assets are ignored |
| 1.3.1–1.3.5 Structure/input purpose | Landmarks, headings, lists, fieldsets, tables, labels, autocomplete, and reading order convey the same relationships as layout |
| 1.4.1, 1.4.3, 1.4.11 | State is not color-only; normal text contrast is at least 4.5:1, large text 3:1, and controls/focus/graphics 3:1 against adjacent colors |
| 1.4.4, 1.4.10, 1.4.12 | Content remains usable at 200% text resize, 400% zoom/reflow, and increased text spacing without loss or page-level horizontal scroll |
| 1.4.13 | Hover/focus disclosures are persistent while hovered/focused, hoverable, and dismissible without moving focus |
| 2.1.1–2.1.2 | All functions work by keyboard with no trap, including maps, graphs, sliders, tabs, dialogs, menus, disclosures, and tables |
| 2.2.1–2.2.2 | No essential time limit; loading/motion can be paused where applicable and never blocks reading or operation |
| 2.3.1 | No content flashes more than three times per second |
| 2.4.1–2.4.7 | Skip link, titled routes, logical focus/order, descriptive links/headings/labels, and persistent visible focus are present |
| 2.4.11 Focus not obscured | Sticky headers, dialogs, sheets, notices, and internal scrollers never fully hide the focused control |
| 2.5.1–2.5.4 | Complex pointer gestures have single-pointer alternatives; cancellation and label-in-name are preserved; motion input is not required |
| 2.5.7 Dragging movements | Any drag/pan interaction has button, keyboard, or direct-selection alternatives |
| 2.5.8 Target size | Interactive targets meet 24 by 24 CSS pixels or the spacing/equivalent exception; primary controls target 44 by 44 |
| 3.1.1 | Page language is English and abbreviations/medical terms receive nearby expansion or explanation |
| 3.2.1–3.2.4 | Focus/input does not cause surprising context change; navigation and control names remain consistent |
| 3.3.1–3.3.4 | Errors are identified in text with suggestions; safety/editor mutations are reviewable and reversible where the API permits |
| 3.3.7 Redundant entry | Previously entered values remain populated across steps, retries, and recoverable errors |
| 3.3.8 Accessible authentication | Authentication does not require a cognitive-function test; password managers, paste, and authorization redirects remain usable |
| 4.1.2–4.1.3 | Custom controls expose correct name/role/value/state; status messages are announced without forced focus |

Reduced-motion preference removes celebration, parallax, smooth scrolling, animated graph/map
transitions, and nonessential skeleton shimmer. It does not remove state changes or information.
Forced-colors/high-contrast mode retains visible boundaries, selected state, warnings, chart series
distinction, and focus indicators. At least one non-color cue accompanies every grade, gate, severity,
drift, publication, auth, and error state.

## Browser and Assistive-Technology Acceptance

- Run each P1/P2 journey at compact and wide viewports in the latest two major Chrome, Firefox,
  Safari, and Edge releases or documented equivalent engines.
- Keyboard-only checks cover complete route navigation, menus, search suggestions, dialogs, forms,
  filters, tabs, tables, pagination, map/graph alternatives, sliders, auth, and editor mutations.
- Screen-reader checks cover Safari/VoiceOver and one Chromium screen reader at minimum; verify page
  titles, landmarks, headings, labels/descriptions, errors, live status, table navigation, dialog
  boundaries, and chart/map alternatives.
- Automated accessibility scans run on every route plus each modal, validation, empty, error,
  authorization, and loaded-result state. Zero serious or critical violations are allowed; all WCAG
  2.2 AA findings require disposition.
- Visual comparison uses production captures at matching viewport, content, persona, and state.
  Font substitution, color-token mapping, focus appearance, reflow, overlays, and charts require
  explicit review; screenshot similarity alone cannot establish interaction parity.

## Requirement Coverage Matrix

| PM requirements | UX design coverage |
| --- | --- |
| REQ-001 | Global shell; route map; navigation and state continuity; route pending/error behavior |
| REQ-002, REQ-003, REQ-004, REQ-005 | Home search, suggestions, history, result grouping, source/action semantics |
| REQ-006, REQ-007, REQ-008, REQ-009, REQ-010 | Shared feedback, dialogs, export, notification, sandbox, citation patterns |
| REQ-011 | Shell order, responsive navigation, footer and disclaimer |
| REQ-012, REQ-013, REQ-014, REQ-015, REQ-016, REQ-017 | Intelligence hierarchy, filters/ledger, ODE handoff, fail-closed empty state |
| REQ-018, REQ-019, REQ-020, REQ-021 | ODE input bounds, presets, accessible trajectories, threshold/severity semantics |
| REQ-022, REQ-023, REQ-024, REQ-025 | Workbench factor/regimen order, clearing warning, safety priority, dose table |
| REQ-026, REQ-027, REQ-028 | AI workflow states, source/governance hierarchy, deterministic safety priority |
| REQ-029, REQ-030, REQ-031, REQ-032, REQ-033 | Map controls and alternative, persistent selection, country hierarchy, simulation labels |
| REQ-034, REQ-035, REQ-036, REQ-037, REQ-038, REQ-039 | Audit, proof, architecture/math, calibration, citation graph patterns |
| REQ-040, REQ-041, REQ-042, REQ-043 | Persona-safe comparison, ranking hierarchy, snapshot/export, deep-link empty state |
| REQ-044 | Protected evidence-submission flow and retained validation/error context |
| REQ-045, REQ-046, REQ-047 | Editor identity/filter/pagination/export, taxonomy, status mutation and focus behavior |
| REQ-048 | Auth-aware shell and callback progress/success/failure/recovery |
| REQ-049 | Shared pending, skeleton, empty, validation, offline, auth, error, retry and recovery states |
| REQ-073 | Footer/discovery access and stable canonical navigation |
| REQ-074 | WCAG conformance contract and assistive-technology acceptance |
| REQ-075 | Responsive layout and browser acceptance matrices |
| REQ-076 | Single-shell/state assumptions; no duplicate behavior model |
| REQ-077 | Content/source preservation and persona-invariant clinical data |
| REQ-078 | Discoverable `/math` equivalent, architecture tabs, report corpus access |

## Handoff Requirements

### Frontend

Implement each route and shared pattern against this document and retain the requirement IDs in
component/browser test names. Freeze production captures before visual implementation. Confirm
dialog focus return, route focus/scroll behavior, state continuity, chart/map text alternatives,
and all mutation/error states before requesting parity review.

### Backend

UI conformance depends on stable, distinguishable response status/message/correlation ID; explicit
authenticated/editor state; pagination counts/cursors; field-level validation details; mutation
audit outcomes; and no fabricated data on intelligence failures. Preserve these contract fields or
request an architecture decision before implementation.

### Validation Planning

Build journey fixtures for each PM scenario and pair automated scans with manual keyboard,
screen-reader, zoom/reflow, reduced-motion, forced-colors, visual, and latest-two-major browser
checks. Treat missing production screenshots as a visual-signoff blocker, not permission to invent
a replacement design.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t3-pm.md` — inventory index, validation summary,
  and downstream capability source.
- `.github/modernize/rearchitecture/artifacts/t3-pm-capability-inventory.md` — 78 requirements,
  actors, routes, user scenarios, states, and parity success criteria.
- `.github/modernize/rearchitecture/clarification.md` — target visual language, responsive,
  accessibility, browser, routing/state, auth, persistence, and source-authority decisions.
- `.github/modernize/rearchitecture/artifacts/constitution.md` — binding parity, preservation,
  clinical integrity, accessibility, and evidence gates.
- `.github/modernize/rearchitecture/artifacts/project-structure.md` — route/domain boundaries and
  shared-state coupling.
- `.github/modernize/rearchitecture/artifacts/architecture_index.md` and 15 route behavior YAML
  files — must-preserve user branches, side effects, failure, fallback, and concurrency behavior.

## Evidence Mapping

- `t3-pm-capability-inventory.md#REQ-001 through REQ-049` → Information Architecture, Shared Interaction
  Patterns, and Route-Specific UX Requirements.
- `t3-pm-capability-inventory.md#REQ-073 through REQ-078` → shell discovery, WCAG, responsive/browser,
  single-state, content-preservation, and math/report requirements.
- `t3-pm-capability-inventory.md#User Scenarios and Independent Acceptance` → Browser and
  Assistive-Technology Acceptance.
- `clarification.md#Frontend` → Purpose and Authority, Responsive Layout Contract, WCAG contract,
  and browser acceptance.
- `constitution.md#VI` → WCAG 2.2 AA and Responsive Layout Contract.
- `units/*/behavior.yaml#must_preserve` → state continuity, fail-closed behavior, retained form
  context, mutation feedback, callback sanitation, and non-fabricated failure states.

## Test Results

- Command: `test -s .../t7-ux.md` plus required-heading and explicit UX requirement-ID checks
- Passed: 2 artifact gates (required sections; 55 explicitly mapped UX requirements)
- Failed: 0
- Skipped: application tests (documentation-only UX task; no source files changed)
