import { evidenceSubmissionSchema, medicalConditionSchema, publicationTransitionSchema, type MedicalCondition, type TreatmentEvidence } from "../domain/contracts";
import type { AtomicMutationRepository } from "../persistence/contracts";
import { createAuditRecord, type AuditContext, type AuditFactoryDependencies } from "./audit";
import { ApplicationError } from "./errors";

export interface CommandActor extends AuditContext {
  authenticated: boolean;
  isEditor: boolean;
}

export class ClinicalCommands {
  constructor(private readonly repository: AtomicMutationRepository, private readonly auditDependencies: AuditFactoryDependencies) {}

  async createCondition(input: unknown, actor: CommandActor): Promise<MedicalCondition> {
    this.requireEditor(actor);
    const condition = this.validate(() => medicalConditionSchema.parse(input));
    return this.repository.createConditionWithAudit(condition, createAuditRecord("condition.create", condition.conditionId, actor, this.auditDependencies));
  }

  async updateCondition(conditionId: string, input: unknown, actor: CommandActor): Promise<MedicalCondition> {
    this.requireEditor(actor);
    const condition = this.validate(() => medicalConditionSchema.parse({ ...(input as object), conditionId }));
    const { conditionId: ignored, ...changes } = condition;
    void ignored;
    return this.repository.updateConditionWithAudit(conditionId, changes, createAuditRecord("condition.update", conditionId, actor, this.auditDependencies));
  }

  async submitEvidence(input: unknown, actor: CommandActor): Promise<TreatmentEvidence> {
    this.requireAuthenticated(actor);
    const evidence = this.validate(() => evidenceSubmissionSchema.parse(input)) as TreatmentEvidence;
    return this.repository.createEvidenceDraftWithAudit(evidence, createAuditRecord("evidence.create", evidence.evidenceId, actor, this.auditDependencies));
  }

  async transitionPublication(evidenceId: string, input: unknown, actor: CommandActor): Promise<TreatmentEvidence> {
    this.requireEditor(actor);
    const status = this.validate(() => publicationTransitionSchema.parse(input));
    return this.repository.transitionPublicationWithAudit(evidenceId, status, createAuditRecord(`evidence.${status}`, evidenceId, actor, this.auditDependencies));
  }

  private requireAuthenticated(actor: CommandActor) {
    if (!actor.authenticated) throw new ApplicationError("unauthorized", "Authentication is required");
  }

  private requireEditor(actor: CommandActor) {
    this.requireAuthenticated(actor);
    if (!actor.isEditor) throw new ApplicationError("forbidden", "Evidence editor permission is required");
  }

  private validate<T>(operation: () => T): T {
    try { return operation(); }
    catch (error) { throw new ApplicationError("validation", error instanceof Error ? error.message : "Invalid input", error); }
  }
}