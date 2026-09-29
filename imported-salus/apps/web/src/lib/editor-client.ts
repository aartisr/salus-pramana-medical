import type { TreatmentEvidence } from "@evidence-platform/domain";
import { getAccessToken } from "./auth";
import { fetchJson } from "./api-error";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

export async function publishEvidence(
  evidenceId: string,
  publicationStatus: "draft" | "published" | "rejected",
): Promise<TreatmentEvidence> {
  const token = getAccessToken();

  return fetchJson<TreatmentEvidence>(`${API_BASE_URL}/evidence/${encodeURIComponent(evidenceId)}/publish`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ publicationStatus }),
  });
}
