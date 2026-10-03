# t3 — Complete Capability Parity Inventory

## Summary

Inventories the authoritative active-root product and every archived capability that must be
restored without regressing root behavior. The inventory defines 78 stable, independently
testable requirements across UI, API, clinical workflows, identity, persistence, ingestion,
exports, discovery, accessibility, responsive behavior, and failure states.

The current root and production behavior are authoritative where evidence conflicts. Archived
items marked `RESTORE` remain required for parity but may not override newer root behavior.

## Deliverables

- [t3-pm-capability-inventory.md](./t3-pm-capability-inventory.md) — reconciled capability
  inventory, actors, routes, API contracts, requirements, success criteria, and parity rules.
- [t3-pm-requirements-checklist.md](./t3-pm-requirements-checklist.md) — completeness and
  testability review with route/API/source coverage.

## Validation Results

- Requirement-ID uniqueness and sequence: PASS.
- Active-root route coverage: PASS, 9 of 9 routes represented.
- Archived route coverage: PASS, 6 of 6 routes represented.
- Archived API coverage: PASS, 13 of 13 method/path contracts represented.
- Required capability classes: PASS for positive, boundary, error, authorization, persistence,
  export, calculation, accessibility, and browser behavior.
- Application tests: not run; this PM task changes documentation only.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t1-teamlead.md` — located the ratified
  constitution and its source-authority, parity, preservation, and evidence rules.
- `.github/modernize/rearchitecture/artifacts/constitution.md` — normative scope, target stack,
  clinical/data/auth invariants, exclusions, and binary parity standard.
- `.github/modernize/rearchitecture/clarification.md` — resolved target stack, active-root
  precedence, archive preservation, accessibility/browser targets, and no-reconfirmation rule.
- `.github/modernize/rearchitecture/artifacts/project-profile.yaml` — 18,611 LOC scope and
  active/archive source areas.

## Evidence Mapping

- `t1-teamlead.md#Summary` and `constitution.md#Core Principles` → source precedence, immutable
  archive boundary, stable requirement IDs, and complete observable parity criteria.
- `clarification.md#Frontend` → REQ-001–REQ-049 and REQ-073–REQ-076.
- `clarification.md#Backend` → REQ-050–REQ-072.
- `clarification.md#Generic` and `#Downstream Usage Notes` → scope baseline, parity verdict rules,
  exclusions, assumptions, and success criteria.
- `project-profile.yaml#project.structure` → evidence-source coverage table and domain grouping.
