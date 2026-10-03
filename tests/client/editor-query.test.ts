import { describe, expect, it } from 'vitest';
import { applyEditorFilters, nextCursorHistory, previousCursorHistory, transitionNeedsConfirmation } from '../../src/client/features/editor/model';

describe('editor workflow model', () => {
  it('applies trimmed filters only when explicitly projected', () => {
    expect(applyEditorFilters({ conditionId: 'cond-1', query: '  trial  ', includeDrafts: true })).toEqual({
      conditionId: 'cond-1', q: 'trial', includeDrafts: true, limit: 10,
    });
  });

  it('retains a reversible cursor history', () => {
    const next = nextCursorHistory([], undefined, '10');
    expect(next).toEqual({ history: ['0'], cursor: '10' });
    expect(previousCursorHistory(next.history)).toEqual({ history: [], cursor: undefined });
  });

  it('requires confirmation only for consequential transitions', () => {
    expect(transitionNeedsConfirmation('published')).toBe(true);
    expect(transitionNeedsConfirmation('rejected')).toBe(true);
    expect(transitionNeedsConfirmation('draft')).toBe(false);
  });
});