import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import type { TreatmentEvidence } from "@evidence-platform/domain";
import { evidenceGradeDescription } from "@evidence-platform/domain";
import { listEvidence } from "../lib/api";

const SYSTEMS: TreatmentEvidence["medicalSystem"][] = ["Allopathy", "Ayurveda", "Siddha", "Naturopathy"];

const gradeOrder: Record<TreatmentEvidence["evidenceGrade"], number> = { A: 0, B: 1, C: 2 };

function sortEvidence(a: TreatmentEvidence, b: TreatmentEvidence) {
  const gradeCompare = gradeOrder[a.evidenceGrade] - gradeOrder[b.evidenceGrade];
  if (gradeCompare !== 0) {
    return gradeCompare;
  }
  return a.interventionName.localeCompare(b.interventionName);
}

export function ComparisonView() {
  const { conditionId } = useParams({ from: "/compare/$conditionId" });

  const query = useQuery({
    queryKey: ["compare-evidence", conditionId],
    queryFn: () => listEvidence(conditionId),
    staleTime: 30_000,
  });

  const rows = query.data ?? [];

  return (
    <section className="panel">
      <h2>Cross-System Comparison</h2>
      <p className="muted">
        Evidence grades are not causally equivalent across systems. Compare methodology, source, and safety context before interpretation.
      </p>

      {query.isLoading ? <p className="muted">Loading comparison data...</p> : null}
      {query.isError ? <p className="error">Failed to load comparison data.</p> : null}

      <div className="compare-grid">
        {SYSTEMS.map((system) => {
          const systemRows = rows.filter((item) => item.medicalSystem === system).sort(sortEvidence);
          return (
            <div key={system} className="compare-column">
              <h3>{system}</h3>
              {systemRows.length === 0 ? (
                <p className="muted">No records available.</p>
              ) : (
                <ul>
                  {systemRows.map((row) => (
                    <li key={row.evidenceId}>
                      <p className="compare-title-row">
                        <strong>{row.interventionName}</strong>
                        <span className={`grade-badge grade-${row.evidenceGrade.toLowerCase()}`} title={evidenceGradeDescription(row.evidenceGrade)}>
                          Grade {row.evidenceGrade}
                        </span>
                      </p>
                      <p className="muted">{row.studyMethodology}</p>
                      <p className="muted">{row.registryIdentifier}</p>
                      <a href={row.sourceUrl} target="_blank" rel="noreferrer">
                        Source
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
