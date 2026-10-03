# DBA Session Log

## [t5] Designed additive DynamoDB compatibility and rollback

- Existing keys/indexes already support parity; schema evolution can remain entirely additive.
- Legacy absent `publicationStatus` is public but must remain absent on storage reads; readers accept all four known statuses.
- Source ingestion uses race-prone get-before-put; target must use a single conditional create.
- Source repository can silently return memory/success when persistent table configuration is incomplete; target adapter selection must fail startup instead.
- Monitoring persistence is optional; evidence, conditions, and audit are required for persistent API mutation parity.
- Normal rollback is application-only and retains target-created additive records; PITR is incident recovery, not routine rollback.
- Learnings consumed: [(none)]

## [t5] Revalidated non-destructive compatibility design after architecture remediation

- Active root remains authoritative for synthesis and browser-local persistence; archived DynamoDB contracts are additive capabilities, not permission to replace root behavior.
- Archived implicit fallback, unpaginated reads, read-before-write ingestion, and non-transactional mutation/audit sequencing are implementation defects superseded by binding ADRs.
- The refreshed artifact passed 15 required-marker checks with no placeholder residue across 380 lines.
- Learnings consumed: [dba/additive-dynamodb-adapter-compatibility]
