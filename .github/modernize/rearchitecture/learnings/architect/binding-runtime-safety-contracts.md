# Binding Runtime Safety Contracts

SALUS target design uses explicit trust, governance, middleware, persistence, and idempotency boundaries rather than runtime inference or silent fallback.

## What Happened

In SALUS Pramana task t2.1, five blocking runtime findings required concrete architecture decisions. Browser PKCE remains separate from server JWT authorization; deterministic governance owns the final clinical decision; Express middleware has a fixed order and stable error envelope; persistence adapter selection is explicit at startup; and ingestion uses conditional create keyed by `evidenceId`.

## Takeaway

- Verify issuer, audience, JWKS signature, token validity, and exact editor group on every protected request; client session state never grants authority.
- Downgrade unsafe recommendations and return a frozen `INSUFFICIENT_EVIDENCE` result on condition-intelligence computation failures.
- Assemble correlation, logging, CORS, security headers, body limit, parsing/auth, routes, not-found, and terminal errors in that order.
- Require an explicit persistence adapter; production cannot use memory and DynamoDB failures cannot fail over to memory.
- Treat ingestion conflicts as skipped only for conditional-create conflicts; surface every other adapter error.

## History

- 2026-09-30 (salus-pramana-medical/t2.1): initial
- 2026-09-30 (salus-pramana-medical/t2): verified that binding ADRs must be propagated into the primary per-unit/global contracts, not left only in a narrative resolution artifact
