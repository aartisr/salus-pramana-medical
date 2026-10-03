# SALUS — Detailed Implementation Plan

> _The evidence behind every path to healing._

**Last updated:** 2026-07-04  
**Cloud target:** AWS Free Tier with hard cost guardrails  
**Blueprint reference:** 100% Evidence-Based Cross-System Medical Platform (System Architecture & Verification Blueprint PDF)

---

## 0. The Vision — Why SALUS Is Different from Everything That Exists

### Competitive Landscape (Top 25 Platforms Researched)

Every major platform in this space has a fundamental blind spot:

| Platform                                   | What It Does Well                       | Critical Gap                                                                |
| ------------------------------------------ | --------------------------------------- | --------------------------------------------------------------------------- |
| **Cochrane Library**                       | Gold-standard systematic reviews        | Western/allopathic only; paywalled; zero traditional medicine integration   |
| **Examine.com**                            | Rigorous supplement evidence database   | US nutrition focus; no Ayurveda, Siddha, or ICD-11 condition mapping        |
| **PubMed / NCBI**                          | Vast raw research archive               | Requires expert interpretation; no evidence grading for traditional systems |
| **UpToDate / DynaMed**                     | Clinical decision support               | $500+/year; allopathic only; no cross-system comparison                     |
| **Natural Medicines Database**             | Herb-drug interaction data              | Fragmented; no structured comparison with allopathy at condition level      |
| **Memorial Sloan Kettering (About Herbs)** | Cancer-focused herb safety              | Too narrow; no grading engine                                               |
| **NCCIH (NIH)**                            | Authoritative integrative medicine info | Informational only; no structured evidence engine or API                    |
| **AYUSH Portal (India)**                   | Official traditional medicine registry  | No standardized comparison with modern medicine; no cross-linking           |
| **WHO ICTRP**                              | Global trial registry                   | Registry only; no evidence synthesis or consumer interface                  |
| **TRIP Database**                          | Evidence search aggregator              | No traditional medicine grading or cross-system synthesis                   |
| **DrugBank**                               | Deep pharmacological compound data      | Pharmaceutical only; no botanical / traditional compound layer              |
| **ClinicalKey (Elsevier)**                 | Clinical reference database             | Paywalled; no traditional medicine dimension                                |
| **Micromedex / LexiComp**                  | Drug interactions and dosing            | Pharmaceutical only; does not model herb-drug interactions at scale         |
| **MedlinePlus**                            | Consumer health information             | Low depth; no evidence grading; no traditional medicine                     |
| **BMJ Best Practice**                      | Clinician decision support              | Allopathic only; paywalled                                                  |
| **OpenMD**                                 | Patient-facing condition lookup         | No evidence grading; no traditional medicine                                |
| **WebMD / Healthline**                     | Consumer health content                 | Commercially driven; no rigorous evidence classification                    |
| **Drugs.com**                              | Drug information                        | Pharmaceutical only                                                         |
| **NAPRALERT**                              | Natural products research database      | Academic, not consumer-accessible; no grading engine                        |
| **TRC Natural Medicines**                  | Herb-drug interaction database          | Subscription-only; no ICD-11 mapping or cross-system comparison             |
| **PubChem**                                | Chemical compound properties            | Raw data; no clinical evidence layer                                        |
| **EMA (European Medicines Agency)**        | Regulatory herb monographs              | Regulatory framing; not consumer-facing                                     |
| **HMPC Herbal Monographs**                 | EU traditional use assessments          | EU-only; no Ayurveda/Siddha/Naturopathy                                     |
| **Charaka / Dhanvantari digital archives** | Primary Ayurvedic text digitisation     | No modern evidence cross-linking                                            |
| **Siddha Research Portal (CCRH)**          | Traditional Siddha research             | Siloed; no connection to modern clinical evidence                           |

### The Universal Blind Spots Across All 25 Platforms

After reviewing every major platform, **not a single one** does all of the following simultaneously:

1. **Cross-system evidence comparison** — Metformin (Grade A) beside Karela/Bitter Melon (Grade B) beside Fenugreek (Grade C) for Type 2 Diabetes, in a standardised, bias-free, single interface.
2. **Living evidence scores that decay** — A 1995 study is not worth the same as a 2024 study. No platform has a time-weighted evidence freshness index.
3. **Herb-drug interaction graph across systems** — CYP450 interactions between Ashwagandha and Warfarin, visible in the same UI as the evidence grade for each compound.
4. **Traditional-to-modern semantic bridge** — Linking Ayurvedic "Ama" (toxin accumulation) to the modern biomarker AGE (Advanced Glycation End-products), with evidence.
5. **Evidence gap heatmap** — A public map showing which conditions have NO Grade A evidence in any medical system — a live research agenda for humanity.
6. **Open Traditional Medicine Registry** — A structured, peer-reviewed pipeline for traditional healers (Vaidyas, Siddha practitioners) to contribute structured observational data that enters a formal evidence maturation pathway.
7. **Free, open, and API-accessible** — All 25 competitors are either paywalled, siloed, or require institutional access.

---

### The Seven Breakthrough Innovations That Make SALUS Nobel-Worthy

#### Innovation 1: The Pramana Score™

_A living, composite, time-decaying evidence strength number._

Every intervention gets a single **Pramana Score (0–100)** computed as:

$$\text{PramanaScore} = \sum_{i=1}^{n} \left( w_{\text{grade}_i} \times w_{\text{recency}_i} \times \log(\text{sampleSize}_i + 1) \right) \times \text{ReplicationBonus}$$

Where:

- $w_{\text{grade}}$: Grade A = 1.0, Grade B = 0.6, Grade C = 0.25
- $w_{\text{recency}}$: Decays by 2% per year from publication date (evidence ages)
- $\text{ReplicationBonus}$: +20% if ≥3 independent labs replicated the result

This makes evidence _alive_ — a drug with 50 studies from the 1980s may score lower than a herb with 8 rigorous 2022 RCTs. **No platform on earth does this today.**

Implementation: computed field stored in DynamoDB, recalculated nightly by a Lambda cron job using `EventBridge Scheduler`.

---

#### Innovation 2: The Convergence Map™

_When ancient traditions and modern science independently arrive at the same answer._

A condition (e.g., Type 2 Diabetes) has a **Convergence Map** — an interactive network graph showing:

- Which interventions from different systems target the **same molecular pathway** (e.g., PPAR-γ agonism, AMPK activation)
- The **convergence score**: higher when more traditions, independently, have evidence pointing at the same mechanism
- Colour-coded by evidence grade per node

