import type { Express } from 'express';
import type { MedicalCondition, ServerRepositories } from '../app/create-app';
import { getActorEmail, requireAuthenticated, requireEditor } from '../auth/middleware';
function parseCondition(value: unknown): { data?: MedicalCondition; error?: unknown } {
  const body = value as Partial<MedicalCondition> | null;
  const fieldErrors: Record<string, string[]> = {};
  for (const field of ['conditionId', 'icd11Code', 'standardName'] as const) if (!body || typeof body[field] !== 'string' || !body[field]?.trim()) fieldErrors[field] = ['Required'];
  return Object.keys(fieldErrors).length ? { error: { formErrors: [], fieldErrors } } : { data: body as MedicalCondition };
}
export function registerConditionRoutes(app: Express, repositories: ServerRepositories) {
  app.get('/conditions', async (_request, response, next) => { try { response.json(await repositories.listConditions()); } catch (error) { next(error); } });
  app.post('/conditions', requireAuthenticated, requireEditor, async (request, response, next) => {
    try {
      const parsed = parseCondition(request.body);
      if (!parsed.data) return response.status(400).json({ error: parsed.error });
      const saved = await repositories.createCondition(parsed.data, { action: 'condition.create', actorEmail: getActorEmail(request), targetEvidenceId: parsed.data.conditionId, ipAddress: request.header('x-forwarded-for') });
      return response.status(201).json(saved);
    } catch (error) { return next(error); }
  });
}