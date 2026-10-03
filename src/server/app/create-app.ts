import { randomUUID } from 'node:crypto';
import path from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import { authContextMiddleware } from '../auth/middleware';
import { createJwtVerifier, type JwtVerifier } from '../auth/jwt-verifier';
import type { ServerConfig } from '../config/runtime';
import { registerAuthRoutes } from '../routes/auth';
import { registerClinicalAiRoute } from '../routes/clinical-ai';
import { registerConditionRoutes } from '../routes/conditions';
import { registerEvidenceRoutes } from '../routes/evidence';
import { registerHealthRoute } from '../routes/health';
import { registerIntelligenceRoutes } from '../routes/intelligence';
import { createDefaultIntelligence, createDefaultRepositories } from './default-dependencies';

export type PublicationStatus = 'draft' | 'published' | 'rejected' | 'under_review';
export interface MedicalCondition { conditionId: string; icd11Code: string; standardName: string; [key: string]: unknown }
export interface TreatmentEvidence {
  evidenceId: string; conditionId: string; medicalSystem: string; interventionName: string;
  isPharmacological: boolean; evidenceGrade: string; studyMethodology: string; sampleSize?: number;
  registryIdentifier: string; sourceUrl: string; clinicalOutcomeSummary: string;
  contraindications: string[]; interactionWarnings: string[]; publicationStatus?: PublicationStatus;
  lastVerifiedDate?: string; [key: string]: unknown;
}
export interface AuditInput { action: string; actorEmail: string; targetEvidenceId: string; ipAddress?: string }
export interface ServerRepositories {
  listConditions(): Promise<MedicalCondition[]>;
  getCondition(conditionId: string): Promise<MedicalCondition | undefined>;
  createCondition(condition: MedicalCondition, audit: AuditInput): Promise<MedicalCondition>;
  listEvidence(conditionId?: string, includeDrafts?: boolean): Promise<TreatmentEvidence[]>;
  createEvidence(evidence: TreatmentEvidence, audit: AuditInput): Promise<TreatmentEvidence | undefined>;
  updateEvidencePublicationStatus(evidenceId: string, status: Exclude<PublicationStatus, 'under_review'>, audit: AuditInput): Promise<TreatmentEvidence | undefined>;
}
export interface IntelligenceServices {
  computeCondition(conditionId: string, rows: TreatmentEvidence[], mode: 'public' | 'clinician'): unknown;
  computeEvidence(evidenceId: string, rows: TreatmentEvidence[], mode: 'public' | 'clinician'): unknown | null;
  computeGates(conditionId: string, rows: TreatmentEvidence[], intelligence: unknown): { goNoGo: boolean; gates: Record<string, { status?: string }> };
  simulateInteraction(interventionA: string, interventionB: string, hasWarning: boolean, sampleSizeA: number, sampleSizeB: number, hours: number): unknown;
  simulateTrajectory(evidence: TreatmentEvidence, hours: number): unknown;
  optimizeDose(evidence: TreatmentEvidence): unknown;
}
export interface ClinicalAiProvider { generate(prompt: string): Promise<string | undefined> }
export interface StructuredLogger { log(entry: Record<string, unknown>): void }
export interface AppDependencies {
  config: ServerConfig; repositories?: ServerRepositories; intelligence?: IntelligenceServices;
  jwtVerifier?: JwtVerifier; clinicalAiProvider?: ClinicalAiProvider; logger?: StructuredLogger; now?: () => Date;
}

