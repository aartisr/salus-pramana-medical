# DynamoDB storage and retrieval design

## Objective

SALUS uses three purpose-specific DynamoDB tables rather than a premature single-table design. This preserves simple clinical-data boundaries, makes audit expiry independent of evidence retention, and keeps the ongoing Always Free baseline at **20 RCUs and 20 WCUs**.

| Table | Primary retrieval | Storage decision |
| --- | --- | --- |
| Conditions | `GetItem(conditionId)` | One canonical record per condition; no duplicated aliases or evidence metadata. |
| Evidence | `GetItem(evidenceId)` and `Query(conditionId)` | Canonical evidence record plus one condition retrieval index. |
| Audit | Append by `auditId` | Immutable, short-lived event records with a 90-day TTL. |

## Evidence index

The evidence table primary key is `evidenceId`, making direct evidence lookups a single-key read. Its only GSI, `byCondition`, uses:

```text
partition key: conditionId
sort key:      conditionEvidenceKey = <lastVerifiedDate>#<evidenceId>
```

`conditionEvidenceKey` is generated inside the DynamoDB adapter on every evidence write. The index is queried in descending order, so a condition’s most recently verified evidence arrives in the natural UI order without a table scan or a second index. The index does not add capacity beyond the existing 5 RCU / 5 WCU allocation.

The index projects the complete evidence item. This is intentional for the current SALUS evidence and intelligence views: one indexed read returns the provenance, safety warnings, and appraisal fields required to make a decision. A keys-only index would save storage but immediately require extra base-table reads for every result, increasing latency and consuming the small read-capacity budget. Revisit that trade-off only after measured record size and traffic justify it.

## Route-level retrieval rules

- Condition intelligence, interaction, and gate calculations query only that condition’s evidence through `byCondition`.
- Evidence intelligence first reads the requested `evidenceId`, then queries only its condition cohort.
- Trajectory and dose calculations read only the requested `evidenceId`; they no longer scan the full evidence table.
- The catalog list remains a scan while SALUS has its small reviewed fixture set. It is not the eventual all-ICD catalog search implementation.

## Catalog expansion rule

DynamoDB is not a full-text search engine. Before importing an ICD-11-scale catalog, build the roadmap’s versioned, sharded catalog/prefix-search representation and cursor API. Do **not** add speculative GSIs for arbitrary name, synonym, code, category, or medical-system search: each would duplicate data and use capacity that the Always Free design deliberately reserves.

At that stage, use measured query logs to choose one of these explicit designs:

1. A compact, generated prefix-index artifact shipped in the Lambda layer for read-only catalog discovery; or
2. A separately budgeted managed search service after a deliberate move beyond the Always Free constraint.

The source and clinical model roadmap remains in [CONDITION_CATALOG_AND_EVIDENCE_ROADMAP.md](CONDITION_CATALOG_AND_EVIDENCE_ROADMAP.md).

## Migration rule

The `byCondition` sort key is part of the index schema. DynamoDB cannot change an existing index key schema in place. The current AWS stack has not been deployed, so the template is the authoritative initial schema. If a stack exists later, create a replacement index/table, backfill through a reviewed migration, verify read parity, then retire the old resource—never mutate clinical data in place without that review.