Data: interventions annotated with MeSH pharmacological action terms from PubMed + Ayurvedic pharmacology literature from DHARA. When two interventions (one allopathic, one Ayurvedic) share the same MeSH action term (e.g., `Hypoglycemic Agents`), they appear connected on the map.

**Nobel-worthy insight:** When 4,000 years of Ayurvedic practice and a 2019 RCT independently converge on the same mechanistic pathway, that convergence is itself evidence — of a kind no platform currently quantifies.

---

#### Innovation 3: The Heritage Chain™

_Evidence has a lineage. Show it._

Every traditional intervention gets a timeline:

```text
Charaka Samhita (600 BCE) → Dhanvantari Nighantu (9th c.) →
British Indian Pharmacopoeia (1868) → ICMR Trial (1989) →
PubMed RCT (2019, n=320)
```

This is not anecdote — it is provenance. It shows the **depth of use** while keeping modern evidence primary and clearly graded.

Stored as a `heritageChain: HeritageNode[]` array on the `TreatmentEvidence` schema, where each node has `{ era, sourceName, sourceType, registryIdentifier }`.

---

#### Innovation 4: The Interaction Graph™

_The most dangerous gap in integrative medicine — solved._

Currently: a patient takes Warfarin and also drinks Ginkgo Biloba tea. Their anticoagulation risk doubles. No consumer platform shows this clearly at the point of information lookup.

SALUS builds a **cross-system interaction graph** stored in DynamoDB with a GSI on `(interventionA, interventionB)` pairs:

- Herb × Drug interactions (CYP450 data from NAPRALERT + published case reports)
- Herb × Herb interactions
- Food × Drug interactions (e.g., grapefruit + statins)
- Dosha-specific contraindications (e.g., Vata imbalance + certain Vata-aggravating herbs)

When viewing any intervention, SALUS shows: _"3 known interactions with allopathic drugs — view graph."_

---

#### Innovation 5: The Evidence Gap Heatmap™

_A live research agenda for humanity._

A public, interactive heatmap of all ICD-11 conditions (approximately 55,000 codes, filtered to the top 500 by global burden of disease) showing:

- **Green**: ≥1 Grade A intervention exists in ≥2 medical systems
- **Amber**: Only Grade B/C evidence in any system
- **Red**: No peer-reviewed evidence in ANY medical system

The red zones are the most important output SALUS produces — they tell researchers, funding bodies, and traditional healers where humanity's knowledge is genuinely dark. **This has never been published in this form.** Academic journals write about it. SALUS makes it live, visual, and updated daily.

---

#### Innovation 6: The Open Pramana Registry (OPR)

_The first democratic, rigorous pipeline from traditional practice to science._

Traditional healers (Vaidyas, Siddha practitioners, Naturopaths) can submit **structured observational case series** through a verified practitioner portal:

1. Practitioner verified via NMC/AYUSH registration number
2. Cases submitted in a structured form (condition ICD-11, intervention, dosage, outcome measure, follow-up duration)
3. Cases accumulate as **Grade C provisional** — visible on the platform but clearly labelled _"Practitioner-submitted observational data"_
4. When ≥30 cases accumulate for the same intervention + condition, the system flags it for **formal trial design**, with a pre-filled CTRI submission template generated automatically
5. If a trial is then conducted and published, the record graduates from Grade C to Grade B or A

This is the world's first **evidence maturation pipeline from traditional practice to peer review**. It creates a structured feedback loop between living practice and formal science.

---

#### Innovation 7: The Epistemic Bridge™

_Ancient vocabulary, modern science, one coherent picture._

Ayurveda describes disease in terms of Doshas (Vata/Pitta/Kapha) and processes like Ama (undigested toxins). Modern medicine describes AGEs, inflammatory cytokines, insulin resistance. These languages have never been formally cross-mapped in a publicly accessible, evidence-anchored way.

SALUS builds a **semantic bridge layer** that maps:

- Ayurvedic Nidana (causative factors) → modern pathophysiology terms
- Siddha Naadi patterns → closest ICD-11 differential diagnosis cluster
- Naturopathic terrain concepts → immunological and microbiome markers

Each bridge mapping carries its own evidence grade (is the mapping hypothesis-only, or has it been validated in a translational study?).

Stored as a `conceptBridges` table in DynamoDB. Shown in the UI as: _"Ayurvedic concept: Ama ↔ Modern equivalent: Advanced Glycation End-products (AGEs) — Evidence: Grade C (mechanistic hypothesis)"_

---

### Why This Is Nobel-Worthy

> The Nobel Prize in Physiology or Medicine has historically recognised discoveries that _revealed a mechanism hidden in plain sight_ — H. pylori as the cause of ulcers (Marshall & Warren, 1982), cell apoptosis (Brenner, Horvitz, Sulston, 2002), innate immunity toll-like receptors (Beutler, Hoffmann, Steinman, 2011).

SALUS's Nobel-level insight is this: **4,000 years of global traditional medicine, when systematically mapped against modern molecular biology, will reveal statistically improbable convergences — independent discoveries of the same healing mechanisms across civilisations that had no contact.** These convergences are the strongest possible signal for undiscovered therapeutic mechanisms.

No platform has ever been built to systematically find them. SALUS will.

---

## 1. Current Implementation Status Audit

This table maps every blueprint requirement to what currently exists in the repository.

### 1.0 Calculus & Statistical Specification (Mandatory)

SALUS now has a formal mathematical specification that is mandatory for implementation:

- `docs/CALCULUS_MATH_SPEC.md`

This specification defines:

- Exact equations for Pramana score, uncertainty, recency decay, Bayesian confidence gates, ODE interaction dynamics, and trajectory simulation
- Default constants, thresholds, and safety constraints
- Efficacy validation targets (calibration, discrimination, coverage, and decision utility)
- "Honesty-by-construction" citation and source-verification policy

No production deployment is allowed for scoring/recommendation components unless those criteria are implemented and passing.

### 1.1 Section 1 — Hierarchical Evidence Engine

