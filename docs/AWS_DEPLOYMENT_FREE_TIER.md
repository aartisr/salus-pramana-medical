# AWS Always Free deployment

## Design boundary

This is SALUS's strict AWS Always Free deployment path. Its runtime uses only:

- **AWS Lambda** for the complete React SPA and Express API, exposed through one Lambda Function URL;
- **Amazon DynamoDB** for conditions, evidence, and audit records; and
- **AWS IAM**, solely for the Lambda execution role and its least-privilege DynamoDB access.

The default template deliberately does **not** create S3, CloudFront, API Gateway, CloudWatch Logs, Route 53, WAF, RDS, EC2, VPC/NAT, EventBridge, Secrets Manager, paid DynamoDB backups, or a billing resource. These services either have non-perpetual free offers, have a usage-based charge path, or are not necessary for the current SALUS product. The explicit Lambda role has no CloudWatch Logs permissions, so Lambda cannot create a default log group.

The Vite `dist/` build is packaged into a Lambda layer. The Lambda Function URL serves the same SPA routes, deep links, assets, and `/api/*` API routes. No SALUS feature is removed; the trade-off is that static assets are served by Lambda rather than a CDN.

The active table schema and retrieval decisions are documented in [DYNAMODB_STORAGE_AND_RETRIEVAL.md](DYNAMODB_STORAGE_AND_RETRIEVAL.md). It deliberately uses one evidence index with a native verification-date sort order, rather than adding speculative indexes that would consume the free capacity budget.

To use `myocardianregen.ai-aarti.com` without adding an AWS CDN or API gateway, follow [CLOUDFLARE_CUSTOM_DOMAIN_PROXY.md](CLOUDFLARE_CUSTOM_DOMAIN_PROXY.md) after the Lambda URL is verified.

## Included capacity

The three DynamoDB tables and the evidence index each use 5 read and 5 write capacity units: **20 RCUs and 20 WCUs total**. This remains within DynamoDB's ongoing 25 RCU / 25 WCU free allowance. The function has 512 MB memory, ARM64 architecture, 10-second timeout, and reserved concurrency of two to keep Lambda use bounded.

Always Free allowances are limits, not an unlimited-use guarantee. Lambda has an ongoing monthly allowance, but external data transfer can be chargeable. Keep the project low-traffic, do not add paid AWS services, and review the AWS Free Tier dashboard before enabling public promotion.

## Required tools and account configuration

1. Use an AWS account with access to the AWS Always Free offers in your chosen Region.
2. Install and authenticate the AWS CLI.
3. Install AWS SAM CLI.
4. Use Node.js 22.12 or later (but below Node 23) for a release build. The repository's pinned remote build version is 22.19.0 in `.node-version`.
5. Run `npm run check:aws`. It checks the Node version, AWS CLI authentication, and SAM CLI before any infrastructure action.
6. Do not switch the account to a configuration that enables paid-only services without a separate review.

## Deploy

This creates Lambda and DynamoDB resources. It does not create a billable front door, but it is still an external infrastructure action and must be reviewed in the AWS console first.

```bash
export AWS_STACK_NAME=salus-dev
export AWS_REGION=us-east-1
npm run check:aws
npm run deploy:aws
```

The script first creates `dist/`, then packages it as the Lambda layer, deploys the SAM stack, runs the idempotent clinical-catalog seed, and prints the stable Lambda Function URL. Re-running it never overwrites existing condition or evidence records.

AWS SAM uses a small temporary S3 artifact location while it uploads Lambda deployment packages. That is a deployment-tool implementation detail, not a SALUS runtime service or data store; the deployed stack has no S3 resource. If your governance rule forbids even temporary S3 packaging, use a reviewed direct-Lambda upload workflow instead of SAM before deploying. Do not represent that narrower rule as a runtime limitation.

## Local Node 22.6 and remote release builds

Node 22.6 can be used locally for ordinary development, test work, and visual review. Vite currently emits an upstream compatibility warning on that version, so a local 22.6 build is useful feedback but is **not** a release certification.

The release gate is intentionally separate:

1. Push the reviewed revision to GitHub.
2. In GitHub, open **Actions → Deploy SALUS to AWS → Run workflow**.
3. Enter the stack name and Region.
4. The hosted runner installs the repository-pinned Node **22.19.0**, runs typecheck and tests, then runs the deployment script.

Before the first remote run, create a GitHub Environment named `aws-production`, add `AWS_DEPLOY_ROLE_ARN` as an environment secret, and configure that IAM role to trust GitHub Actions OIDC only for `repo:aartisr/salus-pramana-medical` and the protected deployment workflow. Do not store long-lived AWS access keys in GitHub.

## Verify

At the printed URL, verify:

```text
/                         → SALUS homepage
/clinical-workbench       → SPA deep link
/api/health               → JSON health response
/api/conditions           → JSON array
```

The deployment script seeds the reviewed, versioned condition and evidence catalog once using `npm run seed:aws`; it is idempotent and never runs from a Lambda invocation. For future catalog releases, run the same command with the deployed table names after the reviewed data migration is merged.

## Authentication and AI

Public read-only access works without Cognito. The currently deployed SALUS sign-in control correctly communicates that sign-in is unavailable; no existing user-facing capability is removed. Do not add Cognito until its token-verifier checklist in [AWS_DEPLOYMENT_READINESS.md](AWS_DEPLOYMENT_READINESS.md) is complete, because federated and machine-to-machine authentication can have different pricing limits.

Leave `GEMINI_API_KEY` unset for the Always Free path. The deterministic SALUS fallback remains fully available; enabling a third-party AI provider has its own cost and data-governance implications.

## Important limitations

- Lambda Function URLs have no separate endpoint charge, but Lambda invocation, execution, and internet-transfer limits still apply.
- There is no CDN, custom domain, edge cache, or WAF in this strict path.
- Reserved concurrency is deliberately low. Excess requests receive `429` responses rather than scaling the function without bound.
- DynamoDB point-in-time recovery is deliberately disabled; export reviewed data before making material changes.
- Do not add a VPC, NAT gateway, or managed database to this stack.

## Sources

- [AWS Always Free overview](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier.html)
- [Lambda pricing](https://aws.amazon.com/lambda/pricing/)
- [Lambda Function URL cost model](https://docs.aws.amazon.com/lambda/latest/dg/furls-http-invoke-decision.html)
- [DynamoDB free allowance](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/)
- [Cognito pricing](https://aws.amazon.com/cognito/pricing/)
