<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.1.0 (active-root destination amendment)
- Added principles: Source Authority and Preservation; Exhaustive Capability Parity;
  Immutable Target Stack and Rewrite Boundary; Contract, Identity, and Data Continuity;
  Clinical Determinism and Evidence Integrity; Accessible Responsive Equivalence;
  Evidence-Based Validation
- Added sections: Target Technology Stack; Rewrite Constraints and Invariants;
  Delivery Workflow and Quality Gates; Upstream Artifacts Consumed; Evidence Mapping
- Removed sections: none
- Templates requiring updates:
  - OK: creating-implementation-plan/templates/plan-template.md already requires a
    Constitution Check, requirement traceability, and brownfield testing strategy
  - OK: feature-inventory/templates/spec-template.md already requires a scope baseline,
    requirements, independent tests, and measurable outcomes
  - OK: creating-implementation-plan/templates/tasks-template.md already supports
    story-based tasks, dependency ordering, and test-first execution
- Amended principle: Source Authority and Preservation now authorizes planned active-root edits
  while retaining frozen pre-change evidence and immutable archive provenance
- Follow-up TODOs: none; performance and availability numbers must be measured and set by
  the validation-strategy task rather than invented in this constitution
-->

# SALUS Pramana Brownfield Rewrite Constitution

## Migration Mode

**Mode**: REWRITE

**Justification**: The 18,611 LOC scope combines the active root React application with
capabilities retained in an archived React/AWS monorepo. The work requires an in-place
brownfield consolidation on the mandated target stack, with functional and observable
equivalence rather than a dependency-only upgrade. Frozen active-root/production baselines
remain the behavioral source of truth and the archive remains preserved evidence until parity
is proven.

## Core Principles

### I. Source Authority and Preservation (NON-NEGOTIABLE)

- The current repository root, current production browser behavior, and production UI states
  MUST define the authoritative behavior when they conflict with archived implementations.
- `archive/legacy-monorepo` MUST remain intact and available for provenance until the final
  parity gate passes. No task may delete, move, rewrite, or truncate it.
- Active-root capabilities MUST NOT be removed, disabled, or narrowed during the rewrite.
- Rewrite implementation MUST modify the active workspace root
  `/Users/rraviku2/aarti/salus-pramana-medical`; pre-change behavior and content MUST be frozen
  as baseline evidence before implementation, and governance artifacts remain under the
  assigned modernization artifact directory.

Rationale: Brownfield parity cannot be established if either the reference behavior or its
historical implementation evidence changes during the comparison.

### II. Exhaustive Capability Parity and Traceability (NON-NEGOTIABLE)

- Discovery MUST inventory every user-visible flow, route, UI state, API operation, ingestion
  path, authorization rule, persistence behavior, export, calculation, dataset, failure mode,
  and operational contract in both the active root and archived monorepo.
- Every discovered capability MUST receive a stable requirement ID. Each requirement MUST map
  to a target design element, one or more independently executable implementation tasks, and
  executable validation evidence.
- A capability may be declared equivalent only when its positive path, boundary behavior,
  error behavior, authorization behavior, persistence effect, and externally visible contract
  match the authoritative source.
- Missing, deferred, partially implemented, manually assumed, or untested capabilities count
  as parity failures. Scope reduction requires an explicit user amendment to this constitution.

Rationale: A successful build or similar appearance is not evidence of complete brownfield
parity.

### III. Immutable Target Stack and Rewrite Boundary

- The target versions in this constitution are requirements, not recommendations. Downgrades,
  framework substitutions, parallel routers, or alternate state-management stacks are
  prohibited unless the user approves a constitution amendment.
- React components MUST use React 19. Server state MUST use TanStack Query 5. Navigation MUST
  use TanStack Router 1 with lazy route splitting. Styling MUST use Tailwind CSS 4 while
  preserving the bespoke active-root light medical visual language.
- Backend HTTP behavior MUST run on Express 4.21 and Node.js 22. Client build and development
  MUST use Vite 8.
- Route adapters MUST remain thin. Shared client concerns belong in the application layer;
  reusable presentation in components; deterministic domain behavior in services; source data
  in data modules; shared contracts in types. Any changed boundary requires architect approval
  and an amended constitution.
- Deployment, infrastructure rollout, Git commits, Git pushes, archive removal, and removal of
  active-root capabilities are outside this rewrite and MUST NOT be performed.

Rationale: One explicit stack and one implementation boundary prevent compatibility shims and
duplicate subsystems from becoming permanent architecture.

### IV. Contract, Identity, and Data Continuity (NON-NEGOTIABLE)

- Existing legacy endpoint paths, HTTP methods, request and response payloads, headers, status
  codes, pagination behavior, and error semantics MUST be preserved unless a versioned additive
  contract is explicitly approved.
