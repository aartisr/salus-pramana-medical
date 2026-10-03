# t8 - Traced Stage 2 Implementation Plan

## Summary

Defines a ten-phase, 70-task execution blueprint for the complete 18,611 LOC active-root rewrite. All 78 requirements map to implementation files, tasks, and executable evidence. The final phase is a mandatory VG-00 through VG-15 validation tail; unavailable external prerequisites keep their gates and overall parity `FAIL` without waiving independent work.

## Deliverables

- [t8-teamlead-plan.md](./t8-teamlead-plan.md) - technical plan, dependency order, vertical capability tasks, testing strategy, and 78-row requirement map.
- [checkpoints/t8-spec-to-plan.yaml](./checkpoints/t8-spec-to-plan.yaml) - machine-readable REQ-to-plan/task/gate coverage.
- [checkpoints/t8-plan-to-tasks.yaml](./checkpoints/t8-plan-to-tasks.yaml) - machine-readable plan-item-to-task coverage and execution dependencies.

## Planning Result

- Requirements mapped: 78 of 78.
- Plan phases: 10, including the mandatory validation tail.
- Tasks generated: 70, sequentially numbered and assigned to one-session implementation or validation outcomes.
- Unresolved clarifications: 0.
- Source/archive modifications authorized: 0.
- External prerequisites remain evidence blockers only for their dependent gates; they do not trigger scope reduction or another proceed confirmation.

## Test Results

- Command: Node structural validation of plan requirement rows, phase/task sequences, scripts, required sections, checkpoint YAML coverage, gate coverage, source annotations, and unresolved placeholders.
- Passed: 78 requirements; 10 plan items; 70 tasks; 16 validation gates; 2 checkpoints; 0 missing links.
- Failed: 0.
- Skipped: application execution because t8 produces the implementation plan; runtime execution begins only after the independent t9 plan gate.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/clarification.md` - normalized submitted F1-F10, B1-B5, and G1-G2 decisions.
- `.github/modernize/rearchitecture/artifacts/t4-architect.md` and linked detail files - target architecture, contracts, and design ownership.
- `.github/modernize/rearchitecture/artifacts/t5-dba.md` - non-destructive data and adapter contract.
- `.github/modernize/rearchitecture/artifacts/t6-teamlead.md` - validation strategy and mandatory gates.
- `.github/modernize/rearchitecture/artifacts/t7-ux.md` - UX, WCAG, responsive, visual, and browser acceptance.
- `.github/modernize/rearchitecture/artifacts/t3-pm.md` and `t3-pm-capability-inventory.md` - required product inventory used to satisfy the teamlead charter prerequisite.

## Evidence Mapping

- `t4-architect.md#Binding-Decisions` -> plan P1-P9 structure and exact-stack boundaries.
- `t4-architect-requirement-map.md#Requirement-To-Target-Design-Map` -> `checkpoints/t8-spec-to-plan.yaml`.
- `t5-dba.md#Verification-Matrix` -> P2 and P10 persistence tasks.
- `t6-teamlead.md#Measurable-Validation-Gates` -> P10/T058-T070.
- `t7-ux.md#Requirement-Coverage-Matrix` -> P3-P6 browser-facing tasks and VG-09-VG-12 evidence.
- `t3-pm-capability-inventory.md#Functional-Requirements` -> 78-row plan mapping.
