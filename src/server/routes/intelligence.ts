import type { Express } from 'express';
import type { IntelligenceServices, ServerRepositories, TreatmentEvidence } from '../app/create-app';
import { requireDraftAccess } from '../auth/middleware';

function mode(value: unknown): 'public' | 'clinician' { return value === 'clinician' ? 'clinician' : 'public'; }
function bounded(value: unknown, fallback: number) { const parsed = Number.parseInt(String(value ?? ''), 10); return Number.isNaN(parsed) ? fallback : Math.max(6, Math.min(168, parsed)); }
function blocked(report: { gates: Record<string, { status?: string }> }) { return Object.values(report.gates).some((gate) => gate.status === 'fail' || gate.status === 'insufficient-data'); }
function failClosed(conditionId: string, now: () => Date) {
  return { modelVersion: 'pramana-v1.0.0', generatedAt: now().toISOString(), conditionId: conditionId || 'unknown', mode: 'public', evidenceCount: 0,
    conditionPramanaScore: 0, confidenceScore: 0, confidenceInterval95: { lower: 0, upper: 18 }, bayesianProbabilityAboveThreshold: 0,
    decision: 'INSUFFICIENT_EVIDENCE', uncertainty: { coefficientOfVariation: 1, dataCoverage: 'low', explanation: 'Unable to compute intelligence due to processing error. Please try again.' }, contributions: [] };
}
function withStrictGovernance(result: unknown, report: ReturnType<IntelligenceServices['computeGates']>, strict: boolean) {
  const value = result as Record<string, any>;
  if (strict && blocked(report) && value.decision === 'RECOMMEND') return { ...value, decision: 'INSUFFICIENT_EVIDENCE', uncertainty: { ...value.uncertainty, explanation: `${value.uncertainty.explanation} Governance strict-mode applied: recommendation downgraded due to failed/insufficient gates.` }, governance: { strictModeApplied: true, goNoGo: report.goNoGo, gates: report.gates } };
  return { ...value, governance: { strictModeApplied: strict, goNoGo: report.goNoGo } };
}

export function registerIntelligenceRoutes(app: Express, repositories: ServerRepositories, services: IntelligenceServices, strictDefault: boolean, now: () => Date) {
  app.get('/intelligence/condition/:conditionId', async (request, response) => {
    const conditionId = request.params.conditionId;
    if (!conditionId) return response.status(400).json({ error: 'conditionId is required' });
    if (!requireDraftAccess(request, response)) return;
    try {
      const rows = (await repositories.listEvidence(conditionId, request.query.includeDrafts === 'true')).map((row) => ({ ...row, sampleSize: row.sampleSize ?? 100 }));
      const result = services.computeCondition(conditionId, rows, mode(request.query.mode));
      const gates = services.computeGates(conditionId, rows, result);
      const strict = request.query.strictGates === 'true' ? true : request.query.strictGates === 'false' ? false : strictDefault;
      return response.json(withStrictGovernance(result, gates, strict));
    } catch { return response.json(failClosed(conditionId, now)); }
  });
  app.get('/intelligence/evidence/:evidenceId', async (request, response, next) => {
    try {
      if (!requireDraftAccess(request, response)) return;
      const rows = await repositories.listEvidence(undefined, request.query.includeDrafts === 'true');
      const result = services.computeEvidence(request.params.evidenceId, rows, mode(request.query.mode));
      if (!result) return response.status(404).json({ error: 'Evidence not found' });
      return response.json(result);
    } catch (error) { return next(error); }
  });
  app.get('/intelligence/gates/:conditionId', async (request, response, next) => {
    try {
      if (!requireDraftAccess(request, response)) return;
      const rows = await repositories.listEvidence(request.params.conditionId, request.query.includeDrafts === 'true');
      return response.json(services.computeGates(request.params.conditionId, rows, services.computeCondition(request.params.conditionId, rows, mode(request.query.mode))));
    } catch (error) { return next(error); }
  });
  app.get('/intelligence/interaction/:conditionId', async (request, response, next) => {
    try {
      const interventionA = typeof request.query.interventionA === 'string' ? request.query.interventionA : undefined;
      const interventionB = typeof request.query.interventionB === 'string' ? request.query.interventionB : undefined;
      if (!interventionA || !interventionB) return response.status(400).json({ error: 'interventionA and interventionB are required' });
      if (!requireDraftAccess(request, response)) return;
      const rows = await repositories.listEvidence(request.params.conditionId, request.query.includeDrafts === 'true');
      const rowA = rows.find((row) => row.interventionName === interventionA); const rowB = rows.find((row) => row.interventionName === interventionB);
      const timeline = services.simulateInteraction(interventionA, interventionB, Boolean(rowA?.interactionWarnings.length || rowB?.interactionWarnings.length), rowA?.sampleSize ?? 100, rowB?.sampleSize ?? 100, bounded(request.query.hours, 48));
      return response.json({ conditionId: request.params.conditionId, interventionA, interventionB, timeline, generatedAt: now().toISOString() });
    } catch (error) { return next(error); }
  });
  const evidenceComputation = (kind: 'trajectory' | 'dose') => async (request: any, response: any) => {
    try {
      if (!requireDraftAccess(request, response)) return;
      const rows: TreatmentEvidence[] = await repositories.listEvidence(undefined, request.query.includeDrafts === 'true');
      const evidence = rows.find((row) => row.evidenceId === request.params.evidenceId);
      if (!evidence) return response.status(404).json({ error: 'Evidence not found' });
      if (kind === 'trajectory') return response.json({ evidenceId: evidence.evidenceId, trajectory: services.simulateTrajectory(evidence, bounded(request.query.hours, 72)), generatedAt: now().toISOString() });
      return response.json(services.optimizeDose(evidence));
    } catch { return response.status(500).json({ error: kind === 'trajectory' ? 'Failed to compute trajectory' : 'Failed to compute dose optimization' }); }
  };
  app.get('/intelligence/trajectory/:evidenceId', evidenceComputation('trajectory'));
  app.get('/intelligence/dose-optimizer/:evidenceId', evidenceComputation('dose'));
}