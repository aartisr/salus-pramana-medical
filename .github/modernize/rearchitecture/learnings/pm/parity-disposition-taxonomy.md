# Parity Disposition Taxonomy

Use stable disposition labels to reconcile authoritative active behavior with archived-only capabilities.

## What Happened

For SALUS Pramana task t3, the root and production behavior were authoritative while the archive
contained additional required capabilities. Requirements were labeled `PRESERVE` for root
behavior, `RESTORE` for archived-only behavior, `RECONCILE` for overlap where root wins, and
`CONSTRAINT` for immutable delivery conditions.

## Takeaway

In brownfield parity inventories, assign one disposition to every requirement and never let an
archived implementation overwrite newer observable behavior. Include roadmap claims only when
supported by implementation/contracts or explicit user scope.

## History

- 2026-09-30 (salus-pramana-medical/t3): initial