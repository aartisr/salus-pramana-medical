## [T015,T028-T030,T046-T050] Express contracts and JWT/JWKS auth
- The active package has no `jose` or Supertest dependency, so RS256 verification uses Node crypto plus a cached remote JWKS and tests use native HTTP.
- Concrete domain and persistence exports landed during implementation; server defaults now adapt those modules while preserving injected test ports.
- Mutation ports pass audit data into atomic repository methods instead of performing separate write and audit calls.
- A concurrent scaffold write temporarily duplicated `create-app.ts`; the active implementation remained type-safe and the obsolete copy is inert.
- Learnings consumed: [(none)]