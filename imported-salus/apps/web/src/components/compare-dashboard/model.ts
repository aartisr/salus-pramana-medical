import type { TreatmentEvidence } from "@evidence-platform/domain";

export type PersonaMode = "Patient" | "Clinician" | "Researcher";

export type RankedEvidence = {
  evidence: TreatmentEvidence;
  confidence: number;
  benefit: number;
  risk: number;
  freshness: "Fresh" | "Recent" | "Aging";
  rankReason: string;
};

export function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export const ACCENT_CLASS_BY_SYSTEM: Record<TreatmentEvidence["medicalSystem"], string> = {
  Allopathy: "accent-allopathy",
  Ayurveda: "accent-ayurveda",
  Siddha: "accent-siddha",
  Naturopathy: "accent-naturopathy",
};

export const GOALS = [
  "Reduce symptom burden",
  "Prevent progression",
  "Improve quality of life",
  "Reduce side effects",
  "Support long-term maintenance",
] as const;

export const PERSONAS: PersonaMode[] = ["Patient", "Clinician", "Researcher"];

export const PERSONA_DETAILS: Record<PersonaMode, { badge: string; subtitle: string; hint: string }> = {
  Patient: {
    badge: "PT",
    subtitle: "Simple, practical guidance",
    hint: "Emphasizes clarity, daily impact, and safety first.",
  },
  Clinician: {
    badge: "CL",
    subtitle: "Decision-ready clinical context",
    hint: "Emphasizes methodology, confidence, and risk stratification.",
  },
  Researcher: {
    badge: "RS",
    subtitle: "Evidence depth and trend signals",
    hint: "Emphasizes source quality, recency, and uncertainty patterns.",
  },
};

const gradeToBaseConfidence: Record<TreatmentEvidence["evidenceGrade"], number> = {
  A: 88,
  B: 72,
  C: 54,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function yearsSince(isoDate?: string) {
  if (!isoDate) return 4;
  const year = Number.parseInt(isoDate.slice(0, 4), 10);
  if (Number.isNaN(year)) return 4;
  return Math.max(0, new Date().getFullYear() - year);
}

function getFreshness(age: number): RankedEvidence["freshness"] {
  if (age <= 2) return "Fresh";
  if (age <= 5) return "Recent";
  return "Aging";
}

export function buildRankedEvidence(rows: TreatmentEvidence[]): RankedEvidence[] {
  const interventionCounts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.interventionName] = (acc[row.interventionName] ?? 0) + 1;
    return acc;
  }, {});

  return rows
    .map((row) => {
      const age = yearsSince(row.lastVerifiedDate);
      const base = gradeToBaseConfidence[row.evidenceGrade];
      const sampleBonus = Math.log10((row.sampleSize ?? 0) + 1) * 8;
      const recencyPenalty = age * 2.8;
      const replicationBonus = (interventionCounts[row.interventionName] - 1) * 3;

      const confidence = clamp(Math.round(base + sampleBonus + replicationBonus - recencyPenalty), 20, 99);
      const risk = clamp(
        12 + row.contraindications.length * 10 + row.interactionWarnings.length * 14,
        8,
        95,
      );
      const benefit = clamp(
        Math.round(confidence - (row.evidenceGrade === "C" ? 8 : 0) + (row.sampleSize && row.sampleSize > 150 ? 6 : 0)),
        10,
        98,
      );

      const freshness = getFreshness(age);
      const rankReason = `Grade ${row.evidenceGrade}, ${freshness.toLowerCase()} verification, sample ${row.sampleSize ?? 0}, replication ${interventionCounts[row.interventionName]}.`;

      return {
        evidence: row,
        confidence,
        benefit,
        risk,
        freshness,
        rankReason,
      } satisfies RankedEvidence;
    })
    .sort((a, b) => b.confidence - a.confidence);
}

export function buildSummaryText(top: RankedEvidence | undefined, goal: string, persona: PersonaMode) {
  if (!top) {
    return "No evidence records are currently available for this condition. You can add verifiable evidence to improve coverage.";
  }

  if (persona === "Patient") {
    return `${top.evidence.interventionName} currently has the strongest confidence signal for the goal '${goal.toLowerCase()}', with confidence ${top.confidence}/100 and grade ${top.evidence.evidenceGrade}.`;
  }

  if (persona === "Clinician") {
    return `${top.evidence.interventionName} ranks highest for '${goal.toLowerCase()}' with confidence ${top.confidence}/100, grade ${top.evidence.evidenceGrade}, and methodology '${top.evidence.studyMethodology}'.`;
  }

  return `${top.evidence.interventionName} leads by aggregated confidence ${top.confidence}/100. Inspect timeline, risk, and source-level methodology before final interpretation.`;
}
