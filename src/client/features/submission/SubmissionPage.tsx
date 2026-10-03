import { useEffect, useState } from 'react';
import { apiClient, toApiErrorMessage } from '../../services/api-client';
import { authSnapshot, beginLogin } from '../../services/auth/session';
import type { EvidenceRecord, MedicalConditionRecord } from '../../services/contracts';
import { emptyEvidenceDraft, prepareEvidenceDraft, validateEvidenceDraft, type SubmissionErrors } from './model';

export function SubmissionPage() {
  const [draft, setDraft] = useState(() => emptyEvidenceDraft());
  const [conditions, setConditions] = useState<MedicalConditionRecord[]>([]);
  const [errors, setErrors] = useState<SubmissionErrors>({});
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const auth = authSnapshot();

  useEffect(() => { apiClient.listConditions().then(setConditions).catch(() => setConditions([])); }, []);
  const update = <Key extends keyof EvidenceRecord>(key: Key, value: EvidenceRecord[Key]) => setDraft((current) => ({ ...current, [key]: value }));
  const errorFor = (key: keyof EvidenceRecord) => errors[key] ? `${key}-error` : undefined;

  if (!auth.authenticated) {
    return <section className="theme-compat-light rounded-lg border border-slate-200 bg-white p-6 text-slate-900" aria-labelledby="submission-heading"><h1 id="submission-heading" className="text-3xl font-bold">Submit evidence</h1><p className="mt-3 max-w-2xl">Sign in before contributing a source-linked evidence record. Accepted records remain immutable drafts until editorial review.</p><button type="button" onClick={() => void beginLogin('/new').catch((error: Error) => setMessage(error.message))} className="mt-5 min-h-11 rounded bg-teal-700 px-4 py-2 font-semibold text-white">Sign in to contribute</button>{message ? <p role="alert" className="mt-3 text-red-800">{message}</p> : null}</section>;
  }

  return (
    <section className="theme-compat-light rounded-lg border border-slate-200 bg-white p-4 text-slate-900 sm:p-6" aria-labelledby="submission-heading">
      <h1 id="submission-heading" className="text-3xl font-bold">Submit evidence</h1>
      <p className="mt-2 text-slate-700">Provide a verifiable HTTPS source. Submission creates a draft and never publishes directly.</p>
      {Object.keys(errors).length ? <div role="alert" tabIndex={-1} className="mt-4 rounded border border-red-300 bg-red-50 p-4"><strong>Correct the highlighted fields.</strong><ul className="list-disc pl-5">{Object.entries(errors).map(([field, error]) => <li key={field}><a href={`#${field}`} className="underline">{error}</a></li>)}</ul></div> : null}
      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={(event) => {
        event.preventDefault();
        const nextErrors = validateEvidenceDraft(draft);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;
        setPending(true); setMessage('');
        apiClient.createEvidence(prepareEvidenceDraft(draft)).then((record) => setMessage(`Draft ${record.evidenceId} submitted for editorial review.`)).catch((error: unknown) => setMessage(toApiErrorMessage(error, 'Evidence could not be submitted. Your values were retained.'))).finally(() => setPending(false));
      }}>
        <label className="font-semibold">Condition<select id="conditionId" aria-describedby={errorFor('conditionId')} value={draft.conditionId} onChange={(event) => update('conditionId', event.target.value)} className="mt-1 block w-full rounded border border-slate-400 p-2"><option value="">Choose a condition</option>{conditions.map((condition) => <option key={condition.conditionId} value={condition.conditionId}>{condition.standardName}</option>)}</select>{errors.conditionId ? <span id="conditionId-error" className="text-sm text-red-800">{errors.conditionId}</span> : null}</label>
        <Field id="interventionName" label="Intervention" value={draft.interventionName} error={errors.interventionName} onChange={(value) => update('interventionName', value)} />
        <label className="font-semibold">Medical system<select value={draft.medicalSystem} onChange={(event) => update('medicalSystem', event.target.value as EvidenceRecord['medicalSystem'])} className="mt-1 block w-full rounded border border-slate-400 p-2">{['Allopathy', 'Ayurveda', 'Siddha', 'Naturopathy'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="font-semibold">Evidence grade<select value={draft.evidenceGrade} onChange={(event) => update('evidenceGrade', event.target.value as EvidenceRecord['evidenceGrade'])} className="mt-1 block w-full rounded border border-slate-400 p-2">{['A', 'B', 'C'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <Field id="studyMethodology" label="Study methodology" value={draft.studyMethodology} error={errors.studyMethodology} onChange={(value) => update('studyMethodology', value)} />
        <Field id="registryIdentifier" label="Registry identifier" value={draft.registryIdentifier} error={errors.registryIdentifier} onChange={(value) => update('registryIdentifier', value)} />
        <div className="md:col-span-2"><Field id="sourceUrl" label="Source URL" value={draft.sourceUrl} error={errors.sourceUrl} description="HTTPS only. Accepted domains include PubMed, DOI, ClinicalTrials.gov, CTRI, WHO ICTRP, AYUSH, Cochrane, and major journals." onChange={(value) => update('sourceUrl', value)} /></div>
        <label className="font-semibold md:col-span-2">Clinical outcome summary<textarea id="clinicalOutcomeSummary" rows={5} value={draft.clinicalOutcomeSummary} aria-describedby={errorFor('clinicalOutcomeSummary')} onChange={(event) => update('clinicalOutcomeSummary', event.target.value)} className="mt-1 block w-full rounded border border-slate-400 p-2" />{errors.clinicalOutcomeSummary ? <span id="clinicalOutcomeSummary-error" className="text-sm text-red-800">{errors.clinicalOutcomeSummary}</span> : null}</label>
        <div className="md:col-span-2"><button disabled={pending} className="min-h-11 rounded bg-teal-700 px-5 py-2 font-semibold text-white disabled:opacity-60">{pending ? 'Submitting evidence...' : 'Submit immutable draft'}</button>{message ? <p role={message.startsWith('Draft') ? 'status' : 'alert'} className="mt-3">{message}</p> : null}</div>
      </form>
    </section>
  );
}

function Field({ id, label, value, error, description, onChange }: { id: keyof EvidenceRecord; label: string; value: string; error?: string; description?: string; onChange: (value: string) => void }) {
  const describedBy = [description ? `${id}-description` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  return <label className="font-semibold">{label}<input id={id} value={value} aria-describedby={describedBy} onChange={(event) => onChange(event.target.value)} className="mt-1 block w-full rounded border border-slate-400 p-2" />{description ? <span id={`${id}-description`} className="block text-sm font-normal text-slate-600">{description}</span> : null}{error ? <span id={`${id}-error`} className="block text-sm text-red-800">{error}</span> : null}</label>;
}
