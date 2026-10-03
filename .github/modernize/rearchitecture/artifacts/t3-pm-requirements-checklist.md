# t3 Requirements Quality Checklist

## Requirement ID Coverage

- [x] Requirements use `REQ-XXX` format.
- [x] IDs are unique and sequential from REQ-001 through REQ-078.
- [x] Every item has a disposition: PRESERVE, RESTORE, RECONCILE, or CONSTRAINT.

## Testability

- [x] Each requirement specifies observable inputs, outputs, state transitions, or errors.
- [x] Positive, boundary, empty, error, authorization, and persistence behaviors are explicit.
- [x] Clinical calculations identify frozen constants/boundaries that require golden fixtures.
- [x] Success criteria are measurable and produce a binary parity verdict.

## Source Coverage

- [x] Active root: 9/9 routes, shell, shared state, components, services, data, types, server, and
  public discovery assets.
- [x] Archived web: 6/6 routes, comparison, submission, editor, auth, math, shell, and recovery.
- [x] Archived API: 13/13 method/path contracts, middleware, errors, auth, intelligence, exports.
- [x] Archived domain/data: validation, registry allowlist, evidence/condition/audit/monitoring
  shapes, DynamoDB-compatible behavior, and memory fallback.
- [x] Archived ingestion: PubMed, ClinicalTrials.gov, AYUSH/DHARA, CTRI/ICTRP, parsing,
  deduplication, freshness, rate limits, retries, and failures.
- [x] Archived documentation: math/report/print capabilities included; deployment execution
  correctly excluded.

## Route/API Reconciliation

- [x] Root behavior wins conflicts; archive-only behavior is additive.
- [x] Root route aliases and archived routes are not silently removed.
- [x] Existing paths, methods, payload semantics, headers, statuses, and error meanings are
  represented.
- [x] Public versus authenticated/editor-only access is explicit.

## Constitution Alignment

- [x] Archive remains intact until parity is proven.
- [x] No active-root capability is removed or narrowed.
- [x] Exact target versions and lazy routing are retained as constraints.
- [x] Cognito-compatible claims/editor authorization are preserved server-side.
- [x] Schemas are additive/non-destructive and memory fallback is explicit.
- [x] WCAG 2.2 AA, responsive behavior, and latest-two-major browser targets are included.
- [x] Deployment, Git operations, archive removal, and production-data mutation remain excluded.

## Open Items for Downstream Evidence

- [ ] Architect maps all REQ IDs to target design elements and resolves route placement for
  restored archive surfaces without changing their observable contracts.
- [ ] Teamlead maps all REQ IDs to independently executable tasks and validation gates.
- [ ] UX supplies production screenshots/state baselines and manual WCAG checks.
- [ ] Tester freezes clinical, API, persistence, browser, visual, accessibility, performance,
  availability, and ingestion baselines before implementation changes.

## Verdict

**PASS — ready for target design and validation planning.** No scope clarification remains.
