import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Award,
  Brain,
  BookOpen,
  Calculator,
  Columns3,
  Download,
  FilePlus2,
  FileSpreadsheet,
  GitBranch,
  Globe2,
  Microscope,
  ShieldCheck,
  Sparkles,
  SquarePen,
} from 'lucide-react';

/**
 * The single catalogue of navigable SALUS capabilities.
 *
 * Add a capability here when adding a screen. Header navigation, the feature
 * launcher, and route aliases can all consume the same descriptive contract.
 */
export type FeatureCategory = 'Research' | 'Clinical safety' | 'Evidence operations' | 'Governance';
export type FeatureActionId = 'open' | 'export_evidence' | 'open_citations';

/** UI boundary for feature actions that are not navigable routes. */
export interface FeatureUiActions {
  exportEvidence: () => void;
  openCitations: () => void;
}

export interface FeatureActionDefinition {
  id: Exclude<FeatureActionId, 'open'>;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface FeatureDefinition {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  category: FeatureCategory;
  href: string;
  icon: LucideIcon;
  badge?: string;
  primary?: boolean;
  /** A declared interaction contract, so capabilities do not rely on hidden UI wiring. */
  actions: readonly FeatureActionId[];
}

export const featureRegistry = [
  { id: 'research-home', title: 'Research Institute Home', shortLabel: 'Research Institute Home', description: 'Search conditions and interventions, inspect citations, and begin an evidence review.', category: 'Research', href: '/', icon: Microscope, badge: 'Overview', primary: true, actions: ['open'] },
  { id: 'nobel-dossier', title: 'Scientific Audit & Benchmark', shortLabel: 'Scientific Audit & Benchmark (10/10)', description: 'Review the transparent multi-dimension scientific audit and mathematical defense.', category: 'Governance', href: '/scientific-audit', icon: Award, badge: 'Audit dossier', primary: true, actions: ['open'] },
  { id: 'health-equity', title: 'Global Health Equity Index', shortLabel: 'Global Health Equity Index', description: 'Explore country-level access, burden, and affordability through the interactive world map.', category: 'Research', href: '/global-health-equity', icon: Globe2, badge: 'Live map', primary: true, actions: ['open'] },
  { id: 'intelligence-studio', title: 'Cross-System Intelligence', shortLabel: 'Cross-System Intelligence', description: 'Compare evidence across care systems with Pramana scoring, uncertainty, and provenance.', category: 'Research', href: '/cross-system-intelligence', icon: Activity, badge: 'Pramana v1.2', primary: true, actions: ['open'] },
  { id: 'ode-lab', title: 'ODE Interaction Lab', shortLabel: 'ODE Interaction Lab', description: 'Model interaction kinetics and administration staggering with the RK4 solver.', category: 'Clinical safety', href: '/ode-interaction-lab', icon: Brain, badge: 'RK4 solver', primary: true, actions: ['open'] },
  { id: 'diagnostic-workbench', title: 'Clinical Decision Workbench', shortLabel: 'Clinical Decision Workbench', description: 'Assess contraindications, renal context, interactions, and dose-response boundaries.', category: 'Clinical safety', href: '/clinical-workbench', icon: ShieldCheck, badge: 'Point of care', primary: true, actions: ['open'] },
  { id: 'ai-synthesis', title: 'Evidence-Grounded AI Synthesis', shortLabel: 'Live Clinical AI Reasoning', description: 'Generate a registry-grounded clinical synthesis with source-aware guardrails.', category: 'Research', href: '/ai-clinical-reasoning', icon: Sparkles, badge: 'Grounded AI', primary: true, actions: ['open'] },
  { id: 'code-architecture', title: 'Repository & Mathematical Architecture', shortLabel: 'Repo & Math Spec', description: 'Inspect the implementation architecture and the formal model specification.', category: 'Governance', href: '/architecture', icon: GitBranch, badge: 'Architecture', primary: true, actions: ['open'] },
  { id: 'calibration-drift', title: 'Calibration & Governance', shortLabel: 'Calibration & Governance', description: 'Review calibration quality, governance thresholds, and drift status.', category: 'Governance', href: '/calibration-governance', icon: FileSpreadsheet, badge: 'Brier: 0.018', primary: true, actions: ['open'] },
  { id: 'math', title: 'Mathematical Foundations', shortLabel: 'Math', description: 'Read the evidence-calculus and clinical-model foundations in a focused view.', category: 'Research', href: '/math', icon: Calculator, badge: undefined, primary: false, actions: ['open'] },
  { id: 'comparison', title: 'Condition Comparison', shortLabel: 'Compare', description: 'Compare treatment evidence for a condition without collapsing evidence grades.', category: 'Research', href: '/compare/cond-type2-diabetes', icon: Columns3, badge: undefined, primary: false, actions: ['open'] },
  { id: 'submission', title: 'Submit Evidence', shortLabel: 'Submit evidence', description: 'Submit a new evidence record for review and provenance checks.', category: 'Evidence operations', href: '/new', icon: FilePlus2, badge: undefined, primary: false, actions: ['open'] },
  { id: 'editor', title: 'Evidence Editor', shortLabel: 'Editor', description: 'Maintain evidence records through the structured editorial workflow.', category: 'Evidence operations', href: '/editor', icon: SquarePen, badge: undefined, primary: false, actions: ['open'] },
] as const satisfies readonly FeatureDefinition[];

/** Non-route capabilities use the same contract and can be rendered anywhere. */
export const featureActionRegistry: readonly FeatureActionDefinition[] = [
  { id: 'export_evidence', title: 'Export evidence dossier', description: 'Download the selected evidence in a portable research format.', icon: Download },
  { id: 'open_citations', title: 'Citations & discoverability', description: 'Open citation guidance and academic discoverability metadata.', icon: BookOpen },
] as const;

export const primaryFeatures = featureRegistry.filter((feature) => feature.primary);
export const featureCategories: FeatureCategory[] = ['Research', 'Clinical safety', 'Evidence operations', 'Governance'];

type FeatureById = { [Feature in (typeof featureRegistry)[number] as Feature['id']]: Feature };

export const featureById = Object.fromEntries(featureRegistry.map((feature) => [feature.id, feature])) as FeatureById;
