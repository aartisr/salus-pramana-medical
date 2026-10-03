# DevOps Session Log

## [t10] Prepared the Node.js 22 target environment
- The active Homebrew runtime already provided Node.js v22.19.0 and npm 9.9.4 on darwin/arm64.
- nvm had no installed Node versions and could not query/install releases because external DNS resolution was unavailable.
- Pinned the verified runtime in `.node-version`; downstream commands should prepend `/opt/homebrew/bin` and verify the pin before execution.
- Frozen install, TypeScript compilation, 2 tests, and the Vite production build all passed.
- Kept T001 package/script reconciliation out of t10 because it remains assigned to t12.
- Learnings consumed: [(none)]
