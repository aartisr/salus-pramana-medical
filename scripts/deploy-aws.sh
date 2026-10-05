#!/usr/bin/env bash
set -euo pipefail

: "${AWS_STACK_NAME:?Set AWS_STACK_NAME (for example salus-dev).}"
: "${AWS_REGION:?Set AWS_REGION (for example us-east-1).}"
npm run check:aws
npm run build
sam build --template-file infra/template.yaml
sam deploy --stack-name "$AWS_STACK_NAME" --region "$AWS_REGION" --capabilities CAPABILITY_IAM --resolve-s3 --no-confirm-changeset

stack_output() {
  aws cloudformation describe-stacks \
    --stack-name "$AWS_STACK_NAME" \
    --region "$AWS_REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" \
    --output text
}

conditions_table="$(stack_output ConditionsTableName)"
evidence_table="$(stack_output EvidenceTableName)"
audit_table="$(stack_output AuditTableName)"

PERSISTENCE_ADAPTER=dynamodb \
CONDITIONS_TABLE="$conditions_table" \
EVIDENCE_TABLE="$evidence_table" \
AUDIT_TABLE="$audit_table" \
AWS_REGION="$AWS_REGION" \
npm run seed:aws

stack_output SiteUrl
