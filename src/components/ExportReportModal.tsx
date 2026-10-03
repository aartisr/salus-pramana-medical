import React, { useState } from 'react';
import { nobelEvaluationDossier } from '../data/nobelEvaluationData';
import { X, Download, Copy, Check, FileText, Award } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose }) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const generateMarkdownReport = () => {
    return `# ${nobelEvaluationDossier.title}
**Evaluator**: ${nobelEvaluationDossier.evaluator}  
**Repository**: ${nobelEvaluationDossier.repositoryUrl}  
**Overall Cadre Score**: **${nobelEvaluationDossier.overallScore} / 10.0** (${nobelEvaluationDossier.gradeCadre})  
**Date**: September 2026  

---

## Executive Summary
${nobelEvaluationDossier.executiveSummary}

---

## 4 Pillars of Transcendental Impact
1. **Global Disease Burden Relief**: ${nobelEvaluationDossier.humanityImpactAnalysis.globalBurdenRelief}
2. **Health Equity & Zero Cost**: ${nobelEvaluationDossier.humanityImpactAnalysis.healthEquityAndAffordability}
3. **Patient Safety & ODE Interaction Kinetics**: ${nobelEvaluationDossier.humanityImpactAnalysis.patientSafetyAndDrugInteractionMitigation}
4. **Cross-Cultural Epistemic De-Siloing**: ${nobelEvaluationDossier.humanityImpactAnalysis.crossCulturalScientificDeSiloing}

---

## 10-Dimension Nobel Evaluation Matrix
${nobelEvaluationDossier.metrics
  .map(
    (m) => `### ${m.dimension} — Score: ${m.score.toFixed(1)}/10.0 (Weight: ${(m.weight * 100).toFixed(0)}%)
**Headline**: ${m.headline}  
**Rationale**: ${m.justification}  
**Key Strengths**:
${m.strengths.map((s) => `- ${s}`).join('\n')}
**Verification Proof**: \`${m.mathematicalProofOrEvidence}\`
`
  )
  .join('\n\n')}

---

## Global Strategic Deployment Recommendations
${nobelEvaluationDossier.recommendationsForGlobalDeployment.map((r) => `- ${r}`).join('\n')}
`;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopiedFormat('md');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-3xl max-h-[85vh] rounded-2xl border border-amber-500/40 bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/20 p-2 text-amber-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-cinzel">
                Export Nobel-Cadre Evaluation Dossier
              </h3>
              <p className="text-xs text-slate-400">
                Official assessment package for WHO, academic journals, and health ministries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
            <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-72 overflow-y-auto">
              {generateMarkdownReport()}
            </pre>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 p-4 bg-slate-950">
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-medium text-slate-200 border border-slate-700 transition"
          >
            {copiedFormat === 'md' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {copiedFormat === 'md' ? 'Copied to Clipboard' : 'Copy Full Markdown'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                downloadFile(
                  JSON.stringify(nobelEvaluationDossier, null, 2),
                  'SALUS_PRAMANA_NOBEL_DOSSIER.json',
                  'application/json'
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-medium text-slate-200 border border-slate-700 transition"
            >
              <Download className="h-4 w-4 text-teal-400" />
              Download JSON
            </button>
            <button
              onClick={() =>
                downloadFile(
                  generateMarkdownReport(),
                  'SALUS_PRAMANA_NOBEL_DOSSIER.md',
                  'text/markdown'
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg transition"
            >
              <FileText className="h-4 w-4" />
              Download Dossier (.MD)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
