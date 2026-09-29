# Zero-cost operating guardrails

This architecture can be very low cost for small traffic, but cannot guarantee forever-zero under unlimited usage.

## Hard controls

- AWS Budgets alerts for tiny thresholds
- Billing alarm notifications enabled
- CloudWatch log retention policy enforced
- WAF/rate limiting when public traffic increases

## Design choices already made in this repository

- Function URL (no API Gateway dependency)
- DynamoDB pay-per-request
- CloudFront PriceClass_100
- Static frontend origin on S3
- Cognito with MFA OFF by default (no SMS spend)

## Operational checklist

- Review cost explorer weekly
- Watch CloudFront egress and Lambda invocations
- Block abusive IP/bot traffic quickly if needed
