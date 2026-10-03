# Additive DynamoDB Adapter Compatibility

Preserve existing tables by combining tolerant non-normalizing reads with operation-scoped conditional writes behind one explicit repository adapter.

## What Happened

In salus-pramana-medical task t5, existing DynamoDB keys and indexes already supported parity.
The incompatibilities were optional/root-only fields, an absent legacy publication status, a new
`under_review` value, implicit memory fallback, and race-prone ingestion deduplication. Monitoring
persistence was also optional, unlike the required evidence, conditions, and audit stores.
The active root remained authoritative for synthesis and browser-local persistence, while the
archive supplied only the missing server data contracts and parity fixtures.

## Takeaway

Do not backfill or replace schemaless items merely to normalize them. Preserve unknown attributes,
interpret legacy absence only in the read policy, validate writes per API surface, and update only
operation-owned attributes. Select memory or DynamoDB once at startup; never fail over between them.
Use conditional create/update operations, and keep normal rollback code-only with target-created
records retained.

## History

- 2026-09-30 (salus-pramana-medical/t5): initial
- 2026-09-30 (salus-pramana-medical/t5 re-dispatch): clarified active-root versus archive data authority
