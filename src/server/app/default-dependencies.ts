import { randomUUID } from 'node:crypto';
import {
  calculateDoseCandidates,
  computeConditionIntelligence,
  computeConditionValidationGates,
  simulateInteractionDynamics,
  simulateSingleInterventionTrajectory,
} from '../../domain';
import type { AuditRecord, TreatmentEvidence as DomainEvidence } from '../../domain';
import { MemoryClinicalRepository, RepositoryError } from '../../persistence';
import type { AuditInput, IntelligenceServices, ServerRepositories, TreatmentEvidence } from './create-app';

function auditRecord(input: AuditInput, now: () => Date): AuditRecord {
  const timestamp = now();
  return { auditId: randomUUID(), ...input, timestamp: timestamp.toISOString(), ttl: Math.floor(timestamp.getTime() / 1000) + 90 * 24 * 60 * 60 };
}

export function createDefaultRepositories(now: () => Date): ServerRepositories {
  const repository = MemoryClinicalRepository.seeded();
  return {
    async listConditions() { return repository.listConditions(); },
    async getCondition(conditionId) { return (await repository.getCondition(conditionId)) ?? undefined; },
    async createCondition(condition, audit) { return repository.createConditionWithAudit(condition as never, auditRecord(audit, now)); },
    async listEvidence(conditionId, includeDrafts) { return (await repository.listEvidence({ conditionId, includeDrafts, limit: 100 })).items; },
    async createEvidence(evidence, audit) {
      try { return await repository.createEvidenceDraftWithAudit(evidence as never, auditRecord(audit, now)); }
      catch (error) { if (error instanceof RepositoryError && error.code === 'conflict') return undefined; throw error; }
    },
    async updateEvidencePublicationStatus(evidenceId, status, audit) {
      try { return await repository.transitionPublicationWithAudit(evidenceId, status, auditRecord(audit, now)); }
      catch (error) { if (error instanceof RepositoryError && error.code === 'not-found') return undefined; throw error; }
    },
  };
}

export function createDefaultIntelligence(now: () => Date): IntelligenceServices {
  return {
    computeCondition: (conditionId, rows, mode) => computeConditionIntelligence(conditionId, rows as DomainEvidence[], mode, now()),
    computeEvidence: (evidenceId, rows, mode) => {
      const evidence = rows.find((row) => row.evidenceId === evidenceId);
      if (!evidence) return null;
      const condition = computeConditionIntelligence(evidence.conditionId, rows as DomainEvidence[], mode, now());
      return { modelVersion: condition.modelVersion, generatedAt: condition.generatedAt, conditionId: evidence.conditionId, mode, conditionDecision: condition.decision, conditionPramanaScore: condition.conditionPramanaScore, evidence: condition.contributions.find((row) => row.evidenceId === evidenceId) ?? null };
    },
    computeGates: (conditionId, rows, intelligence) => computeConditionValidationGates(conditionId, rows as DomainEvidence[], intelligence as never, now()),
    simulateInteraction: (interventionA, interventionB, hasWarning, _sampleSizeA, _sampleSizeB, hours) => simulateInteractionDynamics(interventionA, interventionB, { hasKnownInteraction: hasWarning, hoursToSimulate: hours, interactionStrength: 0.35 }),
    simulateTrajectory: (evidence, hours) => simulateSingleInterventionTrajectory(evidence.interventionName, evidence.isPharmacological, evidence.studyMethodology, evidence.sampleSize ?? 100, hours),
    optimizeDose: (evidence: TreatmentEvidence) => {
      const recommendations = calculateDoseCandidates(evidence.interventionName);
      const optimizedDoseIndex = recommendations.reduce((best, row, index) => row.utilityScore > recommendations[best].utilityScore ? index : best, 0);
      return { conditionId: evidence.conditionId, interventionName: evidence.interventionName, generatedAt: now().toISOString(), recommendations, optimizedDoseIndex };
    },
  };
}