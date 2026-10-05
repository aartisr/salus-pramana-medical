# Cloudflare custom-domain proxy for SALUS

This guide maps **`myocardianregen.ai-aarti.com`** to the AWS SALUS Lambda Function URL without adding CloudFront, API Gateway, or another AWS runtime service. Cloudflare supplies the custom-domain certificate and HTTPS proxy; SALUS itself continues to run on AWS Lambda and DynamoDB.

## Before beginning

1. Deploy and verify SALUS using [AWS_DEPLOYMENT_FREE_TIER.md](AWS_DEPLOYMENT_FREE_TIER.md). Copy the `SiteUrl` output; it looks like `https://<id>.lambda-url.<region>.on.aws/`.
2. Confirm you control the DNS zone for `ai-aarti.com` and that it is active in the intended Cloudflare account. A Cloudflare Worker custom domain requires an active Cloudflare zone; a DNS record managed only by another provider is not sufficient.
3. Confirm that `myocardianregen.ai-aarti.com` does not already have a CNAME record. Cloudflare creates the DNS record and certificate for this exact hostname.

## Deploy the proxy

From the repository root, authenticate the Cloudflare CLI and deploy the Worker configuration:

```bash
npx --yes wrangler@4 login
npx --yes wrangler@4 deploy --config cloudflare/salus-domain-proxy/wrangler.toml
```

Set the Lambda Function URL as a Cloudflare Worker secret. Paste the entire `SiteUrl` value when prompted:

```bash
npx --yes wrangler@4 secret put SALUS_ORIGIN --config cloudflare/salus-domain-proxy/wrangler.toml
npx --yes wrangler@4 deploy --config cloudflare/salus-domain-proxy/wrangler.toml
```

The first deployment establishes the Worker and the custom domain. The second deploy activates the verified origin secret. The proxy preserves all SALUS paths, queries, and request methods, including SPA deep links and `/api/*`.

## Verify

Wait for Cloudflare certificate issuance, then test:

```bash
curl -I https://myocardianregen.ai-aarti.com/
curl https://myocardianregen.ai-aarti.com/api/health
curl -I https://myocardianregen.ai-aarti.com/clinical-workbench
```

Expected results are a successful HTML response for the first and third commands and a JSON health response for the second.

## Security and cost boundary

- The public Lambda Function URL remains directly reachable. This Worker provides custom-domain TLS and routing, not origin access control. Restricting the origin would require an additional AWS front-door design and is outside the strict Always Free runtime path.
- Keep `SALUS_ORIGIN` a Worker secret even though a public client could discover the Lambda endpoint. It avoids hard-coding infrastructure identifiers in the repository.
- Do not add Cloudflare caching rules for `/api/*`. Static asset caching can be assessed later only after verifying SALUS release behavior.
- Cloudflare plan and usage terms are independent of AWS. Review the selected Cloudflare plan before enabling substantial public traffic.

## Files

- Worker implementation: `cloudflare/salus-domain-proxy/src/index.ts`
- Cloudflare configuration: `cloudflare/salus-domain-proxy/wrangler.toml`
