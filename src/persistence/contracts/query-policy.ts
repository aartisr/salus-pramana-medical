import { isPublicEvidence, type TreatmentEvidence } from "../../domain/contracts";
import type { EvidencePage, EvidenceQuery } from ".";

export function normalizeEvidenceQuery(query: EvidenceQuery = {}): Required<Pick<EvidenceQuery, "includeDrafts" | "limit">> & EvidenceQuery & { offset: number } {
  const requestedLimit = Number.isFinite(query.limit) ? Math.trunc(query.limit as number) : 25;
  const limit = Math.max(1, Math.min(100, requestedLimit));
  if (query.cursor !== undefined && !/^\d+$/.test(query.cursor)) throw new RangeError("cursor must be a nonnegative decimal offset");
  return { ...query, includeDrafts: query.includeDrafts ?? false, limit, offset: Number(query.cursor ?? 0) };
}

export function applyEvidenceQuery(rows: TreatmentEvidence[], query: EvidenceQuery = {}): EvidencePage {
  const normalized = normalizeEvidenceQuery(query);
  const needle = normalized.q?.trim().toLowerCase();
  const filtered = rows.filter((row) => {
    if (normalized.conditionId && row.conditionId !== normalized.conditionId) return false;
    if (!normalized.includeDrafts && !isPublicEvidence(row)) return false;
    if (!needle) return true;
    const corpus = [row.evidenceId, row.conditionId, row.medicalSystem, row.interventionName, row.evidenceGrade, row.studyMethodology, row.registryIdentifier, row.clinicalOutcomeSummary, ...(row.activeIngredients ?? []), ...row.contraindications, ...row.interactionWarnings].join(" ").toLowerCase();
    return corpus.includes(needle);
  }).sort((left, right) => {
    const byDate = (right.lastVerifiedDate ?? "").localeCompare(left.lastVerifiedDate ?? "");
    return byDate || left.evidenceId.localeCompare(right.evidenceId);
  });
  const items = filtered.slice(normalized.offset, normalized.offset + normalized.limit).map((row) => structuredClone(row));
  const nextOffset = normalized.offset + items.length;
  return { items, total: filtered.length, cursor: normalized.offset, nextCursor: nextOffset < filtered.length ? String(nextOffset) : null, query: { ...query, includeDrafts: normalized.includeDrafts, limit: normalized.limit, cursor: String(normalized.offset) } };
}