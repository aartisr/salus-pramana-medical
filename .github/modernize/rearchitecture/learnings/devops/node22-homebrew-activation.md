# Node 22 Homebrew Activation

Use the verified Homebrew runtime when nvm catalog access is unavailable.

## What Happened
For salus-pramana-medical t10, `/opt/homebrew/bin/node` was already Node.js v22.19.0, but nvm had no installed releases and DNS prevented catalog access. The repository now pins `22.19.0` in `.node-version`.

## Takeaway
Activate with `/opt/homebrew/bin` first and compare `node --version` to `.node-version` before installs, builds, or tests. Do not assume an nvm function implies the requested runtime is installed.

## Example

```sh
export PATH="/opt/homebrew/bin:$PATH"
hash -r
test "$(node --version)" = "v$(tr -d '[:space:]' < .node-version)"
```

## History
- 2026-09-30 (salus-pramana-medical/t10): initial