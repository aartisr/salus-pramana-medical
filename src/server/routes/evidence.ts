import type { Express } from 'express';
import type { ServerRepositories, TreatmentEvidence } from '../app/create-app';
import { getActorEmail, requireAuthenticated, requireDraftAccess, requireEditor } from '../auth/middleware';

function limit(value: unknown) { const parsed = Number.parseInt(String(value ?? '25'), 10); return Number.isNaN(parsed) ? 25 : Math.max(1, Math.min(100, parsed)); }
function cursor(value: unknown) { const parsed = Number.parseInt(String(value ?? '0'), 10); return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed; }
function search(rows: TreatmentEvidence[], value: unknown) {
  const term = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!term) return rows;
  return rows.filter((row) => [row.evidenceId, row.conditionId, row.medicalSystem, row.interventionName, row.evidenceGrade, row.studyMethodology,
    row.registryIdentifier, row.clinicalOutcomeSummary, ...row.contraindications, ...row.interactionWarnings].join(' ').toLowerCase().includes(term));
}
function sort(rows: TreatmentEvidence[]) {
  return [...rows].sort((a, b) => (a.lastVerifiedDate ?? '0000-00-00') === (b.lastVerifiedDate ?? '0000-00-00')
    ? a.evidenceId.localeCompare(b.evidenceId) : (b.lastVerifiedDate ?? '0000-00-00').localeCompare(a.lastVerifiedDate ?? '0000-00-00'));
}
function csvCell(value: unknown) { const text = value == null ? '' : String(value); return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; }
function csv(rows: TreatmentEvidence[]) {
  const headers = ['evidenceId', 'conditionId', 'medicalSystem', 'interventionName', 'isPharmacological', 'evidenceGrade', 'studyMethodology', 'sampleSize', 'registryIdentifier', 'sourceUrl', 'clinicalOutcomeSummary', 'contraindications', 'interactionWarnings', 'publicationStatus', 'lastVerifiedDate'];
  return [headers.join(','), ...rows.map((row) => [row.evidenceId, row.conditionId, row.medicalSystem, row.interventionName, row.isPharmacological, row.evidenceGrade,
    row.studyMethodology, row.sampleSize ?? '', row.registryIdentifier, row.sourceUrl, row.clinicalOutcomeSummary, row.contraindications.join(' | '),
    row.interactionWarnings.join(' | '), row.publicationStatus ?? 'published', row.lastVerifiedDate ?? ''].map(csvCell).join(','))].join('\n');
}
function parseEvidence(value: unknown): { data?: TreatmentEvidence; error?: unknown } {
  const body = value as Partial<TreatmentEvidence> | null;
  const fields = ['evidenceId', 'conditionId', 'medicalSystem', 'interventionName', 'evidenceGrade', 'studyMethodology', 'registryIdentifier', 'sourceUrl', 'clinicalOutcomeSummary'] as const;
  const fieldErrors: Record<string, string[]> = {};
  for (const field of fields) if (!body || typeof body[field] !== 'string' || !body[field]?.trim()) fieldErrors[field] = ['Required'];
  if (!body || typeof body.isPharmacological !== 'boolean') fieldErrors.isPharmacological = ['Required'];
  if (!body || !Array.isArray(body.contraindications)) fieldErrors.contraindications = ['Required'];
  if (!body || !Array.isArray(body.interactionWarnings)) fieldErrors.interactionWarnings = ['Required'];
  if (body?.sourceUrl && (!body.sourceUrl.startsWith('https://') || !/pubmed|doi\.org|clinicaltrials|ctri|who\.int|ayush|dhara/i.test(body.sourceUrl))) fieldErrors.sourceUrl = ['Invalid source URL'];
  if (body?.registryIdentifier && !/^(PMID|DOI|CTRI|ICTRP|AYUSH|DHARA|NCT)-/i.test(body.registryIdentifier)) fieldErrors.registryIdentifier = ['Invalid registry identifier'];
  return Object.keys(fieldErrors).length ? { error: { formErrors: [], fieldErrors } } : { data: body as TreatmentEvidence };
}

export function registerEvidenceRoutes(app: Express, repositories: ServerRepositories, now: () => Date) {
  app.get('/evidence', async (request, response, next) => {
    try {
      if (!requireDraftAccess(request, response)) return;
      const includeDrafts = request.query.includeDrafts === 'true';
      const conditionId = typeof request.query.conditionId === 'string' ? request.query.conditionId : undefined;
      const pageLimit = limit(request.query.limit); const pageCursor = cursor(request.query.cursor);
      const sorted = sort(search(await repositories.listEvidence(conditionId, includeDrafts), request.query.q));
      const rows = sorted.slice(pageCursor, pageCursor + pageLimit);
      response.json({ metadata: { causalEquivalencyDisclaimer: true, message: 'Evidence grades are not interchangeable across systems. Grade A and Grade B options for the same condition must not be treated as causally equivalent.',
        pagination: { limit: pageLimit, cursor: pageCursor, nextCursor: pageCursor + rows.length < sorted.length ? String(pageCursor + rows.length) : null, totalCount: sorted.length, returnedCount: rows.length },
        query: { conditionId: conditionId ?? null, includeDrafts, q: typeof request.query.q === 'string' ? request.query.q.trim() || null : null } }, rows });
    } catch (error) { next(error); }
  });
  app.get('/evidence/export.csv', async (request, response, next) => {
    try {
      if (!requireDraftAccess(request, response)) return;
      const rows = sort(search(await repositories.listEvidence(typeof request.query.conditionId === 'string' ? request.query.conditionId : undefined, request.query.includeDrafts === 'true'), request.query.q));
      response.type('text/csv').setHeader('content-disposition', 'attachment; filename=salus-evidence-export.csv');
      response.send(csv(rows));
    } catch (error) { next(error); }
  });
  app.post('/evidence', requireAuthenticated, async (request, response, next) => {
    try {
      const parsed = parseEvidence(request.body);
      if (!parsed.data) return response.status(400).json({ error: parsed.error });
      if (!await repositories.getCondition(parsed.data.conditionId)) return response.status(400).json({ error: 'conditionId must reference an existing condition' });
      const draft = { ...parsed.data, publicationStatus: 'draft' as const, lastVerifiedDate: parsed.data.lastVerifiedDate || now().toISOString().slice(0, 10) };
      const saved = await repositories.createEvidence(draft, { action: 'evidence.create', actorEmail: getActorEmail(request), targetEvidenceId: draft.evidenceId, ipAddress: request.header('x-forwarded-for') });
      if (!saved) return response.status(409).json({ error: 'An evidence record with this evidenceId already exists' });
      return response.status(201).json(saved);
    } catch (error) { return next(error); }
  });
  app.patch('/evidence/:id/publish', requireAuthenticated, requireEditor, async (request, response, next) => {
    try {
      const status = request.body?.publicationStatus;
      if (!['draft', 'published', 'rejected'].includes(status)) return response.status(400).json({ error: 'publicationStatus must be draft, published, or rejected' });
      const updated = await repositories.updateEvidencePublicationStatus(request.params.id, status, { action: `evidence.${status}`, actorEmail: getActorEmail(request), targetEvidenceId: request.params.id, ipAddress: request.header('x-forwarded-for') });
      if (!updated) return response.status(404).json({ error: 'Evidence not found' });
      return response.json(updated);
    } catch (error) { return next(error); }
  });
}