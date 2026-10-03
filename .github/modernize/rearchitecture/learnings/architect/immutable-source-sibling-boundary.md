# Immutable Source Sibling Boundary

For this rewrite, source and archive are immutable parity references while the complete runtime is rebuilt in a sibling directory.

## What Happened

In SALUS Pramana task t2, the active root was authoritative but archived-only UI, API, auth, data, and ingestion capabilities also had to reach the new runtime. The source repository could not be edited or imported at runtime.

## Takeaway

Use a full sibling-runtime boundary with cleanup disabled: enumerate all capability-bearing source areas in `must_rewrite`, keep source/archive in `legacy_allowed_to_remain`, and require target code to own copied or reimplemented behavior independently.

## History

- 2026-09-30 (salus-pramana-medical/t2): initial
