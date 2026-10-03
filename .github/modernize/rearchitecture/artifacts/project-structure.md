# Project Structure

## Classification

Brownfield full-stack TypeScript application with an active single-package React/Vite/Express root and an archived npm-workspace monorepo containing a React client, Hono API, ingestion jobs, shared domain package, AWS infrastructure, and technical documentation.

## Source Authority

The active root and current production browser behavior are authoritative. The archive supplies capabilities absent from the active root but cannot override newer root behavior and remains immutable until parity is proven.

## Entrypoints

| Surface | Entrypoint | Role |
| --- | --- | --- |
| Active browser | `index.html` -> `src/main.tsx` -> `src/App.tsx` | React 19 application bootstrap |
| Active routes | `src/app/router.tsx` | Nine lazy TanStack routes with shared boundaries |
| Active server | `server.ts` | Express JSON endpoint plus Vite middleware/static serving |
| Archived browser | `archive/legacy-monorepo/apps/web/src/main.tsx` | Six TanStack routes under query/error providers |
| Archived API | `archive/legacy-monorepo/services/api/src/server.ts` -> `app.ts` | Hono HTTP server with global middleware and route registrars |
| Archived Lambda | `archive/legacy-monorepo/services/api/src/lambda.ts` | API adapter entrypoint |
| Archived ingestion | four `services/ingestion/src/*-ingestor.ts` handlers | PubMed, ClinicalTrials.gov, AYUSH, and CTRI jobs |
| Archived domain | `archive/legacy-monorepo/packages/domain/src/index.ts` | Zod schemas and shared serialized types |

## Measured Source Layout

Counts were measured with `rg --files` on 2026-09-30.

| Layer | Files | Responsibility |
| --- | ---: | --- |
| Active TypeScript/TSX | 52 | Current product behavior |
| Active routes | 9 | Thin lazy route adapters |
| Active components | 22 | Bespoke medical UI, charts, modals, workbenches |
| Active services | 7 | Deterministic clinical math, export, subscription, local persistence |
| Archived web | 27 | Dashboard, submission, comparison, editor/auth, math UX |
| Archived API | 20 | HTTP contracts, auth, repository, intelligence and governance calculations |
| Archived ingestion | 13 | Four connectors plus retry, parsing, normalization, dedupe |
| Archived domain | 2 | Runtime schemas/types and tests |

## Layers And Boundaries

- `src/app`: router, root layout, app context, query client, loading/error boundaries.
- `src/routes`: one thin route component per authoritative URL.
- `src/components`: page-level experiences and shared UI controls.
- `src/services`: deterministic calculations and browser persistence/export effects.
- `src/data` and `src/types`: static datasets and active-root contracts.
- Archived `apps/web`: API-backed parity workflows and Cognito PKCE client.
- Archived `services/api`: middleware -> route registrars -> deterministic services/repository.
- Archived `services/ingestion`: handler -> bounded HTTP/parsers -> normalization/dedupe -> evidence store.
- Archived `packages/domain`: shared validation boundary across API and ingestion.

## Functional Domains

- Research navigation and persona-sensitive presentation.
- Scientific/Nobel audit and citation provenance.
- Global health equity visualization.
- Cross-system evidence intelligence and governance gates.
- ODE interaction trajectories and dose-response optimization.
- Clinical decision workbench and recent-search persistence.
- AI-assisted synthesis with deterministic fallback.
- Calibration/drift reporting.
- Evidence discovery, CSV export, submission, editorial publication, and audit trail.
- Cognito-compatible PKCE sign-in and evidence-editor authorization.
- PubMed, ClinicalTrials.gov, AYUSH, and CTRI ingestion.

## Key Configuration

- `package.json`: active scripts and dependency versions.
- `tsconfig.json`: ES2022/bundler/no-emit compilation; archive excluded.
- `vite.config.ts`: React and Tailwind plugins, root alias, conditional HMR.
- `vitest.config.ts`: active `src/**/*.test.ts(x)` discovery.
- `vercel.json`: current hosting behavior reference; deployment is out of scope.
- Archived workspace/package manifests: legacy build/test boundaries.
- `archive/legacy-monorepo/infra/template.yaml`: archived job/API convention bindings only; immutable and not a deployment target.

## Migration-Relevant Coupling

- Active route state is centralized in `AppStateProvider`; route chunks must not create duplicate providers.
- Archived web clients couple frozen payloads to archived API paths.
- API and ingestion share `TreatmentEvidence` serialized fields and DynamoDB `evidenceId` identity.
- Intelligence routes read the same repository snapshot used by evidence listing and enforce draft visibility through auth.
- Ingestion records are drafts and remain invisible to public reads until editorial publication.