| Requirement                               | Status                                | Location                                                      |
| ----------------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| Evidence grades A / B / C defined         | ✅ Done                               | `packages/domain/src/index.ts` — `evidenceGradeSchema`        |
| Grade description helper                  | ✅ Done                               | `packages/domain/src/index.ts` — `evidenceGradeDescription()` |
| Grade A criteria: RCT / meta-analysis     | ✅ Schema enforced at input           | `treatmentEvidenceSchema.studyMethodology`                    |
| Grade B criteria: cohort / case-control   | ✅ Schema enforced at input           | same                                                          |
| Grade C criteria: pre-clinical / textual  | ✅ Schema enforced at input           | same                                                          |
| Grade badges / color coding in UI         | ❌ Missing                            | —                                                             |
| No Causal Equivalency disclaimer in UI    | ❌ Missing                            | —                                                             |
| Contraindications surfaced in table       | ❌ Missing — stored but not displayed | `evidence-table.tsx`                                          |
| Interaction warnings surfaced in table    | ❌ Missing — stored but not displayed | `evidence-table.tsx`                                          |
| Side-by-side cross-system comparison view | ❌ Missing                            | —                                                             |

### 1.2 Section 2 — Data Harmonization & Schema

| Requirement                                                              | Status                                | Location                            |
| ------------------------------------------------------------------------ | ------------------------------------- | ----------------------------------- |
| `medical_conditions` table with ICD-11 code                              | ✅ Done (in-memory seed)              | `repository.ts`                     |
| Ayurvedic & Siddha equivalents on conditions                             | ✅ Done                               | `medicalConditionSchema`            |
| `treatment_evidence` table with all fields                               | ✅ Done (DynamoDB + in-memory)        | `repository.ts`                     |
| `isPharmacological` flag                                                 | ✅ Done                               | `treatmentEvidenceSchema`           |
| `registryIdentifier` enforces PMID/DOI/CTRI/ICTRP/AYUSH/DHARA/NCT prefix | ✅ Done                               | `registryIdentifierSchema`          |
| `sourceUrl` required and validated as URL                                | ✅ Done                               | `treatmentEvidenceSchema.sourceUrl` |
| Conditions persisted in DynamoDB                                         | ❌ Missing — hardcoded in memory only | `repository.ts`                     |
| Conditions CRUD (POST /conditions)                                       | ❌ Missing                            | `app.ts`                            |
| Seed data: Metformin, Curcumin, Ashwagandha, Sarpagandha                 | ❌ Missing                            | —                                   |
| Multiple conditions beyond Type 2 Diabetes                               | ❌ Missing                            | `repository.ts`                     |

### 1.3 Section 3 — Automated Evidence Ingestion Pipeline

| Requirement                          | Status     | Location |
| ------------------------------------ | ---------- | -------- |
| PubMed / NCBI Entrez API integration | ❌ Missing | —        |
| ClinicalTrials.gov API integration   | ❌ Missing | —        |
| AYUSH Research Portal integration    | ❌ Missing | —        |
| DHARA index integration              | ❌ Missing | —        |
| CTRI integration                     | ❌ Missing | —        |
| WHO ICTRP integration                | ❌ Missing | —        |
| Scheduled Lambda ingestion job       | ❌ Missing | —        |
| Deduplication on registry identifier | ❌ Missing | —        |

### 1.4 Section 4 — Editorial Protocol & Integrity Safeguards

| Requirement                                           | Status                                    | Location                   |
| ----------------------------------------------------- | ----------------------------------------- | -------------------------- |
| Registry identifier mandatory (no anecdotal data)     | ✅ Done                                   | `registryIdentifierSchema` |
| `sourceUrl` mandatory (live verifiable DOI/PMID link) | ✅ Done                                   | schema                     |
| Cognito User Pool defined                             | ✅ Done                                   | `infra/template.yaml`      |
| Auth enforcement on POST /evidence                    | ❌ Missing — Lambda URL is AuthType: NONE | `template.yaml`, `app.ts`  |
| Admin review workflow before publishing               | ❌ Missing                                | —                          |
| WAF rate limiting on CloudFront                       | ❌ Missing                                | `template.yaml`            |
| AWS Budget alarms in SAM template                     | ❌ Missing                                | `template.yaml`            |
| CloudWatch log retention policy                       | ❌ Missing                                | `template.yaml`            |
| DynamoDB TTL / data lifecycle                         | ❌ Missing                                | `template.yaml`            |

### 1.5 Free Tier & Cost Guardrails

| Requirement                          | Status     | Location                              |
| ------------------------------------ | ---------- | ------------------------------------- |
| DynamoDB PAY_PER_REQUEST             | ✅ Done    | `template.yaml`                       |
| CloudFront PriceClass_100            | ✅ Done    | `template.yaml`                       |
| Lambda Function URL (no API Gateway) | ✅ Done    | `template.yaml`                       |
| No SMS MFA (Cognito)                 | ✅ Done    | `template.yaml` MfaConfiguration: OFF |
| S3 private with OAC                  | ✅ Done    | `template.yaml`                       |
| Budget alarms ($1 / $5) as code      | ❌ Missing | —                                     |
| CloudWatch log retention (3–7 days)  | ❌ Missing | —                                     |

### 1.6 Developer Quality Gates

| Requirement                    | Status                               | Location                            |
| ------------------------------ | ------------------------------------ | ----------------------------------- |
| Domain schema unit tests       | ✅ Done                              | `packages/domain/src/index.test.ts` |
| API health test                | ✅ Done                              | `services/api/src/app.test.ts`      |
| Web smoke test                 | ⚠️ Placeholder only (`expect(true)`) | `apps/web/src/smoke.test.ts`        |
| CI/CD pipeline                 | ❌ Missing                           | —                                   |
| End-to-end / integration tests | ❌ Missing                           | —                                   |

---

## 2. Phased Implementation Roadmap

### Active Execution Sprint (2026-07-04)

**Objective:** Close remaining Phase 0 hardening gaps and move Phase 2 from resilient scaffolding to production-grade ingestion connectors.

#### Completed in this sprint window

- [x] ClinicalTrials connector upgraded to API-backed ID discovery with fallback behavior
- [x] AYUSH connector upgraded to configurable source fetch + parser extraction + fallback behavior
- [x] CTRI connector upgraded to configurable source fetch + parser extraction + fallback behavior
- [x] Source parser helper test coverage added
- [x] Authenticated editorial smoke coverage added for publish path (token required, editor-group required, editor success)
- [x] Deployment-time seed runbook and rollback procedure documented
- [x] CI deploy-dev workflow stage added (secret-gated)
- [x] Full repository validation passed (`lint`, `test`, `build`)

#### Next implementation batch (execute now)

- [x] Add shared ingestion HTTP client with timeout, retry/backoff, and deterministic error classification
- [x] Add connector-level rate limiting controls and environment-based request caps
- [x] Normalize connector output fields into a single ingestion DTO before persistence
- [x] Add source-specific freshness metadata (`lastVerifiedDate`, source timestamp) for update-vs-insert decisions
- [x] Implement deployment-time seeding flow to guarantee planned exemplar parity in non-local environments
- [x] Add authenticated editorial smoke coverage for publish path (editor group + token claims)