- Authentication MUST remain Cognito-compatible. Token validation, identity claims, role and
  group interpretation, and evidence-editor authorization MUST be preserved and covered by
  positive and negative contract tests. Authorization MUST be enforced server-side.
- DynamoDB-compatible schemas MUST be non-destructive and backward compatible. Existing keys,
  records, indexes, and readable attributes MUST NOT be renamed, dropped, overwritten, or
  bulk-rewritten. Schema evolution MUST be additive and safely readable by old and new shapes.
- Local development and tests MUST provide a deterministic in-memory persistence fallback with
  the same repository contracts and observable semantics as the DynamoDB-compatible adapter.
  Fallback activation MUST be explicit; it MUST NOT silently replace a failed production store.
- Migration verification MUST use isolated test data and MUST NOT mutate production data.

Rationale: Contract, authorization, and data drift can cause clinical workflow loss even when
the interface appears unchanged.

### V. Clinical Determinism and Evidence Integrity (NON-NEGOTIABLE)

- Existing deterministic evidence scoring, calibration, dose-response, contraindication, and
  ODE/RK4 behavior MUST preserve formulas, constants, units, bounds, rounding rules, and
  failure states unless an approved requirement specifies a correction.
- Evidence grades, registry identifiers, citations, provenance, and audit records MUST remain
  visible and traceable from inputs to outputs. Generated clinical claims MUST NOT bypass the
  established registry allowlist or evidence hierarchy.
- Missing or invalid safety-critical evidence MUST fail closed using the established observable
  behavior, including `INSUFFICIENT_EVIDENCE` where applicable. AI-generated content MUST NOT
  override deterministic safety or authorization decisions.
- Clinical parity MUST be demonstrated with golden fixtures and tolerance rules approved in the
  validation strategy; visual snapshots alone are insufficient.

Rationale: This medical research system must remain auditable and reproducible across the
rewrite.

### VI. Accessible, Responsive, and Browser-Equivalent Experience

- Every preserved and restored user journey MUST meet WCAG 2.2 Level AA, including keyboard
  operation, visible focus, semantic structure, accessible names, contrast, status messaging,
  error identification, target sizing, reflow, and reduced-motion behavior where applicable.
- The implementation MUST be mobile-first, preserve the active root breakpoints and current
  desktop/mobile layouts, and prevent clipping, overlap, inaccessible controls, and horizontal
  page scrolling at validation viewports.
- Browser validation MUST cover the latest two major versions of Chrome, Firefox, Safari, and
  Edge, or their Playwright-equivalent engines where direct automation is unavailable. Any
  substitution and its coverage gap MUST be explicit in validation evidence.
- English is the only required locale for this rewrite, but user-facing text MUST remain
  separable from business rules so future internationalization does not require domain changes.

Rationale: Parity includes interaction and access, not only rendered content.

### VII. Evidence-Based Validation and No-Regression Gates

- Before implementation, the team MUST capture authoritative baseline evidence for behavior,
  UI states, API contracts, clinical calculations, accessibility, latency, ingestion, and
  availability. The validation-strategy task MUST define measurable thresholds from that
  baseline; it MUST NOT invent unsupported production numbers.
- Implementation tasks MUST use test-first or characterization-test-first execution where
  behavior exists. Every task MUST run its narrowest relevant checks before broader validation.
- Final validation MUST include frozen dependency installation, type checking, linting, the
  full unscoped production build, unit tests, API contract tests, persistence adapter parity
  tests, authentication and authorization tests, integration tests, critical-journey browser
  tests, visual regression checks, automated accessibility checks, and required manual WCAG
  checks.
- Performance, availability, and ingestion MUST meet or improve the measured production
  baseline with no unexplained regression. Evidence MUST identify commands, environments,
  versions, counts, return codes, and retained artifacts.
- A gate verdict is binary: PASS or FAIL. Any missing required evidence, failed test, unresolved
  HIGH or CRITICAL finding, constitution violation, or unproven requirement is FAIL. No
  conditional pass is permitted.

Rationale: Reproducible evidence is the only acceptable basis for declaring parity.

## Target Technology Stack

