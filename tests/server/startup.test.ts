import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app/create-app';

const servers: Array<{ close: (callback: (error?: Error) => void) => void }> = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map((server) => new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    })),
  );
});

describe('T004 Express startup', () => {
  it('serves health and the deterministic clinical fallback on an ephemeral port', async () => {
    const app = createApp({
      config: {
        nodeEnv: 'test',
        port: 0,
        corsAllowedOrigins: ['http://localhost:5173'],
        persistenceAdapter: 'memory',
      },
    });
    const server = app.listen(0);
    servers.push(server);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const { port } = server.address() as AddressInfo;

    const healthResponse = await fetch(`http://127.0.0.1:${port}/health`);
    expect(healthResponse.status).toBe(200);
    await expect(healthResponse.json()).resolves.toEqual({
      ok: true,
      service: 'salus-api',
      motto: 'The evidence behind every path to healing.',
    });

    const clinicalResponse = await fetch(`http://127.0.0.1:${port}/api/clinical-ai`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ condition: { standardName: 'Type 2 Diabetes Mellitus' } }),
    });
    expect(clinicalResponse.status).toBe(200);
    await expect(clinicalResponse.json()).resolves.toMatchObject({
      status: 'fallback',
      source: 'SALUS Pramana Deterministic Reasoning Engine v1.0.0',
    });
  });
});