import type { TreatmentEvidence } from "@evidence-platform/domain";

export type EvidenceInput = Omit<TreatmentEvidence, "publicationStatus" | "contraindications" | "interactionWarnings" | "lastVerifiedDate"> & {
  publicationStatus?: TreatmentEvidence["publicationStatus"];
  contraindications?: string[];
  interactionWarnings?: string[];
  lastVerifiedDate?: string;
};

export function normalizeEvidence(input: EvidenceInput): TreatmentEvidence {
  return {
    ...input,
    publicationStatus: input.publicationStatus ?? "draft",
    contraindications: input.contraindications ?? [],
    interactionWarnings: input.interactionWarnings ?? [],
    lastVerifiedDate: input.lastVerifiedDate ?? new Date().toISOString().slice(0, 10),
  };
}
