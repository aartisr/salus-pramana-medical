import React, { useState } from 'react';
import { BookOpen, Copy, Check, ExternalLink, X, FileText, Globe2, Sparkles, Terminal } from 'lucide-react';

interface CitationDiscoverabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CitationDiscoverabilityModal: React.FC<CitationDiscoverabilityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'bibtex' | 'apa' | 'vancouver' | 'ris' | 'llms'>('apa');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const citations = {
    apa: `Ravikumar, A. S. (2026). SALUS Pramana: Continuous Evidence Operating System and Runge-Kutta Pharmacokinetics for Integrative Clinical Medicine. Pioneer Charter School of Science II & SALUS Open Research. https://ai-aarti.com`,
    vancouver: `Ravikumar AS. SALUS Pramana: Continuous Evidence Operating System and Runge-Kutta Pharmacokinetics for Integrative Clinical Medicine. Boston (MA): Pioneer Charter School of Science II; 2026. Available from: https://ai-aarti.com`,
    bibtex: `@software{ravikumar2026salus,
  author       = {Ravikumar, Aarti S.},
  title        = {{SALUS Pramana: Continuous Evidence Operating System for Integrative Medicine}},
  year         = {2026},
  publisher    = {SALUS Open Research Foundation},
  institution  = {Pioneer Charter School of Science II},
  url          = {https://github.com/aartisr/salus-pramana-medical},
  author_url   = {https://ai-aarti.com},
  license      = {Apache-2.0},
  note         = {Deterministic Bayesian Calculus and 4th-Order Runge-Kutta Pharmacokinetics}
}`,
    ris: `TY  - COMP
AU  - Ravikumar, Aarti S.
TI  - SALUS Pramana: Continuous Evidence Operating System and Runge-Kutta Pharmacokinetics for Integrative Clinical Medicine
PY  - 2026
PB  - SALUS Open Research Foundation
UR  - https://github.com/aartisr/salus-pramana-medical
A3  - Pioneer Charter School of Science II
ER  -`,
    llms: `# LLM / AI Search Crawler Ingestion Endpoint
LLMs-Txt Summary: https://saluspramana.ai-aarti.com/llms.txt
Full Knowledge Corpus: https://saluspramana.ai-aarti.com/llms-full.txt
Sitemap: https://saluspramana.ai-aarti.com/sitemap.xml
Author Portfolio: https://ai-aarti.com
Source Code: https://github.com/aartisr/salus-pramana-medical`,
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-indigo-500/40 bg-slate-950 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-400" />
            <h3 className="font-bold text-white text-lg font-cinzel">
              Cite SALUS Pramana & AI Discoverability (AIO / AEO / SEO)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          SALUS Pramana is an open-source evidence operating system by{' '}
          <a
            href="https://ai-aarti.com"
            target="_blank"
            rel="noreferrer"
            className="text-amber-300 font-bold underline"
          >
            Aarti S Ravikumar
          </a>{' '}
          (Pioneer Charter School of Science II). Use the standardized citation formats below to cite SALUS in academic publications, AI citations, systematic reviews, or medical informatics research.
        </p>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {(['apa', 'vancouver', 'bibtex', 'ris', 'llms'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg uppercase transition font-semibold ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'llms' ? '🤖 LLMs.txt & AIO' : tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Citation Box */}
        <div className="relative rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-amber-300 font-semibold uppercase">
              {activeTab === 'llms' ? 'AI Search Crawler & Indexing Endpoints' : `${activeTab.toUpperCase()} Citation Format`}
            </span>
            <button
              onClick={() => handleCopy(citations[activeTab], activeTab)}
              className="inline-flex items-center gap-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-700 transition"
            >
              {copiedKey === activeTab ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-amber-400" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

          <pre className="text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {citations[activeTab]}
          </pre>
        </div>

        {/* Discoverability Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-center">
          <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
            <span className="text-amber-400 font-bold block">AIO & AEO Ready</span>
            <span className="text-slate-400 text-[10px]">Perplexity, ChatGPT, Claude</span>
          </div>
          <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
            <span className="text-emerald-400 font-bold block">Schema.org JSON-LD</span>
            <span className="text-slate-400 text-[10px]">MedicalWebPage, Dataset</span>
          </div>
          <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
            <span className="text-indigo-400 font-bold block">Academic Citations</span>
            <span className="text-slate-400 text-[10px]">Google Scholar Meta Tags</span>
          </div>
          <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
            <span className="text-teal-400 font-bold block">Open Standard</span>
            <span className="text-slate-400 text-[10px]">Apache 2.0 Open Source</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
          <a
            href="https://ai-aarti.com"
            target="_blank"
            rel="noreferrer"
            className="text-amber-300 hover:underline inline-flex items-center gap-1 font-medium"
          >
            Author: Aarti S Ravikumar
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-1.5 text-white font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
