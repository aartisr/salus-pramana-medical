import type { EvidenceListOptions, PublicationStatus } from '../../services/contracts';

export interface EditorFilterDraft {
  conditionId: string;
  query: string;
  includeDrafts: boolean;
}

export function applyEditorFilters(filters: EditorFilterDraft): EvidenceListOptions {
  return {
    conditionId: filters.conditionId || undefined,
    q: filters.query.trim() || undefined,
    includeDrafts: filters.includeDrafts,
    limit: 10,
  };
}

export function nextCursorHistory(history: string[], current: string | undefined, next: string | null | undefined) {
  if (!next) return { history, cursor: current };
  return { history: [...history, current ?? '0'], cursor: next };
}

export function previousCursorHistory(history: string[]) {
  if (!history.length) return { history, cursor: undefined };
  const previous = history.at(-1);
  return { history: history.slice(0, -1), cursor: previous === '0' ? undefined : previous };
}

export function transitionNeedsConfirmation(status: Exclude<PublicationStatus, 'under_review'>) {
  return status === 'published' || status === 'rejected';
}