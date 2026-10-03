import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const workspaceRoot = process.cwd();
const targetBoundaries = [
  'src/client',
  'src/server',
  'src/application',
  'src/domain',
  'src/persistence',
  'src/ingestion',
  'src/shared',
];

async function sourceFiles(relativeDirectory: string): Promise<string[]> {
  const entries = await readdir(path.join(workspaceRoot, relativeDirectory), { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) files.push(...(await sourceFiles(relativePath)));
    if (entry.isFile() && /\.[cm]?[jt]sx?$/.test(entry.name)) files.push(relativePath);
  }

  return files;
}

describe('T002 target module boundaries', () => {
  it('creates every approved active-root boundary', async () => {
    await expect(Promise.all(targetBoundaries.map((boundary) => access(boundary)))).resolves.toBeDefined();
  });

  it('keeps runtime source independent from retired legacy paths', async () => {
    const files = await sourceFiles('src');
    const violations: string[] = [];

    for (const file of files) {
      const source = await readFile(path.join(workspaceRoot, file), 'utf8');
      if (/from\s+['"][^'"]*archive\/legacy-monorepo|import\s*\(['"][^'"]*archive\/legacy-monorepo/.test(source)) {
        violations.push(file);
      }
    }

    expect(violations).toEqual([]);
  });
});
