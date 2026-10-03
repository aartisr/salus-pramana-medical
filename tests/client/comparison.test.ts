import { describe, expect, it } from 'vitest';
import { comparisonCsv, comparisonSummary, rankEvidence } from '../../src/client/features/comparison/model';
import type { EvidenceRecord } from '../../src/client/services/contracts';

const evidence = (overrides: Partial<EvidenceRecord>): EvidenceRecord => ({
  evidenceId: 'ev-1', conditionId: 'cond-1', medicalSystem: 'Allopathy', interventionName: 'Alpha',
  isPharmacological: true, evidenceGrade: 'A', studyMethodology: 'Randomized trial', sampleSize: 200,
  registryIdentifier: 'PMID-1', sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/1', clinicalOutcomeSummary: 'Improved outcomes.',
  contraindications: [], interactionWarnings: [], lastVerifiedDate: '2025-01-01', ...overrides,
});

describe('ranked comparison', () => {
  it('ranks by evidence confidence independently of persona framing', () => {
    const ranked = rankEvidence([
      evidence({ evidenceId: 'weak', interventionName: 'Weak', evidenceGrade: 'C', sampleSize: 12, lastVerifiedDate: '2018-01-01' }),
      evidence({ evidenceId: 'strong', interventionName: 'Strong' }),
    ], 2026);
    expect(ranked.map((row) => row.evidence.evidenceId)).toEqual(['strong', 'weak']);
    expect(comparisonSummary(ranked[0], 'Patient')).toContain('Strong');
    expect(comparisonSummary(ranked[0], 'Researcher')).toContain(`${ranked[0].confidence}/100`);
  });

  it('exports active condition, lens, ranking, and citations as escaped CSV', () => {
    const csv = comparisonCsv(rankEvidence([evidence({ interventionName: 'Alpha, Extended' })], 2026), 'cond-1', 'Clinician');
    expect(csv).toContain('conditionId,personaLens,rank');
    expect(csv).toContain('cond-1,Clinician,1,"Alpha, Extended"');
    expect(csv).toContain('https://pubmed.ncbi.nlm.nih.gov/1');
  });
});