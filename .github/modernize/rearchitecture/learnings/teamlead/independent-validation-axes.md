# Independent Validation Axes

Browser and infrastructure fidelity are separate capabilities, and iteration fallbacks do not
automatically satisfy final parity gates.

## What Happened

SALUS Pramana t6 found Node.js 22 available but Docker unavailable. Browser E2E remains required
because it depends on Node and Playwright, while persistence fidelity independently requires a
disposable DynamoDB-compatible environment. Memory-only tests can unblock implementation but cannot
prove DynamoDB parity.

## Takeaway

Define one binary gate per capability. Record exact blocker evidence and coverage loss for any
fallback, and keep the final gate failed until its required tier or an explicitly accepted
equivalent executes. Never use failure on one axis to waive another independent axis.

## History

- 2026-09-30 (salus-pramana-medical/t6): initial
