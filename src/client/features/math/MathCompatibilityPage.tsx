import { Link } from '@tanstack/react-router';

const sections = [
  ['Evidence scoring', 'Higher-quality, recent, replicated studies contribute more. Small or old studies remain visible but carry less confidence.'],
  ['Uncertainty', 'Confidence intervals and governance gates prevent a single score from becoming an overconfident recommendation.'],
  ['Recency decay', 'Evidence influence decays over time so newer verification can refine older conclusions without erasing provenance.'],
  ['Safety dynamics', 'Interaction equations estimate changing concentrations, likely peak-risk windows, and monitoring actions over time.'],
  ['Equity projection', 'Population projections keep assumptions, units, and simulated status visible beside every outcome.'],
] as const;

const reportRoot = '/reports';

export const mathReportLinks = [
  ['Calculus and Math Specification', `${reportRoot}/CALCULUS_MATH_SPEC.md`],
  ['Calculus Specification PDF', `${reportRoot}/CALCULUS_MATH_SPEC.pdf`],
  ['Executive Calculus PDF', `${reportRoot}/CALCULUS_MATH_SPEC.executive.pdf`],
  ['Architecture', `${reportRoot}/ARCHITECTURE.md`],
  ['Innovation Catalog', `${reportRoot}/INNOVATIONS.md`],
  ['Implementation Plan', `${reportRoot}/IMPLEMENTATION_PLAN.md`],
  ['Synthetic Calibration Report', `${reportRoot}/reports/synthetic-calibration-report.md`],
  ['Validation & Responsive Acceptance Checklist', `${reportRoot}/RESPONSIVE_ACCEPTANCE_CHECKLIST.md`],
  ['UX Flow Blueprint', `${reportRoot}/UX_WORLD_CLASS_FLOW_BLUEPRINT.md`],
  ['Zero-Cost Guardrails', `${reportRoot}/ZERO_COST_GUARDRAILS.md`],
  ['Report Provenance', `${reportRoot}/provenance.json`],
  ['Full machine-readable research context', '/llms-full.txt'],
] as const;

export function MathCompatibilityPage() {
  return <section className="theme-compat-light rounded-lg border border-slate-200 bg-white p-4 text-slate-900 sm:p-6" aria-labelledby="math-heading"><p className="text-sm font-semibold uppercase text-teal-700">Math compatibility view</p><h1 id="math-heading" className="text-3xl font-bold">How SALUS quantifies evidence and safety</h1><p className="mt-3 max-w-3xl text-slate-700">A plain-language entry into the same formulas, proofs, uncertainty controls, and report corpus available in the active architecture workstation.</p><div className="mt-5 flex flex-wrap gap-3"><Link to="/architecture" className="rounded bg-teal-700 px-4 py-2 font-semibold text-white">Open interactive architecture and math</Link><Link to="/compare/$conditionId" params={{ conditionId: 'cond-type2-diabetes' }} className="rounded border border-slate-400 px-4 py-2 font-semibold">See a ranked comparison</Link></div><div className="mt-8 grid gap-4 md:grid-cols-2">{sections.map(([title, body]) => <article key={title} className="rounded border border-slate-200 p-4"><h2 className="text-xl font-bold">{title}</h2><p className="mt-2 text-slate-700">{body}</p></article>)}</div><section className="mt-8" aria-labelledby="report-corpus-heading"><h2 id="report-corpus-heading" className="text-2xl font-bold">Formal report corpus</h2><p className="mt-2 text-slate-700">These byte-preserved reports provide equations, assumptions, validation evidence, architecture provenance, and print-ready editions.</p><ul className="mt-3 grid gap-2 sm:grid-cols-2">{mathReportLinks.map(([label, href]) => <li key={href}><a href={href} className="font-semibold text-teal-800 underline">{label}</a></li>)}</ul></section><aside className="mt-8 rounded border border-amber-300 bg-amber-50 p-4"><h2 className="font-bold">Clinical boundary</h2><p>SALUS supports evidence interpretation. It does not diagnose, prescribe, or replace qualified clinical advice.</p></aside></section>;
}