export function createApp(dependencies: AppDependencies) {
  const { config } = dependencies;
  const now = dependencies.now ?? (() => new Date());
  const repositories = dependencies.repositories ?? createDefaultRepositories(now);
  const intelligence = dependencies.intelligence ?? createDefaultIntelligence(now);
  const logger = dependencies.logger ?? { log: (entry: Record<string, unknown>) => console.log(JSON.stringify(entry)) };
  const verifier = dependencies.jwtVerifier ?? createJwtVerifier({ issuer: config.cognitoIssuer, audience: config.cognitoAudience });
  const app = express();
  app.set('trust proxy', 1);
  
  app.use((request, _response, next) => {
    const browserApiFamilies = ['/api/health', '/api/conditions', '/api/evidence', '/api/auth/', '/api/intelligence/'];
    if (browserApiFamilies.some((prefix) => request.url === prefix || request.url.startsWith(prefix))) {
      request.url = request.url.slice('/api'.length) || '/';
    }
    next();
  });

  app.use((request, response, next) => {
    response.setHeader('x-correlation-id', request.header('x-correlation-id') || request.header('x-request-id') || randomUUID());
    next();
  });
  app.use((request, response, next) => {
    const started = Date.now();
    const base = { correlationId: response.getHeader('x-correlation-id'), method: request.method, path: request.path, query: request.url.split('?')[1] ?? '' };
    logger.log({ ts: now().toISOString(), event: 'request.start', ...base });
    response.once('finish', () => logger.log({ ts: now().toISOString(), event: 'request.finish', ...base, status: response.statusCode, durationMs: Date.now() - started }));
    next();
  });
  app.use((request, response, next) => {
    const origin = request.header('origin');
    if (origin && config.corsAllowedOrigins.includes(origin)) {
      response.setHeader('access-control-allow-origin', origin);
      response.setHeader('vary', 'Origin');
      response.setHeader('access-control-allow-methods', 'GET, POST, PATCH, OPTIONS');
      response.setHeader('access-control-allow-headers', 'Authorization, Content-Type, X-Correlation-Id');
    }
    next();
  });
  app.use((_request, response, next) => {
    response.setHeader('x-content-type-options', 'nosniff');
    response.setHeader('x-frame-options', 'DENY');
    response.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
    response.setHeader('permissions-policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    response.setHeader('cache-control', 'no-store');
    if (config.nodeEnv === 'production') response.setHeader('strict-transport-security', 'max-age=31536000; includeSubDomains');
    next();
  });
  app.use((request, response, next) => {
    const length = Number(request.header('content-length') ?? 0);
    if (Number.isFinite(length) && length > 1_000_000) return response.status(413).json({ error: 'Request body exceeds the 1 MB limit' });
    next();
  });
  app.use(express.json({ limit: 1_000_000 }));
  app.use(authContextMiddleware(verifier));
  app.options('*', (_request, response) => response.sendStatus(204));

  registerHealthRoute(app);
  registerClinicalAiRoute(app, dependencies.clinicalAiProvider);
  registerAuthRoutes(app);
  registerConditionRoutes(app, repositories);
  registerEvidenceRoutes(app, repositories, now);
  registerIntelligenceRoutes(app, repositories, intelligence, config.strictGovernance ?? false, now);

  if (config.nodeEnv === 'production') {
    const distDirectory = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDirectory));
    app.get('*', (request, response, next) => {
      if (request.path.startsWith('/api/') || path.extname(request.path) || !request.accepts('html')) return next();
      return response.sendFile(path.join(distDirectory, 'index.html'));
    });
  }
  app.use((_request, response) => response.status(404).json({ error: 'Not found' }));
  app.use((error: unknown, request: Request, response: Response, _next: NextFunction) => {
    const correlationId = response.getHeader('x-correlation-id');
    logger.log({ ts: now().toISOString(), event: 'request.error', correlationId, method: request.method, path: request.path, error: error instanceof Error ? error.name : 'UnknownError' });
    if (typeof error === 'object' && error !== null && 'type' in error && error.type === 'entity.too.large') return response.status(413).json({ error: 'Request body exceeds the 1 MB limit' });
    return response.status(500).json({ error: 'Internal server error', correlationId });
  });
  return app;
}
/* Obsolete scaffold copy retained temporarily to avoid clobbering concurrent workspace edits.
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import type { ServerConfig } from '../config/runtime';

type ClinicalInput = {
  condition?: { standardName?: string; icd11Code?: string };
  interventions?: unknown[];
  patientProfile?: { age?: number; egfr?: number; comorbidities?: string[] };
  queryType?: string;
};

export interface ClinicalAiProvider {
  generate(prompt: string): Promise<string | undefined>;
}

export interface AppDependencies {
  config: ServerConfig;
  clinicalAiProvider?: ClinicalAiProvider;
}

function deterministicClinicalSynthesis(input: ClinicalInput) {
  const conditionName = input.condition?.standardName || 'Type 2 Diabetes Mellitus';
  const icd11Code = input.condition?.icd11Code || '5A11';
  const egfr = input.patientProfile?.egfr || 75;
  return `### SALUS Pramana Clinical Synthesis & Multi-System Decision Matrix
**Condition**: ${conditionName} [ICD-11: ${icd11Code}]  
**Evidence Governance Status**: APPROVED (Go-Gate Passed with 98.4% Confidence Interval Reliability)  

#### 1. Cross-System Evidence Hierarchy Analysis
- **Allopathic Standard of Care**: High-confidence Grade A evidence based on multi-center randomized controlled trials (PMID-9742977). First-line metabolic regulation demonstrated with robust cardiovascular safety profiles.
- **Ayurvedic Complementary Pharmacotherapy**: Grade B evidence with verified phytochemical standardizations (PMID-17569207 / AYUSH-0924). Demonstrates significant reduction in systemic oxidative markers and inflammatory cytokines (TNF-alpha, IL-6).
- **Siddha & Naturopathic Interventions**: Grade B/C consensus with demonstrated microcirculatory improvements and glycemic stabilization via dietary fiber kinetics and hepatic insulin sensitization.

#### 2. Pharmacokinetic & Pharmacodynamic Interaction Dynamics (ODE 4th-Order Simulation)
- **Clearance Pathway Interaction**: Combined administration shows competitive CYP3A4/CYP2C9 modulation. Peak synergistic risk score calculated at **28.4 / 100** (Classified: **MILD**).
- **Biomarker Monitoring Target**: Recommend staggering administration by 2.5 hours to avoid peak plasma concentration convergence.
- **Renal/Hepatic Load**: Baseline eGFR of ${egfr} mL/min is well within the therapeutic safety threshold (eGFR > 45 mL/min requirement met).

#### 3. Nobel-Cadre Clinical Decision & Patient Governance
- **Recommendation Class**: **RECOMMEND (GRADE A/B INTEGRATIVE)**
- **95% Confidence Interval**: [74.8, 88.6] Pramana Credibility Index
- **Bayesian Posterior Probability of Superiority**: 94.2% over monotherapy alone
- **Community Health Value**: High-accessibility protocol reducing polypharmacy cost by 42% while maintaining rigorous glycemic control.`;
}

function clinicalPrompt(input: ClinicalInput) {
  return `You are the SALUS Pramana Nobel-Cadre Clinical Intelligence Engine.
Evaluate the evidence hierarchy and interaction risk for ${input.condition?.standardName || 'General Integrative Assessment'} (${input.condition?.icd11Code || 'N/A'}).
Selected interventions: ${JSON.stringify(input.interventions || [])}.
Patient profile: age ${input.patientProfile?.age || 52}, eGFR ${input.patientProfile?.egfr || 75}, comorbidities ${input.patientProfile?.comorbidities?.join(', ') || 'None'}.
Query type: ${input.queryType || 'Comprehensive Differential & Interaction Audit'}.
State evidence grades, uncertainty bounds, pharmacokinetic and pharmacodynamic risks, and the Go/No-Go governance result.`;
}

export function createApp({ config, clinicalAiProvider }: AppDependencies) {
  const app = express();
  app.set('trust proxy', 1);

  app.use((request, response, next) => {
    const correlationId = request.header('x-correlation-id') || request.header('x-request-id') || randomUUID();
    response.setHeader('x-correlation-id', correlationId);
    response.setHeader('x-content-type-options', 'nosniff');
    response.setHeader('x-frame-options', 'DENY');
    response.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
    response.setHeader('permissions-policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    response.setHeader('cache-control', 'no-store');
    if (config.nodeEnv === 'production') {
      response.setHeader('strict-transport-security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  app.use((request, response, next) => {
    const origin = request.header('origin');
    if (origin && config.corsAllowedOrigins.includes(origin)) {
      response.setHeader('access-control-allow-origin', origin);
      response.setHeader('vary', 'Origin');
      response.setHeader('access-control-allow-methods', 'GET, POST, PATCH, OPTIONS');
      response.setHeader('access-control-allow-headers', 'Authorization, Content-Type, X-Correlation-Id');
    }
    if (request.method === 'OPTIONS') return response.sendStatus(204);
    next();
  });

  app.use(express.json({ limit: 1_000_000 }));

  app.get('/health', (_request, response) => {
    response.json({
      ok: true,
      service: 'salus-api',
      motto: 'The evidence behind every path to healing.',
    });
  });

  app.post('/api/clinical-ai', async (request, response) => {
    const input = request.body as ClinicalInput;
    if (!clinicalAiProvider) {
      return response.json({
        status: 'fallback',
        source: 'SALUS Pramana Deterministic Reasoning Engine v1.0.0',
        content: deterministicClinicalSynthesis(input),
      });
    }

    try {
      const content = await clinicalAiProvider.generate(clinicalPrompt(input));
      return response.json({
        status: 'success',
        source: 'Gemini 2.5 Flash + SALUS Pramana Evidence Grounding',
        content,
      });
    } catch (error) {
      return response.json({
        status: 'fallback',
        source: 'SALUS Pramana Deterministic Reasoning Engine v1.0.0 (Fallback)',
        content: deterministicClinicalSynthesis(input),
        error: error instanceof Error ? error.message : 'AI provider error',
      });
    }
  });

  if (config.nodeEnv === 'production') {
    const distDirectory = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDirectory));
    app.get('*', (request, response, next) => {
      if (request.path.startsWith('/api/') || path.extname(request.path) || !request.accepts('html')) return next();
      return response.sendFile(path.join(distDirectory, 'index.html'));
    });
  }

  app.use((_request, response) => response.status(404).json({ error: 'Not found' }));
  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    const correlationId = response.getHeader('x-correlation-id');
    if (error instanceof SyntaxError && 'type' in error && error.type === 'entity.too.large') {
      return response.status(413).json({ error: 'Request body exceeds the 1 MB limit' });
    }
    return response.status(500).json({ error: 'Internal server error', correlationId });
  });

  return app;
}
*/