# AWS Free Tier Deployment Readiness

**Status:** planning guide — do not deploy the current active tree to AWS yet.  
**Audience:** the person preparing the AWS account and the engineer implementing the deployment.  
**Last reviewed:** 2026-10-01.

SALUS is a Vite single-page application with an Express API. The active source tree has Cognito-aware authentication code and a DynamoDB repository abstraction, but it does **not** yet contain AWS infrastructure-as-code (IaC), a Lambda entry point, an AWS SDK DynamoDB executor, or production repository wiring. This document is the source of truth for preparing a safe, small-scale AWS deployment.

> Historical files under `public/reports/` describe a retired monorepo and refer to paths such as `infra/template.yaml`, `apps/web`, and `services/api` that no longer exist. They must not be used as deployment instructions.

## 1. Target architecture

Use one AWS Region for the pilot. Keep the browser and API behind one CloudFront distribution so that the client can continue to call its existing relative `/api/*` URLs.

```text
Browser
  |
  v
CloudFront distribution
  |-- default behavior --> private S3 bucket (Vite `dist/` assets)
  `-- /api/* behavior --> API Gateway HTTP API --> Lambda (Express API)
                                                |-- DynamoDB
                                                |-- Cognito JWT verification
                                                `-- CloudWatch Logs

Cognito User Pool --> Hosted UI / PKCE --> browser
AWS Budgets + CloudWatch alarms --> deployment owner
```

Do not expose an S3 website endpoint, run an EC2 instance, put the Lambda in a VPC, or add NAT Gateway/RDS/ECS for the first deployment. Those choices add cost and operational complexity without serving this application’s current needs.

## 2. AWS services: required, optional, and explicitly out of scope

| Service | Decision | Purpose |
| --- | --- | --- |
| Amazon S3 | Required | Private origin bucket for the compiled `dist/` assets. |
| Amazon CloudFront | Required | HTTPS, CDN, SPA fallback, and same-origin routing of `/api/*` to the API. Use Origin Access Control (OAC) for S3. |
| AWS Lambda | Required | Serverless execution of the Express API. |
| Amazon API Gateway **HTTP API** | Required | Public API front door for the Lambda. Use HTTP API, not REST API, unless a later requirement needs REST-only features. |
| Amazon DynamoDB | Required for production | Conditions, evidence, and immutable audit records. A monitoring table is optional. |
| Amazon Cognito User Pools | Required for editorial writes | Hosted UI, PKCE login, and the `evidence-editors` group. Public reading remains unauthenticated. |
| IAM | Required | Least-privilege deployment role and Lambda execution role. |
| CloudWatch Logs and alarms | Required | Request diagnostics and alerts for Lambda/API/DynamoDB failure and throttling. |
| AWS Budgets | Required | Small spend threshold alerts before launch. |
| ACM | Required only with a custom domain | TLS certificate for CloudFront; it must be requested in `us-east-1`. |
| Route 53 | Optional | Hosted DNS only if the team buys/transfers a domain to it. |
| EventBridge Scheduler | Optional | Future scheduled ingestion, recalculation, or calibration jobs. |
| SES | Optional | Future verified email notifications. It is not needed for the UI’s current local notification settings. |
| AWS WAF | Defer for pilot | Consider before a wider public launch; it is not required to establish the first functional deployment. |
| Secrets Manager | Optional | Prefer Lambda environment configuration for the initial minimal set; use Secrets Manager only when secret rotation/auditing justifies it. |
| Amazon Bedrock | Not required | The current AI provider is Google Gemini. Moving to Bedrock is a separate product decision and code change. |

## 3. What you can prepare now

### AWS account and access

1. Create or select a dedicated AWS account for SALUS; do not use a personal root account for deployment.
2. Enable MFA for the root user, remove root access keys, and create an administrator identity through IAM Identity Center (or an equivalent protected admin role).
3. Select one pilot Region close to the intended users and keep DynamoDB, Lambda, API Gateway, and Cognito there. CloudFront remains global.
4. Install and authenticate the AWS CLI with a named profile. Verify the account and selected Region using `aws sts get-caller-identity`.
5. Decide the initial environment names: `dev` and `prod` at minimum. Prefer separate AWS accounts for them when the project grows; a single account with separate stacks is acceptable for the first low-risk pilot.

### Domain and identity decisions

6. Decide whether launch starts on the CloudFront hostname or a custom domain. A custom domain requires domain ownership and an ACM certificate in `us-east-1`; it is not needed to validate the stack.
7. Choose the exact public web origins for each environment, for example `https://dev.example.org` and `https://app.example.org`. These values are needed in Cognito callback/logout URLs and API CORS configuration.
8. Identify at least one named initial editor and a secure process for assigning the Cognito `evidence-editors` group. Do not make every authenticated user an editor.
9. Decide whether self-service sign-up is allowed. For a clinical-evidence editorial pilot, invite-only accounts are safer.

### Costs and notifications

10. Add an email address that will receive billing and CloudWatch notifications.
11. Create a monthly AWS Budget at a deliberately small amount (for example, $5) with alerts around 50%, 80%, and 100%. Budget monitoring/notifications are free; action-enabled budgets may incur charges after the first two. [AWS Budgets pricing](https://aws.amazon.com/aws-cost-management/aws-budgets/pricing/)
12. Enable AWS Free Tier usage alerts in Billing and Cost Management. Free Tier eligibility and credits depend on account age and plan; never treat the free tier as a hard spending cap.

## 4. Engineering work required before deployment

All items in this section are blocking work. The repository must implement and test them before a production stack is provisioned.

### A. Add production IaC

Create a version-controlled IaC stack (AWS SAM, CDK, or Terraform; SAM is a good fit for this Lambda-first architecture) that creates all required resources below. The deployment must be repeatable from a clean AWS account and must not depend on manually created production resources.

- S3 bucket with all public access blocked, versioning enabled, encryption enabled, and a lifecycle policy for old noncurrent versions.
- CloudFront distribution with OAC, the S3 origin, API Gateway origin, HTTPS redirect, compression, sensible cache policies, SPA 403/404 fallback to `/index.html`, and a separate no-cache `/api/*` behavior.
- HTTP API with Lambda proxy integration and only the methods/routes required by the Express app.
- Lambda execution role, function, log group, retention policy, environment variables, and a conservative memory/timeout/concurrency configuration.
- DynamoDB tables, index, TTL settings, point-in-time recovery decision, and IAM permissions limited to those table ARNs.
- Cognito user pool, app client configured for Authorization Code + PKCE, hosted UI domain, callback/logout URLs, and the `evidence-editors` group.
- Budget and CloudWatch alarms with a notification destination.

### B. Convert the Express server to Lambda

`src/server/index.ts` calls `app.listen`, which cannot be the Lambda runtime entry point. Add a Lambda adapter (for example a maintained Express-to-Lambda adapter), expose a `handler`, and keep local `npm run start` behavior separate.

Build and test the Lambda artifact for Node.js 22.x. Set a modest initial timeout (for example 10 seconds) and memory allocation, then size it from CloudWatch duration metrics after load testing. Do not use provisioned concurrency in the free-tier pilot.

### C. Implement the DynamoDB runtime, not only the abstraction

The code has `DynamoClinicalRepository` and `selectPersistence`, but no `@aws-sdk` dependency, executor implementation, table environment variables, or server wiring. Add all of the following:

- AWS SDK v3 DynamoDB Document Client executor translating `scan`, `query`, `get`, `put`, `update`, and transactional operations in `src/persistence/dynamodb`.
- A repository factory selected by `PERSISTENCE_ADAPTER=dynamodb` during production startup.
- Required configuration for `CONDITIONS_TABLE`, `EVIDENCE_TABLE`, and `AUDIT_TABLE`; `MONITORING_TABLE` remains optional.
- Startup validation that fails before serving traffic if the selected tables or permissions are unavailable.
- A deterministic, idempotent seed/migration process that runs from CI or a tightly scoped admin command — never on every Lambda invocation.

### D. Define the DynamoDB schema and access patterns

Create the following tables for initial production. Keep them separate during the pilot: this makes audit retention and permissions understandable.

| Table | Primary key | Required secondary access |
| --- | --- | --- |
| `salus-<env>-conditions` | `conditionId` (string) | None initially. |
| `salus-<env>-evidence` | `evidenceId` (string) | GSI `byCondition`: `conditionId` (partition key), with a stable sort key such as `lastVerifiedDate` or `evidenceId`. |
| `salus-<env>-audit` | `auditId` (string) | Optional GSI only after a real audit query requirement is established. |
| `salus-<env>-monitoring` | `snapshotId` (string) | Optional; do not create until monitoring snapshots are persisted. |

The current repository scans tables for some list operations. Before meaningful growth, replace broad scans with bounded queries, pagination, and indexes designed from actual UI access patterns. A DynamoDB GSI enables queries on an alternate key; indexes add storage and write consumption. [DynamoDB secondary-index guidance](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html)

For the free-tier pilot, use provisioned capacity only if its fixed free allocation comfortably covers the workload. DynamoDB on-demand is easier to operate but is usage-priced. The ongoing DynamoDB free tier includes 25 RCUs, 25 WCUs, and 25 GB storage under its stated conditions. [DynamoDB pricing](https://aws.amazon.com/dynamodb/pricing/)

### E. Fix and validate Cognito token verification

This is a security blocker. The browser currently exchanges PKCE authorization codes for an **access token**, while `src/server/auth/jwt-verifier.ts` validates an `aud` claim. Cognito access tokens normally identify the app client using `client_id`; Cognito ID tokens use `aud`.

Before launch, choose and document one token contract. Recommended: retain access tokens for the API and update the verifier to require:

- expected issuer;
- `token_use === "access"`;
- expected `client_id` (not only `aud`);
- expiration/not-before values;
- RSA signature using Cognito JWKS;
- `cognito:groups` membership for editorial routes.

Test valid, expired, wrong-pool, wrong-client, wrong-token-use, forged-signature, and editor/non-editor tokens against the deployed API. Set Cognito callback and logout URLs exactly to the CloudFront origins. The current frontend build needs `VITE_COGNITO_DOMAIN`, `VITE_COGNITO_CLIENT_ID`, and optionally `VITE_COGNITO_REDIRECT_URI`/`VITE_COGNITO_SCOPES`.

This change also requires a server configuration change: add `COGNITO_CLIENT_ID` and make it the expected access-token client identifier. Remove or reserve the existing `COGNITO_AUDIENCE` setting for an explicitly chosen ID-token contract; do not silently accept either claim type.

Cognito’s direct/social user-pool free tier is currently 10,000 monthly active users, but federation and machine-to-machine flows have different terms. [Cognito pricing](https://aws.amazon.com/cognito/pricing/)

### F. Configure browser/API routing and CORS

The active frontend uses a fixed relative `/api` base path. Preserve that contract by routing CloudFront `/api/*` to API Gateway; otherwise a static S3 deployment will make API calls fail.

Set these production Lambda values:

```dotenv
NODE_ENV=production
PERSISTENCE_ADAPTER=dynamodb
CONDITIONS_TABLE=salus-prod-conditions
EVIDENCE_TABLE=salus-prod-evidence
AUDIT_TABLE=salus-prod-audit
MONITORING_TABLE=salus-prod-monitoring       # only if provisioned
COGNITO_ISSUER=https://cognito-idp.<region>.amazonaws.com/<user-pool-id>
COGNITO_CLIENT_ID=<Cognito app client ID; add this server setting>
CORS_ALLOWED_ORIGINS=https://app.example.org
STRICT_GOVERNANCE=true
GEMINI_API_KEY=<server-side only, if AI is enabled>
```

Do not put `GEMINI_API_KEY`, AWS credentials, or table names containing sensitive business metadata into any `VITE_*` build variable. Treat Vite variables as public browser content.

### G. Make third-party AI behavior deliberate

The optional clinical AI endpoint calls Google Gemini when `GEMINI_API_KEY` is set. It has external cost, privacy, and medical-governance implications independent of AWS. Before launch, decide whether the pilot:

- disables it (no key; deterministic fallback remains available),
- enables it only in a non-production environment, or
- enables it with a documented data-handling policy, rate limit, budget, and user disclosure.

No patient-identifying information should be sent to it unless the legal/privacy review explicitly permits that flow.

### H. Add safety controls at the edge and API

- Apply API Gateway throttling and Lambda reserved concurrency appropriate to the pilot; choose low values first and adjust only from observed traffic.
- Limit CORS to the approved CloudFront/custom-domain origins; never use `*` for authenticated routes.
- Retain CloudWatch logs for a finite period (for example 14 or 30 days) and avoid logging bearer tokens or sensitive request bodies.
- Set alarms for Lambda errors/throttles/duration, API Gateway 5XX, DynamoDB throttles, and budget thresholds.
- Use CloudFront cache headers: long immutable caching for hashed Vite assets, short/no cache for `index.html`, and no cache for `/api/*`.
- Add WAF only after deciding its rule set and recurring cost; API throttling and a small concurrency cap are the initial protection.

## 5. IAM model

Use distinct identities. Do not use long-lived administrator keys in CI.

| Identity | Permissions |
| --- | --- |
| Human administrator | Assume an admin role through IAM Identity Center, MFA required. |
| CI deployment role | Create/update only the named IaC stack and pass only its approved execution roles. Use GitHub OIDC if deployment comes from GitHub Actions. |
| CloudFormation/SAM execution role | Create and manage only the declared AWS resources. |
| Lambda execution role | Write logs; read/write the three specific DynamoDB tables and `byCondition` index as needed. No wildcard `dynamodb:*`, no S3 write permission unless a feature uses it. |
| CloudFront-to-S3 policy | Read-only access to that one distribution through OAC. |

Keep Gemini credentials outside IAM. If a secret store is adopted, give the Lambda role access to only that one secret.

## 6. Deployment sequence

### Phase 0 — local engineering gate

- [ ] Implement the blocking engineering work in section 4.
- [ ] Add unit tests for the AWS DynamoDB executor and Cognito access-token contract.
- [ ] Run `npm run typecheck`, `npm run test`, and `npm run build` on a clean checkout.
- [ ] Package/build the Lambda artifact and invoke it locally with representative API Gateway HTTP API events.
- [ ] Confirm the production frontend build contains no secret values.

### Phase 1 — provision development

- [ ] Deploy an isolated `dev` stack through IaC.
- [ ] Record stack outputs: CloudFront URL, API hostname, Cognito domain, pool ID, app client ID, table names, and log group names.
- [ ] Build frontend with the `dev` Cognito public variables and deploy `dist/` to the dev S3 bucket.
- [ ] Invalidate only the CloudFront paths necessary for release (normally `/index.html`); use hashed assets for cache-safe releases.
- [ ] Seed known non-sensitive condition/evidence fixtures once.

### Phase 2 — acceptance and security tests

- [ ] Confirm public routes load through CloudFront and deep links return the SPA.
- [ ] Confirm every `/api/*` route reaches API Gateway/Lambda through the same CloudFront hostname.
- [ ] Confirm anonymous users cannot create or publish evidence.
- [ ] Confirm an authenticated non-editor can create a draft only if that is the intended policy, but cannot publish it.
- [ ] Confirm only an `evidence-editors` group member can publish/reject.
- [ ] Confirm API rejected tokens return 401/403, never 500.
- [ ] Confirm DynamoDB records survive a Lambda cold start/redeploy.
- [ ] Confirm logs contain correlation IDs but no bearer tokens, passwords, or secret values.
- [ ] Load-test a bounded pilot profile and inspect p95 latency, throttles, and DynamoDB consumed capacity.

### Phase 3 — production release

- [ ] Complete the clinical, legal, privacy, and content-governance sign-off appropriate to a health-information product.
- [ ] Recreate the stack with `prod` names/configuration; do not promote a dev table by hand.
- [ ] Assign only named production editors.
- [ ] Set production budget/alarms before traffic is opened.
- [ ] Deploy a tagged release, capture stack outputs, and run the same acceptance checklist.
- [ ] Document rollback: restore the previous static asset release, redeploy the prior Lambda artifact, and use an explicit data migration rollback plan rather than deleting production tables.

## 7. Cost guardrails and free-tier assumptions

The deployment should be designed to be low-cost, not assumed to be permanently free. AWS’s newer account/free-plan rules, account age, Region, and activity can all change the outcome. Check the AWS billing console and pricing pages immediately before provisioning.

- Lambda’s published free tier includes 1 million requests and 400,000 GB-seconds monthly. [Lambda pricing](https://aws.amazon.com/lambda/pricing/)
- API Gateway lists 1 million HTTP API calls monthly for eligible new-account free-tier periods. [API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/)
- CloudFront pay-as-you-go free-tier usage is currently stated as 1 TB transfer out and 10 million HTTP/HTTPS requests each month; overages and other features are billable. [CloudFront FAQ](https://aws.amazon.com/cloudfront/faqs/)
- S3, CloudFront invalidations, custom domains, WAF, logs beyond their free allocation, backups, data transfer, and external Gemini use can still create charges.
- Never configure DynamoDB global tables, NAT Gateway, always-on EC2, provisioned concurrency, or broad log retention for this pilot without a separate cost review.

## 8. Operational ownership checklist

Before opening the application to users, name an owner for each responsibility:

| Responsibility | Named owner | Evidence of completion |
| --- | --- | --- |
| AWS billing/budget alerts |  | Budget alert received in test. |
| IaC and release approvals |  | Protected deploy role/repository environment. |
| Cognito user/editor lifecycle |  | Editor assignment procedure and audit trail. |
| Evidence data stewardship |  | Source/review/publication policy. |
| Incident response |  | Contact path and rollback runbook. |
| Privacy/security review |  | Approved data-flow and third-party AI decision. |
| Clinical governance |  | Named accountable reviewer and disclaimer policy. |

## 9. Go / no-go criteria

**No-go** until every item below is true:

- Production uses DynamoDB, not `MemoryClinicalRepository`.
- Lambda deployment and DynamoDB executor are implemented and tested.
- Cognito access-token verification matches the actual browser-issued token contract.
- CloudFront routes both SPA and `/api/*` correctly.
- Tables, indexes, seed process, retention, and least-privilege IAM policies are in IaC.
- Budget, alarms, and log-retention settings are live and verified.
- The deployment has passed authenticated/editor authorization tests in a non-production environment.
- The team has made an explicit decision on Gemini and medical/privacy governance.

When all go/no-go criteria pass, the project is ready for implementation of the AWS stack and a controlled dev deployment.