#### Acceptance gate to mark this sprint complete

1. `npm run lint` passes across all workspaces.
2. `npm run test` passes, including ingestion connector and parser suites.
3. `npm run build` passes and web production bundle builds successfully.
4. Ingestion dry-runs produce deterministic fallback behavior when upstream sources are unavailable.
5. `docs/PHASE_COMPLETION_MATRIX.md` is updated to reflect exact completed/remaining deltas.

#### Resume checkpoint

- Start from final seed exemplar parity verification against planned records across environments.
- Then validate Cognito editor group wiring in deployed dev infrastructure end-to-end.
- Next, continue with production-grade ingestion connector contracts.

### Phase 0 — Foundation Hardening (Pre-requisite, 1–2 days)

**Goal:** Make the existing skeleton production-worthy before adding features.

#### 0-A: AWS Cost Guardrails as Code

Add to `infra/template.yaml`:

- `AWS::Budgets::Budget` — alert at $1 and $5 thresholds (email notification)
- `AWS::Logs::LogGroup` with `RetentionInDays: 7` for Lambda function logs
- Lambda `ReservedConcurrencyExecutions: 5` to cap runaway invocations

#### 0-B: Auth Enforcement on Mutation Endpoints

- Switch Lambda Function URL `AuthType` to `AWS_IAM` for write paths **or** implement Cognito JWT verification middleware in Hono for `POST /evidence` and future `POST /conditions`
- Pattern: Hono middleware extracts `Authorization: Bearer <CognitoJWT>` and verifies signature with Cognito JWKS endpoint
- GET endpoints remain unauthenticated (public read)
- Frontend: add Cognito Hosted UI login flow with PKCE before showing the "Add Evidence" page

#### 0-C: Conditions DynamoDB Migration

- Add a second DynamoDB table `ConditionsTable` (PAY_PER_REQUEST) to `template.yaml`
- Add `POST /conditions` route in `app.ts` (admin-only, requires auth)
- Migrate `listConditions()` in `repository.ts` to read from DynamoDB with in-memory fallback
- Add `saveCondition()` to `repository.ts`

#### 0-D: Seed Data with Real Examples

Implement a Lambda custom resource (or a one-time seeder script) that populates the following real evidence records matching the PDF examples:

| Condition          | System    | Intervention                       | Grade | Registry          |
| ------------------ | --------- | ---------------------------------- | ----- | ----------------- |
| Type 2 Diabetes    | Allopathy | Metformin                          | A     | PMID-9742977      |
| Hypertension       | Allopathy | DASH Diet                          | A     | PMID-7564658      |
| Hypertension       | Allopathy | Potassium supplementation          | A     | PMID-11136953     |
| Joint Inflammation | Ayurveda  | Curcumin (standardized extract)    | B     | PMID-17569207     |
| Stress / Cortisol  | Ayurveda  | Ashwagandha                        | B     | PMID-23439798     |
| Hypertension       | Ayurveda  | Sarpagandha (Rauwolfia serpentina) | B     | AYUSH-PH-2019-031 |

#### 0-E: WAF Basic Rate Limiting

- Add `AWS::WAFv2::WebACL` (FREE tier: use `AWS Managed Rules – Common Rule Set` + rate-based rule at 100 req/5 min per IP)
- Associate with CloudFront distribution
- **Cost note:** WAF Classic costs ~$5/month; WAFv2 with 1 web ACL + 1 rule costs ~$1/month. Keep rule count minimal.

---

### Phase 1 — UI Evidence Integrity Layer (3–5 days)

**Goal:** Enforce the PDF's "No Causal Equivalency" and "Mandatory Risk Metrics" in the interface.

#### 1-A: Evidence Grade Badges

File: `apps/web/src/components/evidence-table.tsx`

- Add a `GradeBadge` component: Grade A = green (`#22c55e`), Grade B = amber (`#f59e0b`), Grade C = slate (`#94a3b8`)
- Include a tooltip/title showing the full grade description (from `evidenceGradeDescription()`)
- Replace plain grade text in table with the badge

#### 1-B: No Causal Equivalency Banner

- Add a persistent non-dismissible banner on the Dashboard page:
  > "Evidence grades are not interchangeable. Grade A (Allopathic RCT) and Grade B (emerging clinical) treatments for the same condition cannot be assumed equivalent. Always consult a qualified clinician."
- Render differently-graded interventions in the same table with visual separation (background row color by grade)

#### 1-C: Contraindications & Interaction Warnings Panel

- Add expandable row detail in `EvidenceTable`: click a row to expand and show `contraindications[]` and `interactionWarnings[]` arrays
- Use a color-coded callout: contraindications in red (`#ef4444`), interaction warnings in orange

#### 1-D: Cross-System Comparison View

- New route `/compare/:conditionId`
- Fetch all evidence for a condition, group by `medicalSystem`
- Render side-by-side columns: Allopathy | Ayurveda | Siddha | Naturopathy
- Each column sorted by grade (A first)
- Each card shows: intervention name, grade badge, methodology, registry ID link
- Add "Compare" button on the Dashboard `EvidenceTable` per condition

#### 1-E: Condition Selector Dropdown

- Fix current dashboard: loads only first condition
- Replace with a `<select>` populated from `GET /conditions`
- Show condition ICD-11 code + standard name + Ayurvedic/Siddha equivalents in dropdown

#### 1-F: Search & Filter

- Add client-side filter controls above `EvidenceTable`:
  - Filter by Evidence Grade (A / B / C — multi-select checkboxes)
  - Filter by Medical System (multi-select)
  - Filter by `isPharmacological` (toggle: Pharmacological / Lifestyle/Diet / All)
- Implemented as TanStack Table column filters (no extra network calls)

---

### Phase 2 — Automated Evidence Ingestion Pipeline (5–7 days)

**Goal:** Implement the Section 3 API integration matrix from the blueprint.

All ingestion lambdas run on AWS Lambda (free tier: 1M invocations/month). Use EventBridge Scheduler (cron) to trigger them weekly. **Cost: $0 on free tier for this invocation volume.**

#### 2-A: PubMed / NCBI Entrez Utilities Integration

New file: `services/ingestion/src/pubmed-ingestor.ts`

```text
Endpoint: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi
          https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi
Auth:     Free (include email parameter to avoid rate limits; NCBI API key optional, free to obtain)
Rate:     3 req/sec (unauthenticated), 10 req/sec (with API key)
```

