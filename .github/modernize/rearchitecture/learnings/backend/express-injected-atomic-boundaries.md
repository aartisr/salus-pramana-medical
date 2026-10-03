# Express Injected Atomic Boundaries

Keep Express handlers behind narrow injected ports and pass audit input into mutation methods.

## What Happened
T015/T028-T030/T046-T050 needed to compile before parallel application and persistence exports were stable. Local interfaces kept routes testable; once exports landed, a server adapter consumed the real memory repository and clinical functions.

## Takeaway
Define HTTP-facing ports in the composition root, adapt concrete domain/persistence modules in one default-dependencies module, and model mutation plus audit as one repository call. This preserves atomicity and keeps native HTTP contract tests memory-safe.

## History
- 2026-09-30 (salus-pramana-medical/T015,T028-T030,T046-T050): initial