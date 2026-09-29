import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { TreatmentEvidence } from "@evidence-platform/domain";
import { evidenceGradeDescription } from "@evidence-platform/domain";
import { listEvidence } from "../lib/api";

const helper = createColumnHelper<TreatmentEvidence>();

const columns = [
  helper.accessor("interventionName", { header: "Intervention" }),
  helper.accessor("medicalSystem", { header: "System" }),
  helper.accessor("evidenceGrade", {
    header: "Grade",
    cell: (ctx) => {
      const grade = ctx.getValue();
      return (
        <span className={`grade-badge grade-${grade.toLowerCase()}`} title={evidenceGradeDescription(grade)}>
          Grade {grade}
        </span>
      );
    },
  }),
  helper.accessor("studyMethodology", { header: "Methodology" }),
  helper.accessor("registryIdentifier", { header: "Registry ID" }),
  helper.accessor("sourceUrl", {
    header: "Source",
    cell: (ctx) => (
      <a href={ctx.getValue()} target="_blank" rel="noreferrer">
        Link
      </a>
    ),
  }),
] as const;

export function EvidenceTable({ conditionId }: { conditionId?: string }) {
  const [activeGrades, setActiveGrades] = useState<Record<TreatmentEvidence["evidenceGrade"], boolean>>({
    A: true,
    B: true,
    C: true,
  });
  const [activeSystems, setActiveSystems] = useState<Record<TreatmentEvidence["medicalSystem"], boolean>>({
    Allopathy: true,
    Ayurveda: true,
    Siddha: true,
    Naturopathy: true,
  });
  const [pharmaFilter, setPharmaFilter] = useState<"all" | "pharmacological" | "lifestyle">("all");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["evidence", conditionId],
    queryFn: () => listEvidence(conditionId),
    staleTime: 30_000,
  });

  const rawRows = query.data ?? [];
  const rows = rawRows.filter((row) => {
    if (!activeGrades[row.evidenceGrade]) return false;
    if (!activeSystems[row.medicalSystem]) return false;
    if (pharmaFilter === "pharmacological" && !row.isPharmacological) return false;
    if (pharmaFilter === "lifestyle" && row.isPharmacological) return false;
    return true;
  });

  const table = useReactTable({
    data: rows,
    columns: columns as any,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="panel">
      {query.isLoading ? <p className="muted">Loading evidence...</p> : null}
      {query.isError ? <p className="error">Failed to load evidence.</p> : null}

      <div className="filters-wrap" aria-label="Evidence filters">
        <div className="filter-group">
          <span>Grade</span>
          {(["A", "B", "C"] as const).map((grade) => (
            <label key={grade}>
              <input
                type="checkbox"
                checked={activeGrades[grade]}
                onChange={() => setActiveGrades((prev) => ({ ...prev, [grade]: !prev[grade] }))}
              />
              {grade}
            </label>
          ))}
        </div>

        <div className="filter-group">
          <span>System</span>
          {(["Allopathy", "Ayurveda", "Siddha", "Naturopathy"] as const).map((system) => (
            <label key={system}>
              <input
                type="checkbox"
                checked={activeSystems[system]}
                onChange={() => setActiveSystems((prev) => ({ ...prev, [system]: !prev[system] }))}
              />
              {system}
            </label>
          ))}
        </div>

        <div className="filter-group">
          <span>Type</span>
          <select
            aria-label="Filter by intervention type"
            value={pharmaFilter}
            onChange={(event) => setPharmaFilter(event.target.value as typeof pharmaFilter)}
          >
            <option value="all">All</option>
            <option value="pharmacological">Pharmacological</option>
            <option value="lifestyle">Lifestyle/Diet</option>
          </select>
        </div>
      </div>

      <div className="table-scroll">
        <table className="evidence-table">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <tr
                  onClick={() => setExpandedRowId((prev) => (prev === row.id ? null : row.id))}
                  className={`evidence-row evidence-grade-${row.original.evidenceGrade.toLowerCase()}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>

                {expandedRowId === row.id ? (
                  <tr className="expanded-safety-row">
                    <td colSpan={columns.length}>
                      <div className="expanded-safety-grid">
                        <div className="safety-box contraindications-box">
                          <h4>Contraindications</h4>
                          {row.original.contraindications.length === 0 ? (
                            <p className="muted">None listed.</p>
                          ) : (
                            <ul>
                              {row.original.contraindications.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className="safety-box interactions-box">
                          <h4>Interaction Warnings</h4>
                          {row.original.interactionWarnings.length === 0 ? (
                            <p className="muted">None listed.</p>
                          ) : (
                            <ul>
                              {row.original.interactionWarnings.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {!query.isLoading && rows.length === 0 ? <p className="muted">No evidence records match the selected filters.</p> : null}
    </div>
  );
}

