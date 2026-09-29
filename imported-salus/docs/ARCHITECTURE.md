# SALUS — System Architecture

> *The evidence behind every path to healing.*

## The Seven Pramana Modules

SALUS is composed of seven named subsystems, each embodying a dimension of evidence integrity.

### 1. Pramana Engine (`packages/domain`)
The proof-of-knowledge core. Zod schemas enforce that every record carries a valid grade (A/B/C),
a prefixed registry identifier (PMID / DOI / CTRI / NCT / AYUSH / DHARA / ICTRP), a source URL
from an allowlisted peer-reviewed domain, and populated contraindication and interaction arrays.
No record enters SALUS without passing this validator.

### 2. Pramana Score™ (`services/api` — score-calculator)
A living, time-decaying composite evidence strength number (0–100). Grade weight × recency decay
× log(sample size) × replication bonus. Recomputed nightly by an EventBridge-triggered Lambda.
Evidence ages — a 1992 study scores lower than a 2024 RCT with the same grade.

### 3. Convergence Map™ (`services/api` — convergence-mapper)
A network graph where interventions from different medical traditions that share the same MeSH
pharmacological action are connected. When Ayurveda and an RCT independently converge on the
same molecular pathway, that convergence is quantified and surfaced. Stored as an adjacency list;
rendered as a force-directed SVG graph in the frontend.

### 4. Heritage Chain™ (`packages/domain` — heritage types)
A `heritageChain: HeritageNode[]` array on every traditional evidence record, tracking provenance
from ancient text (Charaka Samhita, Dhanvantari Nighantu) through colonial pharmacopoeia to
modern trial. Shows depth of use without implying equivalence to clinical evidence.

### 5. Interaction Graph™ (`services/api` — interaction-graph)
A DynamoDB table with GSI on `(interventionA, interventionB)` pairs, modelling herb × drug,
herb × herb, and food × drug interactions at CYP450 resolution. Sourced from NAPRALERT,
published case reports, and EU HMPC herbal monographs. Shown inline on every intervention view.

### 6. Evidence Gap Heatmap™ (`services/api` — gap-heatmap)
A daily-computed aggregate classifying the top 500 ICD-11 conditions as Green (Grade A evidence
exists in ≥1 system), Amber (Grade B/C only), or Red (no peer-reviewed evidence in any system).
The red zones are the most important output SALUS produces — a live global research agenda.

### 7. Open Pramana Registry (OPR) (`services/api` — opr-portal)
A verified practitioner submission portal. Observational cases (from Vaidyas, Siddha
practitioners, Naturopaths) enter as Grade C provisional. When n ≥ 30 cases accumulate for the
same intervention + condition, the system generates a pre-filled CTRI trial submission template.
If a trial is subsequently published, the record graduates from Grade C to Grade B or A.
The world's first structured evidence maturation pipeline from living traditional practice to
peer-reviewed clinical science.

---

## Runtime flow

1. User requests frontend via CloudFront.
2. CloudFront serves static assets from S3 (private bucket, OAC).
3. Frontend calls Hono API on Lambda Function URL.
4. API validates evidence payloads through the **Pramana Engine** (Zod schemas).
5. API persists and queries records in DynamoDB (PAY_PER_REQUEST).
6. Nightly Lambda recalculates **Pramana Scores** and **Evidence Gap Heatmap**.
7. **Interaction Graph** and **Convergence Map** are queried via DynamoDB secondary indexes.
8. Cognito manages identity; editorial group controls `draft → published` transitions.

## Evidence-grade enforcement

- **Grade A — Definitive:** Multi-center RCT, systematic review, Cochrane-style meta-analysis
- **Grade B — Emerging:** Cohort / case-control / rigorous open-label trial
- **Grade C — Traditional/Mechanistic:** Pre-clinical, in-vitro/in-vivo, official pharmacopoeia, historic textual consensus

All records include:
- ICD-11 condition mapping with Ayurvedic / Siddha equivalents
- Intervention metadata and medical system classification
- Evidence grade + Pramana Score (computed nightly)
- Study methodology and sample size
- Registry identifier (PMID / DOI / CTRI / NCT / AYUSH / DHARA / ICTRP)
- Source URL (allowlisted peer-reviewed domain only)
- Contraindications and cross-system interaction warnings
- Heritage chain (traditional interventions)
- Last verified date + evidence freshness index

## Modularity design

- **`packages/domain`** — The Pramana Engine. Imported by API and frontend. Single source of truth for all schema validation and grading rules.
- **`services/api`** — Hono on Lambda. Adapter pattern separates DynamoDB from route handlers.
- **`services/ingestion`** — Scheduled Lambdas pulling from PubMed, ClinicalTrials.gov, AYUSH/DHARA, CTRI/WHO ICTRP.
- **`apps/web`** — TanStack Query + TanStack Table + force-directed graph (Convergence Map).
- **`infra`** — AWS SAM template. Zero-API-Gateway, DynamoDB PAY_PER_REQUEST, WAFv2, Budget alarms.
