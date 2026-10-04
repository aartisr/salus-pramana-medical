import React, { useEffect, useState } from 'react';
import { GitBranch, Code, FileText, Database, Shield, Layers, Server, Check, Copy } from 'lucide-react';
import { WorkspaceGuide } from './WorkspaceGuide';
import { PersonaMode } from '../types/salus';

interface RepositoryCodeArchitectureProps {
  selectedPersona?: PersonaMode;
}

export const RepositoryCodeArchitecture: React.FC<RepositoryCodeArchitectureProps> = ({ selectedPersona = 'nobel_juror' }) => {
  const [activeTab, setActiveTab] = useState<'math' | 'schemas' | 'architecture' | 'source_tree'>('math');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const isResearcherLens = selectedPersona === 'researcher';
  const isAuditLens = selectedPersona === 'nobel_juror';

  useEffect(() => {
    if (isAuditLens) setActiveTab('schemas');
  }, [isAuditLens]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  return (
    <div className="theme-workspace-dark space-y-6 rounded-3xl p-1 pb-16">
      {/* Header */}
      <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
              <GitBranch className="h-4 w-4" />
              <span>SALUS PRAMANA TECHNICAL & MATHEMATICAL BLUEPRINT</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-cinzel mt-1">
              {isResearcherLens ? 'Reproducibility workspace: model, contracts, and implementation' : isAuditLens ? 'Audit trail: validation contracts and implementation evidence' : 'Codebase Architecture & Pramana Calculus Specification'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isResearcherLens ? 'Trace a result from formal equation to validation contract, source tree, and deployment boundary.' : isAuditLens ? 'Start with validation contracts, then inspect equations, infrastructure, and source structure for the claim under review.' : 'Verified implementation of deterministic Bayesian evidence calculus and zero-cost serverless infrastructure'}
            </p>
          </div>

          {/* Navigation Pills */}
          <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('math')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeTab === 'math' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Calculus Math Spec
            </button>
            <button
              onClick={() => setActiveTab('schemas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeTab === 'schemas' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Zod Domain Contracts
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeTab === 'architecture' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              AWS SAM Infrastructure
            </button>
            <button
              onClick={() => setActiveTab('source_tree')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeTab === 'source_tree' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monorepo Tree
            </button>
          </div>
        </div>
      </div>

      <WorkspaceGuide
        title={isResearcherLens ? 'Trace the method from equation to implementation' : isAuditLens ? 'Start with the validation contract, then trace the implementation' : 'Choose the technical question before opening a specification'}
        steps={isResearcherLens ? [
          'Read the calculus specification and note every stated parameter and transformation.',
          'Inspect domain contracts to see how evidence provenance and validation are enforced.',
          'Trace the source tree and infrastructure only after the research question is defined.',
        ] : isAuditLens ? [
          'Inspect contracts first to verify what inputs, identifiers, and constraints are enforced.',
          'Compare equations with their documented implementation boundaries.',
          'Use the source tree and infrastructure views to verify where the controls are applied.',
        ] : [
          'Use Calculus for scoring and uncertainty rules.',
          'Use Contracts for data validation and provenance constraints.',
          'Use Architecture or Source Tree to trace the implementation path.',
        ]}
      />

      {/* Tab 1: Calculus Math Specification */}
      {activeTab === 'math' && (
        <div className="space-y-6">
          {/* Main Equation 1: Study-Level Contribution */}
          <div className="rounded-2xl border border-amber-500/40 bg-slate-900/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                Equation 1: Study-Level Dynamic Evidence Contribution
              </span>
              <button
                onClick={() =>
                  handleCopy(
                    'S_i(t) = w_grade * w_design * w_bias * e^(-(ln 2 / T_half) * Δt) * log(1 + n_i) * (1 / (SE_i^2 + 1e-6))',
                    'eq1'
                  )
                }
                className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedFormula === 'eq1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedFormula === 'eq1' ? 'Copied LaTeX' : 'Copy Formula'}
              </button>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 text-center font-mono text-base sm:text-lg text-amber-300 border border-slate-800 overflow-x-auto">
              S_i(t) = w_grade · w_design · w_bias · e^(-λ · Δt) · ln(1 + n_i) · [1 / (SE_i² + ε)]
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800 space-y-1">
                <strong className="text-amber-400 block font-mono">1. Grade & Design Prior:</strong>
                <p>Grade A (1.00), B (0.60), C (0.25). Multi-center RCT (0.90), Cohort (0.70), Preclinical (0.35).</p>
              </div>

              <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800 space-y-1">
                <strong className="text-teal-400 block font-mono">2. Continuous Recency Half-Life:</strong>
                <p>Exponential decay with λ = ln(2)/T_half. Pharma T_half=6y, Lifestyle T_half=10y, Mechanism=12y.</p>
              </div>

              <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800 space-y-1">
                <strong className="text-indigo-400 block font-mono">3. Precision & Sample Scaling:</strong>
                <p>Logarithmic sample transform ln(1+n) and inverse-variance weighting 1/(SE² + 10⁻⁶).</p>
              </div>
            </div>
          </div>

          {/* Main Equation 2: 4th-Order Runge-Kutta ODE Solver */}
          <div className="rounded-2xl border border-indigo-500/40 bg-slate-900/90 p-6 space-y-4 shadow-xl">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
              Equation 2: Two-Compartment Pharmacokinetic Interaction Dynamics
            </span>

            <div className="rounded-xl bg-slate-950 p-4 text-center font-mono text-base text-indigo-300 border border-slate-800 space-y-2 overflow-x-auto">
              <div>dc₁/dt = -k₁ · c₁ - β · c₁ · c₂</div>
              <div>dc₂/dt = -k₂ · c₂</div>
              <div className="text-xs text-slate-400 pt-1">
                Risk(t) = min(100, β · c₁(t) · c₂(t) · 100 + 10 · (|c₁ - 0.5| + |c₂ - 0.5|))
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Integrated over step <code className="text-amber-300 font-mono">dt = 0.25</code> hours using standard 4th-order weighted tangent slope coefficients:
              <code className="text-slate-400 block font-mono mt-1 text-[11px]">
                c(t + dt) = c(t) + (dt / 6) * (k_1 + 2*k_2 + 2*k_3 + k_4)
              </code>
            </p>
          </div>

          {/* Main Equation 3: Bayesian Credibility & Winsorized Quantiles */}
          <div className="rounded-2xl border border-teal-500/40 bg-slate-900/90 p-6 space-y-4 shadow-xl">
            <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider">
              Equation 3: Winsorized Quantile Normalization & 95% Confidence Bounds
            </span>

            <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs sm:text-sm text-teal-300 border border-slate-800 space-y-2">
              <div>PramanaScore(S) = clamp( ((clip(S, Q_0.05, Q_0.95) - Q_0.05) / (Q_0.95 - Q_0.05)) * 100, 0, 100 )</div>
              <div>CI_95% = [ μ - 1.96 · (σ / √N),  μ + 1.96 · (σ / √N) ]</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Zod Domain Contracts */}
      {activeTab === 'schemas' && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base font-cinzel">
              packages/domain/src/index.ts — Validation Contract
            </h3>
            <span className="rounded bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-xs font-mono border border-emerald-500/30">
              Strict Zod Enforcement
            </span>
          </div>

          <pre className="max-w-full rounded-xl bg-slate-950 p-4 text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800 leading-relaxed">
{`export const evidenceGradeSchema = z.enum(["A", "B", "C"]);

export const registryIdentifierSchema = z
  .string()
  .min(3)
  .max(100)
  .refine((value) => /^(PMID|DOI|CTRI|ICTRP|AYUSH|DHARA|NCT)-?/i.test(value), {
    message: "registryIdentifier must start with PMID/DOI/CTRI/ICTRP/AYUSH/DHARA/NCT",
  });

export const medicalSystemSchema = z.enum(["Allopathy", "Ayurveda", "Siddha", "Naturopathy"]);

export const treatmentEvidenceSchema = z.object({
  evidenceId: z.string().min(1),
  conditionId: z.string().min(1),
  medicalSystem: medicalSystemSchema,
  interventionName: z.string().min(2).max(255),
  isPharmacological: z.boolean().default(true),
  evidenceGrade: evidenceGradeSchema,
  studyMethodology: z.string().min(3).max(200),
  sampleSize: z.number().int().nonnegative().optional(),
  registryIdentifier: registryIdentifierSchema,
  sourceUrl: z.string().url().refine(isAllowedSourceUrl),
  clinicalOutcomeSummary: z.string().min(10).max(5000),
  contraindications: z.array(z.string().min(2)).default([]),
  interactionWarnings: z.array(z.string().min(2)).default([]),
  lastVerifiedDate: z.string().optional(),
});`}
          </pre>
        </div>
      )}

      {/* Tab 3: AWS SAM Infrastructure */}
      {activeTab === 'architecture' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base font-cinzel">
              infra/template.yaml — Zero-Cost Serverless SAM Template
            </h3>
            <span className="rounded bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 text-xs font-mono border border-indigo-500/30">
              AWS Free Tier Optimized
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2">
              <span className="font-mono text-amber-400 font-bold block">1. Compute & API</span>
              <p className="text-slate-300">AWS Lambda (Node.js 20 ARM64 architecture) + API Gateway HTTP v2 with sub-50ms cold start.</p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2">
              <span className="font-mono text-teal-400 font-bold block">2. Database & State</span>
              <p className="text-slate-300">DynamoDB with <code className="text-teal-300 font-mono">PAY_PER_REQUEST</code> on-demand billing ($0.00 idle cost).</p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2">
              <span className="font-mono text-indigo-400 font-bold block">3. Auth & CDN</span>
              <p className="text-slate-300">Amazon Cognito User Pool for editorial role access control + CloudFront CDN edge caching.</p>
            </div>
          </div>

          <pre className="max-w-full rounded-xl bg-slate-950 p-4 text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800 leading-relaxed">
{`AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: SALUS Pramana Medical Evidence Platform (Zero Cost Free Tier)

Globals:
  Function:
    Timeout: 10
    MemorySize: 256
    Runtime: nodejs20.x
    Architectures: [arm64]

Resources:
  EvidenceTable:
    Type: AWS::DynamoDB::Table
    Properties:
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: PK
          AttributeType: S
        - AttributeName: SK
          AttributeType: S
      KeySchema:
        - AttributeName: PK
          KeyType: HASH
        - AttributeName: SK
          KeyType: RANGE`}
          </pre>
        </div>
      )}

      {/* Tab 4: Source Tree */}
      {activeTab === 'source_tree' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
          <h3 className="font-bold text-white text-base font-cinzel">
            Monorepo Directory Layout & Verified Module Boundaries
          </h3>

          <pre className="max-w-full rounded-xl bg-slate-950 p-4 text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800 leading-relaxed">
{`salus-pramana-medical/
├── apps/
│   └── web/                     # React 19 + Vite + Tailwind UI
│       ├── src/
│       │   ├── components/      # Evidence Table, ODE Timeline, Math Explainer
│       │   ├── lib/             # Typed API & Intelligence clients
│       │   └── pages/           # Persona-adaptive route views
├── docs/                        # Published Calculus & Architecture Specs
│   ├── CALCULUS_MATH_SPEC.md    # Complete mathematical specification
│   ├── INNOVATIONS.md           # Catalog of breakthrough innovations
│   └── ARCHITECTURE.md          # System architecture and trust boundaries
├── infra/
│   └── template.yaml            # AWS SAM Serverless template
├── packages/
│   └── domain/                  # Shared Zod schemas & types
│       └── src/index.ts         # Centralized validation contracts
└── services/
    ├── api/                     # Hono API + Pramana Intelligence + ODE Solver
    │   ├── src/intelligence.ts  # Deterministic Bayesian calculation
    │   ├── src/ode-solver.ts    # Runge-Kutta 4th-order interaction solver
    │   ├── src/dose-optimizer.ts# Sigmoidal Hill equation candidate optimizer
    │   └── src/validation-gates.ts # Governance Go/No-Go enforcement
    └── ingestion/               # Multi-source registry connectors (PubMed, CTRI, AYUSH)`}
          </pre>
        </div>
      )}
    </div>
  );
};
