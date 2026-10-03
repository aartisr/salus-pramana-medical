# Existing Technology Stack

## Active Root

| Area | Existing version/configuration |
| --- | --- |
| Runtime typing | `@types/node ^22.14.0`; no `engines.node` declaration |
| Language | TypeScript `^7.0.2`, ES2022 target, bundler resolution, no emit |
| UI | React/React DOM `^19.0.1` |
| Client build | Vite `^8.3.0`, React plugin `^6.1.1` |
| Styling | Tailwind CSS and Vite plugin `^4.3.3`, Autoprefixer `^10.4.21`, bespoke `src/index.css` |
| Routing | TanStack React Router `^1.170.39`, `lazyRouteComponent` |
| Server state | TanStack React Query `^5.103.2` |
| HTTP | Express `^4.21.2`, dotenv `^17.2.3` |
| AI SDK | Google GenAI `^2.4.0` |
| Visualization | D3 `^7.9.0`, topojson-client `^3.1.0`, world-atlas `^2.0.2` |
| Math/motion/UI | KaTeX `^0.18.9`, Motion `^12.23.24`, Lucide `^0.546.0`, canvas-confetti `^1.9.4` |
| Tests | Vitest `^5.0.1`; active include limited to `src/**/*.test.ts(x)` |
| Runtime TS | tsx `^4.21.0`; esbuild `^0.28.1` |

## Archived Workspace

| Package | Existing dependencies |
| --- | --- |
| Web `0.1.0` | React/DOM `^18.3.1`; Vite `^5.4.8`; TypeScript `^5.6.3`; Vitest `^2.1.2`; TanStack Query `^5.59.0`; Router `^1.68.0`; Table `^8.20.5` |
| API `0.1.0` | Hono `^4.6.4`; Hono Node server `^1.13.7`; AWS DynamoDB clients `^3.654.0`; jose `^5.9.6`; Zod `^3.23.8`; TypeScript `^5.6.3`; Vitest `^2.1.2` |
| Ingestion `0.1.0` | AWS DynamoDB clients `^3.654.0`; shared domain `0.1.0`; TypeScript `^5.6.3`; Vitest `^2.1.2` |
| Domain `0.1.0` | Zod `^3.23.8`; TypeScript `^5.6.3`; Vitest `^2.1.2` |
| Workspace runner | npm workspaces; npm-run-all `^4.1.5` |

## Existing Framework Wiring

- Active Express mounts `express.json()`, then Vite middleware in non-production or static `dist` in production.
- Archived Hono mounts CORS, security headers, 1 MB request-size guard, correlation IDs, structured request logs, and global JSON 500 handling before route registration.
- Archived auth uses Cognito-compatible remote JWKS verification through `jose`, issuer/audience checks, `email`, and `cognito:groups`.
- Archived persistence uses AWS SDK v3 document commands with an in-process memory fallback selected by absent table configuration.
- Both clients use TanStack route trees and React Query; archived pages use explicit React lazy/Suspense wrappers.

## Existing Runtime Constraints And Gaps

- The active manifest does not declare a Node engine, so Node 22 command resolution is not enforced by package metadata.
- Active tests discover only files under `src`; `server.ts` has no active contract test in the root configuration.
- The active TypeScript project excludes the archive, so archived packages are validated only by their own workspace scripts.
- Archived web/runtime versions differ from active root versions and archived server routing is Hono rather than Express.
- Archived auth, AWS SDK, Zod domain schemas, TanStack Table, and ingestion dependencies are absent from the active root manifest.
- The active server has no CORS/security/correlation/body-limit middleware equivalent to the archived API.
