import { computeConditionIntelligence, computeConditionValidationGates, type ConditionIntelligence, type ConditionValidationGates, type DecisionMode } from "../domain/clinical";
import type { EvidenceRepository } from "../persistence/contracts";
import { ApplicationError } from "./errors";

export interface QueryAuthorization { isEditor: boolean }
export interface ConditionIntelligenceRequest { conditionId: string; mode?: DecisionMode; includeDrafts?: boolean; strictGates?: boolean; asOf?: Date }
export interface GovernedConditionIntelligence { intelligence: ConditionIntelligence; governance: ConditionValidationGates }

export class ClinicalQueries {
  constructor(private readonly evidenceRepository: EvidenceRepository) {}

  async conditionIntelligence(request: ConditionIntelligenceRequest, authorization: QueryAuthorization): Promise<GovernedConditionIntelligence> {
    if (request.includeDrafts && !authorization.isEditor) throw new ApplicationError("forbidden", "Draft evidence requires editor permission");
    const asOf = request.asOf ?? new Date();
    const snapshot = (await this.evidenceRepository.listEvidence({ conditionId: request.conditionId, includeDrafts: request.includeDrafts, limit: 100 })).items;
    const intelligence = computeConditionIntelligence(request.conditionId, snapshot, request.mode ?? "public", asOf);
    const governance = computeConditionValidationGates(request.conditionId, snapshot, intelligence, asOf);
    return {
      intelligence: request.strictGates && intelligence.decision === "RECOMMEND" && !governance.goNoGo
        ? { ...intelligence, decision: "INSUFFICIENT_EVIDENCE" }
        : intelligence,
      governance,
    };
  }
}

export interface AiExplanation { content: string; source: string }
export type ExplainedDecision = GovernedConditionIntelligence & { ai: AiExplanation };

export function attachAiExplanation(deterministic: GovernedConditionIntelligence, explanation: AiExplanation): ExplainedDecision {
  return { ...structuredClone(deterministic), ai: { content: explanation.content, source: explanation.source } };
}