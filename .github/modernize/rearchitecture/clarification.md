---
schema: clarification/v1
generated_at: "2026-09-30T01:19:45Z"
scope:
  - frontend
  - backend
  - generic
clarity_score: 1.00
rounds: 1
gaps:
  - tests.existing_posture
  - output.location
  - constraints.additional
blocking_gaps: []
---

# Scenario Clarification

## Frontend

- **Target framework**: React 19 with Vite 8
- **Component library**: Existing bespoke components with Tailwind CSS 4
- **Screenshots**: Preserve all UI states from [saluspramana.ai-aarti.com](https://saluspramana.ai-aarti.com) and the current active root source; current production screenshots and browser reference are authoritative
- **Design system**: Match the active root light medical theme using `src/index.css` and current components
- **Accessibility**: WCAG 2.2 AA
- **Browser targets**: Modern evergreen Chrome, Firefox, Safari, and Edge, latest 2 major versions
- **Responsive strategy**: Mobile-first using existing breakpoints while preserving current desktop and mobile layouts
- **i18n locales**: English only for this migration, structured to permit future i18n
- **State management**: Preserve `src/app` shared state; use TanStack Query 5 for server state
- **Routing**: TanStack Router 1 with lazy route splitting

## Backend

- **Target framework**: Express 4.21 on Node.js 22
- **API contract preservation**: Preserve existing legacy endpoints, payloads, and status codes
- **Data migration strategy**: Use in-place compatible schemas, preserve existing DynamoDB data, support a local in-memory fallback, and do not destroy or rewrite production data
- **Auth framework**: Cognito-compatible auth preserving claims and evidence-editor authorization
- **SLA targets**: Match the current production baseline with no regression; define and document measurable latency, availability, and ingestion gates during implementation

## Generic

- **Success definition**: Complete legacy parity plus preservation of every active root capability, verified by all requested gates
- **Out of scope**: Deployment, Git commits, Git pushes, and removing active root capabilities
- **Existing test posture**: Must pass (default)
- **Output location**: Active workspace root `/Users/rraviku2/aarti/salus-pramana-medical` (explicitly authorized by the 2026-09-29 remediation instruction; supersedes the earlier catalog default)
- **Additional constraints**: None beyond the decisions listed in this specification. (default)

## Gaps & Defaults Applied

- id: tests.existing_posture
  resolution: default
  default_used: "must pass"
- id: output.location
  resolution: explicit-user-amendment
  default_used: "active workspace root: /Users/rraviku2/aarti/salus-pramana-medical"
- id: constraints.additional
  resolution: default
  default_used: "None beyond the decisions listed in this specification."

## Downstream Usage Notes

- The user explicitly authorized the complete 18,611 LOC migration; no further feasibility or proceed confirmation is required.
- Implement all planned parity work in the active workspace root; do not create or use the former sibling destination.
- Preserve `archive/legacy-monorepo` until feature parity is proven.
- Treat the active root TanStack routes, light theme, production UI, and current browser behavior as authoritative.
- Items listed under "Gaps & Defaults Applied" are working assumptions supplied by the field catalog and must not trigger another clarification round.
- There are no blocking clarification gaps.
