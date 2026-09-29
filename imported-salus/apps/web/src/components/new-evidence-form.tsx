import React from "react";
import { useMutation } from "@tanstack/react-query";
import type { TreatmentEvidence } from "@evidence-platform/domain";
import { createEvidence } from "../lib/api";

const empty: TreatmentEvidence = {
  evidenceId: "",
  conditionId: "cond-type2-diabetes",
  medicalSystem: "Allopathy",
  interventionName: "",
  isPharmacological: true,
  evidenceGrade: "A",
  studyMethodology: "",
  sampleSize: 0,
  registryIdentifier: "",
  sourceUrl: "",
  clinicalOutcomeSummary: "",
  contraindications: [],
  interactionWarnings: [],
  lastVerifiedDate: new Date().toISOString().slice(0, 10),
};

export function NewEvidenceForm() {
  const [form, setForm] = React.useState<TreatmentEvidence>(empty);
  const [message, setMessage] = React.useState<string>("");

  const mutation = useMutation({
    mutationFn: createEvidence,
    onSuccess: () => {
      setMessage("Evidence record created.");
      setForm({ ...empty, evidenceId: `ev-${Date.now()}` });
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : "Failed");
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const payload = {
          ...form,
          evidenceId: form.evidenceId || `ev-${Date.now()}`,
        };
        mutation.mutate(payload);
      }}
      className="evidence-form"
    >
      <label>
        Intervention
        <input value={form.interventionName} onChange={(event) => setForm({ ...form, interventionName: event.target.value })} />
      </label>
      <label>
        Medical System
        <select value={form.medicalSystem} onChange={(event) => setForm({ ...form, medicalSystem: event.target.value as TreatmentEvidence["medicalSystem"] })}>
          <option>Allopathy</option>
          <option>Ayurveda</option>
          <option>Siddha</option>
          <option>Naturopathy</option>
        </select>
      </label>
      <label>
        Evidence Grade
        <select value={form.evidenceGrade} onChange={(event) => setForm({ ...form, evidenceGrade: event.target.value as TreatmentEvidence["evidenceGrade"] })}>
          <option>A</option>
          <option>B</option>
          <option>C</option>
        </select>
      </label>
      <label>
        Study Methodology
        <input value={form.studyMethodology} onChange={(event) => setForm({ ...form, studyMethodology: event.target.value })} />
      </label>
      <label>
        Registry Identifier
        <input
          placeholder="PMID-... / DOI-... / CTRI-..."
          value={form.registryIdentifier}
          onChange={(event) => setForm({ ...form, registryIdentifier: event.target.value })}
        />
      </label>
      <label>
        Source URL
        <input value={form.sourceUrl} onChange={(event) => setForm({ ...form, sourceUrl: event.target.value })} />
      </label>
      <label>
        Clinical Outcome Summary
        <textarea rows={5} value={form.clinicalOutcomeSummary} onChange={(event) => setForm({ ...form, clinicalOutcomeSummary: event.target.value })} />
      </label>
      <div className="form-action-bar">
        <button type="submit" disabled={mutation.isPending} className="primary-button form-submit-button">
          {mutation.isPending ? "Submitting..." : "Submit Evidence"}
        </button>
        {message ? <p className="muted">{message}</p> : null}
      </div>
    </form>
  );
}
