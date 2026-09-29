import type { MedicalCondition, TreatmentEvidence } from "@evidence-platform/domain";
import { getAccessToken } from "./auth";
import { ApiError, fetchJson } from "./api-error";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

export type ListEvidenceOptions = {
  conditionId?: string;
  includeDrafts?: boolean;
  q?: string;
  limit?: number;
  cursor?: string;
};

export type EvidenceListResponse = {
  metadata: {
    causalEquivalencyDisclaimer: boolean;
    message: string;
    pagination?: {
      limit: number;
      cursor: number;
      nextCursor: string | null;
      totalCount: number;
      returnedCount: number;
    };
    query?: {
      conditionId: string | null;
      includeDrafts: boolean;
      q: string | null;
    };
  };
  rows: TreatmentEvidence[];
};

export type EditorAuthStatus = {
  authenticated: boolean;
  actorEmail: string;
  groups: string[];
  isEditor: boolean;
};

function buildEvidenceQueryString(options: ListEvidenceOptions) {
  const params = new URLSearchParams();

  if (options.conditionId) {
    params.set("conditionId", options.conditionId);
  }
  if (options.includeDrafts) {
    params.set("includeDrafts", "true");
  }
  if (options.q) {
    params.set("q", options.q);
  }
  if (typeof options.limit === "number") {
    params.set("limit", String(options.limit));
  }
  if (options.cursor) {
    params.set("cursor", options.cursor);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listConditions(): Promise<MedicalCondition[]> {
  return fetchJson<MedicalCondition[]>(`${API_BASE_URL}/conditions`);
}

export async function listEvidence(conditionIdOrOptions?: string | ListEvidenceOptions): Promise<TreatmentEvidence[]> {
  const data = await listEvidencePage(conditionIdOrOptions);
  return data.rows ?? [];
}

export async function listEvidencePage(conditionIdOrOptions?: string | ListEvidenceOptions): Promise<EvidenceListResponse> {
  const options: ListEvidenceOptions =
    typeof conditionIdOrOptions === "string" ? { conditionId: conditionIdOrOptions } : (conditionIdOrOptions ?? {});
  const query = buildEvidenceQueryString(options);

  const token = options.includeDrafts ? getAccessToken() : null;
  return fetchJson<EvidenceListResponse>(`${API_BASE_URL}/evidence${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export function evidenceCsvExportUrl(options: ListEvidenceOptions = {}) {
  const query = buildEvidenceQueryString(options);
  return `${API_BASE_URL}/evidence/export.csv${query}`;
}

export async function getEditorAuthStatus(bearerToken?: string): Promise<EditorAuthStatus> {
  const token = bearerToken || getAccessToken();
  return fetchJson<EditorAuthStatus>(`${API_BASE_URL}/auth/editor-status`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function createEvidence(payload: TreatmentEvidence): Promise<TreatmentEvidence> {
  const token = getAccessToken();
  try {
    return await fetchJson<TreatmentEvidence>(`${API_BASE_URL}/evidence`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const correlationSuffix = error.correlationId ? ` [ref:${error.correlationId}]` : "";
      throw new Error(`Failed to create evidence: ${error.details || error.message}${correlationSuffix}`);
    }
    throw error;
  }
}

export async function createCondition(payload: MedicalCondition, bearerToken?: string): Promise<MedicalCondition> {
  const token = bearerToken || getAccessToken();
  return fetchJson<MedicalCondition>(`${API_BASE_URL}/conditions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
}
