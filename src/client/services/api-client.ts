import { apiPath } from '../config/api';
import { getAccessToken } from './auth/session';
import type {
  EditorAuthStatus,
  EvidenceListOptions,
  EvidenceListResponse,
  EvidenceRecord,
  MedicalConditionRecord,
  PublicationStatus,
} from './contracts';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly endpoint: string,
    readonly correlationId?: string,
    readonly details?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function evidenceQuery(options: EvidenceListOptions = {}) {
  const params = new URLSearchParams();
  if (options.conditionId) params.set('conditionId', options.conditionId);
  if (options.includeDrafts) params.set('includeDrafts', 'true');
  if (options.q) params.set('q', options.q);
  if (typeof options.limit === 'number') params.set('limit', String(options.limit));
  if (options.cursor) params.set('cursor', options.cursor);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  request: typeof fetch = fetch,
): Promise<T> {
  const endpoint = apiPath(path);
  let response: Response;
  try {
    response = await request(endpoint, init);
  } catch {
    throw new ApiError('Unable to reach the SALUS API.', 0, endpoint);
  }

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    const correlationId = response.headers.get('x-correlation-id') ?? undefined;
    let message = 'Request failed';
    try {
      const body = JSON.parse(details) as { error?: unknown; message?: unknown; correlationId?: unknown };
      if (typeof body.error === 'string') message = body.error;
      else if (typeof body.message === 'string') message = body.message;
      if (typeof body.correlationId === 'string') {
        throw new ApiError(message, response.status, endpoint, body.correlationId, details);
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
    }
    throw new ApiError(message, response.status, endpoint, correlationId, details);
  }

  return response.json() as Promise<T>;
}

async function requestBlob(path: string, init: RequestInit = {}) {
  const endpoint = apiPath(path);
  let response: Response;
  try {
    response = await fetch(endpoint, init);
  } catch {
    throw new ApiError('Unable to reach the SALUS API.', 0, endpoint);
  }
  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new ApiError('Export failed', response.status, endpoint, response.headers.get('x-correlation-id') ?? undefined, details);
  }
  return response.blob();
}

function authHeaders(json = false): HeadersInit {
  const token = getAccessToken();
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const apiClient = {
  listConditions: () => requestJson<MedicalConditionRecord[]>('/conditions'),
  listEvidence: (options: EvidenceListOptions = {}) =>
    requestJson<EvidenceListResponse>(`/evidence${evidenceQuery(options)}`, {
      headers: options.includeDrafts ? authHeaders() : undefined,
    }),
  editorStatus: () => requestJson<EditorAuthStatus>('/auth/editor-status', { headers: authHeaders() }),
  createEvidence: (record: EvidenceRecord) =>
    requestJson<EvidenceRecord>('/evidence', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify(record),
    }),
  createCondition: (condition: MedicalConditionRecord) =>
    requestJson<MedicalConditionRecord>('/conditions', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify(condition),
    }),
  transitionEvidence: (evidenceId: string, publicationStatus: Exclude<PublicationStatus, 'under_review'>) =>
    requestJson<EvidenceRecord>(`/evidence/${encodeURIComponent(evidenceId)}/publish`, {
      method: 'PATCH',
      headers: authHeaders(true),
      body: JSON.stringify({ publicationStatus }),
    }),
  evidenceExportUrl: (options: EvidenceListOptions = {}) => apiPath(`/evidence/export.csv${evidenceQuery(options)}`),
  downloadEvidenceCsv: (options: EvidenceListOptions = {}) =>
    requestBlob(`/evidence/export.csv${evidenceQuery(options)}`, { headers: options.includeDrafts ? authHeaders() : undefined }),
};

export function toApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return `${error.message}${error.correlationId ? ` Reference: ${error.correlationId}` : ''}`;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}