import type { ImportedDraftRepository, ImportedEvidenceDraft } from './repository';

export type ImportFailure = {
  kind: 'missing_store';
  message: string;
};

export type ImportResult = {
  source: string;
  ingested: number;
  skipped: number;
  reason?: string;
  failure?: ImportFailure;
};

export async function createImportedDrafts(
  source: string,
  drafts: ImportedEvidenceDraft[],
  repository?: ImportedDraftRepository,
): Promise<ImportResult> {
  if (!repository) {
    return {
      source,
      ingested: 0,
      skipped: drafts.length,
      reason: 'DYNAMODB_TABLE missing',
      failure: {
        kind: 'missing_store',
        message: 'No imported-draft repository was configured',
      },
    };
  }

  let ingested = 0;
  let skipped = 0;
  const seen = new Set<string>();
  for (const draft of drafts) {
    if (seen.has(draft.evidenceId)) {
      skipped += 1;
      continue;
    }
    seen.add(draft.evidenceId);

    const result = await repository.createImportedDraft(draft);
    if (result.created) ingested += 1;
    else skipped += 1;
  }

  return { source, ingested, skipped };
}