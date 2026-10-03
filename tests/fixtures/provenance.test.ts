import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const workspaceRoot = process.cwd();

async function sha256(relativePath: string) {
  const contents = await readFile(path.join(workspaceRoot, relativePath));
  return createHash('sha256').update(contents).digest('hex');
}

describe('T008 fixture provenance', () => {
  it('preserves exact non-PHI snapshots for every declared source', async () => {
    const provenance = JSON.parse(
      await readFile(path.join(workspaceRoot, 'tests/fixtures/provenance.json'), 'utf8'),
    ) as {
      policy: string;
      fixtures: Array<{
        sourcePath: string;
        fixturePath: string;
        sourceSha256: string;
        fixtureSha256: string;
        byteIdentical: boolean;
        classification: string;
      }>;
    };

    expect(provenance.policy).toContain('no production records');
    expect(provenance.fixtures).toHaveLength(10);
    expect(new Set(provenance.fixtures.map((fixture) => fixture.sourcePath)).size).toBe(10);

    for (const fixture of provenance.fixtures) {
      const [sourceHash, fixtureHash] = await Promise.all([
        sha256(fixture.sourcePath),
        sha256(fixture.fixturePath),
      ]);
      expect(fixture.classification).toBe('non-PHI static source fixture');
      expect(fixture.byteIdentical).toBe(true);
      expect(sourceHash).toBe(fixture.sourceSha256);
      expect(fixtureHash).toBe(fixture.fixtureSha256);
      expect(sourceHash).toBe(fixtureHash);
    }
  });
});
