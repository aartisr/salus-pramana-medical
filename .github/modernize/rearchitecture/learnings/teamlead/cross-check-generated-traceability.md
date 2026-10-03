# Cross-Check Generated Traceability

A passing generated checkpoint must be compared row-by-row with both its source plan and the canonical validation matrix.

## What Happened

SALUS Pramana t9 found that a checkpoint claiming 78/78 coverage disagreed with two plan mappings
and omitted five mandatory requirement-to-gate links. Aggregate counts alone did not reveal the
drift. Task t9.2 also found that phase declarations and requirement rows can each be internally
consistent while disagreeing with each other; task ownership was the discriminator for choosing
the canonical semantic link set. The final t9 re-audit found a third failure mode: primary
`phases[].requirements` rows were complete while duplicated `upstream_trace.source_requirements`
retained only range endpoints, omitting 168 links despite a passing checkpoint flag.

## Takeaway

For plan quality gates, independently extract requirement, plan-item, task, and validation-gate
sets from each authoritative artifact. Compare exact row contents before accepting a checkpoint's
own `passed` flag or aggregate coverage percentage. Retain a requirement/phase link only when the
requirement row names at least one task owned by that phase. Audit every duplicated traceability
view, including summary and upstream-trace sections, against the canonical map.

## History

- 2026-09-30 (salus-pramana-medical/t9): initial
- 2026-09-30 (salus-pramana-medical/t9.2): added task-backed canonical-map rule
- 2026-09-30 (salus-pramana-medical/t9): added duplicated upstream-trace validation
