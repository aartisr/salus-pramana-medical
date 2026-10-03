# Mandatory Validation Tail

Full parity validation belongs in the execution dependency graph, not in optional post-plan polish.

## What Happened

SALUS Pramana t8 converted the t6 VG-00 through VG-15 strategy into a final plan phase that depends
on every implementation slice. External prerequisites may explain a blocked gate, but they cannot
remove its task, weaken its evidence, or convert the overall result to a pass.

## Takeaway

For brownfield parity plans, model full validation as an explicit final plan item with executable
tasks, raw evidence outputs, and a binary report. Keep independent infrastructure, browser,
identity, visual, and baseline axes separate so one unavailable capability never waives another.

## History

- 2026-09-30 (salus-pramana-medical/t8): initial
