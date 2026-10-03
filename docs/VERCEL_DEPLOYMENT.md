# Vercel deployment

SALUS Pramana deploys to Vercel as a Vite single-page application with a Node.js Vercel Function for `/api/*` requests.

## Build configuration

The committed `vercel.json` uses `npm run build`, publishes `dist`, sends non-API routes to `index.html` for TanStack Router deep links, and leaves `/api/*` available to the Vercel Function in `api/[...path].ts`.

## Required Vercel environment variables

Configure these in **Project Settings → Environment Variables** for Preview and Production before relying on the API:

| Variable | Required | Purpose |
| --- | --- | --- |
| `PERSISTENCE_ADAPTER` | Yes | Set to `dynamodb` for production. The server refuses the in-memory adapter in production. |
| `CORS_ALLOWED_ORIGINS` | Recommended | Comma-separated public origins; include the production site URL and any preview origin that accesses the API cross-origin. |
| `COGNITO_ISSUER` | For editor authentication | Cognito issuer URL. |
| `COGNITO_AUDIENCE` | For editor authentication | Cognito application client ID/audience. |
| `VITE_COGNITO_DOMAIN` | For browser sign-in | Cognito hosted-domain URL; build-time public value. |
| `VITE_COGNITO_CLIENT_ID` | For browser sign-in | Cognito application client ID; build-time public value. |
| `VITE_COGNITO_REDIRECT_URI` | Optional | Defaults to `<deployment-origin>/auth/callback`. |
| `VITE_COGNITO_SCOPES` | Optional | Defaults to `openid email profile`. |
| `GEMINI_API_KEY` | Optional | Enables Gemini-backed clinical synthesis. Without it, SALUS uses its deterministic fallback. |

Do not prefix secret server values with `VITE_`; Vite exposes those variables to the browser bundle.

## Verification

After deployment, verify these URLs:

- `/` and an application deep link such as `/clinical-workbench` return the SPA.
- `/api/health` returns a JSON health response.
- `/api/conditions` returns JSON, not the SPA HTML document.
