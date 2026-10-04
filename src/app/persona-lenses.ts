import type { PersonaMode } from '../types/salus';

export type LensImplementationStatus = 'implemented' | 'next' | 'planned';

export interface PersonaLensDefinition {
  id: PersonaMode;
  label: string;
  shortLabel: string;
  purpose: string;
  status: LensImplementationStatus;
}

/**
 * A lens changes presentation and task order, never the underlying evidence,
 * scores, confidence intervals, or safety gates.
 */
export const personaLenses: readonly PersonaLensDefinition[] = [
  {
    id: 'patient',
    label: 'Patient & Family Advocate',
    shortLabel: 'Patient view',
    purpose: 'Plain-language evidence summaries and safety-first next steps, with advanced model controls on demand.',
    status: 'implemented',
  },
  {
    id: 'clinician',
    label: 'Attending Physician / Vaidya',
    shortLabel: 'Clinical view',
    purpose: 'Point-of-care safety, contraindications, monitoring, and evidence provenance.',
    status: 'implemented',
  },
  {
    id: 'researcher',
    label: 'Principal Investigator',
    shortLabel: 'Research view',
    purpose: 'Methods, uncertainty, decomposition, reproducibility, and source inspection.',
    status: 'implemented',
  },
  {
    id: 'policy_maker',
    label: 'WHO / Health Ministry',
    shortLabel: 'Policy view',
    purpose: 'Population burden, equity, cost assumptions, and deployment scenarios.',
    status: 'implemented',
  },
  {
    id: 'nobel_juror',
    label: 'Independent Science Auditor / Juror',
    shortLabel: 'Audit view',
    purpose: 'Traceability, governance gates, claims, limitations, and audit artifacts.',
    status: 'implemented',
  },
];

export function getPersonaLens(persona: PersonaMode): PersonaLensDefinition {
  return personaLenses.find((lens) => lens.id === persona) ?? personaLenses[0];
}