Workflow:

1. Query PubMed for each tracked condition using MeSH terms (e.g., `"Type 2 Diabetes"[MeSH] AND ("randomized controlled trial"[pt] OR "systematic review"[pt])`)
2. Fetch abstracts via `efetch` in XML mode
3. Auto-assign Grade A if `publication_type` contains `Randomized Controlled Trial` or `Meta-Analysis`; Grade B for cohort/case-control; Grade C for review/lab
4. Extract PMID as `registryIdentifier`, DOI as `sourceUrl`
5. Write to DynamoDB via `saveEvidence()` — skip if `registryIdentifier` already exists (deduplication)
6. Wrap in a Lambda function triggered by EventBridge Scheduler (weekly cron: `cron(0 2 ? * SUN *)`)

#### 2-B: ClinicalTrials.gov API Integration

New file: `services/ingestion/src/clinicaltrials-ingestor.ts`

```text
Endpoint: https://clinicaltrials.gov/api/v2/studies
Auth:     Free, no key required
Rate:     10 req/sec
```

Workflow:

1. Query by condition term + intervention terms for tracked conditions
2. Map `primaryCompletionDate` + `studyType: INTERVENTIONAL` + `allocation: RANDOMIZED` → Grade A candidate
3. Map `studyType: OBSERVATIONAL` → Grade B candidate
4. Extract NCT number as `registryIdentifier` (prefix: `NCT-`)
5. Deduplication on `registryIdentifier` before insert

#### 2-C: AYUSH / DHARA Integration

New file: `services/ingestion/src/ayush-ingestor.ts`

```text
Endpoint: https://dhara.ayurveda.co.in/api (or screen-scraped HTML if no formal API)
Note:     DHARA does not publish a formal JSON API; use their search page and parse HTML,
          or use the downloadable XML dataset from the Ministry of AYUSH portal.
Source:   https://ayush.gov.in (official AYUSH data)
```

Workflow:

1. Parse DHARA XML dataset (bulk download, updated quarterly)
2. Map DHARA entries to `medicalSystem: "Ayurveda"` or `"Siddha"`
3. Auto-assign Grade B if human trial data present; Grade C for textual / pharmacopoeia citations
4. Set `registryIdentifier` prefix to `DHARA-` or `AYUSH-`
5. Lambda triggered on S3 upload of the quarterly DHARA XML file (S3 event trigger)

#### 2-D: CTRI / WHO ICTRP Integration

New file: `services/ingestion/src/ctri-ingestor.ts`

```text
CTRI:    https://ctri.nic.in (Clinical Trials Registry – India)
ICTRP:   https://trialsearch.who.int/ (WHO ICTRP search portal; integrate via official search/export pathways)
```

Workflow:

1. Query ICTRP portal records for Indian trials in Ayurveda/Siddha/Naturopathy using official export/search-compatible ingestion
2. Map completed trials → Grade B; ongoing trials → flag as `lastVerifiedDate: today, grade: B (preliminary)`
3. `registryIdentifier` prefix: `CTRI-` or `ICTRP-`

#### 2-E: Ingestion Lambda SAM Resources

Add to `infra/template.yaml`:

```yaml
PubMedIngestorFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: ../services/ingestion/dist
    Handler: pubmed-ingestor.handler
    MemorySize: 256
    Timeout: 300
    ReservedConcurrentExecutions: 1 # Cost guardrail: never parallel
    Policies:
      - DynamoDBCrudPolicy: { TableName: !Ref EvidenceTable }
    Events:
      WeeklySchedule:
        Type: ScheduleV2
        Properties:
          ScheduleExpression: "cron(0 2 ? * SUN *)"
          RetryPolicy: { MaximumRetryAttempts: 2 }
```

Replicate for `ClinicalTrialsIngestorFunction`, `AyushIngestorFunction`, `CtriIngestorFunction`.

#### 2-F: Deduplication Strategy

- Before every `PutCommand`, run a `GetCommand` on `evidenceId` (derived as `PMID-<id>`, `NCT-<id>`, etc.)
- If item exists, compare `lastVerifiedDate`; update only if source has a newer date
- This prevents duplicate entries and keeps costs low (minimal DynamoDB WCUs)

---

### Phase 3 — Editorial Workflow & Integrity Enforcement (3–4 days)

**Goal:** Full editorial protocol from Section 4 of the blueprint.

#### 3-A: Draft / Published State Machine

Add `publicationStatus` field to `treatmentEvidenceSchema`:

```typescript
publicationStatus: z.enum(["draft", "published", "rejected"]).default("draft");
```

- All ingested records default to `draft`
- Only `published` records are returned by `GET /evidence` public endpoint
- New admin endpoint `PATCH /evidence/:id/publish` — requires Cognito JWT with group `evidence-editors`

#### 3-B: Cognito Editor Group & Role

- Add `AWS::Cognito::UserPoolGroup` named `evidence-editors` to `template.yaml`
- Hono middleware for `PATCH /evidence/:id/publish`: verify JWT claim `cognito:groups` contains `evidence-editors`
- Unauthorized attempts return `403 Forbidden`

#### 3-C: Anecdotal Data Block — Schema-Level

Already partially enforced by `registryIdentifierSchema`. Strengthen:

- Add `z.refine()` that checks `sourceUrl` domain is in an allowlist:
- `pubmed.ncbi.nlm.nih.gov, doi.org, clinicaltrials.gov, ctri.nic.in, trialsearch.who.int, ayush.gov.in, cochranelibrary.com, bmj.com, thelancet.com, nejm.org, jamanetwork.com, nature.com, sciencedirect.com`
- Reject `sourceUrl` pointing to news sites, blogs, YouTube, Wikipedia, Reddit, testimonial sites
- Implement in `packages/domain/src/index.ts` so it is enforced in both API and frontend

#### 3-D: No Causal Equivalency — API-Level Enforcement

- Add response transform in `GET /evidence`: when returning multi-system results for the same condition, inject an `_metadata.causalEquivalencyDisclaimer: true` flag in the response envelope
- Frontend consumes this flag to show the mandatory disclaimer banner

#### 3-E: Audit Log

- Log every `POST /evidence` (create) and `PATCH /evidence/.../publish` action to a separate DynamoDB table `AuditTable`:
  - `auditId`, `action`, `actorEmail`, `targetEvidenceId`, `timestamp`, `ipAddress`
- 90-day TTL on audit records (DynamoDB TTL attribute) to manage storage costs

---

### Phase 4 — Quality, Testing & CI/CD (2–3 days)

