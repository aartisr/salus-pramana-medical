# Existing Data Model

## Persisted Server Entities

### MedicalCondition

Primary key: `conditionId` in `CONDITIONS_TABLE`.

Archived fields: `conditionId`, `icd11Code`, `standardName`, optional `ayurvedicEquivalent`, optional `siddhaEquivalent`, optional `pathophysiologySummary`.

The active root extends its in-memory representation with optional `naturopathicContext` and required `category`, `globalPrevalence`, `annualBurdenDALYs`, and `primaryRiskFactors`. These are additive compatibility fields; archived serialized names remain authoritative for existing records.

### TreatmentEvidence

Primary key: `evidenceId` in `DYNAMODB_TABLE`. Secondary index `byCondition` uses `conditionId` as its key. Logical relationship: many evidence records belong to one `MedicalCondition` through `conditionId`.

Archived persisted fields: `evidenceId`, `conditionId`, `medicalSystem`, `interventionName`, `isPharmacological`, `evidenceGrade`, `studyMethodology`, optional `sampleSize`, `registryIdentifier`, `sourceUrl`, `clinicalOutcomeSummary`, optional `publicationStatus`, `contraindications`, `interactionWarnings`, optional `lastVerifiedDate`.

Archived enums: medical system = `Allopathy|Ayurveda|Siddha|Naturopathy`; evidence grade = `A|B|C`; publication status = `draft|published|rejected`.

The active root has additive analytical fields including `activeIngredients`, `designCategory`, precision/effect values, publication year, bias, p-value, interval, biomarker endpoint, therapeutic window, bioavailability, and half-life. It uses `under_review` where archive uses `rejected`; this is a source conflict that target data design must reconcile additively without rewriting existing values.

### AuditRecord

Primary key: `auditId` in `AUDIT_TABLE`. Fields: `auditId`, `action`, `actorEmail`, `targetEvidenceId`, `timestamp`, optional `ipAddress`, optional `ttl`. TTL is creation time plus 90 days. Audit records are append-only effects after condition/evidence mutations; primary mutation and audit write are not transactional together.

### Monitoring Snapshot

`MONITORING_TABLE` receives drift snapshots through a DynamoDB `PutCommand`. The table is optional; output exposes whether the report was persisted. The exact snapshot fields are owned by `drift-monitor.ts` and calibration report output.

## Browser-Persisted Entities

### RecentSearchItem

Fields: `query` and numeric `timestamp`. IndexedDB database `salus_pramana_db`, version `1`, object store `recent_searches`, key path `query`, non-unique `timestamp` index. At most five records are retained, newest first. When IndexedDB is unavailable, localStorage key `salus_recent_searches_fallback` stores the same bounded array.

### EvidenceSubscription

localStorage key `salus_evidence_subscriptions_v1`. Fields: `id`, normalized lowercase `email`, trimmed `queryOrCondition`, optional `conditionId`, `systems[]`, `minEvidenceGrade`, `frequency`, `createdAt`, and `status`. Insert deduplicates case-insensitively by email plus query and prepends a new active record.

### Auth Session

SessionStorage keys: `salus.auth.accessToken`, `salus.auth.accessTokenExpiry`, `salus.auth.pkceVerifier`, `salus.auth.pkceState`, and `salus.auth.pkceReturnTo`. Tokens expire by timestamp and are cleared before use when expired. PKCE transient fields are removed before token exchange result handling.

## In-Memory Repository

The archived API seeds arrays of `MedicalCondition` and `TreatmentEvidence`. When `DYNAMODB_TABLE` is absent, reads/writes use these process-local arrays; conditions upsert by `conditionId`, evidence submission rejects duplicate `evidenceId`, and publication update requires an existing record. This is the observable fallback contract, not a durable store.

## Validation And Referential Rules

- `conditionId` and `evidenceId` are non-empty; evidence submission requires an existing condition.
- Registry IDs must begin with PMID, DOI, CTRI, ICTRP, AYUSH, DHARA, or NCT.
- Source URLs must use HTTPS and an allowlisted evidence domain.
- Contributors can create drafts only; only evidence editors can publish/reject.
- Public reads exclude non-published evidence; `includeDrafts=true` requires editor access.
- `createEvidence` is exactly-once by `evidenceId` through a DynamoDB conditional expression.
- `saveEvidence` retains an existing record when its `lastVerifiedDate` is newer than or equal to the incoming record.
- Ingestion deduplication is a read-before-write operation and is not transactional.

## Key Entities

| Entity | Purpose |
| --- | --- |
| MedicalCondition | Cross-system taxonomy and condition metadata |
| TreatmentEvidence | Source-linked clinical evidence and editorial state |
| AuditRecord | Actor/action trace for protected mutations |
| Monitoring Snapshot | Calibration/drift monitoring persistence |
| RecentSearchItem | Bounded local clinical-search history |
| EvidenceSubscription | Local evidence-notification preferences |
| Auth Session | PKCE and bearer-token browser state |
| ConditionIntelligence | Derived, non-persisted deterministic decision output |

## Transaction Boundaries

- DynamoDB condition/evidence/audit operations are single-item commands; no multi-item transaction exists.
- Evidence create and publish use conditional expressions for identity/existence guarantees.
- IndexedDB recent-search writes and pruning share one read-write transaction.
- localStorage writes are synchronous best-effort operations whose quota/errors are swallowed or logged.
