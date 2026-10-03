/**
 * Service to export search results and clinical evidence to structured CSV and JSON
 * Supports offline academic analysis with full confidence intervals and registry provenance.
 */

import { TreatmentEvidence, MedicalCondition } from '../types/salus';

export interface ExportableEvidenceRow {
  conditionName: string;
  icd11Code: string;
  conditionCategory: string;
  interventionName: string;
  medicalSystem: string;
  evidenceGrade: string;
  sampleSize: number;
  effectSizeCohenD: number;
  standardError: number;
  confidenceInterval95Lower: number;
  confidenceInterval95Upper: number;
  confidenceInterval95Formatted: string;
  pValueOfOutcome: number;
  riskOfBias: string;
  registryIdentifier: string;
  sourceUrl: string;
  studyMethodology: string;
  primaryBiomarkerEndpoint: string;
  activeIngredients: string;
  publishedYear: number;
  lastVerifiedDate: string;
  clinicalOutcomeSummary: string;
}

/**
 * Builds flattened rows from search results
 */
export function buildExportableRows(
  treatments: TreatmentEvidence[],
  conditions: MedicalCondition[]
): ExportableEvidenceRow[] {
  const conditionMap = new Map<string, MedicalCondition>();
  conditions.forEach((c) => conditionMap.set(c.conditionId, c));

  return treatments.map((t) => {
    const cond = conditionMap.get(t.conditionId);
    const effect = t.effectSizeCohenD ?? 0;
    const se = t.standardError ?? 0.05;
    const ciLower = t.confidenceInterval95 ? t.confidenceInterval95[0] : +(effect - 1.96 * se).toFixed(3);
    const ciUpper = t.confidenceInterval95 ? t.confidenceInterval95[1] : +(effect + 1.96 * se).toFixed(3);

    return {
      conditionName: cond ? cond.standardName : 'Cross-Disciplinary Protocol',
      icd11Code: cond ? cond.icd11Code : 'N/A',
      conditionCategory: cond ? cond.category : 'General Integrative Medicine',
      interventionName: t.interventionName,
      medicalSystem: t.medicalSystem,
      evidenceGrade: t.evidenceGrade,
      sampleSize: t.sampleSize,
      effectSizeCohenD: effect,
      standardError: se,
      confidenceInterval95Lower: ciLower,
      confidenceInterval95Upper: ciUpper,
      confidenceInterval95Formatted: `[${ciLower.toFixed(2)}, ${ciUpper.toFixed(2)}]`,
      pValueOfOutcome: t.pValueOfOutcome,
      riskOfBias: t.riskOfBias,
      registryIdentifier: t.registryIdentifier,
      sourceUrl: t.sourceUrl,
      studyMethodology: t.studyMethodology,
      primaryBiomarkerEndpoint: t.primaryBiomarkerEndpoint || 'Not specified',
      activeIngredients: (t.activeIngredients || []).join('; '),
      publishedYear: t.publishedYear,
      lastVerifiedDate: t.lastVerifiedDate,
      clinicalOutcomeSummary: t.clinicalOutcomeSummary.replace(/"/g, '""'),
    };
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export matching evidence to CSV
 */
export function exportEvidenceToCSV(
  treatments: TreatmentEvidence[],
  conditions: MedicalCondition[],
  query: string
): void {
  const rows = buildExportableRows(treatments, conditions);

  const headers = [
    'Condition Name',
    'ICD-11 Code',
    'Category',
    'Intervention Name',
    'Medical System',
    'Evidence Grade',
    'Sample Size (N)',
    'Cohen d (Effect Size)',
    'Standard Error (SE)',
    '95% CI Lower',
    '95% CI Upper',
    '95% CI Formatted',
    'P-Value',
    'Risk of Bias',
    'Registry Identifier',
    'Registry URL',
    'Study Methodology',
    'Primary Biomarker Endpoint',
    'Active Phytochemicals / Compounds',
    'Published Year',
    'Last Verified Date',
    'Clinical Outcome Summary',
  ];

  const csvRows: string[] = [];
  csvRows.push(headers.map((h) => `"${h}"`).join(','));

  rows.forEach((r) => {
    const values = [
      `"${r.conditionName}"`,
      `"${r.icd11Code}"`,
      `"${r.conditionCategory}"`,
      `"${r.interventionName.replace(/"/g, '""')}"`,
      `"${r.medicalSystem}"`,
      `"${r.evidenceGrade}"`,
      r.sampleSize,
      r.effectSizeCohenD,
      r.standardError,
      r.confidenceInterval95Lower,
      r.confidenceInterval95Upper,
      `"${r.confidenceInterval95Formatted}"`,
      r.pValueOfOutcome,
      `"${r.riskOfBias}"`,
      `"${r.registryIdentifier}"`,
      `"${r.sourceUrl}"`,
      `"${r.studyMethodology.replace(/"/g, '""')}"`,
      `"${r.primaryBiomarkerEndpoint.replace(/"/g, '""')}"`,
      `"${r.activeIngredients.replace(/"/g, '""')}"`,
      r.publishedYear,
      `"${r.lastVerifiedDate}"`,
      `"${r.clinicalOutcomeSummary}"`,
    ];
    csvRows.push(values.join(','));
  });

  const csvContent = '\uFEFF' + csvRows.join('\r\n'); // Add UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const sanitizedQuery = (query || 'all-evidence').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const dateStr = new Date().toISOString().split('T')[0];
  triggerDownload(blob, `salus_evidence_${sanitizedQuery}_${dateStr}.csv`);
}

/**
 * Export matching evidence to JSON
 */
export function exportEvidenceToJSON(
  treatments: TreatmentEvidence[],
  conditions: MedicalCondition[],
  query: string
): void {
  const rows = buildExportableRows(treatments, conditions);

  const payload = {
    repository: 'SALUS Pramana Medical Evidence Commons',
    author: 'Aarti S Ravikumar (https://ai-aarti.com)',
    exportTimestamp: new Date().toISOString(),
    filterQuery: query || 'all',
    totalRecords: rows.length,
    license: 'Apache 2.0 Open Source',
    evidenceRecords: rows,
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const sanitizedQuery = (query || 'all-evidence').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const dateStr = new Date().toISOString().split('T')[0];
  triggerDownload(blob, `salus_evidence_${sanitizedQuery}_${dateStr}.json`);
}