**Goal:** Establish meaningful test coverage and automated deployment pipeline.

#### 4-A: Domain Schema Tests (Expand)

File: `packages/domain/src/index.test.ts`
Add tests for:

- Rejects `registryIdentifier` without valid prefix
- Rejects `sourceUrl` pointing to disallowed domain (Phase 3-C)
- Rejects `evidenceGrade` outside A/B/C
- Rejects empty `clinicalOutcomeSummary`
- Validates `contraindications` array items min length

#### 4-B: API Route Tests (Expand)

File: `services/api/src/app.test.ts`
Add tests for:

- `GET /conditions` returns valid array
- `POST /evidence` with valid payload returns 201
- `POST /evidence` with missing `registryIdentifier` returns 400
- `POST /evidence` with disallowed `sourceUrl` domain returns 400
- `GET /evidence?conditionId=...` filters correctly

#### 4-C: Web Smoke Tests (Replace Placeholder)

File: `apps/web/src/smoke.test.ts`
Replace the `expect(true)` placeholder with:

- Test that `api.ts` `listConditions()` handles `fetch` mock returning 200 with a valid array
- Test that `api.ts` `createEvidence()` handles `fetch` mock returning 400 with error message
- Test `evidenceGradeDescription()` output for all three grades

#### 4-D: CI/CD Pipeline

New file: `.github/workflows/ci.yml`

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm" }
      - run: npm ci
      - run: npm run build
      - run: npm test
  deploy-dev:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: npm ci && npm run build
      - run: sam build -t infra/template.yaml
      - run: sam deploy --no-confirm-changeset --no-fail-on-empty-changeset
      - run: aws s3 sync apps/web/dist s3://${{ secrets.FRONTEND_BUCKET }} --delete
```

---

### Phase 5 — Advanced Features & Scale Hardening (Ongoing)

#### 5-A: Pagination

- Add cursor-based pagination to `GET /evidence` using DynamoDB `LastEvaluatedKey`
- Add `?limit=20&cursor=<base64>` query params to API
- TanStack Query infinite scroll in `EvidenceTable`

#### 5-B: Export Functionality

- `GET /evidence/export?conditionId=...&format=csv` — Lambda streams CSV response
- CSV columns: all `TreatmentEvidence` fields + condition name
- Free tier Lambda: this is well within 1M/month invocation limit

#### 5-C: Full-Text Search

- Use DynamoDB `FilterExpression` on `interventionName` and `clinicalOutcomeSummary` for basic substring search (free tier viable for < 100k records)
- For scale: evaluate CloudSearch (not free tier) or OpenSearch Serverless — defer until > 10k records

#### 5-D: Multi-Condition Seed Expansion

Add these conditions to the seeder (Phase 0-D):

- Hypertension (ICD-11: BA00)
- Joint Inflammation / Rheumatoid Arthritis (ICD-11: FA20)
- Anxiety / Stress Disorder (ICD-11: MB23)
- Hyperlipidemia (ICD-11: 5C80)

---

### Phase 6 — Calculus Intelligence Layer (4–6 weeks)

**Goal:** Convert SALUS from static evidence registry into a mathematically-grounded decision engine.

#### 6-A: Pramana Score Engine (Continuous-Time)

- Implement score computation exactly per `docs/CALCULUS_MATH_SPEC.md`:
  - study-level contribution terms
  - recency decay $e^{-\lambda t}$
  - precision weighting
  - robust 0–100 normalization
- Add nightly recomputation Lambda job with deterministic versioning (`modelVersion`, `dataSnapshotId`)

#### 6-B: Bayesian Confidence Gate

- Implement posterior confidence gate:
  - `RECOMMEND`
  - `CONDITIONAL`
  - `INSUFFICIENT_EVIDENCE`
- Expose posterior confidence and threshold used in API responses

#### 6-C: ODE Interaction Timeline

- Implement two-intervention interaction dynamics layer for herb×drug safety timelines
- Show in UI:
  - peak-risk window
  - time-to-peak
  - severity class
  - evidence confidence for interaction edge

#### 6-D: Trajectory Simulator

- Implement state-space progression model with uncertainty bands
- Deliver counterfactual simulation outputs for:
  1. allopathy-only
  2. integrative care
  3. lifestyle-first

#### 6-E: Dose-Response Optimizer

- Implement constrained utility optimization with hard safety constraints
- Ensure outputs never exceed known toxicology/regulatory boundaries

---

### Phase 7 — Efficacy, Calibration & Governance Gates (2–3 weeks, then ongoing)

**Goal:** Prove model efficacy and enforce honesty-by-construction in production.

#### 7-A: Offline Efficacy Validation

- Run and store condition-level validation reports:
  - discrimination (AUROC/C-index)
  - calibration slope/intercept
  - interval coverage
  - decision-curve net benefit

#### 7-B: Production Go/No-Go Gate

- Promote only if minimum criteria pass for 2 consecutive windows:
  - AUROC >= 0.72 (task-adjusted equivalent allowed)
  - calibration slope in [0.9, 1.1]
  - empirical 95% coverage >= 92%
  - zero critical safety-rule violations

#### 7-C: Drift Monitoring

- Add monthly drift and recalibration checks:
  - score distribution drift (PSI/KL divergence)
  - confidence-gate pass-rate change alerts
  - recalibration job when thresholds breached

#### 7-D: Citation Integrity Enforcement

- Every scored recommendation must include:
  - citation identifiers
  - direct source URL
  - last verification date
  - model version and snapshot id
- If any field is missing, block recommendation output.

---

## 3. AWS Free Tier Mapping

This section maps every AWS service used to its free tier limit and the hard guardrail preventing overspend.

| Service                   | Free Tier Limit                                                                        | Usage Pattern                                        | Cost Guardrail                                                 |
| ------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| **Lambda**                | 1M invocations/month, 400,000 GB-s compute                                             | API: ~1,000–10,000 req/day; Ingestion: ~4 runs/month | `ReservedConcurrentExecutions: 5` on API; `1` on ingestion     |
| **DynamoDB**              | 25 GB storage, 25 WCU, 25 RCU (provisioned) OR PAY_PER_REQUEST first 25M requests free | ~100–10,000 reads/day                                | PAY_PER_REQUEST; no large scans without pagination             |
| **S3**                    | 5 GB storage, 20,000 GET, 2,000 PUT/month                                              | Static site: ~100 MB; negligible PUT from deploys    | Block public access; no S3 Transfer Acceleration               |
| **CloudFront**            | 1 TB data transfer out, 10M requests/month (12-month free tier)                        | Small traffic site                                   | PriceClass_100 (US/Europe/Israel POPs only)                    |
| **Cognito**               | 50,000 MAU free                                                                        | Expected < 100 admin users                           | MFA: OFF; no SMS; no advanced security features                |
| **EventBridge Scheduler** | 14M invocations/month free                                                             | 4 ingestion lambdas × weekly = ~16/month             | Minimal                                                        |
| **CloudWatch Logs**       | 5 GB ingestion/month, 5 GB storage/month free                                          | Low-traffic API logs                                 | Retention: 7 days                                              |
| **WAFv2**                 | NOT free tier — ~$1/month per Web ACL + $0.60/M requests                               | CloudFront protection                                | 1 Web ACL + 1 rate rule only; Budget alarm at $1               |
| **AWS Budgets**           | 2 free budgets                                                                         | $1 alert + $5 alert                                  | Hard email notification; no auto-shutdown needed at this scale |

**Estimated monthly cost at zero real-world traffic:** $0–$1.50 (WAFv2 is the only consistent cost)  
**Estimated monthly cost at 10,000 page views/day:** $1.50–$4.00 (CloudFront egress is the main variable)

---

## 4. Zero-Cost Guardrails Checklist (Code Changes Required)

The following must be added to `infra/template.yaml` as part of Phase 0:

```yaml
# 1. Budget Alarm at $1
EvidenceBudget1:
  Type: AWS::Budgets::Budget
  Properties:
    Budget:
      BudgetLimit: { Amount: 1, Unit: USD }
      TimeUnit: MONTHLY
      BudgetType: COST
    NotificationsWithSubscribers:
      - Notification:
          NotificationType: ACTUAL
          ComparisonOperator: GREATER_THAN
          Threshold: 80
        Subscribers:
          - SubscriptionType: EMAIL
            Address: !Ref AlertEmail # SAM parameter

