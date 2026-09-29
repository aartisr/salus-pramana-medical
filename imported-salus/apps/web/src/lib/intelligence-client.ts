import {
  type ConditionIntelligence,
  type ConditionValidationGates,
  type DoseResponseOptimization,
  type InteractionIntelligence,
  type TrajectoryIntelligence,
} from "./intelligence-types";
import { fetchJson } from "./api-error";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

export async function getConditionIntelligence(conditionId: string, mode: "public" | "clinician" = "public") {
  const params = new URLSearchParams({ mode });
  const endpoint = `${API_BASE_URL}/intelligence/condition/${encodeURIComponent(conditionId)}?${params.toString()}`;
  return fetchJson<ConditionIntelligence>(endpoint);
}

export async function getInteractionTimeline(
  conditionId: string,
  interventionA: string,
  interventionB: string,
  hours: number = 48,
) {
  const params = new URLSearchParams({
    interventionA,
    interventionB,
    hours: String(Math.min(168, Math.max(6, hours))),
  });

  const endpoint = `${API_BASE_URL}/intelligence/interaction/${encodeURIComponent(conditionId)}?${params.toString()}`;
  return fetchJson<InteractionIntelligence>(endpoint);
}

export async function getSingleInterventionTrajectory(evidenceId: string, hours: number = 72) {
  const params = new URLSearchParams({
    hours: String(Math.min(168, Math.max(6, hours))),
  });
  const endpoint = `${API_BASE_URL}/intelligence/trajectory/${encodeURIComponent(evidenceId)}?${params.toString()}`;
  return fetchJson<TrajectoryIntelligence>(endpoint);
}

export async function getDoseResponseOptimization(evidenceId: string) {
  const endpoint = `${API_BASE_URL}/intelligence/dose-optimizer/${encodeURIComponent(evidenceId)}`;
  return fetchJson<DoseResponseOptimization>(endpoint);
}

export async function getConditionValidationGates(conditionId: string, mode: "public" | "clinician" = "public") {
  const params = new URLSearchParams({ mode });
  const endpoint = `${API_BASE_URL}/intelligence/gates/${encodeURIComponent(conditionId)}?${params.toString()}`;
  return fetchJson<ConditionValidationGates>(endpoint);
}
