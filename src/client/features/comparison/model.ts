import type { EvidenceRecord } from '../../services/contracts';

export type ComparisonPersona = 'Patient' | 'Clinician' | 'Researcher';

export interface RankedEvidence {
  evidence: EvidenceRecord;
  confidence: number;
  benefit: number;
  risk: number;
  freshness: 'Fresh' | 'Recent' | 'Aging';
  rankReason: string;
}

const gradeConfidence = { A: 88, B: 72, C: 54 } as const;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.max(minimum, Math.min(maximum, value));

export function rankEvidence(rows: EvidenceRecord[], currentYear = new Date().getFullYear()): RankedEvidence[] {
  const counts = rows.reduce<Record<string, number>>((result, row) => {
    result[row.interventionName] = (result[row.interventionName] ?? 0) + 1;
    return result;
  }, {});

  return rows.map((evidence) => {
    const verifiedYear = Number.parseInt(evidence.lastVerifiedDate?.slice(0, 4) ?? '', 10);
    const age = Number.isNaN(verifiedYear) ? 4 : Math.max(0, currentYear - verifiedYear);
    const confidence = clamp(Math.round(
      gradeConfidence[evidence.evidenceGrade]
      + Math.log10((evidence.sampleSize ?? 0) + 1) * 8
      + (counts[evidence.interventionName] - 1) * 3
      - age * 2.8,
    ), 20, 99);
    const risk = clamp(12 + evidence.contraindications.length * 10 + evidence.interactionWarnings.length * 14, 8, 95);
    const benefit = clamp(Math.round(
      confidence - (evidence.evidenceGrade === 'C' ? 8 : 0) + ((evidence.sampleSize ?? 0) > 150 ? 6 : 0),
    ), 10, 98);
    const freshness = age <= 2 ? 'Fresh' : age <= 5 ? 'Recent' : 'Aging';
    return {
      evidence,
      confidence,
      benefit,
      risk,
      freshness,
      rankReason: `Grade ${evidence.evidenceGrade}, ${freshness.toLowerCase()} verification, sample ${evidence.sampleSize ?? 0}, replication ${counts[evidence.interventionName]}.`,
    } satisfies RankedEvidence;
  }).sort((left, right) => right.confidence - left.confidence || left.evidence.interventionName.localeCompare(right.evidence.interventionName));
}

export function comparisonSummary(top: RankedEvidence | undefined, persona: ComparisonPersona) {
  if (!top) return 'No evidence records are available for this condition.';
  const signal = `${top.evidence.interventionName} leads with confidence ${top.confidence}/100 and Grade ${top.evidence.evidenceGrade} evidence.`;
  if (persona === 'Patient') return `${signal} Review safety details with your care team.`;
  if (persona === 'Clinician') return `${signal} Methodology: ${top.evidence.studyMethodology}.`;
  return `${signal} Inspect source-level methodology and uncertainty before interpretation.`;
}

function csvCell(value: unknown) {
  const text = Array.isArray(value) ? value.join(' | ') : String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function comparisonCsv(rows: RankedEvidence[], conditionId: string, persona: ComparisonPersona) {
  const header = ['conditionId', 'personaLens', 'rank', 'interventionName', 'medicalSystem', 'evidenceGrade', 'confidence', 'benefit', 'risk', 'freshness', 'registryIdentifier', 'sourceUrl'];
  return [header, ...rows.map((row, index) => [
    conditionId,
    persona,
    index + 1,
    row.evidence.interventionName,
    row.evidence.medicalSystem,
    row.evidence.evidenceGrade,
    row.confidence,
    row.benefit,
    row.risk,
    row.freshness,
    row.evidence.registryIdentifier,
    row.evidence.sourceUrl,
  ])].map((line) => line.map(csvCell).join(',')).join('\n');
}