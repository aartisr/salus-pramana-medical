import type { AuditRecord } from "../domain/contracts";

export interface AuditContext {
  actorEmail: string;
  ipAddress?: string;
}

export interface AuditFactoryDependencies {
  now(): Date;
  createId(): string;
}

export function createAuditRecord(action: string, targetEvidenceId: string, context: AuditContext, dependencies: AuditFactoryDependencies): AuditRecord {
  const now = dependencies.now();
  return {
    auditId: dependencies.createId(),
    action,
    actorEmail: context.actorEmail,
    targetEvidenceId,
    timestamp: now.toISOString(),
    ipAddress: context.ipAddress,
    ttl: Math.floor(now.getTime() / 1000) + 90 * 24 * 60 * 60,
  };
}