# 2. Lambda log retention
EvidenceApiLogs:
  Type: AWS::Logs::LogGroup
  Properties:
    LogGroupName: !Sub /aws/lambda/${EvidenceApiFunction}
    RetentionInDays: 7

# 3. Reserved concurrency cap
EvidenceApiFunction:
  # ... existing config ...
  ReservedConcurrentExecutions: 5

# 4. S3 lifecycle rule (delete incomplete multipart uploads)
FrontendBucket:
  # ... existing config ...
  LifecycleConfiguration:
    Rules:
      - Id: AbortIncompleteMultipartUpload
        Status: Enabled
        AbortIncompleteMultipartUpload: { DaysAfterInitiation: 1 }
```

---

## 5. Implementation Priority Matrix

| Phase                                      | Priority    | Effort    | Impact                                     | Blocks          |
| ------------------------------------------ | ----------- | --------- | ------------------------------------------ | --------------- |
| **0-A** Cost guardrails in SAM template    | 🔴 Critical | 0.5 day   | Prevents surprise bills                    | Nothing         |
| **0-B** Auth on POST /evidence             | 🔴 Critical | 1 day     | Security — public write endpoint           | Phase 3         |
| **0-C** Conditions in DynamoDB             | 🔴 Critical | 0.5 day   | Data integrity                             | Seed data       |
| **0-D** Seed data                          | 🟠 High     | 0.5 day   | Demo-ready                                 | Phase 1 UI      |
| **0-E** WAF rate limiting                  | 🟠 High     | 0.5 day   | Abuse prevention                           | —               |
| **1-A** Grade badges                       | 🟠 High     | 0.5 day   | Blueprint compliance (visual integrity)    | —               |
| **1-B** No Causal Equivalency banner       | 🟠 High     | 0.5 day   | Blueprint compliance                       | —               |
| **1-C** Contraindications display          | 🟠 High     | 0.5 day   | Blueprint compliance                       | —               |
| **1-D** Cross-system comparison view       | 🟡 Medium   | 1.5 days  | Core UX feature                            | 1-A, 1-E        |
| **1-E** Condition selector                 | 🟡 Medium   | 0.5 day   | UX baseline                                | 0-C             |
| **1-F** Search & filter                    | 🟡 Medium   | 1 day     | UX baseline                                | —               |
| **2-A** PubMed ingestion                   | 🟡 Medium   | 2 days    | Automation                                 | —               |
| **2-B** ClinicalTrials.gov ingestion       | 🟡 Medium   | 1 day     | Automation                                 | 2-A pattern     |
| **2-C** AYUSH / DHARA ingestion            | 🟡 Medium   | 2 days    | Traditional medicine data                  | —               |
| **2-D** CTRI / WHO ICTRP ingestion         | 🟡 Medium   | 1 day     | Hybrid study data                          | —               |
| **3-A/B** Editorial draft/publish workflow | 🟡 Medium   | 1.5 days  | Data integrity                             | 0-B             |
| **3-C** Source URL domain allowlist        | 🟠 High     | 0.5 day   | Anecdotal data block                       | —               |
| **4-A/B/C** Expanded tests                 | 🟠 High     | 1 day     | Quality gates                              | —               |
| **4-D** CI/CD pipeline                     | 🟡 Medium   | 0.5 day   | Deployment automation                      | 4-A/B/C         |
| **5-A** Pagination                         | 🟢 Low      | 1 day     | Scale                                      | 2-x data volume |
| **5-B** CSV Export                         | 🟢 Low      | 0.5 day   | UX enhancement                             | —               |
| **5-C** Full-text search                   | 🟢 Low      | 1 day     | UX enhancement                             | 5-A             |
| **6-A** Pramana score engine               | 🔴 Critical | 1.5 weeks | Core differentiation + trustworthy ranking | 2-A/2-B/2-C/2-D |
| **6-B** Bayesian confidence gates          | 🔴 Critical | 1 week    | Honest recommendation boundaries           | 6-A             |
| **6-C** ODE interaction timeline           | 🟠 High     | 1 week    | Safety value add                           | 6-A             |
| **6-D** Trajectory simulator               | 🟡 Medium   | 1 week    | Patient/clinician personalization          | 6-A             |
| **6-E** Dose-response optimizer            | 🟡 Medium   | 1 week    | Actionable intervention tuning             | 6-A             |
| **7-A/B** Efficacy validation + go/no-go   | 🔴 Critical | 1 week    | Scientific credibility                     | 6-A/6-B/6-C/6-D |
| **7-C** Drift monitoring                   | 🟠 High     | 0.5 week  | Ongoing reliability                        | 7-A/B           |
| **7-D** Citation integrity enforcement     | 🔴 Critical | 0.5 week  | 100% evidence traceability                 | 3-C, 6-A        |

---

## 6. File Change Map

The following new or modified files are required across all phases:

### New files

```text
services/ingestion/
  src/
    pubmed-ingestor.ts          # Phase 2-A
    clinicaltrials-ingestor.ts  # Phase 2-B
    ayush-ingestor.ts           # Phase 2-C
    ctri-ingestor.ts            # Phase 2-D
    shared/dedup.ts             # Phase 2-F
  package.json
  tsconfig.json

