import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MedicalCondition, TreatmentEvidence } from "@evidence-platform/domain";
import {
  createCondition,
  evidenceCsvExportUrl,
  getEditorAuthStatus,
  listConditions,
  listEvidencePage,
  publishEvidence,
  type ListEvidenceOptions,
} from "../lib/api";

const EMPTY_CONDITION: MedicalCondition = {
  conditionId: "",
  icd11Code: "",
  standardName: "",
  ayurvedicEquivalent: "",
  siddhaEquivalent: "",
  pathophysiologySummary: "",
};

export function EditorConsole() {
  const queryClient = useQueryClient();
  const [conditionId, setConditionId] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [cursor, setCursor] = React.useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = React.useState<string[]>([]);
  const [conditionForm, setConditionForm] = React.useState<MedicalCondition>(EMPTY_CONDITION);
  const [feedback, setFeedback] = React.useState("");

  const evidenceOptions: ListEvidenceOptions = {
    includeDrafts: true,
    conditionId: conditionId || undefined,
    q: searchTerm || undefined,
    limit: 10,
    cursor,
  };

  const conditionsQuery = useQuery({
    queryKey: ["conditions"],
    queryFn: listConditions,
    staleTime: 300_000,
  });

  const evidenceQuery = useQuery({
    queryKey: ["editor-evidence", evidenceOptions],
    queryFn: () => listEvidencePage(evidenceOptions),
    staleTime: 15_000,
  });

  const authStatusQuery = useQuery({
    queryKey: ["editor-auth-status"],
    queryFn: () => getEditorAuthStatus(),
    staleTime: 60_000,
  });

  const publishMutation = useMutation({
    mutationFn: ({ evidenceId, publicationStatus }: { evidenceId: string; publicationStatus: "draft" | "published" | "rejected" }) =>
      publishEvidence(evidenceId, publicationStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editor-evidence"] });
      setFeedback("Editorial status updated.");
    },
    onError: (error) => {
      setFeedback(error instanceof Error ? error.message : "Failed to update status.");
    },
  });

  const createConditionMutation = useMutation({
    mutationFn: (payload: MedicalCondition) => createCondition(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conditions"] });
      setFeedback("Condition created.");
      setConditionForm(EMPTY_CONDITION);
    },
    onError: (error) => {
      setFeedback(error instanceof Error ? error.message : "Failed to create condition.");
    },
  });

  const rows = evidenceQuery.data?.rows ?? [];
  const pagination = evidenceQuery.data?.metadata.pagination;
  const csvHref = evidenceCsvExportUrl(evidenceOptions);
  const isEditor = authStatusQuery.data?.isEditor ?? false;

  const applySearch = () => {
    setCursor(undefined);
    setCursorHistory([]);
    setSearchTerm(searchInput.trim());
  };

  const goNext = () => {
    const nextCursor = pagination?.nextCursor;
    if (!nextCursor) {
      return;
    }

    setCursorHistory((prev) => [...prev, cursor ?? "0"]);
    setCursor(nextCursor);
  };

  const goPrevious = () => {
    if (cursorHistory.length === 0) {
      setCursor(undefined);
      return;
    }

    const previousCursor = cursorHistory[cursorHistory.length - 1];
    setCursorHistory((prev) => prev.slice(0, -1));
    setCursor(previousCursor === "0" ? undefined : previousCursor);
  };

  const updateConditionField = (field: keyof MedicalCondition, value: string) => {
    setConditionForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section className="editor-console panel">
      <h2>Editor Console</h2>
      <p className="muted">
        Manage publication status, review drafts, and maintain condition taxonomy. Editor role is required for protected actions.
      </p>
      <div className={`editor-auth-status ${isEditor ? "editor-ok" : "editor-warning"}`}>
        {authStatusQuery.isLoading ? (
          <span>Verifying editor role...</span>
        ) : authStatusQuery.isError ? (
          <span>Unable to verify editor role. Confirm sign-in and token claims.</span>
        ) : isEditor ? (
          <span>Editor role verified for {authStatusQuery.data?.actorEmail}. Publish controls are enabled.</span>
        ) : (
          <span>
            Authenticated but editor group is missing. Ask an administrator to assign <strong>evidence-editors</strong>.
          </span>
        )}
      </div>

      <div className="editor-toolbar">
        <label>
          Condition
          <select value={conditionId} onChange={(event) => setConditionId(event.target.value)}>
            <option value="">All conditions</option>
            {(conditionsQuery.data ?? []).map((condition) => (
              <option key={condition.conditionId} value={condition.conditionId}>
                {condition.standardName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Search
          <div className="editor-search-row">
            <input
              placeholder="Intervention, registry ID, methodology..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button type="button" className="advanced-toggle" onClick={applySearch}>
              Apply
            </button>
          </div>
        </label>

        <a className="compare-link" href={csvHref} download>
          Export Current View CSV
        </a>
      </div>

      <div className="table-scroll">
        <table className="evidence-table">
          <thead>
            <tr>
              <th>Intervention</th>
              <th>System</th>
              <th>Grade</th>
              <th>Status</th>
              <th>Last Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: TreatmentEvidence) => (
              <tr key={row.evidenceId}>
                <td>
                  <strong>{row.interventionName}</strong>
                  <div className="muted">{row.registryIdentifier}</div>
                </td>
                <td>{row.medicalSystem}</td>
                <td>{row.evidenceGrade}</td>
                <td>{row.publicationStatus ?? "published"}</td>
                <td>{row.lastVerifiedDate ?? "-"}</td>
                <td>
                  <div className="editor-actions">
                    <button
                      type="button"
                      className="advanced-toggle"
                      disabled={!isEditor || publishMutation.isPending}
                      onClick={() => publishMutation.mutate({ evidenceId: row.evidenceId, publicationStatus: "published" })}
                    >
                      Publish
                    </button>
                    <button
                      type="button"
                      className="advanced-toggle"
                      disabled={!isEditor || publishMutation.isPending}
                      onClick={() => publishMutation.mutate({ evidenceId: row.evidenceId, publicationStatus: "draft" })}
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      className="advanced-toggle"
                      disabled={!isEditor || publishMutation.isPending}
                      onClick={() => publishMutation.mutate({ evidenceId: row.evidenceId, publicationStatus: "rejected" })}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="editor-pagination">
        <button type="button" className="advanced-toggle" onClick={goPrevious} disabled={cursorHistory.length === 0}>
          Previous
        </button>
        <span className="muted">
          Showing {pagination?.returnedCount ?? rows.length} of {pagination?.totalCount ?? rows.length}
        </span>
        <button type="button" className="advanced-toggle" onClick={goNext} disabled={!pagination?.nextCursor}>
          Next
        </button>
      </div>

      <details className="panel">
        <summary className="deep-dive-summary">Create Condition</summary>
        <form
          className="editor-condition-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!isEditor) {
              setFeedback("Editor role is required to create conditions.");
              return;
            }
            createConditionMutation.mutate(conditionForm);
          }}
        >
          <label>
            Condition ID
            <input value={conditionForm.conditionId} onChange={(event) => updateConditionField("conditionId", event.target.value)} />
          </label>
          <label>
            ICD-11 Code
            <input value={conditionForm.icd11Code} onChange={(event) => updateConditionField("icd11Code", event.target.value)} />
          </label>
          <label>
            Standard Name
            <input value={conditionForm.standardName} onChange={(event) => updateConditionField("standardName", event.target.value)} />
          </label>
          <label>
            Ayurvedic Equivalent
            <input
              value={conditionForm.ayurvedicEquivalent ?? ""}
              onChange={(event) => updateConditionField("ayurvedicEquivalent", event.target.value)}
            />
          </label>
          <label>
            Siddha Equivalent
            <input value={conditionForm.siddhaEquivalent ?? ""} onChange={(event) => updateConditionField("siddhaEquivalent", event.target.value)} />
          </label>
          <label>
            Pathophysiology Summary
            <textarea
              rows={3}
              value={conditionForm.pathophysiologySummary}
              onChange={(event) => updateConditionField("pathophysiologySummary", event.target.value)}
            />
          </label>
          <button type="submit" className="primary-button" disabled={!isEditor || createConditionMutation.isPending}>
            {createConditionMutation.isPending ? "Creating..." : "Create Condition"}
          </button>
          {!isEditor ? <p className="muted">Condition creation is disabled until editor role is verified.</p> : null}
        </form>
      </details>

      {feedback ? <p className="muted">{feedback}</p> : null}
      {evidenceQuery.isLoading ? <p className="muted">Loading editorial data...</p> : null}
      {evidenceQuery.isError ? <p className="error">Failed to load editorial evidence list.</p> : null}
    </section>
  );
}
