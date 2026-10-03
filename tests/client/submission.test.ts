import { describe, expect, it } from 'vitest';
import { emptyEvidenceDraft, prepareEvidenceDraft, validateEvidenceDraft } from '../../src/client/features/submission/model';

describe('evidence submission model', () => {
  it('reports field errors without clearing entered values', () => {
    const draft = { ...emptyEvidenceDraft('2026-09-30'), interventionName: 'Ashwagandha', sourceUrl: 'http://example.test' };
    const before = structuredClone(draft);
    const errors = validateEvidenceDraft(draft);
    expect(errors.conditionId).toBeTruthy();
    expect(errors.sourceUrl).toContain('HTTPS');
    expect(draft).toEqual(before);
  });

  it('forces accepted submissions to immutable draft state', () => {
    const prepared = prepareEvidenceDraft({ ...emptyEvidenceDraft(), publicationStatus: 'published' }, 'ev-new');
    expect(prepared.evidenceId).toBe('ev-new');
    expect(prepared.publicationStatus).toBe('draft');
  });
});