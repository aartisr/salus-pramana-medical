import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type ManifestEntry = { path: string; sha256: string; size: number };
type IntegrityManifest = {
  algorithm: string;
  activeRoot: { totalFiles: number; totalBytes: number; aggregateSha256: string; entries: ManifestEntry[] };
};

const workspaceRoot = process.cwd();

describe('T006 active-root source integrity baseline', () => {
  it('records a unique SHA-256 entry for every capability-bearing active-root file', async () => {
    const manifest = JSON.parse(await readFile(path.join(workspaceRoot, 'evidence/source-integrity/before.json'), 'utf8')) as IntegrityManifest;
    const paths = manifest.activeRoot.entries.map((entry) => entry.path);

    expect(manifest.algorithm).toBe('sha256');
    expect(paths).toHaveLength(manifest.activeRoot.totalFiles);
    expect(new Set(paths).size).toBe(paths.length);
    expect(manifest.activeRoot.totalBytes).toBeGreaterThan(0);
    expect(manifest.activeRoot.aggregateSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(paths).toContain('server.ts');
    expect(paths).toContain('src/App.tsx');
    expect(paths).toContain('public/sitemap.xml');
    expect(paths.every((entryPath) => !entryPath.startsWith('archive/'))).toBe(true);
    expect(paths.every((entryPath) => !entryPath.startsWith('evidence/'))).toBe(true);
    expect(paths.every((entryPath) => !entryPath.startsWith('tests/'))).toBe(true);
    expect(manifest.activeRoot.entries.every((entry) => /^[a-f0-9]{64}$/.test(entry.sha256) && entry.size >= 0)).toBe(true);
  });
});
