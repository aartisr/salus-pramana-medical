# SALUS

Author: [Aarti S Ravikumar](https://ai-aarti.com), [Pioneer Charter School of Science II](https://saugus.pioneercss.org/)

Evidence behind every path to healing.

One sentence thesis:
integrative medicine needs a transparent evidence operating system, not another opinion engine.

Six-line overview:

1. People already combine systems; software still pretends they do not.
2. Clinical confidence without evidence hierarchy is dangerous.
3. Black-box AI cannot be the final layer for health trust.
4. SALUS makes evidence inspectable, uncertainty explicit, and claims auditable.
5. Methods are published, constraints are visible, and assumptions are challengeable.
6. Anyone can review, reproduce, and improve the system.

SALUS is my attempt to solve one of the hardest trust problems in healthcare:
when healing systems disagree, people are forced to choose between authority and confusion.
They rarely get transparent evidence with explicit uncertainty.

I built SALUS to change that.

SALUS is an evidence-first platform that compares Allopathy, Ayurveda, Siddha, and Naturopathy without pretending all evidence is equivalent. It is designed so every claim is inspectable, every citation is traceable, and every recommendation is constrained by published mathematical and governance rules.

This is not just a product repo. It is an open scientific commons for evidence-aware integrative medicine.

If this mission resonates, star it, share it, critique it, reproduce it, and help shape a public standard people can actually trust.

> Contributor manifesto
>
> We do not optimize for hype.
> We optimize for traceable truth.
> We do not hide uncertainty.
> We quantify it and publish it.
> We do not ask for blind trust.
> We build systems worthy of verification.

## Why this matters now

Millions of people combine medical systems in real life. Most software does not model that reality honestly.

2026 is an inflection point:

- AI-generated medical content is scaling faster than evidence validation workflows.
- Cross-system care decisions are growing while interoperability remains fragmented.
- Public trust is dropping when recommendations cannot be audited.

The common failure pattern is predictable:

- elegant UI, weak evidence hierarchy
- confident recommendations, hidden assumptions
- no reproducible scoring logic
- no explicit protection against causal overclaiming

SALUS is intentionally built in the opposite direction:

- evidence hierarchy first
- uncertainty visible by design
- reproducible calculus, calibration, and governance gates
- low-cost deployment so trust infrastructure is not blocked by budget

This means SALUS can be challenged, audited, and improved by the community instead of being accepted as a black box.

The urgency is simple: if transparent evidence infrastructure is not built now, opaque recommendation systems will become the default standard.

## What makes SALUS different

1. It treats evidence integrity as a first-class product and engineering requirement.
2. It publishes its mathematical scoring logic, confidence gating, and validation criteria.
3. It enforces source and schema guardrails before claims can be operationalized.
4. It maps a high-ambition vision to a reproducible, low-cost deploy path.

In short: rigorous enough for researchers, legible enough for clinicians, and open enough for a global contributor community.

Read the strategic and mathematical backbone here:

- Vision and architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Detailed roadmap: [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)
- Innovation catalog: [docs/INNOVATIONS.md](docs/INNOVATIONS.md)
- Calculus spec: [docs/CALCULUS_MATH_SPEC.md](docs/CALCULUS_MATH_SPEC.md)

## Credibility commitments

SALUS commits to three non-negotiables:

1. Reproducibility: scoring logic and methodological assumptions are documented and reviewable.
2. Traceability: claims must map back to citable sources and validated schema paths.
3. Falsifiability: outputs should be testable, contestable, and improvable through evidence.

Where to validate these commitments:

- Mathematical specification and constraints: [docs/CALCULUS_MATH_SPEC.md](docs/CALCULUS_MATH_SPEC.md)
- Governance and execution details: [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)
- Calibration reporting artifact: [docs/reports/synthetic-calibration-report.md](docs/reports/synthetic-calibration-report.md)

## Current implementation status

Implemented now:

- React + Vite web app with dashboard, comparison surfaces, and evidence submission workflow
- Hono API routes for health, condition listing, evidence listing, and evidence creation
- Shared domain schemas and validation rules in the domain package
- Local in-memory mode for fast development without cloud dependencies
- AWS SAM baseline for Lambda API, DynamoDB, Cognito, S3, and CloudFront

In active roadmap execution:

- Editorial publish workflow and mutation auth hardening
- Automated ingestion connectors (PubMed, ClinicalTrials.gov, AYUSH/DHARA, CTRI/ICTRP)
- Pramana calculus intelligence modules and calibration gates
- Extended free-tier cost controls and operational guardrails

Status trackers and phase evidence:

- Completion matrix: [docs/PHASE_COMPLETION_MATRIX.md](docs/PHASE_COMPLETION_MATRIX.md)
- Synthetic calibration snapshot: [docs/reports/synthetic-calibration-report.md](docs/reports/synthetic-calibration-report.md)
- Calibration report JSON: [docs/reports/synthetic-calibration-report.json](docs/reports/synthetic-calibration-report.json)

## Product philosophy in one line

SALUS does not ask users to trust conclusions.
It asks users to inspect the evidence chain that produced them.

## Movement invitation

If you are a clinician, researcher, engineer, public health leader, or patient advocate, you can help shape this into a transparent evidence layer for integrative care.

This is a build-in-public movement with scientific accountability. The goal is not to win an argument between systems. The goal is to create a shared, auditable evidence language across systems.

High-value ways to contribute:

1. Audit assumptions in the calculus and governance docs.
2. Improve ingestion quality and citation traceability.
3. Expand condition coverage and cross-system evidence depth.
4. Stress-test UX clarity for real-world decision workflows.
5. Deploy the free-tier path and report reproducibility findings.

## Stack

- Frontend: React 18, TanStack Query/Router/Table, Vite, Vitest
- API: Hono, Node.js 20, AWS Lambda-compatible handler
- Domain: Zod schemas and shared model contracts
- Data: DynamoDB with local in-memory fallback for development
- Infra: AWS SAM template and deploy workflow

## Repository layout

- [apps/web](apps/web): frontend application
- [services/api](services/api): API service and route layer
- [services/ingestion](services/ingestion): ingestion pipeline modules
- [packages/domain](packages/domain): shared schemas, types, validations
- [infra](infra): AWS SAM infrastructure template
- [docs](docs): architecture, math spec, deployment, guardrails, UX and roadmap artifacts
- [scripts](scripts): operational helper scripts

## Quick start (local)

Prerequisites:

- Node.js 20+
- npm 9+

Install and run:

```bash
npm install
npm run dev
```

Open:

- Web: http://localhost:5173
- API: http://localhost:8787

Notes:

- API runs without AWS credentials in local mode unless DYNAMODB_TABLE is configured.
- Frontend API base defaults to http://localhost:8787 and can be overridden with VITE_API_BASE_URL.

### Frontend auth variables (Cognito Hosted UI + PKCE)

For protected write routes, configure these Vite variables in your local env file:

- VITE_COGNITO_DOMAIN (example: https://<domain>.auth.us-east-1.amazoncognito.com)
- VITE_COGNITO_CLIENT_ID
- VITE_COGNITO_REDIRECT_URI (recommended: http://localhost:5173/auth/callback)
- VITE_COGNITO_SCOPES (default: openid email profile)

The callback route is /auth/callback, and /new is sign-in gated when auth is configured.

## Core API and validation snapshot

Current routes are defined in [services/api/src/app.ts](services/api/src/app.ts):

- GET /health
- GET /conditions
- GET /evidence
- POST /evidence

Validation contracts are defined in [packages/domain/src/index.ts](packages/domain/src/index.ts), including:

- Evidence grade guardrails (A, B, C)
- Registry prefix validation (PMID, DOI, CTRI, ICTRP, AYUSH, DHARA, NCT)
- URL format checks for source links
- Typed interaction and contraindication structures

## Scripts

Workspace scripts in [package.json](package.json):

- npm run dev
- npm run build
- npm run test
- npm run lint
- npm run docs:pdf
- npm run docs:pdf:academic
- npm run docs:pdf:executive

## Documentation index (full reference map)

Foundational strategy and architecture:

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)
- [docs/INNOVATIONS.md](docs/INNOVATIONS.md)
- [docs/PHASE_COMPLETION_MATRIX.md](docs/PHASE_COMPLETION_MATRIX.md)

Mathematical and scientific model:

- [docs/CALCULUS_MATH_SPEC.md](docs/CALCULUS_MATH_SPEC.md)
- [docs/CALCULUS_MATH_SPEC.html](docs/CALCULUS_MATH_SPEC.html)
- [docs/CALCULUS_MATH_SPEC.mathml.html](docs/CALCULUS_MATH_SPEC.mathml.html)
- [docs/CALCULUS_MATH_SPEC.pdf](docs/CALCULUS_MATH_SPEC.pdf)
- [docs/CALCULUS_MATH_SPEC.executive.pdf](docs/CALCULUS_MATH_SPEC.executive.pdf)

UX, quality, and acceptance artifacts:

- [docs/UX_WORLD_CLASS_FLOW_BLUEPRINT.md](docs/UX_WORLD_CLASS_FLOW_BLUEPRINT.md)
- [docs/RESPONSIVE_ACCEPTANCE_CHECKLIST.md](docs/RESPONSIVE_ACCEPTANCE_CHECKLIST.md)

Deployment and operations:

- [docs/DEPLOY_AWS.md](docs/DEPLOY_AWS.md)
- [docs/AWS_FREE_TIER_DEPLOYMENT_GUIDE.md](docs/AWS_FREE_TIER_DEPLOYMENT_GUIDE.md)
- [docs/ZERO_COST_GUARDRAILS.md](docs/ZERO_COST_GUARDRAILS.md)
- [infra/template.yaml](infra/template.yaml)

Reporting and print profiles:

- [docs/reports/synthetic-calibration-report.md](docs/reports/synthetic-calibration-report.md)
- [docs/reports/synthetic-calibration-report.json](docs/reports/synthetic-calibration-report.json)
- [docs/pdf-print.css](docs/pdf-print.css)
- [docs/pdf-print-academic.css](docs/pdf-print-academic.css)
- [docs/pdf-print-executive.css](docs/pdf-print-executive.css)

Operational script:

- [scripts/verify-editor-role.mjs](scripts/verify-editor-role.mjs)

## Build calculus PDFs

```bash
npm run docs:pdf
```

This regenerates both PDF variants from the markdown calculus specification.

## Deploy to AWS

Start with the short path in [docs/DEPLOY_AWS.md](docs/DEPLOY_AWS.md), then use the detailed walkthrough in [docs/AWS_FREE_TIER_DEPLOYMENT_GUIDE.md](docs/AWS_FREE_TIER_DEPLOYMENT_GUIDE.md).

Minimal command flow:

```bash
npm install
npm run build
sam build -t infra/template.yaml
sam deploy --guided
```

Then upload frontend assets to S3 and invalidate CloudFront.

### Production handoff checklist

Before the first production deployment, set `WebAppUrl` to the final HTTPS origin and `AllowedCorsOrigins` to that exact origin. The stack forwards those values to Cognito and the API; this keeps browser access explicit instead of relying on wildcard CORS. Configure the matching `VITE_API_BASE_URL`, Cognito values, and update [apps/web/public/robots.txt](apps/web/public/robots.txt) with the deployed sitemap URL.

Evidence submissions are intentionally immutable drafts. Only members of the `evidence-editors` Cognito group can see drafts or publish, reject, or return them to draft; production editorial changes should use those workflows rather than database writes.

## Shared mission

If SALUS succeeds, it will not be because it marketed certainty.
It will be because it made evidence legible, uncertainty explicit, and decision logic auditable across systems that rarely interoperate.

If you believe healthcare choices should be explainable to ordinary people and reviewable by experts, this project is for you.

## Safety and scope disclaimer

SALUS is an evidence organization and presentation platform.
It is not medical advice, not a diagnostic tool, and not a substitute for licensed clinical judgment.
