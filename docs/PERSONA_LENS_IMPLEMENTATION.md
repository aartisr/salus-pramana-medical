# Persona lens implementation status

Persona lenses change how SALUS presents information and orders tasks. They do **not** alter source records, evidence grades, Pramana scores, confidence intervals, governance gates, or safety calculations.

| Lens | Status | Current behavior |
| --- | --- | --- |
| Patient & Family Advocate | Implemented | Uses plain language, foregrounds evidence and safety, and places mathematical/model parameters behind an optional disclosure. The AI prompt requests a plain-language, source-linked explanation. |
| Attending Physician / Vaidya | Implemented | Prioritizes contraindications, renal and pregnancy context, monitoring prompts, source provenance, and structured clinical review. |
| Principal Investigator | Implemented | Prioritizes methods, uncertainty, source inspection, model assumptions, and reproducibility context. |
| WHO / Health Ministry | Implemented | Prioritizes affordability, coverage, equity gaps, population assumptions, and deployment scenarios. |
| Independent Science Auditor / Juror | Implemented | Prioritizes scope, claims, limitations, governance gates, calibration evidence, source records, and implementation artifacts. |

## Completion rule

A lens is only marked implemented after it has a visible, testable effect in the homepage and the relevant workspaces. Cosmetic relabeling alone does not count.
