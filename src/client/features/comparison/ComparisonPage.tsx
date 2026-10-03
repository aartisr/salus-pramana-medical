import { Link, useParams } from '@tanstack/react-router';
import { Download, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient, toApiErrorMessage } from '../../services/api-client';
import type { EvidenceRecord } from '../../services/contracts';
import { comparisonCsv, comparisonSummary, rankEvidence, type ComparisonPersona } from './model';

const personas: ComparisonPersona[] = ['Patient', 'Clinician', 'Researcher'];

function downloadText(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ComparisonPage() {
  const { conditionId = '' } = useParams({ strict: false }) as { conditionId?: string };
  const [persona, setPersona] = useState<ComparisonPersona>('Patient');
  const [rows, setRows] = useState<EvidenceRecord[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setState('loading');
    apiClient.listEvidence({ conditionId }).then((response) => {
      if (!active) return;
      setRows(response.rows);
      setState('ready');
    }).catch((reason: unknown) => {
      if (!active) return;
      setError(toApiErrorMessage(reason, 'Comparison data could not be loaded.'));
      setState('error');
    });
    return () => { active = false; };
  }, [conditionId]);

  const ranked = rankEvidence(rows);

  return (
    <section className="theme-compat-light rounded-lg border border-slate-200 bg-white p-4 text-slate-900 shadow-sm sm:p-6" aria-labelledby="comparison-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700">Condition evidence</p>
          <h1 id="comparison-heading" tabIndex={-1} className="text-3xl font-bold">Ranked comparison</h1>
          <p className="mt-2 max-w-3xl text-slate-700">Condition: <strong>{conditionId || 'Not specified'}</strong>. Evidence and calculations do not change between persona lenses.</p>
        </div>
        <label className="text-sm font-semibold">
          Explanation lens
          <select className="mt-1 block rounded border border-slate-400 bg-white px-3 py-2" value={persona} onChange={(event) => setPersona(event.target.value as ComparisonPersona)}>
            {personas.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      {state === 'loading' ? <p role="status" className="mt-6">Loading comparison data...</p> : null}
      {state === 'error' ? <div role="alert" className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-red-900">{error}</div> : null}
      {state === 'ready' && ranked.length === 0 ? (
        <div className="mt-6 rounded border border-amber-300 bg-amber-50 p-5">
          <h2 className="text-xl font-bold">No evidence records for this condition</h2>
          <p className="mt-2">Submit a verifiable source to begin this comparison.</p>
          <Link to="/new" className="mt-4 inline-block rounded bg-teal-700 px-4 py-2 font-semibold text-white">Submit evidence</Link>
        </div>
      ) : null}

      {ranked.length > 0 ? (
        <>
          <div className="mt-6 rounded border border-teal-200 bg-teal-50 p-4" role="status">
            <h2 className="font-bold">Clinical snapshot</h2>
            <p>{comparisonSummary(ranked[0], persona)}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 print:hidden">
            <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded border border-slate-400 px-4 py-2 font-semibold"><Printer aria-hidden="true" size={18} /> Print / PDF</button>
            <button type="button" onClick={() => downloadText(`salus-${conditionId || 'comparison'}.csv`, comparisonCsv(ranked, conditionId, persona))} className="inline-flex min-h-11 items-center gap-2 rounded bg-teal-700 px-4 py-2 font-semibold text-white"><Download aria-hidden="true" size={18} /> Export CSV</button>
          </div>
          <ol className="mt-6 grid gap-4 md:grid-cols-2">
            {ranked.map((row, index) => (
              <li key={row.evidence.evidenceId} className="rounded border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3"><h2 className="text-xl font-bold">{index + 1}. {row.evidence.interventionName}</h2><span className="rounded bg-slate-100 px-2 py-1 text-sm font-bold">Grade {row.evidence.evidenceGrade}</span></div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm"><div><dt>Confidence</dt><dd className="font-bold">{row.confidence}/100</dd></div><div><dt>Benefit</dt><dd className="font-bold">{row.benefit}/100</dd></div><div><dt>Risk</dt><dd className="font-bold">{row.risk}/100</dd></div></dl>
                <p className="mt-3 text-sm text-slate-700">{row.rankReason}</p>
                <p className="mt-2 text-sm"><strong>Safety:</strong> {row.evidence.interactionWarnings.length ? row.evidence.interactionWarnings.join('; ') : 'No interaction warnings in this record.'}</p>
                <a className="mt-3 inline-block font-semibold text-teal-800 underline" href={row.evidence.sourceUrl} target="_blank" rel="noreferrer">Verify source: {row.evidence.registryIdentifier}</a>
              </li>
            ))}
          </ol>
          <details className="mt-6 rounded border border-slate-300 p-4">
            <summary className="cursor-pointer font-bold">Advanced evidence table ({ranked.length})</summary>
            <div className="mt-4 overflow-x-auto" role="region" aria-label="Advanced evidence comparison" tabIndex={0}>
              <table className="w-full border-collapse text-left text-sm"><caption className="sr-only">Ranked evidence details</caption><thead><tr>{['Rank', 'Intervention', 'System', 'Methodology', 'Freshness', 'Outcome'].map((heading) => <th key={heading} className="border-b p-2">{heading}</th>)}</tr></thead><tbody>{ranked.map((row, index) => <tr key={row.evidence.evidenceId}><td className="border-b p-2">{index + 1}</td><td className="border-b p-2">{row.evidence.interventionName}</td><td className="border-b p-2">{row.evidence.medicalSystem}</td><td className="border-b p-2">{row.evidence.studyMethodology}</td><td className="border-b p-2">{row.freshness}</td><td className="border-b p-2">{row.evidence.clinicalOutcomeSummary}</td></tr>)}</tbody></table>
            </div>
          </details>
        </>
      ) : null}
    </section>
  );
}
