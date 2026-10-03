import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

async function filesUnder(directory: string, prefix = ''): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const relative = path.join(prefix, entry.name);
    return entry.isDirectory() ? filesUnder(path.join(directory, entry.name), relative) : [relative];
  }));
  return files.flat().sort();
}

describe('published report corpus', () => {
  it('is self-contained and exactly declared by active provenance', async () => {
    const provenance = JSON.parse(await readFile(path.join(root, 'public/reports/provenance.json'), 'utf8')) as { source: string; assetCount: number; index: string[] };
    const targetFiles = (await filesUnder(path.join(root, 'public/reports'))).filter((file) => file !== 'provenance.json');
    expect(provenance.source).toBe('active public/reports corpus');
    expect(targetFiles).toEqual([...provenance.index].sort());
    expect(targetFiles).toHaveLength(provenance.assetCount);
  });

  it('retains formulas, attribution, calibration, and print profiles', async () => {
    const math = await readFile(path.join(root, 'public/reports/CALCULUS_MATH_SPEC.md'), 'utf8');
    const calibration = JSON.parse(await readFile(path.join(root, 'public/reports/reports/synthetic-calibration-report.json'), 'utf8'));
    expect(math).toContain('SALUS');
    expect(math).toContain('w_{\\text{recency}}');
    expect(math).toContain('INSUFFICIENT_EVIDENCE');
    expect(calibration).toBeTruthy();
    expect(await filesUnder(path.join(root, 'public/reports'))).toEqual(expect.arrayContaining(['pdf-print.css', 'pdf-print-academic.css', 'pdf-print-executive.css']));
  });
});
