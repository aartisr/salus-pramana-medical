import { spawnSync } from 'node:child_process';

const scopeIndex = process.argv.indexOf('--scope');
const scope = scopeIndex >= 0 ? process.argv[scopeIndex + 1] : 'all';
const scaffoldCommands = ['typecheck', 'lint', 'test', 'build'];
const fullCommands = [
  ...scaffoldCommands,
  'test:contracts',
  'test:integration',
  'test:e2e',
  'test:a11y',
  'test:visual',
  'test:performance',
];
const commands = scope === 'scaffold' ? scaffoldCommands : fullCommands;

for (const command of commands) {
  const result = spawnSync('npm', ['run', command], { stdio: 'inherit', shell: false });
  if (result.status !== 0) process.exit(result.status ?? 1);
}