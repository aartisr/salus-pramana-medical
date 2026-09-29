# SALUS AWS Free Tier Deployment Guide (Step by Step)

## Purpose

This guide provides a complete, practical process to deploy SALUS on AWS with
strict free-tier discipline and cost guardrails.

Audience:

- Engineers deploying SALUS for development or demo use.
- Teams that need predictable low-cost operation.

Scope:

- Backend and infrastructure deployment using AWS SAM.
- Frontend deployment to S3 + CloudFront.
- Cognito setup verification.
- Seed data verification.
- Cost safety controls.
- Rollback and cleanup.

---

## 1. Architecture You Will Deploy

SALUS deploys to:

- AWS Lambda functions (API, seed, monitoring, ingestion connectors)
- DynamoDB tables (evidence, conditions, audit, monitoring)
- Cognito User Pool and App Client
- S3 bucket for static web assets
- CloudFront distribution in front of S3
- WAF Web ACL attached to CloudFront
- AWS Budgets notifications
- CloudWatch log group retention controls

Expected operating profile for free-tier-minded usage:

- Low request volume
- Small dataset
- Short logs retention
- Limited ingestion frequency
- Controlled concurrency

---

## 2. Free Tier Cost Strategy Before You Start

You should decide your monthly hard cap first.

Recommended cap strategy:

1. Soft alert at 1 USD.
2. Hard alert at 5 USD.
3. Daily quick cost check during first week after deployment.

Main free-tier and low-cost principles used in this repo:

- DynamoDB PAY_PER_REQUEST
- CloudFront PriceClass_100
- Lambda reserved concurrency limits
- Log retention set low
- WAF baseline managed rules + simple rate limit
- Cognito SMS MFA disabled

Important note:

- CloudFront, WAF, and Budgets can still generate small charges depending on
  traffic and account state.
- Free tier eligibility depends on account age and service terms.

---

## 3. Prerequisites

Install on your machine:

1. Node.js (current LTS or newer supported by project toolchain)
2. npm
3. AWS CLI v2
4. AWS SAM CLI

Validate installations:

```bash
node -v
npm -v
aws --version
sam --version
```

Configure AWS credentials:

```bash
aws configure
```

Provide:

- AWS Access Key ID
- AWS Secret Access Key
- Default region (example: us-east-1)
- Default output format (json)

Verify identity:

```bash
aws sts get-caller-identity
```

If this command fails, stop and fix credentials before continuing.

---

## 4. Repository Preparation

From repository root:

```bash
npm install
npm run lint
npm run test
npm run build
```

Why this matters:

- Prevents deploying broken artifacts.
- Ensures dist outputs exist for functions and frontend.

If build fails:

- Resolve errors locally first.
- Re-run until all 3 pass.

---

## 5. Review and Set Deployment Parameters

Template path:

- infra/template.yaml

Key parameters currently exposed:

- Stage (default: dev)
- AlertEmail (default placeholder in template)

Decide:

1. Stage name (dev recommended).
2. Alert email for budget notifications.

---

## 6. Build SAM Artifacts

```bash
sam build -t infra/template.yaml
```

What this does:

- Packages Lambda artifacts for deployment.
- Validates that SAM can process the template for deploy phase.

Expected outcome:

- .aws-sam directory created.
- Build completes without errors.

---

## 7. First-Time Guided Deploy

Use guided deploy the first time:

```bash
sam deploy --guided
```

When prompted, use values like:

1. Stack Name: salus-dev
2. AWS Region: your selected region
3. Parameter Stage: dev
4. Parameter AlertEmail: your email
5. Confirm changes before deploy: Yes
6. Allow SAM CLI IAM role creation: Yes
7. Disable rollback: No
8. Save arguments to samconfig.toml: Yes

After this, subsequent deploys can usually run:

```bash
sam deploy
```

---

## 8. Capture Deployment Outputs

After successful deploy, collect stack outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name salus-dev \
  --query "Stacks[0].Outputs" \
  --output table
```

Important outputs you will need:

- FunctionUrl
- BucketName
- CloudFrontDomain
- UserPoolId
- UserPoolClientId
- UserPoolDomain

Store these in your team deployment notes.

---

## 9. Deploy Frontend Static Assets

Build frontend if needed:

```bash
npm run build -w apps/web
```

Sync to S3 bucket from stack output:

```bash
aws s3 sync apps/web/dist s3://<BucketName> --delete
```

Create CloudFront invalidation:

```bash
aws cloudfront create-invalidation \
  --distribution-id <DistributionId> \
  --paths "/*"
```

How to get DistributionId quickly:

- Query CloudFront list by domain or stack resources.
- Or use CloudFormation resources listing for the stack.

---

## 10. Configure Frontend Runtime API Endpoint

For local web testing against deployed backend, set:

File:

- apps/web/.env

Value:

```bash
VITE_API_BASE_URL=<FunctionUrl_without_trailing_slash>
```

Then run local frontend:

```bash
npm run dev -w apps/web
```

---

## 11. Seed Data and Post-Deploy Validation

This stack includes deployment-time seed execution via custom resource.

Validate seed completion in CloudFormation events:

```bash
aws cloudformation describe-stack-events \
  --stack-name salus-dev \
  --max-items 50
