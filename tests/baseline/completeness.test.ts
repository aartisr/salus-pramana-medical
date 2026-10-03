import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const workspaceRoot = process.cwd();

async function readJson<T>(relativePath: string): Promise<T> {
  return JSON.parse(await readFile(path.join(workspaceRoot, relativePath), 'utf8')) as T;
}

describe('T007 authoritative baseline completeness', () => {
  it('retains every obtainable production HTTP artifact with verifiable content', async () => {
    const baseline = await readJson<{
      readOnly: boolean;
      artifacts: Array<{
        id: string;
        method: string;
        status: number;
        bodyPath: string;
        bodySha256: string;
        bodyBytes: number;
      }>;
      blockers: unknown[];
    }>('evidence/baseline/production-http.json');

    expect(baseline.readOnly).toBe(true);
    expect(baseline.blockers).toEqual([]);
    expect(baseline.artifacts.map((artifact) => artifact.id)).toEqual([
      'home',
      'robots',
      'sitemap',
      'clinical-ai',
    ]);

    for (const artifact of baseline.artifacts) {
      const body = await readFile(path.join(workspaceRoot, artifact.bodyPath));
      expect(body.byteLength).toBe(artifact.bodyBytes);
      expect(createHash('sha256').update(body).digest('hex')).toBe(artifact.bodySha256);
      expect(Number.isInteger(artifact.status)).toBe(true);
      expect(['GET', 'POST']).toContain(artifact.method);
    }

    expect(baseline.artifacts.find((artifact) => artifact.id === 'clinical-ai')).toMatchObject({
      method: 'POST',
      status: 405,
      bodyBytes: 0,
    });
  });

  it('records local characterization and exact blockers without inventing evidence', async () => {
    const local = await readJson<{
      activeCanonicalTest: { command: string; result: string; testsPassed: number; failed: number; skipped: number };
      authoritativeRouteContract: { routeCount: number; canonicalRoot: string; source: string };
    }>('evidence/baseline/local-characterization.json');
    const prerequisites = await readJson<{
      prerequisites: Array<{
        capability: string;
        status: string;
        owner: string;
        blockerEvidence: string;
        blocks: string[];
      }>;
    }>('evidence/baseline/prerequisites.json');

    expect(local.activeCanonicalTest).toMatchObject({
      command: 'npm test',
      result: 'PASS',
      testsPassed: 2,
      failed: 0,
      skipped: 0,
    });
    expect(local.authoritativeRouteContract).toEqual({
      routeCount: 9,
      canonicalRoot: '/',
      source: 'src/app/route-paths.ts',
    });

    expect(prerequisites.prerequisites).toHaveLength(6);
    for (const prerequisite of prerequisites.prerequisites) {
      expect(prerequisite.status).toBe('BLOCKED');
      expect(prerequisite.owner.length).toBeGreaterThan(3);
      expect(prerequisite.blockerEvidence.length).toBeGreaterThan(20);
      expect(prerequisite.blocks.length).toBeGreaterThan(0);
      expect(prerequisite.blockerEvidence).not.toMatch(/TBD|unknown|approximately|etc\./i);
    }

    const browserPrerequisite = prerequisites.prerequisites.find(
      (prerequisite) => prerequisite.capability === 'latest-two-major browser and assistive-technology matrix',
    );
    expect(browserPrerequisite?.blockerEvidence).toContain('@playwright/test is declared');
    expect(browserPrerequisite?.blockerEvidence).not.toContain('Playwright is absent');
  });
});
