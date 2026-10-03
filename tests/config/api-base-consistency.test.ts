import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { API_BASE_PATH } from '../../src/client/config/api';
import { loadServerConfig } from '../../src/server/config/runtime';

describe('T005 API configuration', () => {
  it('uses one same-origin browser base and the approved server port', () => {
    expect(API_BASE_PATH).toBe('/api');
    expect(API_BASE_PATH).not.toMatch(/^https?:\/\//);
    expect(loadServerConfig({ NODE_ENV: 'test' })).toMatchObject({
      port: 8787,
      corsAllowedOrigins: ['http://localhost:5173', 'http://localhost:5174'],
      persistenceAdapter: 'memory',
    });
  });

  it('keeps the sole development proxy in Vite', async () => {
    const viteConfig = await readFile('vite.config.ts', 'utf8');
    expect(viteConfig).toContain("'/api'");
    expect(viteConfig).toContain('http://127.0.0.1:8787');

    const duplicateProxyFiles = ['server.ts', 'src/server/index.ts', 'src/server/app/create-app.ts'];
    for (const file of duplicateProxyFiles) {
      const source = await readFile(file, 'utf8');
      expect(source).not.toMatch(/proxy\s*:/);
    }
  });
});