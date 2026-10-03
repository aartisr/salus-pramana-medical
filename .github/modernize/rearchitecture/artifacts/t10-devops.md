# t10 - Node.js 22 Target Environment

## Target Environment Preparation

- Status: READY
- Requested target: Node.js 22
- Repository pin: `22.19.0` in `.node-version`
- Installed runtime: Node.js `v22.19.0`, npm `9.9.4`
- Active runtime: `/opt/homebrew/bin/node` on `darwin/arm64`
- Active package manager: `/opt/homebrew/bin/npm`
- Planned build/test runtime: Node.js `v22.19.0`
- Activation:

  ```sh
  export PATH="/opt/homebrew/bin:$PATH"
  hash -r
  test "$(node --version)" = "v$(tr -d '[:space:]' < .node-version)"
  ```

- Preparation actions: pinned the exact working patch in `.node-version`; completed a frozen `npm ci`; verified compile, tests, and production build with the explicit Homebrew path.
- Missing tools: none required for t11 or t12.
- Blocker evidence: DNS resolution for `nodejs.org` and `formulae.brew.sh` is unavailable, so nvm could not install a duplicate managed copy. This does not block the active environment because the exact requested major and pinned patch are already installed and verified.
- Downstream implication: run the activation block before Node/npm commands. Do not run `nvm use` until catalog access is restored and `22.19.0` is installed under nvm.

## Scope Boundary

This task prepares the runtime only. T001 package engines, dependencies, scripts, and configuration reconciliation remain assigned to t12. No application source, lockfile, archive content, deployment state, or Git state was changed.

## Changed Files

- `.node-version`
- `.github/modernize/rearchitecture/artifacts/t10-devops.md`
- `.github/modernize/rearchitecture/team/devops/log.md`
- `.github/modernize/rearchitecture/learnings/devops/node22-homebrew-activation.md`

## Test Results

- Command: `npm ci`
- Passed: frozen lockfile install; 293 packages installed; 0 vulnerabilities
- Failed: 0
- Skipped: 0
- Command: `npm run lint`
- Passed: TypeScript `tsc --noEmit`
- Failed: 0
- Skipped: 0
- Command: `npm test`
- Passed: 1 file, 2 tests
- Failed: 0
- Skipped: 0
- Command: `npm run build`
- Passed: Vite 8.3.1 production build, 2,420 modules transformed
- Failed: 0
- Skipped: 0

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t9-teamlead.md` - clean plan-gate PASS, fixed Node.js 22 target, active-root authorization, and preserved external-prerequisite policy.
- `.github/modernize/rearchitecture/clarification.md` - binding Express 4.21 on Node.js 22 target and active-root output location.

## Evidence Mapping

- `t9-teamlead.md#Verdict` -> runtime preparation proceeded only after the clean implementation PASS.
- `t9-teamlead.md#External-Prerequisites-Retained-By-The-Plan` -> DNS catalog access is reported explicitly and not represented as a passed external gate.
- `clarification.md#Backend` -> Node.js 22 is pinned and active for the Express target.
- `clarification.md#Generic` -> all preparation writes remain in the active workspace root with no deployment or Git operations.
