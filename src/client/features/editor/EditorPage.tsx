import { useEffect, useState } from 'react';
import { apiClient, toApiErrorMessage } from '../../services/api-client';
import { authSnapshot, beginLogin } from '../../services/auth/session';
import type { EditorAuthStatus, EvidenceListOptions, EvidenceListResponse, MedicalConditionRecord, PublicationStatus } from '../../services/contracts';
import { applyEditorFilters, nextCursorHistory, previousCursorHistory, transitionNeedsConfirmation, type EditorFilterDraft } from './model';

const initialFilters: EditorFilterDraft = { conditionId: '', query: '', includeDrafts: true };
const emptyCondition: MedicalConditionRecord = { conditionId: '', icd11Code: '', standardName: '', ayurvedicEquivalent: '', siddhaEquivalent: '', pathophysiologySummary: '' };

function downloadCsv(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'salus-evidence-export.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function EditorPage() {
  const [auth, setAuth] = useState<EditorAuthStatus | null>(null);
  const [authError, setAuthError] = useState('');
  const [conditions, setConditions] = useState<MedicalConditionRecord[]>([]);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<EvidenceListOptions>(() => applyEditorFilters(initialFilters));
  const [cursor, setCursor] = useState<string>();
  const [history, setHistory] = useState<string[]>([]);
  const [page, setPage] = useState<EvidenceListResponse | null>(null);
  const [condition, setCondition] = useState(emptyCondition);
  const [message, setMessage] = useState('');
  const [pendingId, setPendingId] = useState('');

  const loadPage = (options = appliedFilters, nextCursor = cursor) => apiClient.listEvidence({ ...options, cursor: nextCursor }).then(setPage).catch((error: unknown) => setMessage(toApiErrorMessage(error, 'Editorial evidence could not be loaded.')));
  useEffect(() => {
    if (authSnapshot().configured) apiClient.editorStatus().then(setAuth).catch((error: unknown) => setAuthError(toApiErrorMessage(error, 'Unable to verify editor role.')));
    else setAuthError('Authentication is not configured for this environment.');
    apiClient.listConditions().then(setConditions).catch(() => setConditions([]));
  }, []);
  useEffect(() => { if (auth?.isEditor) void loadPage(appliedFilters, cursor); }, [auth, appliedFilters, cursor]);

  const transition = async (evidenceId: string, status: Exclude<PublicationStatus, 'under_review'>) => {
    if (transitionNeedsConfirmation(status) && !window.confirm(`Change ${evidenceId} to ${status}?`)) return;
    setPendingId(evidenceId); setMessage('');
    try { await apiClient.transitionEvidence(evidenceId, status); setMessage(`${evidenceId} changed to ${status}.`); await loadPage(); }
    catch (error) { setMessage(toApiErrorMessage(error, 'Publication status could not be changed.')); }
    finally { setPendingId(''); }
  };

  return (
    <section className="theme-compat-light rounded-lg border border-slate-200 bg-white p-4 text-slate-900 sm:p-6" aria-labelledby="editor-heading">
      <h1 id="editor-heading" className="text-3xl font-bold">Evidence editor</h1>
      <p className="mt-2 text-slate-700">Review drafts, export the applied view, maintain taxonomy, and perform audited publication transitions.</p>
      {!auth && !authError ? <p role="status" className="mt-4">Verifying editor role...</p> : null}
      {authError ? <div role="alert" className="mt-4 rounded border border-amber-300 bg-amber-50 p-4"><p>{authError}</p><button type="button" onClick={() => void beginLogin('/editor').catch((error: Error) => setAuthError(error.message))} className="mt-3 rounded bg-teal-700 px-4 py-2 font-semibold text-white">Sign in as editor</button></div> : null}
      {auth && !auth.isEditor ? <div role="alert" className="mt-4 rounded border border-amber-300 bg-amber-50 p-4">Signed in as {auth.actorEmail}, but the <strong>evidence-editors</strong> group is required. Mutation controls are unavailable.</div> : null}
      {auth?.isEditor ? (
        <>
          <p className="mt-4 rounded border border-green-300 bg-green-50 p-3" role="status">Editor verified: {auth.actorEmail}</p>
          <form className="mt-6 grid gap-4 rounded border border-slate-200 p-4 md:grid-cols-4" onSubmit={(event) => { event.preventDefault(); setCursor(undefined); setHistory([]); setAppliedFilters(applyEditorFilters(draftFilters)); }}>
            <label className="font-semibold">Condition<select value={draftFilters.conditionId} onChange={(event) => setDraftFilters({ ...draftFilters, conditionId: event.target.value })} className="mt-1 block w-full rounded border border-slate-400 p-2"><option value="">All conditions</option>{conditions.map((item) => <option key={item.conditionId} value={item.conditionId}>{item.standardName}</option>)}</select></label>
            <label className="font-semibold md:col-span-2">Search<input value={draftFilters.query} onChange={(event) => setDraftFilters({ ...draftFilters, query: event.target.value })} placeholder="Intervention, registry ID, methodology" className="mt-1 block w-full rounded border border-slate-400 p-2" /></label>
            <div className="flex flex-col justify-end gap-2"><label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={draftFilters.includeDrafts} onChange={(event) => setDraftFilters({ ...draftFilters, includeDrafts: event.target.checked })} /> Include drafts</label><button className="min-h-11 rounded bg-teal-700 px-4 py-2 font-semibold text-white">Apply filters</button></div>
          </form>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p>Showing {page?.metadata.pagination?.returnedCount ?? page?.rows.length ?? 0} of {page?.metadata.pagination?.totalCount ?? page?.rows.length ?? 0}</p><button type="button" onClick={() => { setMessage('Preparing CSV export...'); apiClient.downloadEvidenceCsv({ ...appliedFilters, cursor }).then((blob) => { downloadCsv(blob); setMessage(`Exported ${page?.rows.length ?? 0} records from the applied view.`); }).catch((error: unknown) => setMessage(toApiErrorMessage(error, 'CSV export failed.'))); }} className="rounded border border-slate-400 px-4 py-2 font-semibold text-teal-800">Export applied view CSV</button></div>
          <div className="mt-4 overflow-x-auto" role="region" aria-label="Editorial evidence records" tabIndex={0}><table className="w-full border-collapse text-left text-sm"><caption className="sr-only">Evidence publication workspace</caption><thead><tr>{['Intervention', 'System', 'Grade', 'Status', 'Verified', 'Actions'].map((heading) => <th key={heading} className="border-b p-2">{heading}</th>)}</tr></thead><tbody>{(page?.rows ?? []).map((row) => <tr key={row.evidenceId}><td className="border-b p-2"><strong>{row.interventionName}</strong><span className="block text-slate-600">{row.registryIdentifier}</span></td><td className="border-b p-2">{row.medicalSystem}</td><td className="border-b p-2">{row.evidenceGrade}</td><td className="border-b p-2">{row.publicationStatus ?? 'published'}</td><td className="border-b p-2">{row.lastVerifiedDate ?? '-'}</td><td className="border-b p-2"><div className="flex flex-wrap gap-2">{(['published', 'draft', 'rejected'] as const).map((status) => <button key={status} type="button" disabled={pendingId === row.evidenceId} onClick={() => void transition(row.evidenceId, status)} className="min-h-9 rounded border border-slate-400 px-2 capitalize disabled:opacity-60" aria-label={`Change ${row.interventionName} to ${status}`}>{status}</button>)}</div></td></tr>)}</tbody></table></div>
          <div className="mt-4 flex items-center justify-between"><button type="button" disabled={!history.length} onClick={() => { const previous = previousCursorHistory(history); setHistory(previous.history); setCursor(previous.cursor); }} className="rounded border border-slate-400 px-4 py-2 disabled:opacity-50">Previous</button><button type="button" disabled={!page?.metadata.pagination?.nextCursor} onClick={() => { const next = nextCursorHistory(history, cursor, page?.metadata.pagination?.nextCursor); setHistory(next.history); setCursor(next.cursor); }} className="rounded border border-slate-400 px-4 py-2 disabled:opacity-50">Next</button></div>
          <details className="mt-6 rounded border border-slate-300 p-4"><summary className="cursor-pointer text-lg font-bold">Create condition taxonomy record</summary><form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); setMessage(''); apiClient.createCondition(condition).then((created) => { setMessage(`Condition ${created.conditionId} created.`); setCondition(emptyCondition); return apiClient.listConditions(); }).then(setConditions).catch((error: unknown) => setMessage(toApiErrorMessage(error, 'Condition could not be created.'))); }}>{(Object.keys(emptyCondition) as (keyof MedicalConditionRecord)[]).map((key) => <label key={key} className={`font-semibold ${key === 'pathophysiologySummary' ? 'md:col-span-2' : ''}`}>{key === 'icd11Code' ? 'ICD-11 code' : key.replace(/([A-Z])/g, ' $1')} {key === 'pathophysiologySummary' ? <textarea rows={4} value={condition[key] ?? ''} onChange={(event) => setCondition({ ...condition, [key]: event.target.value })} className="mt-1 block w-full rounded border border-slate-400 p-2" /> : <input value={condition[key] ?? ''} onChange={(event) => setCondition({ ...condition, [key]: event.target.value })} className="mt-1 block w-full rounded border border-slate-400 p-2" />}</label>)}<button className="min-h-11 rounded bg-teal-700 px-4 py-2 font-semibold text-white md:col-span-2">Create condition</button></form></details>
        </>
      ) : null}
      {message ? <p role="status" className="mt-4 rounded bg-slate-100 p-3">{message}</p> : null}
    </section>
  );
}
