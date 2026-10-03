import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('discovery assets', () => {
  it('lists every public application route on the canonical origin', async () => {
    const sitemap = await readFile(path.join(process.cwd(), 'public/sitemap.xml'), 'utf8');
    const routes = ['/', '/scientific-audit', '/global-health-equity', '/cross-system-intelligence', '/ode-interaction-lab', '/clinical-workbench', '/ai-clinical-reasoning', '/architecture', '/calibration-governance', '/math', '/compare/cond-type2-diabetes', '/new', '/editor', '/auth/callback'];
    for (const route of routes) expect(sitemap).toContain(`https://saluspramana.ai-aarti.com${route}`);
  });

  it('keeps crawler and LLM discovery assets reachable', async () => {
    for (const file of ['robots.txt', 'llms.txt', 'llms-full.txt', 'sitemap.xml']) {
      expect((await readFile(path.join(process.cwd(), 'public', file), 'utf8')).length).toBeGreaterThan(40);
    }
  });
});