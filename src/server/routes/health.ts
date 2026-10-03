import type { Express } from 'express';
export function registerHealthRoute(app: Express) {
  app.get('/health', (_request, response) => response.json({ ok: true, service: 'salus-api', motto: 'The evidence behind every path to healing.' }));
}