| Component | Target Version | Notes |
| --------- | ------------- | ----- |
| Runtime | Node.js 22 | Planned build, test, API, and development commands MUST resolve to Node.js 22 |
| Language | TypeScript 7 | Root package declaration is authoritative; strictness changes require explicit planning |
| UI | React 19 | Preserve bespoke active-root components and observable behavior |
| Client build | Vite 8 | One client build pipeline; route chunks MUST build and load independently |
| Styling | Tailwind CSS 4 | Preserve the active-root light medical theme and existing breakpoints |
| Server state | TanStack Query 5 | Single shared query client; no duplicate server-state store |
| Router | TanStack Router 1 | Typed lazy routes with deep-link and error/loading-state validation |
| HTTP server | Express 4.21 | Preserve all discovered legacy API contracts |
| Authentication | Cognito-compatible | Preserve claims and evidence-editor authorization semantics |
| Persistence | DynamoDB-compatible plus memory fallback | Additive schemas; explicit deterministic local fallback |
| Unit/component tests | Vitest 5 | Root test command remains a real, non-placeholder suite |
| Browsers | Latest 2 major versions | Chrome, Firefox, Safari, and Edge coverage required |
| Accessibility | WCAG 2.2 AA | Automated checks plus manual checks where automation is insufficient |

## Rewrite Constraints and Invariants

- Frozen pre-change active-root evidence and the production site are behavioral references for
  the in-place rewrite. If they disagree, current production-observable behavior controls unless
  the feature inventory documents a defect and the user approves a correction.
- Archived capabilities MUST be reconciled with active-root behavior; they MUST NOT be copied
  blindly or allowed to regress newer root capabilities.
- The active runtime MUST not import files from `archive/legacy-monorepo`. Provenance links and
  copied test fixtures may reference archive evidence during migration.
- No secrets, credentials, tokens, or production medical data may be committed, logged, placed
  in fixtures, or exposed to client code. Configuration MUST use environment contracts with
  safe local defaults only where behavior is non-sensitive.
- The rewrite MUST avoid destructive database operations and automatic production migrations.
  Any future deployment or data migration requires a separate approved scope.
- Accessibility, security, medical safety, and data integrity requirements cannot be waived to
  accelerate parity delivery.

## Delivery Workflow and Quality Gates

1. Architecture analysis and feature inventory MUST complete before target design or detailed
   implementation planning. The inventory MUST reconcile active-root and archived evidence.
2. Target architecture, data design, validation strategy, and UX requirements MUST reference
   stable requirement IDs and identify unresolved conflicts explicitly.
3. The implementation plan MUST be organized by independently testable vertical capability
   slices, not isolated technical layers. Every task MUST fit one role and one agent session,
   list exact inputs and outputs, and end with executable verification.
4. Implementation MUST proceed only after the plan-quality gate returns PASS. Each capability
   slice MUST preserve existing behavior before adding archived-only behavior.
5. Final parity requires all requirement mappings complete, all mandatory checks passing, no
   unresolved HIGH or CRITICAL findings, no constitution violations, and retained evidence for
   independent review.
6. Archive removal, source-root capability removal, deployment, and repository publication
   remain forbidden even after parity; each requires a separately authorized task.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/clarification.md` — authoritative target stack, scope,
  preservation rules, parity definition, accessibility/browser targets, and exclusions.
- `.github/modernize/rearchitecture/artifacts/project-profile.yaml` — 18,611 LOC rewrite
  classification, source areas, deep-planning requirement, and all-at-once execution context.

## Evidence Mapping

- `clarification.md#Frontend` -> Principles III and VI; Target Technology Stack.
- `clarification.md#Backend` -> Principles IV and VII; Target Technology Stack.
- `clarification.md#Generic` -> Principles I, II, and VII; Rewrite Constraints and Invariants.
- `clarification.md#Downstream Usage Notes` -> Principles I and II; Delivery Workflow and
  Quality Gates.
- `project-profile.yaml#project` -> Migration Mode; Principles I and II.
- `project-profile.yaml#assessment` -> Migration Mode; Delivery Workflow and Quality Gates.

## Governance

- This constitution governs every discovery, design, implementation, and validation artifact
  in this rewrite. Downstream artifacts MUST include an explicit constitution check.
- Constitution violations are CRITICAL and block downstream execution. Conflicts MUST be
  escalated to the coordinator and relevant owner; they cannot be accepted locally.
- Amendments require the user or coordinator to approve a written rationale, affected
  requirements, migration impact, and validation changes before dependent work proceeds.
- Versioning follows semantic versioning: MAJOR for incompatible principle changes or removals,
  MINOR for new principles or materially expanded obligations, and PATCH for non-semantic
  clarification. Each amendment updates the Sync Impact Report and Last Amended date.
- Quality gates are deterministic and binary. The reviewer of a gate MUST be distinct from the
  producer of the artifact under review. Missing artifacts or evidence produce FAIL.
- Requirement precedence is: explicit current user instruction, approved clarification,
  constitution, approved architecture/specification, implementation plan, then task-local
  preference. Any unresolved conflict MUST stop affected work.

**Version**: 1.1.0 | **Ratified**: 2026-09-30 | **Last Amended**: 2026-09-30
