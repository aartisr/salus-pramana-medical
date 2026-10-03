# Evidence Status Compatibility

The active and archived evidence models contain different publication-status values that require additive compatibility.

## What Happened

In SALUS Pramana task t2, active `TreatmentEvidence` allowed `published|draft|under_review`, while archived persisted/API behavior allowed `draft|published|rejected`.

## Takeaway

The target model and readers must accept both `under_review` and `rejected`; do not rename or bulk-rewrite existing values. Keep API-specific validation compatible with each frozen endpoint contract.

## History

- 2026-09-30 (salus-pramana-medical/t2): initial