.github/workflows/ci.yml        # Phase 4-D

services/scoring/
  src/
    pramana-score.ts            # Phase 6-A
    confidence-gate.ts          # Phase 6-B
    interaction-ode.ts          # Phase 6-C
    trajectory-simulator.ts     # Phase 6-D
    dose-optimizer.ts           # Phase 6-E
    calibration-report.ts       # Phase 7-A
  package.json
  tsconfig.json

docs/
  CALCULUS_MATH_SPEC.md         # Phase 1.0 spec (already created)
  CALCULUS_MATH_SPEC.pdf        # Generated artifact
```

### Modified files

```text
infra/template.yaml
  + Budget alarms (0-A)
  + Log group with retention (0-A)
  + ReservedConcurrentExecutions on API function (0-A)
  + ConditionsTable DynamoDB resource (0-C)
  + WAFv2 WebACL + CloudFront association (0-E)
  + Ingestion Lambda functions + EventBridge schedules (2-E)
  + Cognito editor group (3-B)
  + AuditTable DynamoDB resource (3-E)
  + Scoring/validation schedule triggers (6-A, 7-A, 7-C)

packages/domain/src/index.ts
  + publicationStatus field (3-A)
  + sourceUrl domain allowlist refine (3-C)
  + Expanded unit tests (4-A)

services/api/src/app.ts
  + POST /conditions route (0-C)
  + PATCH /evidence/:id/publish route (3-A)
  + Cognito JWT middleware (0-B, 3-B)
  + Causal equivalency metadata in GET /evidence response (3-D)
  + score/trajectory/interaction endpoints (6-A, 6-C, 6-D)

services/api/src/repository.ts
  + saveCondition() (0-C)
  + listConditions() → DynamoDB (0-C)
  + publicationStatus filter on listEvidenceByCondition() (3-A)
  + Audit log writes (3-E)
  + Seeder function (0-D)
  + score model version and snapshot persistence (6-A, 7-D)

apps/web/src/
  main.tsx
    + Cognito login flow / PKCE (0-B)
    + Condition selector (1-E)
  components/evidence-table.tsx
    + GradeBadge component (1-A)
    + Expandable row for contraindications/interactions (1-C)
    + Search/filter controls (1-F)
  components/new-evidence-form.tsx
    + (no changes needed in Phase 0–1)
  components/comparison-view.tsx   [NEW] (1-D)
  components/grade-badge.tsx       [NEW] (1-A)
  lib/api.ts
    + listConditions pagination (5-A)
    + publishEvidence() (3-A)
  smoke.test.ts → replace placeholder (4-C)

package.json
  + docs:pdf, docs:pdf:academic, docs:pdf:executive scripts

docs/IMPLEMENTATION_PLAN.md
  + Phase 6/7 rollout, efficacy criteria, and source governance gates
```

---

## 7. Running Locally (Current State)

```bash
# Install all workspace dependencies
npm install

# Start API (port 8787) and web (port 5173) in parallel
npm run dev

# Run all tests
npm test

# Build everything
npm run build

# Rebuild both math-spec PDFs (academic + executive)
npm run docs:pdf
```

**Local dev uses in-memory DynamoDB fallback** — no AWS credentials needed for local development.  
Set `VITE_API_BASE_URL=http://localhost:8787` in `apps/web/.env` (or leave default).

---

## 8. Deploy to AWS (Current State)

```bash
# Prerequisites: AWS CLI + SAM CLI + Node 20+
npm install && npm run build
sam build -t infra/template.yaml
sam deploy --guided   # First deploy: choose stack name, region (us-east-1 recommended), confirm changes

# After deploy, upload frontend
aws s3 sync apps/web/dist s3://<BucketName from SAM output> --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id <DistributionId> --paths "/*"
```

Set `VITE_API_BASE_URL` to the `FunctionUrl` output from SAM before building the web app.

---

## 9. Open Risks & Decisions Needed

| Risk                                                                         | Decision Required                                                                                                           |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| DHARA does not have a formal public JSON API                                 | Choose: (a) parse HTML with cheerio, (b) use their downloadable XML dataset, (c) manual data entry for traditional evidence |
| WHO ICTRP does not provide a simple stable public REST contract in this plan | Use official ICTRP portal/search-export compatible ingestion and keep parser contract tests under CI                        |
| WAFv2 costs ~$1/month — technically not free tier                            | Accept $1/month cost as acceptable guardrail overhead, OR skip WAF and rely on Lambda concurrency cap alone                 |
| Cognito JWT verification in Lambda adds latency (~50ms cold start overhead)  | Accept as necessary security cost; Lambda SnapStart not available for Node.js in all regions                                |
| Source URL domain allowlist may block legitimate new journals                | Maintain allowlist as environment variable / SSM Parameter so it can be updated without code deploy                         |
| PubMed API requires an email parameter and optionally an API key             | Obtain free NCBI API key and store in SSM Parameter Store (free tier: no cost)                                              |
| Score model drift / miscalibration over time                                 | Enforce monthly recalibration checks and block recommendation mode when calibration gates fail                              |

---

## 10. Source & Methods References (Normative)

The following sources are normative references for implementation and validation:

1. Oxford CEBM Levels of Evidence:

<https://www.cebm.ox.ac.uk/resources/levels-of-evidence/ocebm-levels-of-evidence>

1. Cochrane Handbook v6.5, Chapter 10 (meta-analysis, heterogeneity, Bayesian methods):

<https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-10>

1. NCBI Entrez E-utilities (official):

<https://www.ncbi.nlm.nih.gov/books/NBK25501/>

1. ClinicalTrials.gov Data API (official):

<https://clinicaltrials.gov/data-api/about-api>

1. WHO ICTRP Search Portal (official):

<https://trialsearch.who.int/>

Mathematical and operational details are fully specified in:

- `docs/CALCULUS_MATH_SPEC.md`

---

_This plan is scoped entirely to AWS Free Tier services. The only expected monthly cost is WAFv2 (~$1/month). All other services operate within free tier limits at the expected traffic volume._
