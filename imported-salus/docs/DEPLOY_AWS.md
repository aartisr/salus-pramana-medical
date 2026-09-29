# AWS deployment (low-cost baseline)

For a full step-by-step free-tier runbook, use
[docs/AWS_FREE_TIER_DEPLOYMENT_GUIDE.md](docs/AWS_FREE_TIER_DEPLOYMENT_GUIDE.md).

## Prerequisites

- AWS CLI configured
- SAM CLI installed
- Node 20+

## Build and deploy

1. Build code:
   - `npm install`
   - `npm run build`
2. Deploy infrastructure:
   - `sam build -t infra/template.yaml`
   - `sam deploy --guided`
3. Upload frontend:
   - `aws s3 sync apps/web/dist s3://<BucketName> --delete`
4. Invalidate CloudFront:
   - `aws cloudfront create-invalidation --distribution-id <DistributionId> --paths "/*"`

## Required env updates for frontend

Set these in `apps/web/.env` (or deployment pipeline env injection):

- `VITE_API_BASE_URL=<FunctionUrl without trailing slash>`

## Zero-budget guardrails

- Set AWS Budget alerts at $1 and $5.
- Keep Cognito SMS MFA disabled to avoid SMS costs.
- Keep CloudWatch log retention low (3-7 days).
- Keep CloudFront `PriceClass_100`.
- Use DynamoDB on-demand (PAY_PER_REQUEST).

## Deployment-time seed runbook

The stack now includes a CloudFormation custom resource that invokes the seed
handler at deploy time:

- Function handler: `services/api/src/seed.ts`
- SAM resources: `SeedDataFunction` and `SeedDataCustomResource` in
  `infra/template.yaml`

Behavior:

1. On `Create` and `Update`, the custom resource calls `ensureSeedData()`.
2. Seeding is idempotent: existing `conditionId` and `evidenceId` records are
   not duplicated.
3. On `Delete`, the custom resource returns success with no destructive action.

Operational checks after deploy:

1. Confirm custom resource success in CloudFormation Events
   (`SeedDataCustomResource` should complete `CREATE_COMPLETE` or
   `UPDATE_COMPLETE`).
2. Verify API data:
   - `GET /conditions` returns baseline seeded conditions.
   - `GET /evidence?conditionId=cond-type2-diabetes` returns seeded evidence
     rows.
3. If needed, inspect CloudWatch logs for `SeedDataFunction` to confirm seeded
   counts.

## Rollback behavior

The seeding flow is intentionally non-destructive and safe during rollback:

1. If seed custom resource fails on deploy, CloudFormation rolls back the stack
   update automatically.
2. Existing seeded records remain unchanged because delete does not purge data.
3. To recover from a failed seeding update:
   - Fix the failing code/path in `services/api/src/seed.ts` or
     `services/api/src/repository.ts`.
   - Rebuild and redeploy (`npm run build`, then `sam build`, `sam deploy`).
4. For emergency bypass, remove or disable `SeedDataCustomResource` in
   `infra/template.yaml`, deploy, then reintroduce once corrected.

## Live editor-group verification (deployed environment)

Use this to validate that a signed-in user has the Cognito `evidence-editors`
group claim in a deployed environment.

1. Set environment variables:
   - `SALUS_API_BASE_URL=<deployed API base URL>`
   - `SALUS_ACCESS_TOKEN=<Cognito access token for target user>`
2. Run verifier:
   - `npm run verify:editor-role`
3. Expected output includes:
   - `actorEmail`
   - `isEditor=true` for editor users
   - `groups` containing `evidence-editors`

Optional:

- Set `SALUS_EXPECT_EDITOR=false` when validating non-editor users; this keeps
  command success while still printing claims.
