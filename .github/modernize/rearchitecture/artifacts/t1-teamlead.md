# t1 — Rewrite Constitution and Target-Stack Guardrails

## Summary

Ratified constitution version 1.0.0 for the complete 18,611 LOC brownfield rewrite. It fixes
the source precedence, preservation boundary, target stack, parity standard, contract and data
invariants, clinical-safety obligations, accessibility/browser scope, and binary validation
rules that govern downstream work.

## Deliverables

- [constitution.md](./constitution.md) — normative rewrite constitution and stack guardrails.

## Validation Results

- Check: unresolved template tokens, ambiguous `should` language, ISO version/date line,
  required target-stack terms, preservation rule, and evidence sections.
- Result: PASS (all checks satisfied).
- Application tests: not run; this planning-foundation task changes no application source.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/clarification.md` — authoritative target stack, scope,
  preservation, parity, accessibility/browser, and exclusion decisions.
- `.github/modernize/rearchitecture/artifacts/project-profile.yaml` — rewrite classification,
  18,611 LOC scope, source areas, and deep-planning context.

## Evidence Mapping

- `clarification.md#Frontend` -> `constitution.md` Principles III and VI plus Target Technology
  Stack.
- `clarification.md#Backend` -> `constitution.md` Principles IV and VII plus Target Technology
  Stack.
- `clarification.md#Generic` and `#Downstream Usage Notes` -> `constitution.md` Principles I and
  II plus Rewrite Constraints and Invariants.
- `project-profile.yaml#project` and `#assessment` -> `constitution.md` Migration Mode and
  Delivery Workflow and Quality Gates.