```

Look for successful status on seed custom resource.

API smoke checks:

```bash
curl -s <FunctionUrl>/health
curl -s <FunctionUrl>/conditions
curl -s "<FunctionUrl>/evidence?conditionId=cond-type2-diabetes"
```

Expected:

- health returns ok payload
- conditions list is non-empty
- evidence endpoint returns seeded records

---

## 12. Cognito and Editorial Auth Verification

### 12.1 Verify user pool exists

```bash
aws cognito-idp describe-user-pool --user-pool-id <UserPoolId>
```

### 12.2 Verify app client exists

```bash
aws cognito-idp describe-user-pool-client \
  --user-pool-id <UserPoolId> \
  --client-id <UserPoolClientId>
```

### 12.3 Verify editor-role claims path

Use project verifier script with token:

```bash
export SALUS_API_BASE_URL=<FunctionUrl>
export SALUS_ACCESS_TOKEN=<CognitoAccessToken>
npm run verify:editor-role
```

Expected for editor users:

- groups includes evidence-editors
- isEditor true

---

## 13. Cost Guardrail Verification Checklist

Run this checklist right after deploy:

1. Budgets exist and notification email is correct.
2. Lambda reserved concurrency is set for key functions.
3. DynamoDB billing mode is PAY_PER_REQUEST.
4. CloudFront uses PriceClass_100.
5. CloudWatch retention is short (7 days per template).
6. No high-frequency schedules beyond intended ingestion cadence.

Optional quick checks:

```bash
aws budgets describe-budget --account-id <AccountId> --budget-name evidence-budget-1usd-dev
aws budgets describe-budget --account-id <AccountId> --budget-name evidence-budget-5usd-dev
```

---

## 14. Safe Update Process (Every Change)

For each release:

1. Pull latest code.
2. Run local gates:

```bash
npm run lint && npm run test && npm run build
```

1. Build SAM:

```bash
sam build -t infra/template.yaml
```

1. Deploy:

```bash
sam deploy
```

1. Re-sync frontend:

```bash
aws s3 sync apps/web/dist s3://<BucketName> --delete
aws cloudfront create-invalidation --distribution-id <DistributionId> --paths "/*"
```

1. Run health and evidence endpoint checks.

---

## 15. Rollback Procedure

If deployment fails:

1. Check CloudFormation events for failing resource.
2. Fix code or template issue.
3. Re-run build and deploy.

If deployment succeeds but behavior regresses:

1. Re-deploy previous known-good commit.
2. Re-sync previous frontend artifacts.
3. Invalidate CloudFront again.

Seed behavior note:

- Seed custom resource is designed to be non-destructive.
- Delete path does not purge data.

---

## 16. Troubleshooting Guide

### SAM deploy fails

- Cause: missing IAM permissions.
- Fix: ensure deploy identity can create/update Lambda, IAM roles, DynamoDB,
  Cognito, CloudFront, WAF, Budgets.

### Frontend loads but API calls fail

- Cause: incorrect VITE_API_BASE_URL or CORS assumptions.
- Fix: verify FunctionUrl and browser network errors.

### CloudFront serves stale frontend

- Cause: cache not invalidated.
- Fix: run invalidation and wait for completion.

### Budget alerts not received

- Cause: wrong email or unconfirmed subscription.
- Fix: verify AlertEmail value and budget notification subscribers.

### Auth checks fail

- Cause: token audience/issuer mismatch.
- Fix: verify Cognito outputs and token claims against API expectations.

---

## 17. Free-Tier Operations Playbook (First 30 Days)

Daily for first week:

1. Check stack health and logs for errors.
2. Confirm no unexpected traffic spikes.
3. Check billing dashboard.

Weekly:

1. Confirm budgets still configured.
2. Review DynamoDB consumed capacity trends.
3. Review Lambda invocation/error metrics.
4. Validate ingestion schedules are behaving as expected.

Monthly:

1. Review total cost and top spenders.
2. Tighten limits if spend exceeds expectation.
3. Remove unused resources.

---

## 18. Cleanup and Full Teardown (Stop All Cost)

To stop charges completely:

1. Empty frontend S3 bucket:

```bash
aws s3 rm s3://<BucketName> --recursive
```

1. Delete stack:

```bash
sam delete --stack-name salus-dev
```

1. Confirm deletion in CloudFormation console.
2. Confirm no orphan resources remain (CloudFront, WAF, log groups, buckets).

If stack deletion fails on non-empty bucket, empty bucket and retry.

---

## 19. Minimal Command Sequence (Quick Reference)

```bash
npm install
npm run lint && npm run test && npm run build
sam build -t infra/template.yaml
sam deploy --guided
aws cloudformation describe-stacks --stack-name salus-dev --query "Stacks[0].Outputs" --output table
aws s3 sync apps/web/dist s3://<BucketName> --delete
aws cloudfront create-invalidation --distribution-id <DistributionId> --paths "/*"
curl -s <FunctionUrl>/health
curl -s <FunctionUrl>/conditions
```

---

## 20. Recommended Next Improvement

To make deployment even safer and more repeatable, add:

1. A single deploy script that resolves bucket and distribution automatically
   from stack outputs.
2. A post-deploy smoke script that fails fast on missing seed data.
3. A CI deploy job for dev guarded by environment approvals.
