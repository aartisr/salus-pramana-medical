# Archived reference: AWS CDN deployment (not the Always Free path)

This is a future paid-scale reference for the CloudFront/S3/API Gateway architecture. It is **not** the active SALUS deployment route and must not be used by a reader who requires AWS Always Free services only. The active, feature-preserving path is [AWS_DEPLOYMENT_FREE_TIER.md](AWS_DEPLOYMENT_FREE_TIER.md), which uses a Lambda Function URL, a Lambda asset layer, and DynamoDB.

If this architecture is adopted after a separate cost review, its template is `infra/template-pilot-with-cdn.yaml`—not `infra/template.yaml`.

> “Free Tier ready” means the architecture avoids fixed-cost compute and uses AWS services that have free-tier or low-usage allowances. It does **not** guarantee a $0 bill: eligibility, account age, Region, traffic, storage, logs, CloudFront transfer, third-party AI use, and AWS pricing determine charges. Create a budget alert before provisioning.

## Architecture

```text
Browser → CloudFront
             ├── private S3 bucket: Vite static assets and SPA deep-link fallback
             └── /api/* → API Gateway HTTP API → Lambda → DynamoDB
                                                        ├── conditions
                                                        ├── evidence (byCondition index)
                                                        └── immutable audit records
```

The browser retains its relative `/api/*` contract, so it reaches the API through the same CloudFront hostname. The S3 bucket is private; CloudFront is the only allowed reader.

## What the stack provisions

- Versioned, encrypted, private S3 bucket with a 30-day noncurrent-object lifecycle.
- CloudFront distribution with HTTPS redirect, compressed static assets, SPA fallback, and a non-cached `/api/*` behavior.
- API Gateway HTTP API and a Node.js 22 Lambda Express adapter.
- Three encrypted DynamoDB provisioned-capacity tables. The pilot assigns 20 RCUs and 20 WCUs in total (including the evidence index), below DynamoDB's current 25 RCU/25 WCU ongoing free-tier allowance. Evidence has a `byCondition` index; audit records expire after 90 days through TTL. Point-in-time recovery is deliberately off in this free-tier profile.
- Lambda permissions limited to these three tables, 512 MB memory, 10-second timeout, and reserved concurrency of five.

No AWS credentials are stored in the code. Lambda obtains DynamoDB access from its execution role.

## Prerequisites

1. An AWS account with billing alerts and a small monthly Budget already configured.
2. AWS CLI authenticated to the intended account and Region.
3. AWS SAM CLI installed locally. On macOS, `brew install aws-sam-cli` is one option; follow AWS’s current installation guidance for other platforms.
4. Node.js 22.12 or newer. The package engine range enforces the supported Node 22 line in clean CI/deployment installs.
5. A decision about authentication. The initial template deploys a public-read API and leaves Cognito configuration out until its access-token contract is completed. Do not enable editorial write access in production without completing the Cognito items in `AWS_DEPLOYMENT_READINESS.md`.

## Deploy a development stack

This creates AWS resources and can incur charges. It is intentionally not run automatically.

```bash
export AWS_STACK_NAME=salus-dev
export AWS_REGION=us-east-1
# Required: a confirmation email for the $0.01 actual/forecast cost alert.
export BUDGET_ALERT_EMAIL=owner@example.org
npm run deploy:aws
```

The script performs `sam build`, deploys `infra/template.yaml`, builds the Vite app, uploads immutable assets plus a non-cached `index.html`, invalidates only `/index.html`, and prints the CloudFront URL. `BUDGET_ALERT_EMAIL` is required: the template creates actual and forecast alerts at $0.01 monthly cost. AWS requires confirmation of the email subscription.

For the first deployment, SAM may request confirmation or artifact-bucket settings. The script uses `--resolve-s3` and requires only `CAPABILITY_IAM`.

## Required post-deployment checks

Run these against the CloudFront URL, not only the direct API URL:

```text
/                         → SPA
/clinical-workbench       → SPA deep link
/api/health               → JSON health response
/api/conditions           → JSON array (empty until deliberately seeded)
```

The deployment starts with empty DynamoDB tables by design. Do not seed records on Lambda cold start. A reviewed, idempotent administrative seed/migration command must be used once the content model is approved.

## Environment and secrets

`PERSISTENCE_ADAPTER=dynamodb`, table names, and `STRICT_GOVERNANCE=true` are injected by the SAM template. If Gemini is enabled, add `GEMINI_API_KEY` as a protected Lambda environment value through the deployment configuration; do not put it in `VITE_*`, source control, or a public browser build.

For an additional cross-origin browser client, deploy with `AllowedOrigin` set to that exact origin. The standard same-origin CloudFront site needs no CORS exception.

## Vercel compatibility

Vercel remains supported as a Vite SPA plus `/api/*` function deployment through `vercel.json` and `api/[...path].ts`. In a production Vercel deployment, the same DynamoDB settings and AWS credentials/role access must be supplied; the in-memory repository is intentionally rejected in production. The AWS stack is preferable when the API and data must stay entirely inside AWS.

## Cost guardrails

- Start in one Region and use the CloudFront default hostname; custom domains, WAF, NAT Gateway, RDS, ECS, provisioned concurrency, DynamoDB point-in-time recovery, and global DynamoDB tables are intentionally excluded.
- Keep CloudWatch retention and budget alarms configured through account policy before public traffic.
- Keep Lambda reserved concurrency at five during the pilot; increase only after measured demand.
- Review DynamoDB, CloudFront, API Gateway, Lambda, S3, and external Gemini costs in the Billing console monthly.

See [AWS_DEPLOYMENT_READINESS.md](AWS_DEPLOYMENT_READINESS.md) for the remaining authentication, editorial-governance, and operational go/no-go checklist.
