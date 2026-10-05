#!/usr/bin/env bash
set -euo pipefail

node -e '
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major !== 22 || minor < 12) {
    throw new Error(`Node.js 22.12+ and below 23 is required; found ${process.versions.node}`);
  }
'

command -v aws >/dev/null
command -v sam >/dev/null
aws sts get-caller-identity --output json >/dev/null

echo 'AWS deployment preflight passed: supported Node.js, AWS CLI authentication, and SAM CLI are available.'
